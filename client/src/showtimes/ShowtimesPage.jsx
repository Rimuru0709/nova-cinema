import { useState, useEffect } from 'react';
import { MapPin, CalendarDays, Clock } from 'lucide-react';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import './showtimesPage.css';
const dayKey = date => new Date(date.getTime() + 7 * 3600000).toISOString().slice(0,10);
export default function ShowtimesPage({ onNavigate, onSelectShowtime }) {
  const [dates] = useState(() => Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() + i * 86400000))));
  const [date, setDate] = useState(dates[0]);
  const [cinema, setCinema] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [format, setFormat] = useState('');
  const [query, setQuery] = useState('');
  const [time, setTime] = useState('');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([fetch('/api/cinemas', { signal: controller.signal }), fetch('/api/showtimes?' + new URLSearchParams({ date, ...(cinema && { cinemaId: cinema }), ...(time && { time }) }), { signal: controller.signal, cache: 'no-store' })])
      .then(async responses => { const bodies = await Promise.all(responses.map(r => r.json())); if (responses.some(r => !r.ok) || bodies.some(b => !b.success)) throw new Error('Chưa tải được lịch chiếu. Kiểm tra máy chủ rồi thử lại.'); if (!controller.signal.aborted) { setCinemas(bodies[0].data); setShows(bodies[1].data); } })
      .catch(err => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [date, cinema, time, attempt]);
  const filtered = shows.filter(s => (!format || s.format === format) && s.movieTitle.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN')));
  const movies = [...new Set(filtered.map(s => s.movieId))].map(id => ({ ...filtered.find(s => s.movieId === id), slots: filtered.filter(s => s.movieId === id) }));
  return <div className="showtimes-page"><SiteHeader activeNav="showtimes" onNavigate={onNavigate} /><main className="showtimes-container">
    <div className="showtimes-breadcrumb"><a href="#trang-chu">Trang chủ</a> › <span className="current">Lịch chiếu</span></div>
    <div className="showtimes-hero"><div className="showtimes-hero-left"><span className="showtimes-hero-badge">NOVA CINEMA</span><h1 className="showtimes-hero-title">Lịch chiếu phim</h1><p className="showtimes-hero-subtitle">Chọn phim, cụm rạp và suất chiếu phù hợp với bạn.</p></div><div className="showtimes-cinema-pill"><MapPin size={22} />{cinemas.find(c => String(c.id) === cinema)?.name || 'Tất cả cụm rạp'}</div></div>
    <section className="showtimes-filter-card"><div className="showtimes-filter-grid">
      <label className="showtimes-filter-item"><span className="showtimes-filter-label">CỤM RẠP</span><select className="showtimes-select" value={cinema} onChange={e => setCinema(e.target.value)}><option value="">Tất cả cụm rạp</option>{cinemas.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      <label className="showtimes-filter-item"><span className="showtimes-filter-label">ĐỊNH DẠNG</span><select className="showtimes-select" value={format} onChange={e => setFormat(e.target.value)}><option value="">Tất cả định dạng</option>{['2D','3D','IMAX'].map(f => <option key={f}>{f}</option>)}</select></label>
      <label className="showtimes-filter-item"><span className="showtimes-filter-label">KHUNG GIỜ</span><select className="showtimes-select" value={time} onChange={e => setTime(e.target.value)}><option value="">Tất cả khung giờ</option><option value="morning">Buổi sáng</option><option value="afternoon">Buổi chiều</option><option value="evening">Buổi tối</option></select></label>
      <label className="showtimes-filter-item"><span className="showtimes-filter-label">TÊN PHIM</span><input className="showtimes-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm tên phim…" /></label>
    </div></section>
    <section className="showtimes-date-card"><div className="showtimes-date-header"><CalendarDays size={20} /> Chọn ngày chiếu</div><div className="showtimes-dates-strip">{dates.map((d,i) => <button key={d} className={'showtimes-date-item ' + (date === d ? 'active' : '')} onClick={() => setDate(d)}><span className="showtimes-date-num">{d.slice(8)}/{d.slice(5,7)}</span><span className="showtimes-date-weekday">{i === 0 ? 'Hôm nay' : new Date(d + 'T12:00:00+07:00').toLocaleDateString('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' })}</span></button>)}</div></section>
    <p className="showtimes-time-note"><Clock size={16} /> Giờ Việt Nam • Số ghế trống được kiểm tra lại khi chọn ghế.</p>
    {loading && <p role="status">Đang tải lịch chiếu…</p>}{error && <p role="alert">{error} <button onClick={() => setAttempt(v => v + 1)}>Thử lại</button></p>}
    {!loading && !error && !movies.length && <p>Chưa có suất chiếu phù hợp. Bạn hãy chọn ngày hoặc rạp khác.</p>}
    {movies.map(movie => <article className="showtimes-movie-card" key={movie.movieId}><div className="showtimes-movie-left"><div className="showtimes-movie-poster-box"><img className="showtimes-movie-poster" src={movie.moviePoster} alt={movie.movieTitle} /><span className="showtimes-movie-age-badge">{movie.ageRating}</span></div><a className="showtimes-movie-btn" href={'#chi-tiet/' + movie.movieId}>Chi tiết phim</a></div><div className="showtimes-movie-right"><div className="showtimes-movie-title-row"><h2>{movie.movieTitle}</h2><p>{movie.duration} phút</p></div><div className="showtimes-halls-group">{[...new Set(movie.slots.map(s => s.roomId))].map(room => { const slots = movie.slots.filter(s => s.roomId === room); return <section className="showtimes-hall-item" key={room}><div className="showtimes-hall-header"><strong className="showtimes-hall-name">{slots[0].cinemaName} • {slots[0].roomName}</strong></div><div className="showtimes-slots-grid">{slots.map(slot => <button className="showtimes-slot-card" key={slot.id} disabled={slot.availableSeats === 0} onClick={() => onSelectShowtime(slot)}><span className="showtimes-slot-time">{slot.time}</span><span className="showtimes-slot-type">{slot.format}</span><span className="showtimes-slot-seats">Còn {slot.availableSeats}/{slot.totalSeats} ghế</span><span className="showtimes-slot-price">Từ {slot.price.toLocaleString('vi-VN')} đ</span></button>)}</div></section>; })}</div></div></article>)}
  </main><SiteFooter onNavigate={onNavigate} /></div>;
}
