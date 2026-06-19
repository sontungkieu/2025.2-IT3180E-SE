# Ecopark Bicycle Parking

Platform fullstack cho bài toán thuê-trả xe đạp Ecopark, có thể chạy cục bộ để
demo và đóng gói container để triển khai lên Google Cloud Platform. Frontend dùng
HTML/CSS/JavaScript thuần, có GSAP cho motion layer, backend dùng Node.js.
Profile local dùng SQLite để demo/test nhanh; profile triển khai được định hướng
cho GCP Cloud Run/Compute Engine, với Cloud SQL hoặc persistent disk khi cần dữ
liệu bền vững.

## Yêu cầu môi trường

- Node.js 24 trở lên.
- Docker nếu cần kiểm tra container/GCP image.
- LaTeX `latexmk` nếu cần build lại `pdf/main.pdf`.

## Chạy ứng dụng

```bash
npm install
npm run reset-db
npm run dev
```

Mở `http://127.0.0.1:4173`.

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
- `pdf/`: tài liệu LaTeX và bản build `pdf/main.pdf`.

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
  nhận xe. API đăng ký kiểm tra họ tên, số điện thoại Việt Nam, CCCD/CMND 9 hoặc
  12 chữ số, chặn trùng số điện thoại/giấy tờ, chặn giấy tờ bị khóa và yêu cầu
  mật khẩu tối thiểu 8 ký tự có chữ + số. Password mới dùng PBKDF2 salted, còn
  hash SHA-256 cũ vẫn đăng nhập được và được nâng cấp sau login.
- Form đăng nhập có flow khôi phục mật khẩu bằng mã demo-local. Các bộ lọc tìm bãi, dropdown loại khách trong
  form đăng ký và dropdown thời lượng thuê dùng custom dropdown HTML/CSS thay
  cho dropdown native để tránh popup thô và giữ layout ổn định trên desktop lẫn
  mobile.
- Workspace khách hàng gom vị trí, bãi gần nhất, bản đồ, xe rảnh và nút thuê vào
  cùng vùng `Thuê xe`; các vùng `Lượt thuê` và `Tài khoản` tách riêng để màn đầu
  không bị rối như bảng quản trị. Trạng thái GPS/vị trí nhập tay được đặt như
  chip overlay trong bản đồ thay vì một cảnh báo riêng bên ngoài bộ lọc. Thẻ xe
  rảnh dùng bố cục ngang, giữ minh họa loại xe nhưng gom thông tin và nút thuê
  vào cùng một cụm để giảm khoảng trống.
- Màn hình khách hàng có bản đồ thật bằng Leaflet/OpenStreetMap, hiển thị vị trí
  người dùng demo và marker các bãi xe; chọn marker hoặc thẻ bãi đều cập nhật
  danh sách xe tại bãi. Thẻ xe phân biệt rõ xe đang rảnh, xe chờ chính khách
  nhận, xe khách đang thuê và xe do người khác giữ/thuê.
- Nhân sự bãi xe chỉ thấy/xử lý request thuộc bãi được phân công, đối chiếu
  loại/số giấy tờ, ghi nhận đặt cọc 200k, giấy tờ giữ lại, hủy yêu cầu không đủ
  điều kiện, đổi sang xe rảnh cùng bãi trước khi giao nếu xe cũ không phù hợp,
  giao xe và chuyển xe sang trạng thái đang thuê. Admin/Operator vẫn xử lý toàn
  hệ thống để demo và hỗ trợ ngoại lệ.
- Nhân sự nhận xe trả tại bãi được phân công; Admin/Operator xử lý toàn hệ thống
  và hỗ trợ luồng trả khác bãi khi cần. Hệ thống tính vé cuối cùng, áp dụng giảm
  40% cho cư dân hợp lệ, phụ thu 30k mỗi 30 phút trả muộn, ghi chú tình trạng xe
  và hiển thị lại phiếu vừa xuất. Màn vận hành có pipeline trả xe riêng để luôn
  thấy các bước nhận xe, chọn bãi trả, kiểm tra xe và xuất vé.
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
- Route demo `http://127.0.0.1:4173/gd` là bảng điều khiển trình bày: chọn
  xe/người thuê, kéo thả marker GPS, snap xe về tuyến đường demo và cho xe đi
  theo polyline đường tới bãi nhận/trả thay vì bay thẳng qua hồ hoặc nhà. Cùng
  màn này có đồng hồ hệ thống nội bộ để staff/admin tua +15/+30/+60 phút hoặc
  reset, giúp demo quá hạn và phụ thu 30k/30 phút; `/gps` vẫn là alias tương
  thích cũ.
- Giao diện theo phong cách Civic Mobility Command Center: rail điều hướng tối
  có thể cuộn tới từng vùng chức năng, workspace sáng, panel/form/table sắc cạnh,
  dropdown custom có menu nổi và trạng thái chọn rõ ràng, topbar sticky và mật
  độ thông tin phù hợp phần mềm vận hành. Trên mobile, màn hình bỏ topbar riêng,
  đưa scene 3D lên đầu hero, nén các metric thành hàng ngang, gói card xe và
  dropdown thời lượng trong bề ngang viewport, đồng thời rút rail tối thành dock
  icon-only nổi ở đáy màn hình, có cả refresh/logout.
  Motion GSAP có hỗ trợ `prefers-reduced-motion`, scene Three.js low-poly mô
  phỏng Bike Hub isometric với đường nội khu, bike lane, canopy, dock/rack,
  status light và các xe City, Tandem, Child-seat khác hình dáng; bản scene mới
  mở rộng hồ nước, bờ kè, dải cây xanh và hàng cây ven đường để khung 3D không
  chỉ còn là mặt đường. Scene có
  thêm xe chạy vòng theo hành lang đường, người đi bộ/kiểm tra xe/em nhỏ vẫy tay
  và sway cây nhẹ để loop không bị tĩnh. Trên màn hình đăng nhập, scene được
  đóng như một dải preview bám theo cột nội dung thay vì một ảnh rời nằm lơ lửng.
  Layout đã được kiểm tra lại trên desktop/mobile để tránh che chữ, tràn ngang
  và lệch bố cục.

## Kiểm thử

```bash
npm test
```

Test hiện bao phủ đăng ký tài khoản, password policy, nâng cấp hash cũ, xác minh
email, reset mật khẩu demo-local, chống trùng email/phone/CCCD, chặn CCCD bị
khóa, trạng thái resident pending thuê như khách thường, staff scope theo bãi,
đổi xe trước handover, giao xe, trả xe, tính phí, thống kê, audit log trạng thái
xe và phiên đăng nhập đồng thời.

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
kiểm tra người chỉnh GPS vẫn kéo/snap marker được trong kịch bản tải tối đa 2
customer và 2 admin đăng nhập đồng thời, cư dân tìm bãi theo GPS/nhập tay, gửi rồi
hủy yêu cầu thuê, gửi lại yêu cầu, staff giao xe sau khi nhận cọc/giấy tờ, nhận
trả xe tại bãi staff được phân công, xuất ticket, kiểm tra dashboard chart/audit
log và tải báo cáo CSV. Luồng trả khác bãi vẫn được backend/UI hỗ trợ khi
Admin/Operator xử lý toàn hệ thống.

## Tài liệu PDF

Khi cập nhật tài liệu trong `pdf/`, build theo đúng quy trình:

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
