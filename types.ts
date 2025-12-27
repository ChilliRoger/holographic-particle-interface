
export enum ControlMode {
  GESTURE = 'GESTURE',
  CURSOR = 'CURSOR'
}

export enum PresetModel {
  TREE = 'Abstract Tree',
  CAR = 'Sedan',
  AIRPLANE = 'Airplane',
  HUMAN = 'Humanoid',
  DNA = 'DNA Helix',
  HEART = 'Heart',
  SPHERE = 'Sphere',
  CUBE = 'Cube',
  GALAXY = 'Galaxy',
  HOUSE = 'House',
  LAPTOP = 'Laptop',
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
}
