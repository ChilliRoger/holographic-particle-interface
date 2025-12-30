@echo off
echo ========================================
echo Installing Dependencies
echo ========================================
echo.
echo Using npm.cmd to bypass PowerShell execution policy...
echo.

REM Use npm.cmd directly (doesn't require execution policy)
"C:\Program Files\nodejs\npm.cmd" install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Dependencies installed.
    echo ========================================
    echo.
    echo To start the dev server, run:
    echo   npm run dev
    echo.
    echo Or use:
    echo   "C:\Program Files\nodejs\npm.cmd" run dev
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Installation failed.
    echo ========================================
    echo.
    echo Check the error messages above.
    echo.
)

pause

