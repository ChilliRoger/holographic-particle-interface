# Quick Fix for Network Installation Errors
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing npm Network Installation Errors" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up
Write-Host "Step 1: Cleaning up corrupted files..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  Removing node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
if (Test-Path "package-lock.json") {
    Write-Host "  Removing package-lock.json..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}
Write-Host "  [OK] Cleanup complete" -ForegroundColor Green
Write-Host ""

# Step 2: Clear cache
Write-Host "Step 2: Clearing npm cache..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" cache clean --force
Write-Host "  [OK] Cache cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Configure npm
Write-Host "Step 3: Configuring npm..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" config set registry https://registry.npmjs.org/
& "C:\Program Files\nodejs\npm.cmd" config set fetch-retries 5
& "C:\Program Files\nodejs\npm.cmd" config set fetch-retry-mintimeout 20000
& "C:\Program Files\nodejs\npm.cmd" config set fetch-retry-maxtimeout 120000
Write-Host "  [OK] npm configured" -ForegroundColor Green
Write-Host ""

# Step 4: Install
Write-Host "Step 4: Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take several minutes. Please be patient..." -ForegroundColor Gray
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Dependencies installed." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the dev server:" -ForegroundColor Cyan
    Write-Host "  & 'C:\Program Files\nodejs\npm.cmd' run dev" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "INSTALLATION FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these alternatives:" -ForegroundColor Yellow
    Write-Host "  1. Retry: & 'C:\Program Files\nodejs\npm.cmd' install" -ForegroundColor White
    Write-Host "  2. Legacy: & 'C:\Program Files\nodejs\npm.cmd' install --legacy-peer-deps" -ForegroundColor White
    Write-Host "  3. Check internet connection and firewall settings" -ForegroundColor White
}

