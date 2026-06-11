# Ecopark Bicycle Parking

Ứng dụng web fullstack cục bộ cho bài toán thuê-trả xe đạp Ecopark. Frontend dùng
HTML/CSS/JavaScript thuần, có GSAP cho motion layer, backend dùng Node.js và
SQLite cục bộ theo lược đồ trong tài liệu use case.

## Yêu cầu môi trường

- Node.js 24 trở lên.
- LaTeX `latexmk` nếu cần build lại `pdf/main.pdf`.

## Chạy ứng dụng

```bash
npm install
npm run reset-db
npm run dev
```

Mở `http://127.0.0.1:4173`.

## Cấu trúc repo

- `public/`: giao diện HTML/CSS/JavaScript thuần, motion GSAP, scene Three.js
  và màn hình dashboard khách hàng/nhân sự.
- `server/`: HTTP API Node.js, SQLite schema/seed, auth session cục bộ và các
  luồng thuê-trả xe.
- `scripts/`: smoke test giao diện bằng Playwright.
- `test/`: test nghiệp vụ backend bằng `node --test`.
- `docs/`: tài liệu nguồn như use-case diagram.
- `pdf/`: tài liệu LaTeX và bản build `pdf/main.pdf`.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Khách thường | `customer@ecopark.test` | `customer123` |
| Cư dân Ecopark | `resident@ecopark.test` | `resident123` |
| Nhân sự bãi xe | `staff@ecopark.test` | `staff123` |
| Admin / Operator | `admin@ecopark.test` | `admin123` |

## Chức năng chính

- Khách hàng tạo tài khoản, đăng nhập, bổ sung thẻ cư dân, tìm bãi gần nhất theo
  GPS demo hoặc vị trí nhập tay, lọc loại xe, chọn xe rảnh, gửi yêu cầu thuê và
  hủy yêu cầu khi chưa nhận xe.
- Màn hình khách hàng có bản đồ thật bằng Leaflet/OpenStreetMap, hiển thị vị trí
  người dùng demo và marker các bãi xe; chọn marker hoặc thẻ bãi đều cập nhật
  danh sách xe tại bãi.
- Nhân sự bãi xe xử lý yêu cầu nhận xe, đối chiếu loại/số giấy tờ, ghi nhận đặt
  cọc 200k, giấy tờ giữ lại, hủy yêu cầu không đủ điều kiện, giao xe và chuyển xe
  sang trạng thái đang thuê.
- Nhân sự/Admin nhận xe trả ở bất kỳ bãi Ecopark nào, tính vé cuối cùng, áp dụng
  giảm 40% cho cư dân hợp lệ, phụ thu 30k mỗi 30 phút trả muộn, ghi chú tình trạng
  xe và hiển thị lại phiếu vừa xuất.
- Admin/Operator quản lý bãi xe, xe, trạng thái xe, tra cứu vị trí xe, lọc thống
  kê theo ngày/tuần/tháng, theo bãi/xe và xuất báo cáo CSV.
- Giao diện sáng màu theo hướng dashboard vận hành production-grade hơn: topbar
  sticky, panel/form/table rõ phân cấp, motion GSAP có hỗ trợ
  `prefers-reduced-motion`, scene Three.js mô phỏng bãi đỗ/rack/nhóm xe và card
  xe có minh hoạ riêng cho City, Tandem, Child-seat; layout đã được kiểm tra lại
  trên desktop/mobile để tránh che chữ, tràn ngang và lệch bố cục.

## Kiểm thử

```bash
npm test
```

Test hiện bao phủ đăng ký tài khoản, chống trùng email, kiểm tra xe đã giữ chỗ,
giao xe, trả xe, tính phí và thống kê.

Kiểm tra giao diện bằng browser thật:

```bash
npx playwright install chromium
npm run smoke:ui
npm run smoke:uc
```

Smoke test UI mở desktop/mobile, kiểm tra GSAP vendor đã load, scene Three.js có
render pixel, bản đồ Leaflet có marker thật, không có console error và không có
horizontal overflow ở cấp trang. Khi cần rà thiết kế thủ công, có thể chụp lại
các trạng thái auth/customer/admin bằng Playwright trước khi chốt thay đổi giao
diện.

Smoke test UC chạy pipeline giao diện chính: cư dân tìm bãi theo GPS/nhập tay,
gửi rồi hủy yêu cầu thuê, gửi lại yêu cầu, staff giao xe sau khi nhận cọc/giấy
tờ, nhận trả xe ở bãi khác, xuất ticket và tải báo cáo CSV.

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
