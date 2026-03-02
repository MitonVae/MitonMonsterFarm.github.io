// ==================== 国际化模块 ====================
// 支持语言：zh（中文，默认）、en（英语）、ja（日语）

var i18n = {
    currentLang: 'zh',

    init: function() {
        var saved = localStorage.getItem('mf_lang');
        if (saved && ['zh','en','ja'].indexOf(saved) !== -1) {
            this.currentLang = saved;
        }
    },

    setLang: function(lang) {
        if (['zh','en','ja'].indexOf(lang) === -1) return;
        this.currentLang = lang;
        localStorage.setItem('mf_lang', lang);
    },

    t: function(key, category) {
        var dict = i18n.translations[this.currentLang];
        if (!dict) dict = i18n.translations['zh'];
        if (category) {
            // 支持嵌套分类，如 'tech.category'
            var parts = category.split('.');
            var sec = dict;
            for (var i = 0; i < parts.length; i++) {
                sec = sec ? sec[parts[i]] : undefined;
            }
            if (sec && sec[key] !== undefined) return sec[key];
            // fallback to zh
            var fbSec = i18n.translations['zh'];
            for (var j = 0; j < parts.length; j++) {
                fbSec = fbSec ? fbSec[parts[j]] : undefined;
            }
            if (fbSec && fbSec[key] !== undefined) return fbSec[key];
            return key;
        }
        if (dict[key] !== undefined) return dict[key];
        if (i18n.translations['zh'][key] !== undefined) return i18n.translations['zh'][key];
        return key;
    },

    // 获取游戏数据名称（作物/怪兽/科技等）
    getName: function(id, type) {
        var lang = this.currentLang;
        var data = i18n.gameData[lang];
        if (!data) data = i18n.gameData['zh'];
        if (data[type] && data[type][id]) return data[type][id].name || id;
        var fb = i18n.gameData['zh'];
        if (fb[type] && fb[type][id]) return fb[type][id].name || id;
        return id;
    },

    getDesc: function(id, type) {
        var lang = this.currentLang;
        var data = i18n.gameData[lang];
        if (!data) data = i18n.gameData['zh'];
        if (data[type] && data[type][id]) return data[type][id].desc || '';
        var fb = i18n.gameData['zh'];
        if (fb[type] && fb[type][id]) return fb[type][id].desc || '';
        return '';
    }
};

// ==================== UI 翻译字典 ====================
i18n.translations = {

zh: {
    // 标签页
    tabs: {
        farm: '🌾 农场', monsters: '👾 怪兽', tech: '🔬 科技',
        explore: '🗺 探索', breed: '💕 繁殖', stats: '📊 统计'
    },
    // 资源
    resources: {
        coins: '金币', food: '食物', materials: '材料', research: '研究点',
        energy: '能量', land: '土地'
    },
    // 设置面板
    settings: {
        title: '⚙️ 游戏设置',
        stats: '📊 游戏统计',
        totalHarvests: '总收获', totalExplorations: '总探索',
        monstersBreed: '繁殖数', monsterCount: '怪兽数',
        fontSize: '🔤 字体大小',
        fontSmall: '小', fontMedium: '中', fontLarge: '大', fontXLarge: '特大',
        fontSmallDesc: '12px · 密度高', fontMediumDesc: '14px · 推荐',
        fontLargeDesc: '16px · 舒适', fontXLargeDesc: '18px · 无障碍',
        save: '💾 存档',
        saveBtn: '💾 手动存档', recallBtn: '🔄 一键召回',
        exportBtn: '📤 导出存档', importBtn: '📥 导入存档',
        importConfirmTitle: '⚠️ 确认导入',
        importConfirmDesc: '导入存档将覆盖当前所有进度，此操作不可撤销，是否继续？',
        importConfirmOk: '确认导入', importSuccess: '✅ 存档导入成功！', importFail: '导入失败：{err}',
        shortcuts: '⌨️ 快捷键',
        shortcut15: '切换标签页', shortcutCtrlS: '手动保存', shortcutEsc: '关闭弹窗',
        language: '🌐 语言 / Language',
        tutorialBtn: '📖 游戏教程', resetBtn: '🗑 重置游戏', closeBtn: '关闭'
    },
    // 怪兽状态
    monsterStatus: {
        idle: '空闲', working: '工作中', exploring: '探索中',
        farming: '耕作中', breeding: '繁殖中', selling: '售卖中',
        preparing: '待命'
    },
    // 稀有度
    rarity: {
        common: '普通', uncommon: '稀有', rare: '珍贵',
        epic: '史诗', legendary: '传说'
    },
    // 通用
    common: {
        confirm: '确认', cancel: '取消', close: '关闭', ok: '好的',
        yes: '是', no: '否', unlock: '解锁', locked: '未解锁',
        level: '等级', lv: 'Lv', max: '最大', current: '当前',
        cost: '费用', effect: '效果', prereq: '前置',
        unknown: '未知', none: '无'
    },
    // UI 通用
    ui: {
        noMonsters: '暂无怪兽',
        moreMonsters: '还有 {n} 只怪兽...',
        upgradeReady: '升级可用'
    },
    // 农场
    farm: {
        title: '农场', plant: '种植', harvest: '收获',
        plot: '地块', empty: '空地', growing: '生长中', ready: '可收获',
        selectCrop: '选择作物', waterNeeds: '需要浇水',
        tier: '阶段', growTime: '生长时间', yieldLabel: '产量',
        value: '价值', foodVal: '食物值',
        unlockNeeds: '解锁需要:'
    },
    // 怪兽
    monsters: {
        title: '怪兽', assign: '分配', unassign: '撤回',
        stats: '属性', strength: '力量', agility: '敏捷',
        intelligence: '智力', farming: '耕作力',
        rarity: {
            common: '普通', uncommon: '稀有', rare: '珍贵',
            epic: '史诗', legendary: '传说'
        },
        traits: '特性', noTraits: '无特性',
        reforge: '重铸属性', reforgeTitle: '属性重铸',
        reforgeNormal: '普通重铸', reforgeAdvanced: '高级重铸（锁定一项）',
        reforgePerfect: '完美重铸（三选一）',
        lockStat: '锁定属性', chooseBest: '选择最佳',
        reforgeConfirm: '确认重铸', reforgeCancel: '取消',
        reforgeResult: '重铸结果',
        reforgeOption: '方案',
        reforgeApply: '应用此方案'
    },
    // 科技
    tech: {
        title: '科技树', unlock: '解锁', unlocked: '已解锁',
        notEnough: '资源不足', prereqNeeded: '需要前置科技',
        category: {
            farming: '🌾 农业', exploration: '🗺 探索',
            monster: '👾 怪兽', breeding: '💕 繁殖',
            expansion: '🏗 扩建'
        }
    },
    // 探索
    explore: {
        title: '探索', start: '开始探索', stop: '停止',
        manual: '手动探索', auto: '派遣怪兽',
        progress: '进度', reward: '奖励',
        catchMonster: '捕获怪兽！', noCatch: '未捕获',
        energy: '能量', locked: '未解锁'
    },
    // 繁殖
    breed: {
        title: '繁殖', selectParent: '选择亲本',
        parent1: '亲本1', parent2: '亲本2',
        startBreed: '开始繁殖', offspring: '后代',
        mutation: '变异', inherit: '遗传'
    },
    // 通知
    notifications: {
        saved: '游戏已保存', harvestSuccess: '收获成功！',
        techUnlocked: '科技已解锁', monsterCaught: '捕获了新怪兽！',
        notEnoughResource: '资源不足'
    },
    // 教程
    tutorial: {
        skipBtn: '✕ 跳过', skip_btn: '✕ 跳过',
        waitExplore: '⏳ 探索并捕获怪兽中…',   wait_explore: '⏳ 探索并捕获怪兽中…',
        waitSelectMonster: '👆 请点击右侧怪兽卡片…', wait_select: '👆 请点击右侧怪兽卡片…',
        waitAssignFarm: '👆 请点击高亮的「耕作」按钮…', wait_assign: '👆 请点击高亮的「耕作」按钮…',
        waitPickPlot: '👆 请在弹窗中选择地块…',  wait_plot: '👆 请在弹窗中选择地块…',
        waitDefault: '⏳ 等待操作…',             wait_generic: '⏳ 等待操作…',
        wait_click_tab: '👆 点击高亮的「探索」标签即可继续',
        completedMsg: '🎓 引导完成！祝你农场大丰收～', complete_notify: '🎓 引导完成！祝你农场大丰收～',
        step0_title: '👋 欢迎来到怪兽农场！',
        step0_content: '这里是你的怪兽农场。<br><br>你需要 <strong style="color:#58a6ff;">捕获怪兽</strong> 来帮助耕作，同时探索获取资源。<br><br>首先，点击上方高亮的 <strong style="color:#f0c53d;">🗺 探索</strong> 标签前往探索界面！',
        step0_btn: '前往探索 →',
        step1_title: '🌿 点击「⚡ 探索」开始探索',
        step1_content: '这是 <strong style="color:#46d164;">农场边缘</strong> 区域。<br><br>点击下方高亮的 <strong style="color:#58a6ff;">⚡ 探索</strong> 按钮，<br>消耗能量推进进度，达到 <strong style="color:#f0c53d;">100%</strong> 后结算。<br><br>💡 本次探索 <strong style="color:#f0c53d;">必定捕获</strong> 一只怪兽！',
        step2_title: '🎉 成功捕获怪兽！',
        step2_content: '太棒了！你已经捕获了第一只怪兽。<br><br>现在请直接点击右侧高亮的 <strong style="color:#46d164;">派驻农田</strong> 按钮，让怪兽驻守地块！',
        step3_title: '🌾 派遣怪兽驻守农田',
        step3_content: '太棒了！现在请点击高亮的 <strong style="color:#46d164;">派驻农田</strong> 按钮，<br><br>让怪兽驻守地块，实现 <strong style="color:#58a6ff;">自动种植和收获</strong>！',
        step4_title: '📋 选择一个地块',
        step4_content: '弹出了地块选择界面！<br><br>请点击高亮的 <strong style="color:#f0c53d;">地块 #1 格子</strong>，<br>让怪兽驻守进去开始工作。',
        step5_title: '✅ 怪兽已驻守！',
        step5_content: '怪兽已经开始驻守地块了！<br><br>它会自动种植并收获作物，为你积累资源。<br><br>现在点击按钮切换到 <strong style="color:#f0c53d;">🏡 农场</strong> 查看效果！',
        step5_btn: '前往农场 →',
        step6_title: '🏡 这是你的农场',
        step6_content: '地块有三种状态：<br>⬛ <strong>空地</strong> — 点击可手动种植作物<br>🟡 <strong>生长中</strong> — 等待作物成熟<br>🟢 <strong>可收获</strong> — 点击手动收获<br><br>💡 驻守的怪兽会 <strong style="color:#46d164;">自动种植和收获</strong>！',
        step6_btn: '明白了！开始游戏 ✓'
    },
    // 简报
    briefing: {
        catch: '捕获', levelup: '升级', harvest: '收获',
        explore: '探索', event: '事件', tech: '科技',
        breed: '繁殖', save: '保存', system: '系统',
        catchMsg: '在 <strong>{zone}</strong> 捕获了 <strong>{name}</strong>！',
        levelupMsg: '<strong>{name}</strong> 升到了 <strong>Lv.{lv}</strong>！',
        harvestAutoMsg: '<strong>{who}</strong> 自动收获 <strong>{crop}</strong>，+{coins}💰 +{food}🍎',
        harvestManualMsg: '手动收获 <strong>{crop}</strong>，+{coins}💰 +{food}🍎',
        exploreMsg: '{who}<strong>{zone}</strong> 完成探索，获得 {rewards}',
        exploreWho: '<strong>{name}</strong> 在',
        exploreWhoManual: '在',
        eventMsg: '随机事件「<strong>{title}</strong>」—— {result}',
        techMsg: '解锁科技「<strong>{name}</strong>」！',
        breedMsg: '<strong>{parents}</strong> 繁殖出 <strong>{child}</strong>！',
        saveAuto: '自动存档完成。', saveManual: '手动存档完成。',
        rewardsNone: '无'
    },
    // 随机事件
    events: {
        farming_rain_title: '及时雨',
        farming_rain_desc: '一场及时雨降临农场，作物生长速度临时提升！',
        farming_rain_choice: '太好了！',
        farming_rain_effect: '作物生长加速30秒！',
        farming_pest_title: '虫害',
        farming_pest_desc: '农场遭遇虫害！是否使用食物驱虫？',
        farming_pest_choice1: '使用食物(20)',
        farming_pest_effect1: '成功驱虫！',
        farming_pest_choice2: '忽略',
        farming_pest_effect2: '作物生长受损...',
        farming_wind_title: '大风',
        farming_wind_desc: '大风吹过农场，散落了一些材料',
        farming_wind_choice: '收集',
        farming_wind_effect: '获得 {n} 材料！',
        explore_merchant_title: '神秘商人',
        explore_merchant_desc: '遇到神秘商人，愿意用材料交换金币',
        explore_merchant_choice1: '交易(材料-50 → 金币+150)',
        explore_merchant_choice2: '拒绝',
        explore_merchant_effect: '交易成功！',
        explore_monster_title: '野生怪兽',
        explore_monster_desc: '遭遇野生怪兽！是否战斗捕获？',
        explore_monster_choice1: '战斗',
        explore_monster_choice2: '逃跑',
        explore_monster_success: '捕获成功！获得新怪兽！',
        explore_monster_fail: '捕获失败，消耗能量...',
        explore_treasure_title: '宝藏',
        explore_treasure_desc: '发现了一个宝箱！',
        explore_treasure_choice: '打开',
        explore_treasure_effect: '获得奖励：{reward}',
        general_windfall_title: '意外之财',
        general_windfall_desc: '路过的旅行者给了你一些金币',
        general_windfall_choice: '收下',
        general_windfall_effect: '获得 50 金币！'
    },
    // GM面板
    gm: {
        panelTitle: '⚙️ GM 开发者面板',
        authTitle: '🔒 开发者验证',
        authDesc: '此面板为开发者 GM 工具，请输入开发者验证密码以继续。',
        authPlaceholder: '输入验证密码…',
        authWrongPwd: '密码错误，请重试。',
        authVerify: '验证',
        secResources: '💰 资源补充',
        secSpeed: '⏩ 时间流速',
        secMonster: '👾 获得怪兽',
        secTech: '🔬 科技管理',
        secZone: '🗺 探索区域管理',
        secFarm: '🌾 农场管理',
        secStats: '📊 统计数据',
        secSave: '💾 存档管理',
        secSnapshot: '🔍 当前状态快照',
        resCoins: '金币', resFood: '食物', resMaterials: '材料',
        resResearch: '研究点', resEnergy: '能量',
        resFull: '满',
        btnFillAll: '⚡ 一键大量补充（全种类）',
        speedCurrent: '当前倍速：',
        speedDesc: '（影响所有游戏循环）',
        speedTick1: '⚡ 触发1次游戏循环',
        speedTick10: '⚡×10 触发10次循环',
        monsterType: '怪兽类型', monsterLevel: '等级',
        monsterName: '自定义名称（留空则随机）',
        monsterNamePH: '怪兽名称…',
        btnAddMonster: '✅ 添加怪兽',
        btnAddAllMonsters: '⭐ 各类型各一只',
        btnUnlockTech: '🔓 解锁选中科技',
        btnUnlockAllTech: '⭐ 解锁全部科技',
        btnUnlockZone: '🔓 解锁选中区域',
        btnUnlockAllZones: '⭐ 解锁全部区域',
        btnUnlockAllPlots: '🔓 解锁全部地块',
        btnHarvestAll: '🌟 立即收获所有作物',
        btnClearAllPlots: '🧹 清空全部地块',
        btnExplore30: '探索次数→30',
        btnHarvest50: '收获次数→50',
        btnBreed10: '繁殖次数→10',
        btnResetStats: '🔄 重置全部统计',
        btnSaveNow: '💾 立即存档',
        btnExportSave: '📤 导出存档',
        btnResetGame: '💣 重置游戏',
        snapshotCoins: '金币', snapshotFood: '食物',
        snapshotMaterials: '材料', snapshotResearch: '研究',
        snapshotEnergy: '能量', snapshotMonsters: '怪兽',
        snapshotPlots: '地块', snapshotTech: '科技',
        snapshotUnit: '只',
        snapshotExplore: '探索次数', snapshotSpeed: '倍速',
        snapshotIdle: '空闲', snapshotFarming: '耕作',
        snapshotUnlocked: '已解锁', snapshotResearched: '已研究',
        btnRefreshSnapshot: '🔄 刷新快照',
        resetTitle: '⚠️ 确认重置游戏',
        resetDesc: '这将 <strong style="color:#f85149;">清除所有存档数据</strong>，包括：<br>• 所有资源、怪兽、科技<br>• 探索进度和农场地块<br>• 所有统计数据<br><br><strong style="color:#f0c53d;">此操作不可撤销！</strong>',
        resetConfirm: '💣 确认重置',
        ntfSpeedSet: '⏩ 时间倍速已设为 ×{x}',
        ntfTickDone: '⚡ 已触发 {n} 次游戏循环',
        ntfAddAllMonsters: '✅ 已添加全部 {count} 种怪兽',
        ntfUnknownType: '未知怪兽类型: {type}',
        ntfAddMonster: '✅ 已添加 {type}「{name}」Lv.{lv}',
        ntfUnlockTech: '🔓 科技「{name}」已解锁',
        ntfUnlockAllTech: '⭐ 全部科技已解锁',
        ntfUnlockZone: '🔓 区域「{name}」已解锁',
        ntfUnlockAllZones: '⭐ 全部探索区域已解锁',
        ntfUnlockAllPlots: '🔓 全部地块已解锁',
        ntfHarvestAll: '🌟 已催熟 {r} 块，收获 {h} 块作物',
        ntfClearAllPlots: '🧹 全部地块已清空',
        ntfResetStats: '🔄 统计数据已重置',
        ntfSaved: '已手动存档',
        ntfExported: '📤 存档已导出',
        ntfExportFail: '导出失败: {err}',
        ntfFoodOut: '⚠️ 食物已耗尽！怪兽效率下降50%！',
        ntfCoinsOut: '⚠️ 金币耗尽！怪兽维护费无法支付！',
        close: '关闭',
        badgeTitle: 'GM面板 (Ctrl+Shift+G)'
    }
},

// ==================== English ====================
en: {
    tabs: {
        farm: '🌾 Farm', monsters: '👾 Monsters', tech: '🔬 Tech',
        explore: '🗺 Explore', breed: '💕 Breed', stats: '📊 Stats'
    },
    resources: {
        coins: 'Coins', food: 'Food', materials: 'Materials',
        research: 'Research', energy: 'Energy', land: 'Land'
    },
    settings: {
        title: '⚙️ Settings',
        stats: '📊 Game Stats',
        totalHarvests: 'Harvests', totalExplorations: 'Explorations',
        monstersBreed: 'Bred', monsterCount: 'Monsters',
        fontSize: '🔤 Font Size',
        fontSmall: 'S', fontMedium: 'M', fontLarge: 'L', fontXLarge: 'XL',
        fontSmallDesc: '12px · Dense', fontMediumDesc: '14px · Default',
        fontLargeDesc: '16px · Comfort', fontXLargeDesc: '18px · Accessible',
        save: '💾 Save',
        saveBtn: '💾 Save Game', recallBtn: '🔄 Recall All',
        exportBtn: '📤 Export Save', importBtn: '📥 Import Save',
        importConfirmTitle: '⚠️ Confirm Import',
        importConfirmDesc: 'Importing will overwrite all current progress. This cannot be undone. Continue?',
        importConfirmOk: 'Confirm Import', importSuccess: '✅ Save imported successfully!', importFail: 'Import failed: {err}',
        shortcuts: '⌨️ Shortcuts',
        shortcut15: 'Switch Tabs', shortcutCtrlS: 'Manual Save', shortcutEsc: 'Close Modal',
        language: '🌐 Language',
        tutorialBtn: '📖 Tutorial', resetBtn: '🗑 Reset Game', closeBtn: 'Close'
    },
    monsterStatus: {
        idle: 'Idle', working: 'Working', exploring: 'Exploring',
        farming: 'Farming', breeding: 'Breeding', selling: 'Selling',
        preparing: 'Standby'
    },
    rarity: {
        common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
        epic: 'Epic', legendary: 'Legendary'
    },
    common: {
        confirm: 'Confirm', cancel: 'Cancel', close: 'Close', ok: 'OK',
        yes: 'Yes', no: 'No', unlock: 'Unlock', locked: 'Locked',
        level: 'Level', lv: 'Lv', max: 'Max', current: 'Current',
        cost: 'Cost', effect: 'Effect', prereq: 'Requires',
        unknown: 'Unknown', none: 'None'
    },
    farm: {
        title: 'Farm', plant: 'Plant', harvest: 'Harvest',
        plot: 'Plot', empty: 'Empty', growing: 'Growing', ready: 'Ready',
        selectCrop: 'Select Crop', waterNeeds: 'Needs Water',
        tier: 'Tier', growTime: 'Grow Time', yieldLabel: 'Yield',
        value: 'Value', foodVal: 'Food Value',
        unlockNeeds: 'Unlock needs:'
    },
    ui: {
        noMonsters: 'No Monsters',
        moreMonsters: '{n} more monsters...',
        upgradeReady: 'Upgrade Available'
    },
    monsters: {
        title: 'Monsters', assign: 'Assign', unassign: 'Recall',
        stats: 'Stats', strength: 'Strength', agility: 'Agility',
        intelligence: 'Intelligence', farming: 'Farming',
        rarity: {
            common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
            epic: 'Epic', legendary: 'Legendary'
        },
        traits: 'Traits', noTraits: 'No Traits',
        reforge: 'Reforge', reforgeTitle: 'Stat Reforge',
        reforgeNormal: 'Normal Reforge', reforgeAdvanced: 'Advanced (Lock 1 Stat)',
        reforgePerfect: 'Perfect (Choose from 3)',
        lockStat: 'Lock Stat', chooseBest: 'Choose Best',
        reforgeConfirm: 'Confirm', reforgeCancel: 'Cancel',
        reforgeResult: 'Reforge Result',
        reforgeOption: 'Option',
        reforgeApply: 'Apply'
    },
    tech: {
        title: 'Tech Tree', unlock: 'Unlock', unlocked: 'Unlocked',
        notEnough: 'Not Enough Resources', prereqNeeded: 'Prerequisite Required',
        category: {
            farming: '🌾 Farming', exploration: '🗺 Exploration',
            monster: '👾 Monster', breeding: '💕 Breeding',
            expansion: '🏗 Expansion'
        }
    },
    explore: {
        title: 'Explore', start: 'Start', stop: 'Stop',
        manual: 'Manual', auto: 'Send Monster',
        progress: 'Progress', reward: 'Reward',
        catchMonster: 'Monster Caught!', noCatch: 'No Catch',
        energy: 'Energy', locked: 'Locked'
    },
    breed: {
        title: 'Breeding', selectParent: 'Select Parent',
        parent1: 'Parent 1', parent2: 'Parent 2',
        startBreed: 'Start Breeding', offspring: 'Offspring',
        mutation: 'Mutation', inherit: 'Inherit'
    },
    notifications: {
        saved: 'Game Saved', harvestSuccess: 'Harvest Success!',
        techUnlocked: 'Tech Unlocked', monsterCaught: 'Caught a new monster!',
        notEnoughResource: 'Not Enough Resources'
    },
    // Tutorial
    tutorial: {
        skipBtn: '✕ Skip', skip_btn: '✕ Skip',
        waitExplore: '⏳ Exploring and catching a monster…',   wait_explore: '⏳ Exploring and catching a monster…',
        waitSelectMonster: '👆 Click a monster card on the right…', wait_select: '👆 Click a monster card on the right…',
        waitAssignFarm: '👆 Click the highlighted Assign button…',  wait_assign: '👆 Click the highlighted Assign button…',
        waitPickPlot: '👆 Select a plot in the popup…',        wait_plot: '👆 Select a plot in the popup…',
        waitDefault: '⏳ Waiting for action…',                 wait_generic: '⏳ Waiting for action…',
        wait_click_tab: '👆 Click the highlighted "Explore" tab to continue',
        completedMsg: '🎓 Tutorial complete! Good luck on your farm~', complete_notify: '🎓 Tutorial complete! Good luck on your farm~',
        step0_title: '👋 Welcome to Monster Farm!',
        step0_content: 'This is your monster farm.<br><br>You need to <strong style="color:#58a6ff;">catch monsters</strong> to help with farming while exploring for resources.<br><br>First, click the <strong style="color:#f0c53d;">🗺 Explore</strong> tab at the top!',
        step0_btn: 'Go to Explore →',
        step1_title: '🌿 Click "⚡ Explore" to start',
        step1_content: 'This is the <strong style="color:#46d164;">Farm Edge</strong> area.<br><br>Click the highlighted <strong style="color:#58a6ff;">⚡ Explore</strong> button below,<br>spend energy to push progress to <strong style="color:#f0c53d;">100%</strong> to settle.<br><br>💡 This exploration is <strong style="color:#f0c53d;">guaranteed</strong> to catch a monster!',
        step2_title: '🎉 Monster Caught!',
        step2_content: 'Great! You caught your first monster.<br><br>Now <strong style="color:#f0c53d;">click the monster card</strong> on the right to open details,<br>then click the "<strong style="color:#46d164;">Assign to Farm</strong>" button.',
        step3_title: '🌾 Assign Monster to Farm',
        step3_content: 'Now click the highlighted <strong style="color:#46d164;">Assign to Farm</strong> button,<br><br>so the monster guards a plot for <strong style="color:#58a6ff;">auto plant & harvest</strong>!',
        step4_title: '📋 Choose a Plot',
        step4_content: 'The plot picker opened!<br><br>Click any <strong style="color:#f0c53d;">plot tile</strong><br>to assign the monster there.',
        step5_title: '✅ Monster Assigned!',
        step5_content: 'The monster is now guarding a plot!<br><br>It will automatically plant and harvest crops for you.<br><br>Click the button to switch to <strong style="color:#f0c53d;">🏡 Farm</strong> and see the result!',
        step5_btn: 'Go to Farm →',
        step6_title: '🏡 Your Farm',
        step6_content: 'Plots have three states:<br>⬛ <strong>Empty</strong> — click to plant manually<br>🟡 <strong>Growing</strong> — waiting to ripen<br>🟢 <strong>Ready</strong> — click to harvest<br><br>💡 Assigned monsters <strong style="color:#46d164;">auto-plant and harvest</strong>!',
        step6_btn: 'Got it! Start playing ✓'
    },
    // Briefing
    briefing: {
        catch: 'Catch', levelup: 'Level Up', harvest: 'Harvest',
        explore: 'Explore', event: 'Event', tech: 'Tech',
        breed: 'Breed', save: 'Save', system: 'System',
        catchMsg: 'Caught <strong>{name}</strong> at <strong>{zone}</strong>!',
        levelupMsg: '<strong>{name}</strong> reached <strong>Lv.{lv}</strong>!',
        harvestAutoMsg: '<strong>{who}</strong> auto-harvested <strong>{crop}</strong> +{coins}💰 +{food}🍎',
        harvestManualMsg: 'Manually harvested <strong>{crop}</strong> +{coins}💰 +{food}🍎',
        exploreMsg: '{who}<strong>{zone}</strong> exploration done, gained {rewards}',
        exploreWho: '<strong>{name}</strong> at ',
        exploreWhoManual: 'At ',
        eventMsg: 'Random event 「<strong>{title}</strong>」— {result}',
        techMsg: 'Tech 「<strong>{name}</strong>」unlocked!',
        breedMsg: '<strong>{parents}</strong> bred <strong>{child}</strong>!',
        saveAuto: 'Auto-save complete.', saveManual: 'Manual save complete.',
        rewardsNone: 'None'
    },
    // Random Events
    events: {
        farming_rain_title: 'Timely Rain',
        farming_rain_desc: 'A timely rain falls on the farm, temporarily boosting crop growth!',
        farming_rain_choice: 'Great!',
        farming_rain_effect: 'Crops growth boosted for 30s!',
        farming_pest_title: 'Pest Outbreak',
        farming_pest_desc: 'Your farm is hit by pests! Use food to repel them?',
        farming_pest_choice1: 'Use Food (20)',
        farming_pest_effect1: 'Pests repelled successfully!',
        farming_pest_choice2: 'Ignore',
        farming_pest_effect2: 'Crop growth damaged...',
        farming_wind_title: 'Strong Wind',
        farming_wind_desc: 'A strong wind blew through, scattering some materials.',
        farming_wind_choice: 'Collect',
        farming_wind_effect: 'Gained {n} materials!',
        explore_merchant_title: 'Mysterious Merchant',
        explore_merchant_desc: 'A merchant offers to trade materials for coins.',
        explore_merchant_choice1: 'Trade (Mat -50 → Coins +150)',
        explore_merchant_choice2: 'Decline',
        explore_merchant_effect: 'Trade successful!',
        explore_monster_title: 'Wild Monster',
        explore_monster_desc: 'Encountered a wild monster! Fight to catch it?',
        explore_monster_choice1: 'Fight',
        explore_monster_choice2: 'Flee',
        explore_monster_success: 'Caught it! Got a new monster!',
        explore_monster_fail: 'Failed to catch, energy depleted...',
        explore_treasure_title: 'Treasure',
        explore_treasure_desc: 'Found a treasure chest!',
        explore_treasure_choice: 'Open',
        explore_treasure_effect: 'Got reward: {reward}',
        general_windfall_title: 'Windfall',
        general_windfall_desc: 'A passing traveler gave you some coins.',
        general_windfall_choice: 'Accept',
        general_windfall_effect: 'Gained 50 coins!'
    },
    gm: {
        panelTitle: '⚙️ GM Developer Panel',
        authTitle: '� Developer Verification',
        authDesc: 'This is a GM developer tool. Please enter the developer password to continue.',
        authPlaceholder: 'Enter password…',
        authWrongPwd: 'Wrong password, please try again.',
        authVerify: 'Verify',
        secResources: '💰 Resources',
        secSpeed: '⏩ Time Speed',
        secMonster: '👾 Add Monster',
        secTech: '🔬 Tech Management',
        secZone: '🗺 Zone Management',
        secFarm: '🌾 Farm Management',
        secStats: '📊 Statistics',
        secSave: '💾 Save Management',
        secSnapshot: '🔍 Current Snapshot',
        resCoins: 'Coins', resFood: 'Food', resMaterials: 'Materials',
        resResearch: 'Research', resEnergy: 'Energy',
        resFull: 'Full',
        btnFillAll: '⚡ Fill All Resources',
        speedCurrent: 'Current Speed: ',
        speedDesc: '(Affects all game loops)',
        speedTick1: '⚡ Trigger 1 Game Loop',
        speedTick10: '⚡×10 Trigger 10 Loops',
        monsterType: 'Monster Type', monsterLevel: 'Level',
        monsterName: 'Custom Name (blank = random)',
        monsterNamePH: 'Monster name…',
        btnAddMonster: '✅ Add Monster',
        btnAddAllMonsters: '⭐ One of Each Type',
        btnUnlockTech: '🔓 Unlock Selected Tech',
        btnUnlockAllTech: '⭐ Unlock All Tech',
        btnUnlockZone: '🔓 Unlock Selected Zone',
        btnUnlockAllZones: '⭐ Unlock All Zones',
        btnUnlockAllPlots: '🔓 Unlock All Plots',
        btnHarvestAll: '🌟 Harvest All Crops Now',
        btnClearAllPlots: '🧹 Clear All Plots',
        btnExplore30: 'Explorations→30',
        btnHarvest50: 'Harvests→50',
        btnBreed10: 'Breedings→10',
        btnResetStats: '🔄 Reset All Stats',
        btnSaveNow: '💾 Save Now',
        btnExportSave: '📤 Export Save',
        btnResetGame: '💣 Reset Game',
        snapshotCoins: 'Coins', snapshotFood: 'Food',
        snapshotMaterials: 'Materials', snapshotResearch: 'Research',
        snapshotEnergy: 'Energy', snapshotMonsters: 'Monsters',
        snapshotPlots: 'Plots', snapshotTech: 'Tech',
        snapshotUnit: '',
        snapshotExplore: 'Explorations', snapshotSpeed: 'Speed',
        snapshotIdle: 'idle', snapshotFarming: 'farming',
        snapshotUnlocked: 'Unlocked', snapshotResearched: 'Researched',
        btnRefreshSnapshot: '🔄 Refresh Snapshot',
        resetTitle: '⚠️ Confirm Game Reset',
        resetDesc: 'This will <strong style="color:#f85149;">erase all save data</strong>, including:<br>• All resources, monsters, tech<br>• Exploration progress and farm plots<br>• All statistics<br><br><strong style="color:#f0c53d;">This cannot be undone!</strong>',
        resetConfirm: '💣 Confirm Reset',
        ntfSpeedSet: '⏩ Speed set to ×{x}',
        ntfTickDone: '⚡ Triggered {n} game loop(s)',
        ntfAddAllMonsters: '✅ Added all {count} monster types',
        ntfUnknownType: 'Unknown monster type: {type}',
        ntfAddMonster: '✅ Added {type} "{name}" Lv.{lv}',
        ntfUnlockTech: '🔓 Tech "{name}" unlocked',
        ntfUnlockAllTech: '⭐ All tech unlocked',
        ntfUnlockZone: '🔓 Zone "{name}" unlocked',
        ntfUnlockAllZones: '⭐ All zones unlocked',
        ntfUnlockAllPlots: '🔓 All plots unlocked',
        ntfHarvestAll: '🌟 Ripened {r}, harvested {h} plots',
        ntfClearAllPlots: '🧹 All plots cleared',
        ntfResetStats: '🔄 Statistics reset',
        ntfSaved: 'Game saved manually',
        ntfExported: '📤 Save exported',
        ntfExportFail: 'Export failed: {err}',
        ntfFoodOut: '⚠️ Food depleted! Monster efficiency -50%!',
        ntfCoinsOut: '⚠️ Coins depleted! Cannot pay maintenance!',
        close: 'Close',
        badgeTitle: 'GM Panel (Ctrl+Shift+G)'
    }
},

// ==================== 日本語 ====================
ja: {
    tabs: {
        farm: '🌾 農場', monsters: '👾 モンスター', tech: '🔬 テクノロジー',
        explore: '🗺 探索', breed: '💕 繁殖', stats: '📊 統計'
    },
    resources: {
        coins: 'コイン', food: '食料', materials: '素材',
        research: '研究ポイント', energy: 'エネルギー', land: '土地'
    },
    settings: {
        title: '⚙️ ゲーム設定',
        stats: '📊 ゲーム統計',
        totalHarvests: '収穫回数', totalExplorations: '探索回数',
        monstersBreed: '繁殖回数', monsterCount: 'モンスター数',
        fontSize: '🔤 フォントサイズ',
        fontSmall: '小', fontMedium: '中', fontLarge: '大', fontXLarge: '特大',
        fontSmallDesc: '12px · 高密度', fontMediumDesc: '14px · 推奨',
        fontLargeDesc: '16px · 快適', fontXLargeDesc: '18px · アクセシブル',
        save: '💾 セーブ',
        saveBtn: '💾 手動セーブ', recallBtn: '🔄 全員召還',
        exportBtn: '📤 セーブ出力', importBtn: '📥 セーブ読込',
        importConfirmTitle: '⚠️ インポート確認',
        importConfirmDesc: 'インポートすると現在の進行データが上書きされます。元に戻せません。続行しますか？',
        importConfirmOk: 'インポート確認', importSuccess: '✅ セーブデータを読み込みました！', importFail: 'インポート失敗：{err}',
        shortcuts: '⌨️ ショートカット',
        shortcut15: 'タブ切替', shortcutCtrlS: '手動セーブ', shortcutEsc: 'モーダルを閉じる',
        language: '🌐 言語',
        tutorialBtn: '📖 チュートリアル', resetBtn: '🗑 リセット', closeBtn: '閉じる'
    },
    monsterStatus: {
        idle: '休憩中', working: '作業中', exploring: '探索中',
        farming: '農耕中', breeding: '繁殖中', selling: '売却中',
        preparing: '待機中'
    },
    rarity: {
        common: 'コモン', uncommon: 'アンコモン', rare: 'レア',
        epic: 'エピック', legendary: 'レジェンダリー'
    },
    common: {
        confirm: '確認', cancel: 'キャンセル', close: '閉じる', ok: 'OK',
        yes: 'はい', no: 'いいえ', unlock: 'アンロック', locked: '未解放',
        level: 'レベル', lv: 'Lv', max: '最大', current: '現在',
        cost: 'コスト', effect: '効果', prereq: '前提',
        unknown: '不明', none: 'なし'
    },
    ui: {
        noMonsters: 'モンスターなし',
        moreMonsters: 'あと{n}体のモンスター...',
        upgradeReady: 'アップグレード可能'
    },
    farm: {
        title: '農場', plant: '種まき', harvest: '収穫',
        plot: '区画', empty: '空き地', growing: '成長中', ready: '収穫可能',
        selectCrop: '作物を選択', waterNeeds: '水やりが必要',
        tier: 'ティア', growTime: '成長時間', yieldLabel: '産量',
        value: '価値', foodVal: '食料値',
        unlockNeeds: '解放に必要:'
    },
    monsters: {
        title: 'モンスター', assign: '配置', unassign: '撤退',
        stats: 'ステータス', strength: '力', agility: '敏捷',
        intelligence: '知力', farming: '農耕力',
        rarity: {
            common: 'コモン', uncommon: 'アンコモン', rare: 'レア',
            epic: 'エピック', legendary: 'レジェンダリー'
        },
        traits: '特性', noTraits: '特性なし',
        reforge: '再鍛造', reforgeTitle: 'ステータス再鍛造',
        reforgeNormal: '通常再鍛造', reforgeAdvanced: '上級（1項目固定）',
        reforgePerfect: '完璧（3択から選ぶ）',
        lockStat: 'ステータス固定', chooseBest: '最良を選択',
        reforgeConfirm: '確認', reforgeCancel: 'キャンセル',
        reforgeResult: '再鍛造結果',
        reforgeOption: '案',
        reforgeApply: '適用'
    },
    tech: {
        title: 'テクノロジーツリー', unlock: 'アンロック', unlocked: 'アンロック済',
        notEnough: 'リソース不足', prereqNeeded: '前提テクノロジーが必要',
        category: {
            farming: '🌾 農業', exploration: '🗺 探索',
            monster: '👾 モンスター', breeding: '💕 繁殖',
            expansion: '🏗 拡張'
        }
    },
    explore: {
        title: '探索', start: '探索開始', stop: '停止',
        manual: '手動探索', auto: 'モンスター派遣',
        progress: '進捗', reward: '報酬',
        catchMonster: 'モンスターを捕獲！', noCatch: '捕獲なし',
        energy: 'エネルギー', locked: '未解放'
    },
    breed: {
        title: '繁殖', selectParent: '親を選択',
        parent1: '親1', parent2: '親2',
        startBreed: '繁殖開始', offspring: '子孫',
        mutation: '突然変異', inherit: '遺伝'
    },
    notifications: {
        saved: 'ゲーム保存完了', harvestSuccess: '収穫成功！',
        techUnlocked: 'テクノロジーをアンロック', monsterCaught: '新モンスターを捕獲！',
        notEnoughResource: 'リソース不足'
    },
    // チュートリアル
    tutorial: {
        skipBtn: '✕ スキップ', skip_btn: '✕ スキップ',
        waitExplore: '⏳ 探索してモンスターを捕獲中…',   wait_explore: '⏳ 探索してモンスターを捕獲中…',
        waitSelectMonster: '👆 右側のモンスターカードをクリック…', wait_select: '👆 右側のモンスターカードをクリック…',
        waitAssignFarm: '👆 ハイライトされた配置ボタンをクリック…', wait_assign: '👆 ハイライトされた配置ボタンをクリック…',
        waitPickPlot: '👆 ポップアップで区画を選択…',    wait_plot: '👆 ポップアップで区画を選択…',
        waitDefault: '⏳ 操作待ち…',                     wait_generic: '⏳ 操作待ち…',
        wait_click_tab: '👆 ハイライトされた「探索」タブをクリックしてください',
        completedMsg: '🎓 チュートリアル完了！農場を楽しんでください～', complete_notify: '🎓 チュートリアル完了！農場を楽しんでください～',
        step0_title: '👋 モンスターファームへようこそ！',
        step0_content: 'ここはあなたのモンスターファームです。<br><br><strong style="color:#58a6ff;">モンスターを捕獲</strong>して農耕を手伝わせ、探索でリソースを集めましょう。<br><br>まず、上部の<strong style="color:#f0c53d;">🗺 探索</strong>タブをクリック！',
        step0_btn: '探索へ →',
        step1_title: '🌿 「⚡ 探索」をクリックして開始',
        step1_content: 'ここは<strong style="color:#46d164;">農場の端</strong>エリアです。<br><br>ハイライトされた<strong style="color:#58a6ff;">⚡ 探索</strong>ボタンをクリックして、<br>エネルギーを使って進捗を<strong style="color:#f0c53d;">100%</strong>まで進めましょう。<br><br>💡 今回の探索は<strong style="color:#f0c53d;">必ずモンスターを捕獲</strong>できます！',
        step2_title: '🎉 モンスターを捕獲！',
        step2_content: '素晴らしい！最初のモンスターを捕獲しました。<br><br>右側の<strong style="color:#f0c53d;">モンスターカードをクリック</strong>して詳細を開き、<br>「<strong style="color:#46d164;">農場に配置</strong>」ボタンをクリックしてください。',
        step3_title: '🌾 モンスターを農場に配置',
        step3_content: 'ハイライトされた<strong style="color:#46d164;">農場に配置</strong>ボタンをクリックして、<br><br>モンスターに区画を守らせ、<strong style="color:#58a6ff;">自動で種まき・収穫</strong>させましょう！',
        step4_title: '📋 区画を選ぶ',
        step4_content: '区画選択画面が開きました！<br><br>任意の<strong style="color:#f0c53d;">区画マス</strong>をクリックして<br>モンスターを配置してください。',
        step5_title: '✅ 配置完了！',
        step5_content: 'モンスターが区画を守り始めました！<br><br>自動で作物を植えて収穫してくれます。<br><br>ボタンをクリックして<strong style="color:#f0c53d;">🏡 農場</strong>に切り替えて確認しましょう！',
        step5_btn: '農場へ →',
        step6_title: '🏡 あなたの農場',
        step6_content: '区画には3つの状態があります：<br>⬛ <strong>空き地</strong> — クリックで手動種まき<br>🟡 <strong>成長中</strong> — 収穫まで待機<br>🟢 <strong>収穫可能</strong> — クリックで収穫<br><br>💡 配置されたモンスターは<strong style="color:#46d164;">自動で種まき・収穫</strong>します！',
        step6_btn: 'わかった！ゲーム開始 ✓'
    },
    // 簡報
    briefing: {
        catch: '捕獲', levelup: 'レベルアップ', harvest: '収穫',
        explore: '探索', event: 'イベント', tech: 'テクノロジー',
        breed: '繁殖', save: 'セーブ', system: 'システム',
        catchMsg: '<strong>{zone}</strong> で <strong>{name}</strong> を捕獲！',
        levelupMsg: '<strong>{name}</strong> が <strong>Lv.{lv}</strong> になった！',
        harvestAutoMsg: '<strong>{who}</strong> が <strong>{crop}</strong> を自動収穫 +{coins}💰 +{food}🍎',
        harvestManualMsg: '<strong>{crop}</strong> を手動収穫 +{coins}💰 +{food}🍎',
        exploreMsg: '{who}<strong>{zone}</strong> の探索完了、{rewards} を獲得',
        exploreWho: '<strong>{name}</strong> が',
        exploreWhoManual: '',
        eventMsg: 'ランダムイベント「<strong>{title}</strong>」—— {result}',
        techMsg: 'テクノロジー「<strong>{name}</strong>」をアンロック！',
        breedMsg: '<strong>{parents}</strong> が <strong>{child}</strong> を繁殖！',
        saveAuto: '自動セーブ完了。', saveManual: '手動セーブ完了。',
        rewardsNone: 'なし'
    },
    // ランダムイベント
    events: {
        farming_rain_title: '恵みの雨',
        farming_rain_desc: '恵みの雨が農場に降り、作物の成長速度が一時的に上昇！',
        farming_rain_choice: '最高！',
        farming_rain_effect: '30秒間、作物成長加速！',
        farming_pest_title: '害虫発生',
        farming_pest_desc: '農場に害虫が発生！食料を使って駆除しますか？',
        farming_pest_choice1: '食料を使う(20)',
        farming_pest_effect1: '害虫の駆除に成功！',
        farming_pest_choice2: '無視',
        farming_pest_effect2: '作物の成長が損なわれた...',
        farming_wind_title: '強風',
        farming_wind_desc: '強風が農場を通り抜け、素材が散らばった。',
        farming_wind_choice: '集める',
        farming_wind_effect: '素材を {n} 個入手！',
        explore_merchant_title: '謎の商人',
        explore_merchant_desc: '謎の商人が素材をコインに交換すると申し出た。',
        explore_merchant_choice1: '取引（素材-50 → コイン+150）',
        explore_merchant_choice2: '断る',
        explore_merchant_effect: '取引成功！',
        explore_monster_title: '野生モンスター',
        explore_monster_desc: '野生のモンスターに遭遇！戦って捕獲しますか？',
        explore_monster_choice1: '戦う',
        explore_monster_choice2: '逃げる',
        explore_monster_success: '捕獲成功！新しいモンスターをゲット！',
        explore_monster_fail: '捕獲失敗、エネルギーを消費...',
        explore_treasure_title: '宝物',
        explore_treasure_desc: '宝箱を発見！',
        explore_treasure_choice: '開ける',
        explore_treasure_effect: '報酬を獲得：{reward}',
        general_windfall_title: '棚からぼた餅',
        general_windfall_desc: '通りかかった旅人がコインをくれた。',
        general_windfall_choice: '受け取る',
        general_windfall_effect: 'コイン50枚を獲得！'
    },
    gm: {
        panelTitle: '⚙️ GM 開発者パネル',
        authTitle: '🔒 開発者認証',
        authDesc: 'このパネルは開発者用GMツールです。開発者パスワードを入力してください。',
        authPlaceholder: 'パスワードを入力…',
        authWrongPwd: 'パスワードが間違っています。再試行してください。',
        authVerify: '認証',
        secResources: '💰 リソース補充',
        secSpeed: '⏩ 時間加速',
        secMonster: '👾 モンスター取得',
        secTech: '🔬 テクノロジー管理',
        secZone: '🗺 探索エリア管理',
        secFarm: '🌾 農場管理',
        secStats: '📊 統計データ',
        secSave: '💾 セーブ管理',
        secSnapshot: '🔍 現在のスナップショット',
        resCoins: 'コイン', resFood: '食料', resMaterials: '素材',
        resResearch: '研究ポイント', resEnergy: 'エネルギー',
        resFull: '満タン',
        btnFillAll: '⚡ 全リソース一括補充',
        speedCurrent: '現在の倍速：',
        speedDesc: '（全ゲームループに影響）',
        speedTick1: '⚡ ゲームループを1回実行',
        speedTick10: '⚡×10 ループを10回実行',
        monsterType: 'モンスター種類', monsterLevel: 'レベル',
        monsterName: 'カスタム名（空欄でランダム）',
        monsterNamePH: 'モンスター名…',
        btnAddMonster: '✅ モンスター追加',
        btnAddAllMonsters: '⭐ 全種類を1体ずつ',
        btnUnlockTech: '🔓 選択テクノロジーをアンロック',
        btnUnlockAllTech: '⭐ 全テクノロジーをアンロック',
        btnUnlockZone: '🔓 選択エリアをアンロック',
        btnUnlockAllZones: '⭐ 全エリアをアンロック',
        btnUnlockAllPlots: '🔓 全区画をアンロック',
        btnHarvestAll: '🌟 今すぐ全作物を収穫',
        btnClearAllPlots: '🧹 全区画をクリア',
        btnExplore30: '探索回数→30',
        btnHarvest50: '収穫回数→50',
        btnBreed10: '繁殖回数→10',
        btnResetStats: '🔄 全統計をリセット',
        btnSaveNow: '💾 今すぐセーブ',
        btnExportSave: '📤 セーブデータをエクスポート',
        btnResetGame: '💣 ゲームをリセット',
        snapshotCoins: 'コイン', snapshotFood: '食料',
        snapshotMaterials: '素材', snapshotResearch: '研究',
        snapshotEnergy: 'エネルギー', snapshotMonsters: 'モンスター',
        snapshotPlots: '区画', snapshotTech: 'テクノロジー',
        snapshotUnit: '体',
        snapshotExplore: '探索回数', snapshotSpeed: '倍速',
        snapshotIdle: '待機中', snapshotFarming: '農耕中',
        snapshotUnlocked: '解放済', snapshotResearched: '研究済',
        btnRefreshSnapshot: '🔄 スナップショット更新',
        resetTitle: '⚠️ ゲームリセットの確認',
        resetDesc: 'これにより<strong style="color:#f85149;">全セーブデータが消去</strong>されます。対象：<br>• 全リソース・モンスター・テクノロジー<br>• 探索進捗と農場区画<br>• 全統計データ<br><br><strong style="color:#f0c53d;">この操作は取り消せません！</strong>',
        resetConfirm: '💣 リセット確認',
        ntfSpeedSet: '⏩ 倍速を×{x}に設定しました',
        ntfTickDone: '⚡ ゲームループを{n}回実行しました',
        ntfAddAllMonsters: '✅ 全{count}種類のモンスターを追加しました',
        ntfUnknownType: '不明なモンスター種類: {type}',
        ntfAddMonster: '✅ {type}「{name}」Lv.{lv}を追加しました',
        ntfUnlockTech: '🔓 テクノロジー「{name}」をアンロックしました',
        ntfUnlockAllTech: '⭐ 全テクノロジーをアンロックしました',
        ntfUnlockZone: '🔓 エリア「{name}」をアンロックしました',
        ntfUnlockAllZones: '⭐ 全探索エリアをアンロックしました',
        ntfUnlockAllPlots: '🔓 全区画をアンロックしました',
        ntfHarvestAll: '🌟 {r}区画を熟成、{h}区画を収穫しました',
        ntfClearAllPlots: '🧹 全区画をクリアしました',
        ntfResetStats: '🔄 統計データをリセットしました',
        ntfSaved: '手動セーブ完了',
        ntfExported: '📤 セーブデータをエクスポートしました',
        ntfExportFail: 'エクスポート失敗: {err}',
        ntfFoodOut: '⚠️ 食料が尽きた！モンスター効率-50%！',
        ntfCoinsOut: '⚠️ コインが尽きた！維持費を支払えません！',
        close: '閉じる',
        badgeTitle: 'GMパネル (Ctrl+Shift+G)'
    }
}

}; // end translations

// ==================== 游戏数据翻译（英文）====================
i18n.gameData = { zh: {}, en: {}, ja: {} };

// ── 英文：作物 ──
i18n.gameData.en.crops = {
    wheat:      { name:'Wheat',         desc:'Basic grain, fastest growing' },
    potato:     { name:'Potato',        desc:'High yield, stable production' },
    corn:       { name:'Corn',          desc:'High yield crop, needs longer time' },
    berry:      { name:'Berry',         desc:'Sweet berries, higher sell price' },
    mushroom:   { name:'Mushroom',      desc:'Magic mushroom, very high unit price' },
    carrot:     { name:'Carrot',        desc:'Sweet and crispy, monsters love it' },
    pumpkin:    { name:'Pumpkin',       desc:'Round and plump, decent yield' },
    sunflower:  { name:'Sunflower',     desc:'Chases the light, yields extra research' },
    herb:       { name:'Herb',          desc:'Precious herb, can be refined into materials' },
    cotton:     { name:'Cotton',        desc:'Soft cotton, used for crafting materials' },
    sugarcane:  { name:'Sugarcane',     desc:'High-sugar crop, amazing food output' },
    dragonfruit:{ name:'Dragon Fruit',  desc:'Fiery and vibrant, from volcanic foothills' },
    icefern:    { name:'Ice Fern',      desc:'Rare grass of deep cold, high research value' },
    voidshroom: { name:'Void Shroom',   desc:'Mysterious void mushroom, amazing material yield' },
    goldwheat:  { name:'Gold Wheat',    desc:'Golden ears, high yield and value' },
    starfruit:  { name:'Star Fruit',    desc:'Fruit of starlight, great value and research output' },
    moonleaf:   { name:'Moon Leaf',     desc:'Blooms at night, very rich research output' },
    bloodrose:  { name:'Blood Rose',    desc:'Blooms by absorbing energy, rare and dangerous' },
    etherbloom: { name:'Ether Bloom',   desc:'Divine flower with ether power, all-resource output' },
    soulgrain:  { name:'Soul Grain',    desc:'Grain condensing spirit energy, amazing yield' },
    chaosherb:  { name:'Chaos Herb',    desc:'Crystallized chaos energy, highest sell price of all crops' }
};

// ── 英文：怪兽 ──
i18n.gameData.en.monsters = {
    slime:      { name:'Slime',         desc:'Friendly farm helper, excels at tending potatoes' },
    goblin:     { name:'Goblin',        desc:'Diligent worker, wheat specialist' },
    sprout:     { name:'Sprout',        desc:'Born farmer, bonus to all crops' },
    mudcrab:    { name:'Mud Crab',      desc:'Strong crab general, excels at heavy labor' },
    firefly:    { name:'Firefly',       desc:'Extremely fast, high exploration efficiency' },
    pebble:     { name:'Pebble Sprite', desc:'Ordinary stone sprite, high material output' },
    sprite:     { name:'Sprite',        desc:'Wise spirit, excellent research bonus' },
    golem:      { name:'Golem',         desc:'Solid as rock, strong durability' },
    wisp:       { name:'Wisp',          desc:'Mysterious wisp, double exploration efficiency at night' },
    leafkin:    { name:'Leafkin',       desc:'Resonates with plants, farm efficiency +20%' },
    stoneback:  { name:'Stoneback',     desc:'Defense master, gold maintenance cost halved' },
    windsprite: { name:'Wind Sprite',   desc:'Speed champion, exploration speed +40%' },
    ifrit:      { name:'Ifrit',         desc:'Flame guardian, dragon fruit specialist' },
    toxfrog:    { name:'Tox Frog',      desc:'Toxin extraction master, herb yield +50%' },
    crystal:    { name:'Crystal',       desc:'Intelligence giant, ice fern/star fruit specialist' },
    thunderbird:{ name:'Thunderbird',   desc:'Thunder incarnate, energy recovery +30%' },
    deepmoss:   { name:'Deepmoss',      desc:'Deep forest guardian, all crop yield +15%' },
    ashgolem:   { name:'Ash Golem',     desc:'Flame smelting, material output doubled' },
    shadow:     { name:'Shadow',        desc:'Dark hunter, rare resources +100%' },
    phoenix:    { name:'Phoenix',       desc:'Undying bird, reborn from ashes, never consumed' },
    deepkraken: { name:'Deep Kraken',   desc:'Deep sea giant, exploration rewards +80%' },
    voidwalker: { name:'Void Walker',   desc:'Research point harvest doubled' },
    ironwarden: { name:'Iron Warden',   desc:'Material output +100%, very strong farming' },
    ancient:    { name:'Ancient Dragon',desc:'Legendary existence, top stats in all areas' },
    celestial:  { name:'Celestial',     desc:'From the heavens, research output +200%' },
    titan:      { name:'Titan',         desc:'God of strength, gold output +200%' },
    spiritking: { name:'Spirit King',   desc:'Master of all spirits, all output +50%' },
    worldtree:  { name:'World Tree',    desc:'God of farming, unlimited farming power' },
    timeghost:  { name:'Time Ghost',    desc:'Master of time, all timers -50%' }
};

// ── 英文：探索区域 ──
i18n.gameData.en.zones = {
    farm_edge:      { name:'Farm Edge',       desc:'Grassland around the farm, safe and easy to explore.' },
    shallow_forest: { name:'Shallow Forest',  desc:'Small woods near the farm, scattered resources.' },
    wild_plain:     { name:'Wild Plain',      desc:'Endless grassland, sprites occasionally appear.' },
    rocky_hills:    { name:'Rocky Hills',     desc:'Hard rocky terrain, golems dwell here.' },
    mist_forest:    { name:'Mist Forest',     desc:'Ancient forest shrouded in mysterious mist, wisps roam here.' },
    crystal_cave:   { name:'Crystal Cave',    desc:'Mysterious cave with glittering crystals, rich in minerals.' },
    volcano_foot:   { name:'Volcano Foot',    desc:'Hot volcanic foothills, dangerous but full of wealth.' },
    swamp:          { name:'Swamp',           desc:'Muddy dangerous swamp, tox frogs breed here.' },
    haunted_marsh:  { name:'Haunted Marsh',   desc:'Ancient death marsh, epic monsters rumored to appear.' },
    snow_plateau:   { name:'Snow Plateau',    desc:'Snow-covered plateau, crystals train in extreme cold.' },
    thunder_peak:   { name:'Thunder Peak',    desc:'Storm-battered mountain peak, thunderbirds soar here.' },
    dark_cave:      { name:'Dark Cave',       desc:'Pitch-black underground cave, shadows slumber here. Requires adventure pass.' },
    deep_ocean:     { name:'Deep Ocean',      desc:'Legendary deep sea, the kraken rules here.' },
    ancient_ruins:  { name:'Ancient Ruins',   desc:'Mysterious ruins where ancient dragons are said to exist.' },
    void_rift:      { name:'Void Rift',       desc:'Space fracture point, void walkers traverse here.' },
    celestial_isle: { name:'Celestial Isle',  desc:'Sacred island floating in the clouds, celestials reside here.' },
    void_realm:     { name:'Void Realm',      desc:'Ultimate zone beyond reality, home of legendary monsters.' },
    titan_fortress: { name:'Titan Fortress',  desc:"The Titan's ancient fortress, holding ultimate power." },
    dream_garden:   { name:'Dream Garden',    desc:'Eternal garden that exists only in dreams, world tree sleeps here.' },
    time_labyrinth: { name:'Time Labyrinth',  desc:'Time-warped maze, time ghosts wander here.' }
};

// ── 英文：科技 ──
i18n.gameData.en.tech = {
    advancedFarming:    { name:'Advanced Farming',      desc:'Unlock Tier2 crops (Berry/Mushroom/Carrot/Pumpkin)' },
    irrigation:         { name:'Irrigation',            desc:'Crop growth speed +25%' },
    fertilizerT1:       { name:'Basic Fertilizer',      desc:'All crop yield +15%' },
    cropT3:             { name:'Intermediate Agronomy', desc:'Unlock Tier3 crops (Sunflower/Herb/Cotton/Sugarcane)' },
    fertilizerT2:       { name:'Compound Fertilizer',   desc:'All crop yield +20%, food consumption -10%' },
    greenhouse:         { name:'Greenhouse',            desc:'Growth unaffected by weather, growth speed +10%' },
    cropT4:             { name:'Advanced Cultivation',  desc:'Unlock Tier4 crops (Dragon Fruit/Ice Fern/Void Shroom/Gold Wheat)' },
    hydroponics:        { name:'Hydroponics',           desc:'Growth speed +15%, unlock 2 extra plots' },
    autoharvest:        { name:'Auto Harvester',        desc:'Ripe crops auto-harvested within 30s' },
    cropT5:             { name:'Elite Agriculture',     desc:'Unlock Tier5 crops (Star Fruit/Moon Leaf/Blood Rose)' },
    soilMastery:        { name:'Soil Mastery',          desc:'All crop yield +30%, quality rate +15%' },
    seasonalFarming:    { name:'Seasonal Farming',      desc:'10% chance per harvest for bumper season: yield ×3' },
    cropT6:             { name:'Sacred Farming Codex',  desc:'Unlock Tier6 crops (Ether Bloom/Soul Grain/Chaos Herb)' },
    cosmicFertilizer:   { name:'Cosmic Fertilizer',     desc:'Tier5/6 crop yield +50%, generates rare materials' },
    worldTreeBlessing:  { name:'World Tree Blessing',   desc:'All farm plots grow at double speed' },
    eternalHarvest:     { name:'Eternal Harvest',       desc:'Each harvest permanently +1% yield (max +100%)' },
    exploration:        { name:'Exploration',           desc:'Unlock Volcano Foot, exploration rewards +50%' },
    cartography:        { name:'Cartography',           desc:'Exploration progress growth +20%' },
    campcraft:          { name:'Campcraft',             desc:'Energy cost for sending monsters to explore becomes zero' },
    survivalKit:        { name:'Survival Kit',          desc:'Monster catch rate +30% during exploration' },
    expeditionT4:       { name:'Expedition Team',       desc:'Max expedition size +2, explore 2 zones simultaneously' },
    treasureHunting:    { name:'Treasure Hunting',      desc:'Chest discovery +40%, chest rewards ×2' },
    explorationT5:      { name:'Stellar Exploration',   desc:'Unlock Celestial Isle, all exploration rewards +100%' },
    monsterTracker:     { name:'Monster Tracker',       desc:'Target monster catch rate ×2' },
    voidMapping:        { name:'Void Mapping',          desc:'Unlock Void Realm, rare resource rate +200%' },
    parallelExpedition: { name:'Parallel Expedition',   desc:'Up to 4 simultaneous expedition teams' },
    dimensionalGate:    { name:'Dimensional Gate',      desc:'Teleport to any unlocked zone, exploration progress ×3' },
    monsterTraining:    { name:'Monster Training',      desc:'Monster stat growth ×1.3' },
    monsterDiet:        { name:'Nutritional Diet',      desc:'Monster food consumption -20%, EXP gain +15%' },
    advancedTraining:   { name:'Advanced Training',     desc:'Monster max level raised to 40, EXP gain ×1.5' },
    skillSystem:        { name:'Skill Awakening',       desc:'Monsters awaken an active skill at Lv10/20/30' },
    eliteTraining:      { name:'Elite Training',        desc:'Max level 60, all stats +20 at max level' },
    monsterSynergy:     { name:'Group Resonance',       desc:'Each same-type monster adds +5% stats to all of the same type' },
    legendaryTraining:  { name:'Legendary Training',    desc:'Max level 100, stat growth ×2 per level' },
    divineAwakening:    { name:'Divine Awakening',      desc:'Epic/Legendary monsters awaken divine form, all stats doubled' },
    breeding:           { name:'Breeding',              desc:'Allow monsters to breed and raise stronger offspring' },
    geneticEnhancement: { name:'Genetic Enhancement',   desc:'Offspring stat inheritance +20%, mutation rate ×1.5' },
    rapidBreeding:      { name:'Rapid Breeding',        desc:'Breeding cooldown -30%, hatching time -20%' },
    traitInheritance:   { name:'Trait Genetics',        desc:'Offspring inheriting best parent traits raised to 80%' },
    crossBreeding:      { name:'Cross Breeding',        desc:'Allow different monster types to breed, may produce hybrids' },
    divineBreeding:     { name:'Divine Breeding',       desc:'5% chance for Legendary monsters to produce Mythic offspring' },
    expansion:          { name:'Farm Expansion',        desc:'Unlock 3 extra plots (12 total)' },
    megaFarm:           { name:'Mega Farm',             desc:'Unlock 4 more plots (16 total)' },
    industrialFarm:     { name:'Industrial Farm',       desc:'Unlock 5 more plots (21 total), unlock batch harvest' },
    cosmicFarm:         { name:'Cosmic Farm',           desc:'Unlock 6 more plots (27 total)' },
    monsterBarracks:    { name:'Monster Barracks',      desc:'Monster capacity increased from 15 to 30' },
    grandBarracks:      { name:'Grand Barracks',        desc:'Monster capacity raised to 60' },
    legendaryStables:   { name:'Legendary Stables',     desc:'Monster capacity 100, +5 extra slots for Legendaries' },
    infiniteExpansion:  { name:'Infinite Expansion',    desc:'Spend 5000 coins to permanently unlock 1 extra plot (no limit)' }
};

// ── 英文：特性 ──
i18n.gameData.en.traits = {
    fast:           { name:'Swift',         desc:'Moves quickly' },
    strong:         { name:'Strong',        desc:'Immense strength' },
    smart:          { name:'Smart',         desc:'Supremely wise' },
    farmer:         { name:'Farmer',        desc:'Born farming expert' },
    lucky:          { name:'Lucky',         desc:'Always brings good luck' },
    hardy:          { name:'Hardy',         desc:'Tenacious and unyielding' },
    explorer:       { name:'Explorer',      desc:'Exploration speed +30%' },
    researcher:     { name:'Researcher',    desc:'Research gain +20%' },
    green_thumb:    { name:'Green Thumb',   desc:'All crop growth +20%' },
    berserker:      { name:'Berserker',     desc:'Combat power maxed out' },
    sage:           { name:'Sage',          desc:'Research gain +35%' },
    swift:          { name:'Gale',          desc:'Exploration speed +50%' },
    titan_blood:    { name:'Titan Blood',   desc:'Strength stat cap +20' },
    void_touched:   { name:'Void Touched',  desc:'Rare resource gain +50%' },
    divine_grace:   { name:'Divine Grace',  desc:'All farm yield +25%' },
    time_warp:      { name:'Time Warp',     desc:'All timers extra -20%' },
    lazy:           { name:'Lazy',          desc:'Low work efficiency' },
    clumsy:         { name:'Clumsy',        desc:'Always a step behind' },
    dim:            { name:'Dim',           desc:'Slow to react' },
    glutton:        { name:'Glutton',       desc:'Good efficiency but huge appetite (consumption ×1.5)' },
    nocturnal:      { name:'Nocturnal',     desc:'Double efficiency at night, halved during the day' },
    hoarder:        { name:'Hoarder',       desc:'Material gain +30%' },
    coin_lover:     { name:'Coin Lover',    desc:'Coin gain +30%' },
    soul_eater:     { name:'Soul Eater',    desc:'Research gain +50%' },
    berserker_weak: { name:'Reckless',      desc:'Strong but brainless' }
};

// ── 英文：成就 ──
i18n.gameData.en.achievements = {
    first_harvest:   { name:'First Harvest',      desc:'Complete your first harvest' },
    first_monster:   { name:'New Friend',         desc:'Catch your first monster' },
    first_explore:   { name:'Explorer',           desc:'Complete your first exploration' },
    first_breed:     { name:'Breeding Pioneer',   desc:'Complete your first breeding' },
    harvest_100:     { name:'Centennial Harvest', desc:'Complete 100 harvests' },
    harvest_1000:    { name:'Lord of Harvests',   desc:'Complete 1000 harvests' },
    explore_50:      { name:'Adventurer',         desc:'Complete 50 explorations' },
    monsters_10:     { name:'Monster Legion',     desc:'Own 10 monsters at once' },
    monsters_30:     { name:'Master of Beasts',   desc:'Own 30 monsters at once' },
    breed_10:        { name:'Breeding Master',    desc:'Complete 10 breedings' },
    all_basic_tech:  { name:'Tech Pioneer',       desc:'Unlock all basic technologies (Tier2)' },
    coins_10000:     { name:'Rich Farmer',        desc:'Hold 10,000 coins at once' },
    coins_100000:    { name:'Millionaire Lord',   desc:'Hold 100,000 coins at once' },
    legendary_catch: { name:'Legend Hunter',      desc:'Catch your first legendary monster' },
    all_crops:       { name:'Full Harvest',       desc:'Grow all 20 types of crops' },
    max_plots:       { name:'Boundless Farm',     desc:'Unlock all farm plots (27)' }
};

// ── 英文：游戏阶段 ──
i18n.gameData.en.stages = {
    1: { name:'Novice Farmer' },
    2: { name:'Junior Rancher' },
    3: { name:'Intermediate Lord' },
    4: { name:'Senior Landowner' },
    5: { name:'Legendary Overlord' },
    6: { name:'Mythic Farmmaster' }
};

// ==================== 游戏数据翻译（日文）====================

// ── 日文：作物 ──
i18n.gameData.ja.crops = {
    wheat:      { name:'小麦',       desc:'基本的な穀物、最も早く育つ' },
    potato:     { name:'ジャガイモ', desc:'高収量、安定した生産' },
    corn:       { name:'トウモロコシ',desc:'高収量作物、時間がかかる' },
    berry:      { name:'ベリー',     desc:'甘いベリー、高い売値' },
    mushroom:   { name:'キノコ',     desc:'魔法のキノコ、非常に高単価' },
    carrot:     { name:'ニンジン',   desc:'甘くてシャキシャキ、モンスターの大好物' },
    pumpkin:    { name:'カボチャ',   desc:'丸くてふっくら、まずまずの収量' },
    sunflower:  { name:'ヒマワリ',   desc:'光を追う、追加研究ポイントを産出' },
    herb:       { name:'薬草',       desc:'貴重な薬草、素材に精製可能' },
    cotton:     { name:'コットン',   desc:'柔らかい綿、素材作成に使用' },
    sugarcane:  { name:'サトウキビ', desc:'高糖度作物、驚異的な食料産出' },
    dragonfruit:{ name:'ドラゴンフルーツ', desc:'火山麓産の鮮やかな果実' },
    icefern:    { name:'アイスファーン', desc:'深寒の地の珍草、研究価値が高い' },
    voidshroom: { name:'ヴォイドシュルーム', desc:'謎の虚空キノコ、素材産出が驚異的' },
    goldwheat:  { name:'黄金小麦',   desc:'黄金の穂、高収量・高価値' },
    starfruit:  { name:'スターフルーツ', desc:'星の光の果実、価値と研究産出ともに優秀' },
    moonleaf:   { name:'ムーンリーフ', desc:'夜に咲く、研究ポイント産出が非常に豊富' },
    bloodrose:  { name:'ブラッドローズ', desc:'エネルギーを吸収して咲く、希少で危険' },
    etherbloom: { name:'エーテルブルーム', desc:'エーテルの力を宿す神花、全リソース産出に優れる' },
    soulgrain:  { name:'ソウルグレイン', desc:'霊気を凝縮した穀物、産量が驚異的' },
    chaosherb:  { name:'カオスハーブ', desc:'混沌の力の結晶、全作物中最高の売値' }
};

// ── 日文：怪兽 ──
i18n.gameData.ja.monsters = {
    slime:      { name:'スライム',   desc:'友好的な農場助手、ジャガイモの世話が得意' },
    goblin:     { name:'ゴブリン',   desc:'勤勉な働き手、小麦の専門家' },
    sprout:     { name:'スプラウト', desc:'生まれながらの農夫、全作物にボーナス' },
    mudcrab:    { name:'マッドクラブ', desc:'強力な蟹、重労働が得意' },
    firefly:    { name:'ホタル',     desc:'非常に速い、探索効率が高い' },
    pebble:     { name:'ペブルスプライト', desc:'普通の石精、素材産出が高い' },
    sprite:     { name:'スプライト', desc:'賢い精霊、優れた研究ボーナス' },
    golem:      { name:'ゴーレム',   desc:'岩のように堅固、強い耐久力' },
    wisp:       { name:'ウィスプ',   desc:'神秘的なウィスプ、夜間探索効率2倍' },
    leafkin:    { name:'リーフキン', desc:'植物と共鳴、農場効率+20%' },
    stoneback:  { name:'ストーンバック', desc:'防衛の達人、金貨維持費半減' },
    windsprite: { name:'ウィンドスプライト', desc:'スピードチャンピオン、探索速度+40%' },
    ifrit:      { name:'イフリート', desc:'炎の守護者、ドラゴンフルーツの専門家' },
    toxfrog:    { name:'トックスフロッグ', desc:'毒液抽出の達人、薬草収量+50%' },
    crystal:    { name:'クリスタル', desc:'知力の巨人、アイスファーン/スターフルーツの専門家' },
    thunderbird:{ name:'サンダーバード', desc:'雷の化身、エネルギー回復+30%' },
    deepmoss:   { name:'ディープモス', desc:'深森の守護者、全作物収量+15%' },
    ashgolem:   { name:'アッシュゴーレム', desc:'炎の製錬、素材産出2倍' },
    shadow:     { name:'シャドウ',   desc:'暗闇の狩人、希少資源+100%' },
    phoenix:    { name:'フェニックス', desc:'不死鳥、灰から復活、消費されない' },
    deepkraken: { name:'ディープクラーケン', desc:'深海の巨大生物、探索報酬+80%' },
    voidwalker: { name:'ヴォイドウォーカー', desc:'研究ポイント収穫2倍' },
    ironwarden: { name:'アイアンウォーデン', desc:'素材産出+100%、農耕力が非常に強い' },
    ancient:    { name:'古代竜',     desc:'伝説的存在、全ステータスが頂点' },
    celestial:  { name:'天界使者',   desc:'天界から来た存在、研究産出+200%' },
    titan:      { name:'タイタン',   desc:'力の神、金貨産出+200%' },
    spiritking: { name:'スピリットキング', desc:'万霊の主、全産出+50%' },
    worldtree:  { name:'ワールドツリー', desc:'農業の神、農耕力に上限なし' },
    timeghost:  { name:'タイムゴースト', desc:'時間の支配者、全タイマー-50%' }
};

// ── 日文：探索区域 ──
i18n.gameData.ja.zones = {
    farm_edge:      { name:'農場の端',     desc:'農場周辺の草地、安全で探索しやすい。' },
    shallow_forest: { name:'浅い森',       desc:'農場近くの小さな森、散在する資源がある。' },
    wild_plain:     { name:'野外草原',     desc:'果てしない草原、精霊が時々現れる。' },
    rocky_hills:    { name:'岩の丘',       desc:'硬い岩地帯、ゴーレムが住んでいる。' },
    mist_forest:    { name:'霧の森',       desc:'神秘的な霧に覆われた古い森、ウィスプが彷徨う。' },
    crystal_cave:   { name:'水晶洞窟',     desc:'輝く水晶の神秘的な洞窟、鉱物が豊富。' },
    volcano_foot:   { name:'火山麓',       desc:'熱い火山の麓、危険だが富に満ちている。' },
    swamp:          { name:'沼地帯',       desc:'泥だらけの危険な沼、トックスフロッグが繁殖する。' },
    haunted_marsh:  { name:'幽霊沼',       desc:'古代の死の沼、史詩級モンスターが出没するとの噂。' },
    snow_plateau:   { name:'雪原高原',     desc:'雪に覆われた高原、クリスタルが極寒で修行する。' },
    thunder_peak:   { name:'雷峰',         desc:'嵐が絶えない山頂、サンダーバードが舞う。' },
    dark_cave:      { name:'暗黒洞窟',     desc:'真っ暗な地下洞窟、シャドウが眠る。冒険通行証が必要。' },
    deep_ocean:     { name:'深海秘境',     desc:'伝説の深海、クラーケンがここを支配する。' },
    ancient_ruins:  { name:'古代遺跡',     desc:'古代竜が存在するとされる神秘的な遺跡。' },
    void_rift:      { name:'虚空裂け目',   desc:'空間の亀裂、ヴォイドウォーカーが行き来する。' },
    celestial_isle: { name:'天界の島',     desc:'雲の上に浮かぶ神聖な島、天界使者が住む。' },
    void_realm:     { name:'虚空領域',     desc:'現実を超えた究極のゾーン、伝説級モンスターの故郷。' },
    titan_fortress: { name:'タイタン要塞', desc:'タイタンの古い要塞、究極の力を秘めている。' },
    dream_garden:   { name:'夢の庭園',     desc:'夢の中にのみ存在する永遠の庭園、ワールドツリーが眠る。' },
    time_labyrinth: { name:'時間迷宮',     desc:'時間が歪んだ迷宮、タイムゴーストが彷徨う。' }
};

// ── 日文：科技 ──
i18n.gameData.ja.tech = {
    advancedFarming:    { name:'高度農業',       desc:'Tier2作物解放（ベリー/キノコ/ニンジン/カボチャ）' },
    irrigation:         { name:'灌漑システム',   desc:'作物成長速度+25%' },
    fertilizerT1:       { name:'基本肥料',       desc:'全作物収量+15%' },
    cropT3:             { name:'中級農学',       desc:'Tier3作物解放（ヒマワリ/薬草/コットン/サトウキビ）' },
    fertilizerT2:       { name:'複合肥料',       desc:'全作物収量+20%、食料消費-10%' },
    greenhouse:         { name:'温室栽培',       desc:'天候の影響なし、成長速度+10%' },
    cropT4:             { name:'高度栽培',       desc:'Tier4作物解放（ドラゴンフルーツ等）' },
    hydroponics:        { name:'水耕技術',       desc:'成長速度+15%、区画2つ追加解放' },
    autoharvest:        { name:'自動収穫機',     desc:'熟した作物を30秒以内に自動収穫' },
    cropT5:             { name:'精鋭農業学',     desc:'Tier5作物解放（スターフルーツ等）' },
    soilMastery:        { name:'土壌精通',       desc:'全作物収量+30%、品質率+15%' },
    seasonalFarming:    { name:'季節農業',       desc:'収穫ごとに10%の確率で豊作季：収量×3' },
    cropT6:             { name:'神聖農業秘典',   desc:'Tier6作物解放（エーテルブルーム等）' },
    cosmicFertilizer:   { name:'宇宙肥料',       desc:'Tier5/6作物収量+50%、希少素材を産出' },
    worldTreeBlessing:  { name:'ワールドツリーの祝福', desc:'全農場区画の成長速度2倍' },
    eternalHarvest:     { name:'永遠の豊作',     desc:'収穫ごとに永久+1%収量（最大+100%）' },
    exploration:        { name:'探索技術',       desc:'火山麓解放、探索報酬+50%' },
    cartography:        { name:'地図学',         desc:'探索進捗成長+20%' },
    campcraft:          { name:'野営技術',       desc:'モンスター派遣探索のエネルギーコストがゼロに' },
    survivalKit:        { name:'サバイバルキット', desc:'探索中のモンスター捕獲率+30%' },
    expeditionT4:       { name:'遠征チーム編成', desc:'最大遠征数+2、同時2ゾーン探索可能' },
    treasureHunting:    { name:'宝探し術',       desc:'宝箱発見確率+40%、宝箱報酬×2' },
    explorationT5:      { name:'星際探索',       desc:'天界の島解放、全探索報酬+100%' },
    monsterTracker:     { name:'モンスター追跡', desc:'指定モンスター捕獲率×2' },
    voidMapping:        { name:'虚空測量',       desc:'虚空領域解放、希少資源率+200%' },
    parallelExpedition: { name:'並行探険',       desc:'最大4チームの同時遠征' },
    dimensionalGate:    { name:'次元ゲート',     desc:'任意の解放済みゾーンへ転送、探索進捗×3' },
    monsterTraining:    { name:'モンスター訓練', desc:'モンスターステータス成長×1.3' },
    monsterDiet:        { name:'栄養配食',       desc:'モンスター食料消費-20%、経験値獲得+15%' },
    advancedTraining:   { name:'高度訓練所',     desc:'モンスター最大レベル40、経験値獲得×1.5' },
    skillSystem:        { name:'スキル覚醒',     desc:'Lv10/20/30時に各1つのアクティブスキルを覚醒' },
    eliteTraining:      { name:'精鋭訓練',       desc:'最大レベル60、最大レベル時全ステータス+20' },
    monsterSynergy:     { name:'集団共鳴',       desc:'同種モンスター1体増えるごとに同種全員+5%' },
    legendaryTraining:  { name:'伝説調教',       desc:'最大レベル100、レベルごとのステータス成長×2' },
    divineAwakening:    { name:'神性覚醒',       desc:'エピック/レジェンダリーモンスターが神形態を覚醒、全ステータス2倍' },
    breeding:           { name:'繁殖技術',       desc:'モンスターの繁殖を許可し、より強い子孫を育てる' },
    geneticEnhancement: { name:'遺伝子強化',     desc:'子孫のステータス継承+20%、変異率×1.5' },
    rapidBreeding:      { name:'高速繁殖',       desc:'繁殖クールダウン-30%、孵化時間-20%' },
    traitInheritance:   { name:'特性遺伝学',     desc:'子孫が双親の最良特性を継承する確率が80%に' },
    crossBreeding:      { name:'交差繁殖',       desc:'異種モンスターの繁殖を許可、混血新モンスターが誕生する可能性' },
    divineBreeding:     { name:'神聖繁殖',       desc:'レジェンダリーモンスター繁殖時、5%の確率で「神話」級が誕生' },
    expansion:          { name:'農場拡張',       desc:'農地3区画追加解放（計12区画）' },
    megaFarm:           { name:'大型農場',       desc:'農地4区画追加解放（計16区画）' },
    industrialFarm:     { name:'工業化農場',     desc:'農地5区画追加（計21区画）、一括収穫解放' },
    cosmicFarm:         { name:'宇宙農場',       desc:'農地6区画追加（計27区画）' },
    monsterBarracks:    { name:'モンスター兵舎', desc:'モンスター容量15→30に増加' },
    grandBarracks:      { name:'大型兵舎',       desc:'モンスター容量60に増加' },
    legendaryStables:   { name:'伝説の厩舎',     desc:'モンスター容量100、レジェンダリー追加スロット+5' },
    infiniteExpansion:  { name:'無限拡張',       desc:'5000コイン消費で農地を永久に1区画追加解放（上限なし）' }
};

// ── 日文：特性 ──
i18n.gameData.ja.traits = {
    fast:           { name:'機敏',           desc:'素早く動く' },
    strong:         { name:'強靭',           desc:'圧倒的な力' },
    smart:          { name:'聡明',           desc:'至高の知恵' },
    farmer:         { name:'農夫',           desc:'生まれながらの農耕専門家' },
    lucky:          { name:'幸運',           desc:'常に幸運をもたらす' },
    hardy:          { name:'頑強',           desc:'粘り強く不屈' },
    explorer:       { name:'探検家',         desc:'探索速度+30%' },
    researcher:     { name:'研究者',         desc:'研究獲得+20%' },
    green_thumb:    { name:'グリーンサム',   desc:'全作物成長+20%' },
    berserker:      { name:'バーサーカー',   desc:'戦闘力が爆発的に高い' },
    sage:           { name:'賢者',           desc:'研究獲得+35%' },
    swift:          { name:'疾風',           desc:'探索速度+50%' },
    titan_blood:    { name:'タイタンの血',   desc:'力ステータス上限+20' },
    void_touched:   { name:'虚空の触れ',     desc:'希少資源獲得+50%' },
    divine_grace:   { name:'神聖な恵み',     desc:'全農場収量+25%' },
    time_warp:      { name:'時間歪曲',       desc:'全タイマー追加-20%' },
    lazy:           { name:'怠惰',           desc:'作業効率が低い' },
    clumsy:         { name:'不器用',         desc:'いつも一歩遅れる' },
    dim:            { name:'鈍感',           desc:'反応が遅い' },
    glutton:        { name:'大食い',         desc:'効率はまあまあだが食欲が旺盛（消費×1.5）' },
    nocturnal:      { name:'夜行性',         desc:'夜間効率2倍、昼間半減' },
    hoarder:        { name:'溜め込み屋',     desc:'素材獲得+30%' },
    coin_lover:     { name:'コイン好き',     desc:'コイン獲得+30%' },
    soul_eater:     { name:'魂喰い',         desc:'研究獲得+50%' },
    berserker_weak: { name:'向こう見ず',     desc:'力は強いが頭は使わない' }
};

// ── 日文：成就 ──
i18n.gameData.ja.achievements = {
    first_harvest:   { name:'初収穫',             desc:'最初の収穫を完了する' },
    first_monster:   { name:'新しい仲間',         desc:'最初のモンスターを捕獲する' },
    first_explore:   { name:'探索者',             desc:'最初の探索を完了する' },
    first_breed:     { name:'繁殖先駆者',         desc:'最初の繁殖を完了する' },
    harvest_100:     { name:'百回豊作',           desc:'100回の収穫を完了する' },
    harvest_1000:    { name:'千収の主',           desc:'1000回の収穫を完了する' },
    explore_50:      { name:'冒険家',             desc:'50回の探索を完了する' },
    monsters_10:     { name:'モンスター軍団',     desc:'同時に10体のモンスターを所有する' },
    monsters_30:     { name:'万獣の主',           desc:'同時に30体のモンスターを所有する' },
    breed_10:        { name:'繁殖マスター',       desc:'10回の繁殖を完了する' },
    all_basic_tech:  { name:'テクノロジー先駆者', desc:'全基本テクノロジーをアンロック（Tier2）' },
    coins_10000:     { name:'裕福な農夫',         desc:'同時に10,000コインを所持する' },
    coins_100000:    { name:'大富豪荘主',         desc:'同時に100,000コインを所持する' },
    legendary_catch: { name:'伝説ハンター',       desc:'最初の伝説級モンスターを捕獲する' },
    all_crops:       { name:'全作物制覇',         desc:'全20種の作物を栽培する' },
    max_plots:       { name:'果てなき農場',       desc:'全農地区画を解放する（27区画）' }
};

// ── 日文：游戏阶段 ──
i18n.gameData.ja.stages = {
    1: { name:'初心者農夫' },
    2: { name:'初級牧主' },
    3: { name:'中級領主' },
    4: { name:'上級荘主' },
    5: { name:'伝説の支配者' },
    6: { name:'神話の農場主' }
};

// ==================== 辅助函数（全局）====================
// 便捷调用：window.T(key, category)
window.T = function(key, category) {
    if (typeof i18n === 'undefined') return key;
    return i18n.t(key, category);
};
window.TName = function(id, type) {
    if (typeof i18n === 'undefined') return id;
    return i18n.getName(id, type);
};
window.TDesc = function(id, type) {
    if (typeof i18n === 'undefined') return '';
    return i18n.getDesc(id, type);
};

// 初始化
i18n.init();
