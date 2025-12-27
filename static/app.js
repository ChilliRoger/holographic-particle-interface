// Holographic Particle Interface - Main Application

// Global function for closing tutorial
function closeTutorial() {
    document.getElementById('tutorial').classList.remove('active');
}

// Global function for toggling help panel
function toggleHelp() {
    document.getElementById('help-panel').classList.toggle('active');
}

class Particle {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.vz = (Math.random() - 0.5) * 0.5;
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        this.size = Math.random() * 3 + 2;
        this.baseSize = this.size;
    }

    update(attractX, attractY, attractZ, attractStrength, inFormation) {
        if (inFormation) {
            // Move towards target position
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dz = this.targetZ - this.z;
            
            this.vx += dx * 0.05;
            this.vy += dy * 0.05;
            this.vz += dz * 0.05;
            
            // Add slight jitter for holographic effect
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vy += (Math.random() - 0.5) * 0.02;
            this.vz += (Math.random() - 0.5) * 0.02;
        } else {
            // Free roaming with attraction/repulsion
            const dx = attractX - this.x;
            const dy = attractY - this.y;
            const dz = attractZ - this.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist > 0) {
                const force = attractStrength / (dist * dist + 0.1);
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
                this.vz += (dz / dist) * force;
            }
            
            // Brownian motion
            this.vx += (Math.random() - 0.5) * 0.05;
            this.vy += (Math.random() - 0.5) * 0.05;
            this.vz += (Math.random() - 0.5) * 0.05;
        }
        
        // Apply velocity with damping
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.vz *= 0.95;
        
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        
        // Boundaries
        const boundary = 1.5;
        if (Math.abs(this.x) > boundary) this.vx *= -0.5;
        if (Math.abs(this.y) > boundary) this.vy *= -0.5;
        if (Math.abs(this.z) > boundary) this.vz *= -0.5;
        
        this.x = Math.max(-boundary, Math.min(boundary, this.x));
        this.y = Math.max(-boundary, Math.min(boundary, this.y));
        this.z = Math.max(-boundary, Math.min(boundary, this.z));
    }

    project(width, height, fov, rotation) {
        // Apply rotation
        let rx = this.x;
        let ry = this.y;
        let rz = this.z;
        
        // Rotate around Y axis
        const cosY = Math.cos(rotation.y);
        const sinY = Math.sin(rotation.y);
        const x1 = rx * cosY - rz * sinY;
        const z1 = rz * cosY + rx * sinY;
        
        // Rotate around X axis
        const cosX = Math.cos(rotation.x);
        const sinX = Math.sin(rotation.x);
        const y1 = ry * cosX - z1 * sinX;
        const z2 = z1 * cosX + ry * sinX;
        
        // Perspective projection
        const scale = fov / (fov + z2);
        const x2d = x1 * scale * width + width / 2;
        const y2d = y1 * scale * height + height / 2;
        
        // Size based on depth
        const size = this.baseSize * scale;
        
        // Opacity based on depth
        const opacity = Math.max(0.3, Math.min(1, 1 - z2 / 3));
        
        return { x: x2d, y: y2d, size, opacity, depth: z2 };
    }
}

class HolographicInterface {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.models = {};
        this.currentModel = null;
        this.inFormation = false;
        this.rotation = { x: 0, y: 0 };
        this.manualRotation = { x: 0, y: 0 };
        this.isDraggingRotation = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.fov = 500;
        this.attractX = 0;
        this.attractY = 0;
        this.attractZ = 0;
        this.attractStrength = 0;
        this.gestureMode = false;
        this.uiVisible = true;
        this.mouseDown = false;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
        this.freeDrawMode = false;
        this.drawnPoints = [];
        this.particleCount = 2000;
        this.colorScheme = 'cyan';
        this.morphProgress = 0;
        this.morphing = false;
        this.oldTargets = [];
        this.sensitivity = 1.0;
        this.videoStream = null;
        
        this.init();
    }

    async init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Check screen size
        if (window.innerWidth < 768 || window.innerHeight < 600) {
            this.showScreenWarning();
        }
        
        // Initialize particles
        this.initializeParticles();
        
        // Load models
        await this.loadModels();
        
        // Load saved designs list
        await this.loadDesignsList();
        
        // Setup controls
        this.setupControls();
        
        // Show tutorial on first load
        if (!localStorage.getItem('tutorialSeen')) {
            document.getElementById('tutorial').classList.add('active');
            localStorage.setItem('tutorialSeen', 'true');
        }
        
        document.getElementById('loading').style.display = 'none';
        
        // Start animation
        this.animate();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
        }
        document.getElementById('particle-count').textContent = this.particleCount;
    }

    showScreenWarning() {
        const warning = document.createElement('div');
        warning.id = 'screen-warning';
        warning.innerHTML = '⚠️ Screen size is small. For best experience, use a larger display.';
        warning.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);background:rgba(255,165,0,0.9);color:#000;padding:10px 20px;border-radius:5px;z-index:1000;font-weight:bold;';
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 5000);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async loadModels() {
        try {
            const response = await fetch('/api/models');
            this.models = await response.json();
            console.log('Models loaded:', Object.keys(this.models));
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    async loadDesignsList() {
        try {
            const response = await fetch('/api/list-designs');
            const designs = await response.json();
            this.updateDesignsDropdown(designs);
        } catch (error) {
            console.log('No saved designs yet');
        }
    }

    updateDesignsDropdown(designs) {
        const select = document.getElementById('saved-designs-select');
        if (select) {
            select.innerHTML = '<option value="">-- Load Design --</option>';
            designs.forEach(design => {
                const option = document.createElement('option');
                option.value = design;
                option.textContent = design;
                select.appendChild(option);
            });
        }
    }

    setModel(modelName) {
        if (modelName === 'free') {
            this.inFormation = false;
            this.currentModel = null;
            this.freeDrawMode = false;
            document.getElementById('model-display').textContent = 'Free Mode';
            return;
        }

        if (modelName === 'draw') {
            this.freeDrawMode = true;
            this.inFormation = false;
            this.currentModel = null;
            this.drawnPoints = [];
            document.getElementById('model-display').textContent = 'Draw Mode';
            return;
        }

        if (this.models[modelName]) {
            this.freeDrawMode = false;
            
            // Save old targets for morphing
            this.oldTargets = this.particles.map(p => ({
                x: p.targetX,
                y: p.targetY,
                z: p.targetZ
            }));
            
            this.currentModel = modelName;
            this.morphing = true;
            this.morphProgress = 0;
            
            const modelData = this.models[modelName];
            
            // Assign target positions to particles
            for (let i = 0; i < this.particles.length; i++) {
                const targetIndex = i % modelData.length;
                const target = modelData[targetIndex];
                this.particles[i].newTargetX = target.x;
                this.particles[i].newTargetY = target.y;
                this.particles[i].newTargetZ = target.z;
            }
            
            document.getElementById('model-display').textContent = 
                modelName.charAt(0).toUpperCase() + modelName.slice(1);
        }
    }

    setupControls() {
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            
            // Right-click drag for rotation
            if (this.isDraggingRotation) {
                const deltaX = e.clientX - this.lastMousePos.x;
                const deltaY = e.clientY - this.lastMousePos.y;
                this.manualRotation.y += deltaX * 0.005;
                this.manualRotation.x += deltaY * 0.005;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            } else {
                this.attractX = x;
                this.attractY = -y;
                this.attractStrength = 0.02 * this.sensitivity;
            }
            
            // Free draw mode
            if (this.freeDrawMode && this.mouseDown && !this.isDraggingRotation) {
                this.drawnPoints.push({
                    x: x,
                    y: -y,
                    z: 0
                });
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                e.preventDefault();
                this.isDraggingRotation = true;
                this.lastMousePos = { x: e.clientX, y: e.clientY };
            } else {
                this.mouseDown = true;
                this.attractStrength = 0.05 * this.sensitivity;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isDraggingRotation = false;
            } else {
                this.mouseDown = false;
                this.attractStrength = 0.02 * this.sensitivity;
                
                // Apply drawn points to particles
                if (this.freeDrawMode && this.drawnPoints.length > 0) {
                    this.applyDrawnFormation();
                }
            }
        });

        // Prevent context menu on right-click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.fov += e.deltaY * 0.5;
            this.fov = Math.max(300, Math.min(800, this.fov));
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case '1': this.setModel('tree'); break;
                case '2': this.setModel('car'); break;
                case '3': this.setModel('airplane'); break;
                case '4': this.setModel('human'); break;
                case '5': this.setModel('cube'); break;
                case '6': this.setModel('sphere'); break;
                case '7': this.setModel('dna'); break;
                case '8': this.setModel('heart'); break;
                case '9': this.setModel('free'); break;
                case '0': this.setModel('draw'); break;
                case ' ': 
                    this.inFormation = !this.inFormation;
                    break;
                case 'r':
                    this.resetParticles();
                    break;
                case 'h':
                    this.uiVisible = !this.uiVisible;
                    document.getElementById('ui-overlay').classList.toggle('hidden');
                    document.getElementById('model-selector').style.display = 
                        this.uiVisible ? 'block' : 'none';
                    const settings = document.getElementById('settings-panel');
                    if (settings && settings.style.display === 'block') {
                        settings.style.display = 'none';
                    }
                    break;
                case 't':
                    document.getElementById('tutorial').classList.toggle('active');
                    break;
                case '?':
                    toggleHelp();
                    break;
                case 'g':
                    this.toggleGestureMode();
                    break;
                case 's':
                    this.toggleSettings();
                    break;
                case 'c':
                    if (this.freeDrawMode) {
                        this.drawnPoints = [];
                    }
                    break;
                case 'arrowup':
                    this.manualRotation.x += 0.1;
                    break;
                case 'arrowdown':
                    this.manualRotation.x -= 0.1;
                    break;
                case 'arrowleft':
                    this.manualRotation.y -= 0.1;
                    break;
                case 'arrowright':
                    this.manualRotation.y += 0.1;
                    break;
            }
        });

        // Model selector buttons
        document.querySelectorAll('.model-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.model-btn').forEach(b => 
                    b.classList.remove('active'));
                btn.classList.add('active');
                this.setModel(btn.dataset.model);
            });
        });
        
        // Settings panel controls
        this.setupSettingsControls();
    }

    setupSettingsControls() {
        const particleSlider = document.getElementById('particle-slider');
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        const colorSelect = document.getElementById('color-scheme');
        const saveBtn = document.getElementById('save-design-btn');
        const loadSelect = document.getElementById('saved-designs-select');
        
        if (particleSlider) {
            particleSlider.addEventListener('input', (e) => {
                this.particleCount = parseInt(e.target.value);
                document.getElementById('particle-value').textContent = this.particleCount;
                this.initializeParticles();
            });
        }
        
        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                this.sensitivity = parseFloat(e.target.value);
                document.getElementById('sensitivity-value').textContent = this.sensitivity.toFixed(1);
            });
        }
        
        if (colorSelect) {
            colorSelect.addEventListener('change', (e) => {
                this.colorScheme = e.target.value;
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveCurrentFormation());
        }
        
        if (loadSelect) {
            loadSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.loadCustomDesign(e.target.value);
                }
            });
        }
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
        }
    }

    applyDrawnFormation() {
        if (this.drawnPoints.length === 0) return;
        
        this.inFormation = true;
        this.currentModel = 'custom';
        document.getElementById('model-display').textContent = 'Custom Drawing';
        
        // Assign drawn points as targets
        for (let i = 0; i < this.particles.length; i++) {
            const targetIndex = i % this.drawnPoints.length;
            const target = this.drawnPoints[targetIndex];
            this.particles[i].targetX = target.x;
            this.particles[i].targetY = target.y;
            this.particles[i].targetZ = target.z;
        }
    }

    async saveCurrentFormation() {
        const name = prompt('Enter a name for this formation:');
        if (!name) return;
        
        const points = this.particles.map(p => ({
            x: p.targetX,
            y: p.targetY,
            z: p.targetZ
        }));
        
        try {
            const response = await fetch('/api/save-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, points })
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Formation saved successfully!');
                await this.loadDesignsList();
            }
        } catch (error) {
            console.error('Error saving formation:', error);
            alert('Failed to save formation');
        }
    }

    async loadCustomDesign(designName) {
        try {
            const response = await fetch(`/api/load-design/${designName}`);
            const points = await response.json();
            
            if (points.error) {
                alert('Design not found');
                return;
            }
            
            this.inFormation = true;
            this.currentModel = designName;
            document.getElementById('model-display').textContent = designName;
            
            // Assign loaded points as targets
            for (let i = 0; i < this.particles.length; i++) {
                const targetIndex = i % points.length;
                const target = points[targetIndex];
                this.particles[i].targetX = target.x;
                this.particles[i].targetY = target.y;
                this.particles[i].targetZ = target.z;
            }
        } catch (error) {
            console.error('Error loading design:', error);
            alert('Failed to load design');
        }
    }

    resetParticles() {
        this.particles.forEach(p => {
            p.x = (Math.random() - 0.5) * 2;
            p.y = (Math.random() - 0.5) * 2;
            p.z = (Math.random() - 0.5) * 2;
            p.vx = 0;
            p.vy = 0;
            p.vz = 0;
        });
    }

    async toggleGestureMode() {
        if (this.gestureMode) {
            // Turn off gesture mode
            this.gestureMode = false;
            if (this.camera) {
                this.camera.stop();
            }
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop());
                this.videoStream = null;
            }
            document.getElementById('webcam-preview').classList.remove('active');
            document.getElementById('mode-display').textContent = 'Cursor';
        } else {
            // Try to turn on gesture mode
            const success = await this.initializeGestureTracking();
            if (success) {
                this.gestureMode = true;
                document.getElementById('mode-display').textContent = 'Gesture';
            } else {
                this.gestureMode = false;
                document.getElementById('mode-display').textContent = 'Cursor';
            }
        }
    }

    async initializeGestureTracking() {
        try {
            // Check if MediaPipe libraries are loaded
            if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
                alert('MediaPipe libraries not loaded. Gesture mode requires internet connection to load hand tracking libraries.');
                return false;
            }
            
            const video = document.getElementById('webcam-preview');
            
            // Request camera access
            try {
                this.videoStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 640, height: 480 } 
                });
            } catch (err) {
                console.error('Camera access error:', err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    alert('Camera permission denied. Please allow camera access in your browser settings and try again.');
                } else if (err.name === 'NotFoundError') {
                    alert('No camera found. Please connect a webcam and try again.');
                } else {
                    alert('Could not access webcam: ' + err.message);
                }
                return false;
            }
            
            video.srcObject = this.videoStream;
            video.classList.add('active');
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            // Initialize MediaPipe Hands
            const hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            hands.onResults((results) => this.processHandGesture(results));

            this.camera = new Camera(video, {
                onFrame: async () => {
                    await hands.send({ image: video });
                },
                width: 640,
                height: 480
            });

            this.camera.start();
            return true;
        } catch (error) {
            console.error('Error initializing gesture tracking:', error);
            alert('Failed to initialize gesture mode: ' + error.message);
            
            // Clean up
            if (this.videoStream) {
                this.videoStream.getTracks().forEach(track => track.stop());
                this.videoStream = null;
            }
            document.getElementById('webcam-preview').classList.remove('active');
            
            return false;
        }
    }

    processHandGesture(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            document.getElementById('gesture-indicator').classList.remove('active');
            this.attractStrength = 0;
            return;
        }

        const landmarks = results.multiHandLandmarks[0];
        const palmBase = landmarks[0];
        
        // Map hand position to 3D space
        this.attractX = (palmBase.x * 2 - 1);
        this.attractY = -(palmBase.y * 2 - 1);
        this.attractZ = palmBase.z * 2;
        
        // Update gesture indicator position
        const indicator = document.getElementById('gesture-indicator');
        indicator.classList.add('active');
        indicator.style.left = `${palmBase.x * window.innerWidth}px`;
        indicator.style.top = `${palmBase.y * window.innerHeight}px`;

        // Detect gesture type
        const fingerTips = [8, 12, 16, 20]; // Index, middle, ring, pinky
        const fingerBases = [5, 9, 13, 17];
        const thumbTip = 4;
        const thumbBase = 2;
        
        let extendedFingers = 0;
        fingerTips.forEach((tip, i) => {
            if (landmarks[tip].y < landmarks[fingerBases[i]].y) {
                extendedFingers++;
            }
        });
        
        // Check thumb
        const thumbExtended = landmarks[thumbTip].x < landmarks[thumbBase].x;

        // Thumbs up - scale up
        if (thumbExtended && extendedFingers === 0) {
            this.fov = Math.max(300, this.fov - 5);
            this.attractStrength = 0;
        }
        // Thumbs down - scale down (thumb down and no fingers)
        else if (!thumbExtended && extendedFingers === 0 && landmarks[thumbTip].y > landmarks[0].y) {
            this.fov = Math.min(800, this.fov + 5);
            this.attractStrength = 0;
        }
        // Open palm - attract
        else if (extendedFingers >= 3) {
            this.attractStrength = 0.04 * this.sensitivity;
        }
        // Closed fist - repel
        else if (extendedFingers === 0) {
            this.attractStrength = -0.04 * this.sensitivity;
        }
        // Peace sign - rotate
        else if (extendedFingers === 2) {
            this.rotation.y += 0.02;
            this.attractStrength = 0;
        }
        // Pinch - grab
        else {
            this.attractStrength = 0.08 * this.sensitivity;
        }
        
        // Detect swipe gestures
        this.detectSwipe(palmBase);
    }
    
    detectSwipe(palmBase) {
        if (!this.lastPalmPosition) {
            this.lastPalmPosition = palmBase;
            this.swipeStartTime = Date.now();
            return;
        }
        
        const deltaX = palmBase.x - this.lastPalmPosition.x;
        const deltaTime = Date.now() - this.swipeStartTime;
        
        // Detect horizontal swipe
        if (Math.abs(deltaX) > 0.3 && deltaTime < 500) {
            const models = ['tree', 'car', 'airplane', 'human', 'cube', 'sphere', 'dna', 'heart', 'house', 'laptop'];
            const currentIndex = models.indexOf(this.currentModel);
            
            if (deltaX > 0 && currentIndex < models.length - 1) {
                // Swipe right - next model
                this.setModel(models[currentIndex + 1]);
                this.swipeStartTime = Date.now() + 1000; // Debounce
            } else if (deltaX < 0 && currentIndex > 0) {
                // Swipe left - previous model
                this.setModel(models[currentIndex - 1]);
                this.swipeStartTime = Date.now() + 1000; // Debounce
            }
        }
        
        this.lastPalmPosition = palmBase;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate FPS
        const currentTime = performance.now();
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps-display').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Handle morphing
        if (this.morphing) {
            this.morphProgress += 0.02;
            if (this.morphProgress >= 1) {
                this.morphing = false;
                this.morphProgress = 1;
                this.inFormation = true;
            }
            
            // Apply morphing
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const oldTarget = this.oldTargets[i] || { x: p.x, y: p.y, z: p.z };
                
                // Ease-in-out interpolation
                const t = this.morphProgress < 0.5 
                    ? 2 * this.morphProgress * this.morphProgress 
                    : 1 - Math.pow(-2 * this.morphProgress + 2, 2) / 2;
                
                p.targetX = oldTarget.x + (p.newTargetX - oldTarget.x) * t;
                p.targetY = oldTarget.y + (p.newTargetY - oldTarget.y) * t;
                p.targetZ = oldTarget.z + (p.newTargetZ - oldTarget.z) * t;
            }
        }

        // Auto-rotate in formation mode
        if (this.inFormation) {
            this.rotation.y += 0.005;
        }
        
        // Combine auto and manual rotation for full 360-degree control
        const combinedRotation = {
            x: this.rotation.x + this.manualRotation.x,
            y: this.rotation.y + this.manualRotation.y
        };

        // Update and draw particles
        const projectedParticles = [];
        
        this.particles.forEach(particle => {
            particle.update(
                this.attractX, 
                this.attractY, 
                this.attractZ, 
                this.attractStrength,
                this.inFormation
            );
            
            const projected = particle.project(
                this.canvas.width,
                this.canvas.height,
                this.fov,
                combinedRotation
            );
            
            projectedParticles.push({ particle, ...projected });
        });

        // Sort by depth (painter's algorithm)
        projectedParticles.sort((a, b) => b.depth - a.depth);

        // Draw particles with selected color scheme
        projectedParticles.forEach(({ x, y, size, opacity }) => {
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            
            // Glow effect with color schemes
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            
            switch(this.colorScheme) {
                case 'cyan':
                    gradient.addColorStop(0, `rgba(0, 255, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(0, 200, 255, ${opacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(0, 150, 255, ${opacity * 0.3})`);
                    break;
                case 'purple':
                    gradient.addColorStop(0, `rgba(200, 100, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(150, 50, 255, ${opacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(100, 0, 200, ${opacity * 0.3})`);
                    break;
                case 'green':
                    gradient.addColorStop(0, `rgba(100, 255, 100, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(50, 200, 50, ${opacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(0, 150, 0, ${opacity * 0.3})`);
                    break;
                case 'red':
                    gradient.addColorStop(0, `rgba(255, 100, 100, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(255, 50, 50, ${opacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(200, 0, 0, ${opacity * 0.3})`);
                    break;
                case 'white':
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(200, 200, 200, ${opacity * 0.7})`);
                    gradient.addColorStop(1, `rgba(150, 150, 150, ${opacity * 0.3})`);
                    break;
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
        
        // Draw mode indicator
        if (this.freeDrawMode) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('DRAW MODE - Click and drag to draw, Press C to clear', 20, this.canvas.height - 20);
        }
    }
}

// Initialize application
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new HolographicInterface();
});