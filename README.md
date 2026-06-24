# Ecopark Bicycle Parking

[![CI](https://github.com/sontungkieu/2025.2-IT3180E-SE/actions/workflows/ci.yml/badge.svg)](https://github.com/sontungkieu/2025.2-IT3180E-SE/actions/workflows/ci.yml)
![Tests](https://img.shields.io/badge/tests-18%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/backend%20coverage-78.9%25-yellowgreen)
![Node](https://img.shields.io/badge/node-%3E%3D24-43853d)
![Docker](https://img.shields.io/badge/docker-CI%20build%20configured-0f7b55)

Platform fullstack cho bài toán thuê-trả xe đạp Ecopark, có thể chạy cục bộ để
demo và đóng gói container để triển khai lên Google Cloud Platform. Frontend dùng
HTML/CSS/JavaScript thuần, có GSAP cho motion layer, backend dùng Node.js.
Profile local dùng SQLite để demo/test nhanh; profile triển khai được định hướng
cho GCP Cloud Run/Compute Engine, với Cloud SQL hoặc persistent disk khi cần dữ
liệu bền vững.

## Yêu cầu môi trường

- Node.js 24 trở lên.
- Docker nếu cần kiểm tra container/GCP image.
- LaTeX `latexmk` nếu cần build lại `pdf/main.pdf` hoặc các bản tài liệu
  app-style trong `pdf/`.

## Chạy ứng dụng

```bash
npm install
npm run reset-db
npm run dev
```

Mở `http://127.0.0.1:4173`.

## Kiểm thử và CI/CD

```bash
npm run check
npm test
npm run test:coverage
npm run smoke:ui
npm run smoke:uc
npm run screenshots:uc001
npm run diagrams:techstack
npm run docker:build
```

- `npm run test:coverage` dùng Node.js built-in test coverage. Mốc hiện tại:
  line coverage backend `78.93%`, branch `69.31%`, functions `80.58%`.
- `npm run screenshots:uc001` sinh bộ ảnh UC001/alternative flow 1 vào
  `pdf/assets/uc001_flow/` để đưa vào report.
- `npm run diagrams:techstack` render lại hình tech stack có logo trong
  `pdf/assets/techstack/` để dùng chung cho report và slide.
- `.github/workflows/ci.yml` tự động chạy static check, backend coverage test,
  smoke UI, smoke UC và build Docker image trên mọi push/PR. Bước deploy GCP thật
  vẫn để cấu hình riêng bằng secrets/project của nhóm.

## Triển khai GCP

Repo có `Dockerfile` để đóng gói Node.js server và static UI thành một container
chạy trên Google Cloud Run hoặc Compute Engine. Container đặt `HOST=0.0.0.0`,
`PORT=8080` và dùng `ECOPARK_DB_PATH=/tmp/ecopark/ecopark.sqlite` cho bản demo
cloud. Nếu cần giữ dữ liệu lâu dài, dùng Compute Engine kèm persistent disk cho
SQLite hoặc chuyển lớp dữ liệu sang Cloud SQL.

Kiểm tra container local:

```bash
docker build -t ecopark-bicycle-parking .
docker run --rm -p 8080:8080 ecopark-bicycle-parking
```

Triển khai Cloud Run mẫu:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/ecopark-bicycle-parking
gcloud run deploy ecopark-bicycle-parking \
  --image gcr.io/$PROJECT_ID/ecopark-bicycle-parking \
  --platform managed \
  --region asia-southeast1 \
  --port 8080 \
  --allow-unauthenticated
```

## Cấu trúc repo

- `public/`: giao diện HTML/CSS/JavaScript thuần theo phong cách Civic Mobility
  Command Center, motion GSAP, scene Three.js và màn hình dashboard khách hàng/
  nhân sự.
- `server/`: HTTP API Node.js, SQLite schema/seed, auth session và các luồng
  thuê-trả xe; report mô tả target triển khai GCP Cloud Run/Compute Engine.
- `scripts/`: smoke test giao diện bằng Playwright.
- `test/`: test nghiệp vụ backend bằng `node --test`.
- `docs/`: tài liệu nguồn như use-case diagram và brief 3D scene cho agent ngoài.
- `pdf/`: tài liệu LaTeX, bản report/slide hiện tại và bản app-style song song.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Khách thường | `customer@ecopark.test` | `customer123` |
| Cư dân Ecopark | `resident@ecopark.test` | `resident123` |
| Nhân sự bãi xe | `staff@ecopark.test` | `staff123` |
| Admin / Operator | `admin@ecopark.test` | `admin123` |
| Admin dự phòng | `admin2@ecopark.test` | `admin2123` |

## Chức năng chính

- Khách hàng tạo tài khoản, đăng nhập, xác minh email bằng mã demo-local, bổ
  sung thẻ cư dân, tìm bãi gần nhất theo GPS demo, vị trí đã lưu hoặc vị trí
  nhập tay, lọc loại xe, chọn xe rảnh, gửi yêu cầu thuê và hủy yêu cầu khi chưa
  nhận xe. Khi gửi yêu cầu thuê, API lưu tọa độ khách nhưng không chặn request
  chỉ vì khách chưa đứng sát bãi; bước giao xe mới kiểm tra GPS hiện tại của
  khách phải nằm trong bán kính phục vụ của bãi nhận. API đăng ký kiểm tra họ tên, số điện thoại Việt Nam, CCCD/CMND 9 hoặc
  12 chữ số, chặn trùng số điện thoại/giấy tờ, chặn giấy tờ bị khóa và yêu cầu
  mật khẩu tối thiểu 8 ký tự có chữ + số. CCCD/CMND hợp lệ là điều kiện thuê
  theo UC001/UC002; staff vẫn đối chiếu giấy tờ thật ở bước giao xe, còn thẻ cư
  dân pending/rejected chỉ làm mất ưu đãi 40% chứ không chặn thuê xe. Password
  mới dùng PBKDF2 salted, còn hash SHA-256 cũ vẫn đăng nhập được và được nâng
  cấp sau login.
- Form đăng nhập có flow khôi phục mật khẩu bằng mã demo-local và form tạo tài
  khoản có nút hiện/ẩn mật khẩu để người dùng kiểm tra trước khi gửi. Các bộ lọc tìm
  bãi, dropdown loại khách trong form đăng ký, dropdown thời lượng thuê và các
  dropdown trong bảng staff/admin dùng custom dropdown HTML/CSS thay cho
  dropdown native để tránh popup thô và giữ layout ổn định trên desktop lẫn
  mobile.
- Workspace khách hàng gom vị trí, bãi gần nhất, bản đồ, xe rảnh và nút thuê vào
  cùng vùng `Thuê xe`; các vùng `Lượt thuê` và `Tài khoản` tách riêng để màn đầu
  không bị rối như bảng quản trị. Bộ lọc `Vị trí người dùng` cho phép chọn GPS
  live từ `/gd`, vị trí nhập tay hoặc vị trí đã lưu để diễn cả happy path và
  alternative flow mất GPS/ngoài phạm vi. Trạng thái GPS/vị trí nhập tay được đặt như
  chip overlay trong bản đồ thay vì một cảnh báo riêng bên ngoài bộ lọc. Thẻ xe
  rảnh dùng bố cục ngang, giữ minh họa loại xe nhưng gom thông tin và nút thuê
  vào cùng một cụm để giảm khoảng trống.
- Màn hình khách hàng có bản đồ thật bằng Leaflet/OpenStreetMap, hiển thị vị trí
  người dùng demo và marker các bãi xe; khi tab `/gd` kéo GPS người dùng, vị trí
  `Bạn` và khoảng cách bãi trên tab khách hàng tự đồng bộ qua API demo dùng
  chung. Chọn marker hoặc thẻ bãi đều cập nhật danh sách xe tại bãi. Thẻ xe phân biệt rõ xe đang rảnh, xe chờ chính khách
  nhận, xe khách đang thuê và xe do người khác giữ/thuê.
- Nhân sự bãi xe chỉ thấy/xử lý request thuộc bãi được phân công, đối chiếu
  loại/số giấy tờ, ghi nhận đặt cọc 200k, giấy tờ giữ lại, hủy yêu cầu không đủ
  điều kiện, đổi sang xe rảnh cùng bãi trước khi giao nếu xe cũ không phù hợp,
  kiểm tra lại tọa độ khách trong bán kính bãi ở bước handover, giao xe và
  chuyển xe sang trạng thái đang thuê. Nếu thao tác giao xe bị chặn do sai cọc,
  giấy tờ không khớp, hết hạn, sai bãi hoặc ngoài bán kính, UI hiện lý do ngay
  trong panel nhận xe và đồng thời đẩy toast không bị thanh topbar che.
  Admin/Operator vẫn xử lý toàn hệ thống để demo và hỗ trợ ngoại lệ.
- Nhân sự nhận xe trả tại bãi được phân công; Admin/Operator xử lý toàn hệ thống
  và hỗ trợ luồng trả khác bãi khi cần. Trước khi staff xuất vé, khách phải xác
  nhận bãi trả bằng vị trí hiện tại; backend chỉ chấp nhận nếu vị trí này nằm
  trong bán kính phục vụ của bãi trả. Hệ thống tính vé cuối cùng, chỉ áp dụng
  giảm 40% khi tài khoản là cư dân và thẻ cư dân đang verified, phụ thu 30k mỗi
  30 phút trả muộn, ghi chú tình trạng xe và hiển thị lại phiếu vừa xuất. Nếu
  nhân sự bấm xuất vé khi khách chưa xác nhận hoặc chọn bãi trả không khớp, UI
  hiện lý do ngay trong danh sách trả xe thay vì chỉ khóa nút im lặng. Màn vận
  hành có pipeline trả xe riêng để luôn thấy các bước nhận xe, khách xác nhận
  bãi trả, kiểm tra xe và xuất vé.
- Admin/Operator quản lý bãi xe, xe, trạng thái xe, trạng thái tài khoản, danh
  sách CCCD/CMND bị khóa, tra cứu vị trí xe, lọc thống
  kê theo ngày/tuần/tháng, theo bãi/xe bằng custom dropdown, xem dashboard biểu
  đồ doanh thu theo kỳ, phân bổ trạng thái đội xe, tổng thu/phụ thu dùng cùng
  thang tiền, xem audit log thay đổi trạng thái xe và xuất báo cáo CSV theo đúng
  bộ lọc hiện tại. Trên các màn vận hành hẹp
  hoặc tablet/desktop nhỏ, bảng staff/admin tự chuyển thành row-card có nhãn từng
  trường để không còn bị kẹp ngang trong panel.
- Server dùng session cookie riêng theo từng browser/context, nên có thể demo
  đồng thời kịch bản thường gồm 1 khách hàng, 1 admin/operator và 1 tab `/gd`;
  smoke test vẫn kiểm tra mức tải demo tối đa 2 khách hàng và 2 admin để chắc các
  phiên không đá nhau.
- Route demo `http://127.0.0.1:4173/gd` là bảng điều khiển trình bày: tìm/chọn
  từng tài khoản khách, chọn phiên khách đang chờ nhận xe hoặc đang thuê xe khi
  có, kéo thả marker GPS người dùng, snap marker về tuyến đường demo và cho marker đi theo polyline tới bãi nhận/trả
  thay vì bay thẳng qua hồ hoặc nhà. Trong lúc marker `/gd` đang chạy, các điểm
  trung gian được stream theo throttle vào SQLite theo từng customer; đúng tab
  customer dùng `GPS hiện tại` sẽ poll cùng API và animate marker `Bạn` trên map
  theo vị trí đó, không chỉ nhảy tới điểm cuối. Nếu chưa có lượt đang thuê ở mode trả xe, màn hình vẫn cho kéo
  user đã chọn để chuẩn bị demo, đồng thời hiển thị empty state cho phần phiên UC. Cùng
  màn này có đồng hồ hệ thống nội bộ để staff/admin tua +15/+30/+60 phút hoặc
  reset, giúp demo quá hạn và phụ thu 30k/30 phút; `/gps` vẫn là alias tương
  thích cũ. Khi dữ liệu demo đang tải lần đầu, `/gd` hiển thị skeleton thay vì
  một grid trắng.
- Giao diện theo phong cách Civic Mobility Command Center: rail điều hướng tối
  có thể cuộn tới từng vùng chức năng, workspace sáng, panel/form/table sắc cạnh,
  dropdown custom có menu nổi và trạng thái chọn rõ ràng, topbar floating sticky
  có gap mờ với viền viewport và mật độ thông tin phù hợp
  phần mềm vận hành. App hỗ trợ light/dark/system theme bằng design tokens,
  lưu lựa chọn trong `localStorage`, có dark treatment cho Leaflet tiles/control
  và giữ scene 3D đủ tương phản để demo.
  Trên mobile, màn hình bỏ topbar riêng,
  đưa scene 3D lên đầu hero, nén các metric thành hàng ngang, gói card xe và
  dropdown thời lượng trong bề ngang viewport, đồng thời rút rail tối thành dock
  icon-only nổi ở đáy màn hình, có cả refresh/theme/logout.
  Motion GSAP có hỗ trợ `prefers-reduced-motion`, scene Three.js low-poly mô
  phỏng Bike Hub isometric với đường nội khu, bike lane, canopy, dock/rack,
  status light và các xe City, Tandem, Child-seat khác hình dáng; bản scene mới
  mở rộng hồ nước, bờ kè, dải cây xanh và hàng cây ven đường để khung 3D không
  chỉ còn là mặt đường. Camera/frustum của scene tự fit theo tỉ lệ khung auth,
  hero và mobile, không dùng CSS zoom thô; khi render lại cùng view, canvas được
  giữ để tránh remount nhấp nháy. Scene có thêm xe chạy vòng theo hành lang
  đường, người đi bộ/kiểm tra xe/em nhỏ vẫy tay và sway cây nhẹ để loop không bị
  tĩnh. Trên màn hình đăng nhập, scene được đóng như một dải preview bám theo
  cột nội dung thay vì một ảnh rời nằm lơ lửng.
  Layout đã được kiểm tra lại trên desktop/mobile để tránh che chữ, tràn ngang
  và lệch bố cục.

## Kiểm thử

```bash
npm test
```

Test hiện bao phủ đăng ký tài khoản, password policy, nâng cấp hash cũ, xác minh
email, reset mật khẩu demo-local, chống trùng email/phone/CCCD, chặn CCCD bị
khóa, trạng thái resident pending thuê như khách thường, khách thường không được
giảm cư dân dù dữ liệu cũ bật nhầm cờ giảm giá, staff scope theo bãi, đổi xe
trước handover, giao xe, trả xe, tính phí, thống kê, audit log trạng thái xe và
phiên đăng nhập đồng thời.

Kiểm tra giao diện bằng browser thật:

```bash
npx playwright install chromium
npm run smoke:ui
npm run smoke:uc
```

Smoke test UI mở desktop/tablet/mobile, gồm cả staff workspace rộng và trung
bình, kiểm tra GSAP vendor đã load, scene Three.js có render pixel, bản đồ
Leaflet có marker thật, report filters là custom dropdown, chart tiền trong báo
cáo dùng cùng thang đo, bảng vận hành hẹp chuyển sang row-card, dashboard/table
staff rộng không scroll ngang, không có console error và không có horizontal
overflow ở cấp trang.
Khi cần rà thiết kế thủ công, có thể chụp lại các trạng thái auth/customer/admin
bằng Playwright trước khi chốt thay đổi giao diện.

Smoke test UC chạy pipeline giao diện chính: mở demo director `/gd` ở context riêng,
kiểm tra người chỉnh GPS vẫn kéo/snap marker người dùng được trong kịch bản tải tối đa 2
customer và 2 admin đăng nhập đồng thời, cư dân tìm bãi theo GPS/nhập tay, gửi rồi
hủy yêu cầu thuê, gửi lại yêu cầu, staff giao xe sau khi nhận cọc/giấy tờ, thử
bấm xuất vé trước khi khách xác nhận để kiểm lý do bị chặn, nhận trả xe sau khi
khách xác nhận vị trí trong bán kính bãi staff được phân công, xuất ticket, kiểm tra dashboard chart/audit
log và tải báo cáo CSV. Luồng trả khác bãi vẫn được backend/UI hỗ trợ khi
Admin/Operator xử lý toàn hệ thống.

## Tài liệu PDF

Các bản chính hiện tại vẫn giữ nguyên ở `pdf/main.pdf`, `pdf/slides.pdf` và
`pdf/slide.pdf`. Nếu cần bản trình bày có visual style gần app hơn, dùng các file
song song `pdf/main_app_style.pdf`, `pdf/slides_app_style.pdf` và
`pdf/slide_app_style.pdf`.

Khi cập nhật tài liệu chính trong `pdf/`, build theo đúng quy trình:

```bash
cd pdf
latexmk -pdf main.tex
latexmk -c main.tex
find . -maxdepth 1 -type f \( \
  -name "*.aux" -o -name "*.log" -o -name "*.out" -o -name "*.toc" -o \
  -name "*.fls" -o -name "*.fdb_latexmk" -o -name "*.synctex.gz" -o \
  -name "*.nav" -o -name "*.snm" -o -name "*.vrb" -o \
  -name "*.bbl" -o -name "*.blg" \
\) -delete
```

Nếu chỉnh logo hoặc bố cục hình tech stack, render lại asset trước khi build PDF:

```bash
npm run diagrams:techstack
```

Với bản app-style, build tương tự nhưng dùng source song song:

```bash
cd pdf
latexmk -pdf main_app_style.tex
latexmk -pdf slides_app_style.tex
cp slides_app_style.pdf slide_app_style.pdf
latexmk -c main_app_style.tex
latexmk -c slides_app_style.tex
find . -maxdepth 1 -type f \( \
  -name "*.aux" -o -name "*.log" -o -name "*.out" -o -name "*.toc" -o \
  -name "*.fls" -o -name "*.fdb_latexmk" -o -name "*.synctex.gz" -o \
  -name "*.nav" -o -name "*.snm" -o -name "*.vrb" -o \
  -name "*.bbl" -o -name "*.blg" \
\) -delete
```
