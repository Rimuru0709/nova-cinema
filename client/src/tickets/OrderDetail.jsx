import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Clapperboard, Ticket, Copy, CheckCircle2 } from 'lucide-react';
import { ticketQrPayload } from './tickets.js';
import { dateTime, methodNames, money, statusNames } from './orderFormat.js';
import './orders.css';

export function OrderStatus({ status }) { return <span className={`order-status ${status}`}>{statusNames[status] || status}</span>; }

export function CustomerFrame({ children }) {
  return <div className="tv4-page"><header className="tv4-header"><a className="tv4-brand" href="#trang-chu"><Clapperboard /><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a><nav aria-label="Điều hướng"><a href="#trang-chu">Trang chủ</a><a href="#phim">Phim</a><a href="#lich-chieu">Lịch chiếu</a><a href="#ve-cua-toi">Vé của tôi</a><a href="#tai-khoan">Tài khoản</a></nav></header><main className="tv4-main">{children}</main><footer className="tv4-footer"><strong>NOVA CINEMA</strong><span>ĐIỆN ẢNH • TRẢI NGHIỆM • CẢM XÚC</span></footer></div>;
}

export default function OrderDetail({ order, showPayments = true }) {
  const [qr, setQr] = useState(''), [qrError, setQrError] = useState(''), [notice, setNotice] = useState('');
  const paid = order.status === 'paid' || order.status === 'simulated-success';
  const demo = order.source !== 'database';
  useEffect(() => {
    let active = true;
    if (paid) {
      try { QRCode.toDataURL(ticketQrPayload(order), { width: 256, margin: 4, color: { dark: '#00142aff', light: '#ffffffff' } })
        .then(url => { if (active) setQr(url); }).catch(() => { if (active) setQrError('Chưa tạo được QR. Hãy tải lại trang.'); }); }
      catch { setQrError('Mã vé không hợp lệ.'); }
    }
    return () => { active = false; };
  }, [order, paid]);
  const b = order.booking;
  async function copy() {
    try { await navigator.clipboard.writeText(order.orderCode); setNotice('Đã sao chép mã đơn.'); }
    catch { setNotice('Bạn có thể chọn và sao chép mã đơn bên dưới.'); }
  }
  return <section className="order-detail" aria-label="Chi tiết đơn và vé">
    <div className="order-ticket">
      <div className="order-top"><span><Ticket size={17} /> NOVA CINEMA • E-TICKET</span><OrderStatus status={order.status} /></div>
      <div className="order-movie">{b.poster && <img src={b.poster} alt={`Poster ${b.movieTitle}`} onError={e => { e.currentTarget.style.display = 'none'; }} />}<div><p className="tv4-eyebrow">{b.ageRating} · {b.format}</p><h2>{b.movieTitle}</h2><p>Khách đặt vé: <strong>{order.contact.name}</strong></p></div></div>
      <dl className="order-facts"><div><dt>Cụm rạp</dt><dd>{b.cinemaName}</dd></div><div><dt>Phòng chiếu</dt><dd>{b.roomName}</dd></div><div><dt>Suất chiếu</dt><dd>{dateTime(b.startsAt)}</dd></div><div><dt>Ghế đã chọn</dt><dd className="order-gold">{b.seats.join(', ')}</dd></div></dl>
      <h3>Bắp nước đi kèm</h3>{order.items.length ? order.items.map(i => <div className="order-line" key={i.productId}><span>{i.quantity} × {i.name}<small>{money(i.unitPrice)} / phần</small></span><strong>{money(i.subtotal)}</strong></div>) : <p className="tv4-muted">Không kèm bắp nước.</p>}
      <h3>Chi tiết thanh toán</h3>
      {order.seatLines?.map(s => <div className="order-line" key={s.label}><span>Vé ghế {s.label}</span><span>{money(s.unitPrice)}</span></div>)}
      <div className="order-line"><span>Tiền vé ({b.seats.length} ghế)</span><strong>{money(b.ticketSubtotal)}</strong></div>
      <div className="order-line"><span>Tiền bắp nước</span><strong>{money(order.productSubtotal)}</strong></div>
      <div className="order-total"><span>{paid ? 'TỔNG TIỀN ĐƠN' : 'SỐ TIỀN CHƯA THANH TOÁN'}</span><strong>{money(order.total)}</strong></div>
      <dl className="order-meta"><div><dt>Phương thức</dt><dd>{methodNames[order.method] || order.method} {demo ? '' : '(mô phỏng)'}</dd></div><div><dt>Ngày tạo đơn</dt><dd>{dateTime(order.createdAt || order.confirmedAt)}</dd></div><div><dt>Thanh toán thành công</dt><dd>{dateTime(order.paidAt || (demo && order.confirmedAt))}</dd></div><div><dt>Email người nhận</dt><dd>{order.contact.email}</dd></div></dl>
      {showPayments && order.payments?.length > 0 && <details className="order-attempts"><summary>Lịch sử thanh toán ({order.payments.length} lần)</summary>{order.payments.map(p => <div key={p.transaction_code}><strong>{p.status === 'succeeded' ? 'Thành công' : p.status === 'failed' ? 'Thất bại' : 'Đang chờ'} · {money(p.amount)}</strong><p>{methodNames[p.method] || p.method} · {dateTime(p.created_at)}</p><small>{p.transaction_code}</small></div>)}</details>}
    </div>
    <aside className="order-stub"><p className="tv4-eyebrow">THÔNG TIN ĐƠN ĐẶT VÉ</p><strong className="order-code">{order.orderCode}</strong><button className="tv4-text-button" onClick={copy}><Copy size={15} /> Sao chép mã đơn</button><p role="status">{notice}</p>
      {paid ? <>{qr ? <img className="order-qr" src={qr} alt="Mã QR vé điện tử" /> : <p role="status">{qrError || 'Đang tạo mã QR…'}</p>}<strong className="order-code">{order.ticketCode}</strong><p><CheckCircle2 size={16} /> {demo ? 'QR minh họa, không có giá trị vào rạp.' : 'Mã QR nhận diện vé đã lưu. Chức năng quét soát vé tại rạp chưa triển khai.'}</p></> : <div className="order-no-qr"><Ticket size={42} /><h3>Chưa phát hành vé</h3><p>Chỉ đơn thanh toán thành công mới có mã QR.</p>{['pending', 'payment_failed'].includes(order.status) && <p>Ghế được giữ đến {dateTime(b.expiresAt)}.</p>}</div>}
      <p className="tv4-muted">{demo ? 'Dữ liệu mẫu của phiên trình duyệt.' : 'Thanh toán mô phỏng trong đồ án, không thu tiền thật. Chưa gửi email/SMS.'}</p>
    </aside>
  </section>;
}
