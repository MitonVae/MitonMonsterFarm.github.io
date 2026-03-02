@echo off
echo 正在启动本地服务器...
echo 请不要关闭此窗口，关闭此窗口将停止服务器运行
echo.
echo 在浏览器中访问: http://localhost:8000
echo.
cd wiki
start http://localhost:8000
powershell -Command "& {Invoke-WebRequest -Uri 'http://localhost:8000' -Method 'HEAD' -UseBasicParsing > $null}"
if %errorlevel% neq 0 (
  echo 正在尝试安装并使用serve工具...
  powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/vercel/serve/releases/download/v14.2.0/serve-windows-x64.exe' -OutFile 'serve.exe'}"
  echo 下载完成，正在启动服务器...
  serve.exe -l 8000 -s wiki
) else (
  echo 服务器已启动，请保持此窗口开启...
  echo 如需停止服务器，请关闭此窗口
)
pause