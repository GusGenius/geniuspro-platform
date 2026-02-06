"use client";

import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Suppress texture loading errors for GLB with invalid absolute paths
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  const msg = String(args[0] || '');
  // Suppress Three.js texture loading errors for absolute Windows paths
  if (msg.includes('GLTFLoader') && msg.includes('texture')) return;
  if (msg.includes('C:\\') || msg.includes('C:/')) return;
  if (msg.includes('blenderkit_data')) return;
  if (msg.includes('404') && msg.includes('Texture')) return;
  originalConsoleError.apply(console, args);
};

console.warn = (...args: unknown[]) => {
  const msg = String(args[0] || '');
  if (msg.includes('GLTFLoader') && msg.includes('texture')) return;
  if (msg.includes('C:\\') || msg.includes('C:/')) return;
  if (msg.includes('blenderkit_data')) return;
  originalConsoleWarn.apply(console, args);
};

// Create a custom loading manager that silently handles texture errors
const silentLoadingManager = new THREE.LoadingManager();
silentLoadingManager.onError = () => {
  // Silently swallow texture loading errors
};

// Custom GLTF loader that ignores texture errors
const gltfLoader = new GLTFLoader(silentLoadingManager);

// Override the texture loader's load method to catch 404s
const originalTextureLoad = THREE.TextureLoader.prototype.load;
(THREE.TextureLoader.prototype.load as any) = function(this: THREE.TextureLoader, url: string, onLoad?: ((data: THREE.Texture) => void) | undefined, onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined, onError?: ((err: unknown) => void) | undefined): THREE.Texture {
  // If the URL contains absolute Windows paths, skip loading
  if (url && (url.includes('C:\\') || url.includes('C:/') || url.includes('blenderkit_data'))) {
    // Return a placeholder texture instead of attempting to load
    const texture = new THREE.Texture();
    if (onLoad) setTimeout(() => onLoad(texture), 0);
    return texture;
  }
  return originalTextureLoad.call(this, url, onLoad, onProgress, onError);
};

interface RobotGLBCanvasProps {
  interactive?: boolean;
  overheated?: boolean;
}

interface GLTFData {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

function RobotModel({ mousePos, overheated }: { mousePos: { x: number; y: number }; overheated?: boolean }) {
  const [gltfData, setGltfData] = useState<GLTFData | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Load GLTF with custom silent loader
  useEffect(() => {
    gltfLoader.load(
      "/Project X2blend2.glb",
      (loadedGltf) => {
        setGltfData({
          scene: loadedGltf.scene,
          animations: loadedGltf.animations
        });
      },
      undefined, // onProgress
      () => {
        // Silently handle errors
      }
    );
  }, []);
  
  const positionRef = useRef({ x: 0, y: 0, z: 0 });
  const rotationRef = useRef({ y: 0 });
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const walkCycleRef = useRef(0);
  const prevPosRef = useRef({ x: 0, z: 0 });
  // Reference to the Quad container (holds all legs)
  const quadRef = useRef<THREE.Object3D | null>(null);
  const quadInitialRotation = useRef<THREE.Euler | null>(null);

  // Find the Quad container and apply colors to the model
  useEffect(() => {
    if (gltfData?.scene) {
      
      // Create materials - red when overheated, normal colors otherwise
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0x8b0000 : 0x2d4a5a, // Dark red when overheated, dark teal/blue-gray normally
        metalness: 0.6,
        roughness: 0.35,
        emissive: overheated ? 0xff0000 : 0x000000,
        emissiveIntensity: overheated ? 0.3 : 0,
      });
      
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0x5a0000 : 0x1a2a32, // Darker red when overheated, darker blue-gray normally
        metalness: 0.5,
        roughness: 0.4,
        emissive: overheated ? 0xcc0000 : 0x000000,
        emissiveIntensity: overheated ? 0.2 : 0,
      });
      
      const tealMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0xcc0000 : 0x3a6a7a, // Bright red when overheated, lighter teal normally
        metalness: 0.55,
        roughness: 0.4,
        emissive: overheated ? 0xff3333 : 0x000000,
        emissiveIntensity: overheated ? 0.4 : 0,
      });
      
      const orangeGlowMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0xff0000 : 0xff8c00, // Bright red when overheated, orange normally
        metalness: 0.3,
        roughness: 0.2,
        emissive: overheated ? 0xff0000 : 0xff6600,
        emissiveIntensity: overheated ? 1.2 : 0.9,
      });
      
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0x330000 : 0x0a1a2a, // Dark red when overheated, dark screen normally
        metalness: 0.1,
        roughness: 0.1,
        emissive: overheated ? 0xff0000 : 0x00cccc,
        emissiveIntensity: overheated ? 0.8 : 0.4,
      });
      
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: overheated ? 0xff0000 : 0xffaa00, // Bright red when overheated, orange/yellow normally
        metalness: 0.2,
        roughness: 0.1,
        emissive: overheated ? 0xff0000 : 0xffaa00,
        emissiveIntensity: overheated ? 1.5 : 1.0,
      });
      
      gltfData.scene.traverse((child) => {
        const name = child.name.toLowerCase();
        
        // Find the Quad container
        if (name === 'quad' || name.includes('quad')) {
          quadRef.current = child;
          quadInitialRotation.current = child.rotation.clone();
        }
        
        // Apply materials to meshes based on part names
        if (child instanceof THREE.Mesh) {
          // Determine which material to use based on part name
          if (name.includes('screen') || name.includes('display') || name.includes('monitor')) {
            child.material = screenMaterial;
          } else if (name.includes('eye') || name.includes('light') || name.includes('glow') || name.includes('lamp')) {
            child.material = eyeMaterial;
          } else if (name.includes('trim') || name.includes('stripe') || name.includes('accent') || name.includes('ring')) {
            child.material = orangeGlowMaterial;
          } else if (name.includes('leg') || name.includes('arm') || name.includes('limb')) {
            child.material = tealMaterial;
          } else if (name.includes('joint') || name.includes('detail') || name.includes('panel')) {
            child.material = darkMaterial;
          } else {
            // Default to body material for main parts
            child.material = bodyMaterial;
          }
          
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [gltfData?.scene, overheated]);

  // Set up animation mixer for any embedded animations
  useEffect(() => {
    if (gltfData?.animations && gltfData.animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(gltfData.scene);
      gltfData.animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        action.play();
      });
    }
  }, [gltfData]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Target position based on mouse - wide range to reach screen edges
    const targetX = (mousePos.x - 0.5) * 20; // -10 to +10 for full width
    const targetZ = -8 + (mousePos.y * 8);

    // Smooth movement
    positionRef.current.x += (targetX - positionRef.current.x) * 0.05;
    positionRef.current.z += (targetZ - positionRef.current.z) * 0.05;

    // Calculate movement speed
    const dx = positionRef.current.x - prevPosRef.current.x;
    const dz = positionRef.current.z - prevPosRef.current.z;
    const speed = Math.sqrt(dx * dx + dz * dz);
    prevPosRef.current.x = positionRef.current.x;
    prevPosRef.current.z = positionRef.current.z;

    // Walking animation - bob up/down and tilt side to side
    if (speed > 0.01) {
      walkCycleRef.current += speed * 5; // Walk cycle speed (slower)
      
      // Bob up and down (subtle)
      const bobAmount = Math.sin(walkCycleRef.current) * 0.01;
      groupRef.current.position.y = 0 + bobAmount;
      
      // Tilt side to side (simulates weight shifting between legs)
      const tiltAmount = Math.sin(walkCycleRef.current * 0.5) * 0.05;
      groupRef.current.rotation.z = tiltAmount;
      
      // Slight forward/back pitch when moving
      const pitchAmount = Math.sin(walkCycleRef.current) * 0.02;
      groupRef.current.rotation.x = pitchAmount;

      // Animate the QUAD container - all legs move together as one unit
      if (quadRef.current && quadInitialRotation.current) {
        // Simple walking motion - rotate the whole Quad slightly
        const legSwing = Math.sin(walkCycleRef.current) * 0.15;
        quadRef.current.rotation.x = quadInitialRotation.current.x + legSwing;
      }
    } else {
      // Idle - gentle breathing motion
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.003;
      groupRef.current.position.y = 0 + breathe;
      groupRef.current.rotation.z = 0;
      groupRef.current.rotation.x = 0;
      
      // Reset Quad to initial rotation when idle (smooth return)
      if (quadRef.current && quadInitialRotation.current) {
        quadRef.current.rotation.x += (quadInitialRotation.current.x - quadRef.current.rotation.x) * 0.08;
      }
    }

    // Calculate rotation to face movement direction
    if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
      const targetRotY = Math.atan2(dx, dz);
      rotationRef.current.y += (targetRotY - rotationRef.current.y) * 0.1;
    }

    groupRef.current.position.x = positionRef.current.x;
    groupRef.current.position.z = positionRef.current.z;
    groupRef.current.rotation.y = rotationRef.current.y;

    // Scale based on depth - smaller robot
    const depthScale = 0.003 + (mousePos.y * 0.003); // 0.3% to 0.6%
    groupRef.current.scale.setScalar(depthScale);
  });

  // Center the model based on its bounding box
  useEffect(() => {
    if (gltfData?.scene) {
      const box = new THREE.Box3().setFromObject(gltfData.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltfData.scene.position.sub(center);
    }
  }, [gltfData?.scene]);

  // Don't render until GLTF is loaded
  if (!gltfData?.scene) {
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, -3]} scale={[0.005, 0.005, 0.005]}>
      <primitive object={gltfData.scene} />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#64b4ff" wireframe transparent opacity={0.5} />
    </mesh>
  );
}

export default function RobotGLBCanvas({ interactive = true, overheated = false }: RobotGLBCanvasProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [interactive]);

  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 5, 8], fov: 50 }}
      style={{ background: "transparent" }}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} rotation={[-0.4, 0, 0]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[-5, 5, -5]} intensity={0.6} />

      <Suspense fallback={<LoadingFallback />}>
        <RobotModel mousePos={mousePos} overheated={overheated} />
      </Suspense>

      {!interactive && <OrbitControls enableZoom={false} enablePan={false} />}
    </Canvas>
  );
}
