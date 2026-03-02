// ==================== 游戏平衡配置中心 (balance.js) ====================
// 所有影响游戏难度和进程的数值均在此文件集中管理。
// 调试时只需修改此文件，无需深入各业务模块。
// =====================================================================

var BALANCE = {

    // ──────────────────────────────────────────────
    // 1. 初始资源
    // ──────────────────────────────────────────────
    INITIAL: {
        coins:      50,      // 起始金币（原100，降低启动资源）
        food:       30,      // 起始食物
        materials:  0,
        research:   0,
        energy:     100,
        maxEnergy:  100
    },

    // ──────────────────────────────────────────────
    // 2. 科技解锁费用倍率（相对 gamedata.js 中基础cost）
    //    每Tier的费用乘以对应倍率（不修改gamedata直接在此缩放）
    // ──────────────────────────────────────────────
    TECH_COST_MULT: {
        tier2: 1.0,    // Tier2科技费用倍率（基准）
        tier3: 2.5,    // Tier3 = 基础 × 2.5
        tier4: 8.0,    // Tier4 = 基础 × 8
        tier5: 25.0,   // Tier5 = 基础 × 25
        tier6: 80.0    // Tier6 = 基础 × 80
    },

    // ──────────────────────────────────────────────
    // 3. 探索区域解锁条件倍率
    //    解锁条件中的数值型门槛（coins/totalExplorations/monsterCount 等）
    //    乘以对应tier倍率
    // ──────────────────────────────────────────────
    ZONE_UNLOCK_MULT: {
        tier1: 1.0,
        tier2: 1.5,
        tier3: 3.0,
        tier4: 6.0,
        tier5: 12.0,
        tier6: 25.0
    },

    // ──────────────────────────────────────────────
    // 4. 游戏阶段（里程碑）条件倍率
    //    gameStages 中 conditions 各字段乘以对应倍率
    // ──────────────────────────────────────────────
    STAGE_COND_MULT: {
        stage1: 1.0,    // 新手农夫（基准，不变）
        stage2: 3.0,    // 初级牧主
        stage3: 8.0,    // 中级领主
        stage4: 25.0,   // 高级庄主
        stage5: 80.0,   // 传奇主宰
        stage6: 250.0   // 神话农场主
    },

    // ──────────────────────────────────────────────
    // 5. 作物经济参数
    // ──────────────────────────────────────────────
    CROP: {
        growTimeBase:    1.0,   // 全局生长时间倍率（>1 = 更慢）
        yieldBase:       1.0,   // 全局产量倍率
        valueBase:       1.0,   // 全局售价倍率
        // Tier越高种植成本（能量消耗）加成
        energyCostByTier: [0, 2, 4, 8, 15, 25, 40]  // index=tier
    },

    // ──────────────────────────────────────────────
    // 6. 怪兽相关
    // ──────────────────────────────────────────────
    MONSTER: {
        maxCountInitial:  8,     // 初始怪兽容量上限（原15，压缩早期上限）
        feedCostPerLevel: 2,     // 每级每tick消耗食物（等级越高越费食物）
        expBase:         10,     // 基础升级所需经验
        expExponent:     1.8,    // 升级经验指数（EXP needed = expBase × level^expExponent）
        catchChanceBase:  1.0,   // 捕获率全局倍率
        captureEnergyBase: 10    // 手动捕获基础能量消耗
    },

    // ──────────────────────────────────────────────
    // 7. 探索参数
    // ──────────────────────────────────────────────
    EXPLORATION: {
        autoProgressInterval: 2000,  // 自动探索tick间隔(ms)
        autoProgressPerTick:  [1,3], // 自动探索每tick进度[min,max]
        energyRegenInterval:  5000,  // 能量恢复间隔(ms)
        energyRegenAmount:    5,     // 每次恢复能量值
        expeditionBaseTime:   30000, // 派遣探索基础时间(ms)
        expeditionTimeMult: {        // 各Tier探索时间倍率
            tier1: 1.0,
            tier2: 1.8,
            tier3: 3.5,
            tier4: 7.0,
            tier5: 14.0,
            tier6: 28.0
        }
    },

    // ──────────────────────────────────────────────
    // 8. 繁殖参数
    // ──────────────────────────────────────────────
    BREEDING: {
        baseCooldown:    120000,  // 繁殖基础冷却(ms) 原60s→120s
        baseCost: {
            food:      80,        // 繁殖基础食物消耗（原50）
            materials: 20         // 繁殖基础材料消耗（原10）
        },
        rarityMultiplier: {       // 稀有度对应繁殖成本倍率
            common:    1.0,
            uncommon:  2.5,
            rare:      7.0,
            epic:     20.0,
            legendary: 60.0
        },
        hatchTime: {              // 孵化时间（ms，按亲本最高稀有度）
            common:    30000,     // 30s
            uncommon:  90000,     // 1.5min
            rare:     300000,     // 5min
            epic:     900000,     // 15min
            legendary:3600000    // 60min
        },
        inheritChanceBase: 0.5,   // 基础特性继承概率
        mutationChance:    0.08   // 变异概率
    },

    // ──────────────────────────────────────────────
    // 9. 能量系统
    // ──────────────────────────────────────────────
    ENERGY: {
        regenRate:       5,      // 每次自然恢复量
        regenInterval:   5000,   // 恢复间隔ms
        maxBaseEnergy:   100,    // 基础上限
        stageBonus:      [0, 0, 50, 100, 200, 400, 900]  // 各阶段额外最大能量
    },

    // ──────────────────────────────────────────────
    // 10. 随机事件
    // ──────────────────────────────────────────────
    EVENTS: {
        farmEventInterval:   [120000, 300000],  // 农场事件触发间隔范围(ms)  原[60s,120s]
        exploreEventChance:  0.12,              // 探索事件触发概率（每次完成探索）
        rarityEventChance:   0.03              // 稀有事件概率
    },

    // ──────────────────────────────────────────────
    // 11. 资源处理（变卖/提炼）汇率
    // ──────────────────────────────────────────────
    DISPOSAL: {
        foodToCoins:        0.3,   // 食物→金币汇率（原0.5，降低转换效率）
        materialsToCoins:   1.5,   // 材料→金币汇率
        researchToCoins:    5.0,   // 研究点→金币汇率
        materialsToResearch: 0.2   // 材料→研究点汇率
    },

    // ──────────────────────────────────────────────
    // 12. 成就奖励倍率
    // ──────────────────────────────────────────────
    ACHIEVEMENT: {
        coinRewardMult: 1.0   // 成就金币奖励倍率（调试时可×0.1）
    },

    // ──────────────────────────────────────────────
    // 13. 调试开关（发布时全部 false）
    // ──────────────────────────────────────────────
    DEBUG: {
        enabled:            false,  // 总调试开关
        freeTech:           false,  // 科技免费
        freeBreed:          false,  // 繁殖免费
        instantGrow:        false,  // 作物瞬间成熟
        instantExplore:     false,  // 探索瞬间完成
        unlockAllZones:     false,  // 解锁所有探索区域
        startWithResources: false,  // 以大量资源开局（调试用）
        debugResources: {
            coins: 999999, food: 99999, materials: 99999, research: 9999
        }
    }
};

// ──────────────────────────────────────────────────────────────────────
// 工具函数：运行时动态应用BALANCE到gamedata的科技费用
// 调用时机：页面加载，在 gamedata.js 之后执行
// ──────────────────────────────────────────────────────────────────────
function applyBalanceToTechCosts() {
    if (typeof technologies === 'undefined') return;
    Object.keys(technologies).forEach(function(key) {
        var tech = technologies[key];
        var mult = BALANCE.TECH_COST_MULT['tier' + (tech.tier || 2)] || 1.0;
        if (mult === 1.0) return; // tier2基准不变
        ['research','coins','materials','food'].forEach(function(res) {
            if (tech.cost && tech.cost[res]) {
                tech.cost[res] = Math.round(tech.cost[res] * mult);
            }
        });
    });
}

// 工具函数：动态应用BALANCE到探索区域解锁条件
function applyBalanceToZoneConditions() {
    if (typeof explorationZones === 'undefined') return;
    explorationZones.forEach(function(zone) {
        var mult = BALANCE.ZONE_UNLOCK_MULT['tier' + (zone.tier || 1)] || 1.0;
        if (mult === 1.0 || !zone.unlockCondition) return;
        _scaleCondition(zone.unlockCondition, mult);
    });
}

// 工具函数：动态应用BALANCE到游戏阶段条件
function applyBalanceToStageConditions() {
    if (typeof gameStages === 'undefined') return;
    gameStages.forEach(function(stage, idx) {
        var mult = BALANCE.STAGE_COND_MULT['stage' + (idx + 1)] || 1.0;
        if (mult === 1.0) return;
        var cond = stage.conditions;
        ['totalHarvests','monsterCount','totalExplorations','monstersBreed'].forEach(function(k) {
            if (cond[k]) cond[k] = Math.round(cond[k] * mult);
        });
    });
}

// 内部：递归缩放解锁条件中的数值门槛
function _scaleCondition(cond, mult) {
    var NUMERIC_KEYS = ['value','coins','totalExplorations','monsterCount','materials','research','food'];
    NUMERIC_KEYS.forEach(function(k) {
        if (typeof cond[k] === 'number') {
            cond[k] = Math.round(cond[k] * mult);
        }
    });
    if (Array.isArray(cond.conditions)) {
        cond.conditions.forEach(function(c) { _scaleCondition(c, mult); });
    }
}

// 主入口：一次性应用所有平衡调整
// 在 main.js initGame() 之前调用
function initBalance() {
    applyBalanceToTechCosts();
    applyBalanceToZoneConditions();
    applyBalanceToStageConditions();

    // 将初始资源写入gameState（如果已定义）
    if (typeof gameState !== 'undefined') {
        var ini = BALANCE.INITIAL;
        if (BALANCE.DEBUG.enabled && BALANCE.DEBUG.startWithResources) {
            var dr = BALANCE.DEBUG.debugResources;
            gameState.coins     = dr.coins;
            gameState.food      = dr.food;
            gameState.materials = dr.materials;
            gameState.research  = dr.research;
        } else {
            gameState.coins     = ini.coins;
            gameState.food      = ini.food;
            gameState.materials = ini.materials;
            gameState.research  = ini.research;
        }
        gameState.energy    = ini.energy;
        gameState.maxEnergy = ini.maxEnergy;
    }

    console.log('[BALANCE] 平衡配置已加载并应用');
}
