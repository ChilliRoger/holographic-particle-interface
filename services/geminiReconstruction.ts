import { ParticleTarget } from "../types";

/**
 * Client-side image processing to generate 3D particle coordinates
 * No API key required - everything runs in the browser
 */
export const generate3DBlueprint = async (base64Image: string): Promise<ParticleTarget[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) {
          reject(new Error("Failed to create canvas context"));
          return;
        }

        // Increase canvas size for better clarity (higher resolution)
        const maxSize = 300;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        console.log('Canvas size:', canvas.width, 'x', canvas.height);
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Extract edge and filled pixels
        const points: ParticleTarget[] = [];
        const aspectRatio = canvas.width / canvas.height;
        
        // Edge detection using Sobel operator - higher threshold for cleaner edges
        const edges = detectEdges(data, canvas.width, canvas.height, 60);
        
        // Sample points with much larger spacing for clarity
        for (let y = 0; y < canvas.height; y += 3) {
          for (let x = 0; x < canvas.width; x += 3) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            
            // Skip transparent pixels
            if (a < 50) continue;
            
            const isEdge = edges[y * canvas.width + x];
            const brightness = (r + g + b) / 3;
            
            // Focus heavily on edges, minimal fill
            const samplingRate = isEdge ? 0.8 : 0.05;
            
            if (Math.random() < samplingRate) {
              // Normalize to [-1, 1] range
              const nx = (x / canvas.width) * 2 - 1;
              const ny = -((y / canvas.height) * 2 - 1); // Flip Y
              
              // Create varied depth for better 3D effect
              const depth = (brightness / 255) * 0.8 - 0.4;
              
              points.push({
                x: nx * aspectRatio,
                y: ny,
                z: depth
              });
            }
          }
        }
        
        // Ensure we have enough points (aim for 400-700 for clarity)
        if (points.length < 300) {
          for (let y = 0; y < canvas.height; y += 3) {
            for (let x = 0; x < canvas.width; x += 3) {
              const idx = (y * canvas.width + x) * 4;
              const a = data[idx + 3];
              
              if (a > 100 && Math.random() < 0.3) {
                const nx = (x / canvas.width) * 2 - 1;
                const ny = -((y / canvas.height) * 2 - 1);
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const depth = (brightness / 255) * 0.8 - 0.4;
                
                points.push({
                  x: nx * aspectRatio,
                  y: ny,
                  z: depth
                });
                
                if (points.length >= 700) break;
              }
            }
            if (points.length >= 700) break;
          }
        }
        
        // Ensure we have at least some points
        if (points.length === 0) {
          reject(new Error("No visible content detected in image"));
          return;
        }
        
        console.log('Generated', points.length, 'raw points');
        
        // Normalize and scale points to fit within [-0.8, 0.8] bounds to prevent screen overflow
        const bounds = {
          minX: Math.min(...points.map(p => p.x)),
          maxX: Math.max(...points.map(p => p.x)),
          minY: Math.min(...points.map(p => p.y)),
          maxY: Math.max(...points.map(p => p.y)),
          minZ: Math.min(...points.map(p => p.z)),
          maxZ: Math.max(...points.map(p => p.z))
        };
        
        const rangeX = bounds.maxX - bounds.minX;
        const rangeY = bounds.maxY - bounds.minY;
        const rangeZ = bounds.maxZ - bounds.minZ;
        const maxRange = Math.max(rangeX, rangeY, rangeZ);
        
        // Scale to fit within 0.8 units (80% of screen)
        const scaleFactor = 0.8 / maxRange;
        
        const normalizedPoints = points.map(p => ({
          x: (p.x - (bounds.minX + bounds.maxX) / 2) * scaleFactor,
          y: (p.y - (bounds.minY + bounds.maxY) / 2) * scaleFactor,
          z: (p.z - (bounds.minZ + bounds.maxZ) / 2) * scaleFactor
        }));
        
        console.log('Normalized to', normalizedPoints.length, 'points, scale factor:', scaleFactor);
        
        resolve(normalizedPoints);
      } catch (error) {
        console.error('Error processing image:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(new Error("Failed to load image"));
    };
    
    img.src = base64Image;
  });
};

/**
 * Simple edge detection using Sobel operator
 */
function detectEdges(data: Uint8ClampedArray, width: number, height: number, threshold: number = 60): boolean[] {
  const edges = new Array(width * height).fill(false);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get surrounding pixels
      const tl = getGrayscale(data, (y - 1) * width + (x - 1));
      const t = getGrayscale(data, (y - 1) * width + x);
      const tr = getGrayscale(data, (y - 1) * width + (x + 1));
      const l = getGrayscale(data, y * width + (x - 1));
      const r = getGrayscale(data, y * width + (x + 1));
      const bl = getGrayscale(data, (y + 1) * width + (x - 1));
      const b = getGrayscale(data, (y + 1) * width + x);
      const br = getGrayscale(data, (y + 1) * width + (x + 1));
      
      // Sobel operator
      const gx = -tl + tr - 2 * l + 2 * r - bl + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      if (magnitude > threshold) {
        edges[y * width + x] = true;
      }
    }
  }
  
  return edges;
}

/**
 * Get grayscale value from RGBA data
 */
function getGrayscale(data: Uint8ClampedArray, pixelIndex: number): number {
  const idx = pixelIndex * 4;
  return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
}
