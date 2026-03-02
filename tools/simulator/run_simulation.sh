#!/bin/bash

echo "===================================================="
echo "    农场游戏平衡模拟系统 - 自动化测试启动器"
echo "===================================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请安装Node.js后再运行此脚本。"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "[信息] 检测到Node.js已安装，准备运行模拟..."
echo ""

# 创建输出目录
mkdir -p "balance_reports"

echo "[信息] 开始执行平衡模拟..."
echo ""

# 执行模拟脚本
node run_sim.js

echo ""
echo "[完成] 模拟结束，结果已保存到balance_reports目录。"
echo ""

# 如果生成了HTML报告，提示用户查看
if ls balance_reports/*_report.html 1> /dev/null 2>&1; then
    echo "[提示] HTML报告已生成，您可以在浏览器中查看详细结果。"
fi

echo ""
echo "按Enter键退出..."
read