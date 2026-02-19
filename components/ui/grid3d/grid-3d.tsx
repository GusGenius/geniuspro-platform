"use client";

import { useEffect, useRef } from "react";

interface Grid3DProps {
  className?: string;
  gridColor?: string;
  glowColor?: string;
  horizonPosition?: number; // 0-1, where the horizon sits (0.5 = middle)
}

export function Grid3D({
  className = "",
  gridColor = "rgba(100, 180, 255, 0.4)",
  glowColor = "rgba(100, 180, 255, 0.1)",
  horizonPosition = 0.45,
}: Grid3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Horizon line position
      const horizonY = height * horizonPosition;

      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGradient.addColorStop(0, "rgba(15, 23, 42, 1)"); // slate-900
      skyGradient.addColorStop(0.5, "rgba(30, 41, 59, 1)"); // slate-800
      skyGradient.addColorStop(1, "rgba(51, 65, 85, 0.8)"); // slate-700
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, horizonY);

      // Draw floor gradient
      const floorGradient = ctx.createLinearGradient(0, horizonY, 0, height);
      floorGradient.addColorStop(0, "rgba(30, 58, 95, 0.9)");
      floorGradient.addColorStop(0.3, "rgba(23, 37, 84, 0.95)");
      floorGradient.addColorStop(1, "rgba(15, 23, 42, 1)");
      ctx.fillStyle = floorGradient;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Glow at horizon
      const horizonGlow = ctx.createRadialGradient(
        width / 2, horizonY, 0,
        width / 2, horizonY, width * 0.6
      );
      horizonGlow.addColorStop(0, glowColor);
      horizonGlow.addColorStop(0.5, "rgba(100, 180, 255, 0.05)");
      horizonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      // Perspective grid settings
      const vanishingPointX = width / 2;
      const vanishingPointY = horizonY;
      const gridSpacing = 60;
      const numVerticalLines = 40;
      const numHorizontalLines = 30;

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;

      // Draw vertical lines (converging to vanishing point)
      for (let i = -numVerticalLines / 2; i <= numVerticalLines / 2; i++) {
        const bottomX = vanishingPointX + i * gridSpacing * 3;
        
        ctx.beginPath();
        ctx.moveTo(vanishingPointX, vanishingPointY);
        ctx.lineTo(bottomX, height);
        
        // Fade lines based on distance from center
        const distanceFromCenter = Math.abs(i) / (numVerticalLines / 2);
        ctx.globalAlpha = Math.max(0.1, 1 - distanceFromCenter * 0.8);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw horizontal lines with perspective (closer = more spaced, further = compressed)
      for (let i = 0; i < numHorizontalLines; i++) {
        // Use exponential spacing for perspective effect
        const t = (i + offset) / numHorizontalLines;
        const perspectiveT = Math.pow(t, 2); // Exponential for perspective
        const y = horizonY + perspectiveT * (height - horizonY);
        
        if (y > horizonY && y < height) {
          // Calculate the width at this y position (wider as we get closer)
          const widthAtY = (y - horizonY) / (height - horizonY);
          const lineWidth = width * (0.1 + widthAtY * 1.5);
          const startX = vanishingPointX - lineWidth / 2;
          const endX = vanishingPointX + lineWidth / 2;

          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(endX, y);
          
          // Fade lines based on distance from horizon
          const alpha = Math.min(1, perspectiveT * 2);
          ctx.globalAlpha = alpha * 0.6;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Animate the grid moving towards viewer
      offset += 0.003;
      if (offset >= 1) offset = 0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [gridColor, glowColor, horizonPosition]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export default Grid3D;
