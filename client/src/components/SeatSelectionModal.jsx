import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Armchair, Lock } from 'lucide-react';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';
import { BOOKING_KEY, readSession, writeSession } from '../combo/cart.js';
import { bookingApi, holdContext } from '../checkout/bookingApi.js';
import './SeatSelectionModal.css';
const money = value => Number(value).toLocaleString('vi-VN') + ' đ';
export default function SeatSelectionModal({ showtimeId, onClose, onNavigate }) {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [resume, setResume] = useState(null);
  useEffect(() => {
    const previous = readSession(BOOKING_KEY, null);
    if (!previous?.holdId || previous.source !== 'database') return;
    let active = true;
    bookingApi('/holds/' + previous.holdId).then(hold => {
      if (active && hold.status === 'active') setResume(hold);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/showtimes/' + encodeURIComponent(showtimeId) + '/seats', { signal: controller.signal, cache: 'no-store' });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(body.message || 'Không tải được sơ đồ ghế.');
        if (!active) return;
        setData(body.data);
        setSelected(ids => ids.filter(id => body.data.seats.some(s => Number(s.seatId) === id && s.state === 'available')));
      } catch (err) { if (active && err.name !== 'AbortError') setError(err.message); }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => { active = false; controller.abort(); clearInterval(timer); };
  }, [showtimeId, reload]);
  const seats = data?.seats || [];
  const show = data?.showtime;
  const chosen = seats.filter(s => selected.includes(Number(s.seatId)));
  const rows = [...new Set(seats.map(s => s.rowLabel))];
  async function continueBooking() {
    if (busy || !chosen.length) return;
    setBusy(true); setError(''); setAuthRequired(false);
    try {
      const hold = await bookingApi('/hold-seats', { showtimeId: Number(showtimeId), seatIds: selected });
      if (!writeSession(BOOKING_KEY, holdContext(hold, show))) {
        await bookingApi('/release-hold', { holdId: hold.holdId });
        throw new Error('Trình duyệt không lưu được phiên đặt vé. Vui lòng cho phép bộ nhớ trang web.');
      }
      window.location.hash = '#chon-combo';
    } catch (err) { setError(err.message); setAuthRequired(err.status === 401); setReload(v => v + 1); }
    finally { setBusy(false); }
  }
  async function releasePrevious() {
    setBusy(true);
    try { await bookingApi('/release-hold', { holdId: resume.holdId }); sessionStorage.removeItem(BOOKING_KEY); setResume(null); setReload(v => v + 1); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="seat-page-container"><SiteHeader activeNav="showtimes" onNavigate={onNavigate} />
    <main className="seat-view-wrapper"><div className="seat-view-container">
      <div className="seat-subbar"><button className="seat-back-btn" onClick={onClose}><ArrowLeft size={18} /> Chọn suất chiếu khác</button><span>{show?.cinemaName} • {show?.roomName}</span></div>
      <div className="seat-timer-box-hero"><Clock size={20} /> Ghế được giữ trong 3 phút kể từ khi bấm “Tiếp tục chọn combo”.</div>
      {error && <p role="alert">{error} {authRequired && <a href="#dang-nhap">Đăng nhập để giữ ghế</a>} <button onClick={() => { setError(''); setReload(v => v + 1); }}>Tải lại</button></p>}
      {resume && <div className="seat-timer-box-hero">Bạn đang có phiên giữ ghế. <a href="#chon-combo">Tiếp tục phiên cũ</a><button disabled={busy} onClick={releasePrevious}>Hủy giữ ghế cũ để chọn lại</button></div>}
      {!data && !error && <p role="status">Đang tải sơ đồ ghế…</p>}
      {data && <div className="seat-main-grid"><section className="seat-hall-card">
        <div className="seat-screen-hero"><div className="seat-screen-arc" /><h2 className="seat-screen-title">Màn hình • {show.format}</h2><p className="seat-screen-sub">{show.roomName}</p></div>
        <div className="seat-legend-strip">{[['std','Ghế thường'],['vip','VIP'],['sweet','Ghế đôi'],['selected','Đang chọn'],['held','Đang giữ'],['sold','Đã đặt']].map(([type,label]) => <span className="seat-legend-entry" key={type}><i className={'seat-legend-icon ' + type} />{label}</span>)}</div>
        {!show.isValid && <p role="alert">{show.validityMessage}</p>}
        <div className="seat-matrix-wrapper">{rows.map(row => <div className="seat-matrix-row" key={row}><b className="seat-row-label-side">{row}</b><div className="seat-row-seats-group">{seats.filter(s => s.rowLabel === row).map(seat => <button key={seat.seatId} type="button" className={['seat-cell', seat.seatType === 'vip' ? 'vip' : seat.seatType === 'couple' ? 'sweet' : 'std', seat.state === 'booked' ? 'sold' : seat.state, selected.includes(Number(seat.seatId)) ? 'selected' : ''].join(' ')} title={seat.label + ' • ' + money(seat.price)} aria-label={seat.label + ' • ' + money(seat.price) + ' • ' + seat.state} aria-pressed={selected.includes(Number(seat.seatId))} disabled={busy || !show.isValid || seat.state !== 'available' || Boolean(resume)} onClick={() => { setError(''); setSelected(ids => ids.includes(Number(seat.seatId)) ? ids.filter(id => id !== Number(seat.seatId)) : ids.length < 8 ? [...ids, Number(seat.seatId)] : ids); }}>{seat.state === 'booked' ? '×' : seat.state === 'held' ? '⌛' : seat.seatNumber}</button>)}</div><b className="seat-row-label-side">{row}</b></div>)}</div>
        <p>Chọn tối đa 8 ghế. Giá từng ghế hiển thị khi đưa chuột lên ghế.</p>
      </section><aside className="seat-summary-card"><div className="seat-summary-movie-row">{show.moviePoster && <img className="seat-summary-poster" src={show.moviePoster} alt={show.movieTitle} />}<div className="seat-summary-movie-info"><span className="seat-summary-badge-age">{show.ageRating}</span><h2>{show.movieTitle}</h2><p>{show.format} • {show.duration} phút</p><p>{new Date(show.startsAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p></div></div>
        <p>{show.cinemaName} • {show.roomName}</p><h3>Ghế đã chọn ({chosen.length})</h3><div className="seat-selected-cards-row">{chosen.map(s => <div className="seat-selected-badge-card" key={s.seatId}><Armchair size={17} /><strong>{s.label}</strong><span>{money(s.price)}</span></div>)}</div>
        <div className="seat-grand-total-row"><span>TIỀN VÉ</span><strong className="seat-grand-amount">{money(chosen.reduce((sum,s) => sum + Number(s.price), 0))}</strong></div>
        <p>Bạn có thể chọn bắp nước ở bước tiếp theo.</p><button className="seat-checkout-btn-main" disabled={busy || !chosen.length || !show.isValid || Boolean(resume)} onClick={continueBooking}>{busy ? 'Đang giữ ghế…' : 'Tiếp tục chọn combo'}<ArrowRight size={18} /></button><p className="seat-security-trust"><Lock size={14} /> Giữ ghế theo tài khoản đã đăng nhập</p>
      </aside></div>}
    </div></main><SiteFooter onNavigate={onNavigate} /></div>;
}
