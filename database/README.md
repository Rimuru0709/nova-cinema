# Database chung cho nhóm NOVA

Yêu cầu: **MySQL 8.0.16 trở lên**, bộ mã `utf8mb4`, database `nova_cinema`.

## Các file

- `nova_cinema.sql`: bản gộp để gửi cho cả nhóm và import một lần.
- `schema.sql`: cấu trúc 13 bảng.
- `seed.sql`: dữ liệu mẫu; chạy sau `schema.sql`, hoặc chạy lại để bổ sung lịch demo trong 7 ngày tính từ ngày import.

Trong MySQL Workbench, mở `nova_cinema.sql`, chạy toàn bộ script và refresh Schemas. Mỗi thành viên import vào MySQL trên máy mình. Các máy có cùng cấu trúc/dữ liệu mẫu nhưng **không tự đồng bộ thay đổi**; thông tin kết nối MySQL được cấu hình riêng trong `server/.env`.

Các script không dùng `DROP`, `TRUNCATE`, `REPLACE`, không xóa dữ liệu và không ghi đè bản ghi đã tồn tại. Chạy lại cùng ngày không nhân đôi dữ liệu mẫu. `CREATE TABLE IF NOT EXISTS` **không tự nâng cấp cấu trúc bảng cũ**: thay đổi schema về sau cần một file migration chung cho nhóm. Nếu database hiện tại có cấu trúc khác, cần kiểm tra và sao lưu trước khi áp dụng migration.

## Dữ liệu có sẵn

- 7 phim giữ nguyên mã, tên, poster và mô tả của giao diện: `dune`, `oppenheimer`, `mai`, `godzilla`, `deadpool`, `joker`, `gladiator`.
- 3 rạp minh họa, mỗi rạp 2 phòng; mỗi phòng có 48 ghế (hàng A–F, số 1–8). Hàng D/E là VIP.
- Lịch cho hôm nay đến 6 ngày tiếp theo, chỉ thêm những suất chưa bắt đầu, tối đa 126 suất. Mỗi suất có các hàng tương ứng trong `showtime_seats`.
- 9 sản phẩm: 3 loại bắp, 3 đồ uống, 3 combo cố định. URL ảnh sản phẩm để `NULL`, nhóm có thể bổ sung sau.
- Chưa có tài khoản, mật khẩu, đơn đặt vé hoặc giao dịch mẫu.

**Đây là dữ liệu demo**, không phải lịch chiếu, giá bán, ngày phát hành hoặc đánh giá thực tế. Phim sắp chiếu dùng ngày import + 6/14/28 ngày. Những ngày này không được tự dời nếu import lại. Các suất mới có `is_demo = 1`; seed bỏ qua thời gian xung đột với lịch đã có. Giá ghế VIP cộng thêm 20.000 VND trong seed chỉ là lựa chọn minh họa.

## Quan hệ và phần dùng chung

| Bảng | Vai trò |
| --- | --- |
| `users` | Tài khoản và hồ sơ, vai trò `user`/`admin`; chỉ lưu `password_hash` |
| `movies` | Phim, thể loại dạng chuỗi để khớp giao diện hiện tại |
| `cinemas`, `rooms`, `seats` | Rạp → phòng → ghế |
| `showtimes` | Phim + phòng + giờ bắt đầu/kết thúc + giá vé cơ sở |
| `products` | Bắp, nước, combo bán như sản phẩm cố định; chưa quản lý BOM/tồn kho |
| `seat_holds` | Chủ sở hữu, suất chiếu và thời hạn giữ ghế |
| `showtime_seats` | Một dòng cho mỗi cặp suất chiếu/ghế, giá và trạng thái sở hữu hiện tại |
| `bookings` | Đơn của một khách hàng cho một suất chiếu, các tổng tiền và token QR |
| `booking_seats` | Các ghế trong đơn và giá vé tại lúc mua |
| `booking_items` | Các sản phẩm trong đơn, tên và giá tại lúc mua, số lượng |
| `payments` | Các lần thử thanh toán; mặc định phương thức giả lập `mock` |

`bookings.user_id` nối tới `users`; `showtime_id` nối tới `showtimes`. Một đơn có nhiều ghế, nhiều sản phẩm và có thể nhiều lần thử thanh toán. Không cần tạo lại các bảng đơn/ghế ở từng phần việc.

Tiền dùng `DECIMAL(12,0)`, đơn vị VND; thời gian `DATETIME` dùng giờ Việt Nam (`+07:00`). Backend cũng phải cấu hình múi giờ tương ứng. Giá trong `booking_seats` và `booking_items` là giá được lưu lúc mua, không lấy giá hiện tại để tính lại đơn cũ. QR dùng một token duy nhất cho cả đơn; việc sinh mã QR thuộc phần ứng dụng.

## Giữ ghế và thanh toán cần triển khai tiếp

- `showtime_seats` có khóa chính `(showtime_id, seat_id)`, nên mỗi ghế chỉ có một dòng lưu chủ sở hữu hiện tại trong mỗi suất. Các khóa ngoại ghép bảo đảm ghế thuộc đúng phòng, hold/đơn thuộc đúng suất và hold có đúng thời hạn.
- `seat_holds` lưu người giữ và `expires_at`. Khi triển khai, TV3 đặt hạn **3 phút**; TV4 dùng lại hạn đó, không bắt đầu lại đồng hồ tại trang thanh toán.
- `available`: không có hold/đơn; `held`: có `hold_id`, `held_until`; `booked`: có `booking_id`. `booking_seats` là lịch sử, nên một ghế có thể xuất hiện trong nhiều đơn cũ đã thất bại/hết hạn.
- Đơn `paid` yêu cầu `paid_at` và `qr_token`; các trạng thái chưa thanh toán không có các giá trị này. Một đơn chỉ có tối đa một giao dịch `succeeded`; `transaction_code` phải duy nhất để tránh xử lý cùng giao dịch hai lần.
- **Schema chưa triển khai cơ chế đặt vé.** Backend cần transaction và khóa hàng khi kiểm tra/giữ/chốt/nhả ghế, xử lý hết hạn và thanh toán lặp; không chỉ kiểm tra ghế ở frontend. Cần xác thực quyền sở hữu đơn và tính lại giá ở backend.
- Việc chặn lịch chiếu chồng nhau, không đặt suất đã bắt đầu và đối chiếu số tiền giao dịch cũng cần được kiểm tra trong nghiệp vụ backend. Các khóa/check ở đây không thay thế các kiểm tra đó.

Khi sửa `schema.sql` hoặc `seed.sql`, cập nhật lại `nova_cinema.sql` bằng cách nối hai file theo đúng thứ tự để bản gửi nhóm khớp với nguồn.
