import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

type Phase = 'boot' | 'walk' | 'place' | 'open' | 'ready';
const MODEL = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb';

export const CinematicDelivery3D: React.FC<{ phase: Phase }> = ({ phase }) => {
  const ref = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => {
    const host = ref.current; if (!host) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030406);
    scene.fog = new THREE.FogExp2(0x030406, 0.055);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.5, 2.5, 7);
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x9da7c7, 0x09090b, 1.8));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3,7,4); key.castShadow = true; key.shadow.mapSize.set(1024,1024); scene.add(key);
    const rim = new THREE.PointLight(0xff234f, 12, 8, 2);
    rim.position.set(-1.5,2.4,-1.7); scene.add(rim);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18,12),
      new THREE.MeshStandardMaterial({color:0x090a0d,roughness:.52,metalness:.25}));
    floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);

    const pkg = new THREE.Group(); pkg.position.set(.7,.48,0); scene.add(pkg);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.55,.85,1.15),
      new THREE.MeshStandardMaterial({color:0x3d0a12,roughness:.42,metalness:.12}));
    body.castShadow = true; body.receiveShadow = true; pkg.add(body);
    const lidPivot = new THREE.Group(); lidPivot.position.y = .425; pkg.add(lidPivot);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.62,.10,1.22),
      new THREE.MeshStandardMaterial({color:0x8f172b,roughness:.35,metalness:.16}));
    lid.position.y=.05; lid.castShadow=true; lidPivot.add(lid);
    const glow = new THREE.PointLight(0xff1746,0,4,2); glow.position.y=.8; pkg.add(glow);

    let character: THREE.Object3D|null = null;
    let mixer: THREE.AnimationMixer|null = null;
    let walk: THREE.AnimationAction|null = null;
    let idle: THREE.AnimationAction|null = null;
    let elapsed = 0;

    new GLTFLoader().load(MODEL,(gltf)=>{
      character=gltf.scene; character.scale.setScalar(1.55);
      character.position.set(-4.6,0,0); character.rotation.y=-Math.PI/2;
      character.traverse((o)=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});
      scene.add(character);
      mixer=new THREE.AnimationMixer(character);
      const wc=gltf.animations.find(a=>/walk/i.test(a.name));
      const ic=gltf.animations.find(a=>/idle/i.test(a.name));
      if(wc){walk=mixer.clipAction(wc);walk.play();}
      if(ic) idle=mixer.clipAction(ic);
    },undefined,()=>{host.dataset.loadError='true';});

    const resize=()=>{const w=host.clientWidth||innerWidth,h=host.clientHeight||315;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
    const ro=new ResizeObserver(resize);ro.observe(host);resize();
    const clock=new THREE.Clock();

    const frame=()=>{
      const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;const p=phaseRef.current;mixer?.update(dt);
      if(character){
        if(p==='boot')character.position.x=-4.6;
        else if(p==='walk')character.position.x=THREE.MathUtils.lerp(-4.6,.25,THREE.MathUtils.smootherstep(Math.min(Math.max((elapsed-.25)/1.45,0),1),0,1));
        else character.position.x=THREE.MathUtils.lerp(character.position.x,.55,.08);
        if(p!=='walk'&&idle&&walk){walk.fadeOut(.25);idle.reset().fadeIn(.25).play();}
      }
      if(p==='open'||p==='ready'){const q=THREE.MathUtils.smootherstep(Math.min(Math.max((elapsed-2.25)/.7,0),1),0,1);
        lidPivot.rotation.x=-1.92*q;glow.intensity=7*q;}
      camera.lookAt(p==='walk'?-0.15:.3,1.05,0);renderer.render(scene,camera);requestAnimationFrame(frame);
    };
    frame();
    return()=>{ro.disconnect();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div ref={ref} className="helzerx-3d-scene" aria-hidden="true"/>;
};