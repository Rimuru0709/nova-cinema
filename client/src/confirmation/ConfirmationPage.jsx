import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clapperboard, Copy, FlaskConical, Home, Info, MapPin, Popcorn, ReceiptText, RefreshCw, Ticket, UserRound, Wallet } from 'lucide-react';
import { readSession } from '../combo/cart.js';
import { DEMO_KEY } from '../checkout/checkout.js';
import { CONFIRMATION_KEY, validConfirmation } from './confirmation.js';
import '../combo/combo.css';
import './confirmation.css';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const dateTime = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value))
  ? new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
  : 'Chưa có thông tin';

export default function ConfirmationPage() {
  const [receipt] = useState(() => validConfirmation(readSession(CONFIRMATION_KEY, null)));
  const [notice, setNotice] = useState('');
  const [posterFailed, setPosterFailed] = useState(false);
  const heading = useRef(null);
  useEffect(() => { window.scrollTo({ top: 0 }); heading.current?.focus(); }, []);

  async function copyCode() {
    try { await navigator.clipboard.writeText(receipt.orderCode); setNotice('Đã sao chép mã đơn mẫu.'); }
    catch { setNotice('Chưa sao chép được. Bạn có thể chọn mã đơn và sao chép thủ công.'); }
  }
  function newDemo() {
    try { sessionStorage.removeItem(DEMO_KEY); window.location.hash = '#thanh-toan'; }
    catch { setNotice('Chưa tạo lại được phiên mẫu. Kiểm tra quyền lưu dữ liệu của trình duyệt.'); }
  }
  const booking = receipt?.booking;

  return <div className="combo-page confirmation-page">
    <header className="combo-header"><div className="combo-shell combo-header-inner"><a className="combo-brand" href="#trang-chu"><span className="combo-brand-symbol"><Clapperboard size={25} /></span><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a><nav aria-label="Điều hướng chính"><a href="#trang-chu">Trang chủ</a><a href="#phim">Phim</a><a href="#chon-combo">Bắp nước & Combo</a></nav><span className="confirmation-demo-badge"><FlaskConical size={15} /> Bản mô phỏng</span></div></header>
    <main className="combo-shell combo-main">
      <div className="combo-breadcrumb"><a href="#trang-chu">Trang chủ</a><ChevronRight size={13} /><span>Đặt vé</span><ChevronRight size={13} /><span>Xác nhận</span></div>
      {!receipt ? <section className="confirmation-empty combo-panel"><Info size={38} /><h1 ref={heading} tabIndex={-1}>Chưa có xác nhận đặt vé</h1><p>Bạn cần hoàn tất thanh toán mô phỏng thành công trước. Nếu dữ liệu phiên đã bị xóa hoặc không hợp lệ, hãy thử lại luồng đặt vé.</p><a className="combo-primary" href="#chon-combo">Bắt đầu từ chọn combo <ArrowRight size={17} /></a></section> : <>
        <div className="confirmation-success" role="status"><CheckCircle2 size={28} /><div><strong>Thanh toán mô phỏng thành công</strong><p>Đã lưu xác nhận mẫu trong phiên này. Không thu tiền, không đặt ghế thật và không dùng mã mẫu để vào rạp.</p></div><span className="confirmation-demo-badge">DEMO</span></div>
        <div className="combo-title-row"><div><p className="combo-eyebrow">NOVA CINEMA • BOOKING CONFIRMATION</p><h1 ref={heading} tabIndex={-1}>Xác nhận <span>đặt vé</span></h1><p className="combo-subtitle">Mọi lựa chọn cho buổi xem phim của bạn, trong một nơi.</p></div><ol className="combo-steps" aria-label="Các bước đặt vé"><li>01 <span>Chọn ghế</span></li><li>02 <span>Chọn combo</span></li><li>03 <span>Thanh toán</span></li><li className="active" aria-current="step">04 <span>Xác nhận</span></li></ol></div>
        <div className="confirmation-layout"><section className="confirmation-ticket" aria-label="Thông tin vé mẫu">
          <div className="confirmation-ticket-top"><span><Ticket size={17} /> NOVA CINEMA • VÉ MẪU</span><span className="confirmation-confirmed"><CheckCircle2 size={13} /> Đã xác nhận mô phỏng</span></div>
          <div className="confirmation-movie">{booking.poster && !posterFailed ? <img src={booking.poster} onError={() => setPosterFailed(true)} alt={`Poster ${booking.movieTitle || 'phim'}`} /> : <div className="confirmation-poster"><Clapperboard size={40} /></div>}<div><div className="confirmation-tags">{booking.ageRating && <span>{booking.ageRating}</span>}{booking.format && <span>{booking.format}</span>}{booking.language && <span>{booking.language}</span>}</div><h2>{booking.movieTitle || 'Phim đã chọn'}</h2><p>Trải nghiệm điện ảnh tại NOVA Cinema</p><div className="confirmation-guest"><UserRound size={18} /><span>Khách hàng<strong>{receipt.contact.name}</strong></span></div></div></div>
          <div className="confirmation-details"><div><MapPin size={19} /><span>Cụm rạp<strong>{booking.cinemaName || 'Chưa có thông tin'}</strong></span></div><div><Clapperboard size={19} /><span>Phòng chiếu<strong>{booking.roomName || 'Chưa có thông tin'}</strong></span></div><div><CalendarDays size={19} /><span>Thời gian chiếu<strong>{dateTime(booking.startsAt)}</strong><small>Giờ Việt Nam</small></span></div><div><Ticket size={19} /><span>Ghế đã chọn<strong className="confirmation-seats">{booking.seats.map((seat, index) => <b key={`${seat}-${index}`}>{seat}</b>)}</strong><small>{booking.seatType || `${booking.seats.length} ghế`}</small></span></div></div>
          <div className="confirmation-food"><h3><Popcorn size={20} /> Bắp nước đi kèm</h3>{receipt.items.length ? receipt.items.map((item) => <div className="confirmation-line" key={item.productId}><span>{item.quantity} × {item.name}<small>{money(item.unitPrice)} / phần</small></span><strong>{money(item.subtotal)}</strong></div>) : <p>Không kèm bắp nước.</p>}</div>
          <div className="confirmation-contact"><h3><UserRound size={18} /> Thông tin người nhận</h3><span>Email<strong>{receipt.contact.email}</strong></span>{receipt.contact.phone && <span>Điện thoại<strong>{receipt.contact.phone}</strong></span>}<p>Chưa gửi email hoặc SMS. Đây là thông tin bạn nhập để thử giao diện.</p></div>
          <div className="confirmation-ticket-code"><Ticket size={22} /><div><small>MÃ VÉ MẪU</small><strong>{receipt.ticketCode}</strong><p>Không có giá trị vào rạp • Chưa phát hành vé thật</p></div></div>
        </section>
        <aside className="confirmation-summary combo-panel"><p className="combo-eyebrow">CHI TIẾT XÁC NHẬN</p><h2>Đơn đặt vé mẫu <ReceiptText size={22} /></h2><div className="confirmation-order-code"><span>Mã đơn mẫu</span><strong>{receipt.orderCode}</strong><button type="button" onClick={copyCode}><Copy size={14} /> Sao chép mã đơn</button></div><dl className="confirmation-payment"><div><dt>Trạng thái</dt><dd className="confirmation-status">Thành công (mô phỏng)</dd></div><div><dt><Wallet size={14} /> Phương thức</dt><dd>{receipt.method}</dd></div><div><dt>Thời gian xác nhận</dt><dd>{dateTime(receipt.confirmedAt)}</dd></div></dl><div className="combo-totals"><div><span>Tiền vé ({booking.seats.length} ghế)</span><strong>{money(booking.ticketSubtotal)}</strong></div><div><span>Tiền bắp nước</span><strong>{money(receipt.productSubtotal)}</strong></div></div><div className="combo-total"><span>TỔNG TIỀN MẪU<small>Vé + bắp nước</small></span><strong>{money(receipt.total)}</strong></div>
          <a href={`#chi-tiet-ve/${encodeURIComponent(receipt.orderCode)}`} className="combo-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', textDecoration: 'none' }}><Ticket size={16} /> Xem vé & mã QR check-in</a>
          <a href="#trang-chu" className="confirmation-home"><Home size={15} /> Về trang chủ</a>{receipt.demoBooking && <button type="button" className="confirmation-retry" onClick={newDemo}><RefreshCw size={14} /> Thử đơn mẫu mới</button>}<p className="confirmation-notice" role="status">{notice}</p>
        </aside></div>
        <div className="confirmation-footnote"><Info size={20} /><p>Xác nhận này chỉ được lưu trong phiên trình duyệt hiện tại. Tải lại trang vẫn xem được; đóng phiên có thể mất dữ liệu. Tính năng Vé của tôi và lưu đơn MySQL sẽ được nối ở bước tiếp theo.</p></div>
      </>}
    </main><footer className="combo-footer"><div className="combo-shell"><a href="#trang-chu" className="combo-brand"><Clapperboard size={24} /><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a><small>ĐIỆN ẢNH • TRẢI NGHIỆM • CẢM XÚC</small></div></footer>
  </div>;
}
