
import React, { useState, useCallback, useEffect, useRef } from 'react';
import HologramView from './components/HologramView';
import UIOverlay from './components/UIOverlay';
import GestureProcessor from './components/GestureProcessor';
import { ControlMode, PresetModel, InteractionPoint, AppSettings, ParticleTarget } from './types';
import { PARTICLE_COUNT, DEFAULT_COLOR } from './constants';
import { generate3DBlueprint } from './services/geminiReconstruction';

const App: React.FC = () => {
  const [mode, setMode] = useState<ControlMode>(ControlMode.CURSOR);
  const [currentPreset, setCurrentPreset] = useState<PresetModel>(PresetModel.CUBE);
  const [customModel, setCustomModel] = useState<ParticleTarget[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uiVisible, setUiVisible] = useState(true);
  const [helpVisible, setHelpVisible] = useState(false);
  const [lastGesture, setLastGesture] = useState<string>('');
  const [interactionPoint, setInteractionPoint] = useState<InteractionPoint>({
    x: 0, y: 0, z: 0, active: false, type: 'none', strength: 0
  });

  const gestureTimeoutRef = useRef<number | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    particleCount: PARTICLE_COUNT,
    color: DEFAULT_COLOR,
    sensitivity: 1.0,
    showCamera: true,
    isFormationMode: true,
    rotationSpeed: 0.5,
  });

  const [manualRotation, setManualRotation] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(5); // Camera distance
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const toggleMode = useCallback(() => {
    setMode(prev => prev === ControlMode.CURSOR ? ControlMode.GESTURE : ControlMode.CURSOR);
  }, []);

  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleInteractionUpdate = useCallback((point: any) => {
    // Handle rotation gesture data
    if (point.rotation && point.rotation.active) {
      setManualRotation(r => ({
        x: r.x + point.rotation.deltaY,
        y: r.y + point.rotation.deltaX
      }));
    }
    setInteractionPoint(point);
  }, []);

  const handleGestureDetected = useCallback((gesture: string) => {
    setLastGesture(gesture);
    if (gestureTimeoutRef.current) window.clearTimeout(gestureTimeoutRef.current);
    gestureTimeoutRef.current = window.setTimeout(() => setLastGesture(''), 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') setUiVisible(v => !v);
      if (e.key.toLowerCase() === '?') setHelpVisible(v => !v);
      if (e.key.toLowerCase() === 'm') toggleMode();
      if (e.key.toLowerCase() === 'r') {
        setSettings(s => ({ ...s, isFormationMode: false }));
        setTimeout(() => setSettings(s => ({ ...s, isFormationMode: true })), 2000);
      }
      if (e.key === ' ') {
        setSettings(s => ({ ...s, isFormationMode: !s.isFormationMode }));
      }
      
      // Manual rotation controls
      if (e.key === 'ArrowLeft') setManualRotation(r => ({ ...r, y: r.y - 0.1 }));
      if (e.key === 'ArrowRight') setManualRotation(r => ({ ...r, y: r.y + 0.1 }));
      if (e.key === 'ArrowUp') setManualRotation(r => ({ ...r, x: r.x + 0.1 }));
      if (e.key === 'ArrowDown') setManualRotation(r => ({ ...r, x: r.x - 0.1 }));
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const presets = Object.values(PresetModel);
        if (presets[num-1]) {
          const selectedPreset = presets[num-1];
          setCurrentPreset(selectedPreset);
          // Disable formation mode for FREE flow
          if (selectedPreset === PresetModel.FREE) {
            setSettings(s => ({ ...s, isFormationMode: false }));
          } else {
            setSettings(s => ({ ...s, isFormationMode: true }));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

  // Mouse wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomLevel(prev => {
        const delta = e.deltaY * 0.01;
        const newZoom = prev + delta;
        // Clamp between 2 and 15 for reasonable viewing range
        return Math.max(2, Math.min(15, newZoom));
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Mouse drag for 360-degree rotation
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setManualRotation(r => ({
          x: r.x + deltaY * 0.01,
          y: r.y + deltaX * 0.01
        }));
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isDragging, dragStart]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HologramView 
        preset={currentPreset} 
        customModel={customModel}
        interactionPoint={interactionPoint} 
        settings={settings}
        manualRotation={manualRotation}
        zoomLevel={zoomLevel}
      />

      <GestureProcessor 
        mode={mode}
        showCamera={settings.showCamera}
        onInteractionUpdate={handleInteractionUpdate}
        onGestureDetected={handleGestureDetected}
      />

      <UIOverlay 
        mode={mode}
        currentPreset={currentPreset}
        settings={settings}
        visible={uiVisible}
        isProcessing={isUploading}
        onToggleMode={toggleMode}
        onSetPreset={setCurrentPreset}
        onUpdateSettings={handleUpdateSettings}
        onImageUpload={(file) => {
          // Validate file type
          if (!file.type.match(/^image\/(jpeg|jpg|png)$/i)) {
            setUploadError("Only JPEG and PNG images are supported.");
            return;
          }
          
          setIsUploading(true);
          setUploadError(null);
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Image = event.target?.result as string;
            try {
              const points = await generate3DBlueprint(base64Image);
              setCustomModel(points);
              setCurrentPreset(PresetModel.CUSTOM);
              setIsUploading(false);
            } catch (error) {
              console.error("Failed to generate 3D blueprint:", error);
              setUploadError(error instanceof Error ? error.message : "Failed to process image");
              setIsUploading(false);
            }
          };
          reader.onerror = () => {
            setUploadError("Failed to read image file");
            setIsUploading(false);
          };
          reader.readAsDataURL(file);
        }}
      />

      {/* Help Button */}
      <button
        onClick={() => setHelpVisible(v => !v)}
        className="fixed bottom-[102px] right-8 w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-cyan-400/60 rounded-2xl text-cyan-300 text-3xl font-black hover:from-cyan-500/40 hover:via-purple-500/40 hover:to-pink-500/40 hover:border-cyan-300 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 z-50 shadow-[0_0_30px_rgba(0,255,255,0.5),0_0_60px_rgba(191,0,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.8),0_0_80px_rgba(191,0,255,0.5)]"
        title="Help & Gestures Guide"
      >
        <span className="drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]">?</span>
      </button>

      {uploadError && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 text-red-400 text-xs bg-black/90 border border-red-500 px-4 py-2 rounded z-50">
          {uploadError}
        </div>
      )}

      {/* Help Panel */}
      {helpVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8" onClick={() => setHelpVisible(false)}>
          <div className="bg-black border-2 border-cyan-500 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-8 pb-4 border-b border-cyan-500/30">
              <h2 className="text-3xl font-bold text-cyan-400">HPI Control Guide</h2>
              <button onClick={() => setHelpVisible(false)} className="text-cyan-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto p-8 pt-6" style={{scrollbarWidth: 'thin', scrollbarColor: '#06b6d4 transparent'}}>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              {/* Gesture Controls */}
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500 pb-2">Hand Gestures</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">✋</span>
                    <div>
                      <div className="font-bold text-white">Open Palm</div>
                      <div className="text-cyan-300 text-xs">360° rotation - move hand to rotate hologram</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">✊</span>
                    <div>
                      <div className="font-bold text-white">Closed Fist</div>
                      <div className="text-cyan-300 text-xs">Repel particles away (1.8x strength)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">🤏</span>
                    <div>
                      <div className="font-bold text-white">Pinch</div>
                      <div className="text-cyan-300 text-xs">Precise grab & drag (2.5x strength)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">☝️</span>
                    <div>
                      <div className="font-bold text-white">Point</div>
                      <div className="text-cyan-300 text-xs">Attract particles toward finger (2.5x strength)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">✌️</span>
                    <div>
                      <div className="font-bold text-white">Peace Sign</div>
                      <div className="text-cyan-300 text-xs">Alternative 360° rotation mode</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">👍</span>
                    <div>
                      <div className="font-bold text-white">Thumbs Up</div>
                      <div className="text-cyan-300 text-xs">Zoom in / scale up</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">👎</span>
                    <div>
                      <div className="font-bold text-white">Thumbs Down</div>
                      <div className="text-cyan-300 text-xs">Zoom out / scale down</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">👌</span>
                    <div>
                      <div className="font-bold text-white">OK Sign</div>
                      <div className="text-cyan-300 text-xs">Standard attraction</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">🤘</span>
                    <div>
                      <div className="font-bold text-white">Rock Sign</div>
                      <div className="text-cyan-300 text-xs">Strong attraction (1.5x)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Controls */}
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500 pb-2">Image Upload</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded border border-purple-500/30">
                    <span className="text-3xl">📤</span>
                    <div>
                      <div className="font-bold text-white">Custom 3D Upload</div>
                      <div className="text-cyan-300 text-xs">Upload JPEG/PNG images to generate custom 3D particle formations</div>
                    </div>
                  </div>
                  <div className="text-cyan-300/70 text-xs pl-3">
                    • Click "UPLOAD IMAGE" button in control panel<br/>
                    • Select JPEG or PNG file from your device<br/>
                    • AI converts image to 3D holographic model<br/>
                    • Edge-detected outlines become particle points<br/>
                    • Model auto-scales to fit screen perfectly
                  </div>
                </div>

                <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500 pb-2">Keyboard Controls</h3>
                <div className="space-y-2 text-cyan-300">
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">1-9</span>
                    <span className="text-xs">Select hologram model</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">Arrow Keys</span>
                    <span className="text-xs">Rotate hologram 360°</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">Space</span>
                    <span className="text-xs">Toggle formation mode</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">H</span>
                    <span className="text-xs">Hide/show UI</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">M</span>
                    <span className="text-xs">Toggle control mode</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">R</span>
                    <span className="text-xs">Reset particles</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded">?</span>
                    <span className="text-xs">Toggle this help panel</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-cyan-400 mb-4 mt-6 border-b border-cyan-500 pb-2">Mouse Controls</h3>
                <div className="space-y-2 text-cyan-300">
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded text-xs">Move</span>
                    <span className="text-xs">Attract particles</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded text-xs">Click</span>
                    <span className="text-xs">Stronger attraction</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded text-xs">Right Drag</span>
                    <span className="text-xs">360° rotation</span>
                  </div>
                  <div className="flex justify-between p-2 bg-cyan-500/5 rounded">
                    <span className="font-mono bg-cyan-500/20 px-2 rounded text-xs">Scroll</span>
                    <span className="text-xs">Zoom in/out</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500 rounded text-cyan-300 text-xs">
              <strong className="text-cyan-400">Pro Tips:</strong> For gesture mode, ensure good lighting and camera permissions. Hand should be visible with palm facing camera for best tracking. Upload images with clear edges and high contrast for best 3D conversion results.
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Gesture Notification Toast */}
      {lastGesture && mode === ControlMode.GESTURE && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="text-cyan-400 text-6xl font-black italic tracking-widest uppercase opacity-20 animate-ping">
            {lastGesture}
          </div>
        </div>
      )}

      {/* Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-10 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Loading/Status Hint */}
      {!interactionPoint.active && mode === ControlMode.GESTURE && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500/30 text-[10px] uppercase tracking-[1em] animate-pulse">
          Biometric Syncing...
        </div>
      )}
    </div>
  );
};

export default App;
