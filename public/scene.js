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
  plaza:      0xd8dfe8,
  road:       0x4a5568,
  lane:       0x6b7c93,
  kerb:       0xb0bac8,
  grass:      0x5a8a5a,
  treeTop:    0x3a7a3a,
  treeTopDark: 0x2d6a2d,
  treeTrunk:  0x6b4a2a,
  water:      0x5b9bd5,
  rack:       0x8899aa,
  rackBase:   0x5c6e82,
  signBg:     0x1a3a5c,
  bollard:    0x9baabd,
  bollardTop: 0xf5d020,
  statusOn:   0x22d95e,
  statusOff:  0xe05555,
  bikeCity:   0x27ae60,
  bikeTandem: 0x2980b9,
  bikeChild:  0xe67e22,
  bikeGrey:   0x7f8c8d,
  bikeBlack:  0x2c2c2c,
  bikeSaddle: 0x4a2c0a,
  bikeRim:    0xd0d8e0,
  personA:    0xe74c3c,   // red jacket
  personB:    0x8e44ad,   // purple jacket
  personC:    0xf39c12,   // yellow jacket (child)
  skin:       0xf0c080,
  pants:      0x34495e,
  ambientLight: 0x8090b0,
  sunLight:   0xfff8e8,
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
  const lam  = col => store.mat(new THREE.MeshLambertMaterial({ color: col }));
  const basic = col => store.mat(new THREE.MeshBasicMaterial({ color: col }));
  return {
    plaza:      lam(C.plaza),
    road:       lam(C.road),
    lane:       lam(C.lane),
    kerb:       lam(C.kerb),
    grass:      lam(C.grass),
    treeTop:    lam(C.treeTop),
    treeTopDark: lam(C.treeTopDark),
    treeTrunk:  lam(C.treeTrunk),
    rack:       lam(C.rack),
    rackBase:   lam(C.rackBase),
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
    water: store.mat(new THREE.MeshBasicMaterial({
      color: 0x4a9fd4, transparent: true, opacity: 0.88,
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

function mkMesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow    = true;
  m.receiveShadow = true;
  return m;
}

function at(obj, x, y, z) { obj.position.set(x, y, z); return obj; }

/* ─────────────────────────── WORLD BUILDERS ─────────────────────── */

function addGround(scene, mats, store) {
  // Wider ground to accommodate lake on right side
  const g = mkMesh(store.geo(box(32, 0.15, 20)), mats.plaza);
  at(g, 2, -0.075, 0);
  scene.add(g);
}

function addRoad(scene, mats, store) {
  // Main road — runs along X axis (left-right in scene space)
  const road = mkMesh(store.geo(box(32, 0.16, 3.2)), mats.road);
  at(road, 2, 0, 1.8);
  scene.add(road);

  // Bike lane stripe (near side of road)
  const bikelane = mkMesh(store.geo(box(32, 0.17, 0.85)), mats.lane);
  at(bikelane, 2, 0, 0.7);
  scene.add(bikelane);

  // Kerbs
  for (const sz of [-0.5, 3.1]) {
    const kerb = mkMesh(store.geo(box(32, 0.22, 0.18)), mats.kerb);
    at(kerb, 2, 0, sz);
    scene.add(kerb);
  }

  // Dashed centre line
  for (let x = -13; x < 18; x += 2.4) {
    const dash = mkMesh(store.geo(box(1.4, 0.17, 0.06)), mats.dashLine);
    at(dash, x, 0.01, 1.8);
    scene.add(dash);
  }

  // Short white lane markers help the bike lane read clearly in small heroes.
  for (let x = -12; x < 17; x += 3.2) {
    const mark = mkMesh(store.geo(box(1.8, 0.18, 0.08)), mats.laneMark);
    at(mark, x, 0.02, 0.7);
    scene.add(mark);
  }
}

function addGrass(scene, mats, store) {
  // Wide grass strip between road and lake
  const g1 = mkMesh(store.geo(box(32, 0.16, 8.5)), mats.grass);
  at(g1, 2, 0, -5.75);
  scene.add(g1);

  // Narrow grass strip on far side of road
  const g2 = mkMesh(store.geo(box(32, 0.16, 2.8)), mats.grass);
  at(g2, 2, 0, 6.4);
  scene.add(g2);
}

function addPond(scene, mats, store) {
  // Large prominent lake — Ecopark landmark feature
  const pond = mkMesh(store.geo(box(7.5, 0.14, 5.0)), mats.water);
  at(pond, 8.0, 0.04, -5.5);
  scene.add(pond);

  // Stone/kerb rim around lake
  for (const [w, d, ox, oz] of [
    [8.1, 0.28, 8.0,  -8.15],   // far edge
    [8.1, 0.28, 8.0,  -2.85],   // near edge
    [0.28, 5.3, 4.05, -5.5],    // left edge
    [0.28, 5.3, 11.95,-5.5],    // right edge
  ]) {
    const rim = mkMesh(store.geo(box(w, 0.20, d)), mats.kerb);
    at(rim, ox, 0.04, oz);
    scene.add(rim);
  }

  // Pathway stones around lake perimeter
  for (const [ox, oz, rw, rd] of [
    [4.3, -5.5, 0.6, 4.6],  // left walkway
    [11.7, -5.5, 0.6, 4.6], // right walkway
  ]) {
    const walk = mkMesh(store.geo(box(rw, 0.16, rd)), mats.plaza);
    at(walk, ox, 0.04, oz);
    scene.add(walk);
  }

  // Floating lily pad decorations (small flat circles on water)
  for (const [px, pz] of [[6.5,-4.8],[9.2,-6.3],[11.0,-4.5],[7.0,-6.8]]) {
    const lily = mkMesh(store.geo(cyl(0.18, 0.18, 0.04, 8)), mats.grass);
    at(lily, px, 0.12, pz);
    scene.add(lily);
  }

  return pond;
}

function addTree(scene, mats, store, x, z, scale = 1.0) {
  const trunkH = 1.2 * scale;
  const canopyR = 0.95 * scale;
  const trunk = mkMesh(store.geo(cyl(0.14 * scale, 0.18 * scale, trunkH, 7)), mats.treeTrunk);
  at(trunk, x, trunkH * 0.5, z);
  // Layered canopy for fuller look
  const canopy1 = mkMesh(store.geo(sph(canopyR, 8, 7)), mats.treeTop);
  at(canopy1, x, trunkH + canopyR * 0.7, z);
  const canopy2 = mkMesh(store.geo(sph(canopyR * 0.72, 7, 6)), mats.treeTopDark);
  at(canopy2, x + 0.15 * scale, trunkH + canopyR * 1.1, z - 0.1 * scale);
  scene.add(trunk, canopy1, canopy2);
  return canopy1; // primary for sway
}

function addTrees(scene, mats, store) {
  // Trees along road (near side, roadside strip) — medium
  const roadside = [
    [-10, -4.5], [-7.5, -4.5], [-5, -4.5], [-2.5, -4.5],
    [0,   -4.5], [2.5,  -4.5],
  ];
  // Large feature trees around/beside the lake
  const lakeTrees = [
    [4.0, -4.8, 1.4],   // lake left front
    [4.0, -7.2, 1.3],   // lake left back
    [12.2,-4.8, 1.5],   // lake right front (big feature)
    [12.2,-7.5, 1.4],   // lake right back
    [8.0, -9.2, 1.3],   // lake far back centre
    [10.0,-9.0, 1.2],
    [6.0, -9.0, 1.2],
  ];
  // Trees on far side of road (bottom of scene)
  const farside = [
    [-10, 6.2, 1.0], [-7, 6.2, 1.1], [-4, 6.0, 1.0],
    [0,   6.2, 1.0], [3,  6.0, 1.0],
  ];

  const canopies = [];
  for (const [x, z] of roadside) {
    canopies.push(addTree(scene, mats, store, x, z, 0.95));
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
  const base = mkMesh(store.geo(box(1.4, 0.1, 0.5)), mats.rackBase);
  at(base, cx, 0.05, cz);
  scene.add(base);

  for (const dx of [-0.5, 0.5]) {
    const post = mkMesh(store.geo(cyl(0.055, 0.055, 0.72, 6)), mats.rack);
    at(post, cx + dx, 0.46, cz);
    scene.add(post);
  }

  const bar = mkMesh(store.geo(box(1.1, 0.07, 0.07)), mats.rack);
  at(bar, cx, 0.845, cz);
  scene.add(bar);

  const led = mkMesh(store.geo(sph(0.065, 5, 5)), statusMat);
  at(led, cx, 0.92, cz);
  scene.add(led);
  return led;
}

function addHubCanopy(scene, mats, store) {
  const roof = mkMesh(store.geo(box(6.5, 0.14, 2.8)), mats.rackBase);
  at(roof, -1.5, 2.4, -2.1);
  scene.add(roof);

  for (const [dx, dz] of [[-2.8, -0.9], [2.8, -0.9], [-2.8, -3.3], [2.8, -3.3]]) {
    const col = mkMesh(store.geo(cyl(0.08, 0.08, 2.3, 5)), mats.rack);
    at(col, -1.5 + dx, 1.15, -2.1 + dz);
    scene.add(col);
  }

  const sign = mkMesh(store.geo(box(5.2, 0.55, 0.08)), mats.signBg);
  at(sign, -1.5, 2.15, -3.56);
  scene.add(sign);

  // Canvas sign text — no ctx.letterSpacing for cross-browser safety
  const canvas = document.createElement('canvas');
  canvas.width  = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a3a5c';
  ctx.fillRect(0, 0, 512, 64);
  ctx.font         = 'bold 34px system-ui, sans-serif';
  ctx.fillStyle    = '#f0f8ff';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BIKE HUB  \u00B7  ECOPARK', 256, 32);

  const tex     = store.tex(new THREE.CanvasTexture(canvas));
  const textMat = store.mat(new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  const signTxt = mkMesh(store.geo(box(5.2, 0.55, 0.09)), textMat);
  at(signTxt, -1.5, 2.15, -3.57);
  scene.add(signTxt);

  const pad = mkMesh(store.geo(box(7.0, 0.17, 3.8)), mats.kerb);
  at(pad, -1.5, 0.085, -2.1);
  scene.add(pad);
}

function addHubStation(scene, mats, store) {
  addHubCanopy(scene, mats, store);

  const leds = [];
  const rackCfgs = [
    [-3.6, -1.8, 'statusOn'],
    [-2.0, -1.8, 'statusOff'],
    [-0.4, -1.8, 'statusOn'],
    [ 1.2, -1.8, 'statusOff'],
    [ 2.8, -1.8, 'statusOn'],
    [ 4.4, -1.8, 'statusOff'],
  ];
  for (const [x, z, status] of rackCfgs) {
    const led = addRack(scene, mats, store, x, z, mats[status]);
    leds.push({ led, isOn: status === 'statusOn' });
  }

  // Small decorative bench near hub
  for (const bx of [-5.5, -7.0]) {
    const benchBase = mkMesh(store.geo(box(0.9, 0.12, 0.38)), mats.kerb);
    at(benchBase, bx, 0.18, -0.8);
    const benchSeat = mkMesh(store.geo(box(0.9, 0.07, 0.40)), mats.rackBase);
    at(benchSeat, bx, 0.30, -0.8);
    scene.add(benchBase, benchSeat);
  }

  return leds;
}

/* ─────────────────────────── BICYCLES ─────────────────────────── */

function buildWheel(mats, store, r = 0.28) {
  const g = new THREE.Group();
  // Torus default lies flat (XZ plane). rotation.x = PI/2 stands it upright (XY plane).
  // Bike travels along X axis, so an upright wheel faces the camera correctly.
  const rim  = mkMesh(store.geo(torus(r, 0.028, 8, 16)), mats.bikeRim);
  rim.rotation.x = Math.PI / 2;
  const hub  = mkMesh(store.geo(cyl(0.05, 0.05, 0.07, 7)), mats.bikeGrey);
  // hub axle runs along Z (depth), cylinder default is along Y → rotate X by PI/2
  hub.rotation.x = Math.PI / 2;
  const tyre = mkMesh(store.geo(torus(r, 0.042, 8, 16)), mats.bikeBlack);
  tyre.rotation.x = Math.PI / 2;
  g.add(rim, hub, tyre);
  return g;
}

function buildHandlebar(mats, store) {
  const g    = new THREE.Group();
  // Horizontal stem bar running along Z axis (width of bike)
  const stem = mkMesh(store.geo(box(0.06, 0.06, 0.36)), mats.bikeGrey);
  g.add(stem);
  // Grip ends
  for (const s of [-1, 1]) {
    const grip = mkMesh(store.geo(box(0.05, 0.05, 0.08)), mats.bikeBlack);
    at(grip, 0, 0, s * 0.22);
    g.add(grip);
  }
  return g;
}

function addCityBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const wF = buildWheel(mats, store, 0.28); at(wF, 0.38, 0.28, 0);
  const wR = buildWheel(mats, store, 0.28); at(wR, -0.38, 0.28, 0);
  root.add(wF, wR);

  const tt = mkMesh(store.geo(box(0.66, 0.04, 0.04)), mats.bikeCity);
  at(tt, -0.02, 0.56, 0);
  const st = mkMesh(store.geo(box(0.04, 0.5, 0.04)), mats.bikeCity);
  at(st, -0.32, 0.44, 0);
  root.add(tt, st);

  const fork = mkMesh(store.geo(box(0.04, 0.38, 0.04)), mats.bikeGrey);
  at(fork, 0.38, 0.48, 0);
  const hb = buildHandlebar(mats, store);
  at(hb, 0.38, 0.68, 0);
  root.add(fork, hb);

  const saddle = mkMesh(store.geo(box(0.22, 0.04, 0.1)), mats.bikeSaddle);
  at(saddle, -0.3, 0.82, 0);
  root.add(saddle);

  // Basket
  const bask = mkMesh(store.geo(box(0.22, 0.16, 0.18)), mats.bikeGrey);
  at(bask, 0.48, 0.60, 0);
  root.add(bask);

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addTandemBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const wF = buildWheel(mats, store, 0.30); at(wF,  0.65, 0.30, 0);
  const wR = buildWheel(mats, store, 0.30); at(wR, -0.65, 0.30, 0);
  root.add(wF, wR);

  const tt = mkMesh(store.geo(box(1.15, 0.045, 0.045)), mats.bikeTandem);
  at(tt, 0, 0.62, 0);
  const sf = mkMesh(store.geo(box(0.045, 0.42, 0.045)), mats.bikeTandem);
  at(sf, 0.32, 0.45, 0);
  const sr = mkMesh(store.geo(box(0.045, 0.38, 0.045)), mats.bikeTandem);
  at(sr, -0.42, 0.42, 0);
  const bb = mkMesh(store.geo(box(1.1, 0.04, 0.04)), mats.bikeTandem);
  at(bb, 0, 0.10, 0);
  root.add(tt, sf, sr, bb);

  const fork = mkMesh(store.geo(box(0.045, 0.38, 0.045)), mats.bikeGrey);
  at(fork, 0.65, 0.50, 0);
  const hb = buildHandlebar(mats, store);
  at(hb, 0.65, 0.72, 0);
  root.add(fork, hb);

  for (const sx of [0.18, -0.52]) {
    const sad = mkMesh(store.geo(box(0.24, 0.045, 0.12)), mats.bikeSaddle);
    at(sad, sx, 0.88, 0);
    root.add(sad);
  }

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addChildBike(scene, mats, store, x, y, z, ry = 0) {
  const root = new THREE.Group();
  root.rotation.y = ry;

  const wF = buildWheel(mats, store, 0.27); at(wF,  0.37, 0.27, 0);
  const wR = buildWheel(mats, store, 0.27); at(wR, -0.37, 0.27, 0);
  root.add(wF, wR);

  const tt = mkMesh(store.geo(box(0.64, 0.045, 0.045)), mats.bikeChild);
  at(tt, 0, 0.56, 0);
  const st = mkMesh(store.geo(box(0.045, 0.42, 0.045)), mats.bikeChild);
  at(st, -0.22, 0.42, 0);
  root.add(tt, st);

  const fork = mkMesh(store.geo(box(0.04, 0.36, 0.04)), mats.bikeGrey);
  at(fork, 0.37, 0.46, 0);
  const hb = buildHandlebar(mats, store);
  at(hb, 0.37, 0.66, 0);
  root.add(fork, hb);

  const sad = mkMesh(store.geo(box(0.20, 0.04, 0.1)), mats.bikeSaddle);
  at(sad, -0.2, 0.78, 0);
  root.add(sad);

  // Child seat
  const csb = mkMesh(store.geo(box(0.26, 0.14, 0.2)), mats.bikeChild);
  at(csb, -0.46, 0.62, 0);
  const csBack = mkMesh(store.geo(box(0.06, 0.22, 0.2)), mats.bikeChild);
  at(csBack, -0.57, 0.72, 0);
  const csPad = mkMesh(store.geo(box(0.22, 0.06, 0.17)), mats.bikeSaddle);
  at(csPad, -0.45, 0.70, 0);
  root.add(csb, csBack, csPad);

  at(root, x, y, z);
  scene.add(root);
  return root;
}

function addBikes(scene, mats, store) {
  // Docked in racks
  addCityBike(scene,   mats, store, -3.6, 0.0, -1.8, 0);
  addTandemBike(scene, mats, store, -0.4, 0.0, -1.8, 0);
  addChildBike(scene,  mats, store,  2.8, 0.0, -1.8, 0);

  // Parked loose
  addTandemBike(scene, mats, store,  5.8, 0.0, -0.3, -Math.PI * 0.05);
  addChildBike(scene,  mats, store,  4.5, 0.0,  0.5,  Math.PI * 0.10);
}

/* ─────────────────────────── MOVING BIKE ─────────────────────── */

/**
 * Build a simple silhouette city bike for the lane animation.
 * Returns root group (not yet in scene).
 */
function buildMovingBike(mats, store) {
  const root = new THREE.Group();
  const wF = buildWheel(mats, store, 0.26); at(wF,  0.35, 0.26, 0);
  const wR = buildWheel(mats, store, 0.26); at(wR, -0.35, 0.26, 0);
  root.add(wF, wR);
  root.userData.wheels = [wF, wR];
  root.userData.direction = -1;

  const tt = mkMesh(store.geo(box(0.6, 0.04, 0.04)), mats.bikeCity);
  at(tt, 0, 0.52, 0);
  const st = mkMesh(store.geo(box(0.04, 0.44, 0.04)), mats.bikeCity);
  at(st, -0.28, 0.42, 0);
  const fork = mkMesh(store.geo(box(0.04, 0.35, 0.04)), mats.bikeGrey);
  at(fork, 0.35, 0.44, 0);
  root.add(tt, st, fork);

  const hb = buildHandlebar(mats, store);
  at(hb, 0.35, 0.64, 0);
  root.add(hb);

  const sad = mkMesh(store.geo(box(0.2, 0.04, 0.09)), mats.bikeSaddle);
  at(sad, -0.28, 0.76, 0);
  root.add(sad);

  // Rider (simple silhouette)
  const body = mkMesh(store.geo(box(0.14, 0.32, 0.12)), mats.personA);
  at(body, -0.05, 1.05, 0);
  const head = mkMesh(store.geo(sph(0.1, 6, 5)), mats.skin);
  at(head, -0.01, 1.28, 0);
  root.add(body, head);

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
    [-7.5,  0.1],
    [-4.0,  0.1],
    [-1.5, -0.5],
    [ 1.0, -0.4],
    [-2.0, -1.0],
    [-5.0, -0.8],
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
  at(pB.root, 3.5, 0, -1.6);
  pB.root.rotation.y = -Math.PI * 0.35;
  scene.add(pB.root);

  updaters.push(function updatePersonB(elapsed) {
    // Subtle body bob and arm raise (checking bike)
    pB.root.position.y = Math.sin(elapsed * 1.2) * 0.018;
    const inspect = 0.2 + 0.25 * Math.sin(elapsed * 0.7);
    pB.rightArm.rotation.x = -inspect;
    pB.leftArm.rotation.x  = -inspect * 0.3;
  });

  /* ── Child C: small figure near pond, waves arm ── */
  const pC = buildPerson(mats, store, mats.personC, 0.65);
  at(pC.root, 6.2, 0, -3.8);
  scene.add(pC.root);

  updaters.push(function updatePersonC(elapsed) {
    // Wave + little jump-bob
    pC.root.position.y = Math.max(0, Math.sin(elapsed * 3.1) * 0.07);
    pC.rightArm.rotation.x = -0.5 - 0.7 * Math.abs(Math.sin(elapsed * 2.8));
    pC.leftArm.rotation.x  = 0.2 * Math.sin(elapsed * 1.4);
    pC.root.rotation.y = Math.PI * 0.15 + 0.18 * Math.sin(elapsed * 0.5);
  });

  return updaters;
}

/* ─────────────────────────── LIGHTING ─────────────────────────── */
function addLighting(scene) {
  scene.add(new THREE.AmbientLight(C.ambientLight, 1.2));

  const sun = new THREE.DirectionalLight(C.sunLight, 2.0);
  sun.position.set(4, 16, 14);   // from same side as camera → consistent shadows
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { near: 0.5, far: 80, left: -20, right: 20, top: 20, bottom: -20 });
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xb0d8ff, 0.55);
  fill.position.set(-6, 8, -4);
  scene.add(fill);
}

/* ─────────────────────────── CAMERA ─────────────────────────── */
function responsiveFrustum(aspect) {
  if (aspect < 1.7) return 12.0;
  if (aspect > 2.2) return 9.5;
  return 10.5;
}

function makeCamera(w, h) {
  const aspect  = w / h;
  const frustum = responsiveFrustum(aspect);
  const cam = new THREE.OrthographicCamera(
    -frustum * aspect, frustum * aspect,
    frustum, -frustum,
    0.1, 200
  );
  // Slight azimuth keeps the road mostly horizontal while giving lake/tree depth.
  cam.position.set(2.5, 17, 19);
  cam.lookAt(1.8, 0, -2.5);
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
  // Bike lane centre line is at z ≈ 0.7, road runs along X.
  // Loop: x from -11 to +11, then back (closed loop via path).
  const LOOP = 16.0; // seconds
  const t = (elapsed % LOOP) / LOOP;
  const angle = t * Math.PI * 2;

  // Smooth closed loop: go left-to-right then right-to-left via sin curve
  // Use parametric: x = cos(2πt) * 10, which gives smooth ping-pong
  const x = Math.cos(angle) * 10.2;
  const dx = -Math.sin(angle); // derivative for heading

  bike.position.x = x;
  bike.position.z = 0.7;
  bike.position.y = 0;

  // Face direction of travel
  if (Math.abs(dx) > 0.02) {
    bike.userData.direction = dx < 0 ? -1 : 1;
  }
  bike.rotation.y = bike.userData.direction < 0 ? Math.PI : 0;

  const wheelSpeed = Math.abs(dx) * 10.2 * (2 * Math.PI / LOOP);
  for (const wheel of bike.userData.wheels || []) {
    wheel.rotation.z += wheelSpeed * dt * 3.2;
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
  const pond     = addPond(scene, mats, store);
  const canopies = addTrees(scene, mats, store);
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
