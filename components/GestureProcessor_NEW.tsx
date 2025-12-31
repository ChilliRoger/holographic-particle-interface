
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

          const handsDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
          const handLabels = results.multiHandedness || [];
          
          // Check for two-hand shape construction (both index fingers extended)
          let leftHandIndex: any = null;
          let rightHandIndex: any = null;
          let leftHandIndexTip: any = null;
          let rightHandIndexTip: any = null;
          
          if (handsDetected && results.multiHandLandmarks.length === 2) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
              const landmarks = results.multiHandLandmarks[i];
              const label = handLabels[i]?.categoryName?.toLowerCase() || '';
              const indexTip = landmarks[8];
              const thumbTip = landmarks[4];
              const middleTip = landmarks[12];
              const ringTip = landmarks[16];
              const pinkyTip = landmarks[20];
              
              // Check if only index finger is extended
              const indexExtended = indexTip.y < landmarks[6].y && indexTip.y < landmarks[5].y;
              const middleFolded = middleTip.y > landmarks[10].y;
              const ringFolded = ringTip.y > landmarks[14].y;
              const pinkyFolded = pinkyTip.y > landmarks[18].y;
              const thumbFolded = Math.abs(thumbTip.x - landmarks[2].x) < 0.1;
              
              const onlyIndexExtended = indexExtended && middleFolded && ringFolded && pinkyFolded && thumbFolded;
              
              if (onlyIndexExtended) {
                if (label.includes('left')) {
                  leftHandIndex = landmarks;
                  leftHandIndexTip = indexTip;
                } else if (label.includes('right')) {
                  rightHandIndex = landmarks;
                  rightHandIndexTip = indexTip;
                }
              }
            }
          }

          // Handle two-hand shape construction
          if (leftHandIndex && rightHandIndex && leftHandIndexTip && rightHandIndexTip) {
            const currentTime = Date.now();
            const leftPos = {
              x: (leftHandIndexTip.x * 2 - 1),
              y: -(leftHandIndexTip.y * 2 - 1),
              z: -leftHandIndexTip.z * 3
            };
            const rightPos = {
              x: (rightHandIndexTip.x * 2 - 1),
              y: -(rightHandIndexTip.y * 2 - 1),
              z: -rightHandIndexTip.z * 3
            };
            
            // Check if hands are stationary (within threshold)
            const leftStationary = lastHandPositionsRef.current.left && 
              Math.abs(leftPos.x - lastHandPositionsRef.current.left.x) < 0.02 &&
              Math.abs(leftPos.y - lastHandPositionsRef.current.left.y) < 0.02 &&
              Math.abs(leftPos.z - lastHandPositionsRef.current.left.z) < 0.05;
            const rightStationary = lastHandPositionsRef.current.right &&
              Math.abs(rightPos.x - lastHandPositionsRef.current.right.x) < 0.02 &&
              Math.abs(rightPos.y - lastHandPositionsRef.current.right.y) < 0.02 &&
              Math.abs(rightPos.z - lastHandPositionsRef.current.right.z) < 0.05;
            
            if (leftStationary && rightStationary) {
              if (stationaryStartTimeRef.current === null) {
                stationaryStartTimeRef.current = currentTime;
              } else if (currentTime - stationaryStartTimeRef.current >= 300) {
                // Lock shape after 300ms of being stationary
                if (!shapeConstructionRef.current || shapeConstructionRef.current.phase === 'tracing') {
                  const bounds = shapePathRef.current.length > 0 ? {
                    minX: Math.min(...shapePathRef.current.map(p => p.x)),
                    maxX: Math.max(...shapePathRef.current.map(p => p.x)),
                    minY: Math.min(...shapePathRef.current.map(p => p.y)),
                    maxY: Math.max(...shapePathRef.current.map(p => p.y)),
                    minZ: Math.min(...shapePathRef.current.map(p => p.z)),
                    maxZ: Math.max(...shapePathRef.current.map(p => p.z))
                  } : undefined;
                  
                  shapeConstructionRef.current = {
                    active: true,
                    phase: 'locked',
                    points: [...shapePathRef.current],
                    bounds,
                    density: 0.5, // Start with medium density
                    lockTime: currentTime
                  };
                  
                  if (onShapeConstructionUpdate) {
                    onShapeConstructionUpdate(shapeConstructionRef.current);
                  }
                }
              }
            } else {
              // Hands are moving - reset stationary timer and continue tracing
              stationaryStartTimeRef.current = null;
              
              // Add points to path (use both finger positions)
              const currentTime2 = Date.now();
              [leftPos, rightPos].forEach(pos => {
                // Only add if significantly different from last point
                const lastPoint = shapePathRef.current.length > 0 ? shapePathRef.current[shapePathRef.current.length - 1] : null;
                if (!lastPoint || 
                    Math.abs(pos.x - lastPoint.x) > 0.01 ||
                    Math.abs(pos.y - lastPoint.y) > 0.01 ||
                    Math.abs(pos.z - lastPoint.z) > 0.02) {
                  shapePathRef.current.push({ ...pos, timestamp: currentTime2 });
                }
              });
              
              // Update shape construction in tracing phase
              const bounds = shapePathRef.current.length > 0 ? {
                minX: Math.min(...shapePathRef.current.map(p => p.x)),
                maxX: Math.max(...shapePathRef.current.map(p => p.x)),
                minY: Math.min(...shapePathRef.current.map(p => p.y)),
                maxY: Math.max(...shapePathRef.current.map(p => p.y)),
                minZ: Math.min(...shapePathRef.current.map(p => p.z)),
                maxZ: Math.max(...shapePathRef.current.map(p => p.z))
              } : undefined;
              
              // Calculate density based on average hand depth
              const avgDepth = (leftPos.z + rightPos.z) / 2;
              const normalizedDepth = Math.max(0, Math.min(1, (avgDepth + 1) / 2)); // Normalize to 0-1
              
              shapeConstructionRef.current = {
                active: true,
                phase: 'tracing',
                points: [...shapePathRef.current],
                bounds,
                density: 1 - normalizedDepth // Farther = lower density, closer = higher
              };
              
              if (onShapeConstructionUpdate) {
                onShapeConstructionUpdate(shapeConstructionRef.current);
              }
            }
            
            lastHandPositionsRef.current = { left: leftPos, right: rightPos };
            
            // Draw shape construction feedback
            if (shapeConstructionRef.current) {
              canvasCtx.strokeStyle = shapeConstructionRef.current.phase === 'locked' 
                ? 'rgba(0, 255, 255, 0.8)' 
                : 'rgba(0, 255, 255, 0.5)';
              canvasCtx.lineWidth = shapeConstructionRef.current.phase === 'locked' ? 3 : 2;
              
              // Draw path
              if (shapePathRef.current.length > 1) {
                canvasCtx.beginPath();
                shapePathRef.current.forEach((point, idx) => {
                  const screenX = ((point.x + 1) / 2) * canvasRef.current!.width;
                  const screenY = ((1 - point.y) / 2) * canvasRef.current!.height;
                  if (idx === 0) {
                    canvasCtx.moveTo(screenX, screenY);
                  } else {
                    canvasCtx.lineTo(screenX, screenY);
                  }
                });
                canvasCtx.stroke();
              }
              
              // Draw index finger positions
              [leftHandIndexTip, rightHandIndexTip].forEach((tip) => {
                if (tip) {
                  canvasCtx.beginPath();
                  canvasCtx.arc(
                    tip.x * canvasRef.current!.width,
                    tip.y * canvasRef.current!.height,
                    8,
                    0,
                    2 * Math.PI
                  );
                  canvasCtx.fillStyle = 'rgba(0, 255, 255, 0.6)';
                  canvasCtx.fill();
                }
              });
            }
            
            // Don't process other gestures during shape construction
            return;
          } else {
            // Reset shape construction if hands are not in construction mode
            if (shapeConstructionRef.current) {
              shapeConstructionRef.current = null;
              shapePathRef.current = [];
              stationaryStartTimeRef.current = null;
              lastHandPositionsRef.current = { left: null, right: null };
              if (onShapeConstructionUpdate) {
                onShapeConstructionUpdate(null);
              }
            }
          }

          // Process single hand gestures (existing logic, but remove compression)
          if (handsDetected && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
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

            // OK sign detection
            const okDist = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + 
              Math.pow(indexTip.y - thumbTip.y, 2)
            );
            const isOkSign = okDist < 0.08 && okDist > 0.03 && extendedFingers >= 2;

            // Rock sign detection
            const isRockSign = fingerStates[0] && !fingerStates[1] && !fingerStates[2] && fingerStates[3];

            // Thumbs up/down detection
            const isThumbsUp = thumbExtended && extendedFingers === 0 && landmarks[4].y < landmarks[2].y;
            const isThumbsDown = thumbExtended && extendedFingers === 0 && landmarks[4].y > landmarks[2].y;

            // Track hand movement for rotation gestures
            const currentPos = { x: trackPoint.x, y: trackPoint.y };
            let handDeltaX = 0;
            let handDeltaY = 0;
            
            if (previousHandPositionRef.current) {
              handDeltaX = currentPos.x - previousHandPositionRef.current.x;
              handDeltaY = currentPos.y - previousHandPositionRef.current.y;
            }
            previousHandPositionRef.current = currentPos;

            let type: 'attract' | 'repel' | 'pinch' = 'attract';
            let strength = 1.0;
            let gestureType = 'NEUTRAL';
            let rotationData = { active: false, deltaX: 0, deltaY: 0 };

            // Gesture Classification with priority order (NO COMPRESSION)
            if (isPinching) {
              type = 'pinch';
              strength = 2.5;
              gestureType = 'PINCH';
            } else if (isThumbsUp) {
              type = 'attract';
              strength = 0.5;
              gestureType = 'THUMBS_UP';
            } else if (isThumbsDown) {
              type = 'repel';
              strength = 0.5;
              gestureType = 'THUMBS_DOWN';
            } else if (isOkSign) {
              type = 'attract';
              strength = 1.0;
              gestureType = 'OK_SIGN';
            } else if (isRockSign) {
              type = 'attract';
              strength = 1.5;
              gestureType = 'ROCK_SIGN';
            } else if (extendedFingers === 0 && !thumbExtended) {
              type = 'repel';
              strength = 1.8;
              gestureType = 'CLOSED_FIST';
            } else if (extendedFingers >= 4 && thumbExtended) {
              // Open palm - 360° rotation control
              type = 'attract';
              strength = 0.3;
              gestureType = 'OPEN_PALM_ROTATE';
              
              if (Math.abs(handDeltaX) > 0.002 || Math.abs(handDeltaY) > 0.002) {
                rotationData = {
                  active: true,
                  deltaX: handDeltaY * 20,
                  deltaY: handDeltaX * 20
                };
              }
            } else if (extendedFingers === 2 && !thumbExtended) {
              // Peace sign - rotation mode
              type = 'attract';
              strength = 0.8;
              gestureType = 'PEACE_ROTATE';
              
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
            }

            onGestureDetected(gestureType);
            
            // Send interaction update (NO COMPRESSION DATA)
            const interactionData: InteractionPoint = {
              x: ix,
              y: iy,
              z: -trackPoint.z * 3,
              active: true,
              type,
              strength
            };
            
            onInteractionUpdate(interactionData);

            // Enhanced visual feedback
            canvasCtx.save();
            
            // Draw hand skeleton
            let skeletonColor = 'rgba(0, 255, 255, 0.5)';
            if (rotationData.active) skeletonColor = 'rgba(255, 100, 255, 0.7)';
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
            
            // Draw tracking point
            let color = '#00ffff';
            if (type === 'repel') color = '#ff0066';
            else if (type === 'pinch') color = '#00ff00';
            else if (rotationData.active) color = '#ff00ff';
            else if (gestureType.includes('THUMBS')) color = '#ffaa00';
            
            canvasCtx.beginPath();
            canvasCtx.arc(
              trackPoint.x * canvasRef.current.width,
              trackPoint.y * canvasRef.current.height,
              rotationData.active ? 20 : 15,
              0,
              2 * Math.PI
            );
            canvasCtx.strokeStyle = color;
            canvasCtx.lineWidth = 3;
            canvasCtx.stroke();
            
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
            onInteractionUpdate({ x: 0, y: 0, z: 0, active: false, type: 'none', strength: 0 });
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
  }, [mode, onInteractionUpdate, onGestureDetected, onShapeConstructionUpdate]);

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

