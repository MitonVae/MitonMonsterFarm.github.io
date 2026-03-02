// ==================== GM 开发者指令面板 ====================
// 访问密码：3832578216129557（仅存于本地，不上传至服务器）

(function() {
    'use strict';

    var GM_PASSWORD = '3832578216129557';
    var GM_SESSION_KEY = 'mf_gm_auth';
    var GM_SPEED_KEY   = 'mf_gm_speed';

    // ── 时间加速补丁状态 ──
    var _speedMultiplier = 1;
    var _patchedIntervals = []; // { id, originalFn, originalDelay, patchedId }
    var _gameLoopPatched  = false;

    // ========== 鉴权 ==========
    function isAuthed() {
        try { return sessionStorage.getItem(GM_SESSION_KEY) === '1'; } catch(e) { return false; }
    }
    function setAuthed() {
        try { sessionStorage.setItem(GM_SESSION_KEY, '1'); } catch(e) {}
    }

    // ========== 对外入口 ==========
    window.openGMPanel = function() {
        if (isAuthed()) {
            _renderPanel();
        } else {
            _renderAuthDialog();
        }
    };

    // ========== 鉴权弹窗 ==========
    function _renderAuthDialog() {
        var html =
            '<div class="modal-header" style="color:#f85149;">' + T('authTitle','gm') + '</div>' +
            '<div style="margin-bottom:16px;font-size:13px;color:#8b949e;line-height:1.7;">' +
                T('authDesc','gm') +
            '</div>' +
            '<div style="margin-bottom:16px;">' +
                '<input id="gmPwdInput" type="password" placeholder="' + T('authPlaceholder','gm') + '" ' +
                    'style="width:100%;box-sizing:border-box;padding:9px 12px;background:#0d1117;' +
                    'border:1px solid #30363d;border-radius:6px;color:#e6edf3;font-size:14px;" ' +
                    'onkeydown="if(event.key===\'Enter\')window._gmVerify()" />' +
                '<div id="gmPwdErr" style="color:#f85149;font-size:12px;margin-top:6px;display:none;">' + T('authWrongPwd','gm') + '</div>' +
            '</div>' +
            '<div class="modal-buttons">' +
                '<button class="btn btn-primary" onclick="window._gmVerify()">' + T('authVerify','gm') + '</button>' +
                '<button class="btn btn-secondary" onclick="closeModal()">' + T('cancel','common') + '</button>' +
            '</div>';
        showModal(html);
        setTimeout(function() {
            var inp = document.getElementById('gmPwdInput');
            if (inp) inp.focus();
        }, 100);
    }

    window._gmVerify = function() {
        var inp = document.getElementById('gmPwdInput');
        if (!inp) return;
        if (inp.value === GM_PASSWORD) {
            setAuthed();
            _renderPanel();
        } else {
            var errEl = document.getElementById('gmPwdErr');
            if (errEl) { errEl.style.display = 'block'; }
            inp.value = '';
            inp.focus();
        }
    };

    // ========== 主面板渲染 ==========
    function _renderPanel() {
        var speedOpts = [1, 2, 5, 10, 20];
        var curSpeed  = _speedMultiplier;

        var speedBtns = speedOpts.map(function(s) {
            var active = (curSpeed === s);
            return '<button onclick="window._gmSetSpeed(' + s + ');window.openGMPanel();" ' +
                'class="btn ' + (active ? 'btn-primary' : 'btn-secondary') + '" ' +
                'style="flex:1;padding:6px 4px;font-size:12px;">×' + s + '</button>';
        }).join('');

        var rColor = { common:'#8b949e', uncommon:'#46d164', rare:'#58a6ff', epic:'#bc8cff', legendary:'#f0c53d' };

        // 怪兽品种下拉选项
        var typeItems = Object.keys(monsterTypes).map(function(k) {
            var t = monsterTypes[k];
            return { value: k, label: t.name + '（' + t.rarity + '）', color: rColor[t.rarity] || '#e6edf3' };
        });
        var firstTypeKey = typeItems.length ? typeItems[0].value : '';

        // 探索区域下拉选项
        var zoneItems = explorationZones.map(function(z) {
            return { value: z.id, label: z.icon + ' ' + z.name };
        });
        var firstZoneId = zoneItems.length ? zoneItems[0].value : '';

        // 科技下拉选项
        var techItems = Object.keys(technologies).map(function(k) {
            var unlocked = gameState.technologies[k];
            return { value: k, label: (unlocked ? '✅ ' : '🔒 ') + technologies[k].name };
        });
        var firstTechKey = techItems.length ? techItems[0].value : '';

        var html =
            // ── 标题 ──
            '<div class="modal-header" style="color:#f0c53d;">' + T('panelTitle','gm') + '</div>' +
            // 内容直接平铺，由 showModal 的 .modal-body 统一负责滚动
            '<div>' +

            // ── 区块：资源补充 ──
            _section(T('secResources','gm'),
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    _resBtn(T('resCoins','gm'),     'coins',     [500,2000,10000]) +
                    _resBtn(T('resFood','gm'),       'food',      [100,500,2000]) +
                    _resBtn(T('resMaterials','gm'),  'materials', [100,500,2000]) +
                    _resBtn(T('resResearch','gm'),   'research',  [50,200,500]) +
                    _resBtn(T('resEnergy','gm'),     'energy',    [50,100,'full']) +
                '</div>' +
                '<div style="margin-top:10px;">' +
                    '<button class="btn btn-warning" style="width:100%;font-size:13px;padding:9px;" ' +
                        'onclick="window._gmFillAllResources();">' +
                        T('btnFillAll','gm') +
                    '</button>' +
                '</div>'
            ) +

            // ── 区块：时间加速 ──
            _section(T('secSpeed','gm'),
                '<div style="font-size:12px;color:#8b949e;margin-bottom:8px;">' + T('speedCurrent','gm') + '<strong style="color:#f0c53d;">×' + curSpeed + '</strong>　' + T('speedDesc','gm') + '</div>' +
                '<div style="display:flex;gap:6px;">' + speedBtns + '</div>' +
                '<div style="margin-top:10px;display:flex;gap:8px;">' +
                    '<button class="btn btn-warning" style="flex:1;font-size:12px;" ' +
                        'onclick="window._gmTick(1);window.openGMPanel();">' + T('speedTick1','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;font-size:12px;" ' +
                        'onclick="window._gmTick(10);window.openGMPanel();">' + T('speedTick10','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：获得怪兽 ──
            _section(T('secMonster','gm'),
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">' +
                    '<div>' +
                        '<label style="font-size:12px;color:#8b949e;display:block;margin-bottom:4px;">' + T('monsterType','gm') + '</label>' +
                        _gmBuildCS('gmMonsterType', typeItems, firstTypeKey) +
                    '</div>' +
                    '<div>' +
                        '<label style="font-size:12px;color:#8b949e;">' + T('monsterLevel','gm') + '</label>' +
                        '<div class="mf-num-wrap" style="margin-top:4px;">' +
                            '<button class="mf-num-btn" onclick="var el=document.getElementById(\'gmMonsterLevel\');el.value=Math.max(1,+el.value-1)">−</button>' +
                            '<input id="gmMonsterLevel" type="number" min="1" max="50" value="1" ' +
                                'class="mf-range-input" style="width:60px;border:none;border-left:1px solid #30363d;border-right:1px solid #30363d;">' +
                            '<button class="mf-num-btn" onclick="var el=document.getElementById(\'gmMonsterLevel\');el.value=Math.min(50,+el.value+1)">+</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div style="margin-bottom:8px;">' +
                    '<label style="font-size:12px;color:#8b949e;">' + T('monsterName','gm') + '</label>' +
                    '<input id="gmMonsterName" type="text" placeholder="' + T('monsterNamePH','gm') + '" ' +
                        'style="width:100%;box-sizing:border-box;margin-top:4px;padding:7px 8px;' +
                        'background:#0d1117;border:1px solid #30363d;border-radius:6px;color:#e6edf3;font-size:13px;">' +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button class="btn btn-primary" style="flex:1;font-size:13px;" onclick="window._gmAddMonster();">' + T('btnAddMonster','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;font-size:13px;" onclick="window._gmAddAllMonsters();">' + T('btnAddAllMonsters','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：科技解锁 ──
            _section(T('secTech','gm'),
                '<div style="margin-bottom:8px;">' +
                    _gmBuildCS('gmTechKey', techItems, firstTechKey) +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button class="btn btn-primary" style="flex:1;font-size:13px;" onclick="window._gmUnlockTech()">' + T('btnUnlockTech','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;font-size:13px;" onclick="window._gmUnlockAllTech()">' + T('btnUnlockAllTech','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：探索区域解锁 ──
            _section(T('secZone','gm'),
                '<div style="margin-bottom:8px;">' +
                    _gmBuildCS('gmZoneKey', zoneItems, firstZoneId) +
                '</div>' +
                '<div style="display:flex;gap:8px;">' +
                    '<button class="btn btn-primary" style="flex:1;font-size:13px;" onclick="window._gmUnlockZone()">' + T('btnUnlockZone','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;font-size:13px;" onclick="window._gmUnlockAllZones()">' + T('btnUnlockAllZones','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：农场管理 ──
            _section(T('secFarm','gm'),
                '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                    '<button class="btn btn-primary" style="flex:1;min-width:120px;font-size:12px;" ' +
                        'onclick="window._gmUnlockAllPlots()">' + T('btnUnlockAllPlots','gm') + '</button>' +
                    '<button class="btn btn-primary" style="flex:1;min-width:120px;font-size:12px;" ' +
                        'onclick="window._gmHarvestAll()">' + T('btnHarvestAll','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;min-width:120px;font-size:12px;" ' +
                        'onclick="window._gmClearAllPlots()">' + T('btnClearAllPlots','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：统计数据作弊 ──
            _section(T('secStats','gm'),
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<button class="btn btn-secondary" style="font-size:12px;" ' +
                        'onclick="gameState.totalExplorations=30;showNotification(T(\'btnExplore30\',\'gm\'),\'success\');window.openGMPanel();">' + T('btnExplore30','gm') + '</button>' +
                    '<button class="btn btn-secondary" style="font-size:12px;" ' +
                        'onclick="gameState.totalHarvests=50;showNotification(T(\'btnHarvest50\',\'gm\'),\'success\');window.openGMPanel();">' + T('btnHarvest50','gm') + '</button>' +
                    '<button class="btn btn-secondary" style="font-size:12px;" ' +
                        'onclick="gameState.monstersBreed=10;showNotification(T(\'btnBreed10\',\'gm\'),\'success\');window.openGMPanel();">' + T('btnBreed10','gm') + '</button>' +
                    '<button class="btn btn-danger" style="font-size:12px;" ' +
                        'onclick="window._gmResetStats()">' + T('btnResetStats','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：存档管理 ──
            _section(T('secSave','gm'),
                '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                    '<button class="btn btn-primary" style="flex:1;min-width:120px;font-size:12px;" ' +
                        'onclick="quickSave();showNotification(T(\'ntfSaved\',\'gm\'),\'success\');">' + T('btnSaveNow','gm') + '</button>' +
                    '<button class="btn btn-warning" style="flex:1;min-width:120px;font-size:12px;" ' +
                        'onclick="window._gmExportSave()">' + T('btnExportSave','gm') + '</button>' +
                '</div>'
            ) +

            // ── 区块：游戏状态快照 ──
            _section(T('secSnapshot','gm'),
                '<div id="gmSnapshot" style="font-size:12px;color:#8b949e;background:#0d1117;' +
                    'border:1px solid #21262d;border-radius:6px;padding:10px;line-height:2;' +
                    'font-family:monospace;max-height:140px;overflow-y:auto;">' +
                    _buildSnapshot() +
                '</div>' +
                '<button class="btn btn-secondary" style="width:100%;margin-top:8px;font-size:12px;" ' +
                    'onclick="document.getElementById(\'gmSnapshot\').innerHTML=window._gmSnapshot();">' + T('btnRefreshSnapshot','gm') + '</button>'
            ) +

            '</div>' + // end scroll container

            '<div class="modal-buttons" style="margin-top:12px;">' +
                '<button class="btn btn-secondary" onclick="closeModal()">' + T('close','gm') + '</button>' +
            '</div>';

        showModal(html);
    }

    // ========== 辅助：GM 自定义下拉 ==========
    // 复用 monster-filter.js 中注册的 _csOpen/_csSelect 全局函数
    // items: [{value, label, color?}]，defaultVal: 默认选中的 value
    function _gmBuildCS(id, items, defaultVal) {
        var cur = defaultVal;
        var curLabel = '';
        items.forEach(function(o) {
            if (String(o.value) === String(cur)) curLabel = o.label;
        });
        if (!curLabel && items.length) { cur = items[0].value; curLabel = items[0].label; }

        var listHtml = items.map(function(o) {
            var isSel = String(o.value) === String(cur);
            var colorStyle = o.color ? 'color:' + o.color + ';' : '';
            // 选中后直接更新 data-value 和 label，不需要走 _mfUpdate
            return '<div class="cs-item' + (isSel ? ' cs-selected' : '') + '" ' +
                'data-value="' + o.value + '" ' +
                'style="' + colorStyle + '" ' +
                'onclick="event.stopPropagation();window._csSelect(\'' + id + '\',' +
                    JSON.stringify(o.value) + ',' +
                    JSON.stringify(o.label) + ',' +
                    'null' +
                ');">' +
                (isSel ? '<span class="cs-check">✓</span>' : '<span class="cs-check"></span>') +
                o.label +
                '</div>';
        }).join('');

        return '<div class="cs-dropdown gm-cs" id="' + id + '" data-value="' + cur + '" ' +
            'style="width:100%;box-sizing:border-box;" ' +
            'onclick="event.stopPropagation();window._csOpen(\'' + id + '\')">' +
            '<span class="cs-label">' + curLabel + '</span>' +
            '<span class="cs-arrow">▾</span>' +
            '<div class="cs-list">' + listHtml + '</div>' +
        '</div>';
    }

    // ========== 辅助：区块包裹 ==========
    function _section(title, content) {
        return '<div style="margin-bottom:16px;background:#161b22;border:1px solid #30363d;' +
            'border-radius:8px;overflow:hidden;">' +
            '<div style="padding:8px 12px;background:#21262d;font-size:12px;font-weight:700;' +
                'color:#8b949e;text-transform:uppercase;letter-spacing:0.5px;">' + title + '</div>' +
            '<div style="padding:12px;">' + content + '</div>' +
            '</div>';
    }

    // ========== 辅助：资源按钮组 ==========
    function _resBtn(label, key, amounts) {
        var btns = amounts.map(function(amt) {
            var display = amt === 'full' ? T('resFull','gm') : '+' + amt;
            var call = amt === 'full'
                ? 'gameState.' + key + '=gameState.max' + key.charAt(0).toUpperCase() + key.slice(1) + '||gameState.' + key + ';'
                : 'gameState.' + key + '+=' + amt + ';';
            if (key === 'energy' && amt === 'full') {
                call = 'gameState.energy=gameState.maxEnergy;';
            }
            return '<button class="btn btn-secondary" style="flex:1;padding:5px 3px;font-size:11px;" ' +
                'onclick="' + call + 'updateResources();showNotification(\'' + label + ' ' + display + '\',\'success\');">' +
                display + '</button>';
        }).join('');
        return '<div><div style="font-size:12px;color:#8b949e;margin-bottom:4px;">' + label + '</div>' +
            '<div style="display:flex;gap:4px;">' + btns + '</div></div>';
    }

    // ========== 辅助：状态快照 ==========
    function _buildSnapshot() {
        return window._gmSnapshot ? window._gmSnapshot() : _genSnapshot();
    }

    function _genSnapshot() {
        var m = gameState.monsters.length;
        var idle = gameState.monsters.filter(function(x){return x.status==='idle';}).length;
        var farming = gameState.monsters.filter(function(x){return x.status==='farming';}).length;
        var unlocked = gameState.plots.filter(function(p){return !p.locked;}).length;
        var techCount = Object.keys(gameState.technologies).filter(function(k){return gameState.technologies[k];}).length;
        var totalTech = Object.keys(technologies).length;
        return [
            '<span style="color:#58a6ff;">' + T('resCoins','gm') + '</span>: ' + gameState.coins,
            '<span style="color:#46d164;">' + T('resFood','gm') + '</span>: ' + gameState.food,
            '<span style="color:#c9d1d9;">' + T('resMaterials','gm') + '</span>: ' + gameState.materials,
            '<span style="color:#58a6ff;">' + T('resResearch','gm') + '</span>: ' + gameState.research,
            '<span style="color:#46d164;">' + T('resEnergy','gm') + '</span>: ' + gameState.energy + '/' + gameState.maxEnergy,
            '<span style="color:#f0c53d;">' + T('snapshotMonsters','gm') + '</span>: ' + m + T('snapshotUnit','gm') + ' (' + T('snapshotIdle','gm') + ':' + idle + ' ' + T('snapshotFarming','gm') + ':' + farming + ')',
            '<span style="color:#f0c53d;">' + T('snapshotPlots','gm') + '</span>: ' + unlocked + '/' + gameState.plots.length + ' ' + T('snapshotUnlocked','gm'),
            '<span style="color:#bc8cff;">' + T('secTech','gm') + '</span>: ' + techCount + '/' + totalTech + ' ' + T('snapshotResearched','gm'),
            '<span style="color:#8b949e;">' + T('snapshotExplore','gm') + '</span>: ' + gameState.totalExplorations,
            '<span style="color:#8b949e;">' + T('snapshotSpeed','gm') + '</span>: ×' + _speedMultiplier
        ].join('<br>');
    }
    window._gmSnapshot = _genSnapshot;

    // ========== GM 指令实现 ==========

    // ── 时间加速 ──
    window._gmSetSpeed = function(mult) {
        _speedMultiplier = mult;
        // 速度变更仅体现在面板刷新，无需弹窗
        try { sessionStorage.setItem(GM_SPEED_KEY, String(mult)); } catch(e) {}
        _applySpeedPatch(mult);
    };

    // 游戏循环加速：通过重写 setInterval 加速所有后续定时器
    // 注意：已创建的定时器无法修改，使用「触发N次循环」作为补充
    function _applySpeedPatch(mult) {
        // 仅用于提示；实际通过_gmTick批量触发游戏逻辑
        if (mult > 1) {
            // 启动加速心跳：每秒额外触发（mult-1）次游戏循环
            _stopSpeedHeart();
            var extraTicks = mult - 1;
            _heartTimer = setInterval(function() {
                for (var i = 0; i < extraTicks; i++) {
                    _triggerGameTick();
                }
            }, 1000);
        } else {
            _stopSpeedHeart();
        }
    }

    var _heartTimer = null;
    function _stopSpeedHeart() {
        if (_heartTimer) { clearInterval(_heartTimer); _heartTimer = null; }
    }

    // ── 手动触发N次游戏循环（资源衰减/再生等） ──
    window._gmTick = function(n) {
        n = n || 1;
        for (var i = 0; i < n; i++) {
            _triggerGameTick();
        }
        showNotification(T('ntfTickDone','gm').replace('{n}', n), 'info');
    };

    // ── 触发一次游戏循环（综合所有子系统）──
    function _triggerGameTick() {
        // 1. 农场：farm.js 的生长进度基于 Date.now()-plantedAt 时间差，
        //    无法通过重复调用渲染来推进。需将 plantedAt 往前偏移 10s，
        //    模拟"已过去10秒"的效果，再刷新进度条。
        var TICK_MS = 10000; // 等效于主循环10s一次
        if (gameState && gameState.plots) {
            gameState.plots.forEach(function(p) {
                if (p.crop && p.progress < 100 && p.plantedAt) {
                    p.plantedAt -= TICK_MS;
                }
            });
        }
        if (typeof renderFarm === 'function') renderFarm();

        // 2. 探索：exploration.js 的进度是累加式，
        //    直接调用每个活跃区域的 calcAutoSpeed + progress 推进
        if (typeof explorationZones !== 'undefined' && gameState && gameState.zoneStates) {
            explorationZones.forEach(function(zone) {
                var zs = gameState.zoneStates[zone.id];
                if (!zs || !zs.assignedMonsterIds || zs.assignedMonsterIds.length === 0) return;
                if (typeof calcAutoSpeed === 'function') {
                    var speed = calcAutoSpeed(zone, zs.assignedMonsterIds);
                    zs.progress = (zs.progress || 0) + speed;
                    if (zs.progress >= 100) {
                        zs.progress = 0;
                        if (typeof settleZone === 'function') settleZone(zone);
                    }
                }
            });
            if (typeof renderExploration === 'function') renderExploration();
        }

        // 3. 资源循环（能量恢复、食物消耗等）
        //    main.js 的资源循环为匿名函数，提取关键逻辑在此复现
        if (gameState) {
            // 能量上限
            var newMax = Math.min(500, 100 + gameState.monsters.length * 20);
            gameState.maxEnergy = newMax;
            // 能量恢复
            if (gameState.energy < gameState.maxEnergy) {
                var baseRegen = 1;
                var foodRegen = Math.min(5, Math.floor(gameState.food / 10));
                gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + baseRegen + foodRegen);
            }
            // 食物消耗
            var busyCount = gameState.monsters.filter(function(m) {
                return m.status === 'farming' || m.status === 'exploring';
            }).length;
            if (busyCount > 0) {
                var prevFood = gameState.food;
                gameState.food = Math.max(0, gameState.food - Math.ceil(busyCount * 0.5));
                if (prevFood > 0 && gameState.food === 0) {
                    showNotification(T('ntfFoodOut','common'), 'warning');
                }
            }
            // 金币维护费
            var maintenanceCost = Math.floor(gameState.monsters.length * 0.5);
            if (maintenanceCost > 0) {
                var prevCoins = gameState.coins;
                gameState.coins = Math.max(0, gameState.coins - maintenanceCost);
                if (prevCoins > 0 && gameState.coins === 0) {
                    showNotification(T('ntfCoinsOut','common'), 'warning');
                }
            }
        }
        if (typeof updateResources === 'function') updateResources();
    }

    // ── 一键大量补充全种类资源 ──
    window._gmFillAllResources = function() {
        gameState.coins     += 50000;
        gameState.food      += 5000;
        gameState.materials += 5000;
        gameState.research  += 2000;
        gameState.energy     = gameState.maxEnergy;
        if (typeof updateResources === 'function') updateResources();
        showNotification('⚡ 金币+50000 食物+5000 材料+5000 研究+2000 能量满', 'success');
    };

    // ── 添加怪兽 ──
    window._gmAddMonster = function() {
        var _gmTypeEl = document.getElementById('gmMonsterType');
        var typeKey  = (_gmTypeEl ? (_gmTypeEl.dataset.value || _gmTypeEl.value) : '') || 'slime';
        var levelVal = parseInt((document.getElementById('gmMonsterLevel') || {}).value || '1', 10);
        var nameVal  = ((document.getElementById('gmMonsterName') || {}).value || '').trim();
        levelVal = Math.max(1, Math.min(50, isNaN(levelVal) ? 1 : levelVal));
        _spawnMonster(typeKey, levelVal, nameVal || null);
    };

    window._gmAddAllMonsters = function() {
        Object.keys(monsterTypes).forEach(function(k) {
            _spawnMonster(k, 1, null);
        });
        showNotification(T('ntfAddAllMonsters','gm').replace('{count}', Object.keys(monsterTypes).length), 'success');
        if (typeof renderMonsterSidebar === 'function') renderMonsterSidebar();
        window.openGMPanel();
    };

    function _spawnMonster(typeKey, level, customName) {
        var typeData = monsterTypes[typeKey];
        if (!typeData) { showNotification('未知怪兽类型: ' + typeKey, 'error'); return; }

        var names = {
            slime:   ['粘粘', '软软', '圆滚', '史莱姆王'],
            goblin:  ['格里姆', '托比', '小绿', '哥布林长老'],
            sprite:  ['星尘', '微光', '精灵子', '森之灵'],
            golem:   ['磐石', '铁皮', '巨岩', '石像守卫'],
            wisp:    ['幽幽', '暗火', '幽灵焰', '鬼火'],
            ifrit:   ['炎炎', '火魔', '赤焰', '烈焱'],
            toxfrog: ['毒毒', '蛙蛙', '绿汁', '剧毒蟾蜍'],
            crystal: ['冰蓝', '霜晶', '极寒', '永冻冰晶'],
            shadow:  ['暗影', '虚影', '深渊', '影之领主'],
            ancient: ['古龙', '远古者', '神龙', '不灭古龙']
        };
        var namePool = names[typeKey] || ['怪兽'];
        var name = customName || namePool[Math.floor(Math.random() * namePool.length)];

        // 计算基础属性（含等级加成）
        var base = typeData.baseStats;
        var grow = (gameState.technologies && gameState.technologies.monsterTraining) ? 1.3 : 1.0;
        function calcStat(b) { return Math.round(b + (level - 1) * b * 0.15 * grow); }

        var traits = _pickTraits(typeKey);
        var maxExp = 100 + (level - 1) * 50;

        var monster = {
            id:         gameState.nextMonsterId++,
            name:       name,
            type:       typeKey,
            level:      level,
            exp:        0,
            maxExp:     maxExp,
            generation: 1,
            status:     'idle',
            assignment: null,
            stats: {
                strength:     calcStat(base.strength),
                agility:      calcStat(base.agility),
                intelligence: calcStat(base.intelligence),
                farming:      calcStat(base.farming)
            },
            traits: traits
        };

        gameState.monsters.push(monster);
        if (typeof renderMonsterSidebar === 'function') renderMonsterSidebar();
        showNotification(T('ntfAddMonster','gm').replace('{type}',typeData.name).replace('{name}',name).replace('{lv}',level), 'success');
        window.openGMPanel();
    }

    function _pickTraits(typeKey) {
        // 使用 gamedata.js 中的全局 allTraits，按稀有度加权随机抽取0~2个
        var pool = (typeof allTraits !== 'undefined') ? allTraits : [];
        var count = Math.floor(Math.random() * 3);
        if (pool.length === 0 || count === 0) return [];
        var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
        return shuffled.slice(0, count).map(function(t) {
            return { id: t.id, name: t.name, rarity: t.rarity, effect: t.effect, desc: t.desc };
        });
    }

    // ── 科技解锁 ──
    window._gmUnlockTech = function() {
        var _gmTechEl = document.getElementById('gmTechKey');
        var key = _gmTechEl ? (_gmTechEl.dataset.value || _gmTechEl.value) : '';
        if (!key) return;
        gameState.technologies[key] = true;
        if (typeof renderTech === 'function') renderTech();
        showNotification(T('ntfUnlockTech','gm').replace('{name}', technologies[key] ? technologies[key].name : key), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    window._gmUnlockAllTech = function() {
        Object.keys(technologies).forEach(function(k) { gameState.technologies[k] = true; });
        if (typeof renderTech === 'function') renderTech();
        showNotification(T('ntfUnlockAllTech','gm'), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    // ── 探索区域解锁 ──
    window._gmUnlockZone = function() {
        var _gmZoneEl = document.getElementById('gmZoneKey');
        var zoneId = _gmZoneEl ? (_gmZoneEl.dataset.value || _gmZoneEl.value) : '';
        if (!zoneId) return;
        if (!gameState.zoneStates[zoneId]) gameState.zoneStates[zoneId] = {};
        gameState.zoneStates[zoneId].unlocked = true;
        // 如果是购买通行证类型，也标记已购
        gameState.purchasedZones[zoneId] = true;
        var zone = explorationZones.find(function(z) { return z.id === zoneId; });
        if (typeof renderExploration === 'function') renderExploration();
        showNotification(T('ntfUnlockZone','gm').replace('{name}', zone ? zone.name : zoneId), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    window._gmUnlockAllZones = function() {
        explorationZones.forEach(function(z) {
            if (!gameState.zoneStates[z.id]) gameState.zoneStates[z.id] = {};
            gameState.zoneStates[z.id].unlocked = true;
            gameState.purchasedZones[z.id] = true;
        });
        if (typeof renderExploration === 'function') renderExploration();
        showNotification(T('ntfUnlockAllZones','gm'), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    // ── 农场地块 ──
    window._gmUnlockAllPlots = function() {
        gameState.plots.forEach(function(p) { p.locked = false; });
        if (typeof renderFarm === 'function') renderFarm();
        showNotification(T('ntfUnlockAllPlots','gm'), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    window._gmHarvestAll = function() {
        var ripened = 0, harvested = 0;
        // 先将所有未成熟的作物催熟（修改 plantedAt 使进度达到100%）
        gameState.plots.forEach(function(p) {
            if (p.crop && p.progress < 100) {
                var ct = typeof cropTypes !== 'undefined'
                    ? cropTypes.find(function(c){return c.id===p.crop;})
                    : null;
                if (ct && p.plantedAt) {
                    // 将植入时间推到足够早，使 elapsed >= growTime
                    p.plantedAt = Date.now() - ct.growTime * 2;
                }
                p.progress = 100;
                ripened++;
            }
        });
        // 收获所有无怪兽驻守的成熟地块
        gameState.plots.forEach(function(p, idx) {
            if (p.crop && p.progress >= 100 && !p.assignedMonster) {
                if (typeof harvest === 'function') {
                    harvest(idx);
                    harvested++;
                }
            }
        });
        // 有怪兽驻守的地块：触发自动收获
        gameState.plots.forEach(function(p, idx) {
            if (p.crop && p.progress >= 100 && p.assignedMonster) {
                if (typeof autoHarvestPlot === 'function') autoHarvestPlot(idx);
            }
        });
        if (typeof renderFarm === 'function') renderFarm();
        showNotification(T('ntfHarvestAll','gm').replace('{r}',ripened).replace('{h}',harvested), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    window._gmClearAllPlots = function() {
        gameState.plots.forEach(function(p) {
            p.crop = null;
            p.progress = 0;
            p.assignedMonster = null;
            p.autoCrop = null;
        });
        // 归还所有耕作中的怪兽
        gameState.monsters.forEach(function(m) {
            if (m.status === 'farming') { m.status = 'idle'; m.assignment = null; }
        });
        if (typeof renderFarm === 'function') renderFarm();
        if (typeof renderMonsterSidebar === 'function') renderMonsterSidebar();
        showNotification(T('ntfClearAllPlots','gm'), 'success');
        setTimeout(function() { window.openGMPanel(); }, 300);
    };

    // ── 统计重置 ──
    window._gmResetStats = function() {
        gameState.totalHarvests    = 0;
        gameState.totalExplorations = 0;
        gameState.monstersBreed    = 0;
        showNotification(T('ntfResetStats','gm'), 'info');
        window.openGMPanel();
    };

    // ── 存档导出 ──
    window._gmExportSave = function() {
        try {
            var data = localStorage.getItem('monsterFarmSave') || '{}';
            var blob = new Blob([data], { type: 'application/json' });
            var url  = URL.createObjectURL(blob);
            var a    = document.createElement('a');
            a.href   = url;
            a.download = 'monsterfarm_save_' + Date.now() + '.json';
            document.body.appendChild(a);
            a.click();
            setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
            showNotification(T('ntfExported','gm'), 'success');
        } catch(e) {
            showNotification(T('ntfExportFail','gm').replace('{err}', e.message), 'error');
        }
    };

    // ── 重置游戏 ──
    window._gmConfirmReset = function() {
        var html =
            '<div class="modal-header" style="color:#f85149;">' + T('resetTitle','gm') + '</div>' +
            '<div style="margin-bottom:16px;font-size:14px;line-height:1.8;color:#e6edf3;">' +
                T('resetDesc','gm') +
            '</div>' +
            '<div class="modal-buttons">' +
                '<button class="btn btn-danger" onclick="try{localStorage.removeItem(\'monsterFarmSave\');}catch(e){}' +
                    'try{sessionStorage.clear();}catch(e){}location.reload();">' + T('resetConfirm','gm') + '</button>' +
                '<button class="btn btn-secondary" onclick="window.openGMPanel()">' + T('cancel','common') + '</button>' +
            '</div>';
        showModal(html);
    };

    // ========== 快捷键入口（Ctrl+Shift+G） ==========
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'G') {
            e.preventDefault();
            window.openGMPanel();
        }
    });

    // ========== 悬浮 GM 按钮（仅开发者验证后显示）==========
    // 在验证成功后往 DOM 注入一个极小的角落徽章
    var _gmBadgeInjected = false;
    var _origSetAuthed = setAuthed;
    setAuthed = function() {
        _origSetAuthed();
        _injectGMBadge();
    };

    function _injectGMBadge() {
        if (_gmBadgeInjected) return;
        _gmBadgeInjected = true;
        var badge = document.createElement('div');
        badge.id = 'gmCornerBadge';
        badge.title = T('badgeTitle','gm');
        badge.onclick = function() { window.openGMPanel(); };
        badge.style.cssText =
            'position:fixed;bottom:72px;left:8px;z-index:9000;' +
            'background:linear-gradient(135deg,#f0c53d,#e09000);' +
            'color:#0d1117;font-size:10px;font-weight:900;' +
            'padding:3px 7px;border-radius:10px;cursor:pointer;' +
            'box-shadow:0 2px 8px rgba(0,0,0,0.5);' +
            'letter-spacing:0.5px;user-select:none;' +
            'transition:opacity 0.2s;opacity:0.75;';
        badge.textContent = 'GM';
        badge.addEventListener('mouseenter', function() { badge.style.opacity = '1'; });
        badge.addEventListener('mouseleave', function() { badge.style.opacity = '0.75'; });
        document.body.appendChild(badge);
    }

    // 若已验证（页面刷新后 sessionStorage 仍有效），直接注入
    if (isAuthed()) _injectGMBadge();

})();
