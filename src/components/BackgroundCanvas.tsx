import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleBird } from './ParticleBird';
import { BiodiversityCarousel } from './BiodiversityCarousel';
import { HolographicMap } from './HolographicMap';
import type { BiodiversityItem, MapBlock } from '../types';


interface CanvasProps {
  currentSection: number;
  biodiversityItems: BiodiversityItem[];
  carouselActiveIndex: number;
  setCarouselActiveIndex: (index: number) => void;
  onCarouselDrag: (isDragging: boolean) => void;
  isCarouselDragging: boolean;
  mapBlocks: MapBlock[];
  activeMapBlock: MapBlock | null;
  onBlockSelect: (block: MapBlock) => void;
}

// 1. Camera Controller to interpolate positions across sections and interactive selections
const CameraController = ({ 
  currentSection, 
  activeMapBlock 
}: { 
  currentSection: number; 
  activeMapBlock: MapBlock | null;
}) => {
  const { camera } = useThree();
  
  // Define camera targets and lookAt targets for each section
  const sectionPositions = useMemo(() => [
    new THREE.Vector3(0, 0, 3.2),        // Hero: close, centered on bird
    new THREE.Vector3(0, 0.4, 5.0),      // Biodiversity: further back to see carousel
    new THREE.Vector3(0, 1.8, 2.5),      // Map default: elevated looking down
    new THREE.Vector3(0, 2.5, 3.5)       // Conservation Lab: high perspective
  ], []);

  const sectionTargets = useMemo(() => [
    new THREE.Vector3(0, 0, 0),          // Hero target
    new THREE.Vector3(0, 0, 0),          // Carousel target
    new THREE.Vector3(0, -0.25, 0),      // Map target
    new THREE.Vector3(0, 0, -2.5)        // Lab target: shifted forward
  ], []);

  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_state) => {
    let targetPos = sectionPositions[currentSection] || sectionPositions[0];
    let targetLookAt = sectionTargets[currentSection] || sectionTargets[0];

    // If we are on the Map section (Section 2) and have an active block selected, zoom the camera in
    if (currentSection === 2 && activeMapBlock) {
      if (activeMapBlock.id === 'aketajawe') {
        // Zoom closely into Aketajawe Block (East-ish)
        targetPos = new THREE.Vector3(0.5, 0.8, 1.25);
        targetLookAt = new THREE.Vector3(0.2, 0.18, 0.1);
      } else if (activeMapBlock.id === 'lolobata') {
        // Zoom closely into Lolobata Block (North Arm)
        targetPos = new THREE.Vector3(0.2, 0.8, 2.0);
        targetLookAt = new THREE.Vector3(0.05, 0.15, 0.85);
      }
    }

    // Lerp camera position
    camera.position.lerp(targetPos, 0.06);

    // Lerp lookAt target
    currentLookAt.current.lerp(targetLookAt, 0.06);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

// 2. Fireflies Particle System (Bioluminescent forest bugs)
const Fireflies = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 150;

  const [positions, velocities, randomOffsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const offset = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across a 10x8x10 box
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8 + 1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      // Small velocities
      vel[i * 3] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

      offset[i] = Math.random() * 100;
    }
    return [pos, vel, offset];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      // Add a slow harmonic drift (sin/cos sway)
      const off = randomOffsets[i];
      x += Math.sin(time * 0.5 + off) * 0.005 + velocities[i * 3] * 0.1;
      y += Math.cos(time * 0.3 + off) * 0.006 + velocities[i * 3 + 1] * 0.1;
      z += Math.sin(time * 0.4 + off) * 0.005 + velocities[i * 3 + 2] * 0.1;

      // Wrap around bounds
      if (Math.abs(x) > 6) x = (Math.random() - 0.5) * 8;
      if (y < -3 || y > 5) y = (Math.random() - 0.5) * 4 + 1;
      if (Math.abs(z) > 6) z = (Math.random() - 0.5) * 8;

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#39ff14"
        size={0.05}
        transparent={true}
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3. Cyber-Forest Canopy Grid (rendered underneath the Conservation Lab section)
const CyberCanopy = ({ currentSection }: { currentSection: number }) => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Wave the grid slightly based on wind
      const elapsed = state.clock.getElapsedTime();
      gridRef.current.position.y = -1.2 + Math.sin(elapsed * 0.8) * 0.04;
      gridRef.current.rotation.y = elapsed * 0.02;
    }
  });

  if (currentSection !== 3) return null;

  return (
    <group position={[0, -1.2, -2.5]}>
      {/* Dual green concentric wireframe grids representing forest soil structures */}
      <gridHelper
        ref={gridRef}
        args={[15, 30, '#144f31', '#0b3a22']}
        position={[0, 0, 0]}
      />
      {/* Floating neon vertical lines representing cyber-tree trunks */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = Math.sin(i * 2.3) * 6;
        const z = Math.cos(i * 1.7) * 6 - 2;
        const height = 3 + Math.random() * 4;

        return (
          <group key={i} position={[x, height / 2, z]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, height, 8]} />
              <meshBasicMaterial 
                color="#00f0ff" 
                transparent={true} 
                opacity={0.15} 
                wireframe 
              />
            </mesh>
            {/* Crown nodes */}
            <mesh position={[0, height / 2, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color="#39ff14" transparent opacity={0.6} wireframe />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Main Canvas container component
export const BackgroundCanvas = ({
  currentSection,
  biodiversityItems,
  carouselActiveIndex,
  setCarouselActiveIndex,
  onCarouselDrag,
  isCarouselDragging,
  mapBlocks,
  activeMapBlock,
  onBlockSelect,
}: CanvasProps) => {
  return (
    <div className="canvas-wrapper">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 60, near: 0.1, far: 25 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(new THREE.Color('#06090e'), 1);
          scene.fog = new THREE.FogExp2('#06090e', 0.15);
        }}
      >
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 4, 3]} intensity={0.8} />
        <pointLight position={[-3, 2, -2]} intensity={0.4} color="#00f0ff" />
        <pointLight position={[3, -2, 2]} intensity={0.5} color="#39ff14" />

        {/* Global Particles */}
        <Fireflies />

        {/* Section 0: Hero Elements */}
        {currentSection === 0 && <ParticleBird />}

        {/* Section 1: Biodiversity Elements */}
        {currentSection === 1 && (
          <group position={[0, -0.1, 0]}>
            <BiodiversityCarousel
              items={biodiversityItems}
              activeIndex={carouselActiveIndex}
              setActiveIndex={setCarouselActiveIndex}
              onDragStateChange={onCarouselDrag}
            />
            {/* Soft ground reflection ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
              <ringGeometry args={[3.2, 3.5, 64]} />
              <meshBasicMaterial 
                color={biodiversityItems[carouselActiveIndex].glowColor} 
                transparent 
                opacity={isCarouselDragging ? 0.35 : 0.15} 
                depthWrite={false}
              />
            </mesh>
          </group>
        )}

        {/* Section 2: Map Elements */}
        {currentSection === 2 && (
          <HolographicMap
            blocks={mapBlocks}
            activeBlock={activeMapBlock}
            onBlockSelect={onBlockSelect}
          />
        )}

        {/* Section 3: Conservation Lab Elements */}
        <CyberCanopy currentSection={currentSection} />

        {/* Camera Control interpolation logic */}
        <CameraController 
          currentSection={currentSection} 
          activeMapBlock={activeMapBlock}
        />
      </Canvas>
    </div>
  );
};
export default BackgroundCanvas;
