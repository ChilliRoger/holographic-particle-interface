
export const PARTICLE_COUNT = 4000;
export const MAX_PARTICLES = 8000;
export const DEFAULT_COLOR = '#00ffff'; // Cyan glow
export const TRANSITION_SPEED = 0.05;
export const BROWNIAN_STRENGTH = 0.002;

export const COLOR_SCHEMES = [
  { name: 'Cyan Glow', value: '#00ffff' },
  { name: 'Matrix Green', value: '#00ff41' },
  { name: 'Electric Purple', value: '#bf00ff' },
  { name: 'Plasma Pink', value: '#ff007f' },
  { name: 'Sunfire', value: '#ffae00' },
  { name: 'Pure White', value: '#ffffff' }
];

export const GESTURE_MAPPINGS = {
  OPEN_PALM: 'Attract',
  CLOSED_FIST: 'Repel',
  PINCH: 'Grab & Drag',
  PEACE: 'Rotate',
  THUMBS_UP: 'Scale Up',
  THUMBS_DOWN: 'Scale Down'
};
