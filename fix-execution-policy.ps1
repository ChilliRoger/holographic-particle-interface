# Fix PowerShell Execution Policy and Install Dependencies
# Run this script to fix the npm execution policy error

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PowerShell Execution Policy Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current execution policy
$currentPolicy = Get-ExecutionPolicy
Write-Host "Current Execution Policy: $currentPolicy" -ForegroundColor Yellow
Write-Host ""

# Solution 1: Use npm.cmd instead (works immediately)
Write-Host "Solution 1: Using npm.cmd (bypasses execution policy)" -ForegroundColor Green
Write-Host "Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "To fix execution policy permanently:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option A - Current User (Recommended):" -ForegroundColor White
    Write-Host "  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option B - Current Session Only:" -ForegroundColor White
    Write-Host "  Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option C - Use npm.cmd always:" -ForegroundColor White
    Write-Host "  Create alias: Set-Alias npm 'C:\Program Files\nodejs\npm.cmd'" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Installation failed. Check errors above." -ForegroundColor Red
}

