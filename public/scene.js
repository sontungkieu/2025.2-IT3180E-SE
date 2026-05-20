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
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(6.2, 4.7, 7.8);
  camera.lookAt(0, 0.55, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.85));
  const sun = new THREE.DirectionalLight(0xf5fff0, 2.7);
  sun.position.set(4.5, 7, 5.5);
  scene.add(sun);

  const park = new THREE.Group();
  scene.add(park);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(4.5, 64),
    new THREE.MeshStandardMaterial({ color: 0xa2df91, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  park.add(ground);

  const shore = flatShape(
    [[-1.95, -1.4], [-0.6, -1.78], [1.88, -1.45], [2.7, -0.58], [1.98, 0.26], [0.42, 0.42], [-1.62, 0.1], [-2.25, -0.72]],
    new THREE.MeshStandardMaterial({ color: 0xdaf0c0, roughness: 0.88 })
  );
  shore.position.set(0.7, 0.018, -0.48);
  shore.scale.set(0.88, 0.64, 1);
  park.add(shore);

  const lakeMaterial = new THREE.MeshStandardMaterial({
    color: 0x63c7df,
    roughness: 0.36,
    metalness: 0.04,
    transparent: true,
    opacity: 0.92
  });
  const lake = flatShape(
    [[-1.82, -1.0], [-0.42, -1.34], [1.48, -1.08], [2.02, -0.45], [1.38, 0.18], [0.12, 0.26], [-1.32, 0.02], [-1.92, -0.55]],
    lakeMaterial
  );
  lake.position.set(0.72, 0.04, -0.48);
  lake.scale.set(0.82, 0.58, 1);
  park.add(lake);

  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0xf3dcaa, roughness: 0.82 });
  addPath(park, [[-3.25, 1.4], [-1.5, 1.16], [0.05, 1.26], [1.7, 1.06], [3.35, 1.32]], 0.14, pathMaterial);
  addPath(park, [[-0.35, 1.2], [0.34, 0.62], [1.18, 0.18]], 0.06, pathMaterial);

  addTree(park, -2.9, -0.85, 0.95);
  addTree(park, -1.78, -1.58, 0.7);
  addTree(park, 2.45, 0.72, 0.82);
  addTree(park, 3.15, -0.28, 0.58);
  addBike(park);

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
    lake.material.color.setHSL(0.53, 0.62, 0.61 + Math.sin(frame * 1.2) * 0.018);
    park.rotation.y = Math.sin(frame * 0.42) * 0.045;
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

function flatShape(points, material) {
  const shape = new THREE.Shape();
  points.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x, z);
    else shape.lineTo(x, z);
  });
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function addPath(scene, points, radius, material) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0.075, z)));
  const path = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, radius, 10, false), material);
  scene.add(path);
}

function addTree(scene, x, z, scale) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07 * scale, 0.12 * scale, 0.62 * scale, 14),
    new THREE.MeshStandardMaterial({ color: 0x8f653d, roughness: 0.82 })
  );
  trunk.position.set(x, 0.31 * scale, z);

  const group = new THREE.Group();
  group.add(trunk);
  const crownMaterialA = new THREE.MeshStandardMaterial({ color: 0x1f9d63, roughness: 0.86 });
  const crownMaterialB = new THREE.MeshStandardMaterial({ color: 0x43bd6f, roughness: 0.84 });
  const crownOffsets = [
    [0, 0.86, 0, 0.42, crownMaterialA],
    [-0.2, 0.74, 0.04, 0.32, crownMaterialB],
    [0.22, 0.76, -0.06, 0.34, crownMaterialB],
    [0.04, 1.08, 0.02, 0.3, crownMaterialA]
  ];
  crownOffsets.forEach(([dx, y, dz, radius, material]) => {
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(radius * scale, 1), material);
    crown.position.set(x + dx * scale, y * scale, z + dz * scale);
    crown.scale.y = 0.9;
    group.add(crown);
  });
  scene.add(group);
}

function addBike(scene) {
  const bike = new THREE.Group();
  bike.position.set(-0.06, 0.01, 1.16);
  bike.rotation.y = -0.04;

  const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x173f52, roughness: 0.5, metalness: 0.08 });
  const rimMaterial = new THREE.MeshStandardMaterial({ color: 0xd7eef2, roughness: 0.34, metalness: 0.28 });
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x11966b, roughness: 0.36, metalness: 0.1 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x17384a, roughness: 0.58 });
  const basketMaterial = new THREE.MeshStandardMaterial({ color: 0x8fcfba, roughness: 0.62, transparent: true, opacity: 0.72 });
  const z = 0;
  const rear = [-0.78, 0.42, z];
  const front = [0.78, 0.42, z];

  addWheel(bike, rear, tireMaterial, rimMaterial);
  addWheel(bike, front, tireMaterial, rimMaterial);

  addTube(bike, rear, [-0.2, 1.0, z], frameMaterial, 0.035);
  addTube(bike, [-0.2, 1.0, z], [0.1, 0.61, z], frameMaterial, 0.035);
  addTube(bike, [0.1, 0.61, z], rear, frameMaterial, 0.035);
  addTube(bike, [0.1, 0.61, z], front, frameMaterial, 0.035);
  addTube(bike, [-0.2, 1.0, z], [0.52, 0.83, z], frameMaterial, 0.035);
  addTube(bike, [0.52, 0.83, z], front, frameMaterial, 0.035);
  addTube(bike, [0.52, 0.83, z], [0.9, 1.05, z], frameMaterial, 0.028);
  addTube(bike, [0.82, 1.08, z], [1.08, 1.08, z], darkMaterial, 0.024);
  addTube(bike, [-0.2, 1.0, z], [-0.26, 1.16, z], darkMaterial, 0.026);

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.055, 0.18),
    darkMaterial
  );
  seat.position.set(-0.32, 1.18, z);
  seat.rotation.z = -0.06;
  bike.add(seat);

  const crank = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 8, 20), darkMaterial);
  crank.position.set(0.1, 0.61, z + 0.015);
  bike.add(crank);

  const basket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.24), basketMaterial);
  basket.position.set(1.02, 0.88, z);
  basket.rotation.z = -0.08;
  bike.add(basket);
  scene.add(bike);
}

function addWheel(group, center, tireMaterial, rimMaterial) {
  const wheel = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.034, 14, 52), tireMaterial);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 10, 42), rimMaterial);
  wheel.add(tire, rim);
  addSpokes(wheel, center, 0.3, rimMaterial);
  wheel.position.set(...center);
  group.add(wheel);
}

function addSpokes(wheel, center, radius, material) {
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    addTube(
      wheel,
      [0, 0, 0],
      [Math.cos(angle) * radius, Math.sin(angle) * radius, 0],
      material,
      0.006
    );
  }
}

function addTube(group, start, end, material, radius = 0.035) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const length = a.distanceTo(b);
  const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 12), material);
  cylinder.position.copy(mid);
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  group.add(cylinder);
}
