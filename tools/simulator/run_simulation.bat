@echo off
echo 正在启动农场游戏平衡模拟系统...
echo.

:: 检查Node.js环境
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js环境，请安装Node.js后再运行。
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 运行模拟器
echo 正在执行模拟测试...
node run_sim.js

:: 检查是否成功生成报告
if exist "balance_reports" (
    echo.
    echo 模拟测试完成！报告已生成。
    
    :: 询问是否打开报告
    set /p open_report="是否立即查看报告? (Y/N): "
    if /i "%open_report%"=="Y" (
        echo 正在打开报告...
        start "" "balance_reports\latest_report.html"
    ) else (
        echo.
        echo 您可以在balance_reports目录下查看生成的报告文件。
    )
) else (
    echo.
    echo 警告: 模拟过程可能出现错误，未找到报告文件。
    echo 请检查控制台输出了解详细错误信息。
)

echo.
echo 模拟系统操作完成。
pause