# Đề xuất cải thiện: Scene 3D và Giao diện Ecopark Bicycle Parking

> **Phạm vi tài liệu:** `public/scene.js` (Three.js scene) và `public/app.js` + `public/styles.css` (UI shell).
> Mọi đề xuất đều giữ nguyên API contract hiện tại, không thay đổi backend, test hoặc cấu trúc HTML ngoài file CSS/JS trên.

---

## Phần 1 — Scene 3D (`public/scene.js`)

### 1.1 Vấn đề hiện tại

| Vấn đề | Mô tả |
|---|---|
| Camera side-on hoàn toàn | `cam.position.set(0, 18, 18)` tạo góc nhìn đối xứng tuyệt đối, không có azimuth → scene trông flat, thiếu chiều sâu |
| Road chiếm ít diện tích ngang | Trục X của road chia đôi viewport nhưng không "dẫn mắt" từ trái sang phải theo đường dài |
| Lake bị ép sang phải | Lake ở `x=8.0` thường bị cắt ở hero hẹp (`334×220` mobile), người dùng không thấy yếu tố đặc trưng Ecopark |
| Moving bike trajectory giật | `cos(t * π * 2)` tạo ping-pong nhưng không khớp hướng `rotation.y`, bike bị xoay đột ngột tại điểm đảo chiều |
| Pedestrian path A có gap | `makeClosedPath` có đoạn cuối nối điểm `[-7.5, 0.1]` về điểm `[-7.5, 0.1]`, đoạn này có độ dài 0 → hàm `samplePath` chia cho 0 khi `seg.len === 0` |
| Tree canopy layer 2 màu hardcode | `0x2d6a2d` không qua `DisposeStore` và không responsive với palette `C` |
| Status LED scale animation | Nhân với `scale.setScalar` mỗi frame mà không cache giá trị → tạo GC pressure nhỏ trên mobile |

### 1.2 Đề xuất cụ thể

#### A. Tinh chỉnh camera — ưu tiên cao

```js
// Thay thế makeCamera() hiện tại:
function makeCamera(w, h) {
  const aspect  = w / h;
  // Tăng frustum lên 11 để scene không bị crop ở mobile 334px
  const frustum = 11.0;
  const cam = new THREE.OrthographicCamera(
    -frustum * aspect, frustum * aspect,
    frustum, -frustum,
    0.1, 200
  );
  // Azimuth nhẹ ~8°: camera lệch sang phải một chút, lake hiện rõ hơn
  // mà road vẫn gần ngang trong viewport
  cam.position.set(2.5, 17, 19);
  cam.lookAt(1.8, 0, -2.5);
  return cam;
}
```

**Lý do:** Góc `(2.5, 17, 19)` tạo azimuth ~7.5° so với pure side-on. Ở hero `430×226`, road vẫn nghiêng < 12° so với đường ngang — đọc được như trục ngang. Lake tại `x=8` dịch vào center-right của viewport thay vì bị cắt.

#### B. Sửa moving bike — ưu tiên cao

Vấn đề: `cos(t * 2π)` tạo smooth ping-pong nhưng `rotation.y` dùng `atan2(dx, 0)` không tính dấu đúng khi `dx < 0`.

```js
function animateBikeAlongLane(bike, elapsed) {
  const LOOP = 16.0;
  const t = (elapsed % LOOP) / LOOP;
  const angle = t * Math.PI * 2;
  const x = Math.cos(angle) * 10.2;
  // dx là derivative của x theo t (không theo angle)
  const dx = -Math.sin(angle);

  bike.position.set(x, 0, 0.7);
  // Khi dx < 0: bike đi sang trái, facing = +π (mặt sang trái)
  // Khi dx > 0: bike đi sang phải, facing = 0
  // Thêm Math.PI/2 vì model built dọc trục X, cần rotate thêm
  bike.rotation.y = dx < 0 ? Math.PI : 0;

  // Wheel spin tỉ lệ với vận tốc
  const speed = Math.abs(dx) * 10.2 * (2 * Math.PI / LOOP);
  bike.traverse((child) => {
    if (child.isMesh && child.geometry?.type === 'TorusGeometry') {
      // Chỉ rotate rim/tyre, bỏ qua hub
      child.rotation.y += speed * (1 / 60); // assume 60fps
    }
  });
}
```

**Cách thực tế tốt hơn:** Thay `traverse` (heavy) bằng lưu reference wheels khi build:

```js
function buildMovingBike(mats, store) {
  const root = new THREE.Group();
  const wheels = []; // track để animate riêng
  const wF = buildWheel(mats, store, 0.26);
  wheels.push(wF);
  at(wF, 0.35, 0.26, 0);
  // ... rest unchanged
  root.userData.wheels = wheels;
  return root;
}
```

Sau đó trong animate loop:

```js
const wheelSpin = Math.abs(Math.sin(elapsed * Math.PI * 2 / 16)) * 0.18;
for (const w of movingBike.userData.wheels || []) {
  w.rotation.z = elapsed * 4.2; // Z axis vì wheel đứng theo XY plane
}
```

#### C. Sửa path gap Person A — ưu tiên trung bình

```js
// Bỏ điểm trùng cuối:
const pathA = makeClosedPath([
  [-7.5,  0.1],
  [-4.0,  0.1],
  [-1.5, -0.5],
  [ 1.0, -0.4],
  [-2.0, -1.0],
  [-5.0, -0.8],
  // Xóa [-7.5, 0.1] trùng — makeClosedPath tự nối cuối-đầu
]);
```

`makeClosedPath` đã dùng `(i + 1) % n` nên điểm cuối → điểm đầu được tự thêm. Điểm trùng hiện tại tạo segment dài 0, gây division-by-zero khi `localT = (dist - cumPrev) / seg.len`.

#### D. Đưa tree dark canopy vào DisposeStore — ưu tiên thấp

```js
// Trong addTree(), thay:
const canopy2 = mkMesh(store.geo(sph(canopyR * 0.72, 7, 6)),
  store.mat(new THREE.MeshLambertMaterial({ color: 0x2d6a2d })));
// Thêm color vào palette C:
// C.treeTopDark: 0x2d6a2d
```

#### E. Thêm bollard lane marking — ưu tiên thấp (visual detail)

Bike lane hiện chỉ là màu khác. Thêm marking dashes trắng trên lane để phân biệt rõ hơn trong hero nhỏ:

```js
function addLaneMarkings(scene, mats, store) {
  for (let x = -12; x < 16; x += 3.2) {
    const mark = mkMesh(store.geo(box(1.8, 0.18, 0.08)), mats.dashLine);
    at(mark, x, 0.01, 0.7); // z=0.7 là bike lane centre
    scene.add(mark);
  }
}
```

#### F. Frustum responsive theo aspect — ưu tiên trung bình

Hero mobile `334×220` có aspect ~1.52, frustum `10` → objects bị thu nhỏ và lake bị cắt. Hero auth `600×320` có CSS `transform: scale(1.55)` làm canvas thực tế nhỏ hơn.

```js
function makeResizeHandler(renderer, camera, container) {
  return function onResize() {
    const w = container.clientWidth  || 600;
    const h = container.clientHeight || 320;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setSize(w, h);
    renderer.setPixelRatio(pr);

    const aspect = w / h;
    // Frustum động: wider viewport → tighter frustum để objects lớn hơn
    // narrow viewport (mobile ~1.5) → frustum lớn hơn để không crop
    const frustum = aspect < 1.7 ? 12.0 : aspect > 2.2 ? 9.5 : 10.5;
    camera.left   = -frustum * aspect;
    camera.right  =  frustum * aspect;
    camera.top    =  frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  };
}
```

---

## Phần 2 — Giao diện (`app.js` + `styles.css`)

### 2.1 Vấn đề hiện tại

| Vấn đề | Mô tả |
|---|---|
| Auth scene CSS scale | `.auth-scene .park-scene-canvas { transform: scale(1.55) }` zoom canvas nhưng không clip overflow → scene tràn ra ngoài container trên một số viewport |
| Hero scene bị thay thế hoàn toàn khi render | `mountScene` gọi `target.replaceChildren(canvas)` → mỗi lần `render()` chạy (kể cả khi chỉ refresh data) đều destroy và rebuild canvas + WebGL context |
| Custom dropdown z-index conflict | `.rental-flow-panel:has(.pretty-select.open)` đặt `z-index: 35` nhưng `.topbar` sticky `z-index: 12` → dropdown của report filter bị che bởi topbar khi panel scroll lên |
| Bike card `grid-template-rows: auto 42px` cố định | Trên mobile khi `flex-direction` thay đổi, `rent-row` không nhận đủ chiều cao, nút Thuê bị cắt trên một số Android Chrome |
| `section-heading` flex không wrap | Trên viewport 360–390px, nút "Xuất CSV" và text badge có thể tràn ra ngoài `section-heading` vì `flex-wrap: nowrap` |
| GPS demo `/gd` không có loading state | Khi tải dữ liệu lần đầu (`refreshGpsDemoData`), toàn bộ `.gps-demo-grid` trống và không có skeleton/spinner → người dùng không biết app đang tải |
| `animateBikeAlongLane` gọi trong RAF không có `dt` clamp cho high-refresh | Trên 120Hz display, elapsed tăng nhanh gấp đôi 60Hz, xe đi nhanh gấp đôi |

### 2.2 Đề xuất cụ thể

#### A. Sửa auth scene overflow — ưu tiên cao

```css
.auth-scene {
  overflow: hidden; /* thêm dòng này */
  /* ... giữ nguyên còn lại */
}

/* Bỏ transform: scale(1.55) — thay bằng canvas tự fill */
.auth-scene .park-scene-canvas {
  /* transform: scale(1.55); -- XÓA */
  width: 100%;
  height: 100%;
  object-fit: cover; /* không có effect với canvas, nhưng intent rõ */
}
```

Thay vào đó, trong `mountScene` detect container nhỏ và để `frustum` lớn hơn (xem đề xuất F bên trên) — scene tự lấp đầy container mà không cần CSS zoom.

#### B. Mount scene một lần, không rebuild khi refresh — ưu tiên cao

Hiện tại mỗi lần `render()` chạy, `mountScene` được gọi lại, làm mới toàn bộ WebGL context. Với nhiều lần refresh/click nhanh, đây là memory pressure và flicker.

**Đề xuất:** Lưu cleanup function và chỉ remount khi container thực sự thay đổi:

```js
// Trong app.js, thêm module-level:
let sceneCleanups = new Map(); // key = container element

function mountSceneOnce(container) {
  if (!container) return;
  if (sceneCleanups.has(container)) return; // đã mount, bỏ qua
  const cleanup = mountScene(container);
  if (cleanup) sceneCleanups.set(container, cleanup);
}

function unmountSceneFor(container) {
  const cleanup = sceneCleanups.get(container);
  if (cleanup) {
    cleanup();
    sceneCleanups.delete(container);
  }
}
```

Sửa trong `render()`:

```js
// Thay:
mountScene(document.querySelector('#scene'));
// Thành:
mountSceneOnce(document.querySelector('#scene'));
```

Và trong `clearPageMotion()` / view switch, gọi `unmountSceneFor` cho container cũ trước khi render view mới.

#### C. Sửa z-index dropdown report — ưu tiên trung bình

```css
/* Thêm vào report-panel */
.report-panel {
  position: relative;
  z-index: 5; /* raise panel để dropdown không bị topbar che */
}

/* Khi dropdown mở, raise cao hơn nữa */
.report-panel:has(.pretty-select.open) {
  z-index: 40;
}
```

Cũng cần đảm bảo `.topbar` không có `z-index` cao hơn dropdown đang mở:

```css
.topbar {
  /* z-index: 12; -- giảm xuống */
  z-index: 10;
}

/* Và khi có dropdown mở toàn trang: */
body:has(.pretty-select.open) .topbar {
  z-index: 8; /* nhường cho dropdown */
}
```

#### D. Bike card height fix trên mobile — ưu tiên trung bình

```css
/* Trong @media (max-width: 760px) */
.bike-card {
  grid-template-rows: auto auto; /* bỏ fixed 42px */
}

.rent-row {
  min-height: 42px; /* thay vì ép height cứng ở grid-template-rows */
}
```

#### E. Section heading wrap — ưu tiên thấp

```css
/* Sửa .section-heading trong @media (max-width: 760px) */
.section-heading {
  flex-wrap: wrap; /* cho phép nút xuất CSV xuống dòng */
  row-gap: 8px;
}

.section-heading > button {
  flex: 0 0 auto; /* không co giãn */
}
```

#### F. Loading skeleton cho GPS demo — ưu tiên thấp

Trong `gpsDemoView()`, khi `state.gpsBikes.length === 0` hoặc `state.stations.length === 0`, render skeleton thay vì grid rỗng:

```js
function gpsDemoView() {
  if (!state.stations.length) {
    return `
      <div class="gps-demo-shell">
        <header class="topbar gps-demo-topbar">...</header>
        <div class="gps-loading-state">
          <div class="skeleton-block" style="height:120px;width:100%;border-radius:8px;"></div>
          <p>Đang tải dữ liệu demo...</p>
        </div>
      </div>
    `;
  }
  // ... phần còn lại giữ nguyên
}
```

```css
.gps-loading-state {
  display: grid;
  gap: 12px;
  padding: 24px 0;
  text-align: center;
  color: var(--ink-500);
}

.skeleton-block {
  background: linear-gradient(90deg, #e8f0ec 25%, #d4e4da 50%, #e8f0ec 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block { animation: none; }
}
```

#### G. Clamp `dt` trong RAF để đồng đều trên 120Hz — ưu tiên thấp

Đây là bug nhỏ trong `scene.js` nhưng ảnh hưởng tốc độ animation trên màn hình 120Hz:

```js
// Hiện tại:
const dt = Math.min((ts - lastTs) / 1000, 0.05); // cap 50ms ✓

// Đã đúng. Tuy nhiên nếu muốn frame-rate independent cho wheel spin:
// Không dùng elapsed * constant (phụ thuộc fps)
// Thay bằng: accumulated distance = integrate speed * dt
```

Animation loop hiện dùng `elapsed` cho tất cả animation — đây là pattern đúng vì `elapsed += dt` (đã clamp). Không cần sửa nếu scene.js đã clamp `dt = Math.min(..., 0.05)`.

---

## Phần 3 — Checklist nghiệm thu sau khi áp dụng

Sau khi áp dụng các đề xuất trên, chạy theo thứ tự:

```bash
node --check public/scene.js public/app.js
npm run smoke:ui
npm test
npm run smoke:uc
```

Kiểm tra thủ công:

- [ ] Auth hero `600×320`: road nằm ngang, không thấy crop hub/lake ở desktop
- [ ] Dashboard hero `430×226`: vẫn thấy road, hub, lake và ít nhất 1 cây
- [ ] Mobile `334×220`: scene không blank, không scroll ngang
- [ ] Moving bike: không giật đột ngột khi đảo chiều
- [ ] Person A: không bị snap/teleport khi loop
- [ ] Dropdown report filter: không bị topbar che khi mở
- [ ] Bike card trên Android Chrome 390px: nút Thuê không bị cắt
- [ ] Smoke test canvas pixel `nonTransparent > 1000` vẫn pass

---

## Phần 4 — Những gì KHÔNG đề xuất thay đổi

Các phần dưới đây hoạt động tốt và không nên đổi để tránh rủi ro:

- Import `import * as THREE from '/vendor/three.module.js'` — giữ nguyên
- Export `mountScene(target)` — giữ nguyên
- `preserveDrawingBuffer: true` — giữ nguyên (smoke test đọc pixel)
- Module-level `cleanupScene` pattern — giữ nguyên
- `DisposeStore.flush()` khi cleanup — giữ nguyên
- GSAP motion layer và `prefers-reduced-motion` — giữ nguyên
- Leaflet/OpenStreetMap integration — giữ nguyên
- Session cookie và role guard backend — ngoài phạm vi
