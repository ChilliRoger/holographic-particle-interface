# Holographic Particle Interface (HPI)

An immersive 3D particle simulation system that bridges hand gestures and virtual manipulation using WebGL, Three.js, and MediaPipe. The application features real-time particle dynamics, gesture recognition, and interactive holographic formations.

## Overview

HPI provides two implementations of an interactive particle system:

- **Modern React Application**: Built with React 19, TypeScript, Three.js, and Vite for high-performance WebGL rendering
- **Classic Flask Application**: Python-based server with vanilla JavaScript and Canvas 2D rendering

Both versions support real-time particle manipulation through mouse/cursor control and webcam-based hand gesture tracking.

## Features

### Core Functionality

- **Particle System**: Dynamic particle simulation with 4,000-8,000 particles (React) or 2,000-5,000 particles (Flask)
- **Preset Formations**: 12 built-in 3D holographic models including Tree, Car, Airplane, Human, DNA Helix, Heart, Sphere, Cube, Galaxy, House, and Laptop
- **Dual Control Modes**: Switch between cursor-based and gesture-based interaction
- **Hand Gesture Recognition**: MediaPipe integration for real-time hand tracking and gesture classification
- **Custom Formations**: Draw custom particle paths and save/load custom designs
- **Settings Panel**: Adjustable particle count, color schemes, sensitivity, and rotation speed
- **Morphing Transitions**: Smooth interpolation between different formations

### Gesture Controls

- **Open Palm**: Attract particles toward hand position
- **Closed Fist**: Repel particles away from hand
- **Pinch Gesture**: Precise grab and drag manipulation
- **Peace Sign**: Rotate hologram formation
- **Thumbs Up**: Zoom in / scale up
- **Thumbs Down**: Zoom out / scale down
- **Swipe Left/Right**: Navigate between preset models

## Technology Stack

### React Application

- **Frontend Framework**: React 19.2.3 with TypeScript
- **3D Rendering**: Three.js 0.182.0 via @react-three/fiber 9.4.2
- **Build Tool**: Vite 6.2.0 with Hot Module Replacement
- **Styling**: Tailwind CSS (CDN)
- **Gesture Recognition**: MediaPipe Hands
- **Module System**: ES Modules via import maps

### Flask Application

- **Backend**: Flask 3.0.0 with Python 3.13+
- **Frontend**: Vanilla JavaScript with Canvas 2D API
- **Gesture Recognition**: MediaPipe Hands (CDN)
- **Template Engine**: Jinja2

## Installation

### Prerequisites

- Node.js 16+ (for React application)
- Python 3.13+ (for Flask application)
- Webcam (optional, for gesture control mode)

### React Application Setup

```bash
# Install dependencies
npm install

# Set environment variables (optional for AI Studio deployment)
# Edit .env.local and add your GEMINI_API_KEY

# Start development server
npm run dev
```

The React application will be available at `http://localhost:3000`

### Flask Application Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The Flask application will be available at `http://127.0.0.1:5000`

## Usage

### Keyboard Controls

| Key | Action |
|-----|--------|
| 1-9 | Select hologram preset (1=Tree, 2=Car, etc.) |
| 0 | Enter free draw mode |
| Arrow Keys | Rotate hologram formation |
| Spacebar | Toggle formation mode on/off |
| R | Reset particles to random positions |
| S | Toggle settings panel |
| G/M | Toggle between gesture and cursor control |
| C | Clear drawing (in draw mode) |
| H | Hide/show UI overlay |
| T | Show tutorial (Flask version) |

### Mouse Controls

- **Move Mouse**: Attract particles toward cursor
- **Click & Drag**: Apply stronger attraction/manipulation force
- **Scroll Wheel**: Zoom in/out
- **Draw Mode**: Click and drag to create custom 3D particle paths

### Settings

- **Particle Count**: Adjust from 500 to 8,000 particles
- **Sensitivity**: Control interaction force strength (0.1 - 3.0)
- **Color Schemes**: Choose from Cyan Glow, Matrix Green, Electric Purple, Plasma Pink, Sunfire, or Pure White
- **Rotation Speed**: Adjust automatic rotation speed (0 - 10)
- **Formation Lock**: Enable/disable formation mode

## Architecture

### React Application Structure

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
│   └── geometryGenerator.ts         # 3D model coordinate generation
├── vite.config.ts                   # Vite build configuration
└── tsconfig.json                    # TypeScript configuration
```

### Flask Application Structure

```
├── app.py                           # Flask server and API endpoints
├── requirements.txt                 # Python dependencies
├── templates/
│   └── index.html                   # Main HTML template
├── static/
│   └── app.js                       # Particle system and controls
└── designs/                         # Saved custom formations (created at runtime)
```

## API Endpoints (Flask)

### GET /api/models

Returns all preset hologram model coordinates.

**Response**: JSON object with model names as keys and coordinate arrays as values

### POST /api/save-design

Save a custom particle formation.

**Request Body**:
```json
{
  "name": "design_name",
  "points": [{"x": 0, "y": 0, "z": 0}, ...]
}
```

**Response**: Success status and filename

### GET /api/load-design/:name

Load a saved custom formation by name.

**Response**: Array of coordinate objects

### GET /api/list-designs

List all saved custom design names.

**Response**: Array of design names

## Development

### React Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Flask Development

```bash
# Run with debug mode enabled
python app.py

# Debug mode provides:
# - Auto-reload on code changes
# - Detailed error messages
# - Interactive debugger
```

## Deployment

### AI Studio Deployment (React)

1. Ensure `GEMINI_API_KEY` is set in `.env.local`
2. Run `npm run build` to create production bundle
3. Deploy the `dist/` directory to AI Studio
4. Configure the deployment following AI Studio documentation

View deployed application: [AI Studio](https://ai.studio/apps/drive/1fvWmPdXj407E_Tf7byguy6zrf29M-WbZ)

### Flask Production Deployment

For production Flask deployment, use a WSGI server such as Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Browser Compatibility

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support with WebGL enabled
- **Webcam Requirements**: HTTPS or localhost for camera access

## Performance Considerations

- **Particle Count**: Higher particle counts require more GPU resources
- **WebGL**: React version uses hardware-accelerated WebGL rendering
- **Canvas 2D**: Flask version uses software-rendered Canvas 2D
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
4. Try the WebGL-based React version for better performance

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
- Flask for backend API framework
