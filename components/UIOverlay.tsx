
import React from 'react';
import { ControlMode, PresetModel, AppSettings } from '../types';
import { COLOR_SCHEMES } from '../constants';

interface UIOverlayProps {
  mode: ControlMode;
  currentPreset: PresetModel;
  settings: AppSettings;
  visible: boolean;
  onToggleMode: () => void;
  onSetPreset: (p: PresetModel) => void;
  onUpdateSettings: (s: Partial<AppSettings>) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  mode, 
  currentPreset, 
  settings, 
  visible,
  onToggleMode,
  onSetPreset,
  onUpdateSettings
}) => {
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
        <button 
          onClick={onToggleMode}
          className="mt-4 px-3 py-1 bg-cyan-500/20 border border-cyan-500 text-[10px] hover:bg-cyan-500 hover:text-black transition-all font-bold uppercase"
        >
          Switch to {mode === ControlMode.CURSOR ? 'Gesture' : 'Cursor'} Control
        </button>
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
      </div>

      {/* Bottom Right: Presets */}
      <div className="absolute bottom-8 right-8 pointer-events-auto flex gap-2">
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
