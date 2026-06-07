import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Custom Vertex Shader
const vertexShader = `
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uHoverStrength;
  
  attribute float aType; // 0: Body, 1: Wings, 2: Plumes
  attribute float aSpeed;
  attribute float aSize;
  
  varying vec3 vColor;
  varying float vType;
  
  void main() {
    vType = aType;
    vec3 pos = position;
    
    // 1. Procedural Animations based on part type
    if (aType == 0.0) {
      // Body breathing effect
      float breath = sin(uTime * 2.0 + pos.z * 5.0) * 0.03;
      pos += normal * breath;
    } 
    else if (aType == 1.0) {
      // Flapping wings
      // Wings extend along X-axis. Flapping occurs on Y-axis.
      float flap = sin(uTime * 6.0 - abs(pos.x) * 2.0) * 0.25 * abs(pos.x);
      pos.y += flap;
      
      // Wind drift
      pos.z += cos(uTime * 3.0 + pos.x) * 0.05;
    } 
    else if (aType == 2.0) {
      // Trailing Plumes (waving ribbons)
      float waveX = sin(uTime * 2.5 + pos.z * 4.0) * 0.12;
      float waveY = cos(uTime * 2.0 + pos.z * 3.0) * 0.1;
      pos.x += waveX;
      pos.y += waveY;
    }
    
    // 2. Mouse Repulsion Physics
    float dist = distance(pos, uMouse);
    if (dist < 1.8) {
      // Calculate push direction
      vec3 dir = normalize(pos - uMouse);
      // Strength is stronger near the center of the mouse
      float force = (1.8 - dist) * 0.6 * uHoverStrength;
      
      // Add turbulent noise to the dispersion
      vec3 turbulence = vec3(
        sin(pos.y * 10.0 + uTime),
        cos(pos.x * 10.0 + uTime),
        sin(pos.z * 10.0 + uTime)
      ) * 0.15;
      
      pos += (dir + turbulence) * force;
    }
    
    // 3. Set Colors (cybernetic bioluminescence)
    if (aType == 0.0) {
      // Body: Cyan-Green
      vColor = mix(vec3(0.0, 1.0, 0.8), vec3(0.0, 0.9, 1.0), sin(uTime + pos.z) * 0.5 + 0.5);
    } 
    else if (aType == 1.0) {
      // Wings: Deep Emerald to Teal
      vColor = mix(vec3(0.05, 0.4, 0.25), vec3(0.0, 0.8, 0.7), pos.y * 2.0 + 0.5);
    } 
    else {
      // Plumes: Glowing Amber / Gold (Bidadari Standardwing accent)
      vColor = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 0.9, 0.3), sin(uTime * 3.0 + pos.z * 2.0) * 0.5 + 0.5);
    }
    
    // 4. Projection
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance attenuation
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
  }
`;

// Custom Fragment Shader
const fragmentShader = `
  varying vec3 vColor;
  varying float vType;
  
  void main() {
    // Shape the particle into a perfect soft circle (glow)
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    if (dist > 0.5) discard;
    
    // Soft glow edge attenuation
    float alpha = smoothstep(0.5, 0.1, dist);
    
    // High-tech center cores
    float centerCore = smoothstep(0.12, 0.0, dist) * 0.7;
    
    vec3 finalColor = vColor + vec3(centerCore);
    
    // Add extra brightness for plumes
    float brightness = (vType == 2.0) ? 1.2 : 1.0;
    
    gl_FragColor = vec4(finalColor * brightness, alpha * 0.85);
  }
`;

export const ParticleBird = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  // Mouse tracking state for repulsion shader uniform
  const mouse3D = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const hoverStrength = useRef<number>(0);

  // Procedurally generate bird geometry points on mount
  const particleData = useMemo(() => {
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const types = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    const bodyCount = 1800;
    const wingCount = 2200;
    const plumeCount = 1000;

    let index = 0;

    // 1. Generate Body (Ellipsoid shape representing the bird torso and head)
    for (let i = 0; i < bodyCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos((Math.random() * 2) - 1);
      
      // Radii: thin, streamlined cyber-body
      const rx = 0.22 + Math.random() * 0.05;
      const ry = 0.18 + Math.random() * 0.05;
      const rz = 0.55 + Math.random() * 0.15;

      positions[index * 3] = rx * Math.cos(u) * Math.sin(v);
      positions[index * 3 + 1] = ry * Math.sin(u) * Math.sin(v);
      positions[index * 3 + 2] = rz * Math.cos(v) - 0.1; // Shift slightly back

      types[index] = 0.0; // Body
      speeds[index] = 0.5 + Math.random() * 1.5;
      sizes[index] = 0.015 + Math.random() * 0.025;
      index++;
    }

    // 2. Generate Wings (Flapping planes stretching along X)
    for (let i = 0; i < wingCount; i++) {
      const isLeft = Math.random() > 0.5;
      const side = isLeft ? -1 : 1;

      // Span stretches from body out to tip
      const span = 0.2 + Math.random() * 1.4;
      const chord = (1.5 - span) * 0.28; // Taper wings near tips
      
      // Distribute points on the wing surface
      const x = side * span;
      const z = (Math.random() - 0.5) * chord - (span * 0.1); // Swept back
      const y = (Math.random() - 0.5) * 0.02;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      types[index] = 1.0; // Wings
      speeds[index] = 1.0 + Math.random() * 2.0;
      sizes[index] = 0.01 + Math.random() * 0.02;
      index++;
    }

    // 3. Generate Trailing Plumes (The two long iconic feathers stretching from standardwing shoulders)
    // We create four ribbon lines sweeping back from the chest/shoulder region
    for (let i = 0; i < plumeCount; i++) {
      const plumeIndex = i % 4;
      let startX = 0;
      let startY = 0;
      let startZ = -0.1;

      // Place shoulders
      if (plumeIndex === 0) { startX = -0.15; startY = 0.1; }
      else if (plumeIndex === 1) { startX = 0.15; startY = 0.1; }
      else if (plumeIndex === 2) { startX = -0.1; startY = 0.05; }
      else { startX = 0.1; startY = 0.05; }

      // Parametric curve stretching back on Z and outward/upward
      const t = Math.random(); // progress along the plume
      const length = 1.6 + Math.random() * 0.4;
      
      const z = startZ - (t * length);
      // Curl outward and upward
      const x = startX + Math.sin(t * 1.8) * 0.45 * (startX > 0 ? 1 : -1);
      const y = startY + (t * t * 0.35); // arches up

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      types[index] = 2.0; // Plumes
      speeds[index] = 0.3 + Math.random() * 0.5;
      sizes[index] = 0.015 + Math.random() * 0.025; // Plumes are brighter/thicker particles
      index++;
    }

    return { positions, types, speeds, sizes };
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(999, 999, 999) },
    uHoverStrength: { value: 0.0 }
  }), []);

  // Update uniforms and track mouse movements in 3D
  useFrame((state) => {
    const { pointer, clock } = state;
    
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

      // Convert 2D screen mouse pointer coordinates into 3D world space coordinate at Z=0
      const targetMouseX = (pointer.x * viewport.width) / 2.2;
      const targetMouseY = (pointer.y * viewport.height) / 2.2;
      
      // Interpolate mouse positions for fluid movement
      mouse3D.current.x = THREE.MathUtils.lerp(mouse3D.current.x, targetMouseX, 0.1);
      mouse3D.current.y = THREE.MathUtils.lerp(mouse3D.current.y, targetMouseY, 0.1);
      mouse3D.current.z = 0;

      // Detect if cursor is on screen/near center
      const cursorActive = Math.abs(pointer.x) < 0.95 && Math.abs(pointer.y) < 0.95;
      const targetHover = cursorActive ? 1.0 : 0.0;
      hoverStrength.current = THREE.MathUtils.lerp(hoverStrength.current, targetHover, 0.05);

      materialRef.current.uniforms.uMouse.value.copy(mouse3D.current);
      materialRef.current.uniforms.uHoverStrength.value = hoverStrength.current;
    }

    // Slow orbital drift of the whole bird
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.2;
      pointsRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.3) * 0.05;
      pointsRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.8) * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aType"
          args={[particleData.types, 1]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[particleData.speeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[particleData.sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
      />
    </points>
  );
};
