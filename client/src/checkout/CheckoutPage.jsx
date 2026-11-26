import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clapperboard, Clock3, CreditCard, FlaskConical, Info, MapPin, Popcorn, ReceiptText, RefreshCw, Ticket, UserRound, Wallet, XCircle } from 'lucide-react';
import { BOOKING_KEY, CART_KEY, cleanCart, normalizeProducts, readSession, writeSession } from '../combo/cart.js';
import { DEMO_KEY, canSimulatePayment, checkoutTotals, createDemoBooking, remainingSeconds, resolveBooking } from './checkout.js';
import { CONFIRMATION_KEY, sameBooking, saveSimulation, validConfirmation } from '../confirmation/confirmation.js';
import '../combo/combo.css';
import './checkout.css';
import { bookingApi, holdContext } from './bookingApi.js';

const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const methods = [
  { id: 'momo', title: 'Ví điện tử MoMo', detail: 'Trải nghiệm thanh toán bằng ví điện tử', Icon: Wallet, badge: 'MoMo' },
  { id: 'vnpay', title: 'VNPay / Thẻ ATM nội địa', detail: 'Trải nghiệm thanh toán qua ngân hàng', Icon: CreditCard, badge: 'VNPAY' },
  { id: 'card', title: 'Thẻ quốc tế', detail: 'Visa, Mastercard, JCB', Icon: CreditCard, badge: 'CARD' },
];
function showtime(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return 'Chưa có thời gian suất chiếu';
  return new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}
function MovieArtwork({ booking }) {
  const [failed, setFailed] = useState(false);
  return booking.poster && !failed
    ? <img className="checkout-poster" src={booking.poster} alt={`Poster ${booking.movieTitle || 'phim'}`} onError={() => setFailed(true)} />
    : <div className="checkout-poster checkout-poster-fallback"><Clapperboard size={30} /></div>;
}

export default function CheckoutPage() {
  const [context, setContext] = useState(() => {
    const state = resolveBooking(readSession(BOOKING_KEY, null), readSession(DEMO_KEY, null));
    if (state.demo) writeSession(DEMO_KEY, state.booking);
    return state;
  });
  const { booking, demo } = context;
  const real = !demo;
  const holdId = booking?.holdId;
  const [holdReady, setHoldReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const paymentAttempt = useRef(null);
  const [completed, setCompleted] = useState(() => validConfirmation(readSession(CONFIRMATION_KEY, null)));
  const submitted = useRef(false);
  const [cart] = useState(() => cleanCart(readSession(CART_KEY, {})));
  const [catalog, setCatalog] = useState({ status: 'loading', products: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [method, setMethod] = useState('momo');
  const [scenario, setScenario] = useState('success');
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState('');
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const resultRef = useRef(null);
  useEffect(() => {
    if (!real || !holdId) return;
    const controller = new AbortController();
    Promise.all([bookingApi('/holds/' + holdId, null, controller.signal), fetch('/api/auth/me', { signal: controller.signal, cache: 'no-store' }).then(r => r.json())])
      .then(([hold, account]) => {
        if (controller.signal.aborted) return;
        if (!account.success) throw new Error('Vui lòng đăng nhập lại.');
        if (hold.status === 'converted') { window.location.assign('#ve-cua-toi'); return; }
        if (hold.status !== 'active') throw new Error('Phiên giữ ghế đã hết hạn hoặc bị hủy. Vui lòng chọn lại ghế.');
        const next = holdContext(hold);
        setContext({ booking: next, demo: false }); writeSession(BOOKING_KEY, next);
        setContact({ name: account.user.fullName, email: account.user.email, phone: account.user.phone || '' });
        setHoldReady(true);
      }).catch(err => { if (!controller.signal.aborted) setNotice(err.message); });
    return () => controller.abort();
  }, [real, holdId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let disposed = false;
    fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/products`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Chưa kiểm tra được giá bắp nước. Vui lòng thử lại.');
        const body = await response.json();
        if (!body.success) throw new Error('Không tải được sản phẩm.');
        const products = normalizeProducts(body.data);
        if (!disposed) setCatalog({ status: 'ready', products, error: '' });
      })
      .catch((error) => { if (!disposed) setCatalog({ status: 'error', products: [], error: error.name === 'AbortError' ? 'Kết nối quá lâu. Kiểm tra backend rồi thử lại.' : error.message }); })
      .finally(() => clearTimeout(timeout));
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);
  useEffect(() => {
    if (result?.status === 'success') window.location.assign('#xac-nhan-dat-ve');
    else if (result) resultRef.current?.focus();
  }, [result]);

  const ready = catalog.status === 'ready' || Object.keys(cart).length === 0;
  const totals = checkoutTotals(catalog.products, cart, booking?.ticketSubtotal || 0);
  const seconds = booking ? remainingSeconds(booking.expiresAt, now) : 0;
  const expired = seconds === 0;
  const alreadyCompleted = sameBooking(completed, booking);
  const allowed = canSimulatePayment({ booking, ready, missing: totals.missing, now }) && !alreadyCompleted && !busy && (!real || holdReady);
  const activeMethod = methods.find((item) => item.id === method);

  function restartDemo() {
    const next = createDemoBooking();
    if (!writeSession(DEMO_KEY, next)) { setNotice('Trình duyệt chưa cho phép lưu phiên thử. Hãy bật bộ nhớ trang web rồi thử lại.'); return; }
    setContext({ booking: next, demo: true }); setNow(Date.now()); setResult(null); setNotice(''); setCompleted(null); submitted.current = false;
  }
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitted.current || alreadyCompleted || busy || (real && !holdReady)) return;
    // Read the actual deadline on submit; the rendered timer may be one tick behind.
    // eslint-disable-next-line react-hooks/purity -- This event handler runs after user input, not during render.
    const currentTime = Date.now();
    if (!canSimulatePayment({ booking, ready, missing: totals.missing, now: currentTime })) { setNow(currentTime); setNotice('Chưa thể tiếp tục. Kiểm tra thời gian giữ ghế và giá sản phẩm.'); return; }
    if (result?.status === 'success') return;
    if (!contact.name.trim()) { setNotice('Vui lòng nhập họ tên người nhận vé.'); return; }
    setNotice('');
    if (real) {
      submitted.current = true; setBusy(true);
      try {
        const order = await bookingApi('/confirm', { holdId: booking.holdId, items: totals.items.map(i => ({ productId: Number(i.id), quantity: i.quantity })), expectedTotal: totals.total });
        if (order.status === 'paid') { window.location.assign('#xac-nhan-dat-ve/' + order.bookingCode); return; }
        const signature = JSON.stringify([order.bookingId, method, scenario, totals.total]);
        if (paymentAttempt.current?.signature !== signature) paymentAttempt.current = { signature, requestId: crypto.randomUUID() };
        const payment = await bookingApi('/' + order.bookingId + '/pay', { method, outcome: scenario, requestId: paymentAttempt.current.requestId, expectedTotal: totals.total });
        if (payment.status === 'paid') {
          sessionStorage.removeItem(BOOKING_KEY); sessionStorage.removeItem(CART_KEY);
          window.location.assign('#xac-nhan-dat-ve/' + payment.bookingCode);
        } else { paymentAttempt.current = null; setResult({ status: 'failure', method: activeMethod.title, total: totals.total }); }
      } catch (err) { setNotice(err.message); }
      finally { submitted.current = false; setBusy(false); }
      return;
    }
    if (scenario === 'success') {
      try {
        const confirmation = saveSimulation({ outcome: scenario, booking, demoBooking: demo,
          ready, missing: totals.missing, items: totals.items, contact, method: activeMethod.title }, sessionStorage, currentTime);
        submitted.current = true;
        setCompleted(confirmation);
        setResult({ status: 'success', method: confirmation.method, total: confirmation.total });
      } catch (error) { setNotice(error.message); }
      return;
    }
    setResult({ status: scenario, method: activeMethod.title, total: totals.total });
  }
  function retryCatalog() { setCatalog({ status: 'loading', products: [], error: '' }); setAttempt((value) => value + 1); setResult(null); }

  return <div className="combo-page checkout-page">
    <header className="combo-header"><div className="combo-shell combo-header-inner">
      <a href="#trang-chu" className="combo-brand"><span className="combo-brand-symbol"><Clapperboard size={25} /></span><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a>
      <nav aria-label="Điều hướng chính"><a href="#trang-chu">Trang chủ</a><a href="#phim">Phim</a><a href="#dat-ve">Lịch chiếu</a><a href="#chon-combo">Bắp nước & Combo</a></nav>
      <span className="checkout-mode"><FlaskConical size={15} /> Thanh toán mô phỏng</span>
    </div></header>
    <main className="combo-shell combo-main">
      <div className="combo-breadcrumb"><a href="#trang-chu">Trang chủ</a><ChevronRight size={13} /><a href="#chon-combo">Chọn combo</a><ChevronRight size={13} /><span>Thanh toán</span></div>
      <div className="combo-title-row"><div><p className="combo-eyebrow"><Ticket size={15} /> HOÀN TẤT TRẢI NGHIỆM ĐIỆN ẢNH</p><h1>Xác nhận & <span>Thanh toán vé</span></h1><p className="combo-subtitle">Kiểm tra thông tin và lựa chọn phương thức thanh toán.</p></div>
        <ol className="combo-steps" aria-label="Các bước đặt vé"><li>01 <span>Chọn ghế</span></li><li>02 <span>Chọn combo</span></li><li className="active" aria-current="step">03 <span>Thanh toán</span></li><li>04 <span>Nhận vé</span></li></ol>
      </div>
      <div className="checkout-demo-note"><FlaskConical size={20} /><div><strong>{demo ? 'Dữ liệu phim và ghế mẫu — thử giao diện TV4' : 'Thông tin đặt vé từ bước chọn ghế'}</strong><p>{demo ? 'Phim, suất chiếu và ghế dưới đây là dữ liệu mẫu; bắp nước lấy từ lựa chọn của bạn.' : 'Thời gian còn lại dựa trên hạn giữ ghế được bàn giao.'} {demo ? 'Thanh toán mẫu chỉ lưu trong trình duyệt.' : 'Thanh toán mô phỏng, không thu tiền. Đơn hàng và vé QR được lưu vào tài khoản của bạn.'}</p></div></div>
      {!booking ? <section className="combo-empty" role="alert"><Info size={30} /><h2>Thông tin giữ ghế chưa hợp lệ</h2><p>Vui lòng quay lại chọn suất và ghế trước khi tiếp tục.</p><a className="combo-secondary" href="#dat-ve">Quay lại chọn suất</a></section> : <form id="checkout-form" onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-content">
          <section className={`checkout-hold combo-panel ${expired ? 'is-expired' : ''}`} aria-label="Thời gian giữ ghế">
            <div className="checkout-hold-main"><Clock3 size={29} /><div><h2>{expired ? 'Đã hết thời gian giữ ghế' : demo ? 'Giữ ghế mẫu • 3 phút' : 'Thời gian giữ ghế còn lại'}</h2><p>{expired ? demo ? 'Tạo lại phiên mẫu để tiếp tục trải nghiệm.' : 'Vui lòng chọn lại suất và ghế.' : demo ? 'Bộ đếm minh họa cho luồng đặt vé, không khóa ghế thật.' : 'Hoàn tất trong thời gian còn lại. Đổi trang không gia hạn giữ ghế.'}</p></div><div className="checkout-timer"><small>THỜI GIAN CÒN LẠI</small><strong role="timer" aria-label="Thời gian giữ ghế còn lại">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong><small>Phút : Giây</small></div></div>
            <div className="checkout-hold-rule" />
            {expired && <div className="checkout-expiry-action" role="alert">{demo ? <button type="button" className="combo-secondary" onClick={restartDemo}><RefreshCw size={15} /> Tạo lại phiên mẫu 3 phút</button> : <a href="#dat-ve" className="combo-secondary">Chọn lại suất và ghế</a>}</div>}
          </section>
          <section className="checkout-card combo-panel"><div className="checkout-card-heading"><h2><Ticket size={18} /> Thông tin đặt vé</h2><span className="checkout-tag">{demo ? 'DỮ LIỆU MẪU' : 'CHỜ THANH TOÁN'}</span></div>
            <div className="checkout-film"><MovieArtwork booking={booking} /><div><p className="combo-eyebrow">TRẢI NGHIỆM TẠI NOVA</p><h3>{booking.movieTitle || 'Chưa có tên phim'}</h3><div className="checkout-film-tags">{booking.ageRating && <span>{booking.ageRating}</span>}{booking.format && <span>{booking.format}</span>}{booking.language && <small>{booking.language}</small>}</div></div></div>
            <div className="checkout-details"><div><MapPin size={17} /><span>Cụm rạp & phòng<strong>{booking.cinemaName || 'Chưa có thông tin rạp'}</strong><small>{booking.roomName || 'Chưa có thông tin phòng'}</small></span></div><div><CalendarDays size={17} /><span>Suất chiếu<strong>{showtime(booking.startsAt)}</strong><small>Giờ Việt Nam</small></span></div><div><Ticket size={17} /><span>Ghế đã chọn<strong className="checkout-seats">{booking.seats.map((seat) => <b key={seat}>{seat}</b>)}</strong><small>{booking.seatType || `${booking.seats.length} ghế`}</small></span></div></div>
            <div className="checkout-combos"><div className="checkout-card-heading"><h3><Popcorn size={17} /> Bắp nước đi kèm</h3><a href="#chon-combo">Chỉnh sửa <ChevronRight size={13} /></a></div>{totals.items.map((item) => <div key={item.id} className="checkout-line"><span>{item.quantity} × {item.name}<small>{money(item.price)} / phần</small></span><strong>{money(item.subtotal)}</strong></div>)}{Object.keys(cart).length === 0 && <p className="checkout-muted">Không kèm bắp nước.</p>}{!ready && <p className="checkout-muted" role="status">Đang kiểm tra giá các món đã chọn…</p>}</div>
          </section>
          <section className="checkout-card combo-panel"><div className="checkout-card-heading"><h2><Wallet size={18} /> Phương thức thanh toán</h2><span className="checkout-tag"><FlaskConical size={12} /> MÔ PHỎNG</span></div>
            <fieldset className="checkout-methods" disabled={busy || expired || alreadyCompleted}><legend className="checkout-sr-only">Chọn phương thức thanh toán</legend>{methods.map(({ id, title, detail, Icon, badge }) => <div className={`checkout-method ${method === id ? 'selected' : ''}`} key={id}><label><input type="radio" name="payment-method" value={id} checked={method === id} onChange={() => { setMethod(id); setResult(null); }} /><span className={`checkout-method-logo ${id}`}>{badge}</span><span><strong>{title}</strong><small>{detail}</small></span><Icon size={20} /></label>{method === id && <div className="checkout-method-info"><FlaskConical size={21} /><p>Chế độ thử nghiệm: chọn kết quả bên phải rồi bấm “Mô phỏng thanh toán”. Không cần quét QR, nhập thẻ hay chuyển tiền.</p></div>}</div>)}</fieldset>
          </section>
          <section className="checkout-card combo-panel"><div className="checkout-card-heading"><h2><UserRound size={18} /> Thông tin người nhận vé</h2></div><p className="checkout-muted">{real ? 'Vé được lưu vào tài khoản đang đăng nhập. Chưa gửi email hoặc SMS.' : 'Thông tin mẫu được lưu trong phiên trình duyệt; chưa gửi email hoặc SMS.'}</p>
            <fieldset className="checkout-contact" disabled={real || expired || alreadyCompleted}><legend className="checkout-sr-only">Thông tin người nhận</legend><label>Họ và tên <span>*</span><input name="name" autoComplete="name" required maxLength={100} placeholder="Nguyễn Văn An" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></label><label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="Không bắt buộc" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label><label className="checkout-email">Email nhận vé <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="ban@example.com" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label></fieldset>
          </section>
        </div>
        <aside className="checkout-sidebar"><section className="combo-summary combo-panel"><p className="combo-eyebrow">TÓM TẮT HÓA ĐƠN</p><h2>Chi phí đặt vé <ReceiptText size={22} /></h2><div className="checkout-invoice-movie"><Clapperboard size={28} /><div><strong>{booking.movieTitle || 'Phim đã chọn'}</strong><small>{showtime(booking.startsAt)}</small><small>{booking.cinemaName || 'Rạp đã chọn'}</small></div></div>
          <div className="checkout-line"><span>{booking.seats.length} vé {booking.seatType || ''}<small>Ghế {booking.seats.join(', ')}</small></span><strong>{money(booking.ticketSubtotal)}</strong></div>
          {totals.items.map((item) => <div className="checkout-line" key={item.id}><span>{item.quantity} × {item.name}</span><strong>{money(item.subtotal)}</strong></div>)}
          <div className="combo-totals"><div><span>Tiền vé</span><strong>{money(booking.ticketSubtotal)}</strong></div><div><span>Tiền bắp nước</span><strong>{ready ? money(totals.productSubtotal) : 'Đang kiểm tra…'}</strong></div></div>
          <div className="combo-total"><span>TỔNG THANH TOÁN<small>Tiền vé + tiền bắp nước</small></span><strong aria-live="polite">{ready ? money(totals.total) : '—'}</strong></div>
          {catalog.status === 'error' && Object.keys(cart).length > 0 && <div className="checkout-error" role="alert"><p>{catalog.error}</p><button type="button" className="combo-secondary" onClick={retryCatalog}><RefreshCw size={14} /> Thử lại</button></div>}
          {catalog.status === 'ready' && totals.missing.length > 0 && <p className="checkout-error" role="alert">Có món không còn được bán. <a href="#chon-combo">Quay lại cập nhật combo</a> trước khi thanh toán.</p>}
          {notice && <p className="checkout-error" role="alert">{notice}</p>}
          {alreadyCompleted && <p className="checkout-completed" role="status">Phiên này đã xác nhận mô phỏng. <a href="#xac-nhan-dat-ve">Xem lại xác nhận đã lưu <ArrowRight size={14} /></a></p>}
          <button className="combo-primary" type="submit" disabled={!allowed}><FlaskConical size={17} /> {busy ? 'Đang xử lý…' : alreadyCompleted ? 'Đã hoàn tất mô phỏng' : expired ? 'Đã hết thời gian' : 'Mô phỏng thanh toán'}{allowed && <ArrowRight size={17} />}</button><a href="#chon-combo" className="combo-back"><ArrowLeft size={14} /> Quay lại chọn combo</a><p className="combo-next-note checkout-payment-note">{real ? 'Không thu tiền • Lưu đơn và vé trong tài khoản' : 'Không thu tiền • Dữ liệu mẫu trong trình duyệt'}</p>
        </section>
        <section className="checkout-scenarios combo-panel"><h2><FlaskConical size={17} /> Thử kết quả thanh toán</h2><p>Chọn tình huống muốn kiểm tra:</p><fieldset disabled={busy || expired || alreadyCompleted}><legend className="checkout-sr-only">Kết quả mô phỏng</legend><label><input type="radio" name="scenario" checked={scenario === 'success'} onChange={() => { setScenario('success'); setResult(null); }} /><CheckCircle2 size={16} /> Thành công</label><label><input type="radio" name="scenario" checked={scenario === 'failure'} onChange={() => { setScenario('failure'); setResult(null); }} /><XCircle size={16} /> Thất bại</label></fieldset><small>Hết giờ sẽ tự chặn thanh toán. {demo && 'Có thể tạo lại phiên mẫu sau khi hết giờ.'}</small></section>
        {result && <section className={`checkout-result combo-panel ${result.status}`} ref={resultRef} tabIndex={-1} role="status">{result.status === 'success' ? <CheckCircle2 size={28} /> : <XCircle size={28} />}<h2>{result.status === 'success' ? 'Mô phỏng thành công' : 'Mô phỏng thất bại'}</h2><p>{result.status === 'success' ? `${result.method} • ${money(result.total)}. Đây là kết quả thử nghiệm; chưa có giao dịch, đơn hàng hay vé thật.` : 'Giao dịch thử chưa hoàn tất. Bạn có thể chọn lại phương thức và thử lại trong thời gian còn lại.'}</p>{result.status === 'success' && <button type="button" className="combo-secondary" onClick={() => setResult(null)}>Thử tình huống khác</button>}</section>}
        </aside>
      </form>}
    </main>
    <footer className="combo-footer"><div className="combo-shell"><div><a className="combo-brand" href="#trang-chu"><Clapperboard size={24} /><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a><p>Thưởng thức điện ảnh theo cách của bạn.</p></div><nav aria-label="Liên kết cuối trang"><a href="#phim">Khám phá phim</a><a href="#chon-combo">Bắp nước & Combo</a><a href="#lien-he">Liên hệ & hỗ trợ</a></nav><small>© {new Date().getFullYear()} NOVA CINEMA</small></div></footer>
  </div>;
}
