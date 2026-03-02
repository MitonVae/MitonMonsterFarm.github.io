/**
 * 平衡模拟系统配置文件
 * 
 * 包含模拟系统所需的各项配置参数
 */

module.exports = {
    // 基础配置
    simulation: {
        // 可用模拟策略
        strategies: ["optimal", "balanced", "resource-focused", "tech-focused", "breeding-focused"],
        
        // 默认模拟时长（秒）
        defaultDuration: 86400,  // 1天
        
        // 默认模拟速度倍率
        defaultSpeed: 10,
        
        // 默认日志记录间隔
        defaultLogInterval: 60,  // 每60秒记录一次
        
        // 特殊时间节点
        timeNodes: [
            { label: "早期游戏", time: 3600 },    // 1小时
            { label: "中期过渡", time: 18000 },   // 5小时
            { label: "中期游戏", time: 36000 },   // 10小时
            { label: "后期过渡", time: 54000 },   // 15小时
            { label: "后期游戏", time: 72000 }    // 20小时
        ]
    },
    
    // 游戏平衡参数
    balance: {
        // 资源初始值
        initial: {
            coins: 50,
            food: 30,
            materials: 0,
            research: 0,
            energy: 100,
            maxEnergy: 100
        },
        
        // 科技费用倍率
        techCostMultiplier: {
            tier2: 1.0,
            tier3: 2.5,
            tier4: 8.0,
            tier5: 25.0,
            tier6: 80.0
        },
        
        // 怪兽维护费用
        monsterUpkeep: {
            common:    { food: 0.08, coins: 0 },
            uncommon:  { food: 0.15, coins: 0.05 },
            rare:      { food: 0.25, coins: 0.15 },
            epic:      { food: 0.40, coins: 0.40 },
            legendary: { food: 0.60, coins: 1.00 }
        },
        
        // 作物经济参数
        crop: {
            growTimeBase: 1.0,   // 全局生长时间倍率
            yieldBase: 1.0,      // 全局产量倍率
            valueBase: 1.0       // 全局售价倍率
        },
        
        // 游戏阶段条件倍率
        stageConditionMultiplier: {
            stage1: 1.0,    // 新手农夫（基准，不变）
            stage2: 3.0,    // 初级牧主
            stage3: 8.0,    // 中级领主
            stage4: 25.0,   // 高级庄主
            stage5: 80.0,   // 传奇主宰
            stage6: 250.0   // 神话农场主
        }
    },
    
    // 平衡性评估参数
    evaluation: {
        // 资源增长率理想值
        idealGrowthRate: {
            food: 0.15,      // 每小时15%增长
            coins: 0.20,     // 每小时20%增长
            materials: 0.10, // 每小时10%增长
            research: 0.08   // 每小时8%增长
        },
        
        // 资源波动性容忍度（低于此值为良好）
        volatilityTolerance: {
            food: 0.15,
            coins: 0.20,
            materials: 0.25,
            research: 0.30
        },
        
        // 游戏进程理想值（小时/阶段）
        idealProgressionHours: 3,
        
        // 怪兽效益理想值
        idealMonsterEfficiency: 3.0,  // 产出/消耗比例
        
        // 评分权重
        scoreWeights: {
            resourceBalance: 0.35,
            progressionPace: 0.40,
            monsterValue: 0.25
        }
    },
    
    // 预设测试配置
    presetTests: [
        {
            name: "默认平衡测试",
            description: "使用当前平衡参数进行标准测试",
            config: {
                simSpeed: 10,
                logInterval: 60,
                endTime: 86400,
                strategyType: "optimal"
            },
            balanceOverrides: {}  // 不覆盖任何平衡参数
        },
        {
            name: "加速进程测试",
            description: "测试提高资源产出后的游戏进程",
            config: {
                simSpeed: 20,
                logInterval: 60,
                endTime: 172800,
                strategyType: "optimal"
            },
            balanceOverrides: {
                "crop.yieldBase": 1.25,    // 作物产量提高25%
                "crop.valueBase": 1.2      // 作物价值提高20%
            }
        },
        {
            name: "降低怪兽消耗测试",
            description: "测试降低怪兽维护消耗后的资源平衡",
            config: {
                simSpeed: 10,
                logInterval: 60,
                endTime: 86400,
                strategyType: "optimal"
            },
            balanceOverrides: {
                "monsterUpkeep.common.food": 0.05,     // 普通怪兽食物消耗降低
                "monsterUpkeep.uncommon.food": 0.10,   // 优良怪兽食物消耗降低
                "monsterUpkeep.uncommon.coins": 0.03   // 优良怪兽金币消耗降低
            }
        },
        {
            name: "资源积累策略测试",
            description: "测试玩家采取资源积累策略的效果",
            config: {
                simSpeed: 10,
                logInterval: 60,
                endTime: 86400,
                strategyType: "resource-focused"
            },
            balanceOverrides: {}
        },
        {
            name: "科技专注策略测试",
            description: "测试玩家优先解锁科技的策略效果",
            config: {
                simSpeed: 10,
                logInterval: 60,
                endTime: 86400,
                strategyType: "tech-focused"
            },
            balanceOverrides: {}
        }
    ],
    
    // 输出配置
    output: {
        // 报告输出目录
        reportDir: "./balance_reports",
        
        // 生成图表
        generateCharts: false,
        
        // 报告格式
        format: "json",  // json, csv, 或 html
        
        // 详细程度
        verbosity: 2     // 0=简洁, 1=标准, 2=详细
    }
};