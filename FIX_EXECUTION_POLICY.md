# Fix PowerShell Execution Policy Error

## Problem
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded 
because running scripts is disabled on this system.
```

## Quick Solution (Easiest)

### Option 1: Use the Batch File
**Double-click:** `install.bat`

This uses `npm.cmd` which bypasses PowerShell execution policy completely.

### Option 2: Use npm.cmd Directly
In PowerShell, always use:
```powershell
& "C:\Program Files\nodejs\npm.cmd" install
& "C:\Program Files\nodejs\npm.cmd" run dev
```

### Option 3: Create an Alias (One-Time Setup)
Run this in PowerShell:
```powershell
Set-Alias npm 'C:\Program Files\nodejs\npm.cmd'
Set-Alias node 'C:\Program Files\nodejs\node.exe'
```

Then you can use `npm` and `node` normally.

## Permanent Fix (Recommended)

### Fix Execution Policy for Current User
Run PowerShell **as Administrator** and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

This allows:
- ✅ Local scripts to run
- ✅ Downloaded scripts to run (if signed)
- ✅ Safe for your user account only

### Alternative: Fix for Current Session Only
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

This only affects the current PowerShell window.

## Verify Fix

After fixing, test:
```powershell
npm --version
```

Should show version number without errors.

## After Installation

Once dependencies are installed, start dev server:

**Using npm.cmd:**
```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

**Or if execution policy is fixed:**
```powershell
npm run dev
```

## Summary

- **Easiest**: Use `install.bat` (double-click)
- **Quick**: Use `npm.cmd` directly
- **Permanent**: Fix execution policy (one-time)

