import { ParticleTarget, PresetModel, AppSettings } from '../types';

export const generateModelCoordinates = (
  model: PresetModel, 
  count: number, 
  dissectionEnabled: boolean = false,
  dissectionPlane: 'x' | 'y' | 'z' = 'x'
): ParticleTarget[] => {
  const points: ParticleTarget[] = [];
  
  // Helper function to check if point should be included based on dissection
  const shouldIncludePoint = (point: ParticleTarget): boolean => {
    if (!dissectionEnabled) return true;
    
    switch (dissectionPlane) {
      case 'x':
        return point.x >= 0; // Show right half
      case 'y':
        return point.y >= 0; // Show top half
      case 'z':
        return point.z >= 0; // Show front half
      default:
        return true;
    }
  };
  
  switch (model) {
    case PresetModel.CUBE:
      const cubeSize = 0.8;
      let cubePoints = 0;
      while (cubePoints < count) {
        const face = Math.floor(Math.random() * 6);
        const u = (Math.random() - 0.5) * 2;
        const v = (Math.random() - 0.5) * 2;
        
        let point: ParticleTarget;
        if (face === 0) point = { x: cubeSize, y: u * cubeSize, z: v * cubeSize };
        else if (face === 1) point = { x: -cubeSize, y: u * cubeSize, z: v * cubeSize };
        else if (face === 2) point = { x: u * cubeSize, y: cubeSize, z: v * cubeSize };
        else if (face === 3) point = { x: u * cubeSize, y: -cubeSize, z: v * cubeSize };
        else if (face === 4) point = { x: u * cubeSize, y: v * cubeSize, z: cubeSize };
        else point = { x: u * cubeSize, y: v * cubeSize, z: -cubeSize };
        
        if (shouldIncludePoint(point)) {
          points.push(point);
          cubePoints++;
        }
      }
      break;

    case PresetModel.SPHERE:
      let spherePoints = 0;
      while (spherePoints < count) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        const radius = 0.8;
        const point = {
          x: radius * Math.sin(theta) * Math.cos(phi),
          y: radius * Math.sin(theta) * Math.sin(phi),
          z: radius * Math.cos(theta)
        };
        if (shouldIncludePoint(point)) {
          points.push(point);
          spherePoints++;
        }
      }
      break;

    case PresetModel.CYLINDER:
      let cylinderPoints = 0;
      while (cylinderPoints < count) {
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 1.8;
        const radius = 0.6;
        const isEnd = Math.random() < 0.2;
        
        let point: ParticleTarget;
        if (isEnd) {
          const r = Math.random() * radius;
          const endY = height > 0 ? 0.6 : -0.6;
          point = {
            x: r * Math.cos(angle),
            y: endY,
            z: r * Math.sin(angle)
          };
        } else {
          point = {
            x: radius * Math.cos(angle),
            y: height,
            z: radius * Math.sin(angle)
          };
        }
        if (shouldIncludePoint(point)) {
          points.push(point);
          cylinderPoints++;
        }
      }
      break;

    case PresetModel.CONE:
      let conePoints = 0;
      while (conePoints < count) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random();
        const radius = 0.8 * (1 - height);
        
        const point = {
          x: radius * Math.cos(angle),
          y: height * 1.2 - 0.6,
          z: radius * Math.sin(angle)
        };
        if (shouldIncludePoint(point)) {
          points.push(point);
          conePoints++;
        }
      }
      break;

    case PresetModel.TORUS:
      const majorRadius = 0.6;
      const minorRadius = 0.25;
      let torusPoints = 0;
      while (torusPoints < count) {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI * 2;
        
        const point = {
          x: (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u),
          y: minorRadius * Math.sin(v),
          z: (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u)
        };
        if (shouldIncludePoint(point)) {
          points.push(point);
          torusPoints++;
        }
      }
      break;

    case PresetModel.PYRAMID:
      let pyramidPoints = 0;
      while (pyramidPoints < count) {
        const height = Math.random();
        const baseSize = 0.9 * (1 - height);
        
        let point: ParticleTarget;
        if (Math.random() < 0.3) {
          const x = (Math.random() - 0.5) * 0.9;
          const z = (Math.random() - 0.5) * 0.9;
          point = { x, y: -0.6, z };
        } else {
          const angle = Math.random() * Math.PI * 2;
          point = {
            x: baseSize * Math.cos(angle),
            y: height * 1.2 - 0.6,
            z: baseSize * Math.sin(angle)
          };
        }
        if (shouldIncludePoint(point)) {
          points.push(point);
          pyramidPoints++;
        }
      }
      break;

    case PresetModel.BELL:
      let bellPoints = 0;
      while (bellPoints < count) {
        const angle = Math.random() * Math.PI * 2;
        const height = Math.random(); // 0 to 1, from bottom to top
        
        // Bell curve: wider at bottom, narrower at top with smooth curve
        // Using a bell-shaped function: radius = baseRadius * (1 - height^2) for smooth taper
        const baseRadius = 0.7;
        const radius = baseRadius * (1 - height * height * 0.8); // Curved bell profile
        
        // Add some variation for the bell's flared bottom
        const flare = height < 0.2 ? 1.1 : 1.0; // Slight flare at bottom
        const finalRadius = radius * flare;
        
        // Position: bottom at y = -0.6, top at y = 0.6
        const y = height * 1.2 - 0.6;
        
        const point = {
          x: finalRadius * Math.cos(angle),
          y: y,
          z: finalRadius * Math.sin(angle)
        };
        if (shouldIncludePoint(point)) {
          points.push(point);
          bellPoints++;
        }
      }
      break;

    case PresetModel.LETTER_A:
      // Letter A shape: two diagonal lines meeting at top, horizontal crossbar
      const letterWidth = 0.6;
      const letterHeight = 1.2;
      const crossbarY = 0.1; // Crossbar position (slightly above center)
      const crossbarWidth = 0.35;
      const thickness = 0.08; // Line thickness
      
      for (let i = 0; i < count; i++) {
        const part = Math.random();
        let x = 0, y = 0, z = 0;
        
        if (part < 0.35) {
          // Left diagonal line (bottom-left to top-center)
          const t = Math.random(); // 0 to 1 along the line
          x = -letterWidth / 2 + (letterWidth / 2) * t;
          y = -letterHeight / 2 + letterHeight * t;
          // Add thickness perpendicular to line
          const perpX = -Math.sin(Math.PI / 4) * (Math.random() - 0.5) * thickness;
          const perpY = Math.cos(Math.PI / 4) * (Math.random() - 0.5) * thickness;
          x += perpX;
          y += perpY;
        } else if (part < 0.7) {
          // Right diagonal line (bottom-right to top-center)
          const t = Math.random();
          x = letterWidth / 2 - (letterWidth / 2) * t;
          y = -letterHeight / 2 + letterHeight * t;
          // Add thickness perpendicular to line
          const perpX = Math.sin(Math.PI / 4) * (Math.random() - 0.5) * thickness;
          const perpY = Math.cos(Math.PI / 4) * (Math.random() - 0.5) * thickness;
          x += perpX;
          y += perpY;
        } else {
          // Horizontal crossbar
          const t = Math.random();
          x = -crossbarWidth / 2 + crossbarWidth * t;
          y = crossbarY;
          // Add thickness
          y += (Math.random() - 0.5) * thickness;
        }
        
        // Add depth variation for 3D effect
        z = (Math.random() - 0.5) * thickness * 0.5;
        
        points.push({ x, y, z });
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
