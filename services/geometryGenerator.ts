
import { ParticleTarget, PresetModel } from '../types';

export const generateModelCoordinates = (model: PresetModel, count: number): ParticleTarget[] => {
  const points: ParticleTarget[] = [];
  
  switch (model) {
    case PresetModel.TREE:
      // Enhanced trunk with bark texture simulation
      const trunkCount = Math.floor(count * 0.25);
      for (let i = 0; i < trunkCount; i++) {
        const heightNorm = i / trunkCount;
        const angle = heightNorm * Math.PI * 12 + Math.random() * 0.3; // More twisting
        const height = heightNorm * 1.0;
        const radius = 0.08 * (1 - height * 0.7) * (1 + Math.sin(angle * 8) * 0.1); // Bark bumps
        const wobble = Math.sin(height * 10) * 0.01; // Natural bend
        points.push({
          x: radius * Math.cos(angle) + wobble,
          y: height - 0.6,
          z: radius * Math.sin(angle) + wobble
        });
      }
      
      // Branches extending from trunk
      const branchCount = Math.floor(count * 0.15);
      for (let i = 0; i < branchCount; i++) {
        const branchHeight = 0.2 + Math.random() * 0.6;
        const branchAngle = Math.random() * Math.PI * 2;
        const branchLength = Math.random() * 0.4;
        for (let j = 0; j < 5; j++) {
          const t = j / 5;
          points.push({
            x: Math.cos(branchAngle) * branchLength * t,
            y: branchHeight - 0.6 + t * 0.2,
            z: Math.sin(branchAngle) * branchLength * t
          });
        }
      }
      
      // Layered foliage crown
      const foliageCount = count - trunkCount - branchCount;
      for (let i = 0; i < foliageCount; i++) {
        const layer = Math.floor(Math.random() * 3);
        const layerRadius = 0.4 + layer * 0.15;
        const layerHeight = 0.5 - layer * 0.2;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        const clumpFactor = Math.random() * 0.3; // Create leaf clumps
        points.push({
          x: layerRadius * Math.sin(theta) * Math.cos(phi) * (1 + clumpFactor),
          y: layerRadius * Math.sin(theta) * Math.sin(phi) * 0.8 + layerHeight,
          z: layerRadius * Math.cos(theta) * (1 + clumpFactor)
        });
      }
      break;

    case PresetModel.CAR:
      // Hood and front
      const hoodCount = Math.floor(count * 0.2);
      for (let i = 0; i < hoodCount; i++) {
        const x = (Math.random() - 0.5) * 0.6;
        const z = (Math.random() - 0.5) * 0.6;
        const y = -0.1 + Math.abs(x) * 0.1; // Curved hood
        points.push({ x: x + 0.5, y, z });
      }
      
      // Main body with windshield
      const bodyCount = Math.floor(count * 0.35);
      for (let i = 0; i < bodyCount; i++) {
        const x = (Math.random() - 0.5) * 0.7;
        const y = (Math.random() - 0.5) * 0.5 - 0.05;
        const z = (Math.random() - 0.5) * 0.7;
        if (Math.abs(x) > 0.6 || Math.abs(z) > 0.6 || Math.abs(y) > 0.2) {
          points.push({ x, y, z });
        }
      }
      
      // Roof
      const roofCount = Math.floor(count * 0.15);
      for (let i = 0; i < roofCount; i++) {
        const x = (Math.random() - 0.5) * 0.5;
        const z = (Math.random() - 0.5) * 0.6;
        points.push({ x, y: 0.25, z });
      }
      
      // Trunk
      const carTrunkCount = Math.floor(count * 0.1);
      for (let i = 0; i < carTrunkCount; i++) {
        const x = (Math.random() - 0.5) * 0.6;
        const z = (Math.random() - 0.5) * 0.5;
        const y = -0.1 + Math.abs(x) * 0.05;
        points.push({ x: x - 0.5, y, z });
      }
      
      // Four wheels with spokes
      const wheelPositions = [
        { x: 0.5, z: 0.35 },
        { x: 0.5, z: -0.35 },
        { x: -0.5, z: 0.35 },
        { x: -0.5, z: -0.35 }
      ];
      const wheelsCount = count - hoodCount - bodyCount - roofCount - carTrunkCount;
      const perWheel = Math.floor(wheelsCount / 4);
      
      wheelPositions.forEach(pos => {
        for (let i = 0; i < perWheel; i++) {
          const angle = (i / perWheel) * Math.PI * 2;
          const r = 0.12 + (i % 3) * 0.02;
          const spoke = Math.floor(i / (perWheel / 6));
          const spokeAngle = (spoke / 6) * Math.PI * 2;
          points.push({
            x: pos.x,
            y: Math.cos(angle) * r - 0.35,
            z: pos.z + Math.sin(angle) * r * 0.3
          });
        }
      });
      break;

    case PresetModel.AIRPLANE:
      for (let i = 0; i < count; i++) {
        if (i < count * 0.4) {
          // Fuselage
          const t = (Math.random() - 0.5) * 2;
          const r = 0.1 * (1 - Math.abs(t) * 0.8);
          const angle = Math.random() * Math.PI * 2;
          points.push({ x: t, y: Math.cos(angle) * r, z: Math.sin(angle) * r });
        } else if (i < count * 0.8) {
          // Wings
          const z = (Math.random() - 0.5) * 2;
          const x = (Math.random() - 0.5) * 0.3;
          points.push({ x: x - 0.1, y: 0, z: z });
        } else {
          // Tail
          const y = Math.random() * 0.4;
          const x = -0.8 + (Math.random() - 0.5) * 0.1;
          const z = (Math.random() - 0.5) * 0.3;
          points.push({ x, y, z });
        }
      }
      break;

    case PresetModel.HUMAN:
      // Head with facial features
      const headCount = Math.floor(count * 0.12);
      for (let i = 0; i < headCount; i++) {
        const theta = Math.acos(2 * (i / headCount) - 1);
        const phi = (i / headCount) * Math.PI * 2 * 3;
        const r = 0.13;
        points.push({
          x: r * Math.sin(theta) * Math.cos(phi),
          y: 0.65 + r * Math.sin(theta) * Math.sin(phi),
          z: r * Math.cos(theta)
        });
      }
      
      // Neck
      const neckCount = Math.floor(count * 0.03);
      for (let i = 0; i < neckCount; i++) {
        const angle = (i / neckCount) * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * 0.06,
          y: 0.52 + (i % 5) * 0.02,
          z: Math.sin(angle) * 0.06
        });
      }
      
      // Shoulders
      const shoulderCount = Math.floor(count * 0.08);
      for (let i = 0; i < shoulderCount; i++) {
        const side = i < shoulderCount / 2 ? -1 : 1;
        const t = (i % (shoulderCount / 2)) / (shoulderCount / 2);
        points.push({
          x: side * (0.18 + t * 0.15),
          y: 0.45 - t * 0.05,
          z: (Math.random() - 0.5) * 0.12
        });
      }
      
      // Torso with chest and abdomen definition
      const torsoCount = Math.floor(count * 0.25);
      for (let i = 0; i < torsoCount; i++) {
        const height = (i / torsoCount);
        const width = 0.16 * (1 - Math.abs(height - 0.5) * 0.3);
        const angle = Math.random() * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * width * (0.8 + Math.random() * 0.4),
          y: 0.45 - height * 0.65,
          z: Math.sin(angle) * width * 0.6
        });
      }
      
      // Arms with bend at elbow
      const armCount = Math.floor(count * 0.22);
      const perArm = Math.floor(armCount / 2);
      [-1, 1].forEach(side => {
        for (let i = 0; i < perArm; i++) {
          const t = i / perArm;
          const upperArm = t < 0.5;
          const segmentT = upperArm ? t * 2 : (t - 0.5) * 2;
          
          if (upperArm) {
            // Upper arm (shoulder to elbow)
            points.push({
              x: side * (0.28 + segmentT * 0.1),
              y: 0.4 - segmentT * 0.35,
              z: segmentT * 0.1
            });
          } else {
            // Forearm (elbow to hand)
            points.push({
              x: side * (0.38 + segmentT * 0.05),
              y: 0.05 - segmentT * 0.3,
              z: 0.1 + segmentT * 0.15
            });
          }
        }
      });
      
      // Legs with knee definition
      const legCount = count - headCount - neckCount - shoulderCount - torsoCount - armCount;
      const perLeg = Math.floor(legCount / 2);
      [-1, 1].forEach(side => {
        for (let i = 0; i < perLeg; i++) {
          const t = i / perLeg;
          const upperLeg = t < 0.5;
          const segmentT = upperLeg ? t * 2 : (t - 0.5) * 2;
          
          if (upperLeg) {
            // Thigh
            points.push({
              x: side * (0.11 - segmentT * 0.02),
              y: -0.2 - segmentT * 0.35,
              z: (Math.random() - 0.5) * 0.1
            });
          } else {
            // Lower leg and foot
            points.push({
              x: side * (0.09 + (segmentT > 0.8 ? (segmentT - 0.8) * 0.5 : 0)),
              y: -0.55 - segmentT * 0.35,
              z: (Math.random() - 0.5) * 0.08 + (segmentT > 0.8 ? 0.1 : 0)
            });
          }
        }
      });
      break;

    case PresetModel.DNA:
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 8;
        const side = i % 2 === 0 ? 1 : -1;
        const r = 0.4;
        points.push({
          x: Math.cos(t) * r * side,
          y: (i / count) * 3 - 1.5,
          z: Math.sin(t) * r * side
        });
      }
      break;

    case PresetModel.HEART:
      for (let i = 0; i < count; i++) {
        const t = Math.random() * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        points.push({ x: x / 20, y: y / 20, z: (Math.random() - 0.5) * 0.2 });
      }
      break;

    case PresetModel.SPHERE:
      for (let i = 0; i < count; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * Math.PI * 2;
        points.push({ x: Math.sin(theta)*Math.cos(phi), y: Math.sin(theta)*Math.sin(phi), z: Math.cos(theta) });
      }
      break;

    case PresetModel.GALAXY:
      for (let i = 0; i < count; i++) {
        const dist = Math.random() * 2;
        const angle = dist * 5 + Math.random() * 0.5;
        points.push({ x: Math.cos(angle) * dist, y: (Math.random()-0.5)*0.1, z: Math.sin(angle) * dist });
      }
      break;

    case PresetModel.HOUSE:
      // Base/Foundation
      const baseCount = Math.floor(count * 0.15);
      for (let i = 0; i < baseCount; i++) {
        const x = (Math.random() - 0.5) * 0.8;
        const z = (Math.random() - 0.5) * 0.8;
        if (Math.abs(x) > 0.35 || Math.abs(z) > 0.35) {
          points.push({ x, y: -0.4, z });
        }
      }
      // Walls
      const wallCount = Math.floor(count * 0.5);
      for (let i = 0; i < wallCount; i++) {
        const angle = (i / wallCount) * Math.PI * 2;
        const height = Math.random() * 0.5;
        const radius = 0.4;
        points.push({ x: radius * Math.cos(angle), y: -0.4 + height, z: radius * Math.sin(angle) });
      }
      // Roof (triangular)
      const houseRoofCount = count - baseCount - wallCount;
      for (let i = 0; i < houseRoofCount; i++) {
        const t = (i / roofCount) * Math.PI * 2;
        const heightProgress = Math.random();
        const roofHeight = 0.3 * (1 - heightProgress);
        const radius = 0.4 * (1 - heightProgress);
        points.push({ x: radius * Math.cos(t), y: 0.1 + roofHeight, z: radius * Math.sin(t) });
      }
      break;

    case PresetModel.LAPTOP:
      // Keyboard/Base
      const keyboardCount = Math.floor(count * 0.4);
      for (let i = 0; i < keyboardCount; i++) {
        const x = (Math.random() - 0.5) * 1.0;
        const z = (Math.random() - 0.5) * 0.7;
        points.push({ x, y: -0.3, z });
      }
      // Keys (small bumps)
      const keysCount = Math.floor(count * 0.2);
      for (let i = 0; i < keysCount; i++) {
        const row = Math.floor(Math.random() * 7) - 3;
        const col = Math.floor(Math.random() * 13) - 6;
        points.push({ x: col * 0.08, y: -0.28, z: row * 0.08 });
      }
      // Screen (angled)
      const screenCount = count - keyboardCount - keysCount;
      const angle = Math.PI * 110 / 180; // 110 degrees
      for (let i = 0; i < screenCount; i++) {
        const x = (Math.random() - 0.5) * 1.0;
        const yBase = Math.random() * 0.8;
        const y = -0.3 + yBase * Math.cos(angle);
        const z = -0.35 + yBase * Math.sin(angle);
        points.push({ x, y, z });
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
