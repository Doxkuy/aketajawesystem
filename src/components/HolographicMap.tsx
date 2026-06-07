import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MapBlock } from '../types';

interface MapProps {
  blocks: MapBlock[];
  activeBlock: MapBlock | null;
  onBlockSelect: (block: MapBlock) => void;
}

// Helper to calculate distance from point P to line segment AB
function distanceToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return { dist: Math.sqrt((px - ax) ** 2 + (pz - az) ** 2), t: 0 };
  
  let t = ((px - ax) * dx + (pz - az) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t)); // clamp to segment
  
  const projX = ax + t * dx;
  const projZ = az + t * dz;
  
  return {
    dist: Math.sqrt((px - projX) ** 2 + (pz - projZ) ** 2),
    t: t // progress along segment (0 to 1)
  };
}

export const HolographicMap = ({ blocks, activeBlock, onBlockSelect }: MapProps) => {
  const mapGroupRef = useRef<THREE.Group>(null);
  
  // Halmahera Island coordinates markers in the procedural space
  const markerPositions = useMemo(() => ({
    'aketajawe': new THREE.Vector3(0.2, 0.18, 0.1), // Aketajawe Block (Center/East)
    'lolobata': new THREE.Vector3(0.05, 0.15, 0.85),  // Lolobata Block (North Arm)
  }), []);

  // Procedurally generate the wireframe Halmahera landmass grid
  const geometry = useMemo(() => {
    const size = 3.2;
    const segments = 45;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    
    // Rotate geometry to lay flat on XZ plane
    geo.rotateX(-Math.PI / 2);

    const positionAttribute = geo.attributes.position;
    
    // Line segment representations of the 4 arms of Halmahera Island (scaled and oriented)
    // Center of coordinate is (0,0)
    const arms = [
      { name: 'North', ax: 0.0, az: 0.0, bx: 0.1, bz: 1.3, maxThickness: 0.38, taper: 0.12 },
      { name: 'Northeast', ax: 0.0, az: 0.0, bx: 0.9, bz: 0.7, maxThickness: 0.28, taper: 0.08 },
      { name: 'Southeast', ax: 0.0, az: 0.0, bx: 0.8, bz: -0.6, maxThickness: 0.26, taper: 0.08 },
      { name: 'South', ax: 0.0, az: 0.0, bx: -0.25, bz: -1.2, maxThickness: 0.35, taper: 0.12 }
    ];

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const z = positionAttribute.getZ(i);

      let maxMask = 0;
      let heightVal = 0;

      // Check distance of the point (x,z) to each of the 4 arms
      arms.forEach((arm) => {
        const { dist, t } = distanceToSegment(x, z, arm.ax, arm.az, arm.bx, arm.bz);
        const currentThickness = arm.maxThickness - (t * arm.taper);
        
        if (dist < currentThickness) {
          // Point is inside the arm!
          // Compute mask value based on proximity to center line
          const armMask = 1.0 - (dist / currentThickness);
          if (armMask > maxMask) {
            maxMask = armMask;
            
            // Add procedural elevation (mountains) using trigonometric heights
            // North Maluku islands are volcanic and mountainous
            const mountainWave = Math.sin(t * Math.PI) * 0.25;
            const noiseDetail = (Math.sin(x * 12.0) * Math.cos(z * 12.0)) * 0.06;
            heightVal = (mountainWave + noiseDetail + 0.05) * armMask;
          }
        }
      });

      // Apply height displacement
      if (maxMask > 0) {
        positionAttribute.setY(i, heightVal);
      } else {
        // Flat ocean/grid floor, slightly depressed
        positionAttribute.setY(i, -0.05);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (mapGroupRef.current) {
      // Slow holographic rotation if no block is selected
      if (!activeBlock) {
        mapGroupRef.current.rotation.y = elapsed * 0.12;
      } else {
        // Slow sway around the active focus
        mapGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          mapGroupRef.current.rotation.y, 
          activeBlock.id === 'aketajawe' ? -0.4 : 0.3, 
          0.05
        );
      }
      // Bob up and down
      mapGroupRef.current.position.y = Math.sin(elapsed * 0.6) * 0.04;
    }
  });

  return (
    <group ref={mapGroupRef} position={[0, -0.2, 0]}>
      {/* 3D Wireframe Mesh (Hologram Landmass) */}
      <mesh geometry={geometry}>
        <meshBasicMaterial 
          color="#0b3a22" 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>

      {/* Grid Overlay showing scanlines on map */}
      <mesh geometry={geometry}>
        <meshBasicMaterial 
          color="#00f0ff" 
          wireframe={true} 
          transparent={true} 
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Interactive Pulsing Markers */}
      {blocks.map((block) => {
        const key = block.id as 'aketajawe' | 'lolobata';
        const pos = markerPositions[key];
        const isCurrent = activeBlock?.id === block.id;

        return (
          <group key={block.id} position={pos}>
            {/* Hologram Core Marker */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation();
                onBlockSelect(block);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial 
                color={isCurrent ? '#00f0ff' : '#39ff14'} 
                transparent={true}
                opacity={0.8}
              />
            </mesh>

            {/* Glowing Pulse Rings */}
            <PulseRing color={isCurrent ? '#00f0ff' : '#39ff14'} />

            {/* Float HUD Tag */}
            <Html
              distanceFactor={3.5}
              position={[0, 0.25, 0]}
              center
              style={{
                pointerEvents: 'none',
                fontFamily: 'var(--font-mono)',
                color: isCurrent ? '#00f0ff' : '#39ff14',
                fontSize: '8px',
                padding: '2px 6px',
                background: 'rgba(6, 9, 14, 0.85)',
                border: `1px solid ${isCurrent ? '#00f0ff' : '#39ff14'}`,
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                boxShadow: isCurrent ? '0 0 8px rgba(0, 240, 255, 0.4)' : 'none',
                letterSpacing: '1px'
              }}
            >
              <div>{block.name.toUpperCase()} BLOCK</div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};

// Sub-component for the glowing radar rings around the map markers
const PulseRing = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1.0 + (state.clock.getElapsedTime() * 1.5) % 2.5;
      meshRef.current.scale.set(scale, scale, scale);
      
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.mapLinear(scale, 1.0, 3.5, 0.6, 0.0);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.09, 0.12, 32]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        depthWrite={false}
      />
    </mesh>
  );
};
