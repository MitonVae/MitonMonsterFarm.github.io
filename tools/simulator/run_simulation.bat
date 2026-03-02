@echo off
echo ====================================================
echo     农场游戏平衡模拟系统 - 自动化测试启动器
echo ====================================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到Node.js，请安装Node.js后再运行此脚本。
    echo 下载地址: https://nodejs.org/
    pause
    exit /b
)

echo [信息] 检测到Node.js已安装，准备运行模拟...
echo.

REM 创建输出目录
if not exist "balance_reports" mkdir "balance_reports"

echo [信息] 开始执行平衡模拟...
echo.

REM 执行模拟脚本
node run_sim.js

echo.
echo [完成] 模拟结束，结果已保存到balance_reports目录。
echo.

REM 如果生成了HTML报告，提示用户查看
if exist "balance_reports\*_report.html" (
    echo [提示] HTML报告已生成，您可以在浏览器中查看详细结果。
)

echo.
echo 按任意键退出...
pause > nul