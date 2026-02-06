"use client";

import { useEffect, useRef, useCallback } from "react";

interface LegConfig {
  attachX: number;
  attachY: number;
  restX: number;
  restZ: number;
  phase: number;
  isArm: boolean;
}

interface SpiderBotProps {
  className?: string;
  color?: string;
  glowColor?: string;
  interactive?: boolean;
  isPlaying?: boolean;
}

// Constants
const HORIZON_Y = 0.4; // Where the horizon is (40% from top)
const MIN_SCALE = 0.2; // Scale at horizon
const MAX_SCALE = 0.8; // Scale at bottom of screen
const BASE_ROBOT_SIZE = 120; // Base size in pixels at scale 1

export function SpiderBot({
  className = "",
  color = "rgba(100, 180, 255, 0.8)",
  glowColor = "rgba(100, 180, 255, 0.3)",
  interactive = false,
  isPlaying = false,
}: SpiderBotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const sizeRef = useRef({ width: 800, height: 600 });
  const mouseRef = useRef({ x: 0.5, y: 0.6 }); // Normalized coordinates
  const robotRef = useRef({
    x: 0.5, // Normalized 0-1 (left to right)
    z: 0.5, // Normalized: 0 = horizon, 1 = bottom of screen
    targetX: 0.5,
    targetZ: 0.5,
    velocityX: 0,
    velocityZ: 0,
    walkCycle: 0,
    isWalking: false,
    facing: 1, // 1 = right, -1 = left
    screenTilt: 0,
    legPositions: Array(6).fill(null).map(() => ({ x: 0, y: 0 })),
    initialized: false,
  });

  // Convert normalized world position to screen position with perspective
  const worldToScreen = useCallback((normX: number, normZ: number, width: number, height: number) => {
    const horizonY = height * HORIZON_Y;
    const bottomY = height;
    
    // Screen Y based on depth (Z)
    const screenY = horizonY + normZ * (bottomY - horizonY);
    
    // X converges toward center as we approach horizon
    const centerX = width / 2;
    const perspectiveFactor = 0.2 + normZ * 0.8;
    const screenX = centerX + (normX - 0.5) * width * perspectiveFactor;
    
    // Scale based on depth
    const scale = MIN_SCALE + normZ * (MAX_SCALE - MIN_SCALE);
    
    return { screenX, screenY, scale };
  }, []);

  // Convert screen position to normalized world position
  const screenToWorld = useCallback((screenX: number, screenY: number, width: number, height: number) => {
    const horizonY = height * HORIZON_Y;
    const bottomY = height;
    
    // Clamp screenY between horizon and bottom
    const clampedY = Math.max(horizonY + 20, Math.min(bottomY - 20, screenY));
    
    // Calculate normalized Z from screen Y
    const normZ = (clampedY - horizonY) / (bottomY - horizonY);
    
    // Calculate normalized X accounting for perspective
    const centerX = width / 2;
    const perspectiveFactor = 0.2 + normZ * 0.8;
    const normX = 0.5 + (screenX - centerX) / (width * perspectiveFactor);
    
    return { normX: Math.max(0.05, Math.min(0.95, normX)), normZ: Math.max(0.05, Math.min(0.95, normZ)) };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle resize
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      sizeRef.current = { width, height };
      
      // Initialize robot position on first load
      if (!robotRef.current.initialized) {
        robotRef.current.x = 0.5;
        robotRef.current.z = 0.5;
        robotRef.current.targetX = 0.5;
        robotRef.current.targetZ = 0.5;
        robotRef.current.initialized = true;
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    // Leg configuration (relative to body center, normalized)
    const legConfigs: LegConfig[] = [
      // Back legs
      { attachX: -0.35, attachY: 0.12, restX: -0.7, restZ: 0.08, phase: 0, isArm: false },
      { attachX: 0.35, attachY: 0.12, restX: 0.7, restZ: 0.08, phase: 0.5, isArm: false },
      // Front legs
      { attachX: -0.45, attachY: 0.22, restX: -0.8, restZ: -0.12, phase: 0.5, isArm: false },
      { attachX: 0.45, attachY: 0.22, restX: 0.8, restZ: -0.12, phase: 0, isArm: false },
      // Center arms
      { attachX: -0.12, attachY: 0.28, restX: -0.25, restZ: -0.18, phase: 0.25, isArm: true },
      { attachX: 0.12, attachY: 0.28, restX: 0.25, restZ: -0.18, phase: 0.75, isArm: true },
    ];

    // Drawing helpers
    const drawLine = (x1: number, y1: number, x2: number, y2: number, lineWidth = 2) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = lineWidth + 2;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const drawEllipse = (x: number, y: number, rx: number, ry: number) => {
      if (rx < 1 || ry < 1) return;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };

    const drawJoint = (x: number, y: number, radius: number) => {
      if (radius < 0.5) return;
      ctx.beginPath();
      ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    // Draw leg with IK
    const drawLeg = (
      hipX: number, hipY: number,
      footX: number, footY: number,
      baseScale: number,
      isArm: boolean
    ) => {
      const s = baseScale * BASE_ROBOT_SIZE;
      const thighLen = (isArm ? 0.22 : 0.32) * s;
      const shinLen = (isArm ? 0.2 : 0.28) * s;
      
      const dx = footX - hipX;
      const dy = footY - hipY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxReach = thighLen + shinLen - 2;
      const minReach = Math.abs(thighLen - shinLen) + 2;
      const clampedDist = Math.max(minReach, Math.min(maxReach, dist));
      
      const cosAngle = (thighLen * thighLen + clampedDist * clampedDist - shinLen * shinLen) 
                       / (2 * thighLen * clampedDist);
      const kneeAngle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
      const angleToFoot = Math.atan2(dy, dx);
      
      const kneeX = hipX + Math.cos(angleToFoot - kneeAngle) * thighLen;
      const kneeY = hipY + Math.sin(angleToFoot - kneeAngle) * thighLen;
      
      // Draw thigh
      drawLine(hipX, hipY, kneeX, kneeY, (isArm ? 1.8 : 2.2) * baseScale);
      
      // Thigh armor
      const midX = (hipX + kneeX) / 2;
      const midY = (hipY + kneeY) / 2;
      const angle = Math.atan2(kneeY - hipY, kneeX - hipX);
      
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      const boxW = (isArm ? 0.14 : 0.18) * s;
      const boxH = (isArm ? 0.07 : 0.085) * s;
      ctx.beginPath();
      ctx.rect(-boxW/2, -boxH/2, boxW, boxH);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      
      // Draw shin
      drawLine(kneeX, kneeY, footX, footY, (isArm ? 1.4 : 1.8) * baseScale);
      
      // Foot pad
      const footPadW = (isArm ? 0.05 : 0.065) * s;
      drawLine(footX - footPadW, footY, footX + footPadW, footY, 2 * baseScale);
      
      // Joints
      drawJoint(hipX, hipY, (isArm ? 3.5 : 4.5) * baseScale);
      drawJoint(kneeX, kneeY, (isArm ? 2.8 : 3.5) * baseScale);
      drawJoint(footX, footY, (isArm ? 2 : 2.5) * baseScale);
    };

    // Draw robot body
    const drawBody = (screenX: number, screenY: number, scale: number, tilt: number) => {
      const s = scale * BASE_ROBOT_SIZE;
      
      // Hip section
      const hipY = screenY + 0.15 * s;
      drawEllipse(screenX, hipY, 0.3 * s, 0.1 * s);
      drawLine(screenX - 0.18 * s, hipY, screenX + 0.18 * s, hipY, 0.8 * scale);
      
      // Connector
      drawLine(screenX, screenY + 0.04 * s, screenX, hipY - 0.05 * s, 1.8 * scale);
      
      // Main body disc
      drawEllipse(screenX, screenY, 0.45 * s, 0.16 * s);
      drawEllipse(screenX, screenY - 0.05 * s, 0.38 * s, 0.12 * s);
      
      // Dome
      ctx.beginPath();
      ctx.arc(screenX, screenY - 0.08 * s, 0.25 * s, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Eyes
      drawJoint(screenX - 0.15 * s, screenY - 0.03 * s, 2.5 * scale);
      drawJoint(screenX + 0.15 * s, screenY - 0.03 * s, 2.5 * scale);
      
      // Keyboard
      const kbY = screenY - 0.1 * s;
      const kbW = 0.24 * s;
      const kbH = 0.12 * s;
      ctx.beginPath();
      ctx.rect(screenX - kbW/2, kbY - kbH/2, kbW, kbH);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      
      // Keys
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          ctx.beginPath();
          ctx.rect(
            screenX - kbW/2 + 0.03*s + col * 0.05*s,
            kbY - kbH/2 + 0.025*s + row * 0.035*s,
            0.035*s, 0.025*s
          );
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
      
      // Monitor
      const tiltRad = tilt * Math.PI / 180;
      const monitorY = screenY - 0.42 * s;
      const monitorX = screenX + Math.sin(tiltRad) * 0.08 * s;
      const monitorW = 0.4 * s;
      const monitorH = 0.26 * s;
      
      // Support arm
      ctx.beginPath();
      ctx.moveTo(screenX, screenY - 0.15 * s);
      ctx.quadraticCurveTo(
        screenX + Math.sin(tiltRad) * 0.06 * s,
        screenY - 0.28 * s,
        monitorX,
        monitorY + monitorH/2
      );
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Monitor frame
      ctx.beginPath();
      ctx.moveTo(monitorX - monitorW/2, monitorY + monitorH/2);
      ctx.quadraticCurveTo(monitorX - monitorW/2 - 0.04*s, monitorY, monitorX - monitorW/2, monitorY - monitorH/2);
      ctx.lineTo(monitorX + monitorW/2, monitorY - monitorH/2);
      ctx.quadraticCurveTo(monitorX + monitorW/2 + 0.04*s, monitorY, monitorX + monitorW/2, monitorY + monitorH/2);
      ctx.closePath();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      // Inner screen
      ctx.beginPath();
      ctx.moveTo(monitorX - monitorW/2 + 0.04*s, monitorY + monitorH/2 - 0.03*s);
      ctx.quadraticCurveTo(monitorX - monitorW/2 + 0.01*s, monitorY, monitorX - monitorW/2 + 0.04*s, monitorY - monitorH/2 + 0.03*s);
      ctx.lineTo(monitorX + monitorW/2 - 0.04*s, monitorY - monitorH/2 + 0.03*s);
      ctx.quadraticCurveTo(monitorX + monitorW/2 - 0.01*s, monitorY, monitorX + monitorW/2 - 0.04*s, monitorY + monitorH/2 - 0.03*s);
      ctx.closePath();
      ctx.strokeStyle = "rgba(100, 200, 255, 0.35)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      
      // Cable
      ctx.beginPath();
      ctx.moveTo(screenX + 0.16 * s, screenY - 0.12 * s);
      ctx.bezierCurveTo(
        screenX + 0.22 * s, screenY - 0.25 * s,
        monitorX + 0.2 * s, monitorY + 0.04 * s,
        monitorX + monitorW/2 - 0.05*s, monitorY
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      
      // Speaker dots
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(screenX - 0.05*s + i * 0.035*s, screenY + 0.06*s, 1 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    };

    // Animation loop
    const animate = () => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      
      const robot = robotRef.current;
      const mouse = mouseRef.current;
      
      if (isPlaying) {
        // Target from mouse (already normalized)
        robot.targetX = Math.max(0.08, Math.min(0.92, mouse.x));
        robot.targetZ = Math.max(0.08, Math.min(0.92, mouse.y));
        
        // Movement physics
        const dx = robot.targetX - robot.x;
        const dz = robot.targetZ - robot.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        // Speed varies with depth (slower when far)
        const baseSpeed = 0.008 + robot.z * 0.012;
        
        if (dist > 0.01) {
          robot.isWalking = true;
          robot.velocityX += dx * 0.08;
          robot.velocityZ += dz * 0.08;
          robot.walkCycle += 0.12 + robot.z * 0.08;
          
          if (Math.abs(dx) > 0.005) {
            robot.facing = dx > 0 ? 1 : -1;
          }
          
          robot.screenTilt = Math.max(-15, Math.min(15, dx * 150));
        } else {
          robot.isWalking = false;
          robot.screenTilt *= 0.92;
        }
        
        // Apply velocity with damping
        robot.velocityX *= 0.85;
        robot.velocityZ *= 0.85;
        robot.x += robot.velocityX * baseSpeed * 8;
        robot.z += robot.velocityZ * baseSpeed * 8;
        
        // Clamp position
        robot.x = Math.max(0.08, Math.min(0.92, robot.x));
        robot.z = Math.max(0.08, Math.min(0.92, robot.z));
      }
      
      // Get screen position
      const { screenX, screenY, scale } = worldToScreen(robot.x, robot.z, width, height);
      const s = scale * BASE_ROBOT_SIZE;
      
      // Ground Y for feet
      const groundY = screenY + 0.3 * s;
      
      // Draw legs
      legConfigs.forEach((leg, i) => {
        const hipScreenX = screenX + leg.attachX * s;
        const hipScreenY = screenY + leg.attachY * s;
        
        let footRestX = screenX + leg.restX * s;
        let footRestY = groundY;
        
        if (robot.isWalking) {
          const phase = (robot.walkCycle + leg.phase * Math.PI * 2) % (Math.PI * 2);
          const stepping = Math.sin(phase) > 0;
          
          const stepLength = 0.12 * s * robot.facing;
          const stepHeight = stepping ? Math.sin(phase) * 0.1 * s : 0;
          
          footRestX += Math.sin(phase) * stepLength;
          footRestY = groundY - stepHeight;
        }
        
        // Smooth interpolation
        const legPos = robot.legPositions[i];
        legPos.x += (footRestX - legPos.x) * 0.25;
        legPos.y += (footRestY - legPos.y) * 0.35;
        legPos.y = Math.min(legPos.y, groundY);
        
        drawLeg(hipScreenX, hipScreenY, legPos.x, legPos.y, scale, leg.isArm);
      });
      
      // Draw body
      drawBody(screenX, screenY, scale, robot.screenTilt);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", updateSize);
    };
  }, [color, glowColor, isPlaying, worldToScreen, screenToWorld]);

  // Mouse tracking
  useEffect(() => {
    if (!interactive && !isPlaying) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const { width, height } = sizeRef.current;
      
      // Convert to normalized coordinates
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      
      // Convert screen position to world position (normalized)
      const { normX, normZ } = screenToWorld(screenX, screenY, width, height);
      
      mouseRef.current = { x: normX, y: normZ };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive, isPlaying, screenToWorld]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default SpiderBot;
