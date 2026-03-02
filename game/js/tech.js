// ==================== 科技树模块 ====================

// 科技分类配置（label 由 i18n 动态填充）
var TECH_CATEGORIES = [
    { id: 'all',         color: '#c9d1d9', label: '全部' },
    { id: 'farming',     color: '#46d164' },
    { id: 'exploration', color: '#58a6ff' },
    { id: 'monster',     color: '#9c27b0' },
    { id: 'breeding',    color: '#e91e63' },
    { id: 'expansion',   color: '#f0883e' },
    { id: 'reforge',     color: '#ffd700', label: '🧬 重铸' }
];

var _activeTechCategory = 'farming';

// ── 渲染单张科技卡（大卡模式）──
function _renderTechCard(techId) {
    var tech = technologies[techId];
    var unlocked = gameState.technologies[techId];
    var prereqMet = !tech.prereq || tech.prereq.length === 0 || tech.prereq.every(function(p) {
        return gameState.technologies[p];
    });
    var canAfford = Object.keys(tech.cost).every(function(resource) {
        return gameState[resource] >= tech.cost[resource];
    });
    var canUnlock = prereqMet && canAfford;
    var tierColor = ['','#8b949e','#46d164','#58a6ff','#f0883e','#9c27b0','#ffd700'][tech.tier||1] || '#8b949e';

    var prereqBlock = '';
    if (!prereqMet && tech.prereq && tech.prereq.length > 0) {
        prereqBlock = '<div style="font-size:11px;color:#f85149;margin-top:6px;">⚠ ' + T('prereqNeeded','tech') + '：' +
            tech.prereq.map(function(p){ return (technologies[p] ? technologies[p].name : null) || TName(p,'tech') || p; }).join('、') + '</div>';
    }

    // 全部分类时显示所属分类色条提示
    var catBadge = '';
    if (_activeTechCategory === 'all') {
        var catObj = TECH_CATEGORIES.find(function(c){ return c.id === tech.category; });
        if (catObj) {
            var catLabel = catObj.label || T(catObj.id, 'tech.category') || T(catObj.id, 'tech') || catObj.id;
            catBadge = '<span style="font-size:10px;background:' + catObj.color + '22;color:' + catObj.color + ';' +
                'padding:1px 6px;border-radius:8px;margin-right:4px;">' + catLabel + '</span>';
        }
    }

    return '<div class="tech-item ' + (unlocked ? 'unlocked' : (canUnlock ? 'locked can-unlock' : 'locked')) + '" style="' +
        'break-inside:avoid;' +
        'border-left:3px solid ' + tierColor + ';opacity:' + (!prereqMet && !unlocked ? '0.55' : '1') + ';">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:4px;flex-wrap:wrap;">' +
        '<div class="tech-title" style="margin:0;flex:1;min-width:0;">' +
            '<span style="display:inline-block;vertical-align:middle;margin-right:4px;">' +
            (unlocked ? createSVG('check',13) : createSVG('locked_tech',13)) + '</span>' + tech.name +
        '</div>' +
        '<div style="display:flex;gap:3px;flex-shrink:0;">' +
        catBadge +
        '<span style="font-size:10px;background:' + tierColor + '22;color:' + tierColor + ';padding:1px 6px;border-radius:8px;">Tier ' + (tech.tier||1) + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="tech-desc">' + tech.desc + '</div>' +
        prereqBlock +
        (!unlocked ? (
            '<div class="tech-cost" style="margin-top:8px;">' + T('cost','common') + '：' +
            Object.keys(tech.cost).map(function(r) {
                var have = gameState[r] || 0;
                var need = tech.cost[r];
                var ok = have >= need;
                return '<span style="color:' + (ok?'#46d164':'#f85149') + ';">' + getResourceIcon(r,12) + need + '</span>';
            }).join(' ') + '</div>' +
            '<button class="btn btn-primary" style="margin-top:8px;" onclick="unlockTech(\'' + techId + '\')" ' +
            (!canUnlock ? 'disabled' : '') + '>' +
            (unlocked ? T('unlocked','tech') : (canUnlock ? T('unlock','tech') : (!prereqMet ? T('prereqNeeded','tech') : T('notEnough','tech')))) +
            '</button>'
        ) : (
            '<div style="color:#46d164;font-weight:bold;margin-top:8px;font-size:13px;">✓ ' + T('unlocked','tech') + '</div>'
        )) +
        '</div>';
}

// ── 渲染单条紧凑科技行 ──
function _renderTechCompactRow(techId) {
    var tech = technologies[techId];
    var unlocked = gameState.technologies[techId];
    var prereqMet = !tech.prereq || tech.prereq.length === 0 || tech.prereq.every(function(p) {
        return gameState.technologies[p];
    });
    var canAfford = Object.keys(tech.cost).every(function(r) { return (gameState[r]||0) >= tech.cost[r]; });
    var canUnlock = prereqMet && canAfford && !unlocked;
    var tierColor = ['','#8b949e','#46d164','#58a6ff','#f0883e','#9c27b0','#ffd700'][tech.tier||1] || '#8b949e';
    var costText = Object.keys(tech.cost).map(function(r) {
        var ok = (gameState[r]||0) >= tech.cost[r];
        return '<span style="color:' + (ok?'#46d164':'#f85149') + ';">' + getResourceIcon(r,11) + tech.cost[r] + '</span>';
    }).join(' ');

    // 全部分类时显示分类小标签
    var catBadge = '';
    if (_activeTechCategory === 'all') {
        var catObj = TECH_CATEGORIES.find(function(c){ return c.id === tech.category; });
        if (catObj) {
            catBadge = '<span style="font-size:9px;background:' + catObj.color + '22;color:' + catObj.color + ';' +
                'padding:1px 5px;border-radius:8px;flex-shrink:0;">' +
                (catObj.label || T(catObj.id,'tech.category') || catObj.id) + '</span>';
        }
    }

    return '<div class="compact-card' + (unlocked ? ' auto-running' : (canUnlock ? ' can-unlock-row' : '')) + '" style="' +
        'border-left:3px solid ' + tierColor + ';' +
        'opacity:' + (!prereqMet && !unlocked ? '0.5' : '1') + ';' +
        'cursor:' + (canUnlock ? 'pointer' : 'default') + ';"' +
        (canUnlock ? ' onclick="unlockTech(\'' + techId + '\')"' : '') + '>' +
        '<div style="width:18px;text-align:center;flex-shrink:0;font-size:14px;">' +
            (unlocked ? '✓' : (prereqMet ? '○' : '🔒')) +
        '</div>' +
        '<div style="display:flex;flex-direction:column;min-width:0;flex:1;gap:1px;">' +
            '<span class="compact-name" style="color:' + (unlocked?'#46d164':(!prereqMet?'#8b949e':'#e6edf3')) + ';">' + tech.name + '</span>' +
            '<span class="compact-sub">' + tech.desc.replace(/<[^>]+>/g,'').slice(0,60) + (tech.desc.length>60?'…':'') + '</span>' +
        '</div>' +
        catBadge +
        '<span style="font-size:10px;background:' + tierColor + '22;color:' + tierColor + ';padding:1px 6px;border-radius:8px;flex-shrink:0;white-space:nowrap;">T' + (tech.tier||1) + '</span>' +
        (!unlocked ? '<div style="flex-shrink:0;font-size:11px;">' + costText + '</div>' : '') +
        (!unlocked ? '<button class="compact-btn' + (canUnlock ? ' success' : '') + '" ' +
            (canUnlock ? 'onclick="event.stopPropagation();unlockTech(\'' + techId + '\')"' : 'disabled style="opacity:0.4;"') + '>' +
            (canUnlock ? T('unlock','tech') : (!prereqMet ? '🔒' : T('notEnough','tech'))) +
            '</button>' : '') +
        '</div>';
}

window.renderTech = function() {
    var techTree = document.getElementById('techTree');
    if (!techTree) return;

    var techLayout = getLayoutPref('tech');

    // ── 分类 Tab 头（sticky 固定在顶部）──
    var totalAll   = Object.keys(technologies).length;
    var unlockedAll = Object.keys(technologies).filter(function(k){ return gameState.technologies[k]; }).length;

    var tabsHtml = '<div style="' +
        'position:sticky;top:0;z-index:10;' +
        'background:#161b22;' +
        'padding:10px 20px 8px;margin:-16px -20px 12px;' +
        'border-bottom:1px solid #30363d;' +
        'display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
        TECH_CATEGORIES.map(function(cat) {
            var isActive = _activeTechCategory === cat.id;
            var catLabel = cat.label || T(cat.id, 'tech.category') || T(cat.id, 'tech') || cat.id;
            var badge = '';
            if (cat.id === 'all') {
                badge = ' <span style="font-size:11px;opacity:0.8;">(' + unlockedAll + '/' + totalAll + ')</span>';
            } else if (cat.id !== 'reforge') {
                var catTechs = Object.keys(technologies).filter(function(k){ return technologies[k].category === cat.id; });
                var unlockedCount = catTechs.filter(function(k){ return gameState.technologies[k]; }).length;
                badge = ' <span style="font-size:11px;opacity:0.8;">(' + unlockedCount + '/' + catTechs.length + ')</span>';
            }
            return '<button onclick="switchTechCategory(\'' + cat.id + '\')" style="' +
                'padding:5px 12px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;' +
                'border:2px solid ' + (isActive ? cat.color : '#30363d') + ';' +
                'background:' + (isActive ? cat.color + '22' : 'transparent') + ';' +
                'color:' + (isActive ? cat.color : '#8b949e') + ';">' +
                catLabel + badge +
                '</button>';
        }).join('') +
        // 布局切换按钮放在 tab 行右侧（覆盖 layout-toolbar 内边距）
        '<div style="margin-left:auto;display:flex;align-items:center;">' +
          '<div class="layout-toggle" style="display:flex;gap:4px;">' +
            '<button class="layout-toggle-btn' + (techLayout === 'large'   ? ' active' : '') + '" ' +
              'onclick="setLayoutPref(\'tech\',\'large\');renderTech();" title="大卡片">⊞ 大卡</button>' +
            '<button class="layout-toggle-btn' + (techLayout === 'compact' ? ' active' : '') + '" ' +
              'onclick="setLayoutPref(\'tech\',\'compact\');renderTech();" title="紧凑列表">☰ 小卡</button>' +
          '</div>' +
        '</div>' +
        '</div>';

    // ── 当前分类的科技列表 ──
    var filteredTechs;
    if (_activeTechCategory === 'all') {
        filteredTechs = Object.keys(technologies);
    } else if (_activeTechCategory === 'reforge') {
        filteredTechs = []; // 重铸 tab 单独处理
    } else {
        filteredTechs = Object.keys(technologies).filter(function(k) {
            return technologies[k].category === _activeTechCategory;
        });
    }

    // 按 tier 升序排序
    filteredTechs.sort(function(a, b) {
        return (technologies[a].tier || 1) - (technologies[b].tier || 1);
    });

    var techHtml = '';

    if (_activeTechCategory === 'reforge') {
        // ── 重铸 Tab：只渲染重铸面板 ──
        techHtml = renderMonsterBreakthroughSection();
    } else if (techLayout === 'compact') {
        // ── 紧凑模式：每条科技一行 ──
        techHtml = '<div class="compact-list" style="padding:4px 0 12px;">' +
            filteredTechs.map(_renderTechCompactRow).join('') +
            '</div>';
    } else {
        // ── 大卡模式：CSS 多列瀑布流，避免等高留白 ──
        techHtml = '<div style="columns:2 280px;column-gap:12px;padding-bottom:12px;">' +
            filteredTechs.map(_renderTechCard).join('') +
            '</div>';
    }

    // 重铸 tab 已单独处理，其他 tab 不追加重铸面板
    techTree.innerHTML = tabsHtml + techHtml;
};

window.switchTechCategory = function(catId) {
    _activeTechCategory = catId;
    renderTech();
};

// ==================== 怪兽重铸系统 ====================
// 重铸配置
var REFORGE_CONFIG = {
    basic:   { name: '普通重铸', cost: { research: 50 },                     rangeMult: [0.85, 1.20], lockSlots: 0, rolls: 1, color: '#8b949e' },
    advanced:{ name: '精准重铸', cost: { research: 80, coins: 200 },          rangeMult: [0.90, 1.25], lockSlots: 1, rolls: 1, color: '#58a6ff' },
    perfect: { name: '完美重铸', cost: { research: 150, materials: 100 },     rangeMult: [0.95, 1.30], lockSlots: 0, rolls: 3, color: '#ffd700' }
};
// 保底机制：连续N次没有提升属性总和，触发保底
var REFORGE_PITY_THRESHOLD = 4;
// 各属性标签（由 i18n 动态获取）
var STAT_LABELS = {};
function _refreshStatLabels() {
    STAT_LABELS = {
        strength:     T('strength','monsters'),
        agility:      T('agility','monsters'),
        intelligence: T('intelligence','monsters'),
        farming:      T('farming','monsters')
    };
}
_refreshStatLabels();
var STAT_KEYS   = ['strength', 'agility', 'intelligence', 'farming'];
// 重铸弹窗的临时状态（不存档，刷新重置）
var _reforgeState = {
    monsterId: null,
    mode: 'basic',
    lockedStats: [],       // 锁定的属性 key，最多1个（精准重铸）
    pendingRolls: [],      // 待选的多次投掷结果 [{strength,agility,...},...]
    currentRollIdx: 0      // 当前查看的投掷轮次
};

// ── 渲染"怪兽重铸"面板（嵌入科技树页底部）──
function renderMonsterBreakthroughSection() {
    _refreshStatLabels();
    if (gameState.monsters.length === 0) {
        return '<div class="tech-item" style="margin-top:20px;border-top:2px solid #30363d;padding-top:16px;">' +
            '<div class="tech-title">🧬 ' + T('reforgeTitle','monsters') + '</div>' +
            '<div class="tech-desc" style="color:#8b949e;">' + _reforgeIntroDesc() + '</div>' +
            '<div style="color:#8b949e;font-size:13px;margin-top:8px;">(' + T('noMonsters','ui') + ')</div>' +
            '</div>';
    }

    // 获取当前选中的怪兽（默认第一只空闲怪兽）
    var idleMonsters = gameState.monsters.filter(function(m){ return m.status === 'idle'; });
    if (!_reforgeState.monsterId || !gameState.monsters.find(function(m){ return m.id === _reforgeState.monsterId && m.status === 'idle'; })) {
        _reforgeState.monsterId = idleMonsters.length > 0 ? idleMonsters[0].id : null;
        _reforgeState.lockedStats = [];
    }
    var selMonster = _reforgeState.monsterId ? gameState.monsters.find(function(m){ return m.id === _reforgeState.monsterId; }) : null;

    // ── 当前已选怪兽预览卡（替代 <select> 下拉）──
    var monsterPickHtml = _renderReforgeMonsterCard(selMonster);

    // 重铸模式按钮（使用 i18n 名称）
    var modeHtml = Object.keys(REFORGE_CONFIG).map(function(key){
        var cfg = REFORGE_CONFIG[key];
        var isActive = _reforgeState.mode === key;
        var costText = Object.keys(cfg.cost).map(function(r){
            return getResourceIcon(r, 11) + cfg.cost[r];
        }).join(' ');
        var cfgLabel = T('reforge' + key.charAt(0).toUpperCase() + key.slice(1), 'monsters') || cfg.name;
        return '<button onclick="switchReforgeMode(\'' + key + '\')" style="' +
            'flex:1;padding:6px 4px;font-size:11px;border-radius:8px;cursor:pointer;transition:all 0.2s;' +
            'border:2px solid ' + (isActive ? cfg.color : '#30363d') + ';' +
            'background:' + (isActive ? cfg.color + '22' : '#161b22') + ';' +
            'color:' + (isActive ? cfg.color : '#8b949e') + ';">' +
            cfgLabel + '<br><span style="font-size:10px;opacity:0.85;">' + costText + '</span>' +
            '</button>';
    }).join('');

    // 当前怪兽属性与历史最佳展示
    var statsHtml = '';
    var pityHtml  = '';
    if (selMonster) {
        var pityCount = selMonster.reforgePityCount || 0;
        var bestStats = selMonster.reforgeBestStats || null;
        var curTotal  = STAT_KEYS.reduce(function(s,k){ return s + (selMonster.stats[k]||0); }, 0);
        var bestTotal = bestStats ? STAT_KEYS.reduce(function(s,k){ return s + (bestStats[k]||0); }, 0) : curTotal;

        // 属性锁定界面（精准重铸模式）
        var lockHtml = '';
        if (_reforgeState.mode === 'advanced') {
            lockHtml = '<div style="font-size:11px;color:#58a6ff;margin:8px 0 4px;">🔒 ' + T('lockStat','monsters') + '：</div>';
        }

        statsHtml = '<div style="background:#0d1117;border-radius:8px;padding:10px;margin-top:10px;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
            '<span style="font-size:12px;font-weight:bold;color:#e6edf3;">' + selMonster.name + ' ' + T('stats','monsters') + '</span>' +
            '<span style="font-size:11px;color:#8b949e;">' + T('current','common') + ' <strong style="color:#e6edf3;">' + curTotal + '</strong>' +
            (bestStats ? ' | ' + T('max','common') + ' <strong style="color:#ffd700;">' + bestTotal + '</strong>' : '') + '</span>' +
            '</div>' + lockHtml +
            '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">' +
            STAT_KEYS.map(function(k){
                var isLocked = _reforgeState.lockedStats.indexOf(k) >= 0;
                var bestVal  = bestStats ? (bestStats[k] || 0) : null;
                var curVal   = selMonster.stats[k] || 0;
                var canLock  = _reforgeState.mode === 'advanced';
                return '<div onclick="' + (canLock ? 'toggleReforgeStatLock(\'' + k + '\')' : '') + '" style="' +
                    'text-align:center;padding:6px 4px;border-radius:6px;cursor:' + (canLock ? 'pointer' : 'default') + ';' +
                    'border:2px solid ' + (isLocked ? '#58a6ff' : '#30363d') + ';' +
                    'background:' + (isLocked ? '#58a6ff11' : '#21262d') + ';transition:all 0.2s;">' +
                    '<div style="font-size:10px;color:#8b949e;">' + STAT_LABELS[k] + (isLocked ? ' 🔒' : '') + '</div>' +
                    '<div style="font-size:16px;font-weight:bold;color:#e6edf3;">' + curVal + '</div>' +
                    (bestVal !== null && bestVal !== curVal ? '<div style="font-size:10px;color:#ffd700;">' + T('max','common') + ':' + bestVal + '</div>' : '') +
                    '</div>';
            }).join('') +
            '</div></div>';

        // 保底提示
        if (pityCount > 0) {
            var pityRemain = REFORGE_PITY_THRESHOLD - pityCount;
            var pityColor = pityCount >= REFORGE_PITY_THRESHOLD - 1 ? '#ffd700' : '#f0883e';
            pityHtml = '<div style="font-size:12px;color:' + pityColor + ';background:' + pityColor + '11;border-radius:6px;padding:6px 10px;margin-top:8px;border:1px solid ' + pityColor + '33;">' +
                (pityCount >= REFORGE_PITY_THRESHOLD
                    ? '✨ <strong>' + _pityTriggeredText() + '</strong>'
                    : '🎲 ' + _pityProgressText(pityCount, pityRemain)) +
                '</div>';
        }
    }

    // 费用与执行按钮
    var cfg = REFORGE_CONFIG[_reforgeState.mode];
    var canAfford = selMonster && Object.keys(cfg.cost).every(function(r){ return (gameState[r]||0) >= cfg.cost[r]; });
    var costDisplay = Object.keys(cfg.cost).map(function(r){
        var have = gameState[r] || 0, need = cfg.cost[r];
        return '<span style="color:' + (have >= need ? '#46d164' : '#f85149') + ';">' + getResourceIcon(r, 12) + need + '</span>';
    }).join(' ');

    var modeDesc = _getReforgeModeDesca();
    var btnLabel = cfg.rolls > 1 ? ('🎲 ' + _reforgeGenLabel(cfg.rolls)) : '🎲 ' + T('reforge','monsters');

    return '<div class="tech-item" style="margin-top:20px;border-top:2px solid #30363d;padding-top:16px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
        '<div class="tech-title" style="margin:0;">🧬 ' + T('reforgeTitle','monsters') + '</div>' +
        '<span style="font-size:11px;color:#8b949e;">' + _reforgeSubtitle() + '</span>' +
        '</div>' +
        // 怪兽选择卡（筛选器入口）
        monsterPickHtml +
        // 模式选择
        '<div style="display:flex;gap:6px;margin-bottom:10px;">' + modeHtml + '</div>' +
        // 模式说明
        '<div class="tech-desc" style="margin:0 0 8px;">' + (modeDesc[_reforgeState.mode] || '') + '</div>' +
        // 当前属性 + 历史最佳
        statsHtml +
        pityHtml +
        // 费用 + 按钮
        '<div style="margin-top:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;">' +
        '<div style="font-size:12px;">' + T('cost','common') + '：' + costDisplay + '</div>' +
        '<button class="btn btn-primary" onclick="openReforgeModal()" ' + (canAfford && selMonster ? '' : 'disabled') + ' style="white-space:nowrap;' + (canAfford && selMonster ? '' : 'opacity:0.5;') + '">' +
        (canAfford && selMonster ? btnLabel : (selMonster ? T('notEnough','tech') : T('noMonsters','ui'))) +
        '</button>' +
        '</div>' +
        '</div>';
}

// ── 渲染重铸怪兽预览卡（替代 <select>）──
function _renderReforgeMonsterCard(selMonster) {
    if (!selMonster) {
        return '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;' +
            'background:#0d1117;border:1px dashed #30363d;border-radius:10px;padding:12px 16px;margin-bottom:10px;">' +
            '<span style="color:#8b949e;font-size:13px;">尚未选择怪兽</span>' +
            '<button onclick="openReforgeMonsterPicker()" style="' +
                'padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;' +
                'border:1px solid #58a6ff;background:#58a6ff22;color:#58a6ff;">🔍 选择怪兽</button>' +
        '</div>';
    }
    var td = monsterTypes[selMonster.type] || {};
    var selTotal = STAT_KEYS.reduce(function(s,k){ return s+(selMonster.stats[k]||0); }, 0);
    var selBest  = selMonster.reforgeBestStats
        ? STAT_KEYS.reduce(function(s,k){ return s+(selMonster.reforgeBestStats[k]||0); }, 0) : null;
    var rarityColors = { common:'#8b949e', uncommon:'#2196f3', rare:'#ff9800', epic:'#9c27b0', legendary:'#ffd700' };
    var rc = rarityColors[td.rarity] || '#8b949e';
    var pc = selMonster.reforgePityCount || 0;
    var pityBadge = '';
    if (pc >= REFORGE_PITY_THRESHOLD) {
        pityBadge = '<span style="font-size:10px;background:#ffd70022;color:#ffd700;border:1px solid #ffd70044;' +
            'border-radius:8px;padding:1px 6px;margin-left:4px;vertical-align:middle;">✨ 保底</span>';
    } else if (pc > 0) {
        pityBadge = '<span style="font-size:10px;background:#f0883e22;color:#f0883e;border:1px solid #f0883e44;' +
            'border-radius:8px;padding:1px 6px;margin-left:4px;vertical-align:middle;">保底 ' + pc + '/' + REFORGE_PITY_THRESHOLD + '</span>';
    }
    // 四项属性小格
    var statBars = '<div style="display:flex;gap:5px;margin-top:5px;">' +
        STAT_KEYS.map(function(k) {
            var v = selMonster.stats[k] || 0;
            var best = selMonster.reforgeBestStats ? (selMonster.reforgeBestStats[k]||0) : v;
            var isBest = v >= best;
            return '<div style="flex:1;text-align:center;background:#21262d;border-radius:5px;padding:3px 2px;">' +
                '<div style="font-size:9px;color:#8b949e;">' + (STAT_LABELS[k]||k).slice(0,1) + '</div>' +
                '<div style="font-size:12px;font-weight:700;color:' + (isBest ? '#ffd700' : '#e6edf3') + ';">' + v + '</div>' +
            '</div>';
        }).join('') +
    '</div>';

    return '<div style="display:flex;align-items:center;gap:10px;background:#0d1117;' +
        'border:1px solid #30363d;border-radius:10px;padding:8px 12px;margin-bottom:10px;">' +
        '<div style="background:#21262d;border-radius:8px;padding:4px;flex-shrink:0;">' + createSVG(selMonster.type, 36) + '</div>' +
        '<div style="flex:1;min-width:0;">' +
            '<div style="font-weight:700;color:#e6edf3;font-size:13px;line-height:1.3;">' +
                selMonster.name + pityBadge +
            '</div>' +
            '<div style="font-size:11px;color:#8b949e;margin-top:1px;">' +
                'Lv.' + selMonster.level +
                ' · <span style="color:' + rc + ';">' + (td.name || selMonster.type) + '</span>' +
                ' · 总计 <strong style="color:#e6edf3;">' + selTotal + '</strong>' +
                (selBest ? ' / 最佳 <strong style="color:#ffd700;">' + selBest + '</strong>' : '') +
            '</div>' +
            statBars +
        '</div>' +
        '<button onclick="openReforgeMonsterPicker()" title="筛选更换怪兽" style="' +
            'padding:7px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;' +
            'border:1px solid #58a6ff44;background:#58a6ff11;color:#58a6ff;transition:all 0.2s;"' +
            ' onmouseover="this.style.background=\'#58a6ff33\'"' +
            ' onmouseout="this.style.background=\'#58a6ff11\'">🔍 更换</button>' +
    '</div>';
}

// ── 打开重铸怪兽筛选器弹窗 ──
window.openReforgeMonsterPicker = function() {
    showMonsterPickModal({
        ctx:         'reforge',
        title:       '🧬 选择重铸怪兽',
        statusFilter: 'idle',    // 只显示空闲怪兽
        showLineage:  true,
        extraInfo: function(m) {
            var total = STAT_KEYS.reduce(function(s,k){ return s+(m.stats[k]||0); }, 0);
            var best  = m.reforgeBestStats
                ? STAT_KEYS.reduce(function(s,k){ return s+(m.reforgeBestStats[k]||0); }, 0) : null;
            var pc = m.reforgePityCount || 0;
            var pityStr = pc >= REFORGE_PITY_THRESHOLD
                ? '<span style="color:#ffd700;">✨ 保底已触发</span>'
                : (pc > 0 ? '<span style="color:#f0883e;">保底 ' + pc + '/' + REFORGE_PITY_THRESHOLD + '</span>' : '');
            return '<div style="font-size:11px;color:#8b949e;margin-top:2px;">' +
                '总属性 <strong style="color:#e6edf3;">' + total + '</strong>' +
                (best ? ' · 最佳 <strong style="color:#ffd700;">' + best + '</strong>' : '') +
                (pityStr ? ' · ' + pityStr : '') +
            '</div>';
        },
        onSelect: function(monsterId) {
            _reforgeState.monsterId = monsterId;
            _reforgeState.lockedStats = [];
            renderTech();
        }
    });
};

// ── 切换模式 ──
window.switchReforgeMode = function(mode) {
    _reforgeState.mode = mode;
    _reforgeState.lockedStats = [];
    renderTech();
};

// ── 切换怪兽 ──
window.onReforgeMonsterChange = function(val) {
    _reforgeState.monsterId = parseInt(val);
    _reforgeState.lockedStats = [];
    renderTech();
};

// ── 切换属性锁定（精准重铸）──
window.toggleReforgeStatLock = function(statKey) {
    if (_reforgeState.mode !== 'advanced') return;
    var idx = _reforgeState.lockedStats.indexOf(statKey);
    if (idx >= 0) {
        _reforgeState.lockedStats.splice(idx, 1);
    } else {
        if (_reforgeState.lockedStats.length >= 1) {
            _reforgeState.lockedStats = [statKey]; // 只允许锁1个
        } else {
            _reforgeState.lockedStats.push(statKey);
        }
    }
    renderTech();
};

// ── 生成一套重铸结果 ──
function generateReforgeResult(monster, mode) {
    var cfg = REFORGE_CONFIG[mode];
    var lockedStats = _reforgeState.lockedStats;
    var freeStats = STAT_KEYS.filter(function(k){ return lockedStats.indexOf(k) < 0; });

    // 计算参与重铸的属性当前总和
    var freeTotal = freeStats.reduce(function(s,k){ return s + (monster.stats[k]||0); }, 0);
    if (freeTotal < 4) freeTotal = 4; // 最低基准

    // 在范围内随机新总量
    var mult = cfg.rangeMult[0] + Math.random() * (cfg.rangeMult[1] - cfg.rangeMult[0]);
    var newTotal = Math.max(freeStats.length, Math.round(freeTotal * mult));

    // 用 Dirichlet 均匀随机分配法：先生成随机权重，再按比例分配整数点数
    var weights = freeStats.map(function(){ return Math.random() + 0.1; }); // +0.1 避免0权重
    var weightSum = weights.reduce(function(s,w){ return s+w; }, 0);
    var result = {};

    // 锁定属性直接复制
    lockedStats.forEach(function(k){ result[k] = monster.stats[k] || 0; });

    // 自由属性按权重分配，保证每个至少为1
    var allocated = 0;
    freeStats.forEach(function(k, i){
        var raw = Math.max(1, Math.round(newTotal * weights[i] / weightSum));
        result[k] = raw;
        allocated += raw;
    });

    // 修正总量误差（从最高属性调整）
    var diff = newTotal - allocated;
    if (diff !== 0 && freeStats.length > 0) {
        var maxKey = freeStats.reduce(function(a,b){ return result[a] >= result[b] ? a : b; });
        result[maxKey] = Math.max(1, result[maxKey] + diff);
    }

    return result;
}

// ── 打开重铸选择弹窗 ──
window.openReforgeModal = function() {
    var monster = _reforgeState.monsterId ? gameState.monsters.find(function(m){ return m.id === _reforgeState.monsterId; }) : null;
    if (!monster) { showNotification(T('noMonsters','ui'), 'warning'); return; }
    if (monster.status !== 'idle') { showNotification(T('working','monsterStatus'), 'warning'); return; }

    var cfg = REFORGE_CONFIG[_reforgeState.mode];
    // 扣费检查
    var canAfford = Object.keys(cfg.cost).every(function(r){ return (gameState[r]||0) >= cfg.cost[r]; });
    if (!canAfford) { showNotification(T('notEnoughResource','notifications'), 'error'); return; }

    // 扣费
    Object.keys(cfg.cost).forEach(function(r){ gameState[r] -= cfg.cost[r]; });

    // 生成 rolls 套结果
    var rolls = [];
    for (var i = 0; i < cfg.rolls; i++) {
        rolls.push(generateReforgeResult(monster, _reforgeState.mode));
    }
    _reforgeState.pendingRolls = rolls;
    _reforgeState.currentRollIdx = 0;

    renderReforgeModal(monster, rolls, 0);
};

// ── 渲染重铸选择弹窗 ──
function renderReforgeModal(monster, rolls, activeIdx) {
    var cfg = REFORGE_CONFIG[_reforgeState.mode];
    var curStats = monster.stats;
    var bestStats = monster.reforgeBestStats || null;
    var curTotal  = STAT_KEYS.reduce(function(s,k){ return s + (curStats[k]||0); }, 0);

    // 多套方案 tab
    var tabsHtml = rolls.length > 1 ? (
        '<div style="display:flex;gap:6px;margin-bottom:12px;">' +
        rolls.map(function(r, i){
            var tot = STAT_KEYS.reduce(function(s,k){ return s+(r[k]||0); }, 0);
            var delta = tot - curTotal;
            var isActive = i === activeIdx;
            var col = delta > 0 ? '#46d164' : (delta < 0 ? '#f85149' : '#8b949e');
            return '<button onclick="switchReforgeRoll(' + i + ')" style="' +
                'flex:1;padding:6px;border-radius:8px;font-size:12px;cursor:pointer;' +
                'border:2px solid ' + (isActive ? col : '#30363d') + ';' +
                'background:' + (isActive ? col + '22' : '#161b22') + ';' +
                'color:' + (isActive ? col : '#8b949e') + ';">' +
                T('reforgeOption','monsters') + (i+1) + '<br><span style="font-size:11px;">' + (delta >= 0 ? '+' : '') + delta + '</span>' +
                '</button>';
        }).join('') +
        '</div>'
    ) : '';

    // 当前方案属性对比
    var activeResult = rolls[activeIdx];
    var newTotal = STAT_KEYS.reduce(function(s,k){ return s+(activeResult[k]||0); }, 0);
    var totalDelta = newTotal - curTotal;
    var totalColor = totalDelta > 0 ? '#46d164' : (totalDelta < 0 ? '#f85149' : '#8b949e');

    var compHtml = '<div style="background:#0d1117;border-radius:8px;padding:10px;margin-bottom:12px;">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">' +
        '<span style="font-size:13px;font-weight:bold;">' + monster.name + ' ' + T('stats','monsters') + '</span>' +
        '<span style="font-size:12px;color:' + totalColor + ';">' + T('current','common') + ' ' + curTotal + ' → ' + newTotal + ' (' + (totalDelta >= 0 ? '+' : '') + totalDelta + ')</span>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">' +
        STAT_KEYS.map(function(k){
            var oldV = curStats[k]||0, newV = activeResult[k]||0;
            var delta = newV - oldV;
            var col = delta > 0 ? '#46d164' : (delta < 0 ? '#f85149' : '#8b949e');
            var isLocked = _reforgeState.lockedStats.indexOf(k) >= 0;
            var bestV = bestStats ? (bestStats[k]||0) : null;
            return '<div style="text-align:center;padding:8px 4px;border-radius:6px;background:#21262d;' +
                'border:2px solid ' + (isLocked ? '#58a6ff' : (delta > 0 ? '#46d16433' : (delta < 0 ? '#f8514933' : '#30363d'))) + ';">' +
                '<div style="font-size:10px;color:#8b949e;">' + STAT_LABELS[k] + (isLocked ? ' 🔒' : '') + '</div>' +
                '<div style="font-size:11px;color:#8b949e;">' + oldV + '</div>' +
                '<div style="font-size:18px;font-weight:bold;color:#e6edf3;">' + newV + '</div>' +
                '<div style="font-size:11px;color:' + col + ';">' + (delta >= 0 ? '+' : '') + delta + '</div>' +
                (bestV !== null ? '<div style="font-size:9px;color:#ffd700;">' + T('max','common') + ':' + bestV + '</div>' : '') +
                '</div>';
        }).join('') +
        '</div></div>';

    // 保底状态
    var pityCount = monster.reforgePityCount || 0;
    var pityInfo = '';
    var cfgLabel = T('reforge' + _reforgeState.mode.charAt(0).toUpperCase() + _reforgeState.mode.slice(1), 'monsters') || cfg.name;
    if (pityCount >= REFORGE_PITY_THRESHOLD && totalDelta <= 0) {
        pityInfo = '<div style="color:#ffd700;background:#ffd70011;border:1px solid #ffd70033;border-radius:6px;padding:6px 10px;margin-bottom:10px;font-size:12px;">' +
            '✨ <strong>' + _pityTriggeredText() + '</strong></div>';
    }

    var modalContent = '<div class="modal-header">🧬 ' + T('reforgeTitle','monsters') + ' — ' + cfgLabel + '</div>' +
        '<div style="padding:4px 0 12px;font-size:12px;color:#8b949e;">' + T('reforgeResult','monsters') + '：' + cfgLabel + '｜' + (rolls.length > 1 ? T('chooseBest','monsters') : T('reforgeConfirm','monsters')) + '</div>' +
        tabsHtml + pityInfo + compHtml +
        '<div class="modal-buttons" style="gap:8px;">' +
        '<button class="btn btn-primary" onclick="applyReforge(' + activeIdx + ')" style="flex:2;">✅ ' + T('reforgeApply','monsters') + (rolls.length > 1 ? ' ' + T('reforgeOption','monsters') + (activeIdx+1) : '') + '</button>' +
        '<button class="btn btn-danger" onclick="cancelReforge()" style="flex:1;">❌ ' + T('reforgeCancel','monsters') + '</button>' +
        '</div>';

    showModal(modalContent);
}

// ── 切换查看的方案 ──
window.switchReforgeRoll = function(idx) {
    _reforgeState.currentRollIdx = idx;
    var monster = gameState.monsters.find(function(m){ return m.id === _reforgeState.monsterId; });
    if (!monster) return;
    renderReforgeModal(monster, _reforgeState.pendingRolls, idx);
};

// ── 应用选定方案 ──
window.applyReforge = function(rollIdx) {
    var monster = gameState.monsters.find(function(m){ return m.id === _reforgeState.monsterId; });
    if (!monster || !_reforgeState.pendingRolls[rollIdx]) { closeModal(); return; }

    var newStats = _reforgeState.pendingRolls[rollIdx];
    var oldTotal = STAT_KEYS.reduce(function(s,k){ return s + (monster.stats[k]||0); }, 0);
    var newTotal = STAT_KEYS.reduce(function(s,k){ return s + (newStats[k]||0); }, 0);

    // ── 保底机制检查 ──
    var pityCount = monster.reforgePityCount || 0;
    var bestStats = monster.reforgeBestStats;
    var bestTotal = bestStats ? STAT_KEYS.reduce(function(s,k){ return s + (bestStats[k]||0); }, 0) : oldTotal;

    if (pityCount >= REFORGE_PITY_THRESHOLD && newTotal < bestTotal) {
        // 保底触发：强制将新总量提升到历史最佳总量
        var boost = bestTotal - newTotal;
        // 按当前比例追加到各自由属性
        var freeKeys = STAT_KEYS.filter(function(k){ return _reforgeState.lockedStats.indexOf(k) < 0; });
        var freeSum = freeKeys.reduce(function(s,k){ return s + (newStats[k]||0); }, 0);
        var distributed = 0;
        freeKeys.forEach(function(k, i){
            var add = (i < freeKeys.length - 1) ? Math.round(boost * (newStats[k] / freeSum)) : (boost - distributed);
            newStats[k] = (newStats[k]||0) + add;
            distributed += add;
        });
        newTotal = STAT_KEYS.reduce(function(s,k){ return s + (newStats[k]||0); }, 0);
        showNotification('✨ 保底触发！属性总和保证达到历史最佳水平', 'success');
    }

    // 记录旧属性用于通知文字
    var oldStatsCopy = {};
    STAT_KEYS.forEach(function(k){ oldStatsCopy[k] = monster.stats[k] || 0; });

    // 应用新属性
    STAT_KEYS.forEach(function(k){ monster.stats[k] = newStats[k] || 0; });

    // 更新历史最佳
    if (!bestStats || newTotal > bestTotal) {
        monster.reforgeBestStats = Object.assign({}, newStats);
    }

    // 更新保底计数
    if (newTotal > oldTotal) {
        monster.reforgePityCount = 0; // 提升了就清零
    } else {
        monster.reforgePityCount = (monster.reforgePityCount || 0) + 1;
    }

    // 构造差异文字
    var diffParts = STAT_KEYS.map(function(k){
        var d = (newStats[k]||0) - (oldStatsCopy[k]||0);
        return STAT_LABELS[k] + (d >= 0 ? '+' : '') + d;
    }).join(' ');
    var notification = '🧬 ' + monster.name + ' ' + T('reforge','monsters') + '! ' + oldTotal + ' → ' + newTotal + '（' + diffParts + '）';
    showNotification(notification, newTotal >= oldTotal ? 'success' : 'warning');

    _reforgeState.pendingRolls = [];
    closeModal();
    updateResources();
    renderTech();
    renderMonsterSidebar();
};

// ── 放弃重铸（不退费）──
window.cancelReforge = function() {
    _reforgeState.pendingRolls = [];
    closeModal();
    showNotification(T('reforgeCancel','monsters'), 'warning');
    renderTech();
};

// ── i18n 辅助函数（重铸面板用）──
function _reforgeIntroDesc() {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return 'Reforge monster stats randomly by consuming resources, seeking better stat distributions. Three modes available with a pity system.';
    if (lang === 'ja') return 'リソースを消費してモンスターのステータスをランダムに再鍛造します。3つのモードと保証システムを搭載。';
    return '通过消耗资源随机重铸怪兽属性分配，追求更好的属性组合。<br>解锁三种重铸模式，搭配保底机制，让每次投入都有意义。';
}
function _reforgeSubtitle() {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return 'Random Reforge · Pity System';
    if (lang === 'ja') return 'ランダム再鍛造 · 保証システム';
    return '随机重铸 · 保底机制';
}
function _pityTriggeredText() {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return 'Pity triggered! Next reforge guarantees stat total ≥ personal best';
    if (lang === 'ja') return '保証発動！次の再鍛造でステータス合計が過去最高以上を保証';
    return '保底已触发！下次重铸保证属性总和 ≥ 历史最佳';
}
function _pityProgressText(count, remain) {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return count + ' consecutive reforges without improvement, ' + remain + ' more until pity';
    if (lang === 'ja') return '連続 ' + count + ' 回改善なし、あと ' + remain + ' 回で保証発動';
    return '已连续 ' + count + ' 次未提升，再 ' + remain + ' 次触发保底';
}
function _reforgeGenLabel(rolls) {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return 'Generate ' + rolls + ' Options';
    if (lang === 'ja') return rolls + ' 案を生成';
    return '生成 ' + rolls + ' 套方案';
}
function _getReforgeModeDesca() {
    var lang = (typeof i18n !== 'undefined') ? i18n.currentLang : 'zh';
    if (lang === 'en') return {
        basic:    'Randomly reforges all stats. New total is within <strong>85%~120%</strong> of the original.',
        advanced: 'Lock <strong>1 stat</strong> from reforging. Remaining stats are within <strong>90%~125%</strong> of original.',
        perfect:  'Generate <strong>3 options</strong> at once, then pick the one you prefer. Range: <strong>95%~130%</strong>.'
    };
    if (lang === 'ja') return {
        basic:    '全ステータスをランダムに再鍛造。新合計は元の<strong>85%～120%</strong>の範囲。',
        advanced: '<strong>1項目</strong>を固定して再鍛造から除外。残りは<strong>90%～125%</strong>の範囲。',
        perfect:  '<strong>3案</strong>を同時生成し、好みの案を選択。範囲は<strong>95%～130%</strong>。'
    };
    return {
        basic:    '随机重铸所有属性，新总量在原总量 <strong>85%~120%</strong> 范围内随机分配。',
        advanced: '可锁定 <strong>1个属性</strong> 不参与重铸，其余属性在原总量 <strong>90%~125%</strong> 范围内重铸。',
        perfect:  '一次性生成 <strong>3套备选方案</strong>，从中选择最满意的一套应用，属性范围 <strong>95%~130%</strong>。'
    };
}

// ── 旧接口兼容（已废弃，保留壳以防旧存档调用）──
window.performBreakthrough = function() {
    showNotification(T('reforgeTitle','monsters'), 'info');
};

window.unlockTech = function(techId) {
    var tech = technologies[techId];
    if (!tech) return;

    // 前置检查
    var prereqMet = !tech.prereq || tech.prereq.length === 0 || tech.prereq.every(function(p) {
        return gameState.technologies[p];
    });
    if (!prereqMet) { showNotification(T('prereqNeeded','tech'), 'error'); return; }

    var canAfford = Object.keys(tech.cost).every(function(resource) {
        return gameState[resource] >= tech.cost[resource];
    });
    if (!canAfford) { showNotification(T('notEnough','tech'), 'error'); return; }

    // 扣除费用
    Object.keys(tech.cost).forEach(function(resource) {
        gameState[resource] -= tech.cost[resource];
    });
    gameState.technologies[techId] = true;

    // 应用效果
    var effects = tech.effects || {};

    // 扩建类：解锁农田
    if (effects.extraPlots) {
        var currentUnlocked = gameState.plots.filter(function(p){ return !p.locked; }).length;
        var toUnlock = effects.extraPlots;
        var unlockCount = 0;
        for (var i = currentUnlocked; i < gameState.plots.length && unlockCount < toUnlock; i++) {
            if (gameState.plots[i].locked) { gameState.plots[i].locked = false; unlockCount++; }
        }
        // 如果现有格子不够，动态扩展（支持 unlimitedPlots 科技后逻辑）
        while (unlockCount < toUnlock) {
            var newPlotId = gameState.plots.length;
            gameState.plots.push({
                id: newPlotId, locked: false,
                unlockCost: { coins: 0, materials: 0 },
                crop: null, plantedAt: null, progress: 0,
                assignedMonster: null, autoCrop: null, growthBonus: 1
            });
            unlockCount++;
        }
    }

    // 能量上限提升（暂由 main.js tick 动态计算，此处可额外存标记）
    if (effects.maxLevel) {
        // 存入 gameState 让怪兽培养逻辑读取
        if (!gameState.maxMonsterLevel || gameState.maxMonsterLevel < effects.maxLevel) {
            gameState.maxMonsterLevel = effects.maxLevel;
        }
    }
    if (effects.maxMonsters) {
        gameState.maxMonstersCapacity = effects.maxMonsters;
    }

    showNotification('✅ ' + T('unlock','tech') + '：' + (TName(techId,'tech') || tech.name) + '！', 'success');
    if (typeof briefTech === 'function') briefTech(tech.name);
    updateResources();
    renderTech();
    renderFarm();
};
