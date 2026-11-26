# NOVA Cinema — giao diện React

Giao diện React gọi API Express kết nối MySQL. Luồng TV3 → TV4 và các màn AD01/AD05/AD06 dùng dữ liệu database. Trang chủ hiện vẫn có dữ liệu dự phòng trong `useHome.jsx` khi API lỗi; đó là phần của TV1.

## Chạy trên máy cá nhân

Hoàn thành bước nhập database và cấu hình backend trong tài liệu ở thư mục dự án trước. Trong thư mục `client`, chạy:

```powershell
npm install
npm run dev
```

Mở địa chỉ `Local` Vite in ra. Backend cần đang chạy để trang tải được dữ liệu.

Mặc định Vite chuyển các yêu cầu `/api` đến `http://127.0.0.1:5000`. Nếu backend dùng cổng khác, sao chép `.env.example` thành `.env.local`, sửa `API_PROXY_TARGET`, rồi khởi động lại Vite.

`VITE_API_URL` chỉ dùng khi cần gọi trực tiếp một backend ở địa chỉ khác, ví dụ khi triển khai. Giá trị là địa chỉ gốc như `https://api.example.com`, không thêm `/api`. Backend phải cho phép nguồn giao diện qua CORS. Không đặt tài khoản hoặc mật khẩu MySQL trong các biến `VITE_*`.

## Thử luồng TV3 → TV4 sau khi pull

1. Ở thư mục dự án chứa cả `client` và `server`, chạy `npm.cmd run dev`.
2. Mở http://localhost:5173 và **đăng xuất, đăng nhập lại**. Cookie phiên nay dùng đường dẫn `/api` để API đặt vé nhận được tài khoản.
3. Mở `#lich-chieu`, chọn ngày còn suất (nếu hôm nay đã hết giờ, chọn ngày mai), chọn suất và tối đa 8 ghế.
4. Bấm **Tiếp tục chọn combo**: máy chủ giữ ghế 3 phút. Chọn món hoặc bỏ qua, rồi tiếp tục thanh toán. Đổi trang/tải lại không gia hạn giữ ghế.
5. Chọn **Thành công** hoặc **Thất bại**, bấm **Mô phỏng thanh toán**. Thành công lưu đơn, combo, giao dịch và mã vé trong MySQL; thất bại có thể thử lại trước khi hết hạn.
6. Thành công mở `#xac-nhan-dat-ve/<mã đơn>`, hiển thị phim, ghế, combo, tổng tiền, phương thức và thời gian thanh toán. Bấm **Xem vé điện tử & QR** để mở `#chi-tiet-ve/<mã đơn>`.
7. Mở `#ve-cua-toi` để xem lịch sử, lọc trạng thái, tìm phim/rạp/ghế và xem QR. Lịch sử gồm đơn thành công, chờ thanh toán, thất bại, hết hạn và đã hủy. Chỉ đơn thành công có QR. Vé vẫn còn sau khi tải lại trang hoặc đăng nhập lại trên máy khác dùng cùng backend/database.

Thanh toán không thu tiền thật. QR chứa token vé, không chứa email/số điện thoại; chưa có màn quét soát vé tại rạp. Không xuất PDF. Vé thử không chọn ghế vẫn được lưu riêng trong mục **Vé mẫu trong trình duyệt**.

Nếu lịch chiếu đã hết ngày, chạy lại `database/seed.sql` trong Workbench để bổ sung lịch demo 7 ngày tới. Script chỉ thêm dữ liệu thiếu, không reset ghế hoặc đơn đã có. Các máy MySQL riêng không tự đồng bộ giao dịch.

API đặt vé yêu cầu phiên đăng nhập; chủ đơn mới được xem/giải phóng/thanh toán. Máy chủ tính lại giá, kiểm tra hạn giữ ghế, và chỉ chuyển ghế sang đã đặt khi thanh toán thành công. Một phiên chỉ chọn ghế, chưa tạo đơn tại bước thanh toán, sẽ không xuất hiện trong lịch sử đơn.

## Sử dụng admin TV4

Đăng nhập bằng tài khoản có `role=admin` (ví dụ tài khoản `admin@nova.vn` đã được cấp quyền). Đăng ký thông thường không tự cấp quyền admin. Mở **Quản trị** trên trang chủ/hồ sơ hoặc vào `http://localhost:5173/#admin`.

| Trang | Cách sử dụng |
| --- | --- |
| `#admin/ad01` | Chọn khoảng ngày/cụm rạp rồi **Áp dụng**. Doanh thu chỉ tính đơn thành công theo ngày thanh toán; xem tiền vé, bắp nước, phim và doanh thu từng ngày. |
| `#admin/ad06` | Tìm theo mã đơn/tên/email; lọc trạng thái, rạp và ngày tạo đơn. Bấm **Chi tiết** để xem ghế, combo, giá tại lúc mua, các lần thanh toán và QR nếu đã thành công. |
| `#admin/ad05` | Bấm **Thêm món mới**, điền mã/tên/loại/giá/mô tả/đường dẫn ảnh rồi lưu. Bấm **Sửa / Trạng thái** để sửa hoặc bỏ chọn **Đang bán**. |

- Danh mục sản phẩm dùng chung với trang chọn combo. Sau khi chỉnh sản phẩm, tải lại trang combo để nhận dữ liệu mới. Món ngừng bán không thể thêm vào đơn mới; đơn đã mua giữ nguyên tên và giá cũ.
- AD01 mặc định lọc từ đầu tháng đến hôm nay. Bấm **Toàn bộ thời gian** nếu cần xem đơn cũ. Các màn tự cập nhật mỗi 30 giây hoặc khi bấm **Làm mới**.
- Không xóa sản phẩm đã có lịch sử, không hoàn tiền thật, không xuất PDF. AD02/AD03/AD04 chưa mở trong phần TV4.
- Nút thanh toán vẫn là mô phỏng: doanh thu là tổng các đơn thử thành công trong database, không phải tiền đã thu qua MoMo/VNPAY thật.

## Kịch bản kiểm tra lại trên trình duyệt

1. Đặt một ghế, chọn combo, chọn thanh toán **Thất bại** rồi thử **Thành công** khi còn thời hạn. Kiểm tra một đơn có hai lần thanh toán nhưng chỉ một vé và một lần cộng doanh thu.
2. Tải lại trang xác nhận và trang chi tiết vé: mã đơn/QR/tổng tiền phải giữ nguyên. Không có nút PDF.
3. Tạo một đơn thất bại khác rồi chờ đủ 3 phút từ lúc giữ ghế. Mở lịch sử: đơn chuyển hết hạn, không có QR; ghế có thể được đặt lại.
4. Đăng nhập admin: kiểm tra đơn ở AD06 và số tiền ở AD01, thử bộ lọc rạp/ngày/trạng thái.
5. Tạo/sửa/ngừng bán một sản phẩm ở AD05; kiểm tra trang combo sau khi tải lại. Kiểm tra hóa đơn cũ vẫn giữ giá lúc mua.
6. Đăng nhập khách thường rồi mở `#admin`: phải bị chặn. Không thể đọc chi tiết đơn thuộc khách khác.

Kiểm thử tự động đã kiểm tra API/MySQL, phân quyền, giữ ghế đồng thời, hết hạn, thanh toán lặp, doanh thu và render bảng lịch sử. Kiểm tra thao tác/hiển thị thực tế trong Chrome chưa hoàn tất do công cụ điều khiển trình duyệt dừng khi không xác định được URL; các bước trên là phần còn cần xác nhận trực quan.

## Phạm vi hiện tại

- Phim đang chiếu/sắp chiếu, thông tin phim, rạp và địa chỉ lấy từ database.
- Lịch chiếu lọc theo phim, rạp, ngày và khung giờ; sơ đồ ghế lấy trạng thái từ MySQL.
- Đã nối TV3 → TV4: giữ ghế 3 phút → combo → thanh toán mô phỏng → vé QR trong tài khoản.
- TV4 có thông báo đang tải, trống hoặc lỗi kết nối; đơn mẫu trong phiên tách riêng khỏi đơn trong tài khoản và doanh thu admin.
- Poster và trailer sử dụng URL đã lưu trong database, cần Internet để tải nội dung ngoài.

## Kiểm tra

```powershell
npm.cmd test
npm.cmd run build
```

Trong thư mục `server`, chạy `npm.cmd test` để kiểm thử tích hợp với MySQL đã cấu hình. Test tạo tài khoản/suất/sản phẩm riêng và dọn dữ liệu do nó tạo; không dùng đơn thật của người dùng làm dữ liệu thử.
