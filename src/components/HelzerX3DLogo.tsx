import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

type Phase = 'boot' | 'logo' | 'settle' | 'reveal' | 'ready';

const FONT_URL =
  'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';

export const HelzerX3DLogo: React.FC<{ phase: Phase }> = ({ phase }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020204);

    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0, 0.25, 10.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x8790a8, 0x050507, 1.7));

    const key = new THREE.DirectionalLight(0xffffff, 3.6);
    key.position.set(-3, 4, 7);
    scene.add(key);

    const redLight = new THREE.PointLight(0xff123f, 15, 9, 2);
    redLight.position.set(0, 0.4, 2);
    scene.add(redLight);

    const whiteLight = new THREE.PointLight(0xffffff, 5, 7, 2);
    whiteLight.position.set(3, 1.8, 4);
    scene.add(whiteLight);

    const logoRoot = new THREE.Group();
    scene.add(logoRoot);

    const letters: Array<{
      front: THREE.Mesh;
      back: THREE.Mesh;
      targetX: number;
      delay: number;
      seed: number;
    }> = [];

    const frontMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f5,
      metalness: 0.72,
      roughness: 0.2,
      emissive: 0x250007,
      emissiveIntensity: 0.55,
    });

    const redMat = new THREE.MeshStandardMaterial({
      color: 0xc8102e,
      metalness: 0.78,
      roughness: 0.22,
      emissive: 0x4d0010,
      emissiveIntensity: 0.85,
    });

    const loader = new FontLoader();
    let disposed = false;

    loader.load(FONT_URL, (font) => {
      if (disposed) return;

      const word = 'HELZERX';
      const size = 1.02;
      const depth = 0.24;
      const gap = 0.055;
      const built: THREE.Group[] = [];

      for (const char of word) {
        const geometry = new TextGeometry(char, {
          font,
          size,
          depth,
          curveSegments: 8,
          bevelEnabled: true,
          bevelThickness: 0.055,
          bevelSize: 0.032,
          bevelSegments: 4,
        });
        geometry.computeBoundingBox();

        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const front = new THREE.Mesh(geometry, frontMat);
        front.castShadow = true;
        front.receiveShadow = true;

        const backGeometry = geometry.clone();
        backGeometry.translate(0, 0, -0.10);
        const back = new THREE.Mesh(backGeometry, redMat);

        const group = new THREE.Group();
        group.add(back, front);

        const box = new THREE.Box3().setFromObject(group);
        const width = box.max.x - box.min.x;
        built.push(group);
        letters.push({
          front,
          back,
          targetX: width,
          delay: letters.length * 0.075,
          seed: letters.length * 1.73 + 0.4,
        });
      }

      let cursor = 0;
      for (const group of built) {
        const width = new THREE.Box3().setFromObject(group).max.x * 2;
        group.position.x = cursor;
        logoRoot.add(group);
        cursor += width + gap;
      }

      const total = cursor - gap;
      logoRoot.position.x = -total / 2;
      logoRoot.scale.setScalar(1.02);
    });

    const particles = new THREE.BufferGeometry();
    const count = 170;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff244c,
      size: 0.018,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    });
    const particleField = new THREE.Points(particles, particleMat);
    scene.add(particleField);

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || 360;
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

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const current = phaseRef.current;

      const progress =
        current === 'boot' ? 0 :
        current === 'logo' ? Math.min(Math.max((elapsed - 0.25) / 1.65, 0), 1) :
        current === 'settle' ? 1 :
        current === 'reveal' || current === 'ready' ? 1 : 0;

      const eased = THREE.MathUtils.smoothstep(progress, 0, 1);

      letters.forEach((letter, index) => {
        const parent = letter.front.parent;
        const local = THREE.MathUtils.smoothstep(
          Math.min(Math.max((eased * 1.35) - letter.delay, 0), 1),
          0,
          1
        );

        if (local === 0) {
          parent.visible = true;
          parent.position.x = Math.sin(letter.seed) * 2.8;
          parent.position.y = 1.8 + Math.cos(letter.seed) * 1.4;
          parent.position.z = -2.8 - index * 0.22;
          parent.rotation.x = 1.4 + Math.sin(letter.seed) * 0.5;
          parent.rotation.y = -2.1 + Math.cos(letter.seed) * 0.65;
          parent.rotation.z = Math.sin(letter.seed) * 0.9;
          parent.scale.setScalar(0.08);
        } else {
          parent.position.y = THREE.MathUtils.lerp(parent.position.y, 0, 0.15);
          parent.position.z = THREE.MathUtils.lerp(parent.position.z, 0, 0.15);
          parent.rotation.x = THREE.MathUtils.lerp(parent.rotation.x, 0, 0.13);
          parent.rotation.y = THREE.MathUtils.lerp(parent.rotation.y, 0, 0.13);
          parent.rotation.z = THREE.MathUtils.lerp(parent.rotation.z, 0, 0.13);
          parent.scale.setScalar(THREE.MathUtils.lerp(parent.scale.x, 1, 0.15));
        }
      });

      if (current === 'settle' || current === 'reveal' || current === 'ready') {
        logoRoot.position.y = THREE.MathUtils.lerp(logoRoot.position.y, 0.35, 0.055);
        logoRoot.scale.setScalar(THREE.MathUtils.lerp(logoRoot.scale.x, 0.88, 0.055));
      } else {
        logoRoot.position.y = THREE.MathUtils.lerp(logoRoot.position.y, 0, 0.06);
      }

      particleField.rotation.y += dt * 0.025;
      particleField.rotation.x = Math.sin(elapsed * 0.18) * 0.04;
      redLight.intensity = 11 + Math.sin(elapsed * 2.2) * 2;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      disposed = true;
      observer.disconnect();
      renderer.dispose();
      frontMat.dispose();
      redMat.dispose();
      particles.dispose();
      particleMat.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="helzerx-3d-logo-scene" aria-hidden="true" />;
};
