'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  return (
    <>
      {/* Main sphere */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[2, 4]} />
          <MeshDistortMaterial
            color="#3b9ca5"
            transparent
            opacity={0.15}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
            wireframe
          />
        </mesh>
      </Float>

      {/* Smaller orbiting shapes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[3, 1.5, -1]}>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color="#4f6fad" transparent opacity={0.3} wireframe />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[-3, -1, 1]}>
          <tetrahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#3b9ca5" transparent opacity={0.25} wireframe />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.7}>
        <mesh position={[-2, 2, -2]}>
          <dodecahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#6b8fb5" transparent opacity={0.2} wireframe />
        </mesh>
      </Float>

      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          color="#3b9ca5"
          transparent
          opacity={0.4}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-full" suppressHydrationWarning>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <pointLight position={[-5, -5, 5]} intensity={0.2} color="#3b9ca5" />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}
