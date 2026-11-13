import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

const PORT = Number(process.env.PORT || 5000);

// Cho phép React gọi backend
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

// Đọc dữ liệu JSON từ frontend
app.use(express.json());

// Đường dẫn mặc định
app.get('/', (req, res) => {
    res.json({
        message: 'Chào mừng đến với API Nova Cinema.'
    });
});

// Kiểm tra server
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server Nova Cinema đang hoạt động.'
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});