
export enum ControlMode {
  GESTURE = 'GESTURE',
  CURSOR = 'CURSOR'
}

export enum PresetModel {
  CUBE = 'Cube',
  SPHERE = 'Sphere',
  CYLINDER = 'Cylinder',
  CONE = 'Cone',
  TORUS = 'Torus',
  PYRAMID = 'Pyramid',
  BELL = 'Bell',
  LETTER_A = 'Letter A',
  CUSTOM = 'Custom Upload',
  FREE = 'Free Flow'
}

export interface ParticleTarget {
  x: number;
  y: number;
  z: number;
}

export interface InteractionPoint {
  x: number; // -1 to 1
  y: number; // -1 to 1
  z: number;
  active: boolean;
  type: 'attract' | 'repel' | 'pinch' | 'none';
  strength: number;
}

export interface AppSettings {
  particleCount: number;
  color: string;
  sensitivity: number;
  showCamera: boolean;
  isFormationMode: boolean;
  rotationSpeed: number;
  dissectionEnabled: boolean;
  dissectionPlane: 'x' | 'y' | 'z'; // Which axis to cut along
}
