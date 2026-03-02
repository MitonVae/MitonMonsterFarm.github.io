// ==================== 资源详情展开模块 ====================

// 资源静态描述数据
var RESOURCE_INFO = {
    coins: {
        name: '金币',
        color: '#f0c53d',
        valueColor: '#f0c53d',
        desc: '农场的核心货币。驱动一切扩张、科技和探索活动，同时也是维持怪兽工作的持续性开销。',
        sources: [
            '作物收获时自动获得售卖收益',
            '派遣怪兽外出售卖（消耗 10 食物，30 秒后带回金币）',
            '探索区域结算奖励',
            '处理多余怪兽可获得一次性金币奖励',
        ],
        uses: [
            '解锁锁定的农田地块',
            '购买探索区域通行证',
            '研究科技树中的升级项',
            '⚠️ 维护费：每块有怪兽驻守的地块每分钟消耗约 1.8 金币，金币耗尽将导致怪兽效率下降 50%',
        ],
        tip: '💡 农田维护费随驻守地块增加而增长，请确保金币来源充足再大规模扩张！'
    },
    food: {
        name: '食物',
        color: '#46d164',
        valueColor: '#46d164',
        desc: '怪兽的口粮，也是能量恢复的催化剂。在岗怪兽会持续消耗食物，储量充足时能量恢复速度也更快。',
        sources: [
            '作物收获时产出（主要来源）',
            '探索某些区域可带回少量食物',
            '处理怪兽时可获得少量食物奖励',
        ],
        uses: [
            '派遣怪兽外出售卖时消耗 10 食物',
            '繁殖新怪兽时消耗 100 食物',
            '⚡ 能量加速：每 10 食物可使能量额外恢复 1/10s（最多 +5）',
            '⚠️ 维护消耗：每只在岗怪兽每 10 秒消耗约 0.5 食物，食物耗尽导致效率下降 50%',
        ],
        tip: '💡 食物既是生产资料也是能量催化剂，保持充足储量可让农场高速运转！'
    },
    materials: {
        name: '材料',
        color: '#8b949e',
        valueColor: '#c9d1d9',
        desc: '从野外探索中采集的建筑材料。解锁高级地块和科技的必要资源，不会被动消耗。',
        sources: [
            '探索碎石丘陵、深邃洞穴等区域获得',
            '部分探索区域结算时的奖励',
        ],
        uses: [
            '解锁高编号的农田地块（通常需要大量材料）',
            '解锁科技树中部分节点的前置条件',
        ],
        tip: '💡 派遣力量属性高的怪兽探索材料类区域，收益加成更显著。'
    },
    research: {
        name: '研究点',
        color: '#58a6ff',
        valueColor: '#58a6ff',
        desc: '通过探索积累的科研成果。是解锁科技树各项升级的唯一资源，不会被动消耗。',
        sources: [
            '探索野外草原、迷雾森林、古代遗迹等区域',
            '智力属性高的怪兽探索时研究点收益更多',
            '解锁「探索强化」科技后所有探索研究奖励提升 50%',
        ],
        uses: [
            '研究灌溉系统（加速作物生长）',
            '研究先进农业（提升产量与作物价值）',
            '解锁探索强化、繁殖加速等各类科技',
        ],
        tip: '💡 优先研究「探索强化」，可让后续所有探索奖励（含材料、研究点）提升 50%！'
    },
    energy: {
        name: '能量',
        color: '#2ea043',
        valueColor: '#46d164',
        desc: '手动探索消耗的行动力，每次点击都会推进探索进度。能量会自动恢复，食物充足时恢复更快。',
        sources: [
            '每 10 秒自动恢复 1 点（基础）',
            '食物加速恢复：每 10 食物额外 +1/10s（最多额外 +5，即最快 +6/10s）',
            '上限基础为 100，每拥有 1 只怪兽上限 +20（最高 500）',
        ],
        uses: [
            '手动点击「探索」按钮时消耗（不同区域消耗 5~20 点不等）',
            '⚡ 派遣怪兽自动探索不消耗能量',
        ],
        tip: '💡 增加怪兽数量不仅能帮你自动干活，还会扩大能量上限！'
    }
};

// 当前展开的资源 key
var _openResDetail = null;

// ── Popover 单例 ──
var _resPopover = null;

function _getOrCreatePopover() {
    if (!_resPopover) {
        _resPopover = document.createElement('div');
        _resPopover.id = 'resDetailPopover';
        _resPopover.className = 'res-popover';
        document.body.appendChild(_resPopover);

        // 点击弹窗外部关闭
        document.addEventListener('mousedown', function(e) {
            if (_resPopover && !_resPopover.contains(e.target)) {
                // 如果点的是资源行本身，交给 toggleResourceDetail 处理，此处忽略
                var anchor = e.target.closest('.res-clickable');
                if (!anchor) _closePopover();
            }
        }, true);
    }
    return _resPopover;
}

function _closePopover() {
    if (_resPopover) {
        _resPopover.classList.remove('open');
    }
    // 重置所有箭头
    Object.keys(RESOURCE_INFO).forEach(function(k) {
        var c = document.getElementById('chevron-' + k);
        if (c) c.classList.remove('open');
    });
    _openResDetail = null;
}

// 切换展开/收起
window.toggleResourceDetail = function(key) {
    var anchorEl  = document.querySelector('.sidebar-resource[data-res="' + key + '"]');
    var chevronEl = document.getElementById('chevron-' + key);

    var isSameKey = (_openResDetail === key);

    // 先关闭
    _closePopover();

    if (isSameKey) return; // 点同一个 → 仅关闭

    // 定位并填充
    var popover = _getOrCreatePopover();
    _fillDetail(key, popover);

    if (anchorEl) {
        var rect = anchorEl.getBoundingClientRect();
        // 默认显示在资源行右侧，紧贴侧边栏
        var left = rect.right + 8;
        var top  = rect.top;
        // 防止超出右侧视口
        var popW = 268;
        if (left + popW > window.innerWidth - 8) {
            left = window.innerWidth - popW - 8;
        }
        // 防止超出底部视口
        popover.style.left = left + 'px';
        popover.style.top  = top + 'px';
        popover.style.maxHeight = (window.innerHeight - top - 16) + 'px';
    }

    popover.classList.add('open');
    if (chevronEl) chevronEl.classList.add('open');
    _openResDetail = key;
};

// 填充详情 HTML（现在写入 popover 节点）
function _fillDetail(key, el) {
    var info = RESOURCE_INFO[key];
    if (!info) return;

    // 读取当前值（来自游戏状态）
    var currentVal = '—';
    var extraLine  = '';
    if (typeof gameState !== 'undefined') {
        switch (key) {
            case 'coins':    currentVal = gameState.coins;    break;
            case 'food':     currentVal = gameState.food;     break;
            case 'materials':currentVal = gameState.materials;break;
            case 'research': currentVal = gameState.research; break;
            case 'energy':
                currentVal = gameState.energy + ' / ' + gameState.maxEnergy;
                var pct = Math.round(gameState.energy / gameState.maxEnergy * 100);
                extraLine = '<div style="margin-top:6px;margin-bottom:2px;">' +
                    '<div style="height:4px;background:#21262d;border-radius:2px;overflow:hidden;">' +
                    '<div style="width:' + pct + '%;height:100%;background:#2ea043;border-radius:2px;transition:width 0.3s;"></div>' +
                    '</div></div>';
                break;
        }
    }

    var sourcesHtml = info.sources.map(function(s) {
        return '<li>' + s + '</li>';
    }).join('');

    var usesHtml = info.uses.map(function(u) {
        return '<li>' + u + '</li>';
    }).join('');

    el.innerHTML =
        '<div class="res-detail-inner">' +
            // 当前数值
            '<div class="res-detail-current">' +
                '<span class="res-detail-current-label">当前数量</span>' +
                '<span class="res-detail-current-value" style="color:' + info.valueColor + ';">' + currentVal + '</span>' +
            '</div>' +
            extraLine +
            // 描述
            '<div class="res-detail-desc">' + info.desc + '</div>' +
            // 来源 & 用途
            '<div class="res-detail-rows">' +
                '<div class="res-detail-row">' +
                    '<span class="res-detail-row-label">📥 获取</span>' +
                    '<ul class="res-detail-row-text" style="margin:0;padding-left:14px;">' + sourcesHtml + '</ul>' +
                '</div>' +
                '<div class="res-detail-row">' +
                    '<span class="res-detail-row-label">📤 用途</span>' +
                    '<ul class="res-detail-row-text" style="margin:0;padding-left:14px;">' + usesHtml + '</ul>' +
                '</div>' +
                '<div class="res-detail-row" style="margin-top:4px;padding-top:6px;border-top:1px solid #21262d;">' +
                    '<span style="font-size:11.5px;color:#8b949e;line-height:1.5;">' + info.tip + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
}

// 若当前有展开的详情，在资源更新时刷新其数值
window.refreshOpenResourceDetail = function() {
    if (_openResDetail && _resPopover && _resPopover.classList.contains('open')) {
        _fillDetail(_openResDetail, _resPopover);
    }
};

// ==================== 资源速率估算（供移动端顶栏使用）====================
// 返回 { coins: N, food: N, materials: N } 每分钟净变化量
window.getResourceRates = function() {
    if (typeof gameState === 'undefined') return { coins: 0, food: 0, materials: 0 };

    var coinsPerMin = 0;
    var foodPerMin = 0;
    var materialsPerMin = 0;

    // 金币：每个已种植的地块约每分钟产出（基于作物类型粗估）
    // 维护费：每个驻守怪兽的地块 1.8 金币/分钟
    if (typeof cropTypes !== 'undefined' && gameState.plots) {
        gameState.plots.forEach(function(p) {
            if (p.locked || !p.crop) return;
            var ct = cropTypes.find(function(c) { return c.id === p.crop; });
            if (!ct) return;
            // 收益速率 = 出售价 / 生长时间(分钟)
            var growMins = (ct.growTime || 60000) / 60000;
            coinsPerMin += (ct.sellPrice || 0) / growMins;
            foodPerMin += (ct.foodYield || 0) / growMins;
            // 维护费
            if (p.assignedMonster) coinsPerMin -= 1.8;
        });
    }

    // 怪兽食物消耗：每只在岗怪兽 3 食物/分钟
    if (gameState.monsters) {
        var workingMonsters = gameState.monsters.filter(function(m) {
            return m.status !== 'idle';
        }).length;
        foodPerMin -= workingMonsters * 3;
    }

    return {
        coins: Math.round(coinsPerMin),
        food: Math.round(foodPerMin),
        materials: Math.round(materialsPerMin)
    };
};
