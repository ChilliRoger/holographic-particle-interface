
import React, { useEffect, useRef, useState } from 'react';
import { ControlMode, InteractionPoint } from '../types';

declare var Hands: any;
declare var Camera: any;

interface GestureProcessorProps {
  mode: ControlMode;
  showCamera: boolean;
  onInteractionUpdate: (point: InteractionPoint) => void;
  onGestureDetected: (gesture: string) => void;
}

const GestureProcessor: React.FC<GestureProcessorProps> = ({ 
  mode, 
  showCamera, 
  onInteractionUpdate, 
  onGestureDetected 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

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
          maxNumHands: 1,
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
            
            // Smoothed position using index finger tip for more precise tracking
            const trackPoint = landmarks[9]; // Middle of hand for stability
            const ix = (trackPoint.x * 2 - 1);
            const iy = -(trackPoint.y * 2 - 1);
            
            // Enhanced Gesture Detection with better accuracy
            const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
            const fingerPips = [6, 10, 14, 18]; // PIP joints (middle joints)
            const fingerMcps = [5, 9, 13, 17]; // MCP joints (knuckles)
            
            // Count extended fingers with better detection
            let extendedFingers = 0;
            fingerTips.forEach((tip, i) => {
              const tipY = landmarks[tip].y;
              const pipY = landmarks[fingerPips[i]].y;
              const mcpY = landmarks[fingerMcps[i]].y;
              
              // Finger is extended if tip is above both joints
              if (tipY < pipY && tipY < mcpY) {
                extendedFingers++;
              }
            });

            // Thumb detection (different logic due to thumb orientation)
            const thumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.1;
            
            // Calculate pinch distance for pinch detection
            const pinchDist = Math.sqrt(
              Math.pow(indexTip.x - thumbTip.x, 2) + 
              Math.pow(indexTip.y - thumbTip.y, 2)
            );
            const isPinching = pinchDist < 0.05;

            let type: 'attract' | 'repel' | 'pinch' = 'attract';
            let strength = 1.0;
            let gestureType = 'NEUTRAL';

            // Gesture Classification with priority order
            if (isPinching) {
              type = 'pinch';
              strength = 2.5;
              gestureType = 'PINCH';
            } else if (extendedFingers === 0 && !thumbExtended) {
              type = 'repel';
              strength = 1.8;
              gestureType = 'CLOSED_FIST';
            } else if (extendedFingers >= 4 && thumbExtended) {
              type = 'attract';
              strength = 1.5;
              gestureType = 'OPEN_PALM';
            } else if (extendedFingers === 2 && !thumbExtended) {
              // Peace sign - special rotation gesture
              type = 'attract';
              strength = 0.8;
              gestureType = 'PEACE';
            } else if (extendedFingers === 1 && !thumbExtended) {
              // Pointing - precise control
              type = 'attract';
              strength = 1.2;
              gestureType = 'POINT';
            } else {
              type = 'attract';
              strength = 1.0;
              gestureType = 'NEUTRAL';
            }

            onGestureDetected(gestureType);
            onInteractionUpdate({
              x: ix,
              y: iy,
              z: -trackPoint.z * 3, // Use depth with better scaling
              active: true,
              type,
              strength
            });

            // Enhanced visual feedback
            canvasCtx.save();
            
            // Draw hand skeleton
            canvasCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
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
            const color = type === 'repel' ? '#ff0066' : type === 'pinch' ? '#00ff00' : '#00ffff';
            canvasCtx.beginPath();
            canvasCtx.arc(
              trackPoint.x * canvasRef.current.width,
              trackPoint.y * canvasRef.current.height,
              15,
              0,
              2 * Math.PI
            );
            canvasCtx.strokeStyle = color;
            canvasCtx.lineWidth = 3;
            canvasCtx.stroke();
            
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
          className="w-48 h-36 object-cover scale-x-[-1] opacity-60"
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
