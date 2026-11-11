import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Custom Shader for Halftone / Dissolve effect
const vertexShader = `
  uniform float uProgress;
  uniform float uTime;
  
  attribute vec3 aTarget1;
  attribute vec3 aTarget2;
  attribute vec3 aTarget3;
  
  varying vec3 vColor;
  
  // 3D Simplex Noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec3 finalPos = position;
    float n = snoise(position * 2.0 + uTime * 0.5) * 0.1;
    
    // Blend logic based on uProgress (0 to 3)
    if(uProgress < 1.0) {
      finalPos = mix(position, aTarget1, uProgress);
    } else if(uProgress < 2.0) {
      finalPos = mix(aTarget1, aTarget2, uProgress - 1.0);
    } else {
      finalPos = mix(aTarget2, aTarget3, min(uProgress - 2.0, 1.0));
    }
    
    // Add heavy noise during transitions to "break" the shape into dots
    float transitionNoise = sin(uProgress * 3.14159) * 1.5;
    finalPos += vec3(
      snoise(finalPos * 0.5 + uTime), 
      snoise(finalPos * 0.5 + uTime + 10.0), 
      snoise(finalPos * 0.5 + uTime + 20.0)
    ) * transitionNoise;
    
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    
    // Size attenuation
    gl_PointSize = (12.0 + transitionNoise * 8.0) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    
    // Color logic
    vec3 colorBase = vec3(0.06, 0.42, 0.39); // Deep teal primary
    vec3 colorAlt = vec3(0.86, 0.94, 0.92); // Warm ivory 
    vColor = mix(colorBase, colorAlt, n + 0.5 + transitionNoise * 0.2);
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    // Draw perfect circles for the halftone feel
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.4, ll);
    gl_FragColor = vec4(vColor, alpha * 0.9);
  }
`;

// Helper: Sphere
const getSphere = (count: number) => {
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 3 + Math.random() * 0.5;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return pos;
};

// Helper: Medical Cross
const getCross = (count: number) => {
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
    const isVertical = Math.random() > 0.5;
    const thickness = 0.8;
    const length = 3.5;
    let x, y, z;
    if(isVertical) {
      x = (Math.random() - 0.5) * thickness;
      y = (Math.random() - 0.5) * length;
      z = (Math.random() - 0.5) * thickness;
    } else {
      x = (Math.random() - 0.5) * length;
      y = (Math.random() - 0.5) * thickness;
      z = (Math.random() - 0.5) * thickness;
    }
    pos[i * 3] = x + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.2;
  }
  return pos;
};

// Helper: DNA Helix
const getDNA = (count: number) => {
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
    const t = Math.random() * Math.PI * 4;
    const y = (t / (Math.PI * 4) - 0.5) * 6;
    const radius = 1.2;
    const strand = Math.random() > 0.5 ? 0 : Math.PI;
    pos[i * 3] = Math.cos(t + strand) * radius + (Math.random() - 0.5) * 0.3;
    pos[i * 3 + 1] = y + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 2] = Math.sin(t + strand) * radius + (Math.random() - 0.5) * 0.3;
  }
  return pos;
};

// Helper: Heart
const getHeart = (count: number) => {
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++) {
    const t = Math.random() * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    const scale = 0.15;
    pos[i * 3] = x * scale + (Math.random() - 0.5) * 0.4;
    pos[i * 3 + 1] = y * scale + (Math.random() - 0.5) * 0.4 + 0.5; // Shifted up slightly
    pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  return pos;
}

const ParticleCloud = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  const count = 15000;
  
  const basePos = useMemo(() => getSphere(count), [count]);
  const target1 = useMemo(() => getCross(count), [count]);
  const target2 = useMemo(() => getDNA(count), [count]);
  const target3 = useMemo(() => getHeart(count), [count]);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(basePos, 3));
    geo.setAttribute('aTarget1', new THREE.BufferAttribute(target1, 3));
    geo.setAttribute('aTarget2', new THREE.BufferAttribute(target2, 3));
    geo.setAttribute('aTarget3', new THREE.BufferAttribute(target3, 3));
    return geo;
  }, [basePos, target1, target2, target3]);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 }
  }), []);

  useGSAP(() => {
    gsap.to(uniforms.uProgress, {
      value: 3.0,
      duration: 15, // Smooth 15-second morphing loop
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  });

  useFrame((state) => {
    if (!pointsRef.current || !shaderRef.current) return;
    const time = state.clock.getElapsedTime();
    shaderRef.current.uniforms.uTime.value = time;
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.z = Math.sin(time * 0.1) * 0.05;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial 
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const LandingScene = () => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} frameloop="always">
        <ambientLight intensity={0.5} />
        <ParticleCloud />
      </Canvas>
    </div>
  );
};
