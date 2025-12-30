# Setup and Testing Guide

## Prerequisites Installation

### Step 1: Install Node.js
1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer
3. **Important**: Check "Add to PATH" during installation
4. Restart your terminal/IDE after installation
5. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

## Project Setup

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Start Development Server
```powershell
npm run dev
```

The server will start at: `http://localhost:3000`

## Testing Checklist

### ✅ Basic Functionality Tests

1. **Application Loads**
   - [ ] Page loads without errors
   - [ ] Black background visible
   - [ ] Particles render on screen
   - [ ] UI overlay visible (top-left and top-right panels)

2. **Particle System**
   - [ ] Particles are visible and glowing
   - [ ] Default formation (Cube) displays correctly
   - [ ] Particles move smoothly
   - [ ] No console errors

3. **UI Controls**
   - [ ] Status panel shows: MODE, OBJECT, PARTICLES
   - [ ] Mode toggle button works
   - [ ] Preset buttons visible (bottom-right)
   - [ ] Settings panel accessible (top-right)

### ✅ Keyboard Controls Tests

1. **Preset Switching**
   - [ ] Press `1` → Cube formation
   - [ ] Press `2` → Sphere formation
   - [ ] Press `3` → Cylinder formation
   - [ ] Press `4` → Cone formation
   - [ ] Press `5` → Torus formation
   - [ ] Press `6` → Pyramid formation
   - [ ] Press `9` → Free Flow mode (formation disabled)

2. **Navigation Controls**
   - [ ] `Arrow Keys` → Rotate hologram
   - [ ] `Space` → Toggle formation mode
   - [ ] `H` → Hide/show UI
   - [ ] `M` → Toggle control mode (CURSOR ↔ GESTURE)
   - [ ] `R` → Reset particles
   - [ ] `?` → Toggle help panel

### ✅ Mouse Controls Tests

1. **Cursor Mode**
   - [ ] Move mouse → Particles attract to cursor
   - [ ] Click and hold → Stronger attraction
   - [ ] Right-click drag → Rotate hologram 360°
   - [ ] Mouse wheel → Zoom in/out (range: 2-15)

2. **Visual Feedback**
   - [ ] Particles respond smoothly to mouse movement
   - [ ] Rotation is smooth and responsive
   - [ ] Zoom works correctly

### ✅ Image Upload Feature

1. **Upload Process**
   - [ ] Click "UPLOAD IMAGE" button
   - [ ] File picker opens
   - [ ] Select JPEG/PNG image
   - [ ] Processing indicator shows
   - [ ] 3D model generates successfully
   - [ ] Preset switches to "Custom Upload"

2. **Error Handling**
   - [ ] Invalid file type shows error message
   - [ ] Error message displays at top-center
   - [ ] Error message clears after new upload

3. **Generated Model**
   - [ ] Particles form image outline
   - [ ] Model is properly scaled (fits screen)
   - [ ] Depth effect visible (3D appearance)

### ✅ Gesture Mode Tests (Requires Webcam)

1. **Camera Access**
   - [ ] Switch to GESTURE mode
   - [ ] Camera permission prompt appears
   - [ ] Camera feed visible (bottom-left)
   - [ ] Hand skeleton overlay visible

2. **Gesture Recognition**
   - [ ] Open Palm → Rotation mode (move hand)
   - [ ] Closed Fist → Repel particles
   - [ ] Pinch → Grab and drag
   - [ ] Point → Attract particles
   - [ ] Peace Sign → Rotation mode
   - [ ] Thumbs Up → Zoom in
   - [ ] Thumbs Down → Zoom out
   - [ ] OK Sign → Standard attraction
   - [ ] Rock Sign → Strong attraction

3. **Visual Feedback**
   - [ ] Gesture type displayed (large text, center)
   - [ ] Hand skeleton color changes based on gesture
   - [ ] Rotation indicator shows when active

### ✅ Settings Panel Tests

1. **Rotation Speed**
   - [ ] Slider adjusts rotation speed (0-10)
   - [ ] Changes apply immediately
   - [ ] Auto-rotation speed changes

2. **Color Schemes**
   - [ ] Click color dots → Particle color changes
   - [ ] All 6 colors work: Cyan, Green, Purple, Pink, Orange, White
   - [ ] Active color highlighted

3. **Formation Lock**
   - [ ] Checkbox toggles formation mode
   - [ ] When unchecked, particles free-flow
   - [ ] When checked, particles form shape

### ✅ Help Panel Tests

1. **Accessibility**
   - [ ] Press `?` → Help panel opens
   - [ ] Click help button (bottom-right) → Panel opens
   - [ ] Panel is scrollable
   - [ ] Close button works
   - [ ] Click outside panel → Closes

2. **Content**
   - [ ] All gesture descriptions visible
   - [ ] Keyboard controls listed
   - [ ] Mouse controls listed
   - [ ] Image upload instructions present
   - [ ] Pro tips section visible

### ✅ Performance Tests

1. **Frame Rate**
   - [ ] Smooth 60 FPS (check browser DevTools)
   - [ ] No stuttering or lag
   - [ ] Particles animate smoothly

2. **Memory Usage**
   - [ ] No memory leaks (monitor over time)
   - [ ] Switching presets doesn't cause issues
   - [ ] Multiple image uploads work

3. **Browser Compatibility**
   - [ ] Chrome/Edge: Full functionality
   - [ ] Firefox: Full functionality
   - [ ] Safari: Full functionality (if tested)

## Known Issues to Check

1. **TypeScript Error**: `Cannot find type definition file for 'node'`
   - This will resolve after `npm install` (installs @types/node)

2. **MediaPipe CDN**: Requires internet connection
   - Gesture mode won't work offline

3. **Camera Access**: Requires HTTPS or localhost
   - Gesture mode needs secure context

## Browser Console Checks

Open DevTools (F12) and verify:
- [ ] No red errors
- [ ] No warnings about missing dependencies
- [ ] MediaPipe loads successfully (if using gesture mode)
- [ ] Three.js initializes correctly

## Test Results Template

```
Date: ___________
Node.js Version: ___________
Browser: ___________

Basic Functionality: [ ] Pass [ ] Fail
Keyboard Controls: [ ] Pass [ ] Fail
Mouse Controls: [ ] Pass [ ] Fail
Image Upload: [ ] Pass [ ] Fail
Gesture Mode: [ ] Pass [ ] Fail (Requires webcam)
Settings: [ ] Pass [ ] Fail
Help Panel: [ ] Pass [ ] Fail
Performance: [ ] Pass [ ] Fail

Notes:
_________________________________________________
_________________________________________________
```


