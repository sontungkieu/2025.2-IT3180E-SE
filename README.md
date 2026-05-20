# Ecopark Bicycle Parking

Ứng dụng web fullstack cục bộ cho bài toán thuê-trả xe đạp Ecopark. Frontend dùng
HTML/CSS/JavaScript thuần, backend dùng Node.js và SQLite cục bộ theo lược đồ trong
tài liệu use case.

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

- `public/`: giao diện HTML/CSS/JavaScript thuần, scene Three.js và màn hình
  dashboard khách hàng/nhân sự.
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

- Khách hàng tạo tài khoản, đăng nhập, bổ sung thẻ cư dân, tìm bãi gần nhất, lọc
  loại xe, chọn xe rảnh và gửi yêu cầu thuê.
- Màn hình khách hàng có bản đồ thật bằng Leaflet/OpenStreetMap, hiển thị vị trí
  người dùng demo và marker các bãi xe; chọn marker hoặc thẻ bãi đều cập nhật
  danh sách xe tại bãi.
- Nhân sự bãi xe xử lý yêu cầu nhận xe, đối chiếu CCCD, ghi nhận đặt cọc 200k,
  giao xe và chuyển xe sang trạng thái đang thuê.
- Nhân sự/Admin nhận xe trả ở bất kỳ bãi Ecopark nào, tính vé cuối cùng, áp dụng
  giảm 40% cho cư dân hợp lệ và phụ thu 30k mỗi 30 phút trả muộn.
- Admin/Operator quản lý bãi xe, xe, trạng thái xe và xem thống kê theo ngày,
  tuần, tháng.
- Giao diện sáng màu, ưu tiên xanh lá và xanh dương, có scene Three.js nhỏ làm
  điểm nhấn 3D, các màn hình đã được kiểm tra lại trên desktop/mobile để tránh
  che chữ, tràn ngang và lệch bố cục.

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
```

Smoke test UI mở desktop/mobile, kiểm tra scene Three.js có render pixel, bản đồ
Leaflet có marker thật, không có console error và không có horizontal overflow ở
cấp trang. Khi cần rà thiết kế thủ công, có thể chụp lại các trạng thái
auth/customer/admin bằng Playwright trước khi chốt thay đổi giao diện.

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
