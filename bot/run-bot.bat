@echo off
REM Start J2026VaultBot from this folder.
REM Usage: bot\run-bot.bat
setlocal EnableExtensions

set "BOT_DIR=%~dp0"
if "%BOT_DIR:~-1%"=="\" set "BOT_DIR=%BOT_DIR:~0,-1%"
for %%I in ("%BOT_DIR%\..") do set "ROOT=%%~fI"
cd /d "%BOT_DIR%"

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  set "PYTHON=py -3"
) else (
  where python >nul 2>&1
  if %ERRORLEVEL%==0 (
    set "PYTHON=python"
  ) else (
    echo Python 3 is required.
    exit /b 1
  )
)

if not exist "%BOT_DIR%\config.py" (
  echo Missing bot\config.py
  echo Copy bot\config.example.py to bot\config.py and add your bot token.
  exit /b 1
)

echo Stopping other bot instances...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'python' -and $_.CommandLine -match 'bot[\\/]main\.py' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul

if not exist "%ROOT%\.venv\Scripts\python.exe" (
  echo Creating .venv ...
  %PYTHON% -m venv "%ROOT%\.venv"
)

call "%ROOT%\.venv\Scripts\activate.bat"
python -m pip install --upgrade pip >nul
python -m pip install -r "%BOT_DIR%\requirements.txt"

if not exist "%BOT_DIR%\logs" mkdir "%BOT_DIR%\logs"
if not exist "%BOT_DIR%\data" mkdir "%BOT_DIR%\data"
if not exist "%BOT_DIR%\data\members.json" (
  echo { "updatedAt": null, "members": [] }> "%BOT_DIR%\data\members.json"
)

echo.
echo Starting J2026VaultBot...
echo   %BOT_DIR%
echo   Press Ctrl+C to stop.
echo.
python "%BOT_DIR%\main.py"
endlocal
