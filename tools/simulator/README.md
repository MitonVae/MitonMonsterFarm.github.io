# 农场游戏平衡模拟系统

这是一个用于自动化测试游戏数值平衡的模拟系统，能够模拟玩家从开局到各个时间节点的游戏进程和资源消耗情况，并输出分析报告，辅助进行游戏平衡调优。

## 系统组成

- **balance_sim.js**: 核心模拟器类，负责模拟游戏状态、资源变化和玩家行为
- **run_sim.js**: 运行器，用于配置和执行模拟测试
- **sim_config.js**: 配置文件，包含各种模拟参数和预设测试方案

## 使用方法

### 基础运行

```bash
node run_sim.js
```

或者直接运行批处理文件：

```bash
run_simulation.bat  # Windows
./run_simulation.sh  # Linux/Mac
```

这将执行预设的多组测试方案，并在控制台输出简要结果，同时在 `balance_reports` 目录下生成详细的JSON报告文件。

### 自定义测试

1. 修改 `sim_config.js` 中的 `presetTests` 部分，添加或调整测试配置
2. 也可以直接修改 `run_sim.js` 中的 `tests` 数组，自定义测试方案

## 平衡性评分说明

系统基于以下几个维度对游戏平衡性进行评分（1-10分）：

1. **资源平衡 (Resource Balance)**
   - 考量各类资源的增长率和波动性

2. **游戏进程 (Progression Pace)**
   - 评估从一个游戏阶段到下一阶段所需的时间

3. **怪兽效益 (Monster Value)**
   - 分析怪兽维护成本与其产出的比值

4. **总体平衡 (Overall Balance)**
   - 综合以上三项的加权平均