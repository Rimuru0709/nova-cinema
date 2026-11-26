import express from 'express';
import { holdSeats, releaseHold, getHoldStatus } from '../controllers/seatController.js';
import { confirmBooking, processPayment, getBooking, listBookings } from '../controllers/checkoutController.js';

import { requireSession } from './auth.js';
const router = express.Router();
router.use(requireSession);
router.get('/', listBookings);

// Nghiệp vụ Giữ ghế (TV3)
router.post('/hold-seats', holdSeats);
router.post('/release-hold', releaseHold);
router.get('/holds/:id', getHoldStatus);

// Phối hợp Thành viên 4: Xác nhận đặt vé, thanh toán, hủy giữ ghế
router.post('/confirm', confirmBooking);
router.post('/:id/pay', processPayment);
router.get('/:id', getBooking);

export default router;

router.use((error, req, res, next) => { if (res.headersSent) return next(error); res.status(error.statusCode || 500).json({success:false,message:error.statusCode ? error.message : 'Chưa xử lý được đặt vé. Vui lòng thử lại.'}); });
