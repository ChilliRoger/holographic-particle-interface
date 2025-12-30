# Fix npm Network Installation Errors

## Problem
```
npm error network read ECONNRESET
npm error network This is a problem related to network connectivity.
```

## Quick Solution

### Option 1: Use the Clean Install Script
**Double-click:** `clean-and-install.bat`

This will:
1. Remove corrupted `node_modules`
2. Clear npm cache
3. Configure npm for better reliability
4. Retry installation

### Option 2: Manual Clean Install

Run these commands in PowerShell:

```powershell
# 1. Remove corrupted files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 2. Clear cache
& "C:\Program Files\nodejs\npm.cmd" cache clean --force

# 3. Configure npm
& "C:\Program Files\nodejs\npm.cmd" config set registry https://registry.npmjs.org/
& "C:\Program Files\nodejs\npm.cmd" config set fetch-retries 5
& "C:\Program Files\nodejs\npm.cmd" config set fetch-retry-mintimeout 20000

# 4. Install with retry
& "C:\Program Files\nodejs\npm.cmd" install
```

## Alternative Solutions

### If Network Issues Persist

#### 1. Use Legacy Peer Deps
```powershell
& "C:\Program Files\nodejs\npm.cmd" install --legacy-peer-deps
```

#### 2. Use Different Registry (if npmjs.org is blocked)
```powershell
& "C:\Program Files\nodejs\npm.cmd" config set registry https://registry.npmmirror.com/
& "C:\Program Files\nodejs\npm.cmd" install
```

#### 3. Install with More Timeouts
```powershell
& "C:\Program Files\nodejs\npm.cmd" install --fetch-timeout=300000
```

#### 4. Install Packages One by One (if specific package fails)
```powershell
& "C:\Program Files\nodejs\npm.cmd" install react
& "C:\Program Files\nodejs\npm.cmd" install react-dom
& "C:\Program Files\nodejs\npm.cmd" install three
& "C:\Program Files\nodejs\npm.cmd" install @react-three/fiber
```

## Check Network Issues

### Test npm Registry Connection
```powershell
& "C:\Program Files\nodejs\npm.cmd" ping
```

### Check Current Registry
```powershell
& "C:\Program Files\nodejs\npm.cmd" config get registry
```

Should show: `https://registry.npmjs.org/`

### Reset Registry to Default
```powershell
& "C:\Program Files\nodejs\npm.cmd" config delete registry
```

## Common Causes

1. **Unstable Internet Connection**
   - Solution: Retry installation
   - Use wired connection if possible

2. **Firewall/Antivirus Blocking**
   - Solution: Temporarily disable or add exception for npm

3. **Proxy Settings**
   - Solution: Configure npm proxy if behind corporate firewall
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" config set proxy http://proxy.company.com:8080
   & "C:\Program Files\nodejs\npm.cmd" config set https-proxy http://proxy.company.com:8080
   ```

4. **Corrupted Cache**
   - Solution: Already handled by clean-and-install.bat

5. **File Lock Issues**
   - Solution: Close all programs (VS Code, terminals, etc.) and retry

## If Installation Partially Succeeds

If some packages install but others fail:

```powershell
# Remove partial installation
Remove-Item -Recurse -Force node_modules

# Install with verbose output to see which package fails
& "C:\Program Files\nodejs\npm.cmd" install --verbose

# If specific package fails, install it separately
& "C:\Program Files\nodejs\npm.cmd" install <package-name> --verbose
```

## Verify Installation

After successful installation, check:

```powershell
# Check if node_modules exists
Test-Path node_modules

# Check installed packages
& "C:\Program Files\nodejs\npm.cmd" list --depth=0
```

Should show:
- react
- react-dom
- three
- @react-three/fiber

## Start Development Server

Once installation succeeds:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Or if execution policy is fixed:
```powershell
npm run dev
```

The app will open at: `http://localhost:3000`

