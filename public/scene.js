import * as THREE from '/vendor/three.module.js';

let cleanupScene = null;

export function mountScene(target) {
  if (!target) return;
  if (cleanupScene) cleanupScene();

  const canvas = document.createElement('canvas');
  canvas.className = 'park-scene-canvas';
  target.replaceChildren(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(6, 4.5, 7.5);
  camera.lookAt(0, 0.6, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const sun = new THREE.DirectionalLight(0xf5fff0, 2.4);
  sun.position.set(4, 7, 5);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x8bdc80, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const lake = new THREE.Mesh(
    new THREE.CircleGeometry(2.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x61c7e8, roughness: 0.55, metalness: 0.05 })
  );
  lake.position.set(0.9, 0.02, -0.72);
  lake.scale.set(1.35, 0.42, 1);
  lake.rotation.x = -Math.PI / 2;
  scene.add(lake);

  const path = new THREE.Mesh(
    new THREE.BoxGeometry(7.2, 0.05, 0.62),
    new THREE.MeshStandardMaterial({ color: 0xf2d99b, roughness: 0.85 })
  );
  path.position.set(-0.18, 0.04, 1.34);
  path.rotation.y = -0.22;
  scene.add(path);

  addTree(scene, -2.8, -0.9, 0.95);
  addTree(scene, -1.75, -1.65, 0.72);
  addTree(scene, 2.5, 0.82, 0.82);
  addBike(scene);

  let frame = 0;
  let rafId = 0;

  function resize() {
    const rect = target.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function animate() {
    frame += 0.01;
    lake.position.y = 0.025 + Math.sin(frame * 1.6) * 0.006;
    scene.rotation.y = Math.sin(frame * 0.42) * 0.055;
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  resize();
  animate();
  window.addEventListener('resize', resize);
  cleanupScene = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    target.replaceChildren();
    cleanupScene = null;
  };
}

function addTree(scene, x, z, scale) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.55 * scale, 12),
    new THREE.MeshStandardMaterial({ color: 0x9c6b3e, roughness: 0.8 })
  );
  trunk.position.set(x, 0.28 * scale, z);
  scene.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.ConeGeometry(0.42 * scale, 0.92 * scale, 18),
    new THREE.MeshStandardMaterial({ color: 0x239b62, roughness: 0.78 })
  );
  crown.position.set(x, 0.9 * scale, z);
  scene.add(crown);
}

function addBike(scene) {
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x17425f, roughness: 0.42, metalness: 0.12 });
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x0e9f6e, roughness: 0.38, metalness: 0.08 });
  const wheelA = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 10, 32), wheelMaterial);
  const wheelB = wheelA.clone();
  wheelA.position.set(-0.65, 0.42, 1.25);
  wheelB.position.set(0.65, 0.42, 1.25);
  wheelA.rotation.y = Math.PI / 2;
  wheelB.rotation.y = Math.PI / 2;
  scene.add(wheelA, wheelB);

  const frame = new THREE.Group();
  addTube(frame, [-0.65, 0.42, 1.25], [0, 0.9, 1.25], frameMaterial);
  addTube(frame, [0.65, 0.42, 1.25], [0, 0.9, 1.25], frameMaterial);
  addTube(frame, [-0.65, 0.42, 1.25], [0.2, 0.42, 1.25], frameMaterial);
  addTube(frame, [0.2, 0.42, 1.25], [0.65, 0.42, 1.25], frameMaterial);
  addTube(frame, [0, 0.9, 1.25], [0.2, 0.42, 1.25], frameMaterial);
  addTube(frame, [0.65, 0.42, 1.25], [0.9, 0.86, 1.25], frameMaterial);
  addTube(frame, [0.9, 0.86, 1.25], [0.58, 0.92, 1.25], frameMaterial);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.05, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x163a4f, roughness: 0.6 })
  );
  seat.position.set(-0.07, 1.03, 1.25);
  frame.add(seat);
  scene.add(frame);
}

function addTube(group, start, end, material) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const length = a.distanceTo(b);
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, length, 10), material);
  cylinder.position.copy(mid);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  group.add(cylinder);
}
