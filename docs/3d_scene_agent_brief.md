# 3D Scene External Agent Brief

## Mục tiêu

File này là brief cho agent ngoài khi cần đề xuất hoặc chỉnh lại phối cảnh 3D
trong `public/scene.js` của app Ecopark Bicycle Parking. Mục tiêu là làm scene
trông tự nhiên, sang hơn và dễ dùng trong slide/demo, nhưng không phá API, test
smoke hoặc layout hiện tại.

Scene hiện tại là một Three.js low-poly isometric "Bike Hub" dùng trong hero
đăng nhập và dashboard. Nó có bãi xe, đường ngang, làn xe đạp, hồ nước, cây, các
loại xe khác nhau, người chuyển động và một xe đạp chạy loop trên đường.

## Source cần chỉnh

- File chính: `public/scene.js`
- Nếu thay đổi scene đã cache, cập nhật cache key import trong `public/app.js`
  và cache key script tương ứng trong `public/index.html`; không cần đổi CSS,
  backend hoặc test nếu chỉ cải thiện phối cảnh scene.
- Có thể dùng file này làm context cho Claude/agent ngoài và yêu cầu họ trả về
  patch hoặc toàn bộ nội dung `public/scene.js`.

## API và ràng buộc bắt buộc

Giữ nguyên các điều kiện sau:

- Import bắt buộc:
  ```js
  import * as THREE from '/vendor/three.module.js';
  ```
- Export bắt buộc:
  ```js
  export function mountScene(target)
  ```
- App hiện tại không dựa vào return cleanup, nên `scene.js` vẫn phải tự cleanup
  scene cũ bằng biến module-level `cleanupScene`.
- `mountScene(target)` có thể return cleanup, nhưng không được yêu cầu app gọi
  cleanup đó mới đúng.
- Giữ `preserveDrawingBuffer: true` trong `WebGLRenderer`; smoke test đọc pixel
  canvas để xác nhận scene không bị blank.
- Không thêm dependency.
- Không fetch asset ngoài, không dùng ảnh/texture file ngoài. Nếu cần texture
  thì tự tạo bằng `CanvasTexture`.
- Không đổi class canvas `.park-scene-canvas`.
- Phải render được trong các khung nhỏ:
  - auth preview rộng khoảng `760x220` hoặc `560x292` tùy viewport;
  - dashboard hero khoảng `430x226`;
  - mobile khoảng `346x142`.
- Tôn trọng `prefers-reduced-motion`: vẫn render một frame tĩnh khi user bật
  reduced motion.
- Cleanup phải dispose geometry/material/texture và remove listener/RAF.

## Bối cảnh layout hiện tại

`public/scene.js` hiện có các phần chính:

- Palette `C` và `makeMats(store)`.
- `DisposeStore` để track geometry/material/texture.
- World:
  - ground box gọn khoảng `26 x 16`;
  - road chạy theo trục X, đặt quanh `z = 2.0`;
  - bike lane quanh `z = 0.75`;
  - hub/canopy lớn quanh `x = -2.2`, `z = -1.85`, toàn bộ rack và xe đỗ nằm
    trong footprint của mái;
  - lake hữu cơ quanh `x = 7.3`, `z = -5.15`, có bờ, lily pad và ripple lệch;
  - trees/shrubs gom thành cụm khác scale quanh hub, lake và mép road.
- Bike models:
  - `addCityBike`;
  - `addTandemBike`;
  - `addChildBike`;
  - `buildMovingBike`.
- People:
  - `buildPerson`;
  - `addPedestrians`;
  - person A đi loop quanh plaza;
  - person B đứng kiểm tra xe;
  - child C vẫy tay gần hồ.
- Camera hiện tại giữ road nằm ngang nhưng hạ góc nhìn để tăng chiều sâu:
  ```js
  const cam = new THREE.OrthographicCamera(...);
  cam.position.set(2, 15.5, 22);
  cam.lookAt(2, 0.35, -1.75);
  ```
- Animation hiện tại:
  - moving bike chạy dọc lane theo sin/cos, loop 16s;
  - status LEDs pulse;
  - pond opacity shimmer;
  - trees sway nhẹ;
  - pedestrians update theo elapsed time.

## Feedback và yêu cầu thẩm mỹ

Các vấn đề user đã góp ý:

- Cảnh cũ quá đơn giản và nhìn giống AI-generated.
- Đường không nên xoay 45 độ vì tốn diện tích và không bao được scene.
- Vẫn cần góc nhìn nghiêng từ trên xuống, nhưng road nên gần ngang để dùng tốt
  trong khung hero hẹp.
- Ngoài đường phải có hồ và cây rõ ràng.
- Các loại xe cần phân biệt bằng hình dáng, không chỉ màu.
- Cần có chuyển động mượt, loop đầu-cuối không giật.
- Cần có người vui đùa/chuyển động, nhưng không gây rối.
- Scene phải hợp UI "Civic Mobility Command Center": gọn, rõ nghiệp vụ, không
  cartoon quá mức, không landing-page minh họa rời rạc.

## Hướng chỉnh phối cảnh nên ưu tiên

Agent ngoài nên tập trung vào composition/perspective trước khi thêm chi tiết:

1. Giữ road gần ngang trong viewport.
   - Không xoay road 45 độ.
   - Có thể cho road nghiêng rất nhẹ nếu giúp chiều sâu tốt hơn, nhưng vẫn phải
     đọc là một trục ngang chính trong hero.

2. Cải thiện camera mà không làm scene bị crop.
   - Orthographic camera vẫn là lựa chọn an toàn cho UI hero.
   - Có thể thử azimuth nhẹ khoảng 5-12 độ thay vì pure side-on.
   - Tránh frustum quá hẹp khiến lake/tree/bike bị cắt ở mobile.
   - Tránh frustum quá rộng khiến toàn cảnh nhỏ và lạc lõng.

3. Lấp khung theo bố cục có chủ đích.
   - Road nằm ở 30-40% dưới của scene, hub ở giữa-trái, lake ở giữa-phải hoặc
     hậu cảnh phải.
   - Cây tạo depth ở foreground/background nhưng không che bike/rack.
   - Lake đủ rõ để nhận ra Ecopark, nhưng không chiếm hết hero.

4. Làm scene bớt phẳng.
   - Tăng layer cao thấp: kerb, path, canopy, sign, trees, light/shadow.
   - Dùng scale khác nhau cho cây/người để tạo nhịp.
   - Thêm một vài chi tiết nhỏ có nghiệp vụ: rack LED, sign, bike lane marking,
     bollard, bench.

5. Giữ chuyển động nhẹ và mượt.
   - Mọi animation phải dùng `elapsed` và modulo để loop seamless.
   - Không random mỗi frame.
   - Moving bike cần đi trên lane/road, không "bay" qua hồ/cây/nhà.
   - Có thể thêm wheel rotation, arm swing, head bob, water shimmer, tree sway.

## Gợi ý cụ thể cho agent ngoài

Các chỉnh sửa có khả năng hữu ích:

- Tinh chỉnh `makeCamera()`:
  - thử `cam.position.set(1.5, 17, 18.5)` hoặc `cam.position.set(2.0, 16, 20)`;
  - `lookAt(2, 0, -2.2)` hoặc gần center of interest hơn;
  - nếu road bị nghiêng quá nhiều, quay lại side-on hoặc giảm azimuth.
- Tinh chỉnh frustum theo aspect:
  - default hiện là `10.0`;
  - hero hẹp có thể cần frustum lớn hơn một chút, auth có CSS scale nên cần
    không crop quá sát.
- Tối ưu object placement:
  - nếu lake bị lệch/crop, kéo lake gần center hơn hoặc nhỏ lại;
  - nếu road quá thấp/cao, chỉnh `z` của road/lane và camera lookAt;
  - nếu hub quá nhỏ, tăng scale canopy/rack nhẹ thay vì zoom toàn scene.
- Bike differentiation:
  - city bike: basket hoặc frame diamond rõ;
  - tandem: frame dài, hai yên;
  - child-seat bike: ghế trẻ em phía sau rõ hơn.
- Animation:
  - moving bike wheel rotation theo quãng đường;
  - person A closed path không giật ở điểm nối;
  - child wave/bob nhẹ;
  - pond shimmer nên subtle, không flash.

## Không nên làm

- Không thêm thư viện animation mới.
- Không dùng GLTF/PNG/JPG/WebP asset ngoài.
- Không thay API mount hoặc import.
- Không xóa module-level cleanup.
- Không đổi `preserveDrawingBuffer: true`.
- Không đưa scene thành canvas full-page hoặc đòi CSS mới.
- Không thêm text DOM hoặc UI control trong scene.
- Không làm palette quá một màu hoặc quá trẻ con.
- Không tăng mesh/detail quá nặng; scene chỉ là hero/dashboard visual, không
  phải game.

## Checklist nghiệm thu

Sau khi chỉnh `public/scene.js`, chạy:

```bash
node --check public/scene.js
npm run smoke:ui
```

Nếu thay đổi code scene lớn hoặc có rủi ro ảnh hưởng flow demo, chạy thêm:

```bash
npm test
npm run smoke:uc
```

Visual cần kiểm tra thủ công:

- Auth hero không crop mất hub/lake/road ở desktop.
- Dashboard hero khoảng `430x226` vẫn thấy road, hub, lake/cây.
- Mobile khoảng `334x220` không blank, không crop quá sát, không gây scroll
  ngang.
- Moving bike chạy trên đường/lane, loop mượt.
- Người chuyển động tự nhiên, không giật ở điểm loop.
- Ba loại xe đọc được khác nhau ngay cả khi scene nhỏ.
- Smoke test canvas pixel vẫn có `nonTransparent` đủ lớn.

## Prompt mẫu để đưa cho Claude/agent ngoài

```text
Bạn hãy chỉnh `public/scene.js` của app Ecopark Bicycle Parking.

Mục tiêu: cải thiện phối cảnh và composition của Three.js low-poly Bike Hub
scene để nhìn production hơn trong hero nhỏ. Giữ road gần ngang, vẫn có góc nhìn
nghiêng từ trên xuống, thấy rõ bãi xe, road/lane, hồ, cây, các loại xe khác
nhau và người chuyển động loop mượt.

Ràng buộc bắt buộc:
- Giữ import `import * as THREE from '/vendor/three.module.js';`
- Giữ export `export function mountScene(target)`.
- Giữ module-level cleanupScene và cleanup scene cũ khi mount lại.
- Giữ `preserveDrawingBuffer: true`.
- Không đổi app.js/CSS/backend/test.
- Không thêm dependency, không fetch asset ngoài, không dùng texture file ngoài.
- Nếu cần texture thì tự tạo CanvasTexture.
- Phải chạy tốt trong auth ~600x320, dashboard hero ~430x226, mobile ~334x220.
- Tôn trọng prefers-reduced-motion và vẫn render frame tĩnh.

Hãy trả về patch hoặc file `public/scene.js` hoàn chỉnh. Ưu tiên camera,
framing, object placement và loop animation. Không làm road xoay 45 độ, không để
moving bike bay qua hồ/nhà/cây.
```
