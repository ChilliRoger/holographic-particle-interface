
import React, { useState, useCallback, useEffect, useRef } from 'react';
import HologramView from './components/HologramView';
import UIOverlay from './components/UIOverlay';
import GestureProcessor from './components/GestureProcessor';
import { ControlMode, PresetModel, InteractionPoint, AppSettings } from './types';
import { PARTICLE_COUNT, DEFAULT_COLOR } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<ControlMode>(ControlMode.CURSOR);
  const [currentPreset, setCurrentPreset] = useState<PresetModel>(PresetModel.DNA);
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const toggleMode = useCallback(() => {
    setMode(prev => prev === ControlMode.CURSOR ? ControlMode.GESTURE : ControlMode.CURSOR);
  }, []);

  const handleUpdateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleInteractionUpdate = useCallback((point: InteractionPoint) => {
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
        if (presets[num-1]) setCurrentPreset(presets[num-1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

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
        interactionPoint={interactionPoint} 
        settings={settings}
        manualRotation={manualRotation}
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
        onToggleMode={toggleMode}
        onSetPreset={setCurrentPreset}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Help Button */}
      <button
        onClick={() => setHelpVisible(v => !v)}
        className="fixed top-8 right-8 w-12 h-12 bg-cyan-500/20 border-2 border-cyan-500 rounded-full text-cyan-400 text-xl font-bold hover:bg-cyan-500 hover:text-black transition-all z-50"
        title="Help & Gestures Guide"
      >
        ?
      </button>

      {/* Help Panel */}
      {helpVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-8" onClick={() => setHelpVisible(false)}>
          <div className="bg-black border-2 border-cyan-500 rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-cyan-400">HPI Control Guide</h2>
              <button onClick={() => setHelpVisible(false)} className="text-cyan-400 hover:text-white text-3xl leading-none">&times;</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              {/* Gesture Controls */}
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500 pb-2">Hand Gestures</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">✋</span>
                    <div>
                      <div className="font-bold text-white">Open Palm</div>
                      <div className="text-cyan-300 text-xs">Attract particles toward hand (1.5x strength)</div>
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
                      <div className="text-cyan-300 text-xs">Precise directional control</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-cyan-500/10 rounded">
                    <span className="text-3xl">✌️</span>
                    <div>
                      <div className="font-bold text-white">Peace Sign</div>
                      <div className="text-cyan-300 text-xs">Gentle attraction with rotation hint</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyboard Controls */}
              <div>
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
              <strong className="text-cyan-400">Pro Tip:</strong> For gesture mode, ensure good lighting and camera permissions. Hand should be visible with palm facing camera for best tracking.
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
