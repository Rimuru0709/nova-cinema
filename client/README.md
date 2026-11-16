# NOVA Cinema — giao diện React

Trang chủ lấy phim, rạp và suất chiếu từ API Express kết nối MySQL. Không còn dùng danh sách phim hoặc lịch chiếu cố định trong mã giao diện.

## Chạy trên máy cá nhân

Hoàn thành bước nhập database và cấu hình backend trong tài liệu ở thư mục dự án trước. Trong thư mục `client`, chạy:

```powershell
npm install
npm run dev
```

Mở địa chỉ `Local` Vite in ra. Backend cần đang chạy để trang tải được dữ liệu.

Mặc định Vite chuyển các yêu cầu `/api` đến `http://127.0.0.1:5000`. Nếu backend dùng cổng khác, sao chép `.env.example` thành `.env.local`, sửa `API_PROXY_TARGET`, rồi khởi động lại Vite.

`VITE_API_URL` chỉ dùng khi cần gọi trực tiếp một backend ở địa chỉ khác, ví dụ khi triển khai. Giá trị là địa chỉ gốc như `https://api.example.com`, không thêm `/api`. Backend phải cho phép nguồn giao diện qua CORS. Không đặt tài khoản hoặc mật khẩu MySQL trong các biến `VITE_*`.

## Phạm vi hiện tại

- Phim đang chiếu/sắp chiếu, thông tin phim, rạp và địa chỉ lấy từ database.
- Bộ chọn lịch chiếu lọc theo phim, rạp và ngày; chỉ cho xem lại suất chiếu do API trả về.
- Màn xem lại suất chiếu chưa giữ ghế, tạo đơn hoặc thanh toán. Các luồng này dành cho các thành viên phát triển tiếp.
- Có thông báo khi đang tải, không có lịch chiếu hoặc API không kết nối được; không âm thầm thay thế bằng dữ liệu giả.
- Poster và trailer sử dụng URL đã lưu trong database, cần Internet để tải nội dung ngoài.

## Kiểm tra

```powershell
npm run lint
npm run build
```
