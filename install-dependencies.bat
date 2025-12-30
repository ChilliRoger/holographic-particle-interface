@echo off
echo ========================================
echo Node.js Dependency Installer
echo ========================================
echo.

REM Add Node.js to PATH for this session
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Check if Node.js exists
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Found Node.js
    echo.
    echo Node.js version:
    "C:\Program Files\nodejs\node.exe" --version
    echo.
    echo npm version:
    "C:\Program Files\nodejs\npm.cmd" --version
    echo.
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    
    REM Install dependencies (using .cmd bypasses PowerShell execution policy)
    "C:\Program Files\nodejs\npm.cmd" install
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Dependencies installed!
        echo.
        echo To fix PATH permanently:
        echo 1. Press Win+X, select "System"
        echo 2. Click "Advanced system settings"
        echo 3. Click "Environment Variables"
        echo 4. Edit "Path" in System variables
        echo 5. Add: C:\Program Files\nodejs
        echo 6. Restart your terminal
    ) else (
        echo.
        echo [ERROR] Installation failed!
    )
) else (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
)

pause


