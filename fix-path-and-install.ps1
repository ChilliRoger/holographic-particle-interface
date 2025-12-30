# Fix Node.js PATH and Install Dependencies
# Run this script as Administrator for permanent fix, or normally for session-only fix

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Node.js PATH Fix & Dependency Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js exists
$nodePath = "C:\Program Files\nodejs"
if (Test-Path $nodePath) {
    Write-Host "✓ Found Node.js at: $nodePath" -ForegroundColor Green
    
    # Add to PATH for current session
    $env:PATH += ";$nodePath"
    Write-Host "✓ Added Node.js to PATH for this session" -ForegroundColor Green
    
    # Check versions
    Write-Host ""
    Write-Host "Node.js version:" -ForegroundColor Yellow
    & "$nodePath\node.exe" --version
    
    Write-Host "npm version:" -ForegroundColor Yellow
    & "$nodePath\npm.cmd" --version
    
    Write-Host ""
    Write-Host "Installing project dependencies..." -ForegroundColor Cyan
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""
    
    # Install dependencies
    & "$nodePath\npm.cmd" install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To fix PATH permanently:" -ForegroundColor Yellow
        Write-Host "1. Right-click 'This PC' → Properties" -ForegroundColor White
        Write-Host "2. Advanced system settings → Environment Variables" -ForegroundColor White
        Write-Host "3. Edit 'Path' in System variables" -ForegroundColor White
        Write-Host "4. Add: C:\Program Files\nodejs" -ForegroundColor White
        Write-Host "5. Restart your terminal/IDE" -ForegroundColor White
        Write-Host ""
        Write-Host "Or run this PowerShell as Administrator and uncomment the permanent fix section" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "✗ Installation failed. Check errors above." -ForegroundColor Red
    }
} else {
    Write-Host "✗ Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
}

# Uncomment below to fix PATH permanently (requires Administrator)
# $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
# if ($currentPath -notlike "*$nodePath*") {
#     [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nodePath", "Machine")
#     Write-Host "✓ Added Node.js to PATH permanently (requires restart)" -ForegroundColor Green
# }


