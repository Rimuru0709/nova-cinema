import express from 'express';
import { getShowtimes, getShowtimeById, getShowtimeSeats } from '../controllers/showtimeController.js';

const router = express.Router();

// Lấy danh sách lịch chiếu (lọc theo movieId, cinemaId, date, time)
router.get('/', getShowtimes);

// Lấy thông tin chi tiết và kiểm tra tính hợp lệ của suất chiếu
router.get('/:id', getShowtimeById);

// Lấy sơ đồ ghế, phân loại thường/VIP và trạng thái ghế (trống, đang giữ, đã đặt)
router.get('/:id/seats', getShowtimeSeats);

export default router;
