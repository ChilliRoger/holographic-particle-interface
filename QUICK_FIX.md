# Quick Fix for npm Command Not Found

## Problem
Node.js is installed at `C:\Program Files\nodejs\` but not in your PATH, so `npm` command is not recognized.

## Solution Options

### Option 1: Quick Fix (Run Install Now)
**Double-click:** `install-dependencies.bat`

This will:
- Add Node.js to PATH for this session
- Install all project dependencies
- Show you how to fix PATH permanently

### Option 2: PowerShell Script
**Right-click** `fix-path-and-install.ps1` → **Run with PowerShell**

### Option 3: Manual Command (Current Session Only)
Open PowerShell in this folder and run:
```powershell
$env:PATH += ";C:\Program Files\nodejs"
npm install
```

### Option 4: Use Full Path (One-Time)
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

## Permanent Fix (Recommended)

To make npm work in all terminals permanently:

1. **Press `Win + X`** → Select **"System"**
2. Click **"Advanced system settings"**
3. Click **"Environment Variables"** button
4. Under **"System variables"**, find and select **"Path"**
5. Click **"Edit"**
6. Click **"New"**
7. Add: `C:\Program Files\nodejs`
8. Click **"OK"** on all dialogs
9. **Restart your terminal/IDE**

## Verify Fix

After fixing PATH, restart terminal and run:
```powershell
node --version
npm --version
```

Both should show version numbers.

## After Installation

Once dependencies are installed, start the dev server:
```powershell
npm run dev
```

The app will open at: `http://localhost:3000`


