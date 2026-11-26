import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Ticket } from 'lucide-react';
import { bookingApi } from '../checkout/bookingApi.js';
import { readTicketHistory } from '../confirmation/confirmation.js';
import { filterTickets, ticketHref } from './tickets.js';
import OrderDetail, { CustomerFrame, OrderStatus } from './OrderDetail.jsx';
import { dateTime, money } from './orderFormat.js';

const tabs = [['all', 'Tất cả'], ['upcoming', 'Vé sắp xem'], ['past', 'Suất chiếu đã qua'], ['pending', 'Chờ thanh toán'], ['payment_failed', 'Thất bại'], ['expired', 'Hết hạn'], ['cancelled', 'Đã hủy']];
export default function TicketsPage({ targetOrderCode = '' }) {
  return <TicketHistory key={targetOrderCode.startsWith('DEMO-') ? 'demo-link' : 'account-link'} targetOrderCode={targetOrderCode} />;
}
function TicketHistory({ targetOrderCode }) {
  const [mode, setMode] = useState(targetOrderCode.startsWith('DEMO-') ? 'demo' : 'database');
  const [state, setState] = useState({ tickets: [], loading: true }), [retry, setRetry] = useState(0);
  const [tab, setTab] = useState('all'), [query, setQuery] = useState('');
  useEffect(() => {
    if (mode === 'demo') return;
    let controller;
    const load = () => {
      controller?.abort(); controller = new AbortController(); const current = controller;
      setState(old => ({ ...old, loading: true, error: '' }));
      bookingApi('?status=all', null, current.signal).then(tickets => { if (!current.signal.aborted) setState({ tickets }); })
        .catch(error => { if (!current.signal.aborted) setState({ tickets: [], error: error.message, auth: error.status === 401 }); });
    };
    load(); const timer = setInterval(load, 30000); window.addEventListener('focus', load);
    return () => { controller?.abort(); clearInterval(timer); window.removeEventListener('focus', load); };
  }, [mode, retry]);
  const demoHistory = mode === 'demo' ? readTicketHistory() : null;
  const tickets = mode === 'demo' ? demoHistory.tickets : state.tickets;
  const error = mode === 'demo' ? demoHistory.warning : state.error;
  const loading = mode === 'demo' ? false : state.loading;
  const visible = useMemo(() => filterTickets(tickets, { tab, query }), [tickets, tab, query]);
  const selected = targetOrderCode ? tickets.find(o => o.orderCode === targetOrderCode) : tickets[0];
  return <CustomerFrame><div className="tv4-heading"><div><p className="tv4-eyebrow">NOVA CINEMA • E-TICKET</p><h1>Vé của tôi & Lịch sử giao dịch</h1><p className="tv4-muted">Xem vé điện tử, bắp nước đã mua và trạng thái từng đơn đặt vé.</p></div><button className="tv4-secondary" disabled={loading} onClick={() => setRetry(n => n + 1)}><RefreshCw size={17} /> Làm mới</button></div>
    <div className="tv4-toolbar"><label>Nguồn dữ liệu <select value={mode} onChange={e => { setMode(e.target.value); setTab('all'); window.location.hash = '#ve-cua-toi'; }}><option value="database">Đơn trong tài khoản</option><option value="demo">Đơn mẫu của phiên</option></select></label><input aria-label="Tìm vé" value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm mã đơn, tên phim, rạp hoặc ghế…" /></div>
    {mode === 'demo' && <div className="tv4-banner">Đơn mẫu chỉ lưu trong phiên trình duyệt, không ghi vào tài khoản hoặc doanh thu admin.</div>}
    <div className="tv4-tabs" role="group" aria-label="Lọc trạng thái đơn">{tabs.map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} aria-pressed={tab === value} onClick={() => setTab(value)}>{label} ({filterTickets(tickets, { tab: value }).length})</button>)}</div>
    {loading && <p role="status">Đang cập nhật dữ liệu…</p>}
    {error && <div className="tv4-empty"><p role="alert">{error}</p>{state.auth ? <a className="tv4-button" href="#dang-nhap">Đăng nhập để xem vé</a> : <button className="tv4-secondary" onClick={() => setRetry(n => n + 1)}>Thử lại</button>}</div>}
    {!loading && !error && targetOrderCode && !selected && <div className="tv4-empty">Không tìm thấy đơn này trong tài khoản hoặc phiên đang chọn. <a href="#ve-cua-toi">Về danh sách vé</a></div>}
    {selected && <OrderDetail key={selected.orderCode} order={selected} />}
    <h2>Lịch sử đặt vé</h2><p className="tv4-muted">Đơn thất bại hoặc hết hạn vẫn được lưu để bạn tra cứu. Suất chiếu đã qua không đồng nghĩa vé đã được soát.</p>
    {visible.length > 0 ? <div className="tv4-table-wrap"><table className="tv4-table"><thead><tr><th>Mã đơn / Ngày tạo</th><th>Phim / Suất chiếu</th><th>Ghế</th><th>Tổng tiền</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead><tbody>{visible.map(o => <tr key={o.orderCode} className={selected?.orderCode === o.orderCode ? 'selected' : ''}><td>{o.orderCode}<small>{dateTime(o.createdAt || o.confirmedAt)}</small></td><td><strong>{o.booking.movieTitle}</strong><small>{o.booking.cinemaName} · {o.booking.roomName}</small><small>{dateTime(o.booking.startsAt)}</small></td><td>{o.booking.seats.join(', ')}</td><td>{money(o.total)}</td><td><OrderStatus status={o.status} /></td><td><a className="tv4-secondary" href={ticketHref(o)}>Xem đơn</a></td></tr>)}</tbody></table></div> : !loading && !error && <div className="tv4-empty"><Ticket size={36} /><p>Chưa có đơn phù hợp.</p><a href="#lich-chieu" className="tv4-button">Đặt vé ngay</a></div>}
  </CustomerFrame>;
}
