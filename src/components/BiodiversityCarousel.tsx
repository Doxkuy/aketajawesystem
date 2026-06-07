import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BiodiversityItem } from '../types';

interface CarouselProps {
  items: BiodiversityItem[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onDragStateChange: (isDragging: boolean) => void;
}

export const BiodiversityCarousel = ({ items, activeIndex, setActiveIndex, onDragStateChange }: CarouselProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragSpeed = useRef(0);
  const lastTime = useRef(0);
  const lastX = useRef(0);

  const radius = 3.5; // Radius of card circle
  const count = items.length;

  // Handle pointer down
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    onDragStateChange(true);
    document.body.style.cursor = 'grabbing';
    startX.current = e.clientX || (e.touches && e.touches[0].clientX);
    lastX.current = startX.current;
    lastTime.current = performance.now();
  };

  // Handle pointer move
  const handlePointerMove = (e: any) => {
    if (!isDragging.current) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = clientX - lastX.current;
    
    // Convert mouse delta to rotation
    targetRotation.current += deltaX * 0.007;

    // Calculate drag speed for screen tearing distortion
    const now = performance.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      dragSpeed.current = Math.abs(deltaX) / dt;
    }

    lastX.current = clientX;
    lastTime.current = now;
  };

  // Handle pointer up
  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    onDragStateChange(false);
    document.body.style.cursor = 'auto';
    
    // Snap to nearest card
    const angleStep = (Math.PI * 2) / count;
    // Calculate which card is closest to the front (angle = 0)
    // Remember rotation direction: negative targetRotation rotates counter-clockwise
    const normalizedRotation = targetRotation.current % (Math.PI * 2);
    const snapIndex = Math.round(-normalizedRotation / angleStep) % count;
    
    // Smooth snap rotation
    const finalIndex = (snapIndex + count) % count;
    targetRotation.current = -finalIndex * angleStep;
    setActiveIndex(finalIndex);
    dragSpeed.current = 0;
  };

  useEffect(() => {
    // Add global pointer move/up handlers to allow dragging outside canvas elements
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  useFrame((_state) => {
    // Smooth rotation interpolation
    currentRotation.current = THREE.MathUtils.lerp(currentRotation.current, targetRotation.current, 0.1);
    
    if (groupRef.current) {
      groupRef.current.rotation.y = currentRotation.current;
      
      // Face cards towards screen
      groupRef.current.children.forEach((child, i) => {
        const angle = (i * Math.PI * 2) / count;
        const cardWorldRot = currentRotation.current + angle;
        
        // Dynamic scale based on distance to front (close cards are larger)
        const cosValue = Math.cos(cardWorldRot);
        const scaleVal = THREE.MathUtils.mapLinear(cosValue, -1, 1, 0.65, 1.15);
        child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, scaleVal, 0.15));
        
        // Shift card opacity/glow based on position
        const mesh = child.children[0] as THREE.Mesh;
        if (mesh && mesh.material) {
          const mat = mesh.material as THREE.MeshPhysicalMaterial;
          mat.opacity = THREE.MathUtils.mapLinear(cosValue, -1, 1, 0.25, 0.85);
          mat.emissiveIntensity = THREE.MathUtils.mapLinear(cosValue, -1, 1, 0.0, 0.6);
        }
      });
    }
    
    // Slow drift when idle
    if (!isDragging.current) {
      // Let it slowly bob up and down
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(_state.clock.getElapsedTime() * 0.8) * 0.05;
      }
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerDown={handlePointerDown}
    >
      {items.map((item, i) => {
        const angle = (i * Math.PI * 2) / count;
        // Position card in a circle
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        const isCurrent = i === activeIndex;

        return (
          <group 
            key={item.id} 
            position={[x, 0, z]} 
            rotation={[0, angle, 0]}
          >
            {/* 3D Glass Card Backing */}
            <mesh castShadow receiveShadow>
              <planeGeometry args={[2.2, 3.2]} />
              <meshPhysicalMaterial
                roughness={0.12}
                transmission={0.88}
                thickness={0.15}
                ior={1.45}
                color={item.glowColor}
                opacity={isCurrent ? 0.9 : 0.4}
                transparent={true}
                depthWrite={false}
                clearcoat={1.0}
                emissive={new THREE.Color(item.glowColor)}
                emissiveIntensity={isCurrent ? 0.4 : 0.1}
              />
            </mesh>

            {/* Glowing Wireframe Frame */}
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(2.2, 3.2)]} />
              <lineBasicMaterial 
                color={new THREE.Color(item.glowColor)} 
                linewidth={isCurrent ? 2 : 1}
                transparent={true}
                opacity={isCurrent ? 0.7 : 0.2}
              />
            </lineSegments>

            {/* HTML Card Overlay Rendered inside 3D Canvas */}
            <Html
              transform
              occlude="blending"
              distanceFactor={3.2}
              position={[0, 0, 0.02]} // Slightly offset forward to prevent z-fighting
              style={{
                width: '220px',
                height: '320px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                pointerEvents: 'none', // Allow dragging card itself
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '9px', 
                  color: isCurrent ? item.glowColor : '#8a99ad',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  {item.status}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '9px', 
                  color: '#8a99ad' 
                }}>
                  0{i + 1}
                </span>
              </div>

              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                {/* Simulated Wireframe Hexagon/Radar Graphic */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 15px auto',
                  border: `1px dashed ${isCurrent ? item.glowColor : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isCurrent ? 'spin-radar 10s linear infinite' : 'none'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    border: `1px solid ${isCurrent ? item.glowColor : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: '50%',
                    boxShadow: isCurrent ? `inset 0 0 10px ${item.glowColor}44` : 'none'
                  }} />
                </div>
                
                <h3 style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  margin: '0 0 4px 0', 
                  letterSpacing: '1px',
                  fontFamily: 'var(--font-title)',
                  textShadow: isCurrent ? `0 0 8px ${item.glowColor}bb` : 'none'
                }}>
                  {item.name.split(' (')[0]}
                </h3>
                <em style={{ 
                  fontSize: '8px', 
                  color: '#8a99ad', 
                  fontFamily: 'var(--font-mono)',
                  display: 'block'
                }}>
                  {item.latinName}
                </em>
              </div>

              <div style={{ 
                borderTop: `1px solid ${isCurrent ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                paddingTop: '10px',
                fontSize: '8px', 
                fontFamily: 'var(--font-mono)',
                color: isCurrent ? '#ffffff' : '#8a99ad',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>RARITY INDEX:</span>
                <span style={{ color: isCurrent ? item.glowColor : '#ffd700' }}>
                  {item.rarity}
                </span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
