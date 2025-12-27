
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PresetModel, InteractionPoint, AppSettings, ParticleTarget } from '../types';
import { generateModelCoordinates } from '../services/geometryGenerator';
import { TRANSITION_SPEED, BROWNIAN_STRENGTH } from '../constants';

interface ParticleSystemProps {
  preset: PresetModel;
  customModel: ParticleTarget[] | null;
  interactionPoint: InteractionPoint;
  settings: AppSettings;
  manualRotation: { x: number; y: number };
  zoomLevel: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ preset, customModel, interactionPoint, settings, manualRotation, zoomLevel }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const { size, viewport, camera } = useThree();
  
  // Update camera position based on zoom level
  useEffect(() => {
    camera.position.z = zoomLevel;
  }, [zoomLevel, camera]);
  
  // Targets and positions - use customModel if preset is CUSTOM, otherwise generate
  const targets = useMemo(() => {
    if (preset === PresetModel.CUSTOM && customModel && customModel.length > 0) {
      // Scale custom model to match particle count
      const scaledModel: ParticleTarget[] = [];
      for (let i = 0; i < settings.particleCount; i++) {
        const sourcePoint = customModel[i % customModel.length];
        scaledModel.push({ ...sourcePoint });
      }
      return scaledModel;
    }
    return generateModelCoordinates(preset, settings.particleCount);
  }, [preset, customModel, settings.particleCount]);
  
  // Initialize positions randomly
  const initialPositions = useMemo(() => {
    const pos = new Float32Array(settings.particleCount * 3);
    for (let i = 0; i < settings.particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [settings.particleCount]);

  // Velocities for organic movement
  const velocities = useMemo(() => new Float32Array(settings.particleCount * 3), [settings.particleCount]);

  useFrame((state) => {
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < settings.particleCount; i++) {
      const idx = i * 3;
      
      // 1. Target Attraction (Formation Mode)
      if (settings.isFormationMode) {
        const target = targets[i % targets.length];
        positions[idx] += (target.x - positions[idx]) * TRANSITION_SPEED;
        positions[idx+1] += (target.y - positions[idx+1]) * TRANSITION_SPEED;
        positions[idx+2] += (target.z - positions[idx+2]) * TRANSITION_SPEED;
      }

      // 2. Interaction Forces (Hand/Cursor)
      if (interactionPoint.active) {
        // Convert screen normalized to world
        const ix = interactionPoint.x * viewport.width / 2;
        const iy = interactionPoint.y * viewport.height / 2;
        const iz = interactionPoint.z;

        const dx = ix - positions[idx];
        const dy = iy - positions[idx+1];
        const dz = iz - positions[idx+2];
        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);

        if (dist < 3) {
          const force = (interactionPoint.type === 'attract' ? 1 : -1) * (0.02 * interactionPoint.strength) / (dist + 0.1);
          positions[idx] += dx * force;
          positions[idx+1] += dy * force;
          positions[idx+2] += dz * force;
        }
      }

      // 3. Brownian / Idle Movement
      positions[idx] += (Math.random() - 0.5) * BROWNIAN_STRENGTH;
      positions[idx+1] += (Math.random() - 0.5) * BROWNIAN_STRENGTH;
      positions[idx+2] += (Math.random() - 0.5) * BROWNIAN_STRENGTH;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Apply manual and auto rotation with full 360-degree support
    if (settings.rotationSpeed > 0 || manualRotation.x !== 0 || manualRotation.y !== 0) {
      // Auto-rotation
      const autoRotY = time * settings.rotationSpeed * 0.01;
      
      // Combine auto and manual rotation
      pointsRef.current.rotation.x = manualRotation.x;
      pointsRef.current.rotation.y = autoRotY + manualRotation.y;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={initialPositions.length / 3}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={settings.color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

interface HologramViewProps {
  preset: PresetModel;
  customModel: ParticleTarget[] | null;
  interactionPoint: InteractionPoint;
  settings: AppSettings;
  manualRotation: { x: number; y: number };
  zoomLevel: number;
}

const HologramView: React.FC<HologramViewProps> = ({ preset, customModel, interactionPoint, settings, manualRotation, zoomLevel }) => {
  return (
    <div className="fixed inset-0 bg-black z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <ParticleSystem preset={preset} customModel={customModel} interactionPoint={interactionPoint} settings={settings} manualRotation={manualRotation} zoomLevel={zoomLevel} />
      </Canvas>
    </div>
  );
};

export default HologramView;
