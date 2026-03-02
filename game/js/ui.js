// ==================== UI 渲染与交互模块 ====================

// 全局渲染入口
window.renderAll = function() {
    updateResources();
    renderFarm();
    renderMonsters();
    renderExploration();
    renderBreeding();
    renderTech();
    renderDisposal();
    renderMonsterSidebar();
    renderFarmSummary();
};

// 初始化界面
function initUI() {
    // 设置游戏标题
    var gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.innerHTML = '<span style="display: inline-block; vertical-align: middle; margin-right: 10px;">' + 
                             createSVG('factory', 32) + '</span>怪兽农场';
    }
    
    // 初始化资源显示
    renderResourceCards();
}

// 渲染资源卡片
function renderResourceCards() {
    var resourcesContainer = document.getElementById('resources');
    if (!resourcesContainer) return;
    
    var resources = [
        { key: 'coins', label: T('coins', 'resources'), value: gameState.coins, icon: 'coin' },
        { key: 'food', label: T('food', 'resources'), value: gameState.food, icon: 'food' },
        { key: 'materials', label: T('materials', 'resources'), value: gameState.materials, icon: 'material' },
        { key: 'research', label: T('research', 'resources'), value: gameState.research, icon: 'research' },
        { key: 'energy', label: T('energy', 'resources'), value: gameState.energy + '/' + gameState.maxEnergy, icon: 'energy' },
        { key: 'land', label: T('land', 'resources'), value: gameState.plots.filter(function(p) { return !p.locked; }).length + '/' + gameState.plots.length, icon: 'land' }
    ];
    
    resourcesContainer.innerHTML = resources.map(function(res) {
        return `
            <div class="resource">
                <div class="resource-label">
                    <span style="display: inline-block; vertical-align: middle; margin-right: 5px;">${createSVG(res.icon, 20)}</span>
                    ${res.label}
                </div>
                <div class="resource-value" id="res-${res.key}">${res.value}</div>
            </div>
        `;
    }).join('');
}

// ── updateResources 节流控制 ──
// 每秒最多执行一次真正的 DOM 更新（资源条文字），防止每个 tick 都全量重绘
var _updateResourcesScheduled = false;
window.updateResources = function() {
    if (_updateResourcesScheduled) return;
    _updateResourcesScheduled = true;
    requestAnimationFrame(function() {
        _updateResourcesScheduled = false;
        _doUpdateResources();
    });
};

function _doUpdateResources() {
    // 更新顶部资源（如果存在）
    var coinsEl = document.getElementById('res-coins');
    if (coinsEl) coinsEl.innerText = gameState.coins;

    var researchEl = document.getElementById('res-research');
    if (researchEl) researchEl.innerText = gameState.research;

    var landEl = document.getElementById('res-land');
    if (landEl) {
        var unlocked = gameState.plots.filter(function(p) { return !p.locked; }).length;
        landEl.innerText = unlocked + '/' + gameState.plots.length;
    }

    var foodEl = document.getElementById('res-food');
    if (foodEl) foodEl.innerText = gameState.food;

    var materialsEl = document.getElementById('res-materials');
    if (materialsEl) materialsEl.innerText = gameState.materials;

    var energyEl = document.getElementById('res-energy');
    if (energyEl) energyEl.innerText = gameState.energy + '/' + gameState.maxEnergy;

    // 更新侧边栏资源
    updateSidebarResources();
    // 更新侧边栏怪兽列表（轻量增量更新）
    _updateSidebarMonstersLight();
    // 同步刷新已展开的资源详情面板
    if (typeof refreshOpenResourceDetail === 'function') refreshOpenResourceDetail();
}

// 更新侧边栏资源显示
function updateSidebarResources() {
    var resources = [
        { id: 'coins', value: gameState.coins, icon: 'coin' },
        { id: 'food', value: gameState.food, icon: 'food' },
        { id: 'materials', value: gameState.materials, icon: 'material' },
        { id: 'research', value: gameState.research, icon: 'research' },
        { id: 'energy', value: gameState.energy + '/' + gameState.maxEnergy, icon: 'energy' }
    ];
    
    resources.forEach(function(res) {
        var iconEl = document.getElementById(res.id + 'Icon');
        var valueEl = document.getElementById(res.id);
        if (iconEl) iconEl.innerHTML = createSVG(res.icon, 20);
        if (valueEl) valueEl.innerText = res.value;
    });

    // 桌面侧边栏速率显示（金币、食物、材料、研究）
    if (typeof getResourceRates === 'function') {
        var rates = getResourceRates();
        var rateMap = { coins: rates.coins, food: rates.food, materials: rates.materials, research: rates.research };
        Object.keys(rateMap).forEach(function(key) {
            var rEl = document.getElementById('rate-' + key);
            if (!rEl) return;
            var val = rateMap[key];
            if (!val) { rEl.textContent = ''; rEl.className = 'res-rate'; return; }
            var sign = val > 0 ? '+' : '';
            rEl.textContent = sign + val + '/m';
            rEl.className = 'res-rate ' + (val > 0 ? 'rate-pos' : 'rate-neg');
        });
    }

    // 同步移动端顶部资源条（含速率显示）
    _updateMobTopbar();
}

// 格式化大数字（移动端紧凑显示）
function _fmtMobNum(n) {
    n = Math.floor(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

// 更新移动端顶部资源栏（包含速率 + 徽章）
function _updateMobTopbar() {
    // 图标（只在首次渲染时重绘，避免频繁 DOM 操作）
    var icons = [
        { id: 'mobCoinsIcon', key: 'coin' },
        { id: 'mobFoodIcon', key: 'food' },
        { id: 'mobMaterialsIcon', key: 'material' },
        { id: 'mobResearchIcon', key: 'research' },
        { id: 'mobEnergyIcon', key: 'energy' }
    ];
    icons.forEach(function(ic) {
        var el = document.getElementById(ic.id);
        if (el && !el._iconSet) { el.innerHTML = createSVG(ic.key, 13); el._iconSet = true; }
    });

    // 资源值
    var el;
    el = document.getElementById('mob-coins');     if (el) el.textContent = _fmtMobNum(gameState.coins);
    el = document.getElementById('mob-food');      if (el) el.textContent = _fmtMobNum(gameState.food);
    el = document.getElementById('mob-materials'); if (el) el.textContent = _fmtMobNum(gameState.materials);
    el = document.getElementById('mob-research');  if (el) el.textContent = _fmtMobNum(gameState.research || 0);
    el = document.getElementById('mob-energy');    if (el) el.textContent = gameState.energy + '/' + gameState.maxEnergy;

    // 资源速率（从 resource-detail 模块读取，若不可用则隐藏）
    function _setRate(elId, perMin) {
        var rateEl = document.getElementById(elId);
        if (!rateEl) return;
        if (perMin === undefined || perMin === null) { rateEl.textContent = ''; return; }
        var sign = perMin >= 0 ? '+' : '';
        rateEl.textContent = sign + _fmtMobNum(perMin) + '/m';
        rateEl.className = 'mob-res-rate ' + (perMin > 0 ? 'pos' : perMin < 0 ? 'neg' : '');
    }
    // 尝试从 getResourceRates 获取速率（如该函数存在）
    if (typeof getResourceRates === 'function') {
        var rates = getResourceRates();
        _setRate('mob-coins-rate',    rates.coins);
        _setRate('mob-food-rate',     rates.food);
        _setRate('mob-materials-rate',rates.materials);
        _setRate('mob-research-rate', rates.research || null);
        _setRate('mob-energy-rate',   null); // 能量不显示速率
    } else {
        // 降级：不显示速率
        ['mob-coins-rate','mob-food-rate','mob-materials-rate','mob-research-rate','mob-energy-rate'].forEach(function(id) {
            var e = document.getElementById(id); if (e) e.textContent = '';
        });
    }

    // 怪兽数量徽章
    var monsterCountEl = document.getElementById('mob-monster-count');
    if (monsterCountEl && gameState.monsters) {
        monsterCountEl.textContent = gameState.monsters.length;
    }

    // 农场状态徽章（显示已种植/总数）
    var farmStatusEl = document.getElementById('mob-farm-status');
    if (farmStatusEl && gameState.plots) {
        var planted = gameState.plots.filter(function(p) { return p.crop && !p.locked; }).length;
        var unlocked = gameState.plots.filter(function(p) { return !p.locked; }).length;
        var ready = gameState.plots.filter(function(p) { return p.progress >= 100 && p.crop; }).length;
        if (ready > 0) {
            farmStatusEl.textContent = '✓' + ready + '可收';
            farmStatusEl.parentElement.style.color = '#46d164';
        } else {
            farmStatusEl.textContent = planted + '/' + unlocked + '种';
            farmStatusEl.parentElement.style.color = '';
        }
    }
}

// ── 轻量增量更新：仅刷新怪兽状态文字，不重建 DOM ──
// updateResources 每秒调用此函数代替完整的 renderSidebarMonsters
function _updateSidebarMonstersLight() {
    var sidebarMonstersEl = document.getElementById('sidebarMonsters');
    if (!sidebarMonstersEl) return;

    var existingCards = sidebarMonstersEl.querySelectorAll('.sidebar-monster');
    var displayCount = Math.min(gameState.monsters.length, 6);

    // ① 数量不一致 → 必须完整重建
    if (existingCards.length !== displayCount) {
        renderSidebarMonsters();
        return;
    }

    // ② 逐张校验怪兽 ID，防止同数量但身份已变（出售+捕获同步发生）
    for (var i = 0; i < displayCount; i++) {
        var card = existingCards[i];
        var monster = gameState.monsters[i];
        if (!card || !monster) { renderSidebarMonsters(); return; }
        // 卡片上记录的 monster id（renderSidebarMonsters 写入 onclick 属性中）
        // 用 data-mid 属性做快速对比，若不存在则退化为完整渲染
        var dataMid = card.getAttribute('data-mid');
        if (dataMid === null || String(monster.id) !== dataMid) {
            renderSidebarMonsters();
            return;
        }
    }

    // ③ 身份完全匹配，仅刷新状态文字（textContent，不触发布局）
    for (var j = 0; j < displayCount; j++) {
        var m = gameState.monsters[j];
        var c = existingCards[j];
        var statusEl = c.querySelector('.sidebar-monster-status');
        if (statusEl) {
            var newText = m.status !== 'idle'
                ? getStatusText(m.status)
                : 'Lv.' + m.level + ' · ' + T('idle', 'monsterStatus');
            if (statusEl.textContent !== newText) statusEl.textContent = newText;
        }
    }
}

// 渲染侧边栏怪兽列表
function renderSidebarMonsters() {
    var sidebarMonstersEl = document.getElementById('sidebarMonsters');
    if (!sidebarMonstersEl) return;
    
    if (gameState.monsters.length === 0) {
        sidebarMonstersEl.innerHTML = '<div style="text-align: center; padding: 20px; color: #8b949e; font-size: 12px;">' + T('noMonsters', 'ui') + '</div>';
        return;
    }
    
    // 只显示前6只怪兽，避免侧边栏过长
    var displayMonsters = gameState.monsters.slice(0, 6);
    
    sidebarMonstersEl.innerHTML = displayMonsters.map(function(monster) {
        var isSelected = gameState.selectedMonster === monster.id;
        var isWorking = monster.status !== 'idle';
        var statusText = getStatusText(monster.status);
        
        return `
            <div class="sidebar-monster ${isSelected ? 'selected' : ''}" 
                 data-mid="${monster.id}"
                 onclick="showMonsterDetailModal(${monster.id});" 
                 oncontextmenu="selectMonster(${monster.id}); return false;">
                <div class="sidebar-monster-icon">
                    ${createSVG(monster.type, 28)}
                </div>
                <div class="sidebar-monster-info">
                    <div class="sidebar-monster-name">${monster.name}</div>
                    <div class="sidebar-monster-status">
                        ${isWorking ? statusText : 'Lv.' + monster.level + ' · ' + T('idle', 'monsterStatus')}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 如果有更多怪兽，显示提示
    if (gameState.monsters.length > 6) {
        sidebarMonstersEl.innerHTML += `
            <div style="text-align: center; padding: 10px; color: #8b949e; font-size: 11px; 
                        border-top: 1px solid #30363d; margin-top: 8px;">
                ${T('moreMonsters','ui').replace('{n}', gameState.monsters.length - 6)}
            </div>
        `;
    }
}

// 渲染农场（调用farm.js中的renderFarm，但renderFarm本身已定义为全局，这里直接调用）
window.renderFarm = function() {
    var farmGrid = document.getElementById('farmGrid');
    if (!farmGrid) return;
    
    farmGrid.innerHTML = gameState.plots.map(function(plot) {
        if (plot.locked) {
            var cost = plot.unlockCost;
            var canUnlock = gameState.coins >= cost.coins && gameState.materials >= cost.materials;
            var coinColor  = gameState.coins     >= cost.coins     ? '#f0c53d' : '#f85149';
            var matColor   = gameState.materials >= cost.materials ? '#c9d1d9' : '#f85149';
            return `
                <div class="plot locked${canUnlock ? ' can-unlock' : ''}" id="plot-${plot.id}" data-plot-id="${plot.id}" onclick="unlockPlot(${plot.id})">
                    ${canUnlock ? createSVG('unlock', 36) : createSVG('lock', 36)}
                    <div class="plot-text">
                        ${canUnlock ? '<span style="color:#46d164;font-weight:700;">可解锁</span>' : T('unlockNeeds','farm')}<br>
                        <span style="display:inline-block;vertical-align:middle;margin-right:3px;">${createSVG('coin', 12)}</span><span style="color:${coinColor};">${plot.unlockCost.coins}</span><br>
                        <span style="display:inline-block;vertical-align:middle;margin-right:3px;">${createSVG('material', 12)}</span><span style="color:${matColor};">${plot.unlockCost.materials}</span>
                    </div>
                </div>
            `;
        }
        
        if (plot.crop) {
            var cropType = cropTypes.find(function(c) { return c.id === plot.crop; });
            var isReady = plot.progress >= 100;
            var hasMonster = !!plot.assignedMonster;
            var monsterBadge = hasMonster
                ? `<div style="position:absolute;top:4px;right:4px;background:#1a3a2a;border:1px solid #46d164;border-radius:12px;padding:2px 6px;font-size:12px;display:flex;align-items:center;gap:3px;">
                       ${createSVG(plot.assignedMonster.type, 14)}<span style="color:#46d164;">自动</span>
                   </div>`
                : '';
            var autoCropBadge = plot.autoCrop && hasMonster
                ? `<div style="font-size:12px;color:#f0c53d;margin-top:2px;">▶ ${cropTypes.find(function(c){return c.id===plot.autoCrop;}).name}</div>`
                : '';
            var statusText = isReady
                ? (hasMonster ? '自动收获中...' : '点击收获')
                : cropType.name;
            
            return `
                <div class="plot planted ${isReady ? 'ready' : ''}" 
                     id="plot-${plot.id}" data-plot-id="${plot.id}"
                     onclick="handlePlotClick(${plot.id})"
                     style="position:relative;${isReady ? 'animation: pulse 1s infinite;' : ''}">
                    ${monsterBadge}
                    ${createSVG('plant', 40)}
                    <div class="plot-text">${statusText}${autoCropBadge}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${plot.progress}%"></div>
                    </div>
                </div>
            `;
        }
        
        var emptyMonster = plot.assignedMonster;
        return `
            <div class="plot" id="plot-${plot.id}" data-plot-id="${plot.id}"
                 onclick="handlePlotClick(${plot.id})"
                 style="position:relative;">
                ${emptyMonster ? `<div style="position:absolute;top:4px;right:4px;background:#1a3a2a;border:1px solid #46d164;border-radius:12px;padding:2px 6px;font-size:12px;display:flex;align-items:center;gap:3px;">${createSVG(emptyMonster.type, 14)}<span style="color:#46d164;">${T('preparing','monsterStatus')}</span></div>` : ''}
                ${createSVG('add', 40)}
                <div class="plot-text">${emptyMonster ? '点击设置作物' : '点击种植'}</div>
            </div>
        `;
    }).join('');
};

// renderMonsters：已合并到 renderMonsterSidebar，此函数保留为兼容别名
window.renderMonsters = function() {
    renderMonsterSidebar();
};

// ── 通知队列系统 ──
// 支持多条通知堆叠排布，消失后自动重排
var _notifQueue = [];
var _NOTIF_GAP = 8;       // 通知间距px
var _NOTIF_TOP_BASE = 20; // 初始距顶px

function _repositionNotifs() {
    var top = _NOTIF_TOP_BASE;
    _notifQueue.forEach(function(el) {
        el.style.top = top + 'px';
        top += el.offsetHeight + _NOTIF_GAP;
    });
}

window.showNotification = function(message, type) {
    type = type || 'info';
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    // 计算初始 top（入场前先定位好，避免从 top:0 弹下来）
    var initialTop = _NOTIF_TOP_BASE + _notifQueue.reduce(function(sum, el) {
        return sum + el.offsetHeight + _NOTIF_GAP;
    }, 0);
    notification.style.top = initialTop + 'px';

    document.body.appendChild(notification);
    _notifQueue.push(notification);

    var duration = type === 'achievement' ? 5000 : 3000;

    var timer = setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(110%)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        setTimeout(function() {
            notification.remove();
            var idx = _notifQueue.indexOf(notification);
            if (idx !== -1) _notifQueue.splice(idx, 1);
            _repositionNotifs();
        }, 300);
    }, duration);

    // 鼠标悬停暂停消失
    notification.addEventListener('mouseenter', function() { clearTimeout(timer); });
    notification.addEventListener('mouseleave', function() {
        timer = setTimeout(function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(110%)';
            notification.style.transition = 'opacity 0.3s, transform 0.3s';
            setTimeout(function() {
                notification.remove();
                var idx = _notifQueue.indexOf(notification);
                if (idx !== -1) _notifQueue.splice(idx, 1);
                _repositionNotifs();
            }, 300);
        }, 1500);
    });
};

// ── 重要通知过滤器（日常高频操作静默，只弹重要事件）──
// 用于替代直接调用 showNotification 的低优先级场景
window.showImportantNotification = function(message, type) {
    showNotification(message, type);
};

// 模态框
// 将注入的 HTML 自动拆分为三段结构：
//   .modal-header（顶部标题，固定不滚动）
//   .modal-body（中间内容，可滚动）
//   .modal-buttons（底部按钮，固定不滚动）
// 这样无论内容多长，关闭/确认按钮都始终可见。
window.showModal = function(content) {
    var modal = document.getElementById('modal');
    var modalContent = document.getElementById('modalContent');

    // 用临时容器解析 HTML，提取 header / buttons / body
    var tmp = document.createElement('div');
    tmp.innerHTML = content;

    var headerEl  = tmp.querySelector('.modal-header');
    var buttonsEl = tmp.querySelector('.modal-buttons');

    // 从 tmp 中移除已提取的节点，剩余即为 body 内容
    if (headerEl)  headerEl.parentNode.removeChild(headerEl);
    if (buttonsEl) buttonsEl.parentNode.removeChild(buttonsEl);

    // 构建三段结构
    modalContent.innerHTML = '';

    if (headerEl) modalContent.appendChild(headerEl);

    var bodyEl = document.createElement('div');
    bodyEl.className = 'modal-body';
    bodyEl.appendChild(tmp); // tmp 里还剩中间内容节点
    modalContent.appendChild(bodyEl);

    if (buttonsEl) modalContent.appendChild(buttonsEl);

    modal.classList.add('active');

    // 锁定背景滚动（移动端防穿透）
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
};

/**
 * showConfirmModal — 通用游戏内确认弹窗，替代原生 confirm()
 * opts: { title, content, confirmText, confirmClass, cancelText, onConfirm, onCancel }
 */
window.showConfirmModal = function(opts) {
    opts = opts || {};
    var title       = opts.title       || '确认操作';
    var content     = opts.content     || '是否继续？';
    var confirmText = opts.confirmText || '确认';
    var confirmCls  = opts.confirmClass|| 'btn-danger';
    var cancelText  = opts.cancelText  || T('cancel','common') || '取消';
    var onConfirm   = opts.onConfirm   || function() {};
    var onCancel    = opts.onCancel    || null;

    // 用唯一 id 挂钩回调，避免 onclick 字符串作用域问题
    var cbKey = '_scmCb_' + Date.now();
    window[cbKey] = function(confirmed) {
        closeModal();
        delete window[cbKey];
        if (confirmed) onConfirm();
        else if (onCancel) onCancel();
    };

    var html =
        '<div class="modal-header">' + title + '</div>' +
        '<div style="padding:8px 2px 16px;font-size:13px;line-height:1.7;color:#c9d1d9;">' +
            content +
        '</div>' +
        '<div class="modal-buttons">' +
            '<button class="btn ' + confirmCls + '" onclick="window[\'' + cbKey + '\'](true)">' + confirmText + '</button>' +
            '<button class="btn btn-secondary" onclick="window[\'' + cbKey + '\'](false)">' + cancelText + '</button>' +
        '</div>';
    showModal(html);
};

window.closeModal = function() {
    // 引导期间"选地块"步骤，禁止关闭弹窗（强制玩家点地块）
    if (typeof tutorialState !== 'undefined' &&
        tutorialState.active && tutorialState.waitingForPlotPick) {
        return;
    }
    var modal = document.getElementById('modal');
    modal.classList.remove('active');

    // 解锁背景滚动（移动端防穿透）
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
};

// ── 特性徽章浮层 ──
// anchor: 被点击的 span 元素；tipJson: JSON 字符串 { name, rarity, desc, effect, color }
window.showTraitTooltip = function(anchor, tipJson) {
    // 移除上一个浮层
    var old = document.getElementById('trait-tooltip');
    if (old) { old.remove(); if (old._anchor === anchor) return; } // 再次点击同一徽章则关闭

    var data;
    try { data = JSON.parse(tipJson); } catch(e) { return; }

    var rarityLabel = { common:'普通', uncommon:'稀有', rare:'珍贵', epic:'史诗', legendary:'传说' };
    var rarityBg    = { common:'#30363d', uncommon:'#1a3a1a', rare:'#1a2840', epic:'#2a1a3a', legendary:'#3a2a00' };

    var tip = document.createElement('div');
    tip.id = 'trait-tooltip';
    tip._anchor = anchor;
    tip.style.cssText = [
        'position:fixed',
        'z-index:9998',
        'min-width:180px',
        'max-width:260px',
        'background:' + (rarityBg[data.rarity] || '#21262d'),
        'border:1.5px solid ' + data.color,
        'border-radius:10px',
        'padding:12px 14px',
        'box-shadow:0 6px 24px rgba(0,0,0,.65)',
        'font-size:13px',
        'line-height:1.6',
        'pointer-events:auto'
    ].join(';');

    tip.innerHTML =
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
            '<strong style="color:' + data.color + ';font-size:14px;">' + data.name + '</strong>' +
            '<span style="font-size:10px;background:' + data.color + '33;color:' + data.color + ';padding:1px 6px;border-radius:8px;border:1px solid ' + data.color + ';">' + (rarityLabel[data.rarity] || data.rarity) + '</span>' +
        '</div>' +
        (data.desc ? '<div style="color:#c9d1d9;margin-bottom:' + (data.effect ? '8px' : '0') + ';">' + data.desc + '</div>' : '') +
        (data.effect ? '<div style="font-size:12px;color:#8b949e;border-top:1px solid #30363d;padding-top:6px;">📊 ' + data.effect + '</div>' : '');

    document.body.appendChild(tip);

    // 定位（优先显示在锚点下方，超出屏幕则翻到上方）
    var rect = anchor.getBoundingClientRect();
    var tw = tip.offsetWidth  || 220;
    var th = tip.offsetHeight || 100;
    var left = Math.min(rect.left, window.innerWidth - tw - 10);
    left = Math.max(8, left);
    var top  = rect.bottom + 6;
    if (top + th > window.innerHeight - 10) top = rect.top - th - 6;
    tip.style.left = left + 'px';
    tip.style.top  = top  + 'px';

    // 点击其他区域关闭
    function onOutsideClick(e) {
        if (!tip.contains(e.target) && e.target !== anchor) {
            tip.remove();
            document.removeEventListener('click', onOutsideClick, true);
        }
    }
    setTimeout(function() {
        document.addEventListener('click', onOutsideClick, true);
    }, 0);
};

// 事件面板
window.showEventPanel = function(event) {
    var oldEvent = document.querySelector('.event-panel');
    if (oldEvent) oldEvent.remove();
    
    var eventPanel = document.createElement('div');
    eventPanel.className = 'event-panel';
    
    eventPanel.innerHTML = `
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
        <div class="event-choices">
            ${event.choices.map(function(choice, index) {
                var canAfford = !choice.cost || Object.keys(choice.cost).every(function(r) {
                    return gameState[r] >= choice.cost[r];
                });
                
                return `
                    <button class="btn ${index === 0 ? 'btn-primary' : 'btn-warning'}" 
                            onclick="handleEventChoice(${index}, ${JSON.stringify(event).replace(/"/g, '&quot;')})"
                            ${!canAfford ? 'disabled' : ''}>
                        ${choice.text}
                    </button>
                `;
            }).join('')}
        </div>
    `;
    
    document.body.appendChild(eventPanel);
    
    setTimeout(function() {
        if (eventPanel.parentNode) {
            eventPanel.remove();
        }
    }, 30000);
};

window.handleEventChoice = function(choiceIndex, event) {
    var choice = event.choices[choiceIndex];
    
    if (choice.cost) {
        Object.keys(choice.cost).forEach(function(resource) {
            gameState[resource] -= choice.cost[resource];
        });
    }
    
    if (choice.effect) {
        choice.effect();
    }
    
    var eventPanel = document.querySelector('.event-panel');
    if (eventPanel) eventPanel.remove();
    
    updateResources();
};

// 招募功能已替换为「探索捕获」系统
// showRecruitModal → 重定向到探索标签页，保留函数名以兼容旧存档逻辑
window.showRecruitModal = function() {
    closeModal();
    switchTab('exploration');
    showNotification('🗺 通过探索各区域来捕获野生怪兽吧！', 'info');
};

// recruitMonster 保留但禁用（探索系统替代）
window.recruitMonster = function(typeId, cost) {
    showNotification('招募功能已移除，请通过「探索」捕获怪兽！', 'info');
    switchTab('exploration');
};

// 触发随机事件（调用utils中的triggerRandomEvent，已在main中引用）
window.triggerRandomEvent = function(category) {
    var eventPool = randomEvents[category] || [];
    
    if (eventPool.length === 0) {
        eventPool = randomEvents.general;
    }
    
    var event = eventPool[Math.floor(Math.random() * eventPool.length)];
    
    showEventPanel(event);
};

// 切换标签页
window.switchTab = function(tabName) {
    // 更新桌面端标签按钮
    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    // 尝试获取点击的标签，如果不存在则使用第一个匹配的标签
    var clickedTab = event && event.target ? event.target : document.querySelector('.tab[onclick*="' + tabName + '"]');
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // 更新移动端底部导航按钮
    document.querySelectorAll('.bottom-nav-item').forEach(function(item) {
        item.classList.remove('active');
    });
    var mobileNavItem = document.querySelector('.bottom-nav-item[data-tab="' + tabName + '"]');
    if (mobileNavItem) {
        mobileNavItem.classList.add('active');
    }

    // 更新横屏左侧导航高亮
    document.querySelectorAll('.lsc-nav-btn[id^="lsc-btn-"]').forEach(function(btn) {
        btn.classList.remove('active');
    });
    var lscBtn = document.getElementById('lsc-btn-' + tabName);
    if (lscBtn) lscBtn.classList.add('active');
    
    // 更新内容
    document.querySelectorAll('.tab-content').forEach(function(content) {
        content.classList.remove('active');
    });
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 刷新对应内容
    switch(tabName) {
        case 'farm':
            renderFarm();
            break;
        case 'monsters':
            renderMonsters();
            break;
        case 'exploration':
            renderExploration();
            break;
        case 'breeding':
            renderBreeding();
            break;
        case 'tech':
            renderTech();
            break;
        case 'disposal':
            renderDisposal();
            break;
    }
    
    // 初始化移动端导航图标
    initMobileNavIcons();
};

// 初始化移动端导航图标
function initMobileNavIcons() {
    // 图标类型映射（保证移动端与PC端完全一致）
    var iconMap = {
        farm:        'plant',
        exploration: 'explore',
        monsters:    'wisp',
        breeding:    'heart',
        tech:        'research',
        disposal:    'recycle'
    };

    // 移动端底部导航图标
    Object.keys(iconMap).forEach(function(key) {
        var el = document.getElementById(key + 'NavIcon');
        if (el) el.innerHTML = createSVG(iconMap[key], 24);
    });

    // PC 端顶部 Tab 图标（排除 monsters，PC 端无此 Tab）
    var pcTabs = ['farm', 'exploration', 'breeding', 'tech', 'disposal'];
    pcTabs.forEach(function(key) {
        var el = document.getElementById(key + 'TabIcon');
        if (el) el.innerHTML = createSVG(iconMap[key], 18);
    });

    // 横屏左侧导航图标（lsc-nav）
    var lscIconMap = Object.assign({}, iconMap, { settings: 'settings' });
    var lscKeys = ['farm', 'exploration', 'breeding', 'monsters', 'tech', 'disposal', 'settings'];
    lscKeys.forEach(function(key) {
        var el = document.getElementById('lsc' + key.charAt(0).toUpperCase() + key.slice(1) + 'Icon');
        if (el) el.innerHTML = createSVG(lscIconMap[key] || key, 22);
    });
}

// 侧边栏切换（用于平板端）
window.toggleSidebar = function() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
};

// autoHarvestAll 和 autoPlantAll 由 farm.js 提供，此处不重复定义

// 怪兽详情弹窗 - 独立的怪兽操作界面
window.showMonsterDetailModal = function(monsterId) {
    var monster = gameState.monsters.find(function(m) { return m.id === monsterId; });
    if (!monster) return;

    // ── 引导钩子：Step2 点击怪兽卡片 → Step3 assign_farm ──
    if (typeof onTutorialMonsterSelected === 'function') onTutorialMonsterSelected();
    
    var typeData = monsterTypes[monster.type];
    var isWorking = monster.status !== 'idle';
    var statusText = getStatusText(monster.status);
    var isStarred  = !!monster.starred;
    var _rarityColorMap = { common:'#8b949e', uncommon:'#2196f3', rare:'#ff9800', epic:'#9c27b0', legendary:'#ffd700' };
    var _nameColor = _rarityColorMap[typeData ? typeData.rarity : 'common'] || '#e6edf3';

    var modalContent = `
        <div class="modal-header" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            ${createSVG(monster.type, 32)}
            <span id="mdl_name_${monster.id}" style="flex:1;font-weight:700;font-size:16px;cursor:pointer;border-bottom:1px dashed #444;padding-bottom:1px;color:${_nameColor};"
                title="点击重命名" onclick="window._promptRename(${monster.id})">${monster.name}</span>
            <button onclick="window.toggleMonsterStar(${monster.id})" title="${isStarred ? '取消星标' : '添加星标'}"
                style="background:none;border:none;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;opacity:${isStarred ? '1' : '0.35'};transition:opacity 0.15s;"
                onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='${isStarred ? '1' : '0.35'}'">⭐</button>
            <button onclick="window._promptRename(${monster.id})" title="重命名"
                style="background:none;border:1px solid #30363d;border-radius:5px;color:#8b949e;font-size:11px;cursor:pointer;padding:2px 8px;">✏️ 改名</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div class="monster-detail-section">
                <h4>基础信息</h4>
                <div class="monster-info-text">
                    <div><strong>类型：</strong> ${typeData.name}</div>
                    <div><strong>等级：</strong> ${monster.level}</div>
                    <div><strong>世代：</strong> ${monster.generation}</div>
                    <div><strong>经验：</strong> ${monster.exp}/${monster.maxExp}</div>
                    <div><strong>状态：</strong> <span class="${isWorking ? 'status-working' : 'status-idle'}">${isWorking ? statusText : T('idle','monsterStatus')}</span></div>
                </div>
            </div>
            
            <div class="monster-detail-section">
                <h4>属性值</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                    <div class="monster-stat-item">
                        <span>力量</span>
                        <span class="monster-stat-value">${monster.stats.strength}</span>
                    </div>
                    <div class="monster-stat-item">
                        <span>敏捷</span>
                        <span class="monster-stat-value">${monster.stats.agility}</span>
                    </div>
                    <div class="monster-stat-item">
                        <span>智力</span>
                        <span class="monster-stat-value">${monster.stats.intelligence}</span>
                    </div>
                    <div class="monster-stat-item">
                        <span>耕作</span>
                        <span class="monster-stat-value">${monster.stats.farming}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="monster-detail-section">
            <h4 style="display:flex;align-items:center;gap:6px;">特殊能力
                <span style="font-size:11px;color:#8b949e;font-weight:400;">点击徽章查看效果</span>
            </h4>
            <div class="monster-traits">
                ${monster.traits.length > 0 ? 
                    monster.traits.map(function(trait) {
                        var _rc = { common:'#8b949e', uncommon:'#3fb950', rare:'#58a6ff', epic:'#a371f7', legendary:'#f0c53d' };
                        var _tc = _rc[trait.rarity] || '#8b949e';
                        // 解析 effect 为可读文字
                        var effectParts = [];
                        var e = trait.effect || {};
                        var statNameMap = { strength:'力量', agility:'敏捷', intelligence:'智力', farming:'耕作', luck:'幸运' };
                        Object.keys(e).forEach(function(k) {
                            var v = e[k];
                            if (statNameMap[k]) { effectParts.push(statNameMap[k] + (v > 0 ? '+' : '') + v); return; }
                            if (k === 'materialBonus')   { effectParts.push('材料+' + Math.round(v*100) + '%'); return; }
                            if (k === 'coinBonus')       { effectParts.push('金币+' + Math.round(v*100) + '%'); return; }
                            if (k === 'researchBonus')   { effectParts.push('研究+' + Math.round(v*100) + '%'); return; }
                            if (k === 'farmYield')       { effectParts.push('农场产量+' + Math.round(v*100) + '%'); return; }
                            if (k === 'harvestCoinBonus'){ effectParts.push('收获金币+' + Math.round(v*100) + '%'); return; }
                            if (k === 'noFatigue')       { v && effectParts.push('探索不积疲劳'); return; }
                            if (k === 'defeatImmune')    { v && effectParts.push('免疫战败惩罚'); return; }
                            if (k === 'parasitic')       { v && effectParts.push('寄生偷食'); return; }
                        });
                        var effectText = effectParts.length ? effectParts.join(' · ') : '';
                        // 构建 onclick tooltip 弹窗（用 showTraitTooltip 全局函数）
                        // 将数据存入 dataset，避免 HTML 属性内 JSON 引号转义问题
                        var tipData = JSON.stringify({ name: trait.name, rarity: trait.rarity, desc: trait.desc || '', effect: effectText, color: _tc });
                        var encodedData = encodeURIComponent(tipData);
                        return '<span class="monster-trait-tag" style="cursor:pointer;border-color:' + _tc + ';color:' + _tc + ';background:' + _tc + '22;" ' +
                            'data-trait="' + encodedData + '" ' +
                            'onclick="event.stopPropagation();showTraitTooltip(this,decodeURIComponent(this.dataset.trait))" ' +
                            'title="' + (trait.desc || trait.name) + '">' + trait.name + '</span>';
                    }).join('') : 
                    '<span style="color:#8b949e;font-size:12px;">无特殊能力</span>'
                }
            </div>
        </div>

        ${(function() {
            // ── 变异词条展示 ──
            if (!monster.mutation) return '';
            var m = monster.mutation;
            var rarityColor = { common:'#8b949e', uncommon:'#3fb950', rare:'#58a6ff', epic:'#a371f7', legendary:'#f0c53d' };
            var c = rarityColor[m.rarity] || '#8b949e';
            var rarityLabel = { common:'普通', uncommon:'稀有', rare:'珍贵', epic:'史诗', legendary:'传说' };
            return '<div class="monster-detail-section" style="margin-bottom:8px;">' +
                '<h4 style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">' +
                    '<span>✨ 变异词条</span>' +
                    '<span style="background:' + c + '33;color:' + c + ';font-size:10px;padding:1px 7px;border-radius:10px;border:1px solid ' + c + ';">' + (rarityLabel[m.rarity]||m.rarity) + '</span>' +
                '</h4>' +
                '<div style="background:#161b22;border:1px solid ' + c + '44;border-radius:8px;padding:10px 12px;">' +
                    '<div style="font-size:16px;margin-bottom:4px;">' + (m.icon||'✨') + ' <strong style="color:' + c + ';">' + m.name + '</strong></div>' +
                    '<div style="font-size:12px;color:#e6edf3;margin-bottom:5px;">' + m.desc + '</div>' +
                    '<div style="font-size:11px;color:#8b949e;font-style:italic;">' + (m.flavor||'') + '</div>' +
                    (m.feedMult !== 1.0 ? '<div style="font-size:11px;margin-top:5px;color:' + (m.feedMult < 1 ? '#46d164' : '#f85149') + ';">🍎 食物消耗 ×' + m.feedMult.toFixed(2) + '</div>' : '') +
                    (m.maintMult !== 1.0 ? '<div style="font-size:11px;color:' + (m.maintMult < 1 ? '#46d164' : '#f85149') + ';">💰 维护费 ×' + m.maintMult.toFixed(2) + '</div>' : '') +
                '</div>' +
            '</div>';
        })()}

        ${(function() {
            // ── 疲劳值 & 战败惩罚 ──
            var fatigue = Math.round((monster.fatigue || 0));
            var fatigueColor = fatigue >= 80 ? '#f85149' : fatigue >= 50 ? '#f0c53d' : '#46d164';
            var fatigueLabel = fatigue >= 80 ? '严重过劳' : fatigue >= 50 ? '疲惫' : fatigue >= 20 ? '轻微疲惫' : '精力充沛';
            var debuff = monster.defeatDebuff;
            var debuffHtml = '';
            if (debuff) {
                var remainMin = Math.ceil((debuff.until - Date.now()) / 60000);
                debuffHtml = '<div style="margin-top:8px;background:#2d1b1b;border:1px solid #f8514955;border-radius:6px;padding:7px 10px;font-size:11px;color:#f85149;">⚔️ 战败惩罚：' + debuff.stat + ' -' + debuff.penalty + '（剩余约 ' + Math.max(0, remainMin) + ' 分钟）</div>';
            }
            return '<div class="monster-detail-section" style="margin-bottom:8px;">' +
                '<h4 style="margin-bottom:8px;">💤 体力状态</h4>' +
                '<div style="background:#161b22;border-radius:8px;padding:10px 12px;">' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">' +
                        '<span style="font-size:12px;color:#8b949e;">疲劳度</span>' +
                        '<span style="font-size:12px;color:' + fatigueColor + ';">' + fatigueLabel + ' (' + fatigue + '%)</span>' +
                    '</div>' +
                    '<div style="background:#21262d;border-radius:4px;height:6px;overflow:hidden;">' +
                        '<div style="width:' + fatigue + '%;height:100%;background:' + fatigueColor + ';border-radius:4px;transition:width .3s;"></div>' +
                    '</div>' +
                    (fatigue >= 50 ? '<div style="font-size:10px;color:#8b949e;margin-top:4px;">效率 -' + Math.round(fatigue / 2) + '%（撤回休息可恢复）</div>' : '') +
                '</div>' +
                debuffHtml +
            '</div>';
        })()}

        ${(function(){
            var bondVal = (typeof AffinitySystem !== 'undefined') ? AffinitySystem.getPlayerBond(monsterId) : 0;
            var bondTag = (typeof AffinitySystem !== 'undefined') ? AffinitySystem.getPlayerBondTag(bondVal) : '—';
            var bondPct = Math.round((bondVal + 100) / 2);
            var bondColor = bondVal >= 50 ? '#f0c53d' : bondVal >= 20 ? '#58a6ff' : bondVal >= 0 ? '#8b949e' : '#f85149';
            var pairList = [];
            if (typeof AffinitySystem !== 'undefined') {
                (gameState.monsters || []).forEach(function(m){
                    if (m.id === monsterId) return;
                    var v = AffinitySystem.getPair(monsterId, m.id);
                    if (v !== 0) pairList.push({ name: m.name, val: v, tag: AffinitySystem.getPairTag(v) });
                });
            }
            pairList.sort(function(a,b){ return b.val - a.val; });
            var pairsHtml = pairList.length
                ? pairList.map(function(r){
                    var c = r.val >= 60 ? '#46d164' : r.val >= 0 ? '#8b949e' : '#f85149';
                    return '<span style="background:#161b22;border:1px solid '+c+';border-radius:12px;padding:2px 8px;font-size:11px;color:'+c+';">'+r.name+'·'+r.tag+'</span>';
                  }).join('')
                : '<span style="color:#8b949e;font-size:11px;">尚未与其他怪兽建立关系</span>';
            return '<div class="monster-detail-section" style="margin-bottom:8px;">'+
                '<h4 style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'+
                    '<span>🤝 羁绊与关系</span>'+
                '</h4>'+
                '<div style="background:#21262d;border-radius:8px;padding:8px 10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">'+
                    '<span style="font-size:18px;">💛</span>'+
                    '<div style="flex:1;">'+
                        '<div style="font-size:11px;color:#8b949e;">对你的羁绊：<strong style="color:'+bondColor+';">'+bondTag+'</strong></div>'+
                        '<div style="background:#161b22;border-radius:4px;height:4px;margin-top:4px;overflow:hidden;">'+
                            '<div style="width:'+bondPct+'%;height:100%;background:'+bondColor+';transition:width .3s;border-radius:4px;"></div>'+
                        '</div>'+
                    '</div>'+
                    '<span style="font-size:16px;font-weight:700;color:'+bondColor+';">'+bondVal+'</span>'+
                '</div>'+
                '<div style="display:flex;flex-wrap:wrap;gap:5px;">'+pairsHtml+'</div>'+
            '</div>';
        })()}
        
        <div class="modal-buttons">
            ${!isWorking ? `
                <button class="btn btn-primary" onclick="closeModal(); showAssignPlotPicker(${monster.id});">
                    ${createSVG('plant', 16)} 派驻农田
                </button>
                <button class="btn btn-warning" onclick="closeModal(); showZoneDispatchPicker(${monster.id});">
                    ${createSVG('explore', 16)} 派去探索
                </button>
                <button class="btn btn-danger" onclick="selectMonster(${monster.id}); switchTab('disposal'); closeModal();">
                    ${createSVG('trash', 16)} 处理怪兽
                </button>
            ` : `
                <button class="btn btn-warning" onclick="recallMonster(${monster.id}); closeModal();">
                    ${createSVG('work', 16)} 召回怪兽
                </button>
            `}
            <button class="btn btn-success" onclick="selectMonster(${monster.id}); closeModal();">
                ${createSVG('check', 16)} 选中
            </button>
            <button class="btn btn-secondary" onclick="closeModal(); showLineageModal(${monster.id});">
                🧬 系谱
            </button>
            <button class="btn btn-secondary" onclick="showMonsterLogModal(${monster.id});"
                style="border-color:#e040fb;color:#e040fb;">
                📜 履历
            </button>
            <button class="btn btn-primary" onclick="closeModal()">
                关闭
            </button>
        </div>
    `;
    
    showModal(modalContent);
};

// ── 星标切换 ──
window.toggleMonsterStar = function(monsterId) {
    var monster = gameState.monsters.find(function(m){ return m.id === monsterId; });
    if (!monster) return;
    monster.starred = !monster.starred;
    if (typeof autoSave === 'function') autoSave();
    if (typeof renderMonsterSidebar === 'function') renderMonsterSidebar();
    // 重新打开详情弹窗以刷新星标按钮状态
    showMonsterDetailModal(monsterId);
};

// ── 重命名弹窗 ──
window._promptRename = function(monsterId) {
    var monster = gameState.monsters.find(function(m){ return m.id === monsterId; });
    if (!monster) return;
    var newName = window.prompt('请输入新名字（最长20字符）：', monster.name);
    if (newName === null) return; // 取消
    newName = newName.trim().slice(0, 20);
    if (!newName) { showNotification('名字不能为空！', 'warning'); return; }
    if (newName === monster.name) return;
    monster.name = newName;
    if (typeof autoSave === 'function') autoSave();
    if (typeof renderMonsterSidebar === 'function') renderMonsterSidebar();
    showMonsterDetailModal(monsterId); // 刷新弹窗
    showNotification('✏️ 已重命名为 ' + newName, 'success');
};

// 获取怪兽状态文本（已接入 i18n）
window.getStatusText = function(status) {
    return T(status, 'monsterStatus') || T('unknown', 'common');
};

// 快速操作：派遣怪兽去耕作
window.assignMonsterToFarm = function(monsterId) {
    var monster = gameState.monsters.find(function(m) { return m.id === monsterId; });
    if (!monster || monster.status !== 'idle') {
        showNotification('该怪兽不可用！', 'warning');
        return;
    }
    
    // 找到空闲的农田
    var availablePlot = gameState.plots.find(function(plot) {
        return !plot.locked && plot.crop && !plot.assignedMonster && plot.progress < 100;
    });
    
    if (!availablePlot) {
        showNotification('没有需要照看的作物！', 'warning');
        return;
    }
    
    // 分配怪兽到农田
    availablePlot.assignedMonster = monster;
    monster.status = 'farming';
    monster.assignment = 'plot-' + availablePlot.id;
    
    // 派遣操作静默：UI 颜色/状态已体现
    updateResources();
    renderFarm();
};

// 快速操作：召回怪兽（通用，支持农田 / 探索区域）
window.recallMonster = function(monsterId) {
    var monster = gameState.monsters.find(function(m) { return m.id === monsterId; });
    if (!monster || monster.status === 'idle') return;

    // 从农田召回
    if (monster.status === 'farming') {
        var plot = gameState.plots.find(function(p) {
            return p.assignedMonster && p.assignedMonster.id === monster.id;
        });
        if (plot) plot.assignedMonster = null;
    }

    // 从探索区域召回（exploring / preparing 均通过 zoneStates 管理）
    if (monster.status === 'exploring' || monster.status === 'preparing') {
        if (gameState.zoneStates && typeof recallMonsterFromZone === 'function') {
            // 找出怪兽所在的区域
            Object.keys(gameState.zoneStates).forEach(function(zid) {
                var zs = gameState.zoneStates[zid];
                if (!zs || !zs.assignedMonsterIds) return;
                var idx = zs.assignedMonsterIds.indexOf(monsterId);
                if (idx !== -1) recallMonsterFromZone(zid, monsterId);
            });
            return; // recallMonsterFromZone 已处理 status 重置和渲染
        }
    }

    monster.status = 'idle';
    monster.assignment = null;

    // 召回操作静默：侧边栏状态即时体现
    updateResources();
    renderFarm();
    renderExploration();
};

// ==================== 移动端检测工具 ====================
function isMobile() {
    return window.innerWidth <= 767;
}

// ==================== 移动端资源详情面板 ====================
window.showMobileResourcePanel = function() {
    var html = '<div class="modal-header">📊 资源状况</div>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">';
    var list = [
        { key: 'coins',     label: '金币',   icon: 'coin',     val: gameState.coins },
        { key: 'food',      label: '食物',   icon: 'food',     val: gameState.food },
        { key: 'materials', label: '材料',   icon: 'material', val: gameState.materials },
        { key: 'research',  label: '研究点', icon: 'research', val: gameState.research },
        { key: 'energy',    label: '能量',   icon: 'energy',   val: gameState.energy + '/' + gameState.maxEnergy }
    ];
    list.forEach(function(r) {
        html += '<div style="display:flex;align-items:center;gap:10px;background:#21262d;border:1px solid #30363d;border-radius:8px;padding:10px 14px;" ' +
            'onclick="closeModal();toggleResourceDetail(\'' + r.key + '\');switchTab(\'farm\');">' +
            '<span style="width:24px;height:24px;display:flex;align-items:center;justify-content:center;">' + createSVG(r.icon, 22) + '</span>' +
            '<span style="flex:1;font-size:14px;">' + r.label + '</span>' +
            '<span style="font-size:15px;font-weight:700;color:#58a6ff;">' + r.val + '</span>' +
            '<span style="color:#8b949e;font-size:13px;">▾</span>' +
            '</div>';
    });
    html += '</div>' +
        '<div style="font-size:12px;color:#8b949e;text-align:center;margin-bottom:16px;">点击资源可查看详细说明（在农场页面左侧栏查看）</div>' +
        '<div class="modal-buttons"><button class="btn btn-primary" onclick="closeModal()">关闭</button></div>';
    showModal(html);
};

// ==================== 设置弹窗（含字体大小）====================
window.showSettingsModal = function() {
    var cur = localStorage.getItem('mf_font_size') || 'medium';
    // 使用 i18n 翻译（兼容未加载 i18n.js 的情况）
    var _t = function(k, cat) { return (typeof i18n !== 'undefined') ? i18n.t(k, cat) : k; };
    var curLang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';

    var sizes = [
        { key: 'small',  label: _t('fontSmall','settings'),  desc: _t('fontSmallDesc','settings') },
        { key: 'medium', label: _t('fontMedium','settings'), desc: _t('fontMediumDesc','settings') },
        { key: 'large',  label: _t('fontLarge','settings'),  desc: _t('fontLargeDesc','settings') },
        { key: 'xlarge', label: _t('fontXLarge','settings'), desc: _t('fontXLargeDesc','settings') }
    ];

    // ── 语言选项 ──
    var langs = [
        { key: 'zh', label: '中文' },
        { key: 'en', label: 'English' },
        { key: 'ja', label: '日本語' }
    ];

    var html = '<div class="modal-header">' + _t('title','settings') + '</div>' +
        '<div style="padding:4px 0;">' +

        // 统计数据
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">' + _t('stats','settings') + '</h3>' +
        '<div style="background:#21262d;padding:12px 15px;border-radius:8px;font-size:13px;' +
            'display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
        '<div>' + _t('totalHarvests','settings') + '：<strong style="color:#46d164;">' + (window.gameState ? window.gameState.totalHarvests : 0) + '</strong></div>' +
        '<div>' + _t('totalExplorations','settings') + '：<strong style="color:#58a6ff;">' + (window.gameState ? window.gameState.totalExplorations : 0) + '</strong></div>' +
        '<div>' + _t('monstersBreed','settings') + '：<strong style="color:#f0c53d;">' + (window.gameState ? (window.gameState.monstersBreed || 0) : 0) + '</strong></div>' +
        '<div>' + _t('monsterCount','settings') + '：<strong style="color:#e6edf3;">' + (window.gameState ? window.gameState.monsters.length : 0) + '</strong></div>' +
        '</div></div>' +

        // 字体大小
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">' + _t('fontSize','settings') + '</h3>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
    sizes.forEach(function(s) {
        var active = cur === s.key;
        html += '<div onclick="applyFontSize(\'' + s.key + '\')" ' +
            'class="font-size-opt' + (active ? ' active' : '') + '" ' +
            'data-size="' + s.key + '">' +
            '<div class="fs-label">' + s.label + '</div>' +
            '<div class="fs-desc">' + s.desc + '</div>' +
            '</div>';
    });
    html += '</div></div>' +

        // 语言选择
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">' + _t('language','settings') + '</h3>' +
        '<div style="display:flex;gap:8px;">';
    langs.forEach(function(l) {
        var active = curLang === l.key;
        html += '<div onclick="window._settingsSetLang(\'' + l.key + '\')" ' +
            'class="lang-opt" data-lang="' + l.key + '" ' +
            'style="flex:1;padding:9px 6px;background:' + (active ? '#1a3a1a' : '#21262d') + ';border:2px solid ' + (active ? '#46d164' : '#30363d') + ';' +
            'border-radius:8px;text-align:center;cursor:pointer;transition:all 0.15s;font-size:13px;font-weight:' + (active ? '700' : '400') + ';">' +
            l.label + '</div>';
    });
    html += '</div></div>' +

        // 存档操作（仅导入导出，保存/召回已在左侧快捷栏）
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">' + _t('save','settings') + '</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
        '<button class="btn btn-warning" style="background:#9a6700;border-color:#9a6700;" onclick="window._settingsExportSave();">' + _t('exportBtn','settings') + '</button>' +
        '<button class="btn btn-secondary" style="border-color:#58a6ff;color:#58a6ff;" onclick="window._settingsImportSave();">' + _t('importBtn','settings') + '</button>' +
        '</div></div>' +

        // 云账号
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">☁️ 云账号 & 跨设备存档</h3>' +
        '<div id="authSection">' + (typeof _buildLoggedInUI !== 'undefined' && typeof getCurrentUser === 'function' && getCurrentUser() ? '' : '') + '</div>' +
        '</div>' +

        // 数字格式
        (typeof renderNumFormatSetting === 'function' ? (function() {
            return '<div style="margin-bottom:14px;">' +
            '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">🔢 数字显示格式</h3>' +
            renderNumFormatSetting() +
            '</div>';
        })() : '') +

        // 界面选项
        (function() {
            var floatOn = localStorage.getItem('mf_float_btn') !== 'off';
            return '<div style="margin-bottom:14px;">' +
            '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">🖥 界面选项</h3>' +
            '<div style="background:#21262d;padding:12px 15px;border-radius:8px;">' +
            '<label style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;">' +
                '<div>' +
                    '<div style="font-size:13px;color:#e6edf3;font-weight:600;">悬浮设置球</div>' +
                    '<div style="font-size:11px;color:#8b949e;margin-top:2px;">屏幕右下角的可拖拽快捷入口</div>' +
                '</div>' +
                '<div class="settings-toggle' + (floatOn ? ' on' : '') + '" id="floatBtnToggle" ' +
                    'onclick="window._toggleFloatBtn(this)" ' +
                    'style="width:40px;height:22px;border-radius:11px;background:' + (floatOn ? '#46d164' : '#30363d') + ';' +
                    'position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;">' +
                    '<div style="position:absolute;top:3px;' + (floatOn ? 'right:3px' : 'left:3px') + ';' +
                    'width:16px;height:16px;border-radius:50%;background:#fff;transition:all 0.2s;"></div>' +
                '</div>' +
            '</label>' +
            '</div></div>';
        })() +

        // 快捷键
        '<div style="margin-bottom:14px;">' +
        '<h3 style="margin-bottom:8px;font-size:13px;color:#8b949e;letter-spacing:.05em;">' + _t('shortcuts','settings') + '</h3>' +
        '<div style="background:#21262d;padding:12px 15px;border-radius:8px;font-size:12px;' +
            'color:#8b949e;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;">' +
        '<div><kbd style="background:#30363d;padding:1px 5px;border-radius:3px;">1~5</kbd> ' + _t('shortcut15','settings') + '</div>' +
        '<div><kbd style="background:#30363d;padding:1px 5px;border-radius:3px;">Ctrl+S</kbd> ' + _t('shortcutCtrlS','settings') + '</div>' +
        '<div><kbd style="background:#30363d;padding:1px 5px;border-radius:3px;">Esc</kbd> ' + _t('shortcutEsc','settings') + '</div>' +
        '</div></div>' +

        '</div>' + // end padding wrapper

        // 底部按钮行（教程/更新日志已移至左侧快捷栏）
        '<div class="modal-buttons">' +
        '<button class="btn btn-danger" onclick="if(typeof resetGame===\'function\')resetGame();">' + _t('resetBtn','settings') + '</button>' +
        '<button class="btn btn-primary" onclick="closeModal()">' + _t('closeBtn','settings') + '</button>' +
        '</div>' +

        // 隐藏版本号（长按2秒进入GM面板）
        '<div id="gmVersionHint" ' +
            'style="text-align:center;margin-top:8px;font-size:10px;color:#30363d;cursor:default;user-select:none;letter-spacing:0.3px;">' +
            'v0.9.5' +
        '</div>';

    showModal(html);
    // 填充账号登录区（auth.js 提供）
    setTimeout(function() {
        if (typeof refreshAuthUI === 'function') refreshAuthUI();
    }, 0);
    // 为版本号注册 GM 入口事件：
    //   · 已验证 → 单击直接打开
    //   · 未验证 → 长按2秒激活
    setTimeout(function() {
        var hint = document.getElementById('gmVersionHint');
        if (!hint) return;

        // 判断是否已通过验证（sessionStorage）
        var authed = false;
        try { authed = sessionStorage.getItem('mf_gm_auth') === '1'; } catch(e) {}

        if (authed) {
            // 已验证：直接点击/触碰打开，并更新样式提示
            hint.style.color = '#f0c53d';
            hint.style.cursor = 'pointer';
            hint.title = 'GM面板';
            function openGM(e) {
                e.stopPropagation();
                closeModal();
                if (typeof window.openGMPanel === 'function') window.openGMPanel();
            }
            hint.addEventListener('click', openGM);
            hint.addEventListener('touchend', openGM, { passive: true });
        } else {
            // 未验证：长按2秒激活
            var _pressTimer = null;
            function startPress() {
                hint.style.color = '#58a6ff';
                _pressTimer = setTimeout(function() {
                    hint.style.color = '#f0c53d';
                    setTimeout(function() {
                        closeModal();
                        if (typeof window.openGMPanel === 'function') window.openGMPanel();
                    }, 200);
                }, 2000);
            }
            function cancelPress() {
                if (_pressTimer) { clearTimeout(_pressTimer); _pressTimer = null; }
                hint.style.color = '#30363d';
            }
            hint.addEventListener('mousedown', startPress);
            hint.addEventListener('touchstart', startPress, { passive: true });
            hint.addEventListener('mouseup', cancelPress);
            hint.addEventListener('mouseleave', cancelPress);
            hint.addEventListener('touchend', cancelPress);
            hint.addEventListener('touchcancel', cancelPress);
        }
    }, 100);
};

// 切换语言并重新渲染设置面板
window._settingsSetLang = function(lang) {
    if (typeof i18n === 'undefined') return;
    i18n.setLang(lang);
    // 更新语言按钮样式（无需重开整个 modal，只更新 lang-opt 样式）
    document.querySelectorAll('.lang-opt').forEach(function(el) {
        var isActive = el.getAttribute('data-lang') === lang;
        el.style.background    = isActive ? '#1a3a1a' : '#21262d';
        el.style.borderColor   = isActive ? '#46d164' : '#30363d';
        el.style.fontWeight    = isActive ? '700' : '400';
    });
    // 重新渲染设置面板以刷新其他翻译文字
    closeModal();
    setTimeout(showSettingsModal, 80);
};

// 应用字体大小（全局 CSS 变量方案，移动端同步生效）
window.applyFontSize = function(size) {
    var sizeMap = { small: '12px', medium: '14px', large: '16px', xlarge: '18px' };
    var px = sizeMap[size] || '14px';
    // 1. 修改 CSS 自定义变量，所有使用 rem/em 的元素自动跟随
    document.documentElement.style.setProperty('--base-fs', px);
    // 2. 同步设置 html / body 字号（兜底，覆盖部分不用变量的场景）
    document.documentElement.style.fontSize = px;
    document.body.style.fontSize = px;
    // 3. 持久化
    try { localStorage.setItem('mf_font_size', size); } catch(e) {}
    // 4. 立即刷新设置面板内的字体选项按钮激活状态（无需重开面板）
    document.querySelectorAll('.font-size-opt').forEach(function(el) {
        var isActive = el.getAttribute('data-size') === size;
        if (isActive) { el.classList.add('active'); }
        else           { el.classList.remove('active'); }
    });
};

// ==================== 右侧怪兽侧边栏渲染（支持大/小卡布局切换）====================
window.renderMonsterSidebar = function() {
    var listEl = document.getElementById('monsterSidebarList');
    var footerEl = document.getElementById('monsterSidebarFooter');
    if (!listEl) return;

    var layout = getLayoutPref('monsters');

    // ── 工具栏注入到侧边栏 header ──
    var headerEl = document.querySelector('#monsterSidebar .monster-sidebar-header');
    if (headerEl && !document.getElementById('msb-layout-toolbar')) {
        var tbWrap = document.createElement('div');
        tbWrap.id = 'msb-layout-toolbar';
        tbWrap.style.cssText = 'padding:4px 10px 6px;border-bottom:1px solid #21262d;';
        tbWrap.innerHTML = renderLayoutToolbar('monsters', '', [], 'renderMonsterSidebar');
        headerEl.insertAdjacentElement('afterend', tbWrap);
    } else if (document.getElementById('msb-layout-toolbar')) {
        document.getElementById('msb-layout-toolbar').innerHTML =
            renderLayoutToolbar('monsters', '', [], 'renderMonsterSidebar');
    }

    if (gameState.monsters.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:30px 15px;color:#8b949e;font-size:12px;line-height:1.8;">' +
            '<div style="font-size:32px;margin-bottom:8px;">🐾</div>' +
            '<div>还没有怪兽</div><div style="margin-top:4px;">前往探索区域捕获野生怪兽！</div></div>';
        if (footerEl) footerEl.innerHTML = '';
        // 同步移动端
        var mobListEl2 = document.getElementById('mobileMonsterList');
        if (mobListEl2) mobListEl2.innerHTML = listEl.innerHTML;
        return;
    }

    var statusLabels = {
        'idle':      [T('idle','monsterStatus'),      'msb-status-idle'],
        'farming':   [T('farming','monsterStatus'),   'msb-status-farming'],
        'exploring': [T('exploring','monsterStatus'), 'msb-status-exploring'],
        'preparing': [T('preparing','monsterStatus'), 'msb-status-exploring'],
        'breeding':  [T('breeding','monsterStatus'),  'msb-status-breeding']
    };

    var cardsHtml;

    if (layout === 'compact') {
        // ────── 紧凑列表模式 ──────
        cardsHtml = '<div class="compact-list msb-compact">' +
            gameState.monsters.map(function(monster) {
                var sl = statusLabels[monster.status] || [monster.status, 'msb-status-idle'];
                var isWorking = monster.status !== 'idle';
                var statusColor = {
                    idle: '#8b949e', farming: '#46d164', exploring: '#f0c53d',
                    preparing: '#f0c53d', breeding: '#e040fb'
                }[monster.status] || '#8b949e';
                var expPct = Math.floor(monster.exp / monster.maxExp * 100);

                // 快捷操作
                var actionBtns = '';
                if (monster.status === 'idle') {
                    actionBtns = '<button class="compact-btn" onclick="event.stopPropagation();showAssignPlotPicker(' + monster.id + ')">🌾</button>' +
                        '<button class="compact-btn" onclick="event.stopPropagation();showZoneDispatchPicker(' + monster.id + ')">🗺</button>';
                } else {
                    actionBtns = '<button class="compact-btn danger" onclick="event.stopPropagation();recallMonster(' + monster.id + ')">召回</button>';
                }

                var _rcm = { common:'#8b949e', uncommon:'#2196f3', rare:'#ff9800', epic:'#9c27b0', legendary:'#ffd700' };
                var _mtd = monsterTypes[monster.type];
                var _nc = _rcm[_mtd ? _mtd.rarity : 'common'] || '#e6edf3';
                // 战败 & 疲劳徽章
                var badgeHtml = '';
                if (monster.defeatDebuff && monster.defeatDebuff.until > Date.now()) {
                    badgeHtml += '<span title="战败惩罚中" style="font-size:12px;margin-left:2px;">⚔️</span>';
                }
                var fatiguePct = Math.round(monster.fatigue || 0);
                var fatigueColor = fatiguePct >= 80 ? '#f85149' : fatiguePct >= 50 ? '#e0a02f' : '#46d164';
                if (fatiguePct > 0) {
                    badgeHtml += '<span title="疲劳:' + fatiguePct + '%" style="font-size:10px;color:' + fatigueColor + ';margin-left:2px;">😴' + fatiguePct + '%</span>';
                }
                return '<div class="compact-card monster ' + (monster.status || 'idle') + '" onclick="showMonsterDetailModal(' + monster.id + ')">' +
                    '<div style="width:28px;height:28px;flex-shrink:0;">' + createSVG(monster.type, 28) + '</div>' +
                    '<div style="display:flex;flex-direction:column;min-width:0;flex:1;gap:1px;">' +
                        '<span class="compact-name" style="color:' + _nc + ';">' + (monster.starred ? '<span style="color:#f0c53d;font-size:11px;">⭐</span>' : '') + monster.name + badgeHtml + '</span>' +
                        '<span class="compact-sub">Lv.' + monster.level + ' · 力' + monster.stats.strength + ' 耕' + monster.stats.farming + '</span>' +
                    '</div>' +
                    '<div style="width:28px;height:3px;background:#21262d;border-radius:2px;overflow:hidden;align-self:center;">' +
                        '<div style="height:100%;width:' + expPct + '%;background:#58a6ff;"></div>' +
                    '</div>' +
                    '<span style="font-size:11px;color:' + statusColor + ';min-width:36px;text-align:right;">' + sl[0] + '</span>' +
                    '<div class="compact-actions" onclick="event.stopPropagation();">' + actionBtns + '</div>' +
                    '</div>';
            }).join('') +
            '</div>';
    } else {
        // ────── 大卡模式（原有样式）──────
        cardsHtml = gameState.monsters.map(function(monster) {
            var sl = statusLabels[monster.status] || ['未知', 'msb-status-idle'];
            var statusCls = monster.status || 'idle';
            var assignInfo = '';
            if (monster.status === 'farming') {
                var farmPlot = gameState.plots.find(function(p) { return p.assignedMonster && p.assignedMonster.id === monster.id; });
                if (farmPlot) assignInfo = '<div style="font-size:12px;color:#46d164;margin-top:4px;">🌱 地块 #' + (farmPlot.id + 1) + (farmPlot.autoCrop ? ' · 自动' : '') + '</div>';
            } else if (monster.status === 'exploring' || monster.status === 'preparing') {
                assignInfo = '<div style="font-size:12px;color:#f0c53d;margin-top:4px;">🗺 探索队</div>';
            }

            var actionBtns = '';
            if (monster.status === 'idle') {
                actionBtns = '<button class="msb-action-btn msb-btn-assign" onclick="event.stopPropagation();closeModal&&closeModal();showAssignPlotPicker(' + monster.id + ')">派驻农田</button>';
            } else if (monster.status === 'farming') {
                var farmPlot2 = gameState.plots.find(function(p) { return p.assignedMonster && p.assignedMonster.id === monster.id; });
                var plotId = farmPlot2 ? farmPlot2.id : -1;
                actionBtns = plotId >= 0 ? '<button class="msb-action-btn msb-btn-recall" onclick="event.stopPropagation();removeMonsterFromPlot(' + plotId + ');renderMonsterSidebar();">撤回</button>' : '';
            } else {
                actionBtns = '<button class="msb-action-btn msb-btn-recall" onclick="event.stopPropagation();recallMonster(' + monster.id + ');">召回</button>';
            }

            var _rcm2 = { common:'#8b949e', uncommon:'#2196f3', rare:'#ff9800', epic:'#9c27b0', legendary:'#ffd700' };
            var _mtd2 = monsterTypes[monster.type];
            var _nc2 = _rcm2[_mtd2 ? _mtd2.rarity : 'common'] || '#e6edf3';
            // 战败 & 疲劳徽章（大卡）
            var _fatiguePct2 = Math.round(monster.fatigue || 0);
            var _fatigueColor2 = _fatiguePct2 >= 80 ? '#f85149' : _fatiguePct2 >= 50 ? '#e0a02f' : '#46d164';
            var _defeatBadge2 = (monster.defeatDebuff && monster.defeatDebuff.until > Date.now())
                ? '<span title="战败惩罚中" style="font-size:11px;margin-left:4px;">⚔️</span>' : '';
            var _fatigueBadge2 = _fatiguePct2 > 0
                ? '<span style="font-size:10px;color:' + _fatigueColor2 + ';margin-left:4px;" title="疲劳 ' + _fatiguePct2 + '%">😴' + _fatiguePct2 + '%</span>' : '';
            return '<div class="msb-monster-card ' + statusCls + '" onclick="showMonsterDetailModal(' + monster.id + ')">' +
                '<div class="msb-monster-top">' +
                '<div class="msb-monster-icon">' + createSVG(monster.type, 28) + '</div>' +
                '<div class="msb-monster-meta">' +
                '<div class="msb-monster-name" style="color:' + _nc2 + ';">' + (monster.starred ? '<span style="color:#f0c53d;font-size:11px;margin-right:2px;">⭐</span>' : '') + monster.name + _defeatBadge2 + _fatigueBadge2 + '</div>' +
                '<div class="msb-monster-level">Lv.' + monster.level + ' · ' + (monsterTypes[monster.type] ? monsterTypes[monster.type].name : monster.type) + '</div>' +
                assignInfo +
                '</div>' +
                '<span class="msb-monster-status ' + sl[1] + '">' + sl[0] + '</span>' +
                '</div>' +
                '<div class="msb-monster-stats">' +
                '<div class="msb-stat"><span class="msb-stat-label">力量</span><span class="msb-stat-value">' + monster.stats.strength + '</span></div>' +
                '<div class="msb-stat"><span class="msb-stat-label">耕作</span><span class="msb-stat-value">' + monster.stats.farming + '</span></div>' +
                '<div class="msb-stat"><span class="msb-stat-label">经验</span><span class="msb-stat-value">' + monster.exp + '/' + monster.maxExp + '</span></div>' +
                '</div>' +
                '<div class="msb-monster-actions">' + actionBtns + '</div>' +
                '</div>';
        }).join('');
    }

    listEl.innerHTML = cardsHtml;

    // 底部统计
    var total = gameState.monsters.length;
    var idle = gameState.monsters.filter(function(m) { return m.status === 'idle'; }).length;
    var farming = gameState.monsters.filter(function(m) { return m.status === 'farming'; }).length;
    var exploring = gameState.monsters.filter(function(m) { return m.status === 'exploring' || m.status === 'preparing'; }).length;
    var statsHtml = '<div style="display:flex;justify-content:space-between;">' +
        '<span>共 <strong style="color:#e6edf3;">' + total + '</strong> 只</span>' +
        '<span style="color:#46d164;">' + T('farming','monsterStatus') + ' ' + farming + '</span>' +
        '<span style="color:#f0c53d;">' + T('exploring','monsterStatus') + ' ' + exploring + '</span>' +
        '<span style="color:#8b949e;">' + T('idle','monsterStatus') + ' ' + idle + '</span>' +
        '</div>';
    if (footerEl) footerEl.innerHTML = statsHtml;

    // ── 同步移动端怪兽 tab ──
    var mobListEl = document.getElementById('mobileMonsterList');
    var mobFooterEl = document.getElementById('mobileMonsterFooter');
    if (mobListEl) {
        // 移动端注入布局工具栏
        var mobTbId = 'mob-msb-layout-toolbar';
        var mobTb = document.getElementById(mobTbId);
        var mobTbHtml = '<div id="' + mobTbId + '" style="padding:4px 10px 6px;border-bottom:1px solid #21262d;">' +
            renderLayoutToolbar('monsters', '', [], 'renderMonsterSidebar') +
            '</div>';
        if (!mobTb) {
            mobListEl.insertAdjacentHTML('beforebegin', mobTbHtml);
        } else {
            mobTb.innerHTML = renderLayoutToolbar('monsters', '', [], 'renderMonsterSidebar');
        }
        mobListEl.innerHTML = cardsHtml;
    }
    if (mobFooterEl) mobFooterEl.innerHTML = statsHtml;
};

// ==================== 左侧农场概况渲染 ====================
window.renderFarmSummary = function() {
    var summaryEl = document.getElementById('farmSummary');
    if (!summaryEl) return;
    var plots = gameState.plots;
    var unlocked = plots.filter(function(p) { return !p.locked; }).length;
    var growing = plots.filter(function(p) { return p.crop && p.progress < 100; }).length;
    var ready = plots.filter(function(p) { return p.crop && p.progress >= 100; }).length;
    var auto = plots.filter(function(p) { return p.assignedMonster; }).length;
    var empty = plots.filter(function(p) { return !p.locked && !p.crop; }).length;
    summaryEl.innerHTML =
        '<div style="display:flex;flex-direction:column;gap:6px;">' +
        '<div style="display:flex;justify-content:space-between;"><span>已解锁地块</span><strong style="color:#58a6ff;">' + unlocked + ' / ' + plots.length + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;"><span>自动化地块</span><strong style="color:#46d164;">' + auto + '</strong></div>' +
        '<div style="display:flex;justify-content:space-between;"><span>生长中</span><strong style="color:#f0c53d;">' + growing + '</strong></div>' +
        (ready > 0 ? '<div style="display:flex;justify-content:space-between;"><span>待收获 ⚡</span><strong style="color:#f85149;">' + ready + '</strong></div>' : '') +
        '<div style="display:flex;justify-content:space-between;"><span>空闲地块</span><strong style="color:#8b949e;">' + empty + '</strong></div>' +
        '</div>';
};

// ==================== 平板端右侧栏切换 ====================
window.toggleMonsterSidebar = function() {
    var sidebar = document.getElementById('monsterSidebar');
    if (sidebar) sidebar.classList.toggle('open');
};

// ==================== 移动端怪兽面板（底部弹出）====================
window.showMobileMonsterPanel = function() {
    var html = '<div class="modal-header">👾 怪兽团队</div>' +
        '<div style="margin-bottom:12px;">' +
        '<button class="btn btn-explore" style="width:100%;font-size:13px;" onclick="closeModal();switchTab(\'exploration\');">🗺 前往探索捕获怪兽</button>' +
        '</div>';

    if (gameState.monsters.length === 0) {
        html += '<div style="text-align:center;padding:30px;color:#8b949e;">还没有怪兽，前往探索区域捕获吧！</div>';
    } else {
        html += '<div style="max-height:60vh;overflow-y:auto;">';
        gameState.monsters.forEach(function(monster) {
            var statusMap = {
                idle: T('idle','monsterStatus'),
                farming: T('farming','monsterStatus'),
                exploring: T('exploring','monsterStatus'),
                preparing: T('preparing','monsterStatus')
            };
            var statusColor = { idle: '#8b949e', farming: '#46d164', exploring: '#f0c53d', preparing: '#f0c53d' };
            var st = monster.status || 'idle';
            html += '<div style="background:#21262d;border:1px solid #30363d;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px;" onclick="closeModal();showMonsterDetailModal(' + monster.id + ');">' +
                '<div style="background:#0d1117;border-radius:8px;padding:4px;">' + createSVG(monster.type, 32) + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                '<div style="font-weight:700;font-size:13px;">' + monster.name + '</div>' +
                '<div style="font-size:13px;color:#8b949e;">Lv.' + monster.level + ' · ' + (monsterTypes[monster.type] ? monsterTypes[monster.type].name : '') + '</div>' +
                '</div>' +
                '<span style="font-size:13px;color:' + (statusColor[st] || '#8b949e') + ';font-weight:600;">' + (statusMap[st] || st) + '</span>' +
                '</div>';
        });
        html += '</div>';
    }
    html += '<div class="modal-buttons"><button class="btn btn-primary" onclick="closeModal()">关闭</button></div>';
    showModal(html);
};

// ==================== 存档导出 / 导入（设置面板）====================

window._settingsExportSave = function() {
    try {
        var data = localStorage.getItem('monsterFarmSave') || '{}';
        // 生成带时间戳的文件名
        var now = new Date();
        var ts = now.getFullYear() + '-' +
            String(now.getMonth()+1).padStart(2,'0') + '-' +
            String(now.getDate()).padStart(2,'0') + '_' +
            String(now.getHours()).padStart(2,'0') +
            String(now.getMinutes()).padStart(2,'0');
        var blob = new Blob([data], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = 'monsterfarm_' + ts + '.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
        showNotification(T('ntfExported','gm'), 'success');
    } catch(e) {
        showNotification(T('ntfExportFail','gm').replace('{err}', e.message), 'error');
    }
};

window._settingsImportSave = function() {
    // 弹出确认框，用户确认后再触发文件选择
    var _t = function(k, cat) { return (typeof i18n !== 'undefined') ? i18n.t(k, cat) : k; };
    var confirmHtml =
        '<div class="modal-header" style="color:#f0c53d;">' + _t('importConfirmTitle','settings') + '</div>' +
        '<div style="margin-bottom:18px;font-size:1rem;line-height:1.8;color:#e6edf3;">' +
            _t('importConfirmDesc','settings') +
        '</div>' +
        '<div class="modal-buttons">' +
            '<button class="btn btn-primary" onclick="window._settingsDoImport();">' + _t('importConfirmOk','settings') + '</button>' +
            '<button class="btn btn-secondary" onclick="closeModal();setTimeout(showSettingsModal,80);">' + T('cancel','common') + '</button>' +
        '</div>';
    showModal(confirmHtml);
};

// 实际触发文件选择 → 读取 → 写入 localStorage → 刷新
window._settingsDoImport = function() {
    var _t = function(k, cat) { return (typeof i18n !== 'undefined') ? i18n.t(k, cat) : k; };
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', function() {
        var file = input.files[0];
        if (!file) { document.body.removeChild(input); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                // 验证 JSON 是否合法
                var parsed = JSON.parse(e.target.result);
                if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid format');
                // 写入存档
                localStorage.setItem('monsterFarmSave', e.target.result);
                closeModal();
                showNotification(_t('importSuccess','settings'), 'success');
                // 短暂延迟后重载游戏以应用新存档
                setTimeout(function() { location.reload(); }, 800);
            } catch(err) {
                showNotification(_t('importFail','settings').replace('{err}', err.message), 'error');
                closeModal();
                setTimeout(showSettingsModal, 80);
            }
        };
        reader.readAsText(file);
        document.body.removeChild(input);
    });

    // 触发文件选择对话框
    input.click();
    // 关闭确认弹窗
    closeModal();
};

// 初始化UI - 在页面加载时调用
window.addEventListener('load', function() {
    // 恢复字体大小偏好
    var savedSize = localStorage.getItem('mf_font_size');
    if (savedSize) applyFontSize(savedSize);

    // 初始化移动端导航图标
    initMobileNavIcons();
    
    // 绑定侧边栏切换事件
    var sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // 初始化快捷操作按钮图标
    var saveIconEl = document.getElementById('quickSaveIcon');
    if (saveIconEl) saveIconEl.innerHTML = createSVG('save', 16);
    var recallIconEl = document.getElementById('recallIcon');
    if (recallIconEl) recallIconEl.innerHTML = createSVG('recall', 16);
    var tutorialIconEl = document.getElementById('tutorialIcon');
    if (tutorialIconEl) tutorialIconEl.innerHTML = createSVG('tutorial', 16);
    var changelogIconEl = document.getElementById('changelogIcon');
    if (changelogIconEl) changelogIconEl.innerHTML = createSVG('changelog', 16);
    var settingsIconEl = document.getElementById('settingsIcon');
    if (settingsIconEl) settingsIconEl.innerHTML = createSVG('settings', 16);
    var wikiIconEl = document.getElementById('wikiIcon');
    if (wikiIconEl) wikiIconEl.innerHTML = createSVG('wiki', 16);
    // 浮窗开关：读取本地配置，隐藏/显示悬浮球
    _applyFloatBtnPref();
});

// ==================== 悬浮设置球开关 ====================
function _applyFloatBtnPref() {
    var on = localStorage.getItem('mf_float_btn') !== 'off';
    var btn = document.getElementById('settingsBtn');
    if (btn) btn.style.display = on ? '' : 'none';
}

window._toggleFloatBtn = function(el) {
    var on = el.classList.contains('on');
    on = !on;
    localStorage.setItem('mf_float_btn', on ? 'on' : 'off');
    // 更新 toggle 样式
    el.classList.toggle('on', on);
    el.style.background = on ? '#46d164' : '#30363d';
    var knob = el.querySelector('div');
    if (knob) {
        knob.style.right = on ? '3px' : '';
        knob.style.left  = on ? ''    : '3px';
    }
    // 同步悬浮球显示
    _applyFloatBtnPref();
};

// ==================== 早期体验版提示弹窗 ====================
window.showEarlyAccessNotice = function(forceShow) {
    // 用 sessionStorage 保证：同一标签页内只弹一次（刷新后仍会弹）
    // forceShow=true 时跳过检查（用于从更新日志返回时重新打开）
    if (!forceShow && sessionStorage.getItem('mf_early_notice_shown')) return;
    sessionStorage.setItem('mf_early_notice_shown', '1');

    var html =
        '<div style="text-align:center;padding:8px 4px 4px;">' +
            '<div style="font-size:36px;margin-bottom:10px;">🌱</div>' +
            '<div style="font-size:16px;font-weight:700;color:#e6edf3;margin-bottom:6px;">早期体验版</div>' +
            '<div style="display:inline-block;background:#1f3a1f;border:1px solid #46d164;color:#46d164;' +
                'font-size:11px;font-weight:600;padding:2px 10px;border-radius:12px;margin-bottom:16px;">开发中 · Dev Build</div>' +
        '</div>' +
        '<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:14px 16px;margin-bottom:16px;font-size:13px;color:#c9d1d9;line-height:1.8;">' +
            '<p style="margin:0 0 10px;">👋 你好！感谢愿意提前体验《怪兽农场》。</p>' +
            '<p style="margin:0 0 10px;">本作从 <strong style="color:#f0c53d;">2026 年 2 月 26 日</strong> 起利用业余时间独立开发，目前处于早期内测阶段。游戏尚不完整，数值循环、系统功能、界面布局等均可能经历较大调整。</p>' +
            '<p style="margin:0;">⚠️ <strong style="color:#f85149;">重要提示：</strong>版本更新有时会影响存档兼容性，当前存档数据存在丢失风险，请以体验为主，不必过于在意进度。</p>' +
        '</div>' +
        '<div style="background:#1a2840;border:1px solid #1f6feb;border-radius:8px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#8b949e;line-height:1.7;">' +
            '📌 如遇到 Bug 或有功能建议，欢迎随时反馈——每一条意见都将直接推动游戏迭代。<br>' +
            '完整正式版本正在积极开发中，<span style="color:#58a6ff;">敬请期待！</span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;">' +
            '<button class="btn btn-primary" onclick="closeModal();setTimeout(function(){if(window._pendingTutorial){window._pendingTutorial=false;startTutorial();}},300);" style="flex:1;padding:10px;">我知道了，开始体验</button>' +
            '<button class="btn btn-secondary" onclick="showChangelog(function(){showEarlyAccessNotice(true);});" style="padding:10px 14px;">查看更新日志</button>' +
        '</div>';

    showModal(
        '<div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<span>欢迎来到怪兽农场</span>' +
            '<span style="font-size:11px;color:#8b949e;font-weight:400;">v0.9.5 · Early Access</span>' +
        '</div>' + html
    );
};
