// ==================== 数字格式化模块 (numformat.js) ====================
// 提供3种全局数字显示格式，由玩家在「设置」中选择。
// 格式类型：
//   'comma'    → 逗号分隔   1,234,567
//   'suffix'   → 大数后缀   1.23M / 456.7K / 2.1B
//   'sci'      → 科学计数   1.23e6
// =====================================================================

// 当前格式设置，默认逗号
var NUM_FORMAT = (function() {
    var _fmt = 'comma';   // 内部存储

    // 从localStorage读取持久化设置
    try {
        var saved = localStorage.getItem('numFormat');
        if (saved && ['comma','suffix','sci'].indexOf(saved) !== -1) _fmt = saved;
    } catch(e) {}

    return {
        get: function() { return _fmt; },
        set: function(v) {
            if (['comma','suffix','sci'].indexOf(v) !== -1) {
                _fmt = v;
                try { localStorage.setItem('numFormat', v); } catch(e) {}
                // 通知全局刷新资源显示
                if (typeof updateResources === 'function') updateResources();
            }
        }
    };
})();

// ──────────────────────────────────────────────
// 核心格式化函数
// n: number  decimals: 小数位数(suffix/sci模式)
// ──────────────────────────────────────────────
function formatNum(n, decimals) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    n = Number(n);
    decimals = (decimals === undefined) ? 2 : decimals;

    var fmt = NUM_FORMAT.get();

    // ── 逗号模式 ──
    if (fmt === 'comma') {
        // 整数直接加逗号；小数保留2位
        if (Number.isInteger(n) || Math.abs(n) >= 100) {
            return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return n.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // ── 大数后缀模式 ──
    if (fmt === 'suffix') {
        var abs = Math.abs(n);
        var sign = n < 0 ? '-' : '';
        if (abs < 1000) {
            // 小于1000直接显示
            return sign + (Number.isInteger(n) ? Math.round(abs) : abs.toFixed(1));
        }
        var tiers = [
            { v: 1e18, s: 'E' },
            { v: 1e15, s: 'P' },
            { v: 1e12, s: 'T' },
            { v: 1e9,  s: 'B' },
            { v: 1e6,  s: 'M' },
            { v: 1e3,  s: 'K' }
        ];
        for (var i = 0; i < tiers.length; i++) {
            if (abs >= tiers[i].v) {
                var val = abs / tiers[i].v;
                // 根据大小决定小数位：>=100用0位，>=10用1位，否则2位
                var d = val >= 100 ? 0 : (val >= 10 ? 1 : decimals);
                return sign + val.toFixed(d) + tiers[i].s;
            }
        }
        return sign + Math.round(abs).toString();
    }

    // ── 科学计数模式 ──
    if (fmt === 'sci') {
        var abs2 = Math.abs(n);
        var sign2 = n < 0 ? '-' : '';
        if (abs2 < 1000) {
            return sign2 + (Number.isInteger(n) ? Math.round(abs2) : abs2.toFixed(1));
        }
        return sign2 + abs2.toExponential(decimals).replace('e+','e').replace('e0','');
    }

    return String(Math.round(n));
}

// 快捷别名（整数，不显示小数）
function fmt(n) { return formatNum(n, 0); }

// 带颜色的差值显示（正数绿色，负数红色）
function formatDiff(n) {
    var s = (n > 0 ? '+' : '') + formatNum(n, 1);
    var color = n > 0 ? '#4caf50' : (n < 0 ? '#f44336' : '#aaa');
    return '<span style="color:' + color + '">' + s + '</span>';
}

// ──────────────────────────────────────────────
// UI：在「设置」面板注入格式切换器
// 由 ui.js 的 renderSettings() 调用
// ──────────────────────────────────────────────
function renderNumFormatSetting() {
    var options = [
        { id: 'comma',  label: '逗号分隔', example: '1,234,567' },
        { id: 'suffix', label: '大数后缀', example: '1.23M' },
        { id: 'sci',    label: '科学计数', example: '1.23e6' }
    ];
    var current = NUM_FORMAT.get();

    var html = '<div class="setting-group" id="numFormatGroup">'
        + '<div class="setting-label">数字显示格式</div>'
        + '<div class="numfmt-options">';

    options.forEach(function(opt) {
        var active = opt.id === current ? ' active' : '';
        html += '<button class="numfmt-btn' + active + '" data-fmt="' + opt.id + '" '
            + 'onclick="NUM_FORMAT.set(this.dataset.fmt); document.querySelectorAll(\'.numfmt-btn\').forEach(function(b){b.classList.remove(\'active\')}); this.classList.add(\'active\')">'
            + '<span class="numfmt-name">' + opt.label + '</span>'
            + '<span class="numfmt-example">' + opt.example + '</span>'
            + '</button>';
    });

    html += '</div></div>';
    return html;
}
