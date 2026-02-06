"use client";

import dynamic from "next/dynamic";

// Dynamically import the 3D components to avoid SSR issues with React 19
const RobotGLBCanvas = dynamic(() => import("./RobotGLBCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-blue-400 animate-pulse">Loading 3D model...</div>
    </div>
  ),
});

interface RobotGLBProps {
  className?: string;
  interactive?: boolean;
  overheated?: boolean;
}

export function RobotGLB({ className = "", interactive = true, overheated = false }: RobotGLBProps) {
  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <RobotGLBCanvas interactive={interactive} overheated={overheated} />
    </div>
  );
}

export default RobotGLB;
