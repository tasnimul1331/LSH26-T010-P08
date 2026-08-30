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
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return positions;
  }, []);

  return (
    <>
      {/* Main Luxury Crystal Geometry */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[2.2, 4]} />
          <MeshDistortMaterial
            color="#B8860B"
            transparent
            opacity={0.22}
            distort={0.25}
            speed={1.5}
            roughness={0.15}
            metalness={0.9}
            wireframe
          />
        </mesh>
      </Float>

      {/* Orbiting Platinum & Sapphire Shapes */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh position={[3.2, 1.6, -1]}>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#1E3A8A" transparent opacity={0.35} wireframe />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[-3.2, -1.2, 1]}>
          <tetrahedronGeometry args={[0.65, 0]} />
          <meshStandardMaterial color="#C59B27" transparent opacity={0.3} wireframe />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={0.6} floatIntensity={0.7}>
        <mesh position={[-2.2, 2.2, -2]}>
          <dodecahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial color="#2B4C7E" transparent opacity={0.25} wireframe />
        </mesh>
      </Float>

      {/* Floating Golden Dust Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#B8860B"
          transparent
          opacity={0.45}
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
        camera={{ position: [0, 0, 6.5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 6, 5]} intensity={0.6} color="#FFF8E7" />
        <pointLight position={[-5, -4, 5]} intensity={0.4} color="#C59B27" />
        <pointLight position={[5, -5, 3]} intensity={0.3} color="#1E3A8A" />
        <FloatingGeometry />
      </Canvas>
    </div>
  );
}
