import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** No external textures or models; loaded only by the browser motion backdrop. */
export function createRibbonScene(host: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 80);
  camera.position.set(0, 0, 16);
  const environmentScene = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(environmentScene, 0.06);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.85;
  environmentScene.dispose();
  pmrem.dispose();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-13, -2.6, -2),
    new THREE.Vector3(-8.5, 0.1, -0.5),
    new THREE.Vector3(-5.3, -1.1, 0.8),
    new THREE.Vector3(-0.4, -2.1, -3.6),
    new THREE.Vector3(5.6, 0.9, -0.3),
    new THREE.Vector3(9.4, 3.4, 0.1),
    new THREE.Vector3(6.9, 1.8, 1.8),
    new THREE.Vector3(12.5, -0.9, -1.2),
  ]);
  const steps = 170;
  const across = 10;
  const frames = curve.computeFrenetFrames(steps, false);
  const vertices: number[] = [];
  const indices: number[] = [];
  const uv: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const point = curve.getPointAt(u);
    const angle = u * Math.PI * 2.1 + 0.4;
    const direction = frames.normals[i]!.clone()
      .multiplyScalar(Math.cos(angle))
      .addScaledVector(frames.binormals[i]!, Math.sin(angle));
    const width = 1.15 + Math.sin(u * Math.PI) * 0.38;
    for (let j = 0; j <= across; j++) {
      const v = j / across;
      const position = point.clone().addScaledVector(direction, (v - 0.5) * width * 2);
      vertices.push(position.x, position.y, position.z);
      uv.push(u, v);
      if (i < steps && j < across) {
        const a = i * (across + 1) + j;
        const b = a + across + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x94b8ed,
    metalness: 0.28,
    roughness: 0.24,
    transmission: 0.25,
    thickness: 0.5,
    transparent: true,
    opacity: 0.65,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
    iridescence: 0.85,
    iridescenceIOR: 1.32,
    side: THREE.DoubleSide,
    envMapIntensity: 1.35,
    emissive: 0x263a75,
    emissiveIntensity: 0.3,
  });
  const ribbon = new THREE.Mesh(geometry, material);
  scene.add(ribbon);
  const leftLight = new THREE.PointLight(0x78ccff, 36, 30);
  leftLight.position.set(-7, 2, 5);
  scene.add(leftLight);
  const rightLight = new THREE.PointLight(0xbab0ff, 42, 30);
  rightLight.position.set(8, 4, 6);
  scene.add(rightLight);
  scene.add(new THREE.AmbientLight(0x91b8ff, 0.9));
  let disposed = false;
  let paused = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  const pointer = { x: 0, y: 0 };
  const render = () => renderer.render(scene, camera);
  const tick = (now: number) => {
    if (disposed || paused || document.hidden) {
      frame = 0;
      return;
    }
    if (previous) elapsed += Math.min(now - previous, 40) / 1000;
    previous = now;
    ribbon.rotation.y = Math.sin(elapsed / 13) * 0.045 + pointer.x * 0.024;
    ribbon.rotation.z = Math.sin(elapsed / 17) * 0.018;
    ribbon.position.y = Math.sin(elapsed / 11) * 0.12 + pointer.y * 0.045;
    render();
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    previous = 0;
    if (!frame && !paused && !document.hidden && !disposed) frame = requestAnimationFrame(tick);
  };
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  };
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  };
  const onPointer = (event: PointerEvent) => {
    pointer.x = event.clientX / window.innerWidth - 0.5;
    pointer.y = event.clientY / window.innerHeight - 0.5;
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  start();
  return {
    pause(value: boolean) {
      paused = value;
      if (value) stop();
      else start();
    },
    dispose() {
      disposed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
