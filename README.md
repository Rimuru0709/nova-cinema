# NOVA CINEMA — chạy với MySQL trên từng máy

Mỗi thành viên có database riêng trên máy mình. Cả nhóm chia sẻ cấu trúc và dữ liệu mẫu qua `database/nova_cinema.sql`; dữ liệu thay đổi sau khi import **không tự đồng bộ** giữa các máy.

## Yêu cầu

- Node.js đáp ứng Vite 8; có thể dùng Node.js 24 như máy hiện tại.
- MySQL Server **8.0.16 trở lên** và MySQL Workbench hoặc MySQL CLI.
- Internet để tải thư viện và các ảnh poster đang tham chiếu từ bên ngoài.

Thư mục dự án là thư mục có `client/`, `server/`, `database/` và file README này. Nếu terminal đang ở thư mục bên ngoài cùng, chạy `cd .\nova-cinema-main` trước.

## 1. Nhập database

Trong MySQL Workbench, mở kết nối MySQL **trên máy của bạn**, mở file `database/nova_cinema.sql`, rồi chạy toàn bộ script bằng **Ctrl+Shift+Enter**.

Script tạo database `nova_cinema`, 13 bảng và dữ liệu mẫu cho phim/rạp/phòng/ghế/lịch chiếu/sản phẩm. Nó không dùng `DROP`, `TRUNCATE` hoặc ghi đè các bản ghi có sẵn. Tên và khóa bảng phải thống nhất với nhóm; `CREATE TABLE IF NOT EXISTS` không cập nhật cấu trúc một database cũ khác thiết kế.

Lịch chiếu là dữ liệu minh họa trong 7 ngày tính từ ngày nhập, theo giờ Việt Nam. Có thể chạy lại `database/seed.sql` để bổ sung những suất còn thiếu cho 7 ngày tiếp theo. Tài khoản, giữ ghế, đơn và thanh toán ban đầu để trống.

## 2. Cấu hình backend riêng trên mỗi máy

Sao chép `server/.env.example` thành `server/.env`. Điền tài khoản và mật khẩu **MySQL trên máy mình**, ví dụ:

```dotenv
HOST=127.0.0.1
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=nova_cinema
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
```

`root` chỉ là ví dụ thiết lập trên máy cá nhân. Máy được cấu hình trong phiên làm việc này sử dụng tài khoản ứng dụng riêng, giới hạn ở database NOVA. Không gửi `.env` hoặc thư mục `server/.local/` cho các thành viên. `.env.example` không chứa mật khẩu thật.

Chỉ backend kết nối MySQL. React gọi API qua Vite proxy; không đưa mật khẩu MySQL vào frontend.

## 3. Cài thư viện và chạy

Chạy lần lượt trong thư mục dự án:

```powershell
npm ci
npm --prefix server ci
npm --prefix client ci
npm run db:check
npm run dev
```

- Website: http://localhost:5173
- Kiểm tra API + MySQL: http://127.0.0.1:5000/api/health
- Dừng web/API: **Ctrl+C** trong terminal đang chạy.

Nếu cổng backend 5000 đang được sử dụng, đổi `PORT` trong `server/.env` và `API_PROXY_TARGET` trong `client/.env` cho khớp (xem `client/.env.example`). Dùng URL Local Vite in ra nếu cổng 5173 bận. Khi đổi cổng frontend và gọi API trực tiếp, cập nhật `CLIENT_URL` tương ứng.

Lựa chọn khác: nếu tài khoản trong `server/.env` có quyền tạo database/bảng, có thể chạy `npm run db:import` thay cho bước nhập bằng Workbench. Tài khoản ứng dụng riêng chỉ đọc/ghi dữ liệu không có quyền nhập schema.

## API hiện có

| API GET | Nội dung |
| --- | --- |
| `/api/health` | Kiểm tra kết nối thật tới MySQL |
| `/api/catalog` | Phim đang/sắp chiếu và danh sách rạp cho trang chủ |
| `/api/movies` | Danh sách phim; bộ lọc `q`, `status`, `genre` |
| `/api/movies/:id` | Chi tiết phim |
| `/api/cinemas` | Các rạp đang hoạt động |
| `/api/showtimes?movieId=dune&cinemaId=1&date=YYYY-MM-DD` | Các suất chưa bắt đầu của phim/rạp/ngày |
| `/api/products` | Bắp nước/combo; có thể lọc `category=popcorn`, `drink`, `combo` |

Trang chủ lấy phim, rạp và lịch chiếu từ database qua API. Nếu MySQL/API lỗi, trang hiển thị thông báo và nút thử lại; không âm thầm thay bằng danh sách mẫu trong React.

## Gửi cho các thành viên

Gửi source code cùng file `database/nova_cinema.sql` và hướng dẫn này. Mỗi người làm lại các bước 1–3 bằng tài khoản MySQL riêng. Nên giữ `schema.sql` và `seed.sql` trong Git để cùng theo dõi thay đổi cấu trúc/dữ liệu mẫu. Khi sửa cấu trúc sau này, nhóm cần thống nhất và thêm script cập nhật, không tự tạo bộ bảng trùng chức năng.

Phần hiện tại chuẩn bị nền dữ liệu và API đọc để nhóm phát triển tiếp. Các nghiệp vụ đăng nhập, giữ ghế 3 phút, chốt ghế đồng thời, thanh toán và phát hành QR **chưa được triển khai**. Chi tiết bảng và trách nhiệm triển khai nằm trong [database/README.md](database/README.md).

## Kiểm tra source

```powershell
npm run lint
npm run build
```
