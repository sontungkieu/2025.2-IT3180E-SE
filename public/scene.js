import * as THREE from '/vendor/three.module.js';

let cleanupScene = null;

const COLORS = {
  concrete: 0xdce4e5,
  concreteDark: 0xb9c7c8,
  asphalt: 0x47545b,
  lane: 0x158760,
  laneStripe: 0xddeee5,
  grass: 0x78b56f,
  grassDark: 0x4f8a58,
  water: 0x55a9c8,
  waterFoam: 0xbcebf2,
  rail: 0x60727a,
  railDark: 0x34454d,
  sign: 0x0b2f24,
  signAccent: 0x16a06e,
  statusOn: 0x2bd977,
  statusOff: 0xd65a4f,
  treeTrunk: 0x7b5937,
  treeA: 0x238d5d,
  treeB: 0x42b371,
  bollard: 0xeff5f2,
  bollardCap: 0xd6a22a,
  city: 0x11845b,
  tandem: 0x169fc7,
  child: 0xb97618,
  metal: 0xb8c8ca,
  tire: 0x172326,
  saddle: 0x4b3425,
  white: 0xffffff
};

export function mountScene(target) {
  if (!target) return;
  if (cleanupScene) cleanupScene();

  const canvas = document.createElement('canvas');
  canvas.className = 'park-scene-canvas';
  target.replaceChildren(canvas);

  const store = createDisposableStore();
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
  camera.position.set(9.6, 8.2, 9.4);
  camera.lookAt(0.2, 0.2, 0.1);

  const mats = createMaterials(store);
  const world = new THREE.Group();
  world.rotation.y = -0.09;
  scene.add(world);

  addLighting(scene);
  const water = addGroundAndRoad(world, mats, store);
  const statusLights = addBikeHub(world, mats, store);
  addTrees(world, mats, store);
  addBollards(world, mats, store);
  const bikes = addBikes(world, mats, store);

  world.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
  });

  function resize() {
    const rect = target.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));
    renderer.setSize(width, height, false);

    const aspect = width / height;
    const frustum = aspect < 1.45 ? 6.25 : 5.1;
    camera.left = -frustum * aspect;
    camera.right = frustum * aspect;
    camera.top = frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  }

  let frame = 0;
  let rafId = 0;
  function animate() {
    frame += 0.012;
    water.material.opacity = 0.74 + Math.sin(frame * 1.8) * 0.04;
    water.position.y = 0.045 + Math.sin(frame * 1.5) * 0.008;

    statusLights.forEach((light, index) => {
      const pulse = 1 + Math.abs(Math.sin(frame * (2.2 + index * 0.12))) * (light.userData.available ? 0.18 : 0.07);
      light.scale.setScalar(pulse);
    });

    bikes.forEach((bike, index) => {
      bike.rotation.z = Math.sin(frame * 0.55 + index) * 0.008;
    });

    world.rotation.y = -0.09 + Math.sin(frame * 0.28) * 0.024;
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
    store.dispose();
    target.replaceChildren();
    cleanupScene = null;
  };
}

function createDisposableStore() {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  return {
    geometry(geometry) {
      geometries.add(geometry);
      return geometry;
    },
    material(material) {
      materials.add(material);
      return material;
    },
    texture(texture) {
      textures.add(texture);
      return texture;
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      geometries.clear();
      textures.clear();
      materials.clear();
    }
  };
}

function createMaterials(store) {
  const standard = (color, options = {}) => store.material(new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.04,
    ...options
  }));
  const basic = (color, options = {}) => store.material(new THREE.MeshBasicMaterial({ color, ...options }));

  return {
    concrete: standard(COLORS.concrete, { roughness: 0.86 }),
    concreteDark: standard(COLORS.concreteDark, { roughness: 0.82 }),
    asphalt: standard(COLORS.asphalt, { roughness: 0.88 }),
    lane: standard(COLORS.lane, { roughness: 0.82 }),
    laneStripe: standard(COLORS.laneStripe, { roughness: 0.78 }),
    grass: standard(COLORS.grass, { roughness: 0.9 }),
    grassDark: standard(COLORS.grassDark, { roughness: 0.9 }),
    water: standard(COLORS.water, { transparent: true, opacity: 0.78, roughness: 0.28, metalness: 0.02 }),
    waterFoam: standard(COLORS.waterFoam, { roughness: 0.36 }),
    rail: standard(COLORS.rail, { metalness: 0.24, roughness: 0.46 }),
    railDark: standard(COLORS.railDark, { metalness: 0.24, roughness: 0.5 }),
    sign: standard(COLORS.sign, { roughness: 0.5 }),
    statusOn: basic(COLORS.statusOn),
    statusOff: basic(COLORS.statusOff),
    treeTrunk: standard(COLORS.treeTrunk, { roughness: 0.82 }),
    treeA: standard(COLORS.treeA, { roughness: 0.86 }),
    treeB: standard(COLORS.treeB, { roughness: 0.86 }),
    bollard: standard(COLORS.bollard, { roughness: 0.62 }),
    bollardCap: standard(COLORS.bollardCap, { roughness: 0.58 }),
    city: standard(COLORS.city, { metalness: 0.1, roughness: 0.42 }),
    tandem: standard(COLORS.tandem, { metalness: 0.1, roughness: 0.42 }),
    child: standard(COLORS.child, { metalness: 0.1, roughness: 0.42 }),
    metal: standard(COLORS.metal, { metalness: 0.32, roughness: 0.38 }),
    tire: standard(COLORS.tire, { roughness: 0.56 }),
    saddle: standard(COLORS.saddle, { roughness: 0.72 }),
    white: standard(COLORS.white, { roughness: 0.64 })
  };
}

function addLighting(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 1.28));

  const sun = new THREE.DirectionalLight(0xfff7e8, 2.6);
  sun.position.set(7, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -11;
  sun.shadow.camera.right = 11;
  sun.shadow.camera.top = 11;
  sun.shadow.camera.bottom = -11;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xb8e8ff, 0.82);
  fill.position.set(-7, 7, -5);
  scene.add(fill);
}

function addGroundAndRoad(group, mats, store) {
  const base = box(store, 14.6, 0.16, 8.4, mats.concrete);
  base.position.y = -0.08;
  base.receiveShadow = true;
  group.add(base);

  const plaza = box(store, 7.3, 0.18, 3.0, mats.concreteDark);
  plaza.position.set(-1.55, 0.02, -1.25);
  group.add(plaza);

  const road = box(store, 14.9, 0.17, 1.66, mats.asphalt);
  road.position.set(0, 0.01, 2.55);
  group.add(road);

  const bikeLane = box(store, 14.9, 0.19, 0.46, mats.lane);
  bikeLane.position.set(0, 0.035, 1.86);
  group.add(bikeLane);

  for (let x = -6.4; x <= 6.4; x += 1.55) {
    const dash = box(store, 0.68, 0.2, 0.055, mats.laneStripe);
    dash.position.set(x, 0.055, 1.86);
    group.add(dash);
  }

  [-1, 1].forEach((side) => {
    const kerb = box(store, 14.9, 0.26, 0.12, mats.concreteDark);
    kerb.position.set(0, 0.09, 2.55 + side * 0.91);
    group.add(kerb);
  });

  const grassA = box(store, 14.7, 0.14, 1.28, mats.grass);
  grassA.position.set(0, 0.005, -3.54);
  group.add(grassA);

  const grassB = box(store, 14.7, 0.14, 0.8, mats.grassDark);
  grassB.position.set(0, 0.005, 3.84);
  group.add(grassB);

  const water = roundedPond(store, mats.water);
  water.position.set(4.8, 0.045, -3.46);
  group.add(water);

  const foam = roundedPond(store, mats.waterFoam, 1.13);
  foam.position.set(4.8, 0.024, -3.46);
  group.add(foam);

  return water;
}

function addBikeHub(group, mats, store) {
  const statusLights = [];

  const canopy = box(store, 5.2, 0.14, 1.58, mats.railDark);
  canopy.position.set(-1.75, 1.78, -1.46);
  group.add(canopy);

  const fascia = box(store, 4.2, 0.52, 0.08, mats.sign);
  fascia.position.set(-1.75, 1.5, -2.3);
  group.add(fascia);

  const signTexture = createSignTexture(store);
  const signMaterial = store.material(new THREE.MeshBasicMaterial({ map: signTexture, transparent: true }));
  const signText = plane(store, 4.05, 0.42, signMaterial);
  signText.position.set(-1.75, 1.505, -2.345);
  signText.rotation.x = 0;
  group.add(signText);

  for (const x of [-4.02, 0.52]) {
    for (const z of [-0.68, -2.18]) {
      const post = cylinderBetween(store, [x, 0.1, z], [x, 1.75, z], mats.rail);
      group.add(post);
    }
  }

  const dockBase = box(store, 5.6, 0.12, 0.54, mats.railDark);
  dockBase.position.set(-1.75, 0.08, -1.33);
  group.add(dockBase);

  [-3.78, -2.74, -1.7, -0.66, 0.38].forEach((x, index) => {
    const rack = addRack(group, mats, store, x, -1.32);
    const light = sphere(store, 0.065, index % 2 === 0 ? mats.statusOn : mats.statusOff, 16);
    light.position.set(x, 0.74, -1.72);
    light.userData.available = index % 2 === 0;
    group.add(light);
    statusLights.push(light);
    return rack;
  });

  return statusLights;
}

function addRack(group, mats, store, x, z) {
  const left = cylinderBetween(store, [x - 0.25, 0.08, z], [x - 0.25, 0.62, z], mats.rail, 0.028);
  const right = cylinderBetween(store, [x + 0.25, 0.08, z], [x + 0.25, 0.62, z], mats.rail, 0.028);
  const top = cylinderBetween(store, [x - 0.25, 0.62, z], [x + 0.25, 0.62, z], mats.rail, 0.028);
  group.add(left, right, top);
}

function addTrees(group, mats, store) {
  [
    [-6.3, -3.45, 0.68], [-5.2, -3.52, 0.55], [-3.8, -3.52, 0.62],
    [1.5, -3.58, 0.6], [2.7, -3.46, 0.52], [6.4, -3.45, 0.68],
    [-6.3, 3.78, 0.55], [-4.8, 3.72, 0.58], [-3.2, 3.82, 0.5],
    [1.0, 3.8, 0.56], [2.6, 3.78, 0.5]
  ].forEach(([x, z, scale]) => addTree(group, mats, store, x, z, scale));
}

function addTree(group, mats, store, x, z, scale = 1) {
  const trunk = cylinderBetween(store, [x, 0.06, z], [x, 0.58 * scale, z], mats.treeTrunk, 0.07 * scale);
  const crownA = sphere(store, 0.36 * scale, mats.treeA, 12);
  crownA.position.set(x, 0.78 * scale, z);
  crownA.scale.y = 0.88;
  const crownB = sphere(store, 0.28 * scale, mats.treeB, 10);
  crownB.position.set(x - 0.18 * scale, 0.68 * scale, z + 0.08 * scale);
  const crownC = sphere(store, 0.26 * scale, mats.treeB, 10);
  crownC.position.set(x + 0.2 * scale, 0.68 * scale, z - 0.05 * scale);
  group.add(trunk, crownA, crownB, crownC);
}

function addBollards(group, mats, store) {
  for (let x = -5.8; x <= 1.8; x += 1.25) addBollard(group, mats, store, x, 0.24);
  for (let x = -5.1; x <= 2.4; x += 1.25) addBollard(group, mats, store, x, 3.37);
}

function addBollard(group, mats, store, x, z) {
  const body = cylinderBetween(store, [x, 0.04, z], [x, 0.42, z], mats.bollard, 0.045);
  const cap = sphere(store, 0.07, mats.bollardCap, 10);
  cap.position.set(x, 0.46, z);
  group.add(body, cap);
}

function addBikes(group, mats, store) {
  return [
    addBike(group, mats, store, { type: 'city', x: -3.75, z: -1.16, rotationY: 0.03, scale: 0.76 }),
    addBike(group, mats, store, { type: 'tandem', x: -1.65, z: -1.18, rotationY: 0.02, scale: 0.64 }),
    addBike(group, mats, store, { type: 'child', x: 0.36, z: -1.16, rotationY: 0.02, scale: 0.76 }),
    addBike(group, mats, store, { type: 'city', x: -5.7, z: 0.9, rotationY: 0.18, scale: 0.7 }),
    addBike(group, mats, store, { type: 'tandem', x: 4.15, z: 0.4, rotationY: -0.2, scale: 0.6 }),
    addBike(group, mats, store, { type: 'child', x: 5.48, z: 0.96, rotationY: -0.12, scale: 0.7 })
  ];
}

function addBike(group, mats, store, options) {
  const type = options.type || 'city';
  const bike = new THREE.Group();
  bike.position.set(options.x || 0, 0.06, options.z || 0);
  bike.rotation.y = options.rotationY || 0;
  bike.scale.setScalar(options.scale || 1);

  const colorMat = type === 'tandem' ? mats.tandem : type === 'child' ? mats.child : mats.city;
  const wheelbase = type === 'tandem' ? 1.42 : 0.9;
  const rearX = -wheelbase / 2;
  const frontX = wheelbase / 2;
  const wheelRadius = type === 'tandem' ? 0.32 : 0.29;

  const rearWheel = addWheel(store, mats, wheelRadius);
  rearWheel.position.set(rearX, wheelRadius, 0);
  const frontWheel = addWheel(store, mats, wheelRadius);
  frontWheel.position.set(frontX, wheelRadius, 0);
  bike.add(rearWheel, frontWheel);

  addFrameTube(bike, store, rearX, wheelRadius, -0.18, 0.72, colorMat);
  addFrameTube(bike, store, -0.18, 0.72, 0.1, 0.42, colorMat);
  addFrameTube(bike, store, 0.1, 0.42, rearX, wheelRadius, colorMat);
  addFrameTube(bike, store, 0.1, 0.42, frontX, wheelRadius, colorMat);
  addFrameTube(bike, store, -0.18, 0.72, frontX - 0.16, 0.7, colorMat);
  addFrameTube(bike, store, frontX - 0.16, 0.7, frontX, wheelRadius, colorMat);

  const fork = cylinderBetween(store, [frontX, wheelRadius, 0], [frontX - 0.12, 0.88, 0], mats.metal, 0.025);
  const handle = cylinderBetween(store, [frontX - 0.22, 0.94, -0.16], [frontX - 0.02, 0.94, 0.16], mats.tire, 0.022);
  const seatPost = cylinderBetween(store, [-0.18, 0.62, 0], [-0.24, 0.94, 0], mats.metal, 0.022);
  const saddle = box(store, 0.32, 0.05, 0.16, mats.saddle);
  saddle.position.set(-0.28, 0.98, 0);
  saddle.rotation.z = -0.06;
  bike.add(fork, handle, seatPost, saddle);

  if (type === 'tandem') {
    addFrameTube(bike, store, -0.62, 0.7, 0.28, 0.7, colorMat);
    const secondPost = cylinderBetween(store, [0.28, 0.62, 0], [0.28, 0.94, 0], mats.metal, 0.022);
    const secondSaddle = box(store, 0.3, 0.05, 0.16, mats.saddle);
    secondSaddle.position.set(0.24, 0.98, 0);
    const rearHandle = cylinderBetween(store, [-0.03, 0.86, -0.13], [0.17, 0.86, 0.13], mats.tire, 0.018);
    bike.add(secondPost, secondSaddle, rearHandle);
  } else if (type === 'child') {
    const childSeat = box(store, 0.28, 0.24, 0.26, colorMat);
    childSeat.position.set(rearX - 0.08, 0.86, 0);
    const childBack = box(store, 0.08, 0.38, 0.28, colorMat);
    childBack.position.set(rearX - 0.22, 1.02, 0);
    const footLeft = box(store, 0.16, 0.03, 0.04, mats.metal);
    footLeft.position.set(rearX - 0.06, 0.63, 0.22);
    const footRight = footLeft.clone();
    footRight.geometry = footLeft.geometry;
    footRight.material = footLeft.material;
    footRight.position.z = -0.22;
    bike.add(childSeat, childBack, footLeft, footRight);
  } else {
    const basket = box(store, 0.28, 0.2, 0.26, mats.metal);
    basket.position.set(frontX + 0.15, 0.72, 0);
    basket.rotation.z = -0.05;
    bike.add(basket);
  }

  const crank = torusMesh(store, 0.09, 0.012, mats.tire);
  crank.position.set(0.08, 0.42, 0.025);
  bike.add(crank);

  group.add(bike);
  return bike;
}

function addWheel(store, mats, radius) {
  const wheel = new THREE.Group();
  const tire = torusMesh(store, radius, 0.035, mats.tire);
  tire.rotation.y = Math.PI / 2;
  const rim = torusMesh(store, radius * 0.76, 0.01, mats.metal);
  rim.rotation.y = Math.PI / 2;
  const hub = sphere(store, 0.045, mats.metal, 10);

  wheel.add(tire, rim, hub);
  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI * 2 * index) / 8;
    const spoke = cylinderBetween(
      store,
      [0, 0, 0],
      [Math.cos(angle) * radius * 0.72, Math.sin(angle) * radius * 0.72, 0],
      mats.metal,
      0.004
    );
    wheel.add(spoke);
  }
  return wheel;
}

function addFrameTube(group, store, x1, y1, x2, y2, material) {
  group.add(cylinderBetween(store, [x1, y1, 0], [x2, y2, 0], material, 0.026));
}

function createSignTexture(store) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  context.fillStyle = '#0b2f24';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#16a06e';
  context.fillRect(0, 0, 512, 14);
  context.fillRect(0, 114, 512, 14);
  context.fillStyle = '#ffffff';
  context.font = '800 34px Inter, Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('ECOPARK BIKE HUB', 256, 54);
  context.font = '700 19px Inter, Arial, sans-serif';
  context.fillStyle = '#bfe7d1';
  context.fillText('CITY / TANDEM / CHILD-SEAT', 256, 88);

  const texture = store.texture(new THREE.CanvasTexture(canvas));
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundedPond(store, material, scale = 1) {
  const shape = new THREE.Shape();
  const points = [
    [-1.45, -0.42], [-0.9, -0.82], [0.4, -0.78], [1.32, -0.35],
    [1.44, 0.35], [0.64, 0.72], [-0.54, 0.68], [-1.42, 0.24]
  ];
  points.forEach(([x, z], index) => {
    if (index === 0) shape.moveTo(x * scale, z * scale);
    else shape.lineTo(x * scale, z * scale);
  });
  shape.closePath();
  const pond = new THREE.Mesh(store.geometry(new THREE.ShapeGeometry(shape)), material);
  pond.rotation.x = -Math.PI / 2;
  pond.receiveShadow = true;
  return pond;
}

function box(store, width, height, depth, material) {
  return new THREE.Mesh(store.geometry(new THREE.BoxGeometry(width, height, depth)), material);
}

function sphere(store, radius, material, segments = 12) {
  return new THREE.Mesh(store.geometry(new THREE.SphereGeometry(radius, segments, Math.max(8, Math.floor(segments * 0.75)))), material);
}

function torusMesh(store, radius, tube, material) {
  return new THREE.Mesh(store.geometry(new THREE.TorusGeometry(radius, tube, 10, 32)), material);
}

function plane(store, width, height, material) {
  return new THREE.Mesh(store.geometry(new THREE.PlaneGeometry(width, height)), material);
}

function cylinderBetween(store, start, end, material, radius = 0.03) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);
  const length = direction.length();
  const cylinder = new THREE.Mesh(store.geometry(new THREE.CylinderGeometry(radius, radius, length, 12)), material);
  cylinder.position.copy(a.clone().add(b).multiplyScalar(0.5));
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return cylinder;
}
