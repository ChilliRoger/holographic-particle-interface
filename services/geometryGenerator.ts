import { ParticleTarget, PresetModel } from '../types';

export const generateModelCoordinates = (model: PresetModel, count: number): ParticleTarget[] => {
  const points: ParticleTarget[] = [];
  
  switch (model) {
    case PresetModel.CUBE:
      const cubeSize = 0.8;
      for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);
        const u = (Math.random() - 0.5) * 2;
        const v = (Math.random() - 0.5) * 2;
        
        if (face === 0) points.push({ x: cubeSize, y: u * cubeSize, z: v * cubeSize });
        else if (face === 1) points.push({ x: -cubeSize, y: u * cubeSize, z: v * cubeSize });
        else if (face === 2) points.push({ x: u * cubeSize, y: cubeSize, z: v * cubeSize });
        else if (face === 3) points.push({ x: u * cubeSize, y: -cubeSize, z: v * cubeSize });
        else if (face === 4) points.push({ x: u * cubeSize, y: v * cubeSize, z: cubeSize });
        else points.push({ x: u * cubeSize, y: v * cubeSize, z: -cubeSize });
      }
      break;

    case PresetModel.SPHERE:
      for (let i = 0; i < count; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        const radius = 0.8;
        points.push({
          x: radius * Math.sin(theta) * Math.cos(phi),
          y: radius * Math.sin(theta) * Math.sin(phi),
          z: radius * Math.cos(theta)
        });
      }
      break;

    case PresetModel.CYLINDER:
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 1.8;
        const radius = 0.6;
        const isEnd = Math.random() < 0.2;
        
        if (isEnd) {
          const r = Math.random() * radius;
          const endY = height > 0 ? 0.6 : -0.6;
          points.push({
            x: r * Math.cos(angle),
            y: endY,
            z: r * Math.sin(angle)
          });
        } else {
          points.push({
            x: radius * Math.cos(angle),
            y: height,
            z: radius * Math.sin(angle)
          });
        }
      }
      break;

    case PresetModel.CONE:
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random();
        const radius = 0.8 * (1 - height);
        
        points.push({
          x: radius * Math.cos(angle),
          y: height * 1.2 - 0.6,
          z: radius * Math.sin(angle)
        });
      }
      break;

    case PresetModel.TORUS:
      const majorRadius = 0.6;
      const minorRadius = 0.25;
      for (let i = 0; i < count; i++) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        
        points.push({
          x: (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u),
          y: minorRadius * Math.sin(v),
          z: (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u)
        });
      }
      break;

    case PresetModel.PYRAMID:
      for (let i = 0; i < count; i++) {
        const height = Math.random();
        const baseSize = 0.9 * (1 - height);
        
        if (Math.random() < 0.3) {
          const x = (Math.random() - 0.5) * 0.9;
          const z = (Math.random() - 0.5) * 0.9;
          points.push({ x, y: -0.6, z });
        } else {
          const angle = Math.random() * Math.PI * 2;
          points.push({
            x: baseSize * Math.cos(angle),
            y: height * 1.2 - 0.6,
            z: baseSize * Math.sin(angle)
          });
        }
      }
      break;

    case PresetModel.FREE:
      // For free flow mode, generate widely scattered random positions
      for (let i = 0; i < count; i++) {
        points.push({ 
          x: (Math.random()-0.5)*8, 
          y: (Math.random()-0.5)*8, 
          z: (Math.random()-0.5)*8 
        });
      }
      break;

    default:
      for (let i = 0; i < count; i++) {
        points.push({ x: (Math.random()-0.5)*4, y: (Math.random()-0.5)*4, z: (Math.random()-0.5)*4 });
      }
      break;
  }
  
  return points;
};
