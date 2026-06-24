# Script thuyết trình - Ecopark Bicycle Parking Platform

Thời lượng khuyến nghị: 8-10 phút trình bày slide, 3-5 phút demo live.

## Slide 1 - Title

Kính chào cô và các bạn. Nhóm em xin trình bày project **Ecopark Bicycle Parking Platform**.

Ý tưởng của nhóm là xây dựng một nền tảng quản lý thuê - trả xe đạp trong Ecopark. Hệ thống không chỉ có màn hình cho khách thuê xe, mà còn có workspace cho nhân sự bãi xe và admin vận hành.

Trong report và phần demo, nhóm tập trung vào 5 use case chính: đăng ký/đăng nhập, tìm bãi và chọn xe, giao xe kèm đặt cọc, trả xe và xuất vé, cuối cùng là quản lý đội xe và báo cáo.

## Slide 2 - Mục tiêu bài toán

Bài toán xuất phát từ tình huống Ecopark có nhiều bãi xe, nhiều loại xe và trạng thái xe thay đổi liên tục. Nếu chỉ quản lý bằng ghi chép rời rạc thì rất khó biết xe nào đang rảnh, xe nào đang thuê, xe nào cần sửa, và doanh thu từng kỳ là bao nhiêu.

Với khách hàng, nhu cầu chính là tìm được bãi gần mình, xem xe rảnh, chọn loại xe phù hợp và gửi yêu cầu thuê nhanh.

Với staff hoặc admin, hệ thống phải hỗ trợ kiểm giấy tờ, nhận cọc 200 nghìn, bàn giao xe, nhận trả xe ở bãi khác, tính phí và xuất vé.

Với quản lý, hệ thống cần dashboard doanh thu, trạng thái đội xe, audit log và xuất CSV theo bộ lọc. Vì vậy nhóm triển khai theo hướng platform web có UI desktop, mobile và có định hướng deploy lên Google Cloud Platform.

## Slide 3 - Actor và use case

Ở slide này là sơ đồ actor và use case tổng quan.

Nhóm chia actor thành các nhóm chính: Customer, Resident Customer, Station Staff, Station Manager, Admin hoặc Operator. Ngoài ra có GPS/Map Service hỗ trợ luồng tìm bãi.

Customer sẽ dùng hệ thống để đăng ký, tìm bãi, chọn xe và xem trạng thái yêu cầu/lượt thuê. Resident Customer là trường hợp mở rộng của Customer, có thẻ cư dân hợp lệ để được giảm giá.

Staff và Manager xử lý nghiệp vụ tại bãi: kiểm tra yêu cầu, nhận cọc, giao xe, nhận trả xe và cập nhật tình trạng. Admin hoặc Operator quản lý bãi, xe, trạng thái và báo cáo.

## Slide 4 - Scope đã implement theo UC001-UC005

Nhóm đã bám theo 5 use case chính.

UC001 là tài khoản và xác thực khách. Hệ thống có đăng ký, đăng nhập, validation họ tên, số điện thoại, CCCD/CMND và thông tin cư dân.

UC002 là tìm bãi và chọn xe. Khách có thể dùng GPS demo hoặc vị trí nhập tay, lọc phạm vi, lọc loại xe, chọn xe rảnh và gửi hoặc hủy request.

UC003 là giao xe và đặt cọc. Staff xác nhận giấy tờ, ghi nhận cọc 200 nghìn, giấy tờ giữ lại và chuyển trạng thái xe sang đang thuê.

UC004 là trả xe và xuất vé. Hệ thống hỗ trợ trả khác bãi, tính phí, giảm cư dân, phụ thu trễ, ghi chú tình trạng xe và tạo ticket summary.

UC005 là quản lý vận hành. Admin có quản lý bãi/xe, cập nhật trạng thái kèm lý do, xem report charts, audit log và export CSV.

## Slide 5 - Kiến trúc GCP

Kiến trúc của hệ thống gồm browser UI cho ba nhóm vai trò: Customer, Staff và Admin.

Phía server là Node.js service phục vụ cả static UI và API `/api/*`. Bên trong service được tách theo các domain module như auth, rental, pricing, reports và audit.

Về triển khai, nhóm đóng gói bằng Docker để có thể chạy local hoặc đưa lên GCP. Với scope demo và nộp bài, SQLite/WAL là đủ vì dữ liệu nhỏ, triển khai nhanh và dễ backup. Khi deploy single-instance trên GCP, file SQLite có thể đặt trên persistent disk.

Nếu sau này cần production nhiều instance hoặc scale ngang, lớp storage có thể chuyển sang Cloud SQL. Vì vậy Cloud SQL trong kiến trúc là đường nâng cấp, còn bản demo hiện tại ưu tiên SQLite để ổn định và dễ trình bày.

## Slide 6 - Thiết kế dữ liệu

Slide này gom schema theo cụm để dễ đọc khi thuyết trình; ERD chi tiết nằm trong report.

Trung tâm là lõi giao dịch thuê - trả: RENTAL_REQUESTS, RENTALS, DEPOSITS và TICKETS. Đây là phần lưu request chờ nhận xe, lượt thuê đang chạy, tiền cọc và vé sau khi trả xe.

Cụm người dùng và hồ sơ cấp thông tin khách, cư dân và staff cho lõi giao dịch. Cụm bãi và đội xe cấp dữ liệu bãi, loại xe, xe cụ thể và status log.

Chính sách phí đi vào lõi giao dịch để tính cọc, giảm cư dân và phụ thu. Sau khi có rental, ticket và status log, hệ thống tổng hợp thành báo cáo vận hành.

Vì vậy slide chỉ giữ bốn quan hệ chính quanh lõi thuê - trả, còn quan hệ bảng chi tiết để cô đọc trong report.

## Slide 7 - Vòng đời thuê xe

Vòng đời bắt đầu từ trạng thái bike available. Khi khách chọn xe và gửi yêu cầu, xe chuyển sang request pending pickup để tránh người khác đặt trùng.

Nếu khách hoặc staff hủy, hoặc request hết hạn, xe quay lại available. Nếu staff kiểm tra giấy tờ và nhận cọc thành công, request chuyển thành rental in progress.

Khi khách trả xe, hệ thống tính tiền và xuất ticket completed. Sau khi kiểm tra, xe có thể quay lại available hoặc chuyển sang broken/review nếu có vấn đề cần sửa.

Điểm quan trọng ở đây là hệ thống không chỉ đổi trạng thái trên UI, mà backend cập nhật trong transaction để giảm rủi ro double-booking.

## Slide 8 - Customer mobile flow

Slide này phóng to flow khách hàng trên mobile thành ba lát cắt để dễ nhìn khi chiếu.

Lát đầu tiên là phần tổng quan: khách thấy nhanh bãi gần, số xe có thể thuê và lượt đang theo dõi. Bên dưới là điểm bắt đầu của flow thuê xe.

Lát thứ hai là bước tìm bãi: khách chọn loại xe, vị trí tìm kiếm, phạm vi, xem bản đồ và danh sách bãi gần nhất.

Lát thứ ba là bước chọn xe: sau khi chọn bãi, khách xem xe rảnh tại bãi đó, chọn thời lượng thuê và bấm thuê. Nhóm giữ vị trí, map, bãi gần và xe rảnh trong cùng một flow để khách không phải chuyển qua nhiều màn hình rời rạc.

## Slide 9 - Operations UI

Đây là workspace cho staff và admin.

Màn hình này gom các nghiệp vụ vận hành: xem request đang chờ, xác nhận giao xe, xử lý trả xe, quản lý đội xe và xem báo cáo.

Trong demo, phần staff sẽ dùng các bảng pending request và active rental để làm UC003 và UC004. Phần admin sẽ dùng fleet table, dashboard chart, audit log và export CSV cho UC005.

## Slide 10 - Light/Dark Mode

Slide này cho thấy giao diện đã có cả light mode và dark mode.

Điểm em muốn nhấn mạnh là dark mode không chỉ đổi nền cho đẹp, mà dùng cùng hệ design tokens với app: card, dropdown, chart, form và bản đồ đều được xử lý theo theme.

Map Leaflet có treatment riêng để không bị một mảng trắng gắt khi chuyển sang dark mode. Scene 3D vẫn giữ tương phản để nhìn rõ xe, đường, hồ và cây.

Trong demo live, người dùng có thể chọn Sáng, Tối hoặc Hệ thống; lựa chọn này được lưu trong trình duyệt nên khi đổi tab hoặc reload vẫn giữ đúng theme.

## Slide 11 - Demo director cho alternative flow

Route `/gd` là phần hỗ trợ demo alternative flow.

Màn này có bốn việc chính. Thứ nhất là tìm và chọn đúng tài khoản khách; nếu khách đang có request hoặc đang thuê thì chọn kèm session tương ứng.

Thứ hai là kéo GPS người dùng. Vị trí không nhảy kiểu giả lập thô, mà đi theo polyline đường; trong lúc marker chạy trên `/gd`, tab customer đăng nhập cùng tài khoản cũng nhận vị trí stream qua API và marker "Bạn" trên map chạy theo.

Thứ ba là tua đồng hồ hệ thống để demo quá hạn và phụ thu trễ. Thứ tư là kiểm bán kính bãi: customer có thể gửi request trước, nhưng giao xe và trả xe chỉ hợp lệ khi user ở gần bãi tương ứng.

Nhờ đó khi cô yêu cầu demo các tình huống khác nhau, ví dụ "khách ở gần bãi A" hoặc "trả xe ở bãi B", nhóm có thể điều chỉnh nhanh ngay trong buổi trình bày.

## Slide 12 - API và backend implementation

Backend được chia theo nhóm API.

Nhóm Auth/Profile xử lý đăng ký, đăng nhập, session và thông tin cư dân. Nhóm Station/Bike trả danh sách bãi, xe theo bãi và tạo rental request.

Nhóm Handover/Return phục vụ staff hoặc admin: xem request chờ nhận xe, xác nhận giao xe, nhận trả xe và tính ticket.

Nhóm Admin/Report quản lý xe, trạng thái, báo cáo và audit log.

Về kỹ thuật, server có validation phía backend cho họ tên, số điện thoại, CCCD/CMND và dữ liệu trùng. Các thao tác rental, handover và return chạy qua transaction để hạn chế double-booking. Mọi thay đổi trạng thái xe quan trọng được lưu vào audit log với người đổi, bãi và lý do.

## Slide 13 - Dashboard báo cáo

Dashboard báo cáo không chỉ là bảng dữ liệu; slide này đưa ảnh thật của workspace vận hành vào để cô thấy UI đang chạy.

Nhóm đã thêm chart doanh thu theo kỳ để admin xem tổng tiền vé theo ngày, tuần hoặc tháng. Fleet status distribution giúp biết bao nhiêu xe đang available, rented hoặc broken.

Ngoài ra có thống kê lượt thuê và phụ thu trễ từ report rows. CSV export dùng đúng filter hiện tại, nghĩa là admin đang lọc theo bãi hoặc theo thời gian nào thì file xuất ra khớp với màn hình đó.

Audit panel giúp truy vết khi staff hoặc admin đổi trạng thái xe, ví dụ xe từ available sang broken hoặc từ rented về available sau khi trả.

## Slide 14 - Testing và evidence

Phần evidence được nhóm trình bày theo những điểm có thể kiểm chứng nhanh, thay vì chỉ liệt kê chung chung.

Backend API tests đang pass 22/22, bao phủ các nhánh quan trọng như request tạo được ở ngoài bán kính nhưng giao xe bị chặn theo GPS hiện tại, xuất vé, báo cáo, audit log và GPS demo theo từng customer giữa `/gd` với màn khách hàng. Vì project là JavaScript/Node.js, nhóm dùng `node --test` thay vì pytest.

UI smoke test kiểm tra 5 cỡ màn hình đại diện: khách hàng desktop, khách hàng mobile, nhân sự màn rộng, nhân sự màn vừa và admin mobile. Test này bắt các lỗi rất thực tế như tràn ngang, canvas Three.js blank, Leaflet marker lỗi, dropdown custom lỗi hoặc console error.

UC smoke test là phần đáng nhắc nhất: nó đi qua flow demo thật từ `/gd`, chọn đúng user và kiểm marker customer chạy theo GPS stream, khách gửi yêu cầu, nhân sự giao xe, khách xác nhận bãi trả trong bán kính hợp lệ, nhân sự xuất vé, sau đó kiểm tra dashboard, audit log và CSV export.

CI/CD được cấu hình bằng GitHub Actions. Workflow chạy static check tương đương lint nhẹ bằng `node --check`, chạy coverage, UI smoke, UC smoke và build Docker image để đảm bảo bản nộp có thể đóng gói.

## Slide 15 - Mở demo trực tiếp

Đến slide cuối, nhóm mở app và chạy 5 bước demo live trên trình duyệt.

Bước 1: mở platform và tab `/gd`, chọn tài khoản customer cần diễn; có thể để user ở xa để chứng minh request vẫn tạo được, rồi kéo GPS để cả map `/gd` và map customer chạy theo trước khi staff giao xe. Nếu cần diễn quá hạn thì tua đồng hồ +30 hoặc +60 phút.

Bước 2: đăng nhập bằng customer, vào màn tìm bãi, lọc phạm vi hoặc loại xe, chọn một xe đang rảnh và gửi rental request.

Bước 3: trong `/gd` kéo GPS user vào bán kính bãi nhận, sau đó chuyển sang staff hoặc admin, mở request đang chờ, xác nhận giấy tờ, nhập thông tin cọc 200 nghìn và bấm giao xe. Lúc này xe chuyển sang rented.

Bước 4: xử lý trả xe. Chọn bãi trả khác bãi nhận nếu cần, chọn tình trạng xe, kiểm tra phí thuê, giảm cư dân hoặc phụ thu trễ, sau đó xuất ticket.

Bước 5: chuyển sang admin dashboard để xem biểu đồ, audit log và export CSV. Sau đó nhóm ở lại màn hình app để nhận câu hỏi và kiểm tra trực tiếp nếu cô muốn xem thêm nhánh khác.

Nếu được hỏi về SQLite: Với scope demo và một instance, SQLite/WAL là hợp lý vì nhẹ, nhanh và dễ backup. Nếu chạy nhiều instance hoặc dữ liệu tăng mạnh, nhóm sẽ chuyển sang Cloud SQL.

Nếu được hỏi về GPS thật: Hiện tại `/gd` là route demo để mô phỏng vị trí và thời gian hệ thống. Khi gắn thiết bị thật, backend có thể nhận tọa độ từ thiết bị hoặc app mobile và cập nhật theo cùng model dữ liệu.

Nếu được hỏi về bảo mật: Hiện hệ thống đã có role guard, session cookie, validation server-side. Bản production cần bổ sung HTTPS, secret manager, backup định kỳ và hardening quyền truy cập.

Nếu được hỏi về điểm nổi bật: Điểm nổi bật là hệ thống đi hết vòng đời thuê - trả, có trả khác bãi, tính phí/giảm giá/phụ thu, audit log và báo cáo biểu đồ chứ không chỉ dừng ở CRUD.
