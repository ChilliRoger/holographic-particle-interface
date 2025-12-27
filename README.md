# Holographic Particle Interface (HPI)

An interactive web application that simulates holographic displays using particle systems controlled by hand gestures or mouse/keyboard input.

## 🌟 Features

- **3D Particle System**: 2000+ particles forming realistic 3D holograms
- **Dual Control Modes**: 
  - Gesture Control (via webcam)
  - Mouse & Keyboard Control
- **8 Preset Holograms**: Tree, Car, Airplane, Human, Cube, Sphere, DNA Helix, Heart
- **Free Design Mode**: Create your own particle formations
- **Real-time 3D Rotation**: Interactive manipulation of holographic objects
- **Smooth Animations**: 60 FPS performance with easing transitions

## 📁 Project Structure

```
holographic-particle-interface/
│
├── app.py                  # Flask backend server
├── requirements.txt        # Python dependencies
├── README.md              # This file
│
├── templates/
│   └── index.html         # Main HTML template
│
└── static/
    └── app.js             # Main JavaScript application
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam (optional, for gesture control)

### Step 1: Clone or Create Project Directory
```bash
mkdir holographic-particle-interface
cd holographic-particle-interface
```

### Step 2: Create Project Structure
Create the following directories:
```bash
mkdir templates
mkdir static
```

### Step 3: Place Files
- Place `app.py` in the root directory
- Place `index.html` in the `templates/` directory
- Place `app.js` in the `static/` directory
- Place `requirements.txt` in the root directory

### Step 4: Install Python Dependencies
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 5: Run the Application
```bash
python app.py
```

The application will start on `http://localhost:5000`

### Step 6: Open in Browser
Open your web browser and navigate to:
```
http://localhost:5000
```

## 🎮 Controls

### Keyboard Controls
- **1-8**: Select hologram presets
  - 1: Tree
  - 2: Car
  - 3: Airplane
  - 4: Human
  - 5: Cube
  - 6: Sphere
  - 7: DNA Helix
  - 8: Heart
- **9**: Free mode (particles roam freely)
- **Arrow Keys**: Rotate hologram (Up/Down/Left/Right)
- **Spacebar**: Toggle between formation and free-roaming
- **R**: Reset particles to random positions
- **H**: Hide/show UI overlay
- **T**: Show tutorial
- **G**: Toggle gesture control mode

### Mouse Controls
- **Move Mouse**: Attract particles toward cursor
- **Click & Drag**: Stronger attraction/manipulation
- **Scroll Wheel**: Zoom in/out (adjust perspective)

### Gesture Controls (When Enabled)
- **✋ Open Palm**: Attract particles toward hand
- **✊ Closed Fist**: Push particles away
- **👌 Pinch**: Grab and drag particle clusters
- **✌️ Peace Sign**: Rotate hologram continuously

## 🔧 Configuration

### Adjust Particle Count
In `app.js`, modify the initialization loop:
```javascript
// Change 2000 to your desired number
for (let i = 0; i < 2000; i++) {
    this.particles.push(new Particle(...));
}
```

### Modify Particle Appearance
In the `animate()` method of `app.js`:
```javascript
// Change colors (currently cyan/blue)
gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity})`); // Bright cyan
gradient.addColorStop(0.5, `rgba(0, 200, 255, ${opacity * 0.7})`); // Medium blue
gradient.addColorStop(1, `rgba(0, 150, 255, ${opacity * 0.3})`); // Dark blue
```

### Add Custom Holograms
In `app.py`, create a new generator function:
```python
def generate_custom_model():
    points = []
    # Add your 3D coordinate generation logic here
    # Each point should be a dict: {"x": float, "y": float, "z": float}
    # Coordinates should be normalized between -1 and 1
    return points
```

Then add it to the `/api/models` route:
```python
models = {
    # ... existing models
    "custom": generate_custom_model()
}
```

## 🌐 Browser Compatibility

### Fully Supported
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Requirements
- WebGL support
- JavaScript enabled
- For gesture mode: Webcam access permission

## 📊 Performance Tips

1. **Lower Particle Count**: Reduce from 2000 to 1000-1500 for slower devices
2. **Disable Glow Effects**: Remove gradient code for better performance
3. **Reduce Model Complexity**: Use simpler 3D models with fewer points
4. **Close Other Tabs**: Free up system resources
5. **Use Hardware Acceleration**: Enable in browser settings

## 🐛 Troubleshooting

### Issue: Black screen with no particles
**Solution**: Check browser console (F12) for JavaScript errors. Ensure all files are in correct directories.

### Issue: Gesture mode not working
**Solution**: 
- Grant webcam permission when prompted
- Check if webcam is being used by another application
- Try a different browser

### Issue: Low FPS / Laggy performance
**Solution**:
- Reduce particle count in code
- Close other applications
- Try disabling gesture mode
- Use a more powerful device

### Issue: Models not loading
**Solution**:
- Ensure Flask server is running
- Check browser console for network errors
- Verify `/api/models` endpoint is accessible

### Issue: Page won't load
**Solution**:
- Verify Python virtual environment is activated
- Check if port 5000 is already in use
- Try running on a different port: `app.run(port=5001)`

## 🔒 Security Notes

- The application requires webcam access for gesture mode
- Webcam data is processed locally in the browser
- No video or images are sent to any server
- All particle calculations happen client-side

## 🚀 Deployment Options

### Local Network Access
```python
# In app.py, change:
app.run(debug=True, host='0.0.0.0', port=5000)
# Access from other devices: http://YOUR_IP:5000
```

### Production Deployment
For production use, consider:
- Using a production WSGI server (Gunicorn, uWSGI)
- Setting up HTTPS for webcam access on remote servers
- Deploying on platforms like Heroku, AWS, or Google Cloud

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to modify and enhance the project! Some ideas:
- Add more hologram presets
- Implement particle color themes
- Add sound effects
- Create particle trail effects
- Add multiplayer/collaborative mode
- Implement save/load custom designs

## 📧 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review browser console for error messages
3. Ensure all dependencies are installed correctly

## 🎯 Future Enhancements

- [ ] Export hologram animations as videos
- [ ] More gesture recognition patterns
- [ ] Particle collision physics
- [ ] Multiple simultaneous holograms
- [ ] Custom particle shapes (not just circles)
- [ ] Background music synchronization
- [ ] Mobile device support with touch gestures
- [ ] VR headset compatibility

---

**Enjoy creating holographic art with particles! ✨**