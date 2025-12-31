
import React, { useEffect, useRef, useState } from 'react';
import { ControlMode, InteractionPoint, ShapeConstruction } from '../types';

declare var Hands: any;
declare var Camera: any;

interface GestureProcessorProps {
  mode: ControlMode;
  showCamera: boolean;
  onInteractionUpdate: (point: InteractionPoint) => void;
  onGestureDetected: (gesture: string) => void;
  onShapeConstructionUpdate?: (shape: ShapeConstruction | null) => void;
}

const GestureProcessor: React.FC<GestureProcessorProps> = ({ 
  mode, 
  showCamera, 
  onInteractionUpdate, 
  onGestureDetected,
  onShapeConstructionUpdate
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const previousHandPositionRef = useRef<{ x: number; y: number } | null>(null);
  const gestureStartTimeRef = useRef<number>(0);
  const rotationAccumulatorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Shape construction tracking
  const shapePathRef = useRef<{ x: number; y: number; z: number; timestamp: number }[]>([]);
  const lastHandPositionsRef = useRef<{ left: { x: number; y: number; z: number } | null, right: { x: number; y: number; z: number } | null }>({ left: null, right: null });
  const stationaryStartTimeRef = useRef<number | null>(null);
  const shapeConstructionRef = useRef<ShapeConstruction | null>(null);

  useEffect(() => {
    if (mode === ControlMode.CURSOR) {
      if (cameraRef.current) cameraRef.current.stop();
      return;
    }

    const initMediaPipe = async () => {
      try {
        if (!window.hasOwnProperty('Hands')) {
          setError("MediaPipe scripts not loaded correctly.");
          return;
        }

        const hands = new Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2, // Enable two-hand tracking for shape construction
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (!canvasRef.current || !videoRef.current) return;
          const canvasCtx = canvasRef.current.getContext('2d')!;
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const palmBase = landmarks[0];
            const wrist = landmarks[0];
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];
            
            // Smoothed position using middle of hand for stability
            const trackPoint = landmarks[9];
            const ix = (trackPoint.x * 2 - 1);
            const iy = -(trackPoint.y * 2 - 1);
            
            // Enhanced Gesture Detection
            const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
            const fingerPips = [6, 10, 14, 18]; // PIP joints
            const fingerMcps = [5, 9, 13, 17]; // MCP joints
            
            // Count extended fingers
            let extendedFingers = 0;
            const fingerStates: boolean[] = [];
            fingerTips.forEach((tip, i) => {
              const tipY = landmarks[tip].y;
              const pipY = landmarks[fingerPips[i]].y;
              const mcpY = landmarks[fingerMcps[i]].y;
              const isExtended = tipY < pipY && tipY < mcpY;
              fingerStates.push(isExtended);
              if (isExtended) extendedFingers++;
            });

            // Thumb detection
            const thumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.1;
            
            // Pinch detection
            const pinchDist = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + 
              Math.pow(indexTip.y - thumbTip.y, 2)
            );
            const isPinching = pinchDist < 0.05;

            // OK sign detection (thumb and index form circle)
            const okDist = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + 
              Math.pow(indexTip.y - thumbTip.y, 2)
            );
            const isOkSign = okDist < 0.08 && okDist > 0.03 && extendedFingers >= 2;

            // Rock sign detection (index and pinky extended, middle and ring folded)
            const isRockSign = fingerStates[0] && !fingerStates[1] && !fingerStates[2] && fingerStates[3];

            // Thumbs up detection
            const isThumbsUp = thumbExtended && extendedFingers === 0 && landmarks[4].y < landmarks[2].y;
            
            // Thumbs down detection
            const isThumbsDown = thumbExtended && extendedFingers === 0 && landmarks[4].y > landmarks[2].y;

            // Enhanced L-shape detection (thumb and index extended at ~90° angle)
            // Check if thumb and index are extended
            const thumbIndexExtended = thumbExtended && fingerStates[0];
            // Check if other fingers are folded (middle, ring, pinky)
            const otherFingersFolded = !fingerStates[1] && !fingerStates[2] && !fingerStates[3];
            
            let isLShape = false;
            let lShapeAngle = 0;
            
            if (thumbIndexExtended && otherFingersFolded && extendedFingers === 1) {
              // Calculate vectors from thumb base to thumb tip and index tip
              const thumbBase = landmarks[2]; // Thumb MCP
              const thumbTipPos = { x: thumbTip.x - thumbBase.x, y: thumbTip.y - thumbBase.y };
              const indexTipPos = { x: indexTip.x - thumbBase.x, y: indexTip.y - thumbBase.y };
              
              // Calculate angle between vectors
              const dot = thumbTipPos.x * indexTipPos.x + thumbTipPos.y * indexTipPos.y;
              const mag1 = Math.sqrt(thumbTipPos.x * thumbTipPos.x + thumbTipPos.y * thumbTipPos.y);
              const mag2 = Math.sqrt(indexTipPos.x * indexTipPos.x + indexTipPos.y * indexTipPos.y);
              
              if (mag1 > 0.05 && mag2 > 0.05) { // Ensure fingers are actually extended
                const cosAngle = dot / (mag1 * mag2);
                lShapeAngle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
                
                // Check if angle is approximately 90° (±15° tolerance)
                isLShape = lShapeAngle >= 75 && lShapeAngle <= 105;
              }
            }

            // Track hand movement for rotation gestures
            const currentPos = { x: trackPoint.x, y: trackPoint.y };
            let handDeltaX = 0;
            let handDeltaY = 0;
            
            if (previousHandPositionRef.current) {
              handDeltaX = currentPos.x - previousHandPositionRef.current.x;
              handDeltaY = currentPos.y - previousHandPositionRef.current.y;
            }
            previousHandPositionRef.current = currentPos;

            let type: 'attract' | 'repel' | 'pinch' | 'compress' = 'attract';
            let strength = 1.0;
            let gestureType = 'NEUTRAL';
            let rotationData = { active: false, deltaX: 0, deltaY: 0 };
            let compressionData = { active: false, intensity: 0 };

            // Gesture Classification with priority order
            if (isPinching) {
              type = 'pinch';
              strength = 2.5;
              gestureType = 'PINCH';
            } else if (isThumbsUp) {
              type = 'attract';
              strength = 0.5;
              gestureType = 'THUMBS_UP';
              // Zoom in effect handled by parent
            } else if (isThumbsDown) {
              type = 'repel';
              strength = 0.5;
              gestureType = 'THUMBS_DOWN';
              // Zoom out effect handled by parent
            } else if (isOkSign) {
              type = 'attract';
              strength = 1.0;
              gestureType = 'OK_SIGN';
            } else if (isRockSign) {
              type = 'attract';
              strength = 1.5;
              gestureType = 'ROCK_SIGN';
            } else if (isLShape) {
              // Compression mode - L-shape gesture
              type = 'compress';
              strength = 0;
              gestureType = 'L_SHAPE_COMPRESS';
              
              // Calculate compression intensity based on hand depth (z-coordinate)
              // Hand closer to camera (higher z) = more compression
              // Normalize z to 0-1 range (assuming z is typically -0.5 to 0.5)
              const rawDepth = Math.max(-0.5, Math.min(0.5, trackPoint.z * 3));
              const normalizedDepth = (rawDepth + 0.5) / 1.0; // 0 (far) to 1 (close)
              
              // Smooth depth changes to avoid jitter (exponential moving average)
              const smoothingFactor = 0.15;
              handDepthSmoothingRef.current = handDepthSmoothingRef.current * (1 - smoothingFactor) + normalizedDepth * smoothingFactor;
              
              // Compression intensity: 0 (loose) to 1 (fully solid)
              compressionData = {
                active: true,
                intensity: Math.max(0, Math.min(1, handDepthSmoothingRef.current))
              };
            } else if (extendedFingers === 0 && !thumbExtended) {
              type = 'repel';
              strength = 1.8;
              gestureType = 'CLOSED_FIST';
            } else if (extendedFingers >= 4 && thumbExtended) {
              // Open palm - 360° rotation control
              type = 'attract';
              strength = 0.3; // Lower strength so it doesn't interfere with rotation
              gestureType = 'OPEN_PALM_ROTATE';
              
              // Always active rotation when palm is open, based on hand movement
              if (Math.abs(handDeltaX) > 0.002 || Math.abs(handDeltaY) > 0.002) {
                rotationData = {
                  active: true,
                  deltaX: handDeltaY * 20, // Increased sensitivity for smoother rotation
                  deltaY: handDeltaX * 20
                };
              }
            } else if (extendedFingers === 2 && !thumbExtended) {
              // Peace sign - rotation mode
              type = 'attract';
              strength = 0.8;
              gestureType = 'PEACE_ROTATE';
              
              // Continuous rotation based on hand position
              rotationData = {
                active: true,
                deltaX: handDeltaY * 8,
                deltaY: handDeltaX * 8
              };
            } else if (extendedFingers === 1 && !thumbExtended) {
              type = 'attract';
              strength = 2.5;
              gestureType = 'POINT';
            } else {
              type = 'attract';
              strength = 0.5;
              gestureType = 'NEUTRAL';
              // Reset compression when L-shape is released
              compressionData = { active: false, intensity: 0 };
              handDepthSmoothingRef.current = 0;
            }

            onGestureDetected(gestureType);
            
            // Send interaction update with rotation and compression data
            const interactionData: any = {
              x: ix,
              y: iy,
              z: -trackPoint.z * 3,
              active: true,
              type,
              strength
            };
            
            // Add rotation data if applicable
            if (rotationData.active) {
              interactionData.rotation = rotationData;
            }
            
            // Add compression data if applicable
            if (compressionData.active) {
              interactionData.compression = compressionData;
            }
            
            onInteractionUpdate(interactionData);

            // Enhanced visual feedback
            canvasCtx.save();
            
            // Draw hand skeleton
            let skeletonColor = 'rgba(0, 255, 255, 0.5)';
            if (compressionData.active) skeletonColor = 'rgba(255, 136, 0, 0.7)'; // Orange for compression
            else if (rotationData.active) skeletonColor = 'rgba(255, 100, 255, 0.7)'; // Pink for rotation
            canvasCtx.strokeStyle = skeletonColor;
            canvasCtx.lineWidth = 2;
            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // Index
              [0, 9], [9, 10], [10, 11], [11, 12], // Middle
              [0, 13], [13, 14], [14, 15], [15, 16], // Ring
              [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
              [5, 9], [9, 13], [13, 17] // Palm
            ];
            
            connections.forEach(([start, end]) => {
              canvasCtx.beginPath();
              canvasCtx.moveTo(
                landmarks[start].x * canvasRef.current!.width,
                landmarks[start].y * canvasRef.current!.height
              );
              canvasCtx.lineTo(
                landmarks[end].x * canvasRef.current!.width,
                landmarks[end].y * canvasRef.current!.height
              );
              canvasCtx.stroke();
            });
            
            // Draw tracking point with gesture-based color
            let color = '#00ffff';
            if (type === 'compress') color = '#ff8800'; // Orange for compression
            else if (type === 'repel') color = '#ff0066';
            else if (type === 'pinch') color = '#00ff00';
            else if (rotationData.active) color = '#ff00ff';
            else if (gestureType.includes('THUMBS')) color = '#ffaa00';
            
            // Draw tracking point with size based on compression
            const pointRadius = compressionData.active 
              ? 15 + compressionData.intensity * 10 // Scale up with compression intensity
              : rotationData.active ? 20 : 15;
            
            canvasCtx.beginPath();
            canvasCtx.arc(
              trackPoint.x * canvasRef.current.width,
              trackPoint.y * canvasRef.current.height,
              pointRadius,
              0,
              2 * Math.PI
            );
            canvasCtx.strokeStyle = color;
            canvasCtx.lineWidth = compressionData.active ? 4 : 3;
            canvasCtx.stroke();
            
            // Draw compression intensity indicator (concentric circles)
            if (compressionData.active) {
              canvasCtx.strokeStyle = `rgba(255, 136, 0, ${0.3 + compressionData.intensity * 0.5})`;
              canvasCtx.lineWidth = 2;
              for (let i = 1; i <= 3; i++) {
                canvasCtx.beginPath();
                canvasCtx.arc(
                  trackPoint.x * canvasRef.current.width,
                  trackPoint.y * canvasRef.current.height,
                  pointRadius + i * 8,
                  0,
                  2 * Math.PI
                );
                canvasCtx.stroke();
              }
            }
            
            // Draw rotation indicator
            if (rotationData.active) {
              canvasCtx.strokeStyle = '#ff00ff';
              canvasCtx.lineWidth = 2;
              canvasCtx.beginPath();
              canvasCtx.arc(
                trackPoint.x * canvasRef.current.width,
                trackPoint.y * canvasRef.current.height,
                30,
                0,
                Math.PI * 2
              );
              canvasCtx.stroke();
              
              // Arrow indicating rotation direction
              const arrowAngle = Math.atan2(handDeltaY, handDeltaX);
              const arrowLength = 25;
              canvasCtx.beginPath();
              canvasCtx.moveTo(
                trackPoint.x * canvasRef.current.width,
                trackPoint.y * canvasRef.current.height
              );
              canvasCtx.lineTo(
                trackPoint.x * canvasRef.current.width + Math.cos(arrowAngle) * arrowLength,
                trackPoint.y * canvasRef.current.height + Math.sin(arrowAngle) * arrowLength
              );
              canvasCtx.stroke();
            }
            
            canvasCtx.restore();
          } else {
            // Reset compression when hand is not detected
            handDepthSmoothingRef.current = 0;
            onInteractionUpdate({ x: 0, y: 0, z: 0, active: false, type: 'none', strength: 0, compression: { active: false, intensity: 0 } });
          }
        });

        handsRef.current = hands;

        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              await hands.send({ image: videoRef.current! });
            },
            width: 640,
            height: 480
          });
          camera.start();
          cameraRef.current = camera;
        }
      } catch (err) {
        setError("Hand tracking initialization failed.");
        console.error(err);
      }
    };

    initMediaPipe();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
    };
  }, [mode]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mode === ControlMode.CURSOR) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        onInteractionUpdate({
          x,
          y,
          z: 0,
          active: true,
          type: e.buttons > 0 ? 'repel' : 'attract',
          strength: 1.0
        });
      }
    };

    const handleMouseUp = () => {
      if (mode === ControlMode.CURSOR) {
        onInteractionUpdate({ x: 0, y: 0, z: 0, active: false, type: 'none', strength: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode, onInteractionUpdate]);

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-500 ${showCamera && mode === ControlMode.GESTURE ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div className="relative border-2 border-cyan-500 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(0,255,255,0.4)] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-80 h-60 object-cover scale-x-[-1] opacity-60"
        />
        <canvas 
          ref={canvasRef} 
          width={640} 
          height={480} 
          className="absolute inset-0 w-full h-full scale-x-[-1]" 
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-[10px] text-red-400 p-2 text-center uppercase font-bold">
            {error}
          </div>
        )}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 mt-2 text-center font-bold bg-black/50 py-1 backdrop-blur-md">
        Biometric Feed
      </div>
    </div>
  );
};

export default GestureProcessor;
