# Holographic Particle Interface (HPI)

An immersive 3D particle simulation system that bridges hand gestures and virtual manipulation using WebGL, Three.js, and MediaPipe. The application features real-time particle dynamics, gesture recognition, and interactive holographic formations.

## Overview

HPI is a modern React application built with React 19, TypeScript, Three.js, and Vite for high-performance WebGL rendering. It supports real-time particle manipulation through mouse/cursor control and webcam-based hand gesture tracking.

## Features

### Core Functionality

- **Particle System**: Dynamic particle simulation with 4,000-8,000 particles
- **Preset Formations**: 6 built-in 3D geometric shapes including Cube, Sphere, Cylinder, Cone, Torus, and Pyramid
- **Custom Image Upload**: Transform any JPEG/PNG image into a 3D holographic particle formation using client-side edge detection
- **Dual Control Modes**: Switch between cursor-based and gesture-based interaction
- **Hand Gesture Recognition**: MediaPipe integration for real-time hand tracking and gesture classification
- **360-Degree Rotation**: Full manual control with arrow keys or right-click drag
- **Mouse Wheel Zoom**: Smooth zoom in/out functionality (range: 2-15 units)
- **Interactive Help System**: Comprehensive gesture guide and controls reference with scrollable interface
- **Settings Panel**: Adjustable particle count, color schemes, sensitivity, and rotation speed
- **Morphing Transitions**: Smooth interpolation between different formations

### Gesture Controls

- **Open Palm** (5 fingers extended): 360° rotation - move hand to rotate hologram
- **Point Gesture** (1 finger): Attract particles toward finger with 2.5x strength
- **Closed Fist**: Repel particles away from hand with 1.8x strength
- **Pinch Gesture**: Precise grab and drag manipulation with 2.5x strength
- **Peace Sign** (2 fingers): Alternative 360° rotation mode
- **Thumbs Up/Down**: Zoom in/out controls
- **OK Sign**: Standard attraction
- **Rock Sign**: Strong attraction (1.5x)

## Technology Stack

- **Frontend Framework**: React 19.2.3 with TypeScript
- **3D Rendering**: Three.js 0.182.0 via @react-three/fiber 9.4.2
- **Build Tool**: Vite 6.2.0 with Hot Module Replacement
- **Styling**: Tailwind CSS (CDN)
- **Gesture Recognition**: MediaPipe Hands
- **Module System**: ES Modules via import maps

## Installation

### Prerequisites

- Node.js 16+ or later
- Webcam (optional, for gesture control mode)

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Keyboard Controls

| Key | Action |
|-----|--------|
| 1-6 | Select geometric shape (1=Cube, 2=Sphere, 3=Cylinder, 4=Cone, 5=Torus, 6=Pyramid) |
| 7 | Load custom uploaded image model |
| 9 | Enter free flow mode |
| Arrow Keys | Rotate hologram formation 360 degrees |
| ? | Toggle scrollable help panel with gesture guide |
| Spacebar | Toggle formation mode on/off |
| R | Reset particles to random positions |
| M | Toggle between gesture and cursor control |
| H | Hide/show UI overlay |

### Mouse Controls

- **Move Mouse**: Attract particles toward cursor (in cursor mode)
- **Left Click**: Stronger attraction force
- **Right-Click & Drag**: Rotate hologram 360 degrees in any direction
- **Mouse Wheel**: Smooth zoom in/out (range: 2-15 units)

### Settings

- **Particle Count**: Adjust from 500 to 8,000 particles
- **Sensitivity**: Control interaction force strength (0.1 - 3.0)
- **Color Schemes**: Choose from Cyan Glow, Matrix Green, Electric Purple, Plasma Pink, Sunfire, or Pure White
- **Rotation Speed**: Adjust automatic rotation speed (0 - 10)
- **Formation Lock**: Enable/disable formation mode

### Custom Image Upload

Transform any image into a 3D holographic particle formation:

1. **Click "UPLOAD IMAGE"** button in the control panel (top-left)
2. **Select a JPEG or PNG file** from your device
3. **AI Processing**: Client-side edge detection extracts contours and features
4. **3D Conversion**: Image is converted to particle coordinates with depth mapping
5. **Auto-Scaling**: Model automatically scales to fit within screen boundaries

**Best Practices for Image Upload:**
- Use images with clear, defined edges and high contrast
- Simple objects work better than complex scenes
- Logos, silhouettes, and line art produce excellent results
- File size: recommended under 5MB for faster processing
- Resolution: 300-1000px optimal for clarity

**Technical Details:**
- Uses Sobel edge detection algorithm (threshold: 60)
- Generates 400-700 particle points from image
- Edge-focused sampling (80% edges, 5% fill)
- Depth calculated from image brightness
- No API key required - runs entirely in browser

## Architecture

### Application Structure

```
├── App.tsx                           # Main application component
├── index.tsx                         # React entry point
├── index.html                        # HTML template with import maps
├── index.css                         # Tailwind and custom styles
├── types.ts                          # TypeScript type definitions
├── constants.ts                      # Application constants
├── components/
│   ├── HologramView.tsx             # Three.js particle system
│   ├── GestureProcessor.tsx         # MediaPipe gesture handling
│   └── UIOverlay.tsx                # UI controls and HUD
├── services/
│   ├── geometryGenerator.ts         # 3D model coordinate generation
│   └── geminiReconstruction.ts      # Image-to-3D conversion (client-side)
├── vite.config.ts                   # Vite build configuration
└── tsconfig.json                    # TypeScript configuration
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Production Build

1. Run `npm run build` to create production bundle
2. Deploy the `dist/` directory to your hosting service
3. Ensure HTTPS is enabled for webcam/camera access
4. Configure proper CORS settings if needed

### Hosting Recommendations

- **Vercel/Netlify**: Automatic deployment from Git repository
- **GitHub Pages**: Free hosting for static sites
- **AI Studio**: Full-featured AI application hosting

**Note:** Custom image upload feature requires no backend or API keys - everything runs client-side in the browser.

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with WebGL enabled
- **Webcam Requirements**: HTTPS or localhost for camera access

## Performance Considerations

- **Particle Count**: Higher particle counts require more GPU resources
- **WebGL**: Uses hardware-accelerated WebGL rendering for optimal performance
- **Gesture Recognition**: MediaPipe requires stable internet connection (CDN)

## Troubleshooting

### Camera Access Issues

If gesture mode fails to initialize:
1. Ensure webcam is connected and functional
2. Grant camera permissions in browser settings
3. Use HTTPS or localhost (required for camera access)
4. Check browser console for specific error messages

### Performance Issues

If particles are laggy:
1. Reduce particle count in settings
2. Close other browser tabs/applications
3. Ensure hardware acceleration is enabled in browser

### MediaPipe Loading Issues

If hand tracking fails to load:
1. Verify internet connection (MediaPipe loads from CDN)
2. Check browser console for network errors
3. Disable ad blockers or privacy extensions temporarily

## License

This project is available for educational and personal use.

## Acknowledgments

- Three.js for 3D rendering capabilities
- MediaPipe for hand tracking technology
- React Three Fiber for React-Three.js integration
- Vite for fast build tooling
