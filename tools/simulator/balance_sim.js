/**
 * 农场游戏平衡模拟器 (Balance Simulator)
 * 
 * 该模拟器用于测试游戏从开局到各个时间节点的资源消耗与生产情况
 * 可根据不同阶段的参数调整，预测游戏进程和平衡性
 */

// 导入游戏数据（模拟环境）
const BALANCE = {
    INITIAL: {
        coins: 50,
        food: 30,
        materials: 0,
        research: 0,
        energy: 100,
        maxEnergy: 100
    },
    TECH_COST_MULT: {
        tier2: 1.0,
        tier3: 2.5,
        tier4: 8.0,
        tier5: 25.0,
        tier6: 80.0
    },
    MONSTER_UPKEEP: {
        common:    { food: 0.08, coins: 0 },
        uncommon:  { food: 0.15, coins: 0.05 },
        rare:      { food: 0.25, coins: 0.15 },
        epic:      { food: 0.40, coins: 0.40 },
        legendary: { food: 0.60, coins: 1.00 }
    }
};

// 导入基本游戏数据模型
const cropTypes = [];  // 将从gamedata.js导入
const monsterTypes = {};  // 将从gamedata.js导入

// ==================== 主要模拟类 ====================
class BalanceSimulator {
    constructor() {
        this.gameState = {
            coins: BALANCE.INITIAL.coins,
            food: BALANCE.INITIAL.food,
            materials: BALANCE.INITIAL.materials,
            research: BALANCE.INITIAL.research,
            energy: BALANCE.INITIAL.energy,
            maxEnergy: BALANCE.INITIAL.maxEnergy,
            monsters: [],
            plots: [],
            technologies: {},
            totalHarvests: 0,
            totalExplorations: 0,
            gameStage: 1,
            gameTime: 0, // 游戏时间（秒）
            realTime: 0  // 现实时间（秒）
        };
        
        this.simConfig = {
            simSpeed: 1,       // 模拟速度倍率
            logInterval: 60,   // 记录间隔（秒）
            endTime: 86400,    // 模拟结束时间（秒）（默认1天）
            strategyType: 'optimal' // 策略类型：optimal, balanced, resource-focused
        };
        
        this.simLog = [];      // 模拟日志
        this.timeNodeData = {}; // 各时间节点数据
    }

    // 初始化模拟环境
    init() {
        // 初始化农田
        for (let i = 0; i < 3; i++) {
            this.gameState.plots.push({
                locked: false,
                crop: null,
                progress: 0,
                assignedMonster: null
            });
        }
        
        console.log("模拟环境初始化完成");
        return this;
    }
    
    // 加载游戏数据（作物、怪兽等）
    loadGameData(crops, monsters) {
        // 在真实环境中这会从游戏数据文件加载
        Object.assign(cropTypes, crops);
        Object.assign(monsterTypes, monsters);
        
        console.log("游戏数据加载完成");
        return this;
    }
    
    // 核心方法：运行模拟
    runSimulation() {
        console.log("开始模拟游戏平衡...");
        
        // 设置起始时间点记录
        this._recordTimeNode("开局");
        
        // 主模拟循环
        for (let t = 1; t <= this.simConfig.endTime; t++) {
            // 更新游戏状态
            this._updateGameState(t);
            
            // 执行AI策略
            this._executeStrategy(t);
            
            // 记录数据
            if (t % this.simConfig.logInterval === 0) {
                this._logData(t);
            }
            
            // 检查游戏阶段变化
            this._checkGameStageProgress(t);
        }
        
        console.log("模拟完成");
        return this.generateReport();
    }
    
    // 内部方法：更新游戏状态
    _updateGameState(time) {
        this.gameState.gameTime = time;
        this.gameState.realTime = time / this.simConfig.simSpeed;
        
        // 处理农田生长
        this._updateFarms();
        
        // 处理怪兽消耗
        this._updateMonsterUpkeep();
    }
    
    // 内部方法：更新农田状态
    _updateFarms() {
        this.gameState.plots.forEach(plot => {
            if (!plot.locked && plot.crop) {
                const crop = cropTypes.find(c => c.id === plot.crop);
                if (crop && plot.progress < 100) {
                    // 计算生长速度
                    let growthSpeed = 1.0;
                    if (plot.assignedMonster) {
                        // 应用怪兽加成
                        growthSpeed *= this._calculateMonsterBonus(plot.assignedMonster);
                    }
                    
                    // 更新进度
                    plot.progress += (100 / crop.growTime) * growthSpeed;
                    
                    // 如果成熟且有怪兽，自动收获
                    if (plot.progress >= 100 && plot.assignedMonster) {
                        this._harvestPlot(plot);
                    }
                }
            }
        });
    }
    
    // 内部方法：更新怪兽维护消耗
    _updateMonsterUpkeep() {
        // 每秒应用怪兽消耗
        this.gameState.monsters.forEach(monster => {
            const typeData = monsterTypes[monster.type];
            if (typeData) {
                const rarity = typeData.rarity || 'common';
                const upkeep = BALANCE.MONSTER_UPKEEP[rarity] || BALANCE.MONSTER_UPKEEP.common;
                
                // 扣除资源
                this.gameState.food = Math.max(0, this.gameState.food - upkeep.food);
                this.gameState.coins = Math.max(0, this.gameState.coins - upkeep.coins);
            }
        });
    }
    
    // 内部方法：收获农田
    _harvestPlot(plot) {
        const crop = cropTypes.find(c => c.id === plot.crop);
        if (!crop) return;
        
        // 基础产出
        const yieldAmt = crop.yield;
        const valueAmt = crop.value;
        
        // 应用加成
        let yieldMult = 1.0;
        if (plot.assignedMonster) {
            yieldMult *= this._calculateQualityChance(plot.assignedMonster);
        }
        
        // 添加资源
        this.gameState.food += Math.floor(yieldAmt * yieldMult);
        this.gameState.coins += Math.floor(valueAmt * yieldMult);
        if (crop.materialYield) {
            this.gameState.materials += Math.floor(crop.materialYield * yieldMult);
        }
        if (crop.researchYield) {
            this.gameState.research += Math.floor(crop.researchYield * yieldMult);
        }
        
        // 重置农田
        plot.progress = 0;
        this.gameState.totalHarvests++;
        
        // 如果有指派的怪兽，立即重新种植
        if (plot.assignedMonster) {
            // 维持相同作物类型
            // 在实际游戏中可能会根据策略变更作物
        }
    }
    
    // 计算怪兽对种植速度的加成
    _calculateMonsterBonus(monster) {
        if (!monster) return 1.0;
        
        // 这里简化处理，实际游戏中有更复杂的计算
        return 1.0 + (monster.stats.farming * 0.08);
    }
    
    // 计算优质产出概率
    _calculateQualityChance(monster) {
        if (!monster) return 1.0;
        
        // 这里简化处理
        return 1.0 + (monster.stats.farming * 0.03);
    }
    
    // 内部方法：执行AI策略
    _executeStrategy(time) {
        // 根据不同策略执行不同的行为
        switch (this.simConfig.strategyType) {
            case 'optimal':
                this._executeOptimalStrategy(time);
                break;
                
            case 'balanced':
                this._executeBalancedStrategy(time);
                break;
                
            case 'resource-focused':
                this._executeResourceStrategy(time);
                break;
                
            default:
                this._executeOptimalStrategy(time);
        }
    }
    
    // 最优策略 - 优先解锁关键科技，高效管理资源
    _executeOptimalStrategy(time) {
        // 优先农田种植
        this._manageOptimalFarming();
        
        // 尝试捕获怪兽（如果资源允许）
        if (time % 300 === 0 && this.gameState.monsters.length < 5) {
            this._attemptCatchMonster();
        }
        
        // 尝试解锁科技
        if (time % 600 === 0) {
            this._attemptUnlockTech();
        }
    }
    
    // 平衡策略 - 均衡发展
    _executeBalancedStrategy(time) {
        // 简化实现
    }
    
    // 资源策略 - 优先资源积累
    _executeResourceStrategy(time) {
        // 简化实现
    }
    
    // 模拟捕获怪兽
    _attemptCatchMonster() {
        if (this.gameState.energy < 20) return;
        
        // 简化的怪兽捕获逻辑
        const monsterTypes = ['slime', 'goblin', 'sprout'];
        const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        
        this.gameState.monsters.push({
            id: 'monster_' + Date.now(),
            name: '模拟怪兽_' + this.gameState.monsters.length,
            type: randomType,
            level: 1,
            stats: {
                strength: 3 + Math.floor(Math.random() * 3),
                agility: 2 + Math.floor(Math.random() * 3),
                intelligence: 1 + Math.floor(Math.random() * 3),
                farming: 4 + Math.floor(Math.random() * 3)
            },
            status: 'idle'
        });
        
        this.gameState.energy -= 20;
    }
    
    // 农田管理（最优策略）
    _manageOptimalFarming() {
        this.gameState.plots.forEach((plot, index) => {
            if (!plot.locked && !plot.crop) {
                // 选择合适的作物
                let cropToPlant = null;
                
                // 根据游戏阶段选择不同的作物
                if (this.gameState.food < 50) {
                    // 食物紧缺，种植产量高的作物
                    cropToPlant = 'potato';
                } else if (this.gameState.coins < 100) {
                    // 金币紧缺，种植价值高的作物
                    cropToPlant = 'corn';
                } else {
                    // 默认平衡选择
                    cropToPlant = 'wheat';
                }
                
                // 种植作物
                if (cropToPlant) {
                    plot.crop = cropToPlant;
                    plot.progress = 0;
                    
                    // 如果有闲置怪兽，分配一个
                    const idleMonster = this.gameState.monsters.find(m => m.status === 'idle');
                    if (idleMonster) {
                        plot.assignedMonster = idleMonster;
                        idleMonster.status = 'farming';
                    }
                }
            }
        });
    }
    
    // 尝试解锁科技
    _attemptUnlockTech() {
        // 简化实现，实际游戏中会有更复杂的科技树逻辑
    }
    
    // 内部方法：检查游戏阶段变化
    _checkGameStageProgress(time) {
        // 简化的游戏阶段判断
        const stage = this.gameState.gameStage;
        
        if (stage === 1 && this.gameState.totalHarvests >= 10 && this.gameState.monsters.length >= 1) {
            this.gameState.gameStage = 2;
            this._recordTimeNode("阶段2：初级牧主");
        } else if (stage === 2 && this.gameState.totalHarvests >= 50 && this.gameState.monsters.length >= 3 && this.gameState.totalExplorations >= 5) {
            this.gameState.gameStage = 3;
            this._recordTimeNode("阶段3：中级领主");
        }
        // 后续阶段判断类似
    }
    
    // 内部方法：记录数据
    _logData(time) {
        const entry = {
            time: time,
            realTime: time / this.simConfig.simSpeed,
            gameStage: this.gameState.gameStage,
            resources: {
                coins: this.gameState.coins,
                food: this.gameState.food,
                materials: this.gameState.materials,
                research: this.gameState.research
            },
            monsters: this.gameState.monsters.length,
            harvests: this.gameState.totalHarvests,
            explorations: this.gameState.totalExplorations
        };
        
        this.simLog.push(entry);
    }
    
    // 记录特定时间节点数据
    _recordTimeNode(label) {
        const data = {
            label: label,
            time: this.gameState.gameTime,
            realTime: this.gameState.realTime,
            gameStage: this.gameState.gameStage,
            resources: { ...this.gameState.resources },
            monsters: this.gameState.monsters.length,
            harvests: this.gameState.totalHarvests,
            explorations: this.gameState.totalExplorations
        };
        
        this.timeNodeData[label] = data;
        console.log(`时间节点【${label}】记录完成，游戏时间：${this.gameState.gameTime}秒`);
    }
    
    // 生成模拟报告
    generateReport() {
        const report = {
            config: { ...this.simConfig },
            summary: {
                endTime: this.gameState.gameTime,
                endStage: this.gameState.gameStage,
                finalResources: {
                    coins: this.gameState.coins,
                    food: this.gameState.food,
                    materials: this.gameState.materials,
                    research: this.gameState.research
                },
                monsters: this.gameState.monsters.length,
                totalHarvests: this.gameState.totalHarvests,
                totalExplorations: this.gameState.totalExplorations
            },
            timeNodes: this.timeNodeData,
            logs: this.simLog
        };
        
        return report;
    }
}

// 导出模拟器
module.exports = BalanceSimulator;