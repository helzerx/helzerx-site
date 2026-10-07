import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

type Phase = 'boot' | 'logo' | 'settle' | 'reveal' | 'ready';

const FONT_URL = 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

export const HelzerX3DLogo: React.FC<{ phase: Phase }> = ({ phase }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020204, 0.035);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 10.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.HemisphereLight(0xffffff, 0x07070b, 1.15);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 4.8);
    key.position.set(-4, 5, 8);
    scene.add(key);

    const rim = new THREE.PointLight(0xff163f, 18, 12, 2);
    rim.position.set(-3, 0.4, 4);
    scene.add(rim);

    const fill = new THREE.PointLight(0x9ca3ff, 7, 10, 2);
    fill.position.set(4, 1.5, 5);
    scene.add(fill);

    const logo = new THREE.Group();
    logo.position.set(0, 0.08, 0);
    logo.rotation.set(0, 0, 0);
    logo.scale.setScalar(0.62);
    scene.add(logo);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 2.8),
      new THREE.MeshBasicMaterial({
        color: 0xc8102e,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.position.set(0, -0.05, -0.9);
    scene.add(glow);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.25, 2.265, 128),
      new THREE.MeshBasicMaterial({
        color: 0xff234d,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    ring.scale.set(1.9, 0.48, 1);
    ring.rotation.x = 0.18;
    ring.position.z = -0.45;
    scene.add(ring);

    const particles = new THREE.BufferGeometry();
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 3.2 + Math.random() * 5.5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 2] = -1.5 - Math.random() * 5;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xff3158,
      size: 0.014,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particles, particleMaterial);
    scene.add(particleField);

    const frontMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.82,
      roughness: 0.18,
      emissive: 0x180006,
      emissiveIntensity: 0.34,
      transparent: true,
      opacity: 1,
    });

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x5a0012,
      emissiveIntensity: 0.72,
      transparent: true,
      opacity: 1,
    });

    const loader = new FontLoader();
    let geometry: THREE.TextGeometry | null = null;
    let textMesh: THREE.Mesh | null = null;
    let edgeMesh: THREE.Mesh | null = null;

    loader.load(FONT_URL, (font) => {
      if (disposed) return;

      geometry = new TextGeometry('HELZERX', {
        font,
        size: 1.08,
        depth: 0.28,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.065,
        bevelSize: 0.038,
        bevelSegments: 5,
      });

      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox?.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      textMesh = new THREE.Mesh(geometry, frontMaterial);
      textMesh.position.z = 0.08;
      logo.add(textMesh);

      const edgeGeometry = geometry.clone();
      edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
      edgeMesh.scale.setScalar(1.004);
      edgeMesh.position.z = -0.08;
      logo.add(edgeMesh);
    });

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;

      const elapsed = clock.getElapsedTime();
      const current = phaseRef.current;

      const revealProgress = current === 'boot'
        ? 0
        : current === 'logo'
          ? THREE.MathUtils.clamp((elapsed - 0.2) / 2.55, 0, 1)
          : 1;

      const intro = THREE.MathUtils.smootherstep(revealProgress, 0, 1);
      const cinematic = THREE.MathUtils.smoothstep(intro, 0, 1);

      if (current === 'boot') {
        logo.scale.setScalar(0.62);
        logo.position.y = 0.08;
        logo.rotation.y = 0.16;
        logo.rotation.x = 0.035;
      } else if (current === 'logo' || current === 'settle') {
        const breathe = Math.sin(elapsed * 0.9) * 0.012;
        logo.scale.setScalar(THREE.MathUtils.lerp(0.62, 1.0, cinematic) + breathe);
        logo.position.y = THREE.MathUtils.lerp(0.08, 0, cinematic);
        logo.rotation.y = THREE.MathUtils.lerp(0.16, 0, cinematic);
        logo.rotation.x = THREE.MathUtils.lerp(0.035, 0, cinematic);
      } else {
        const exit = THREE.MathUtils.smoothstep(
          THREE.MathUtils.clamp((elapsed - 3.0) / 1.05, 0, 1), 0, 1
        );
        logo.position.y = THREE.MathUtils.lerp(0, 1.25, exit);
        logo.scale.setScalar(THREE.MathUtils.lerp(1, 0.72, exit));
        logo.rotation.y = THREE.MathUtils.lerp(0, -0.035, exit);
      }

      const exitOpacity = current === 'reveal' || current === 'ready'
        ? THREE.MathUtils.clamp(1 - (elapsed - 3.0) / 0.9, 0, 1)
        : 1;
      frontMaterial.opacity = exitOpacity;
      edgeMaterial.opacity = exitOpacity;

      camera.position.z = THREE.MathUtils.lerp(10.8, 9.15, cinematic);
      camera.position.x = Math.sin(elapsed * 0.18) * 0.045;

      const glowStrength = cinematic * 0.24 * exitOpacity;
      (glow.material as THREE.MeshBasicMaterial).opacity = glowStrength;
      (ring.material as THREE.MeshBasicMaterial).opacity = cinematic * 0.16 * exitOpacity;
      particleMaterial.opacity = cinematic * 0.34 * exitOpacity;

      ring.rotation.z += 0.0018;
      particleField.rotation.y += 0.0008;
      rim.intensity = 15 + Math.sin(elapsed * 1.35) * 2.5;

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.dispose();
      geometry?.dispose();
      frontMaterial.dispose();
      edgeMaterial.dispose();
      glow.geometry.dispose();
      (glow.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      particles.dispose();
      particleMaterial.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="helzerx-3d-logo-scene" aria-hidden="true" />;
};
