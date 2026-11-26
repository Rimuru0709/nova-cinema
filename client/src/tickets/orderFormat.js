export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);
export const dateTime = value => value && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—';
export const statusNames = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  payment_failed: 'Thanh toán thất bại',
  expired: 'Hết hạn giữ ghế',
  cancelled: 'Đã hủy',
  'simulated-success': 'Vé mẫu',
};
export const methodNames = { momo: 'Ví MoMo', vnpay: 'VNPAY', card: 'Thẻ ngân hàng', mock: 'Mô phỏng' };
