// ==================== 事件系统核心 (events.js) ====================
// 架构说明：
//   EventSystem        - 事件调度引擎（判定、触发、记录）
//   EVENT_DB           - 事件数据库（见 event-db.js）
//   AffinitySystem     - 好感度系统（怪兽间 & 怪兽-玩家）
//   MonsterLog         - 每只怪兽的履历记录
// ================================================================

// ──────────────────────────────────────────────────────────────
// 1. 游戏时间系统
// ──────────────────────────────────────────────────────────────
var GameTime = {
    // 游戏开始的真实时间戳（ms）
    _startReal: Date.now(),
    // 游戏内累计时间（秒），每次存档保存，加载时恢复
    _elapsed: 0,
    // 游戏内"天"长度（真实ms），默认10分钟=1天
    DAY_DURATION_MS: 10 * 60 * 1000,

    // 当前游戏天数（从1开始）
    get day() {
        return Math.floor(this._elapsed / (this.DAY_DURATION_MS / 1000)) + 1;
    },
    // 当前游戏时间戳（秒）
    get now() {
        return this._elapsed;
    },
    // 格式化为"第X天 HH:MM"
    format: function(ts) {
        var dayLen = this.DAY_DURATION_MS / 1000;
        var d = Math.floor(ts / dayLen) + 1;
        var rem = ts % dayLen;
        var h = Math.floor(rem / 3600) % 24;
        var m = Math.floor(rem / 60) % 60;
        return '第' + d + '天 ' + _pad2(h) + ':' + _pad2(m);
    },
    // 每秒tick（由 EventSystem.tick 调用）
    tick: function(deltaMs) {
        this._elapsed += deltaMs / 1000;
    },
    // 序列化
    save: function() { return { elapsed: this._elapsed }; },
    load: function(d) { if (d) this._elapsed = d.elapsed || 0; }
};

function _pad2(n) { return n < 10 ? '0' + n : '' + n; }

// ──────────────────────────────────────────────────────────────
// 2. 好感度系统
// ──────────────────────────────────────────────────────────────
var AffinitySystem = {
    // 怪兽间好感度：{ "id1_id2": value }（id1 < id2 保证唯一）
    _pairs: {},
    // 怪兽对玩家好感度：{ monsterId: value }
    _playerBond: {},

    _pairKey: function(a, b) {
        return Math.min(a,b) + '_' + Math.max(a,b);
    },

    // 获取两怪兽间好感度（-100~100，0=陌生）
    getPair: function(id1, id2) {
        return this._pairs[this._pairKey(id1, id2)] || 0;
    },
    // 修改两怪兽间好感度
    changePair: function(id1, id2, delta, reason) {
        var key = this._pairKey(id1, id2);
        var prev = this._pairs[key] || 0;
        this._pairs[key] = Math.max(-100, Math.min(100, prev + delta));
        // 简报提示（好感度跨越关键节点时）
        var thresholds = [-50, 0, 30, 60, 90];
        thresholds.forEach(function(t) {
            if ((prev < t && AffinitySystem._pairs[key] >= t) ||
                (prev > t && AffinitySystem._pairs[key] <= t)) {
                var m1 = _getMonsterName(id1), m2 = _getMonsterName(id2);
                var tag = AffinitySystem.getPairTag(AffinitySystem._pairs[key]);
                if (m1 && m2) addBriefing('affinity',
                    '<strong>' + m1 + '</strong> 与 <strong>' + m2 +
                    '</strong> 的关系变为 <span style="color:#e040fb">' + tag + '</span>' +
                    (reason ? '（' + reason + '）' : ''));
            }
        });
    },
    // 获取关系标签
    getPairTag: function(val) {
        if (val >= 90)  return '挚友❤️';
        if (val >= 60)  return '好友💚';
        if (val >= 30)  return '相识';
        if (val >= 0)   return '陌生';
        if (val >= -30) return '不合';
        if (val >= -60) return '厌恶';
        return '死敌💀';
    },

    // 怪兽对玩家好感度
    getPlayerBond: function(monsterId) {
        return this._playerBond[monsterId] || 0;
    },
    changePlayerBond: function(monsterId, delta) {
        var prev = this._playerBond[monsterId] || 0;
        this._playerBond[monsterId] = Math.max(-100, Math.min(100, prev + delta));
        // 跨关键节点简报
        var thresholds = [20, 50, 80];
        var cur = this._playerBond[monsterId];
        thresholds.forEach(function(t) {
            if (prev < t && cur >= t) {
                var name = _getMonsterName(monsterId);
                if (name) addBriefing('bond',
                    '<strong>' + name + '</strong> 对你的好感达到 <strong style="color:#f0c53d;">' + t + '</strong>，解锁新互动！');
            }
        });
    },
    getPlayerBondTag: function(val) {
        if (val >= 80) return '心灵伴侣💛';
        if (val >= 50) return '信任伙伴';
        if (val >= 20) return '友好';
        if (val >= 0)  return '普通';
        return '抵触';
    },

    // 清理已不存在的怪兽记录
    cleanup: function() {
        var ids = (gameState.monsters || []).map(function(m){ return m.id; });
        var self = this;
        Object.keys(this._pairs).forEach(function(k) {
            var parts = k.split('_');
            if (ids.indexOf(parseInt(parts[0])) === -1 || ids.indexOf(parseInt(parts[1])) === -1) {
                delete self._pairs[k];
            }
        });
        Object.keys(this._playerBond).forEach(function(k) {
            if (ids.indexOf(parseInt(k)) === -1) delete self._playerBond[k];
        });
    },

    save: function() {
        return { pairs: Object.assign({}, this._pairs), playerBond: Object.assign({}, this._playerBond) };
    },
    load: function(d) {
        if (!d) return;
        this._pairs = d.pairs || {};
        this._playerBond = d.playerBond || {};
    }
};

function _getMonsterName(id) {
    if (!gameState || !gameState.monsters) return null;
    var m = gameState.monsters.find(function(x){ return x.id === id; });
    return m ? m.name : null;
}

// ──────────────────────────────────────────────────────────────
// 3. 怪兽履历系统
// ──────────────────────────────────────────────────────────────
var MonsterLog = {
    // { monsterId: [ { ts, eventId, summary, type } ] }
    _logs: {},

    append: function(monsterId, eventId, summary, type) {
        if (!this._logs[monsterId]) this._logs[monsterId] = [];
        var log = this._logs[monsterId];
        log.push({
            ts:      GameTime.now,
            timeStr: GameTime.format(GameTime.now),
            eventId: eventId,
            summary: summary,
            type:    type || 'general'
        });
        // 每只怪兽最多保存100条履历
        if (log.length > 100) log.splice(0, log.length - 100);
    },

    get: function(monsterId) {
        return (this._logs[monsterId] || []).slice().reverse(); // 最新在前
    },

    save: function() { return Object.assign({}, this._logs); },
    load: function(d) { this._logs = d || {}; }
};

// ──────────────────────────────────────────────────────────────
// 4. 事件调度引擎
// ──────────────────────────────────────────────────────────────
var EventSystem = {
    _tickInterval: null,
    _TICK_MS: 10000,          // 每10秒检查一次事件触发
    _lastFarmEvent: 0,        // 上次农场事件时间戳
    _lastGlobalEvent: 0,      // 上次全局事件时间戳
    _activeEventPanel: null,  // 当前显示中的事件面板DOM

    start: function() {
        if (this._tickInterval) clearInterval(this._tickInterval);
        var self = this;
        this._tickInterval = setInterval(function() {
            GameTime.tick(self._TICK_MS);
            self._checkMonsterEvents();
            self._checkGlobalEvents();
        }, this._TICK_MS);
    },

    stop: function() {
        if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    },

    // ── 怪兽相关事件检查（每个怪兽独立判定）──
    _checkMonsterEvents: function() {
        if (!gameState || !gameState.monsters) return;
        var self = this;
        gameState.monsters.forEach(function(monster) {
            self._checkMonsterSoloEvents(monster);
        });
        // 怪兽间互动事件（任意两只）
        var ms = gameState.monsters;
        for (var i = 0; i < ms.length; i++) {
            for (var j = i + 1; j < ms.length; j++) {
                self._checkPairEvents(ms[i], ms[j]);
            }
        }
    },

    // ── 单怪兽事件 ──
    _checkMonsterSoloEvents: function(monster) {
        if (!EVENT_DB) return;
        var self = this;
        var pool = EVENT_DB.solo.filter(function(e) {
            return self._canTrigger(e, monster, null);
        });
        if (!pool.length) return;
        // 按权重抽取
        var e = _weightedPick(pool, function(e){ return e.weight || 1; });
        if (!e) return;
        if (Math.random() > (e.chance || 0.05)) return;
        this._fireEvent(e, monster, null);
    },

    // ── 怪兽对事件 ──
    _checkPairEvents: function(m1, m2) {
        if (!EVENT_DB) return;
        var self = this;
        var pool = EVENT_DB.pair.filter(function(e) {
            return self._canTrigger(e, m1, m2);
        });
        if (!pool.length) return;
        var e = _weightedPick(pool, function(e){ return e.weight || 1; });
        if (!e) return;
        if (Math.random() > (e.chance || 0.03)) return;
        this._fireEvent(e, m1, m2);
    },

    // ── 全局/农场事件 ──
    _checkGlobalEvents: function() {
        if (!EVENT_DB) return;
        var now = GameTime.now;
        // 全局事件：最短间隔120秒
        if (now - this._lastGlobalEvent < 120) return;
        var pool = EVENT_DB.global.filter(function(e) {
            return !e.condition || e.condition();
        });
        if (!pool.length) return;
        var e = _weightedPick(pool, function(e){ return e.weight || 1; });
        if (!e) return;
        if (Math.random() > (e.chance || 0.08)) return;
        this._lastGlobalEvent = now;
        this._fireEvent(e, null, null);
    },

    // ── 判定事件能否触发（兼容 condition / trigger 两种字段名）──
    _canTrigger: function(eventDef, m1, m2) {
        try {
            var condFn = eventDef.condition || eventDef.trigger;
            if (condFn && !condFn(m1, m2)) return false;
            // 冷却：同一事件对同一怪兽，最少间隔 cooldown 秒（单位：游戏秒）
            if (m1 && eventDef.cooldown) {
                var lastKey = '_evtCD_' + eventDef.id + '_' + m1.id;
                if (m1[lastKey] && (GameTime.now - m1[lastKey]) < eventDef.cooldown) return false;
            }
            return true;
        } catch(e) { return false; }
    },

    // ── 执行事件 ──
    _fireEvent: function(eventDef, m1, m2) {
        // 记录冷却
        if (m1 && eventDef.cooldown) m1['_evtCD_' + eventDef.id + '_' + m1.id] = GameTime.now;

        // 静默效果（内部判定，不向玩家展示过程）
        var silentResult = null;
        if (eventDef.silentEffect) {
            try { silentResult = eventDef.silentEffect(m1, m2); } catch(e) {}
        }

        // 生成事件摘要文本
        var summary = _resolveText(eventDef.summary || eventDef.title, m1, m2);

        // 写入履历
        if (m1) MonsterLog.append(m1.id, eventDef.id, summary, eventDef.type || 'general');
        if (m2) MonsterLog.append(m2.id, eventDef.id, summary, eventDef.type || 'general');

        // 加入简报
        var briefIcon = { bond:'💛', rival:'⚔️', growth:'✨', social:'💬',
                          disaster:'💥', fortune:'🍀', player:'🤝', general:'⚡' };
        var icon = briefIcon[eventDef.type] || '⚡';
        addBriefing('event', icon + ' ' + summary);

        // 若有玩家选择，弹出事件面板
        if (eventDef.choices && eventDef.choices.length > 0) {
            this._showEventPanel(eventDef, m1, m2, silentResult);
        }

        // 自动存档
        if (typeof autoSave === 'function') autoSave();
    },

    // ── 事件选择面板 ──
    _showEventPanel: function(eventDef, m1, m2, silentResult) {
        // 移除旧面板
        if (this._activeEventPanel && this._activeEventPanel.parentNode) {
            this._activeEventPanel.remove();
        }

        var title   = _resolveText(eventDef.title, m1, m2);
        var desc    = _resolveText(eventDef.desc,  m1, m2);
        var panel   = document.createElement('div');
        var typeColors = { bond:'#e040fb', rival:'#f85149', growth:'#46d164',
                           social:'#58a6ff', disaster:'#ff9800', fortune:'#f0c53d',
                           player:'#ffd700', general:'#c9d1d9' };
        var accentColor = typeColors[eventDef.type] || '#c9d1d9';

        panel.className = 'event-panel evt-new';
        panel.style.cssText = 'border-color:' + accentColor + ';';
        panel.innerHTML =
            '<div class="event-header">' +
                '<span class="event-type-badge" style="background:' + accentColor + '22;color:' + accentColor + ';border:1px solid ' + accentColor + '44;">' +
                    (eventDef.typeLabel || '事件') +
                '</span>' +
                '<div class="event-title">' + title + '</div>' +
            '</div>' +
            '<div class="event-desc">' + desc + '</div>' +
            '<div class="event-choices" id="_ec_' + eventDef.id + '"></div>' +
            '<div class="event-dismiss" onclick="this.parentNode.remove()">✕ 忽略</div>';

        document.body.appendChild(panel);
        this._activeEventPanel = panel;

        var choiceContainer = panel.querySelector('.event-choices');
        var self = this;
        eventDef.choices.forEach(function(choice, idx) {
            var btn = document.createElement('button');
            var canAfford = !choice.cost || _canAfford(choice.cost);
            btn.className = 'btn ' + (idx === 0 ? 'btn-primary' : 'btn-secondary');
            btn.disabled = !canAfford;
            var costStr = choice.cost ? ' [' + _costStr(choice.cost) + ']' : '';
            btn.textContent = _resolveText(choice.text, m1, m2) + costStr;
            btn.onclick = function() {
                if (choice.cost) _deductCost(choice.cost);
                try { choice.effect(m1, m2, silentResult); } catch(e) {}
                panel.remove();
                if (typeof updateResources === 'function') updateResources();
                if (typeof autoSave === 'function') autoSave();
            };
            choiceContainer.appendChild(btn);
        });

        // 30秒后自动消失
        setTimeout(function() { if (panel.parentNode) panel.remove(); }, 30000);
    },

    save: function() {
        return {
            gameTime:  GameTime.save(),
            affinity:  AffinitySystem.save(),
            monsterLog: MonsterLog.save(),
            lastGlobalEvent: this._lastGlobalEvent,
            lastFarmEvent:   this._lastFarmEvent
        };
    },
    load: function(d) {
        if (!d) return;
        GameTime.load(d.gameTime);
        AffinitySystem.load(d.affinity);
        MonsterLog.load(d.monsterLog);
        this._lastGlobalEvent = d.lastGlobalEvent || 0;
        this._lastFarmEvent   = d.lastFarmEvent   || 0;
    }
};

// ──────────────────────────────────────────────────────────────
// 5. 工具函数
// ──────────────────────────────────────────────────────────────
function _weightedPick(arr, weightFn) {
    if (!arr.length) return null;
    var total = arr.reduce(function(s, x){ return s + weightFn(x); }, 0);
    var r = Math.random() * total, acc = 0;
    for (var i = 0; i < arr.length; i++) {
        acc += weightFn(arr[i]);
        if (r <= acc) return arr[i];
    }
    return arr[arr.length - 1];
}

function _resolveText(tpl, m1, m2) {
    if (!tpl) return '';
    return tpl
        .replace(/\{m1\}/g, m1 ? m1.name : '?')
        .replace(/\{m2\}/g, m2 ? m2.name : '?')
        .replace(/\{player\}/g, '农场主');
}

function _canAfford(cost) {
    if (!cost) return true;
    return Object.keys(cost).every(function(k){ return (gameState[k] || 0) >= cost[k]; });
}

function _deductCost(cost) {
    Object.keys(cost).forEach(function(k){ gameState[k] = Math.max(0, (gameState[k] || 0) - cost[k]); });
}

function _costStr(cost) {
    var RES_NAMES = { coins: '金币', food: '食物', materials: '材料', research: '研究点', energy: '能量' };
    return Object.keys(cost).map(function(k){ return cost[k] + (RES_NAMES[k] || k); }).join('/');
}

// ──────────────────────────────────────────────────────────────
// 6. 履历面板 UI（在怪兽详情弹窗中调用）
// ──────────────────────────────────────────────────────────────
window.showMonsterLogModal = function(monsterId) {
    var monster = (gameState.monsters || []).find(function(m){ return m.id === monsterId; });
    if (!monster) return;
    var logs = MonsterLog.get(monsterId);
    var bondVal = AffinitySystem.getPlayerBond(monsterId);
    var bondTag = AffinitySystem.getPlayerBondTag(bondVal);

    var typeIcon = { bond:'💛', rival:'⚔️', growth:'✨', social:'💬',
                     disaster:'💥', fortune:'🍀', player:'🤝', general:'⚡', affinity:'💕' };

    var html = '<div class="modal-header">📜 ' + monster.name + ' 的履历</div>';

    // 好感度卡片
    html += '<div style="background:#21262d;border:1px solid #30363d;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;">' +
        '<span style="font-size:22px;">🤝</span>' +
        '<div style="flex:1;">' +
            '<div style="font-size:12px;color:#8b949e;">对你的羁绊</div>' +
            '<div style="font-weight:700;color:#f0c53d;">' + bondTag + '</div>' +
        '</div>' +
        '<div style="font-size:20px;font-weight:700;color:#58a6ff;">' + bondVal + '</div>' +
    '</div>';

    // 与其他怪兽的关系
    var relations = [];
    gameState.monsters.forEach(function(m) {
        if (m.id === monsterId) return;
        var v = AffinitySystem.getPair(monsterId, m.id);
        if (v !== 0) relations.push({ name: m.name, val: v, tag: AffinitySystem.getPairTag(v) });
    });
    if (relations.length) {
        html += '<div style="margin-bottom:10px;">' +
            '<div style="font-size:12px;color:#8b949e;margin-bottom:5px;">与其他怪兽的关系</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:5px;">';
        relations.sort(function(a,b){ return b.val - a.val; }).forEach(function(r) {
            var c = r.val > 60 ? '#46d164' : r.val > 0 ? '#8b949e' : '#f85149';
            html += '<span style="background:#161b22;border:1px solid ' + c + ';border-radius:12px;padding:2px 8px;font-size:11px;color:' + c + ';">' +
                r.name + ' · ' + r.tag + '</span>';
        });
        html += '</div></div>';
    }

    // 履历列表
    if (!logs.length) {
        html += '<div style="text-align:center;padding:20px;color:#8b949e;">还没有任何经历记录</div>';
    } else {
        html += '<div style="max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;">';
        logs.forEach(function(entry) {
            var ic = typeIcon[entry.type] || '⚡';
            html += '<div style="background:#161b22;border:1px solid #21262d;border-radius:6px;padding:7px 10px;display:flex;gap:8px;align-items:flex-start;">' +
                '<span style="font-size:14px;flex-shrink:0;">' + ic + '</span>' +
                '<div style="flex:1;font-size:12px;line-height:1.5;">' + entry.summary + '</div>' +
                '<span style="font-size:11px;color:#8b949e;white-space:nowrap;flex-shrink:0;">' + entry.timeStr + '</span>' +
            '</div>';
        });
        html += '</div>';
    }

    html += '<div class="modal-buttons"><button class="btn btn-primary" onclick="closeModal();showMonsterDetailModal(' + monsterId + ')">返回</button></div>';
    showModal(html);
};
