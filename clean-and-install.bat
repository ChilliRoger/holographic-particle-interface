@echo off
echo ========================================
echo Clean Install - Fixing Network Errors
echo ========================================
echo.

echo Step 1: Removing corrupted node_modules...
if exist node_modules (
    echo Removing node_modules directory...
    rmdir /s /q node_modules 2>nul
    if exist node_modules (
        echo WARNING: Could not fully remove node_modules
        echo You may need to close any programs using these files
        echo Press any key to continue anyway...
        pause >nul
    ) else (
        echo [OK] node_modules removed
    )
) else (
    echo [OK] node_modules not found
)

echo.
echo Step 2: Removing package-lock.json...
if exist package-lock.json (
    del /f /q package-lock.json 2>nul
    echo [OK] package-lock.json removed
) else (
    echo [OK] package-lock.json not found
)

echo.
echo Step 3: Clearing npm cache...
"C:\Program Files\nodejs\npm.cmd" cache clean --force
echo [OK] Cache cleared

echo.
echo Step 4: Configuring npm for better reliability...
"C:\Program Files\nodejs\npm.cmd" config set registry https://registry.npmjs.org/
"C:\Program Files\nodejs\npm.cmd" config set fetch-retries 5
"C:\Program Files\nodejs\npm.cmd" config set fetch-retry-mintimeout 20000
"C:\Program Files\nodejs\npm.cmd" config set fetch-retry-maxtimeout 120000
echo [OK] npm configured

echo.
echo Step 5: Installing dependencies...
echo This may take several minutes. Please be patient...
echo.

"C:\Program Files\nodejs\npm.cmd" install --verbose

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Dependencies installed.
    echo ========================================
    echo.
    echo To start the dev server, run:
    echo   npm run dev
    echo.
) else (
    echo.
    echo ========================================
    echo INSTALLATION FAILED
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Try again (network may be temporarily unavailable)
    echo 3. Use a different network/VPN
    echo 4. Check if firewall/antivirus is blocking npm
    echo.
    echo You can also try:
    echo   npm install --legacy-peer-deps
    echo.
)

pause

