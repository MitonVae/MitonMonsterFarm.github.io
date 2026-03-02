@echo off
echo 检查Python安装...
python --version 2>NUL
if %errorlevel% neq 0 (
  echo Python未安装，请安装Python或使用其他服务器选项
  echo 您可以访问 https://www.python.org/downloads/ 下载Python
  echo.
  echo 或者使用之前创建的local_wiki.html查看其他选项
  start ..\local_wiki.html
  goto end
)

echo 正在使用Python启动HTTP服务器...
echo 请不要关闭此窗口，关闭此窗口将停止服务器运行
echo.
echo 在浏览器中访问: http://localhost:8000
echo.
cd "%~dp0wiki"
start http://localhost:8000

python -c "import sys; print('Python ' + sys.version.split()[0])" | findstr "3." > NUL
if %errorlevel% equ 0 (
  python -m http.server 8000
) else (
  python -m SimpleHTTPServer 8000
)

:end
pause