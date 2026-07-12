@echo off
REM J2026VaultBot — start Telegram bot (Windows)
REM Usage: bot\run-bot.bat   OR   run-bot.bat
setlocal EnableExtensions

set "BOT_DIR=%~dp0"
if "%BOT_DIR:~-1%"=="\" set "BOT_DIR=%BOT_DIR:~0,-1%"
for %%I in ("%BOT_DIR%\..") do set "ROOT=%%~fI"
cd /d "%ROOT%"

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  set "PYTHON=py -3"
) else (
  where python >nul 2>&1
  if %ERRORLEVEL%==0 (
    set "PYTHON=python"
  ) else (
    echo Python 3 is required. Install Python 3, then run this script again.
    exit /b 1
  )
)

if not exist "%BOT_DIR%\config.py" (
  echo Missing bot\config.py
  echo Copy bot\config.example.py to bot\config.py and add your bot token.
  exit /b 1
)

for %%F in (welcome.png membership.png help.png menu.png) do (
  if not exist "%BOT_DIR%\assets\%%F" (
    echo Missing bot\assets\%%F
    exit /b 1
  )
)

echo Checking for other bot instances...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python' -and $_.CommandLine -match 'bot[\\/]main\.py' } | ForEach-Object { Write-Host ('  Stopping PID ' + $_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul

if not exist "%ROOT%\.venv\Scripts\python.exe" (
  echo Creating virtual environment in .venv ...
  %PYTHON% -m venv "%ROOT%\.venv"
  if errorlevel 1 (
    echo Failed to create .venv
    exit /b 1
  )
)

call "%ROOT%\.venv\Scripts\activate.bat"

echo Installing / updating dependencies...
python -m pip install --upgrade pip >nul
python -m pip install -r "%BOT_DIR%\requirements.txt"
if errorlevel 1 (
  echo Failed to install requirements
  exit /b 1
)

if not exist "%BOT_DIR%\logs" mkdir "%BOT_DIR%\logs"

echo.
echo Starting J2026VaultBot...
echo   Assets: %BOT_DIR%\assets
echo   Press Ctrl+C to stop.
echo.
python "%BOT_DIR%\main.py"

endlocal
