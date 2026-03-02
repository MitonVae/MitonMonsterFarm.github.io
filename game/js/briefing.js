// ==================== 实时简报系统 ====================
// 类型 → { icon, get label() }
var BRIEFING_TYPES = {
    catch:   { icon: '🎉', get label() { return T('catch',   'briefing'); } },
    levelup: { icon: '⬆️', get label() { return T('levelup', 'briefing'); } },
    harvest: { icon: '🌾', get label() { return T('harvest', 'briefing'); } },
    explore: { icon: '🗺', get label() { return T('explore', 'briefing'); } },
    event:   { icon: '⚡', get label() { return T('event',   'briefing'); } },
    tech:    { icon: '🔬', get label() { return T('tech',    'briefing'); } },
    breed:   { icon: '💕', get label() { return T('breed',   'briefing'); } },
    save:    { icon: '💾', get label() { return T('save',    'briefing'); } },
    system:  { icon: 'ℹ️', get label() { return T('system',  'briefing'); } }
};

var _briefingLog   = [];   // 完整历史
var _MAX_LOG       = 50;   // 最多保留条数
var _badgeTimer    = null;

/**
 * 添加一条简报
 * @param {string} type   - 见 BRIEFING_TYPES
 * @param {string} text   - 支持 <strong> 等简单 HTML
 */
function addBriefing(type, text) {
    var meta = BRIEFING_TYPES[type] || BRIEFING_TYPES.system;
    var now  = new Date();
    var timeStr = _padZ(now.getHours()) + ':' + _padZ(now.getMinutes()) + ':' + _padZ(now.getSeconds());

    var entry = { type: type, icon: meta.icon, text: text, time: timeStr };
    _briefingLog.unshift(entry);           // 最新在顶部
    if (_briefingLog.length > _MAX_LOG) _briefingLog.pop();

    _renderBriefing(entry);
    _flashBadge();
}

function _padZ(n) { return n < 10 ? '0' + n : '' + n; }

// 将单条记录插入 DOM（最新插在最顶部）
function _renderBriefing(entry) {
    var list = document.getElementById('briefingList');
    if (!list) return;

    // 移除"暂无动态"占位符
    var empty = list.querySelector('.briefing-empty');
    if (empty) empty.remove();

    // 超出上限时移除末尾旧条目
    var items = list.querySelectorAll('.briefing-item');
    if (items.length >= _MAX_LOG) {
        list.removeChild(items[items.length - 1]);
    }

    var div = document.createElement('div');
    div.className = 'briefing-item type-' + entry.type;
    div.innerHTML =
        '<span class="briefing-icon">' + entry.icon + '</span>' +
        '<span class="briefing-text">'  + entry.text + '</span>' +
        '<span class="briefing-time">'  + entry.time + '</span>';

    // 插到最前面（最新在顶）
    list.insertBefore(div, list.firstChild);
}

// NEW 角标：出现 3 秒后消失
function _flashBadge() {
    var badge = document.getElementById('briefingBadge');
    if (!badge) return;
    badge.style.display = 'inline-block';
    if (_badgeTimer) clearTimeout(_badgeTimer);
    _badgeTimer = setTimeout(function() {
        badge.style.display = 'none';
    }, 3000);
}

// ==================== 各模块的快捷推送函数 ====================

/** 捕获怪兽 */
function briefCatch(monsterName, zoneName) {
    var tpl = T('catchMsg', 'briefing');
    addBriefing('catch', tpl.replace('{name}', monsterName).replace('{zone}', zoneName));
}

/** 怪兽升级 */
function briefLevelUp(monsterName, level) {
    var tpl = T('levelupMsg', 'briefing');
    addBriefing('levelup', tpl.replace('{name}', monsterName).replace('{lv}', level));
}

/** 作物收获（含怪兽自动收获）*/
function briefHarvest(cropName, coins, food, byMonster) {
    var tpl, text;
    if (byMonster) {
        tpl  = T('harvestAutoMsg', 'briefing');
        text = tpl.replace('{who}', byMonster)
                  .replace('{crop}', cropName)
                  .replace('{coins}', coins)
                  .replace('{food}', food);
    } else {
        tpl  = T('harvestManualMsg', 'briefing');
        text = tpl.replace('{crop}', cropName)
                  .replace('{coins}', coins)
                  .replace('{food}', food);
    }
    addBriefing('harvest', text);
}

/** 探索区域结算 */
function briefExplore(zoneName, rewards, monsterName) {
    var rewardStr = _fmtRewards(rewards);
    var who;
    if (monsterName) {
        who = T('exploreWho', 'briefing').replace('{name}', monsterName);
    } else {
        who = T('exploreWhoManual', 'briefing');
    }
    var tpl = T('exploreMsg', 'briefing');
    addBriefing('explore', tpl.replace('{who}', who).replace('{zone}', zoneName).replace('{rewards}', rewardStr));
}

/** 随机事件 */
function briefEvent(title, result) {
    var tpl = T('eventMsg', 'briefing');
    addBriefing('event', tpl.replace('{title}', title).replace('{result}', result));
}

/** 科技解锁 */
function briefTech(techName) {
    var tpl = T('techMsg', 'briefing');
    addBriefing('tech', tpl.replace('{name}', techName));
}

/** 繁殖后代 */
function briefBreed(childName, parents) {
    var tpl = T('breedMsg', 'briefing');
    addBriefing('breed', tpl.replace('{child}', childName).replace('{parents}', parents));
}

/** 手动 / 自动保存 */
function briefSave(auto) {
    addBriefing('save', auto ? T('saveAuto', 'briefing') : T('saveManual', 'briefing'));
}

/** 系统消息（如怪兽被召回、地块解锁等）*/
function briefSystem(msg) {
    addBriefing('system', msg);
}

// 格式化奖励对象为短字符串
function _fmtRewards(rewards) {
    var parts = [];
    if (rewards.coins    > 0) parts.push('+' + rewards.coins    + '💰');
    if (rewards.food     > 0) parts.push('+' + rewards.food     + '🍎');
    if (rewards.materials> 0) parts.push('+' + rewards.materials+ '🪨');
    if (rewards.research > 0) parts.push('+' + rewards.research + '🔬');
    return parts.length ? parts.join(' ') : T('rewardsNone', 'briefing');
}
