/**
 * 平衡模拟器运行器
 * 
 * 用于执行平衡模拟并记录结果
 */

const fs = require('fs');
const path = require('path');
const BalanceSimulator = require('./balance_sim');

// 导入游戏数据
const cropData = [
    { id:'wheat',    name:'小麦',    tier:1, growTime:15000,  yield:5,  value:8,   foodVal:5,  requiredTech:null,
      preferredMonster:'goblin', desc:'基础粮食，生长最快', icon:'plant', materialYield:0 },
    { id:'potato',   name:'土豆',    tier:1, growTime:20000,  yield:10, value:10,  foodVal:8,  requiredTech:null,
      preferredMonster:'slime',  desc:'扁豆高产，产量稳定', icon:'plant', materialYield:0 },
    { id:'corn',     name:'玉米',    tier:1, growTime:25000,  yield:8,  value:15,  foodVal:6,  requiredTech:null,
      preferredMonster:'golem',  desc:'高产作物，需较长时间', icon:'plant', materialYield:0 },
    // Tier 2
    { id:'berry',    name:'浆果',    tier:2, growTime:30000,  yield:12, value:25,  foodVal:10, requiredTech:'advancedFarming',
      preferredMonster:'sprite', desc:'甜美浆果，售价较高', icon:'plant', materialYield:0 },
    { id:'mushroom', name:'蘑菇',    tier:2, growTime:40000,  yield:6,  value:35,  foodVal:4,  requiredTech:'advancedFarming',
      preferredMonster:'wisp',   desc:'魔法蘑菇，单价极高', icon:'plant', materialYield:0 },
    // Tier 3
    { id:'sunflower',name:'向日葵',  tier:3, growTime:45000,  yield:8,  value:50,  foodVal:5,  requiredTech:'cropT3',
      preferredMonster:'sprite', desc:'追光而生，额外产出研究点', icon:'plant', materialYield:0, researchYield:5 },
    { id:'herb',     name:'草药',    tier:3, growTime:50000,  yield:10, value:45,  foodVal:8,  requiredTech:'cropT3',
      preferredMonster:'wisp',   desc:'珍贵草药，可提炼材料', icon:'plant', materialYield:3 }
];

const monsterData = {
    slime:    { name:'史莱姆',   color:'#4caf50', rarity:'common',    baseStats:{ strength:3, agility:2, intelligence:1, farming:4 }, catchZone:'farm_edge',    desc:'友善的农场助手，擅长照料土豆' },
    goblin:   { name:'哥布林',   color:'#ff9800', rarity:'common',    baseStats:{ strength:4, agility:3, intelligence:2, farming:2 }, catchZone:'shallow_forest',desc:'勤劳的小工，小麦专家' },
    sprout:   { name:'嫩芽精',   color:'#8bc34a', rarity:'common',    baseStats:{ strength:1, agility:2, intelligence:3, farming:5 }, catchZone:'farm_edge',    desc:'天生农夫，所有作物均有加成' },
    sprite:   { name:'精灵',     color:'#2196f3', rarity:'uncommon',  baseStats:{ strength:1, agility:4, intelligence:5, farming:3 }, catchZone:'wild_plain',   desc:'智慧精灵，研究加成优秀' },
    golem:    { name:'石像鬼',   color:'#607d8b', rarity:'uncommon',  baseStats:{ strength:5, agility:1, intelligence:1, farming:3 }, catchZone:'rocky_hills',  desc:'坚如磐石，耐久力强' }
};

// ==================== 扩展模拟器功能 ====================
class EnhancedSimulator extends BalanceSimulator {
    constructor(config = {}) {
        super();
        
        // 应用自定义配置
        if (config.simSpeed) this.simConfig.simSpeed = config.simSpeed;
        if (config.logInterval) this.simConfig.logInterval = config.logInterval;
        if (config.endTime) this.simConfig.endTime = config.endTime;
        if (config.strategyType) this.simConfig.strategyType = config.strategyType;
    }

    // 扩展方法：检查资源平衡性
    analyzeResourceBalance() {
        const logs = this.simLog;
        if (logs.length === 0) return {};
        
        // 分析资源趋势
        let foodTrend = [];
        let coinsTrend = [];
        let materialsTrend = [];
        let researchTrend = [];
        
        logs.forEach(log => {
            foodTrend.push(log.resources.food);
            coinsTrend.push(log.resources.coins);
            materialsTrend.push(log.resources.materials);
            researchTrend.push(log.resources.research);
        });
        
        // 计算资源增长率（每小时）
        const calcGrowthRate = (trend) => {
            if (trend.length < 60) return 0;
            
            // 每60个点（模拟1小时）计算一次增长率
            const hourlyRates = [];
            for (let i = 60; i < trend.length; i += 60) {
                const prev = trend[i - 60];
                const curr = trend[i];
                if (prev > 0) {
                    hourlyRates.push((curr - prev) / prev);
                } else {
                    hourlyRates.push(curr > 0 ? 1 : 0);
                }
            }
            
            // 计算平均增长率
            if (hourlyRates.length === 0) return 0;
            return hourlyRates.reduce((a, b) => a + b, 0) / hourlyRates.length;
        };
        
        // 计算资源波动性
        const calcVolatility = (trend) => {
            if (trend.length < 2) return 0;
            
            const changes = [];
            for (let i = 1; i < trend.length; i++) {
                changes.push(Math.abs(trend[i] - trend[i - 1]));
            }
            
            const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
            const maxVal = Math.max(...trend);
            
            return maxVal > 0 ? avgChange / maxVal : 0;
        };
        
        return {
            food: {
                growthRate: calcGrowthRate(foodTrend),
                volatility: calcVolatility(foodTrend),
                endValue: foodTrend[foodTrend.length - 1]
            },
            coins: {
                growthRate: calcGrowthRate(coinsTrend),
                volatility: calcVolatility(coinsTrend),
                endValue: coinsTrend[coinsTrend.length - 1]
            },
            materials: {
                growthRate: calcGrowthRate(materialsTrend),
                volatility: calcVolatility(materialsTrend),
                endValue: materialsTrend[materialsTrend.length - 1]
            },
            research: {
                growthRate: calcGrowthRate(researchTrend),
                volatility: calcVolatility(researchTrend),
                endValue: researchTrend[researchTrend.length - 1]
            }
        };
    }
    
    // 扩展方法：分析游戏进程速度
    analyzeProgressionSpeed() {
        const timeNodes = this.timeNodeData;
        const stages = Object.keys(timeNodes)
            .filter(key => key.includes('阶段'))
            .map(key => ({ 
                stage: key, 
                time: timeNodes[key].time,
                resources: timeNodes[key].resources
            }));
        
        // 计算各阶段之间的间隔时间
        const intervals = [];
        for (let i = 1; i < stages.length; i++) {
            intervals.push({
                from: stages[i-1].stage,
                to: stages[i].stage,
                timeInterval: stages[i].time - stages[i-1].time,
                realTimeHours: (stages[i].time - stages[i-1].time) / 3600
            });
        }
        
        return {
            stageProgression: stages,
            stageIntervals: intervals,
            overallPace: intervals.length > 0
                ? intervals.reduce((sum, i) => sum + i.timeInterval, 0) / intervals.length
                : 0
        };
    }
    
    // 扩展方法：分析怪兽效益
    analyzeMonsterEfficiency() {
        // 在这个简化版中，我们只计算怪兽维护成本与产出的比例
        const finalStats = this.simLog[this.simLog.length - 1];
        const monsterCount = finalStats.monsters;
        
        if (monsterCount === 0) return { efficiency: 0 };
        
        // 计算每个怪兽的平均产出（简化）
        const totalHarvests = finalStats.harvests;
        const avgHarvestsPerMonster = totalHarvests / monsterCount;
        
        // 估算消耗
        const avgFoodPerMonster = 0.08 * 3600; // 假设平均每小时每怪兽消耗0.08*3600食物
        
        return {
            monsterCount: monsterCount,
            avgHarvestsPerMonster: avgHarvestsPerMonster,
            foodConsumptionPerHour: avgFoodPerMonster,
            estimatedEfficiency: avgHarvestsPerMonster > 0 
                ? (finalStats.resources.food + finalStats.resources.coins) / (monsterCount * avgFoodPerMonster)
                : 0
        };
    }
    
    // 扩展方法：生成完整的平衡性分析报告
    generateBalanceReport() {
        const report = this.generateReport();
        
        // 添加分析结果
        report.analysis = {
            resourceBalance: this.analyzeResourceBalance(),
            progressionSpeed: this.analyzeProgressionSpeed(),
            monsterEfficiency: this.analyzeMonsterEfficiency()
        };
        
        // 添加平衡性评分和建议
        const balanceScores = this._calculateBalanceScores(report);
        report.balanceScores = balanceScores;
        report.recommendations = this._generateRecommendations(report, balanceScores);
        
        return report;
    }
    
    // 计算各方面平衡性评分（1-10分）
    _calculateBalanceScores(report) {
        const scores = {
            resourceBalance: 0,
            progressionPace: 0,
            monsterValue: 0,
            overallBalance: 0
        };
        
        // 资源平衡性评分
        const rb = report.analysis.resourceBalance;
        const foodGrowth = rb.food.growthRate;
        const coinGrowth = rb.coins.growthRate;
        
        // 理想情况：资源增长率为中等正值，波动较小
        scores.resourceBalance = Math.min(10, Math.max(1, 
            5 + 
            (foodGrowth > 0 ? Math.min(3, foodGrowth * 10) : Math.max(-3, foodGrowth * 5)) +
            (coinGrowth > 0 ? Math.min(3, coinGrowth * 10) : Math.max(-3, coinGrowth * 5)) -
            rb.food.volatility * 5 -
            rb.coins.volatility * 5
        ));
        
        // 游戏进程评分
        const ps = report.analysis.progressionSpeed;
        if (ps.stageIntervals.length > 0) {
            const avgHoursPerStage = ps.stageIntervals.reduce((sum, i) => sum + i.realTimeHours, 0) / ps.stageIntervals.length;
            // 理想进程：每阶段2-4小时
            scores.progressionPace = Math.min(10, Math.max(1,
                10 - Math.abs(avgHoursPerStage - 3) * 2
            ));
        } else {
            scores.progressionPace = 5; // 默认中等
        }
        
        // 怪兽价值评分
        const me = report.analysis.monsterEfficiency;
        scores.monsterValue = Math.min(10, Math.max(1,
            me.estimatedEfficiency * 2
        ));
        
        // 总体平衡性
        scores.overallBalance = Math.round((scores.resourceBalance + scores.progressionPace + scores.monsterValue) / 3);
        
        return scores;
    }
    
    // 生成平衡性建议
    _generateRecommendations(report, scores) {
        const recommendations = [];
        const rb = report.analysis.resourceBalance;
        const ps = report.analysis.progressionSpeed;
        
        // 资源平衡建议
        if (scores.resourceBalance < 4) {
            if (rb.food.endValue < 50 || rb.food.growthRate < 0) {
                recommendations.push("食物产量严重不足。建议：提高作物产量、降低怪兽食物消耗或调整怪兽数量限制。");
            }
            if (rb.coins.endValue < 100 || rb.coins.growthRate < 0) {
                recommendations.push("金币获取困难。建议：提高作物售价或降低关键设施的金币解锁成本。");
            }
            if (rb.food.volatility > 0.3) {
                recommendations.push("食物波动过大。建议：调整作物生长周期，使产出更稳定。");
            }
        }
        
        // 进程建议
        if (scores.progressionPace < 4) {
            if (ps.stageIntervals.length === 0) {
                recommendations.push("游戏进程过慢，未能解锁阶段2。建议：降低前期阶段的解锁条件。");
            } else {
                const slowStages = ps.stageIntervals.filter(i => i.realTimeHours > 5);
                if (slowStages.length > 0) {
                    recommendations.push(`游戏进程放缓在 ${slowStages[0].from} 到 ${slowStages[0].to}。建议：检查该阶段解锁条件或提高相关资源获取速度。`);
                }
            }
        } else if (scores.progressionPace > 8) {
            recommendations.push("游戏进程过快。建议：增加中后期阶段的解锁条件难度。");
        }
        
        // 怪兽效益建议
        if (scores.monsterValue < 4) {
            recommendations.push("怪兽维护成本过高，产出效益不足。建议：降低怪兽维护成本或增加怪兽产出加成。");
        } else if (scores.monsterValue > 8) {
            recommendations.push("怪兽效益过高，游戏难度降低。建议：适当提高高级怪兽维护成本。");
        }
        
        // 总体建议
        if (scores.overallBalance < 4) {
            recommendations.push("游戏整体平衡性较差，需要全面调整资源产出和消耗比例。");
        } else if (scores.overallBalance >= 7) {
            recommendations.push("游戏整体平衡性良好，建议微调以优化体验。");
        }
        
        return recommendations;
    }
}

// ==================== 运行模拟 ====================
// 执行不同配置的模拟
function runBalanceTests() {
    // 创建输出目录
    const outputDir = path.join(__dirname, 'balance_reports');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const tests = [
        {
            name: "默认平衡测试",
            config: {
                simSpeed: 10,       // 10倍速模拟
                logInterval: 60,    // 每分钟记录一次
                endTime: 86400,     // 模拟1天
                strategyType: "optimal"
            }
        },
        {
            name: "加速进程测试",
            config: {
                simSpeed: 20,
                logInterval: 60,
                endTime: 172800,    // 模拟2天
                strategyType: "optimal"
            }
        },
        {
            name: "资源积累策略测试",
            config: {
                simSpeed: 10,
                logInterval: 60,
                endTime: 86400,
                strategyType: "resource-focused"
            }
        }
    ];
    
    tests.forEach(test => {
        console.log(`\n========== 开始【${test.name}】 ==========`);
        
        // 创建并初始化模拟器
        const simulator = new EnhancedSimulator(test.config)
            .init()
            .loadGameData(cropData, monsterData);
        
        // 运行模拟
        const report = simulator.runSimulation();
        const analysisReport = simulator.generateBalanceReport();
        
        // 格式化输出
        console.log(`\n【${test.name}】模拟结果:`);
        console.log(`- 游戏时间: ${report.summary.endTime}秒 (${Math.round(report.summary.endTime/3600)}小时)`);
        console.log(`- 最终阶段: ${report.summary.endStage}`);
        console.log(`- 怪兽数量: ${report.summary.monsters}`);
        console.log(`- 总收获次数: ${report.summary.totalHarvests}`);
        console.log(`- 总探索次数: ${report.summary.totalExplorations}`);
        console.log(`- 最终资源: 金币=${report.summary.finalResources.coins}, 食物=${report.summary.finalResources.food}, 材料=${report.summary.finalResources.materials}, 研究点=${report.summary.finalResources.research}`);
        
        // 输出平衡性评分
        console.log(`\n【${test.name}】平衡性评分:`);
        console.log(`- 资源平衡: ${analysisReport.balanceScores.resourceBalance}/10`);
        console.log(`- 游戏进程: ${analysisReport.balanceScores.progressionPace}/10`);
        console.log(`- 怪兽效益: ${analysisReport.balanceScores.monsterValue}/10`);
        console.log(`- 总体平衡: ${analysisReport.balanceScores.overallBalance}/10`);
        
        // 输出建议
        console.log(`\n【${test.name}】平衡性建议:`);
        analysisReport.recommendations.forEach((rec, i) => {
            console.log(`${i+1}. ${rec}`);
        });
        
        // 保存详细报告
        const reportPath = path.join(outputDir, `${test.name.replace(/\s+/g, '_')}_report.json`);
        fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));
        console.log(`\n详细报告已保存至: ${reportPath}`);
    });
}

// 主程序入口
function main() {
    console.log("=== 农场游戏平衡模拟系统 ===");
    console.log("开始执行多组平衡测试...\n");
    
    runBalanceTests();
}

// 执行主程序
main();