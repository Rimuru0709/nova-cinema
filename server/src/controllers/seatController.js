import { holdSeats as holdService, releaseHold as releaseService, getHoldDetails } from '../services/seatHoldService.js';

/**
 * Xử lý yêu cầu giữ ghế (thời hạn 3 phút, chống trùng ghế đồng thời).
 */
export async function holdSeats(req, res) {
    try {
        const { showtimeId, seatIds } = req.body;
        const userId = res.locals.account.id;

        if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp showtimeId và danh sách seatIds.'
            });
        }

        const result = await holdService({ showtimeId, seatIds, userId });

        res.status(200).json({
            success: true,
            message: `Giữ thành công ${seatIds.length} ghế trong 3 phút.`,
            data: result
        });
    } catch (error) {
        console.error('Lỗi khi giữ ghế:', error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Xử lý hủy giữ ghế (giải phóng ghế ngay khi khách hàng đổi ý).
 */
export async function releaseHold(req, res) {
    try {
        const { holdId } = req.body;
        const userId = res.locals.account.id;

        if (!holdId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp holdId.'
            });
        }

        const result = await releaseService({ holdId, userId });

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Lỗi khi hủy giữ ghế:', error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Lấy trạng thái phiên giữ ghế và đếm ngược thời gian còn lại.
 */
export async function getHoldStatus(req, res) {
    try {
        const { id } = req.params;
        const result = await getHoldDetails(id, res.locals.account.id);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Lỗi khi lấy trạng thái phiên giữ ghế:', error.message);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}
