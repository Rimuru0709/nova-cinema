import { useEffect, useRef, useState } from 'react';
import { Armchair, BarChart3, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clapperboard, Download, FlaskConical, Info, LayoutDashboard, MapPin, Popcorn, RefreshCw, Search, ShieldCheck, Ticket, Wallet, X } from 'lucide-react';
import { CINEMAS, DEMO_TODAY, MOVIES, ORDERS, filterOrders, ordersToCsv, summarizeOrders } from './adminData.js';
import './admin.css';

const money = (value) => new Intl.NumberFormat('vi-VN').format(value);
const number = (value) => new Intl.NumberFormat('vi-VN').format(value);
const statuses = { paid: 'Thành công', holding: 'Đang giữ ghế', cancelled: 'Đã hủy' };
const date = (value) => value.split('-').reverse().join('/');
const clock = (value) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const palette = ['#f7c96d', '#aec9eb', '#8e784f', '#6f91aa'];
const modules = [
  { title: 'Tổng quan doanh thu', code: 'AD01', Icon: LayoutDashboard, active: true },
  { title: 'Kho phim & Suất chiếu', code: 'AD02', Icon: Clapperboard },
  { title: 'Phòng chiếu & Sơ đồ ghế', code: 'AD03', Icon: Armchair },
  { title: 'Quản lý lịch chiếu', code: 'AD04', Icon: CalendarDays },
  { title: 'Bắp nước & Combo', code: 'AD05', Icon: Popcorn },
  { title: 'Giao dịch & Vé bán', code: 'AD06', Icon: Ticket },
];

function CinemaSelect({ value, onChange, id }) {
  return <label className="adm-select adm-cinema-select" htmlFor={id}><MapPin size={17} /><span className="adm-sr-only">Chọn cụm rạp</span><select id={id} value={value} onChange={(event) => onChange(event.target.value)}><option value="all">Tất cả cụm rạp</option>{CINEMAS.map((cinema) => <option key={cinema.id} value={cinema.id}>{cinema.name}</option>)}</select><ChevronDown size={15} /></label>;
}
function OrderDialog({ order, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const dialog = ref.current; dialog.showModal(); return () => dialog.close(); }, []);
  const movie = MOVIES.find((item) => item.id === order.movieId);
  const cinema = CINEMAS.find((item) => item.id === order.cinemaId);
  return <dialog className="adm-dialog" ref={ref} aria-labelledby="adm-order-title" onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="adm-dialog-head"><div><p className="adm-eyebrow">CHI TIẾT GIAO DỊCH MẪU</p><h2 id="adm-order-title">{order.id}</h2></div><button type="button" className="adm-icon-button" onClick={onClose} aria-label="Đóng chi tiết đơn"><X size={21} /></button></div><span className={`adm-status ${order.status}`}>{statuses[order.status]}</span><h3>{movie?.title}</h3><dl><div><dt>Khách hàng</dt><dd>{order.customer}</dd></div><div><dt>Rạp / phòng</dt><dd>{cinema?.name} · {order.room}</dd></div><div><dt>Suất chiếu</dt><dd>{clock(order.showtime)} · {date(order.date)}</dd></div><div><dt>Ghế</dt><dd>{order.seats.join(', ')}</dd></div><div><dt>Bắp nước</dt><dd>{order.comboDescription || 'Không kèm combo'}</dd></div><div><dt>Phương thức</dt><dd>{order.method}</dd></div><div><dt>Tiền vé</dt><dd>{money(order.ticketTotal)} đ</dd></div><div><dt>Tiền bắp nước</dt><dd>{money(order.comboTotal)} đ</dd></div></dl><div className="adm-dialog-total"><span>Tổng tiền đơn</span><strong>{money(order.total)} đ</strong></div><p className="adm-muted">Dữ liệu minh họa. Chỉ đơn thành công được tính vào doanh thu.</p><button type="button" className="adm-gold-button" onClick={onClose}>Đóng chi tiết</button></dialog>;
}

export default function AdminPage({ user, onLogout, loggingOut }) {
  const [cinema, setCinema] = useState('all');
  const [period, setPeriod] = useState('today');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');
  const searchRef = useRef(null);
  const headingRef = useRef(null);
  useEffect(() => { window.scrollTo({ top: 0 }); headingRef.current?.focus(); }, []);

  const scope = filterOrders(ORDERS, { cinema, period });
  const summary = summarizeOrders(scope);
  const rows = filterOrders(ORDERS, { cinema, period, query, status });
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const cinemaName = CINEMAS.find((item) => item.id === cinema)?.name || 'Tất cả cụm rạp';
  const maxHour = Math.max(1, ...summary.hours.map((item) => item.revenue));
  let running = 0;
  const stops = summary.formats.map((item, index) => {
    const start = running; running += summary.tickets ? item.tickets / summary.tickets * 100 : 0;
    return `${palette[index % palette.length]} ${start}% ${running}%`;
  });

  function changeCinema(value) { setCinema(value); setPage(1); setNotice(''); }
  function exportOrders() {
    const blob = new Blob([ordersToCsv(rows)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `nova-don-hang-mau-${period}-${cinema}.csv`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Đã xuất ${rows.length} đơn theo bộ lọc ra CSV.`);
  }
  function focusOrders() { searchRef.current?.focus(); searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

  return <div className="nova-admin">
    <a href="#adm-content" className="adm-skip" onClick={(event) => { event.preventDefault(); headingRef.current?.focus(); }}>Bỏ qua menu</a>
    <aside className="adm-sidebar" aria-label="Menu quản trị"><a href="#admin" className="adm-brand"><img src="/nova-icon.png" alt="" /><span>NOVA CINEMA<small>ADMIN COMMAND</small></span></a><CinemaSelect id="adm-side-cinema" value={cinema} onChange={changeCinema} /><p className="adm-nav-label">KHÔNG GIAN QUẢN TRỊ</p><nav>{modules.map(({ title, code, Icon, active }) => active ? <a key={code} className="active" href="#admin" aria-current="page"><Icon size={20} /><span>{title}</span><small>{code}</small></a> : <button type="button" key={code} disabled title="Sẽ triển khai ở bước tiếp theo"><Icon size={20} /><span>{title}<em>Sắp triển khai</em></span><small>{code}</small></button>)}</nav><div className="adm-sidebar-bottom"><div className="adm-demo-card"><FlaskConical size={18} /><div><strong>Không gian xem thử</strong><span>Dữ liệu mẫu • Chưa kết nối quản trị</span></div></div><a className="adm-customer-link" href="#trang-chu"><HomeIcon /> Về cổng khách hàng</a></div></aside>
    <div className="adm-workspace"><header className="adm-topbar"><span>HỆ THỐNG ĐIỀU HÀNH RẠP CHIẾU</span><div><button className="adm-icon-button" onClick={focusOrders} aria-label="Tìm đơn đặt vé"><Search size={19} /></button><span className="adm-demo-pill"><FlaskConical size={14} /> BẢN XEM THỬ</span><div className="adm-profile"><span className="adm-profile-icon"><ShieldCheck size={21} /></span><span>{user.fullName}<small>Quản trị viên</small></span></div><button type="button" className="adm-soft-button" onClick={onLogout} disabled={loggingOut}>{loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}</button></div></header>
      <main className="adm-content" id="adm-content"><div className="adm-breadcrumb">NOVA Command <ChevronRight size={13} /> Bảng điều khiển <ChevronRight size={13} /><strong>AD01</strong></div>
        <section className="adm-page-heading"><div><p className="adm-eyebrow"><Clapperboard size={16} /> PHÒNG ĐIỀU HÀNH KHAI THÁC RẠP CHIẾU</p><h1 ref={headingRef} tabIndex={-1}>Bảng điều khiển trung tâm<br /><span>NOVA CINEMA</span></h1><p>Theo dõi doanh thu, vé bán và giao dịch tại các cụm rạp.</p></div><div className="adm-heading-controls"><CinemaSelect id="adm-top-cinema" value={cinema} onChange={changeCinema} /><label className="adm-select"><CalendarDays size={17} /><span className="adm-sr-only">Khoảng thời gian</span><select value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); setNotice(''); }}><option value="today">Ngày mẫu · {date(DEMO_TODAY)}</option><option value="yesterday">Ngày mẫu trước đó</option><option value="week">7 ngày tính đến {date(DEMO_TODAY)}</option></select><ChevronDown size={15} /></label><button type="button" className="adm-gold-button" onClick={() => setNotice(`Đã kiểm tra bộ mẫu cố định: ${scope.length} đơn trong phạm vi đang chọn.`)}><RefreshCw size={16} /> Làm mới dữ liệu</button></div></section>
        <div className="adm-info-strip"><span className="adm-info-icon"><Info size={23} /></span><div><strong>Bảng điều khiển đang sử dụng dữ liệu mẫu <span>DEMO</span></strong><p>Bộ lọc và biểu đồ hoạt động trên dữ liệu minh họa. Chưa có quét xung đột lịch chiếu hoặc đồng bộ thời gian thực.</p></div><button type="button" className="adm-soft-button" onClick={focusOrders}>Xem giao dịch mẫu</button></div>
        <div className="adm-announcement" role="status" aria-live="polite">{notice}</div>
        <section className="adm-stats" aria-label="Thống kê theo rạp và thời gian"><article className="adm-stat"><div><h2>DOANH THU PHÒNG VÉ</h2><span><Wallet size={21} /></span></div><strong className="gold">{money(summary.ticketRevenue)}</strong><small>VND</small><p>{summary.paidCount} đơn thanh toán thành công</p><div className="adm-stat-rule gold" /></article><article className="adm-stat"><div><h2>TỔNG VÉ ĐÃ BÁN</h2><span><Ticket size={21} /></span></div><strong>{number(summary.tickets)} <small>vé</small></strong><small>Trong phạm vi bộ lọc</small><p>Không gồm đơn đang giữ / đã hủy</p><div className="adm-stat-rule" /></article><article className="adm-stat"><div><h2>GHẾ ĐANG GIỮ</h2><span><Armchair size={21} /></span></div><strong>{number(summary.holdingSeats)} <small>ghế</small></strong><small>Trạng thái mẫu</small><p>Chưa tính vào doanh thu bán vé</p><div className="adm-stat-rule muted" /></article><article className="adm-stat"><div><h2>DOANH THU BẮP NƯỚC</h2><span><Popcorn size={21} /></span></div><strong className="gold">{money(summary.comboRevenue)}</strong><small>VND</small><p>{Math.round(summary.comboRate)}% đơn thành công có mua kèm</p><div className="adm-stat-rule gold" /></article></section>
        <section className="adm-charts" aria-label="Phân tích doanh thu"><article className="adm-panel adm-revenue"><div className="adm-panel-heading"><div><h2>Tỷ trọng doanh thu theo tác phẩm</h2><p>Tiền vé từ các đơn thành công</p></div><span className="adm-label">{cinemaName}</span></div><div className="adm-movie-bars">{summary.movieRevenue.filter((movie) => movie.revenue > 0).map((movie, index) => <div className="adm-movie-bar" key={movie.id}><div><span className="adm-rank" style={{ background: palette[index % palette.length] }}>{index + 1}</span><strong>{movie.title}</strong><span className="adm-format">{movie.format}</span><span>{money(movie.revenue)} đ</span><b>{summary.ticketRevenue ? Math.round(movie.revenue / summary.ticketRevenue * 100) : 0}%</b></div><div className="adm-bar-track"><span style={{ width: `${movie.revenue / Math.max(1, summary.ticketRevenue) * 100}%`, background: palette[index % palette.length] }} /></div></div>)}{summary.ticketRevenue === 0 && <p className="adm-empty">Chưa có doanh thu vé trong phạm vi này.</p>}</div><div className="adm-hourly"><div><h3>DOANH THU VÉ THEO GIỜ TẠO ĐƠN</h3><span>Khung 3 giờ · Giờ VN</span></div><div className="adm-hour-bars" role="img" aria-label={summary.hours.map((hour) => `${hour.label}: ${money(hour.revenue)} đồng`).join('; ')}>{summary.hours.map((hour) => <div key={hour.label} title={`${hour.label} · ${money(hour.revenue)} đ`}><span style={{ height: `${hour.revenue / maxHour * 100}%`, background: hour.revenue === maxHour ? '#f7c96d' : '#5c7488' }} /><small>{hour.label}</small></div>)}</div></div></article>
        <article className="adm-panel adm-formats"><div className="adm-panel-heading"><div><h2>Định dạng trải nghiệm</h2><p>Tỷ trọng số vé đã bán</p></div><BarChart3 size={20} /></div><div className="adm-donut" role="img" aria-label={`${summary.tickets} vé: ${summary.formats.map((item) => `${item.name} ${item.tickets} vé`).join(', ')}`} style={{ background: summary.tickets ? `conic-gradient(${stops.join(',')})` : '#203650' }}><div><strong>{number(summary.tickets)}</strong><span>VÉ ĐÃ BÁN</span></div></div><div className="adm-format-legend">{summary.formats.map((item, index) => <div key={item.name}><span style={{ background: palette[index % palette.length] }} /><strong>{item.name}</strong><small>{item.tickets} vé</small><b>{summary.tickets ? Math.round(item.tickets / summary.tickets * 100) : 0}%</b></div>)}</div><div className="adm-format-note"><Ticket size={23} /><p><strong>{summary.paidCount} đơn thành công</strong><span>Trong {summary.orderCount} giao dịch mẫu đang xem</span></p></div></article></section>
        <section className="adm-panel adm-orders" aria-labelledby="adm-orders-heading"><div className="adm-orders-header"><div><p className="adm-eyebrow"><Ticket size={16} /> GIAO DỊCH & VÉ BÁN</p><h2 id="adm-orders-heading">Quản lý đơn đặt vé gần nhất</h2><p>Tra cứu và xem chi tiết giao dịch mẫu của {cinemaName.toLowerCase()}.</p></div><div className="adm-order-controls"><label className="adm-search"><Search size={17} /><input ref={searchRef} type="search" aria-label="Tìm đơn theo mã, khách hàng, phim hoặc ghế" placeholder="Tìm mã vé, tên khách, phim, ghế…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><div><label className="adm-select"><span className="adm-sr-only">Trạng thái đơn hàng</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={15} /></label><button type="button" className="adm-soft-button" onClick={exportOrders} disabled={!rows.length}><Download size={15} /> Xuất CSV</button></div></div></div>
          <div className="adm-table-wrap" tabIndex={0} role="region" aria-label="Bảng đơn đặt vé, cuộn ngang trên màn hình nhỏ"><table><caption className="adm-sr-only">Đơn đặt vé mẫu. Các thống kê phía trên chỉ tính bộ lọc rạp và thời gian.</caption><thead><tr><th>MÃ ĐẶT VÉ</th><th>KHÁCH HÀNG</th><th>TÁC PHẨM</th><th>SUẤT CHIẾU / PHÒNG</th><th>GHẾ ĐÃ ĐẶT</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th></tr></thead><tbody>{visible.map((order) => { const movie = MOVIES.find((item) => item.id === order.movieId); return <tr key={order.id}><td><button className="adm-order-id" onClick={() => setSelected(order)} aria-label={`Xem chi tiết đơn ${order.id}`}>{order.id}</button><small>{clock(order.createdAt)} · {date(order.date)}</small></td><td><strong>{order.customer}</strong><small>{order.phone}</small></td><td><strong>{movie?.title}</strong><span className="adm-format">{movie?.format}</span></td><td><strong>{clock(order.showtime)} · {date(order.date)}</strong><small>{order.room}</small><small>{CINEMAS.find((item) => item.id === order.cinemaId)?.name}</small></td><td><div className="adm-seats">{order.seats.map((seat) => <span key={seat}>{seat}</span>)}</div></td><td className="adm-price">{money(order.total)}<small>đ</small></td><td><span className={`adm-status ${order.status}`}>{statuses[order.status]}</span></td></tr>; })}</tbody></table>{rows.length === 0 && <div className="adm-empty"><Search size={28} /><h3>Không tìm thấy đơn phù hợp</h3><p>Thử tên phim khác hoặc điều chỉnh bộ lọc.</p><button type="button" className="adm-soft-button" onClick={() => { setQuery(''); setStatus('all'); setPage(1); }}>Xóa lọc bảng</button></div>}</div>
          <div className="adm-table-footer"><span aria-live="polite">{rows.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, rows.length)}` : '0'} / {rows.length} đơn</span><label>Hiển thị <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={5}>5 dòng</option><option value={10}>10 dòng</option><option value={20}>20 dòng</option></select></label><nav aria-label="Phân trang đơn hàng"><button type="button" disabled={currentPage === 1} aria-label="Trang trước" onClick={() => setPage(currentPage - 1)}><ChevronLeft size={17} /></button>{Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => <button key={value} type="button" className={value === currentPage ? 'active' : ''} aria-current={value === currentPage ? 'page' : undefined} aria-label={`Trang ${value}`} onClick={() => setPage(value)}>{value}</button>)}<button type="button" disabled={currentPage === pageCount} aria-label="Trang sau" onClick={() => setPage(currentPage + 1)}><ChevronRight size={17} /></button></nav></div><p className="adm-table-note">Tìm kiếm và trạng thái chỉ lọc bảng đơn. Tổng tiền đơn gồm vé + bắp nước.</p>
        </section><footer className="adm-footer"><span>NOVA CINEMA • ADMIN COMMAND</span><span>AD01 · Giao diện quản trị mẫu</span></footer>
      </main></div>{selected && <OrderDialog order={selected} onClose={() => setSelected(null)} />}
  </div>;
}

function HomeIcon() { return <Clapperboard size={17} />; }
