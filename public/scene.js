/**
 * scene.js — Ecopark Bicycle Parking Dashboard
 * Isometric "Civic Mobility Command Center" scene
 *
 * API: export function mountScene(target: HTMLElement): () => void
 * Depends only on /vendor/three.module.js (provided by host app).
 */

import * as THREE from '/vendor/three.module.js';

/* ─────────────────────────── PALETTE ─────────────────────────── */
const C = {
  plaza:      0xf2ead8,
  path:       0xf7efd9,
  shore:      0xd9cfa9,
  meadow:     0xe6f5da,
  road:       0x5e6b73,
  lane:       0x5fb582,
  kerb:       0xe4e9df,
  grass:      0x70b85a,
  grassLight: 0xa9d979,
  shrub:      0x3f8c4d,
  reed:       0x9da34a,
  flowerA:    0xf59cab,
  flowerB:    0xfff7dc,
  flowerC:    0x8ac7e8,
  treeTop:    0x4fa34c,
  treeTopDark: 0x287244,
  treeTopLight: 0x78bf58,
  treeTrunk:  0x805b3b,
  water:      0x64c9dd,
  rack:       0xa7b9bd,
  rackBase:   0x71888c,
  roof:       0x2d8068,
  roofEdge:   0x185c4e,
  solar:      0x24536a,
  glass:      0x9bd8de,
  signBg:     0x0f5945,
  bollard:    0xd1d8d2,
  bollardTop: 0xffd84a,
  statusOn:   0x38e778,
  statusOff:  0xf06a5f,
  bikeCity:   0x10835c,
  bikeTandem: 0x1685b7,
  bikeChild:  0xc77a16,
  bikeGrey:   0x8aa0a6,
  bikeBlack:  0x2c2c2c,
  bikeSaddle: 0x4a2c0a,
  bikeRim:    0xe8eef2,
  personA:    0xf06d52,   // coral jacket
  personB:    0x6f65c8,   // soft violet jacket
  personC:    0xffc247,   // yellow jacket (child)
  skin:       0xf3c88b,
  pants:      0x34495e,
  ambientLight: 0xf4fff1,
  sunLight:   0xfff1c9,
};

/* ─────────────────────────── MODULE-LEVEL STATE ─────────────────
 * Allows mountScene to clean up any previously mounted scene
 * before creating a new one (module-singleton pattern).
 */
let cleanupScene = null;

/* ─────────────────────────── DISPOSE STORE ─────────────────────── */
class DisposeStore {
  constructor() {
    this._geos  = new Set();
    this._mats  = new Set();
    this._texs  = new Set();
  }
  geo(g)  { this._geos.add(g);  return g; }
  mat(m)  { this._mats.add(m);  return m; }
  tex(t)  { this._texs.add(t);  return t; }
  flush() {
    this._geos.forEach(g => g.dispose());
    this._texs.forEach(t => t.dispose());
    this._mats.forEach(m => m.dispose());
    this._geos.clear();
    this._texs.clear();
    this._mats.clear();
  }
}

/* ─────────────────────────── MATERIALS ─────────────────────────── */
function makeMats(store) {
  const lam  = (col, opts = {}) => store.mat(new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.72,
    metalness: 0.02,
    ...opts,
  }));
  const basic = col => store.mat(new THREE.MeshBasicMaterial({ color: col }));
  return {
    plaza:      lam(C.plaza),
    path:       lam(C.path),
    shore:      lam(C.shore),
    meadow:     lam(C.meadow),
    road:       lam(C.road),
    lane:       lam(C.lane),
    kerb:       lam(C.kerb),
    grass:      lam(C.grass),
    grassLight: lam(C.grassLight),
    shrub:      lam(C.shrub),
    reed:       lam(C.reed),
    flowerA:    lam(C.flowerA),
    flowerB:    lam(C.flowerB),
    flowerC:    lam(C.flowerC),
    treeTop:    lam(C.treeTop),
    treeTopDark: lam(C.treeTopDark),
    treeTopLight: lam(C.treeTopLight),
    treeTrunk:  lam(C.treeTrunk),
    rack:       lam(C.rack),
    rackBase:   lam(C.rackBase),
    roof:       lam(C.roof),
    roofEdge:   lam(C.roofEdge),
    solar:      lam(C.solar, { roughness: 0.34, metalness: 0.18 }),
    signBg:     lam(C.signBg),
    bollard:    lam(C.bollard),
    bollardTop: lam(C.bollardTop),
    bikeCity:   lam(C.bikeCity),
    bikeTandem: lam(C.bikeTandem),
    bikeChild:  lam(C.bikeChild),
    bikeGrey:   lam(C.bikeGrey),
    bikeBlack:  lam(C.bikeBlack),
    bikeSaddle: lam(C.bikeSaddle),
    bikeRim:    lam(C.bikeRim),
    personA:    lam(C.personA),
    personB:    lam(C.personB),
    personC:    lam(C.personC),
    skin:       lam(C.skin),
    pants:      lam(C.pants),
    water: store.mat(new THREE.MeshStandardMaterial({
      color: C.water,
      transparent: true,
      opacity: 0.76,
      roughness: 0.28,
      metalness: 0.0,
      emissive: 0x123d4a,
      emissiveIntensity: 0.08,
    })),
    glass: store.mat(new THREE.MeshStandardMaterial({
      color: C.glass,
      transparent: true,
      opacity: 0.42,
      roughness: 0.18,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })),
    waterRipple: store.mat(new THREE.MeshBasicMaterial({
      color: 0xdaf8ff,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    })),
    contactShadow: store.mat(new THREE.MeshBasicMaterial({
      color: 0x244b37,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
    })),
    statusOn:  basic(C.statusOn),
    statusOff: basic(C.statusOff),
    dashLine:  basic(0xffd700),
    laneMark:  basic(0xf0f8ff),
    signText:  basic(0xf0f8ff),
  };
}

/* ─────────────────────────── GEO / MESH HELPERS ─────────────────── */
const box   = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl   = (rt, rb, h, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
const torus = (r, t, rs = 8, ts = 16) => new THREE.TorusGeometry(r, t, rs, ts);
const sph   = (r, ws = 6, hs = 6)     => new THREE.SphereGeometry(r, ws, hs);

function roundedPlaneGeometry(w, d, r) {
  const shape = new THREE.Shape();
  const x = w * 0.5;
  const z = d * 0.5;
  const radius = Math.min(r, x, z);
  shape.moveTo(-x + radius, -z);
  shape.lineTo(x - radius, -z);
  shape.quadraticCurveTo(x, -z, x, -z + radius);
  shape.lineTo(x, z - radius);
  shape.quadraticCurveTo(x, z, x - radius, z);
  shape.lineTo(-x + radius, z);
  shape.quadraticCurveTo(-x, z, -x, z - radius);
  shape.lineTo(-x, -z + radius);
  shape.quadraticCurveTo(-x, -z, -x + radius, -z);
  const geo = new THREE.ShapeGeometry(shape, 24);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function organicLakeGeometry(scale = 1) {
  const s = scale;
  const shape = new THREE.Shape();
  shape.moveTo(-3.9 * s, -0.45 * s);
  shape.bezierCurveTo(-3.9 * s, -2.0 * s, -2.2 * s, -2.9 * s, -0.2 * s, -2.65 * s);
  shape.bezierCurveTo(2.4 * s, -2.95 * s, 4.1 * s, -1.55 * s, 3.85 * s, 0.25 * s);
  shape.bezierCurveTo(4.05 * s, 2.0 * s, 2.1 * s, 2.75 * s, -0.35 * s, 2.42 * s);
  shape.bezierCurveTo(-2.55 * s, 2.58 * s, -4.15 * s, 1.18 * s, -3.9 * s, -0.45 * s);
  const geo = new THREE.ShapeGeometry(shape, 36);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function mkMesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow    = true;
  m.receiveShadow = true;
  return m;
}

function at(obj, x, y, z) { obj.position.set(x, y, z); return obj; }

function addFlat(scene, store, mat, x, y, z, geo) {
  const mesh = mkMesh(store.geo(geo), mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  at(mesh, x, y, z);
  scene.add(mesh);
  return mesh;
}

function addContactShadow(scene, store, mat, x, z, radiusX, radiusZ = radiusX) {
  const shadow = mkMesh(store.geo(new THREE.CircleGeometry(1, 24)), mat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(radiusX, radiusZ, 1);
  shadow.castShadow = false;
  shadow.receiveShadow = false;
  at(shadow, x, 0.105, z);
  scene.add(shadow);
}

/* ─────────────────────────── WORLD BUILDERS ─────────────────────── */

function addGround(scene, mats, store) {
  const g = mkMesh(store.geo(box(26, 0.2, 16)), mats.meadow);
  at(g, 2, -0.1, -0.4);
  scene.add(g);
}

function addRoad(scene, mats, store) {
  const road = mkMesh(store.geo(box(26, 0.16, 3.25)), mats.road);
  at(road, 2, 0, 2.0);
  scene.add(road);

  const bikelane = mkMesh(store.geo(box(26, 0.17, 0.92)), mats.lane);
  at(bikelane, 2, 0, 0.75);
  scene.add(bikelane);

  for (const sz of [-0.56, 3.32]) {
    const kerb = mkMesh(store.geo(box(26, 0.24, 0.2)), mats.kerb);
    at(kerb, 2, 0, sz);
    scene.add(kerb);
  }

  for (let x = -10.5; x < 15; x += 2.6) {
    const dash = mkMesh(store.geo(box(1.45, 0.17, 0.065)), mats.dashLine);
    at(dash, x, 0.01, 2.0);
    scene.add(dash);
  }

  for (let x = -10.5; x < 15; x += 3.4) {
    const mark = mkMesh(store.geo(box(1.9, 0.18, 0.075)), mats.laneMark);
    at(mark, x, 0.02, 0.75);
    scene.add(mark);
  }
}

function addGrass(scene, mats, store) {
  const g1 = mkMesh(store.geo(box(26, 0.16, 7.5)), mats.grass);
  at(g1, 2, 0, -4.35);
  scene.add(g1);

  const g2 = mkMesh(store.geo(box(26, 0.16, 2.2)), mats.grassLight);
  at(g2, 2, 0, 5.45);
  scene.add(g2);
}

function addPath(scene, mats, store, x, z, w, d, ry = 0) {
  const path = addFlat(scene, store, mats.path, x, 0.135, z, roundedPlaneGeometry(w, d, Math.min(0.22, d * 0.45)));
  path.rotation.y = ry;
  return path;
}

function addParkPaths(scene, mats, store) {
  addPath(scene, mats, store, 2.0, -2.15, 18.0, 0.62);
  addPath(scene, mats, store, 7.0, -7.55, 6.8, 0.48);
  addPath(scene, mats, store, 10.9, -5.05, 0.5, 4.4);
  addPath(scene, mats, store, -6.7, -2.0, 2.8, 0.52, -0.12);
  addPath(scene, mats, store, 3.1, -0.95, 3.3, 1.5);
}

function addFlower(scene, mats, store, x, z, mat, scale = 1) {
  const stem = mkMesh(store.geo(cyl(0.015 * scale, 0.02 * scale, 0.16 * scale, 5)), mats.reed);
  at(stem, x, 0.20 * scale, z);
  const bloom = mkMesh(store.geo(sph(0.055 * scale, 6, 5)), mat);
  at(bloom, x, 0.31 * scale, z);
  scene.add(stem, bloom);
}

function addPlanting(scene, mats, store) {
  const flowers = [
    [-7.6, -2.7, 'flowerA'], [-7.25, -2.55, 'flowerB'], [-6.9, -2.72, 'flowerC'],
    [1.9, -2.72, 'flowerB'], [2.25, -2.56, 'flowerA'], [2.6, -2.72, 'flowerC'],
    [9.7, -2.65, 'flowerA'], [10.1, -2.55, 'flowerB'],
  ];
  for (const [x, z, matName] of flowers) addFlower(scene, mats, store, x, z, mats[matName], 1.0);

  const reeds = [
    [4.25, -3.65], [4.05, -6.25], [10.15, -4.0], [9.55, -6.85],
    [5.55, -7.05], [7.1, -3.05], [8.8, -3.0],
  ];
  for (const [x, z] of reeds) {
    for (let i = 0; i < 3; i++) {
      const reed = mkMesh(store.geo(cyl(0.018, 0.025, 0.55 + i * 0.08, 5)), mats.reed);
      at(reed, x + (i - 1) * 0.08, 0.28 + i * 0.04, z + (i % 2 ? 0.06 : -0.04));
      reed.rotation.z = (i - 1) * 0.08;
      scene.add(reed);
    }
  }
}

function addShrub(scene, mats, store, x, z, scale = 1) {
  const group = new THREE.Group();
  const placements = [
    [-0.28, 0.02, 0.34, 'shrub'],
    [0.18, -0.06, 0.42, 'treeTopDark'],
    [0.38, 0.10, 0.30, 'treeTopLight'],
  ];
  for (const [dx, dz, radius, matName] of placements) {
    const crown = mkMesh(store.geo(sph(radius * scale, 7, 5)), mats[matName]);
    at(crown, x + dx * scale, radius * 0.7 * scale, z + dz * scale);
    group.add(crown);
  }
  scene.add(group);
}

function addShrubs(scene, mats, store) {
  const clusters = [
    [-8.3, -3.25, 0.8], [-7.2, -3.45, 0.72],
    [1.8, -3.45, 0.74], [2.8, -3.35, 0.82],
    [3.5, -6.8, 0.9], [10.5, -6.6, 0.78],
    [-7.8, 4.9, 0.72], [10.5, 4.95, 0.82],
  ];
  for (const [x, z, scale] of clusters) addShrub(scene, mats, store, x, z, scale);
}

function addPond(scene, mats, store) {
  addFlat(scene, store, mats.shore, 7.3, 0.112, -5.15, organicLakeGeometry(0.93));
  const pond = addFlat(scene, store, mats.water, 7.3, 0.132, -5.15, organicLakeGeometry(0.83));

  for (const [x, z, radius, scaleX] of [[6.35, -4.75, 0.42, 1.35], [8.7, -5.72, 0.3, 1.5]]) {
    const ripple = mkMesh(store.geo(torus(radius, 0.018, 5, 32)), mats.waterRipple);
    ripple.rotation.x = Math.PI / 2;
    ripple.scale.x = scaleX;
    at(ripple, x, 0.148, z);
    ripple.castShadow = false;
    scene.add(ripple);
  }

  for (const [px, pz, scale] of [[6.2,-4.7,1],[8.7,-5.9,0.8],[9.6,-4.45,0.9],[6.6,-6.2,0.75]]) {
    const lily = mkMesh(store.geo(cyl(0.18 * scale, 0.18 * scale, 0.035, 10)), mats.grass);
    at(lily, px, 0.145, pz);
    scene.add(lily);
  }

  return pond;
}

function addTree(scene, mats, store, x, z, scale = 1.0) {
  const trunkH = 1.2 * scale;
  const canopyR = 0.86 * scale;
  const trunk = mkMesh(store.geo(cyl(0.14 * scale, 0.18 * scale, trunkH, 7)), mats.treeTrunk);
  at(trunk, x, trunkH * 0.5, z);
  addContactShadow(scene, store, mats.contactShadow, x + 0.18 * scale, z + 0.12 * scale, 0.78 * scale, 0.42 * scale);
  const canopy1 = mkMesh(store.geo(sph(canopyR, 9, 7)), mats.treeTop);
  at(canopy1, x, trunkH + canopyR * 0.62, z);
  const canopy2 = mkMesh(store.geo(sph(canopyR * 0.68, 8, 6)), mats.treeTopDark);
  at(canopy2, x + 0.18 * scale, trunkH + canopyR * 1.05, z - 0.08 * scale);
  const canopy3 = mkMesh(store.geo(sph(canopyR * 0.52, 7, 6)), mats.treeTopLight);
  at(canopy3, x - 0.28 * scale, trunkH + canopyR * 0.9, z + 0.08 * scale);
  scene.add(trunk, canopy1, canopy2, canopy3);
  return canopy1;
}

function addTrees(scene, mats, store) {
  const roadside = [
    [-8.4, -4.4, 0.9], [-7.0, -5.0, 1.08], [-5.5, -4.25, 0.82],
    [0.8, -4.25, 0.82], [2.15, -4.75, 1.02],
  ];
  const lakeTrees = [
    [3.45, -4.55, 1.22], [3.6, -6.55, 1.05],
    [10.75, -4.25, 1.28], [10.45, -6.4, 1.12],
    [7.0, -7.6, 1.18], [8.65, -7.35, 0.96],
  ];
  const farside = [
    [-8.8, 5.35, 0.86], [-6.7, 5.65, 1.03], [-3.7, 5.4, 0.82],
    [9.2, 5.4, 0.88], [11.0, 5.7, 1.02],
  ];

  const canopies = [];
  for (const [x, z, sc] of roadside) {
    canopies.push(addTree(scene, mats, store, x, z, sc));
  }
  for (const [x, z, sc] of lakeTrees) {
    canopies.push(addTree(scene, mats, store, x, z, sc));
  }
  for (const [x, z, sc] of farside) {
    canopies.push(addTree(scene, mats, store, x, z, sc));
  }
  return canopies;
}

function addBollard(scene, mats, store, x, z) {
  const body = mkMesh(store.geo(cyl(0.08, 0.1, 0.55, 7)), mats.bollard);
  at(body, x, 0.275, z);
  const cap  = mkMesh(store.geo(cyl(0.09, 0.09, 0.06, 7)), mats.bollardTop);
  at(cap, x, 0.58, z);
  scene.add(body, cap);
}

function addBollards(scene, mats, store) {
  for (const x of [-7, -4.5, -2, 0, 2]) addBollard(scene, mats, store, x, -0.25);
  for (const x of [-6, -3.5, -1, 1.5])  addBollard(scene, mats, store, x,  3.4);
}

/* ─────────────────────── BIKE HUB STATION ─────────────────────── */

function addRack(scene, mats, store, cx, cz, statusMat) {
  const base = mkMesh(store.geo(box(0.82, 0.1, 0.46)), mats.rackBase);
  at(base, cx, 0.05, cz);
  scene.add(base);

  for (const dx of [-0.28, 0.28]) {
    const post = mkMesh(store.geo(cyl(0.048, 0.048, 0.58, 7)), mats.rack);
    at(post, cx + dx, 0.39, cz);
    scene.add(post);
  }

  const bar = mkMesh(store.geo(box(0.58, 0.07, 0.07)), mats.rack);
  at(bar, cx, 0.68, cz);
  scene.add(bar);

  const led = mkMesh(store.geo(sph(0.065, 5, 5)), statusMat);
  at(led, cx, 0.76, cz);
  scene.add(led);
  return led;
}

function addHubCanopy(scene, mats, store) {
  const hubX = -2.2;
  const hubZ = -1.85;

  const pad = mkMesh(store.geo(box(9.2, 0.2, 3.35)), mats.plaza);
  at(pad, hubX, 0.1, hubZ);
  scene.add(pad);

  const roof = mkMesh(store.geo(box(8.6, 0.16, 2.9)), mats.roof);
  at(roof, hubX, 2.58, hubZ);
  scene.add(roof);

  const roofEdge = mkMesh(store.geo(box(8.8, 0.28, 0.16)), mats.roofEdge);
  at(roofEdge, hubX, 2.52, -0.38);
  scene.add(roofEdge);

  const roofGarden = mkMesh(store.geo(box(8.05, 0.08, 2.34)), mats.grassLight);
  at(roofGarden, hubX, 2.70, hubZ);
  scene.add(roofGarden);

  for (const sx of [-5.15, -3.15, -1.15, 0.85]) {
    const panel = mkMesh(store.geo(box(1.58, 0.055, 0.76)), mats.solar);
    at(panel, sx, 2.76, -1.62);
    scene.add(panel);
  }

  for (const [x, z] of [[-6.0, -0.62], [1.6, -0.62], [-6.0, -3.08], [1.6, -3.08]]) {
    const col = mkMesh(store.geo(cyl(0.095, 0.095, 2.45, 8)), mats.rack);
    at(col, x, 1.23, z);
    scene.add(col);
  }

  const glassWall = mkMesh(store.geo(box(7.25, 1.7, 0.055)), mats.glass);
  at(glassWall, hubX, 1.18, -3.18);
  glassWall.castShadow = false;
  scene.add(glassWall);

  const sign = mkMesh(store.geo(box(4.5, 0.52, 0.09)), mats.signBg);
  at(sign, hubX, 2.1, -0.31);
  scene.add(sign);

  // Canvas sign text — no ctx.letterSpacing for cross-browser safety
  const canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#155442';
  ctx.fillRect(0, 0, 512, 64);
  ctx.font         = 'bold 34px system-ui, sans-serif';
  ctx.fillStyle    = '#f0f8ff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ECOBIKE  \u00B7  ECOPARK', 256, 32);

  const tex     = store.tex(new THREE.CanvasTexture(canvas));
  const textMat = store.mat(new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  const signTxt = mkMesh(store.geo(new THREE.PlaneGeometry(4.35, 0.44)), textMat);
  signTxt.castShadow = false;
  at(signTxt, hubX, 2.1, -0.255);
  scene.add(signTxt);

  const servicePad = mkMesh(store.geo(box(3.0, 0.13, 1.45)), mats.path);
  at(servicePad, 3.05, 0.12, -1.02);
  scene.add(servicePad);

  const wayfinding = mkMesh(store.geo(box(0.48, 1.45, 0.2)), mats.signBg);
  at(wayfinding, 2.05, 0.82, -2.85);
  scene.add(wayfinding);

  for (const y of [0.78, 1.02, 1.26]) {
    const stripe = mkMesh(store.geo(box(0.34, 0.055, 0.215)), mats.signText);
    at(stripe, 2.05, y, -2.86);
    scene.add(stripe);
  }
}

function addHubStation(scene, mats, store) {
  addHubCanopy(scene, mats, store);

  const leds = [];
  const rackCfgs = [
    [-5.35, -1.55, 'statusOn'],
    [-4.10, -1.55, 'statusOff'],
    [-2.85, -1.55, 'statusOn'],
    [-1.60, -1.55, 'statusOff'],
    [-0.35, -1.55, 'statusOn'],
    [ 0.90, -1.55, 'statusOff'],
  ];
  for (const [x, z, status] of rackCfgs) {
    const led = addRack(scene, mats, store, x, z, mats[status]);
    leds.push({ led, isOn: status === 'statusOn' });
  }

  const benchBase = mkMesh(store.geo(box(1.35, 0.12, 0.42)), mats.kerb);
  at(benchBase, -7.15, 0.18, -1.0);
  const benchSeat = mkMesh(store.geo(box(1.35, 0.08, 0.44)), mats.rackBase);
  at(benchSeat, -7.15, 0.31, -1.0);
  scene.add(benchBase, benchSeat);

  return leds;
}

/* ─────────────────────────── BICYCLES ─────────────────────────── */

const BIKE_LANE_RIDE_Y = 0.12;
const HUB_CITY_RIDE_Y = 0.236;
const HUB_TANDEM_RIDE_Y = 0.247;
const SERVICE_TANDEM_RIDE_Y = 0.231;

function addBikeTube(root, store, mat, x1, y1, x2, y2, thickness = 0.055, z = 0.035) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len <= 0.001) return null;
  const tube = mkMesh(store.geo(box(len, thickness, thickness)), mat);
  at(tube, x1 + dx * 0.5, y1 + dy * 0.5, z);
  tube.rotation.z = Math.atan2(dy, dx);
  root.add(tube);
  return tube;
}

function buildWheel(mats, store, r = 0.28) {
  const g = new THREE.Group();
  // TorusGeometry is already in the XY plane, which is the upright wheel plane
  // for a bike moving along the X axis and viewed from the positive Z side.
  const rim  = mkMesh(store.geo(torus(r, 0.028, 8, 16)), mats.bikeRim);
  const hub  = mkMesh(store.geo(cyl(0.05, 0.05, 0.07, 7)), mats.bikeGrey);
  // hub axle runs along Z (depth), cylinder default is along Y → rotate X by PI/2
  hub.rotation.x = Math.PI / 2;
  const tyre = mkMesh(store.geo(torus(r, 0.042, 8, 16)), mats.bikeBlack);
  for (const angle of [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75]) {
    const spoke = mkMesh(store.geo(box(r * 1.55, 0.014, 0.014)), mats.bikeGrey);
    spoke.rotation.z = angle;
    g.add(spoke);
  }
  g.add(rim, hub, tyre);
  return g;
}

function buildHandlebar(mats, store) {
  const g = new THREE.Group();
  addBikeTube(g, store, mats.bikeGrey, 0, 0, 0.16, 0.17, 0.045);
  const grip = mkMesh(store.geo(box(0.28, 0.045, 0.05)), mats.bikeBlack);
  at(grip, 0.24, 0.18, 0.035);
  g.add(grip);
  return g;
}

function addCityBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const rear = [-0.42, 0.30];
  const front = [0.42, 0.30];
  const crank = [-0.03, 0.43];
  const seat = [-0.26, 0.72];
  const head = [0.33, 0.66];
  const wF = buildWheel(mats, store, 0.29); at(wF, front[0], front[1], 0);
  const wR = buildWheel(mats, store, 0.29); at(wR, rear[0], rear[1], 0);
  root.add(wF, wR);

  addBikeTube(root, store, mats.bikeCity, rear[0], rear[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeCity, front[0], front[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeCity, crank[0], crank[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeCity, seat[0], seat[1], head[0], head[1]);
  addBikeTube(root, store, mats.bikeCity, rear[0], rear[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeGrey, front[0], front[1], head[0], head[1], 0.05);
  const hb = buildHandlebar(mats, store);
  at(hb, head[0], head[1], 0);
  root.add(hb);

  const saddle = mkMesh(store.geo(box(0.22, 0.04, 0.1)), mats.bikeSaddle);
  at(saddle, seat[0] - 0.02, seat[1] + 0.09, 0.045);
  root.add(saddle);

  // Basket
  const bask = mkMesh(store.geo(box(0.22, 0.16, 0.18)), mats.bikeGrey);
  at(bask, 0.53, 0.61, 0.04);
  root.add(bask);

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addTandemBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const rear = [-0.72, 0.31];
  const front = [0.72, 0.31];
  const crankRear = [-0.38, 0.43];
  const crankFront = [0.26, 0.43];
  const seatRear = [-0.55, 0.76];
  const seatFront = [0.15, 0.78];
  const head = [0.62, 0.68];
  const wF = buildWheel(mats, store, 0.31); at(wF, front[0], front[1], 0);
  const wR = buildWheel(mats, store, 0.31); at(wR, rear[0], rear[1], 0);
  root.add(wF, wR);

  addBikeTube(root, store, mats.bikeTandem, rear[0], rear[1], crankRear[0], crankRear[1]);
  addBikeTube(root, store, mats.bikeTandem, crankRear[0], crankRear[1], crankFront[0], crankFront[1]);
  addBikeTube(root, store, mats.bikeTandem, crankFront[0], crankFront[1], front[0], front[1]);
  addBikeTube(root, store, mats.bikeTandem, crankRear[0], crankRear[1], seatRear[0], seatRear[1]);
  addBikeTube(root, store, mats.bikeTandem, crankFront[0], crankFront[1], seatFront[0], seatFront[1]);
  addBikeTube(root, store, mats.bikeTandem, seatRear[0], seatRear[1], seatFront[0], seatFront[1]);
  addBikeTube(root, store, mats.bikeTandem, seatFront[0], seatFront[1], head[0], head[1]);
  addBikeTube(root, store, mats.bikeGrey, front[0], front[1], head[0], head[1], 0.05);
  const hb = buildHandlebar(mats, store);
  at(hb, head[0], head[1], 0);
  root.add(hb);

  for (const sx of [seatFront[0], seatRear[0]]) {
    const sad = mkMesh(store.geo(box(0.24, 0.045, 0.12)), mats.bikeSaddle);
    at(sad, sx, 0.88, 0.045);
    root.add(sad);
  }

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addChildBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const rear = [-0.39, 0.28];
  const front = [0.39, 0.28];
  const crank = [-0.04, 0.41];
  const seat = [-0.22, 0.70];
  const head = [0.30, 0.62];
  const wF = buildWheel(mats, store, 0.27); at(wF, front[0], front[1], 0);
  const wR = buildWheel(mats, store, 0.27); at(wR, rear[0], rear[1], 0);
  root.add(wF, wR);

  addBikeTube(root, store, mats.bikeChild, rear[0], rear[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeChild, front[0], front[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeChild, crank[0], crank[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeChild, seat[0], seat[1], head[0], head[1]);
  addBikeTube(root, store, mats.bikeChild, rear[0], rear[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeGrey, front[0], front[1], head[0], head[1], 0.05);
  const hb = buildHandlebar(mats, store);
  at(hb, head[0], head[1], 0);
  root.add(hb);

  const sad = mkMesh(store.geo(box(0.20, 0.04, 0.1)), mats.bikeSaddle);
  at(sad, seat[0], 0.80, 0.045);
  root.add(sad);

  // Child seat
  const csb = mkMesh(store.geo(box(0.26, 0.14, 0.2)), mats.bikeChild);
  at(csb, -0.49, 0.62, 0.045);
  const csBack = mkMesh(store.geo(box(0.06, 0.22, 0.2)), mats.bikeChild);
  at(csBack, -0.60, 0.72, 0.045);
  const csPad = mkMesh(store.geo(box(0.22, 0.06, 0.17)), mats.bikeSaddle);
  at(csPad, -0.48, 0.70, 0.07);
  root.add(csb, csBack, csPad);

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addBikes(scene, mats, store) {
  const city = addCityBike(scene, mats, store, -5.35, HUB_CITY_RIDE_Y, -1.55, 0);
  const tandem = addTandemBike(scene, mats, store, -2.85, HUB_TANDEM_RIDE_Y, -1.55, 0);
  const child = addChildBike(scene, mats, store, -0.35, HUB_CITY_RIDE_Y, -1.55, 0);
  city.scale.setScalar(1.12);
  tandem.scale.setScalar(1.12);
  child.scale.setScalar(1.12);

  const overflow = addTandemBike(scene, mats, store, 3.25, SERVICE_TANDEM_RIDE_Y, -1.0, 0);
  overflow.scale.setScalar(1.08);
}

/* ─────────────────────────── MOVING BIKE ─────────────────────── */

/**
 * Build a simple silhouette city bike for the lane animation.
 * Returns root group (not yet in scene).
 */
function buildMovingBike(mats, store) {
  const root = new THREE.Group();
  const rear = [-0.39, 0.28];
  const front = [0.39, 0.28];
  const crank = [-0.02, 0.41];
  const seat = [-0.24, 0.70];
  const head = [0.31, 0.62];
  const wF = buildWheel(mats, store, 0.27); at(wF, front[0], front[1], 0);
  const wR = buildWheel(mats, store, 0.27); at(wR, rear[0], rear[1], 0);
  root.add(wF, wR);
  root.userData.wheels = [wF, wR];
  root.userData.direction = -1;

  addBikeTube(root, store, mats.bikeCity, rear[0], rear[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeCity, front[0], front[1], crank[0], crank[1]);
  addBikeTube(root, store, mats.bikeCity, crank[0], crank[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeCity, seat[0], seat[1], head[0], head[1]);
  addBikeTube(root, store, mats.bikeCity, rear[0], rear[1], seat[0], seat[1]);
  addBikeTube(root, store, mats.bikeGrey, front[0], front[1], head[0], head[1], 0.05);

  const hb = buildHandlebar(mats, store);
  at(hb, head[0], head[1], 0);
  root.add(hb);

  const sad = mkMesh(store.geo(box(0.2, 0.04, 0.09)), mats.bikeSaddle);
  at(sad, seat[0], 0.80, 0.045);
  root.add(sad);

  // Rider (simple silhouette)
  const body = mkMesh(store.geo(box(0.14, 0.32, 0.12)), mats.personA);
  at(body, -0.05, 1.05, 0);
  const riderHead = mkMesh(store.geo(sph(0.1, 6, 5)), mats.skin);
  at(riderHead, -0.01, 1.28, 0);
  root.add(body, riderHead);

  return root;
}

/* ─────────────────────────── PATH UTILS ─────────────────────── */

/**
 * Compute arc-length-parameterised closed path.
 * Returns function(t) → {x, z, angle} where t ∈ [0,1).
 */
function makeClosedPath(points) {
  const n = points.length;
  const segs = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len <= 0.0001) continue;
    total += len;
    segs.push({ a, b, dx, dz, len, cum: total });
  }
  if (!segs.length) {
    return function sampleStationaryPath() {
      const point = points[0] || [0, 0];
      return { x: point[0], z: point[1], angle: 0 };
    };
  }
  return function samplePath(t) {
    const target = ((t % 1) + 1) % 1;          // clamp [0,1)
    const dist = target * total;
    let seg = segs[segs.length - 1];
    for (let i = 0; i < segs.length; i++) {
      if (segs[i].cum >= dist) { seg = segs[i]; break; }
    }
    const prev = seg.a;
    const cumPrev = seg.cum - seg.len;
    const localT = (dist - cumPrev) / seg.len;
    return {
      x:     prev[0] + seg.dx * localT,
      z:     prev[1] + seg.dz * localT,
      angle: Math.atan2(seg.dx, seg.dz),
    };
  };
}

/* ─────────────────────────── PEDESTRIANS ─────────────────────── */

/**
 * Build a low-poly person.
 * Pivot groups for limbs are placed AT the joint (shoulder / hip)
 * so rotation.x swings the limb correctly downward from that joint.
 */
function buildPerson(mats, store, jackMat, scale = 1.0) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  // ── Torso (box, origin at centre)
  const torso = mkMesh(store.geo(box(0.20, 0.28, 0.13)), jackMat);
  at(torso, 0, 0.50, 0);          // torso centre at y=0.50
  root.add(torso);

  // ── Head (sphere, sitting on top of torso)
  const head = mkMesh(store.geo(sph(0.115, 7, 6)), mats.skin);
  at(head, 0, 0.785, 0);
  root.add(head);

  // ── Hips pivot at y=0.36 (bottom of torso)
  // Left leg: pivot at hip, limb hangs DOWN from pivot
  const leftLeg = new THREE.Group();
  at(leftLeg, -0.055, 0.36, 0);
  const llMesh = mkMesh(store.geo(box(0.085, 0.26, 0.085)), mats.pants);
  at(llMesh, 0, -0.13, 0);        // hang down from hip pivot
  leftLeg.add(llMesh);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  at(rightLeg, 0.055, 0.36, 0);
  const rlMesh = mkMesh(store.geo(box(0.085, 0.26, 0.085)), mats.pants);
  at(rlMesh, 0, -0.13, 0);
  rightLeg.add(rlMesh);
  root.add(rightLeg);

  // ── Shoulder pivots at y=0.62 (top of torso)
  const leftArm = new THREE.Group();
  at(leftArm, -0.145, 0.62, 0);
  const laMesh = mkMesh(store.geo(box(0.075, 0.24, 0.075)), jackMat);
  at(laMesh, 0, -0.12, 0);        // hang down from shoulder pivot
  leftArm.add(laMesh);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  at(rightArm, 0.145, 0.62, 0);
  const raMesh = mkMesh(store.geo(box(0.075, 0.24, 0.075)), jackMat);
  at(raMesh, 0, -0.12, 0);
  rightArm.add(raMesh);
  root.add(rightArm);

  // Feet (small boxes, below hips)
  for (const [sx] of [[-0.055], [0.055]]) {
    const foot = mkMesh(store.geo(box(0.075, 0.055, 0.13)), mats.bikeBlack);
    at(foot, sx, 0.085, 0.025);
    root.add(foot);
  }

  return { root, leftLeg, rightLeg, leftArm, rightArm };
}

/**
 * Add all pedestrian figures to scene.
 * Returns array of update() functions called each frame.
 */
function addPedestrians(scene, mats, store) {
  const updaters = [];

  /* ── Person A: walks a loop across the plaza ── */
  const pathA = makeClosedPath([
    [-7.5, -2.2],
    [-6.4, -2.75],
    [-5.0, -2.4],
    [-4.0, -2.85],
    [-5.2, -3.2],
    [-6.8, -3.0],
  ]);

  const pA = buildPerson(mats, store, mats.personA, 0.95);
  scene.add(pA.root);

  const LOOP_A = 14.0; // seconds for one circuit
  updaters.push(function updatePersonA(elapsed) {
    const t = (elapsed % LOOP_A) / LOOP_A;
    const pos = pathA(t);
    at(pA.root, pos.x, 0, pos.z);
    pA.root.rotation.y = pos.angle + Math.PI * 0.5;

    const stride = Math.sin(t * Math.PI * 2 * 6) * 0.4; // leg swing
    pA.leftLeg.rotation.x  =  stride;
    pA.rightLeg.rotation.x = -stride;
    pA.leftArm.rotation.x  = -stride * 0.5;
    pA.rightArm.rotation.x =  stride * 0.5;
  });

  /* ── Person B: stands near rack, bobs and inspects ── */
  const pB = buildPerson(mats, store, mats.personB, 0.90);
  at(pB.root, 1.15, 0.16, -1.25);
  pB.root.rotation.y = -Math.PI * 0.35;
  scene.add(pB.root);

  updaters.push(function updatePersonB(elapsed) {
    // Subtle body bob and arm raise (checking bike)
    pB.root.position.y = 0.16 + Math.sin(elapsed * 1.2) * 0.018;
    const inspect = 0.2 + 0.25 * Math.sin(elapsed * 0.7);
    pB.rightArm.rotation.x = -inspect;
    pB.leftArm.rotation.x  = -inspect * 0.3;
  });

  /* ── Child C: small figure on the lakeside path, waves arm ── */
  const pC = buildPerson(mats, store, mats.personC, 0.65);
  at(pC.root, 4.55, 0.08, -2.35);
  scene.add(pC.root);

  updaters.push(function updatePersonC(elapsed) {
    // Wave + little jump-bob
    pC.root.position.y = 0.08 + Math.max(0, Math.sin(elapsed * 3.1) * 0.07);
    pC.rightArm.rotation.x = -0.5 - 0.7 * Math.abs(Math.sin(elapsed * 2.8));
    pC.leftArm.rotation.x  = 0.2 * Math.sin(elapsed * 1.4);
    pC.root.rotation.y = Math.PI * 0.15 + 0.18 * Math.sin(elapsed * 0.5);
  });

  return updaters;
}

/* ─────────────────────────── LIGHTING ─────────────────────────── */
function addLighting(scene) {
  scene.add(new THREE.HemisphereLight(0xf8fff4, 0x71956d, 1.15));
  scene.add(new THREE.AmbientLight(C.ambientLight, 0.28));

  const sun = new THREE.DirectionalLight(C.sunLight, 2.85);
  sun.position.set(-9, 20, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  Object.assign(sun.shadow.camera, { near: 0.5, far: 70, left: -16, right: 16, top: 15, bottom: -15 });
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xcdeeff, 0.38);
  fill.position.set(10, 8, -8);
  scene.add(fill);
}

/* ─────────────────────────── CAMERA ─────────────────────────── */
function responsiveFrustum(aspect) {
  if (aspect > 2.8) return 4.8;
  if (aspect > 2.2) return 5.0;
  if (aspect > 1.7) return 5.45;
  if (aspect > 1.2) return 6.1;
  return 6.8;
}

function makeCamera(w, h) {
  const aspect  = w / h;
  const frustum = responsiveFrustum(aspect);
  const cam = new THREE.OrthographicCamera(
    -frustum * aspect, frustum * aspect,
    frustum, -frustum,
    0.1, 200
  );
  cam.position.set(2, 15.5, 22);
  cam.lookAt(2, 0.35, -1.75);
  return cam;
}

/* ─────────────────────────── RESIZE ─────────────────────────── */
function makeResizeHandler(renderer, camera, container) {
  return function onResize() {
    const w = container.clientWidth  || 600;
    const h = container.clientHeight || 320;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(w, h);
    renderer.setPixelRatio(pr);

    const aspect  = w / h;
    const frustum = responsiveFrustum(aspect);
    camera.left   = -frustum * aspect;
    camera.right  =  frustum * aspect;
    camera.top    =  frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  };
}

/* ─────────────────────────── ANIMATION HELPERS ─────────────────── */

function animateBikeAlongLane(bike, elapsed, dt = 0) {
  // Bike lane centre line is at z ≈ 0.75, road runs along X.
  // Loop: x from -11 to +11, then back (closed loop via path).
  const LOOP = 16.0; // seconds
  const t = (elapsed % LOOP) / LOOP;
  const angle = t * Math.PI * 2;

  // Smooth closed loop: go left-to-right then right-to-left via sin curve
  // Use parametric: x = cos(2πt) * 10, which gives smooth ping-pong
  const x = Math.cos(angle) * 10.2;
  const dx = -Math.sin(angle); // derivative for heading

  bike.position.x = x;
  bike.position.z = 0.75;
  bike.position.y = BIKE_LANE_RIDE_Y;

  // Face direction of travel
  if (Math.abs(dx) > 0.02) {
    bike.userData.direction = dx < 0 ? -1 : 1;
  }
  bike.rotation.y = bike.userData.direction < 0 ? Math.PI : 0;

  const wheelSpeed = Math.abs(dx) * 10.2 * (2 * Math.PI / LOOP);
  const wheelSpin = bike.userData.direction < 0 ? 1 : -1;
  for (const wheel of bike.userData.wheels || []) {
    wheel.rotation.z += wheelSpin * wheelSpeed * dt * 3.2;
  }
}

function animateStatusLights(leds, elapsed) {
  for (const { led, isOn } of leds) {
    const s = isOn
      ? 1.0 + 0.18 * Math.abs(Math.sin(elapsed * 2.1))
      : 0.85 + 0.06 * Math.abs(Math.sin(elapsed * 0.9 + 1.2));
    if (led.userData.lastScale === undefined || Math.abs(led.userData.lastScale - s) > 0.002) {
      led.scale.setScalar(s);
      led.userData.lastScale = s;
    }
  }
}

function animatePond(pond, elapsed) {
  // Wider shimmer range on large lake surface
  pond.material.opacity = 0.82 + 0.10 * (0.5 + 0.5 * Math.sin(elapsed * 1.1));
}

function animateTrees(canopies, elapsed) {
  // Very subtle sway, each tree slightly offset
  for (let i = 0; i < canopies.length; i++) {
    const phase = i * 0.61;
    canopies[i].rotation.z = 0.015 * Math.sin(elapsed * 0.8 + phase);
    canopies[i].rotation.x = 0.010 * Math.sin(elapsed * 0.6 + phase + 1.0);
  }
}

/* ─────────────────────────── MOUNT (public API) ─────────────────── */
export function mountScene(target) {
  // Clean up any previously mounted scene
  if (cleanupScene) cleanupScene();

  if (!target) return;

  /* ── Renderer ── */
  const w  = target.clientWidth  || 600;
  const h  = target.clientHeight || 320;
  const pr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(pr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.classList.add('park-scene-canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;';
  target.replaceChildren(canvas);

  /* ── Scene ── */
  const scene = new THREE.Scene();

  /* ── Dispose store & materials ── */
  const store = new DisposeStore();
  const mats  = makeMats(store);

  /* ── World ── */
  addLighting(scene);
  addGround(scene, mats, store);
  addRoad(scene, mats, store);
  addGrass(scene, mats, store);
  addParkPaths(scene, mats, store);
  const pond     = addPond(scene, mats, store);
  const canopies = addTrees(scene, mats, store);
  addPlanting(scene, mats, store);
  addShrubs(scene, mats, store);
  addBollards(scene, mats, store);
  const leds     = addHubStation(scene, mats, store);
  addBikes(scene, mats, store);

  // Animated bike on lane
  const movingBike = buildMovingBike(mats, store);
  scene.add(movingBike);

  // Pedestrians
  const pedUpdaters = addPedestrians(scene, mats, store);

  /* ── Camera ── */
  const camera = makeCamera(w, h);

  /* ── Resize ── */
  const onResize = makeResizeHandler(renderer, camera, target);
  window.addEventListener('resize', onResize);

  /* ── Reduced motion check ── */
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Animate ── */
  let raf     = null;
  let elapsed = 0;
  let lastTs  = null;

  function animate(ts) {
    raf = requestAnimationFrame(animate);
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05); // cap at 50ms
    lastTs = ts;
    elapsed += prefersReduced ? 0 : dt;

    animateBikeAlongLane(movingBike, elapsed, prefersReduced ? 0 : dt);
    for (const upd of pedUpdaters) upd(elapsed);
    animateStatusLights(leds, elapsed);
    animatePond(pond, elapsed);
    animateTrees(canopies, elapsed);

    renderer.render(scene, camera);
  }

  // Render at least one frame even if reduced motion
  if (prefersReduced) {
    // Single static frame
    animateBikeAlongLane(movingBike, 0, 0);
    for (const upd of pedUpdaters) upd(0);
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(animate);
  }

  /* ── Cleanup ── */
  function cleanup() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    window.removeEventListener('resize', onResize);
    store.flush();
    renderer.dispose();
    target.replaceChildren();
    cleanupScene = null;
  }

  cleanupScene = cleanup;
  return cleanup;
}
