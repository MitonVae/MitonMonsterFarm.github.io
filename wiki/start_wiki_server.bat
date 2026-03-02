@echo off
echo 正在启动Wiki服务器，请稍候...
echo 启动后将自动打开Wiki主页

REM 切换到docs目录
cd ../docs

REM 启动服务
start http://localhost:8000
python -m http.server 8000

pause