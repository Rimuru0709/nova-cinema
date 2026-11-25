import express from 'express';
import { holdSeats, releaseHold, getHoldStatus } from '../controllers/seatController.js';
import { confirmBooking, processPayment, getBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Nghiệp vụ Giữ ghế (TV3)
router.post('/hold-seats', holdSeats);
router.post('/release-hold', releaseHold);
router.get('/holds/:id', getHoldStatus);

// Phối hợp Thành viên 4: Xác nhận đặt vé, thanh toán, hủy giữ ghế
router.post('/confirm', confirmBooking);
router.post('/:id/pay', processPayment);
router.get('/:id', getBooking);

export default router;
