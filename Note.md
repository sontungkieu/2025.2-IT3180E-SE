# Ghi chú phân tích use case

## Nguồn yêu cầu hiện hành

Nguồn yêu cầu hiện hành là `docs/đề.txt`: hệ thống Ecopark Bicycle Parking cho
thuê-trả xe tại các điểm tập kết, đặt cọc 200k + CCCD/giấy tờ tùy thân, tính giá
50k/giờ, 70k/2 giờ, 100k/3 giờ, phụ thu 30k/30 phút trả muộn và giảm 40% cho cư
dân Ecopark.

Các giả định cũ ở bản baseline trước không còn dùng cho bản phân tích hiện tại nếu
không xuất hiện trong `docs/đề.txt`.

## Quy tắc vẽ use case

UC là một chức năng/mục tiêu mà hệ thống cung cấp và thể hiện tương tác giữa actor
và hệ thống thông qua chức năng đó.

UC là một chuỗi hành động tương tác qua lại giữa actor và hệ thống, để lại một kết
quả mà hệ thống và actor có thể quan sát được. Nếu hệ thống chỉ push ra một
notification/dialogue thì không nên xem đó là một UC độc lập.

Để xem một việc là action hay UC, hình dung khi code sẽ phải làm thế nào: nếu user
chỉ chọn một action như bấm một nút thì đó thường là một action, không phải UC.

Khi khách hàng đang ở UC A mà có thể hoặc không sử dụng/chuyển sang UC B, từ A có
thể vẽ mũi tên `extend` sang B.

Resident Customer là actor chuyên biệt của Customer/User: cư dân thừa hưởng các
use case của người dùng thuê xe thông thường và có thêm nhánh nộp thẻ cư dân để
được giảm 40% giá thuê.
