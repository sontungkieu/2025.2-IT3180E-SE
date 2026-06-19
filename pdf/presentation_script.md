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

Customer sẽ dùng hệ thống để đăng ký, tìm bãi, chọn xe và theo dõi lượt thuê. Resident Customer là trường hợp mở rộng của Customer, có thẻ cư dân hợp lệ để được giảm giá.

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

Cụm thứ nhất là người dùng và hồ sơ: USERS, CUSTOMER_PROFILES, RESIDENT_CARDS và STAFF. Cụm này phục vụ đăng nhập, phân quyền, thông tin liên hệ và điều kiện giảm giá cư dân.

Cụm trung tâm là giao dịch thuê - trả: RENTAL_REQUESTS, RENTALS, DEPOSITS và TICKETS. Đây là phần lưu request chờ nhận xe, lượt thuê đang chạy, tiền cọc và vé sau khi trả xe.

Cụm bãi và đội xe gồm STATIONS, BIKE_TYPES, BIKES và BIKE_STATUS_LOGS. Phần này lưu bãi xe, loại xe, xe cụ thể và lịch sử đổi trạng thái để audit.

Hai cụm bên dưới là chính sách phí và báo cáo vận hành. Chính sách phí gồm discount cư dân, phụ thu trễ và đặt cọc; báo cáo dùng dữ liệu rental, ticket và status log để tổng hợp doanh thu, trạng thái đội xe và audit trail.

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

## Slide 10 - Demo director cho alternative flow

Route `/gd` là phần hỗ trợ demo alternative flow.

Khi thuyết trình, nhóm có thể mở một tab riêng để kéo vị trí xe hoặc người dùng gần bãi nhận/trả. Điểm quan trọng là xe không bay thẳng qua hồ hoặc nhà, mà di chuyển theo polyline đường đi. Cùng màn này có đồng hồ hệ thống để tua giờ và demo phụ thu trễ.

Nhờ đó khi cô yêu cầu demo các tình huống khác nhau, ví dụ "khách ở gần bãi A" hoặc "trả xe ở bãi B", nhóm có thể điều chỉnh vị trí nhanh mà vẫn giữ trải nghiệm giống thực tế.

## Slide 11 - API và backend implementation

Backend được chia theo nhóm API.

Nhóm Auth/Profile xử lý đăng ký, đăng nhập, session và thông tin cư dân. Nhóm Station/Bike trả danh sách bãi, xe theo bãi và tạo rental request.

Nhóm Handover/Return phục vụ staff hoặc admin: xem request chờ nhận xe, xác nhận giao xe, nhận trả xe và tính ticket.

Nhóm Admin/Report quản lý xe, trạng thái, báo cáo và audit log.

Về kỹ thuật, server có validation phía backend cho họ tên, số điện thoại, CCCD/CMND và dữ liệu trùng. Các thao tác rental, handover và return chạy qua transaction để hạn chế double-booking. Mọi thay đổi trạng thái xe quan trọng được lưu vào audit log với người đổi, bãi và lý do.

## Slide 12 - Dashboard báo cáo

Dashboard báo cáo không chỉ là bảng dữ liệu.

Nhóm đã thêm chart doanh thu theo kỳ để admin xem tổng tiền vé theo ngày, tuần hoặc tháng. Fleet status distribution giúp biết bao nhiêu xe đang available, rented hoặc broken.

Ngoài ra có thống kê lượt thuê và phụ thu trễ từ report rows. CSV export dùng đúng filter hiện tại, nghĩa là admin đang lọc theo bãi hoặc theo thời gian nào thì file xuất ra khớp với màn hình đó.

Audit panel giúp truy vết khi staff hoặc admin đổi trạng thái xe, ví dụ xe từ available sang broken hoặc từ rented về available sau khi trả.

## Slide 13 - Testing và evidence

Nhóm kiểm thử ở ba lớp.

Backend tests kiểm tra đăng ký, validation, duplicate email/phone/CCCD, giữ xe khi request, hủy request, handover, pricing khi trả xe, reports, audit log và concurrent sessions.

UI smoke test kiểm tra desktop/mobile render, GSAP load, canvas Three.js có pixel thật, Leaflet marker, không có console error và không bị horizontal overflow.

UC smoke test chạy theo flow demo: GPS context, ít nhất 2 customer và 2 admin sessions, request/cancel, handover, return ticket, chart dashboard, audit log và CSV download.

Các screenshot trong report là ảnh thật từ app: auth, customer desktop/mobile, operations và `/gd`.

## Slide 14 - Demo script khi thuyết trình

Đến phần demo live, nhóm sẽ đi theo đúng 5 bước trên slide.

Bước 1: mở platform và tab `/gd`, kéo vị trí gần bãi nhận để mô phỏng customer đang ở khu vực đó; nếu cần diễn quá hạn thì tua đồng hồ +30 hoặc +60 phút.

Bước 2: đăng nhập bằng customer, vào màn tìm bãi, lọc phạm vi hoặc loại xe, chọn một xe đang rảnh và gửi rental request.

Bước 3: chuyển sang staff hoặc admin, mở request đang chờ, xác nhận giấy tờ, nhập thông tin cọc 200 nghìn và bấm giao xe. Lúc này xe chuyển sang rented.

Bước 4: xử lý trả xe. Chọn bãi trả khác bãi nhận nếu cần, chọn tình trạng xe, kiểm tra phí thuê, giảm cư dân hoặc phụ thu trễ, sau đó xuất ticket.

Bước 5: chuyển sang admin dashboard để xem biểu đồ, audit log và export CSV. Cuối cùng nhắc lại target deploy GCP và hướng nâng cấp storage khi cần scale.

## Slide 15 - Kết luận

Tóm lại, platform đã bao phủ đầy đủ UC001 đến UC005, bao gồm cả main flow và các alternative flow quan trọng.

Về giao diện, hệ thống có desktop, mobile, bản đồ, scene 3D và route `/gd` để phục vụ trình bày.

Về backend, hệ thống có session theo role, validation, transaction nghiệp vụ, pricing, report chart và audit log.

Về triển khai, repo đã có Dockerfile để đóng gói đưa lên GCP. Bản demo dùng SQLite/WAL cho đơn giản và ổn định; nếu sau này cần scale ngang thì có thể nâng storage lên Cloud SQL, thêm backup và session store bền vững.

## Slide 16 - Q&A

Em xin kết thúc phần trình bày của nhóm tại đây. Nhóm em sẵn sàng nhận câu hỏi của cô và các bạn.

Nếu được hỏi về SQLite: Với scope demo và một instance, SQLite/WAL là hợp lý vì nhẹ, nhanh và dễ backup. Nếu chạy nhiều instance hoặc dữ liệu tăng mạnh, nhóm sẽ chuyển sang Cloud SQL.

Nếu được hỏi về GPS thật: Hiện tại `/gd` là route demo để mô phỏng vị trí và thời gian hệ thống. Khi gắn thiết bị thật, backend có thể nhận tọa độ từ thiết bị hoặc app mobile và cập nhật theo cùng model dữ liệu.

Nếu được hỏi về bảo mật: Hiện hệ thống đã có role guard, session cookie, validation server-side. Bản production cần bổ sung HTTPS, secret manager, backup định kỳ và hardening quyền truy cập.

Nếu được hỏi về điểm nổi bật: Điểm nổi bật là hệ thống đi hết vòng đời thuê - trả, có trả khác bãi, tính phí/giảm giá/phụ thu, audit log và báo cáo biểu đồ chứ không chỉ dừng ở CRUD.
