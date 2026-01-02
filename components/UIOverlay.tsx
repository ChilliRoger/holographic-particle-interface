
import React, { useRef } from 'react';
import { ControlMode, PresetModel, AppSettings } from '../types';
import { COLOR_SCHEMES } from '../constants';

interface UIOverlayProps {
  mode: ControlMode;
  currentPreset: PresetModel;
  settings: AppSettings;
  visible: boolean;
  isProcessing: boolean;
  onToggleMode: () => void;
  onSetPreset: (p: PresetModel) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
  onImageUpload: (file: File) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, 
  currentPreset, 
  settings, 
  visible,
  isProcessing,
  onToggleMode,
  onSetPreset,
  onUpdateSettings,
  onImageUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 text-cyan-400 font-mono select-none">
      {/* Top Left: Status */}
      <div className="absolute top-8 left-8 p-4 border-l-2 border-t-2 border-cyan-500 bg-black/40 backdrop-blur-sm pointer-events-auto">
        <h1 className="text-2xl font-black tracking-tighter mb-1 text-white">HPI-SYSTEM-v3.2</h1>
        <div className="flex items-center gap-4 text-xs">
          <div>MODE: <span className="text-white">{mode}</span></div>
          <div>OBJECT: <span className="text-white">{currentPreset}</span></div>
          <div>PARTICLES: <span className="text-white">{settings.particleCount}</span></div>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          <button 
            onClick={onToggleMode}
            className="px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-[10px] hover:bg-cyan-500 hover:text-black transition-all font-bold uppercase"
          >
            Switch to {mode === ControlMode.CURSOR ? 'Gesture' : 'Cursor'} Control
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className={`px-3 py-1 border text-[10px] font-bold uppercase transition-all ${isProcessing ? 'border-gray-600 text-gray-600' : 'bg-white/10 border-white text-white hover:bg-white hover:text-black'}`}
          >
            {isProcessing ? 'GENERATING 3D MODEL...' : 'UPLOAD IMAGE (IMAGE -> 3D)'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log('File selected:', file.name, file.type, file.size);
                onImageUpload(file);
                // Reset input so same file can be uploaded again
                e.target.value = '';
              }
            }}
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
          />
        </div>
      </div>

      {/* Top Right: Settings */}
      <div className="absolute top-8 right-8 p-4 border-r-2 border-t-2 border-cyan-500 bg-black/40 backdrop-blur-sm pointer-events-auto flex flex-col gap-4">
        <div>
          <label className="text-[10px] uppercase block mb-1">Rotation Speed</label>
          <input 
            type="range" min="0" max="10" step="0.1" 
            value={settings.rotationSpeed}
            onChange={(e) => onUpdateSettings({ rotationSpeed: parseFloat(e.target.value) })}
            className="w-32 accent-cyan-500"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase block mb-1">Color Scheme</label>
          <div className="flex gap-2">
            {COLOR_SCHEMES.map(c => (
              <button 
                key={c.value} 
                onClick={() => onUpdateSettings({ color: c.value })}
                className={`w-4 h-4 rounded-full border border-white/20 transition-transform ${settings.color === c.value ? 'scale-125 border-white' : ''}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="formation"
            checked={settings.isFormationMode}
            onChange={(e) => onUpdateSettings({ isFormationMode: e.target.checked })}
            className="accent-cyan-500"
          />
          <label htmlFor="formation" className="text-[10px] uppercase cursor-pointer">Formation Lock</label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="dissection"
            checked={settings.dissectionEnabled}
            onChange={(e) => onUpdateSettings({ dissectionEnabled: e.target.checked })}
            className="accent-cyan-500"
          />
          <label htmlFor="dissection" className="text-[10px] uppercase cursor-pointer">Dissection</label>
        </div>
        {settings.dissectionEnabled && (
          <div>
            <label className="text-[10px] uppercase block mb-1">Dissection Plane</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ dissectionPlane: 'x' })}
                className={`px-2 py-1 text-[9px] border transition-all ${settings.dissectionPlane === 'x' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/40 text-cyan-400 border-cyan-500/50 hover:border-cyan-500'}`}
              >
                X
              </button>
              <button
                onClick={() => onUpdateSettings({ dissectionPlane: 'y' })}
                className={`px-2 py-1 text-[9px] border transition-all ${settings.dissectionPlane === 'y' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/40 text-cyan-400 border-cyan-500/50 hover:border-cyan-500'}`}
              >
                Y
              </button>
              <button
                onClick={() => onUpdateSettings({ dissectionPlane: 'z' })}
                className={`px-2 py-1 text-[9px] border transition-all ${settings.dissectionPlane === 'z' ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/40 text-cyan-400 border-cyan-500/50 hover:border-cyan-500'}`}
              >
                Z
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right: Presets */}
      <div className="absolute bottom-8 right-8 pointer-events-auto flex flex-wrap justify-end gap-2 max-w-[400px]">
        {Object.values(PresetModel).map(p => (
          <button
            key={p}
            onClick={() => onSetPreset(p)}
            className={`px-3 py-1 text-[10px] border transition-all ${currentPreset === p ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/40 text-cyan-400 border-cyan-500/50 hover:border-cyan-500'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Center Prompt */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] opacity-40">
        PRESS 'H' TO TOGGLE UI OVERLAY | MOUSE TO INTERACT
      </div>
    </div>
  );
};

export default UIOverlay;
