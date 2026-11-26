import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Clapperboard, Armchair, CalendarDays, Popcorn, Ticket, RefreshCw, Plus, X, ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import OrderDetail, { OrderStatus } from '../tickets/OrderDetail.jsx';
import { dateTime, money, statusNames } from '../tickets/orderFormat.js';
import { adminApi, useAdminData, queryString } from './adminApi.js';
import './admin.css';
import './admin-live.css';

const modules = [
  ['ad01', 'Tổng quan doanh thu', LayoutDashboard, true], ['ad02', 'Kho phim & Suất chiếu', Clapperboard, false],
  ['ad03', 'Phòng chiếu & Sơ đồ ghế', Armchair, false], ['ad04', 'Quản lý lịch chiếu', CalendarDays, false],
  ['ad05', 'Bắp nước & Combo', Popcorn, true], ['ad06', 'Giao dịch & Vé bán', Ticket, true],
];
const dateInVietnam = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const currentModule = () => ['ad01', 'ad05', 'ad06'].includes(window.location.hash.split('/')[1]) ? window.location.hash.split('/')[1] : 'ad01';

function RequestState({ state }) {
  if (state.error) return <div className="tv4-error" role="alert">{state.error} {state.auth && <a href="#dang-nhap">Đăng nhập lại</a>}</div>;
  if (state.loading && !state.data) return <p role="status">Đang tải dữ liệu…</p>;
  return null;
}
function Modal({ title, onClose, children, wide = false, locked = false }) {
  const ref = useRef(null);
  useEffect(() => { const node = ref.current; node.showModal(); return () => node.close(); }, []);
  return <dialog className={'adm-dialog live-dialog' + (wide ? ' wide' : '')} ref={ref} onCancel={e => { e.preventDefault(); if (!locked) onClose(); }} aria-labelledby="live-dialog-title"><div className="adm-dialog-head"><h2 id="live-dialog-title">{title}</h2><button className="tv4-secondary" disabled={locked} onClick={onClose} aria-label="Đóng"><X size={20} /></button></div>{children}</dialog>;
}
function OrderModal({ code, onClose }) {
  const state = useAdminData('/orders/' + encodeURIComponent(code));
  return <Modal title="Chi tiết giao dịch & Vé điện tử" onClose={onClose} wide><RequestState state={state} />{state.data && <OrderDetail order={state.data} />}</Modal>;
}
function OrderTable({ orders, onSelect }) {
  return <div className="tv4-table-wrap"><table className="tv4-table"><thead><tr><th>Mã đơn / Ngày tạo</th><th>Khách hàng</th><th>Phim & Suất chiếu</th><th>Ghế & Combo</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{orders.map(o => <tr key={o.orderCode}><td><button className="tv4-text-button live-order-code" onClick={() => onSelect(o.orderCode)}>{o.orderCode}</button><small>{dateTime(o.createdAt)}</small></td><td>{o.contact.name}<small>{o.contact.email}</small></td><td><strong>{o.booking.movieTitle}</strong><small>{o.booking.cinemaName} · {o.booking.roomName}</small><small>{dateTime(o.booking.startsAt)}</small></td><td>{o.booking.seats.join(', ')}<small>{o.items.length ? o.items.map(i => `${i.quantity} × ${i.name}`).join(', ') : 'Không kèm combo'}</small></td><td className="live-price">{money(o.total)}</td><td><OrderStatus status={o.status} /></td><td><button className="tv4-secondary" onClick={() => onSelect(o.orderCode)}>Chi tiết</button></td></tr>)}</tbody></table>{!orders.length && <p className="tv4-empty">Không có đơn trong khoảng lọc này.</p>}</div>;
}
function Orders({ filters, refresh, onSelect, compact = false }) {
  const [q, setQ] = useState(''), [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [page, setPage] = useState(1);
  const state = useAdminData('/orders?' + queryString({ ...filters, q: search, status, page, pageSize: compact ? 5 : 15 }), refresh);
  return <section className="live-section"><div className="live-section-title"><div><p className="adm-eyebrow">AD06 • ĐƠN ĐẶT VÉ</p><h2>{compact ? 'Đơn đặt vé gần đây' : 'Danh sách giao dịch'}</h2></div>{compact && <a className="tv4-secondary" href="#admin/ad06">Xem tất cả</a>}</div>
    <p className="tv4-muted">Lọc theo ngày tạo đơn. Bao gồm cả đơn chưa thanh toán và hết hạn.</p>
    {!compact && <form className="tv4-toolbar" onSubmit={e => { e.preventDefault(); setSearch(q.trim()); setPage(1); }}><input value={q} onChange={e => setQ(e.target.value)} maxLength={150} placeholder="Mã đơn, tên hoặc email khách hàng…" aria-label="Tìm giao dịch" /><select aria-label="Trạng thái giao dịch" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="all">Tất cả trạng thái</option>{Object.entries(statusNames).filter(([k]) => k !== 'simulated-success').map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="tv4-secondary">Tìm kiếm</button></form>}
    <RequestState state={state} />{state.data && <><OrderTable orders={state.data.orders} onSelect={onSelect} /><div className="live-pagination"><span>{state.data.total} đơn · Trang {page} / {Math.max(1, Math.ceil(state.data.total / state.data.pageSize))}</span>{!compact && <div><button className="tv4-secondary" disabled={page <= 1 || state.loading} onClick={() => setPage(p => p - 1)}>Trước</button><button className="tv4-secondary" disabled={page * state.data.pageSize >= state.data.total || state.loading} onClick={() => setPage(p => p + 1)}>Sau</button></div>}</div></>}
  </section>;
}
function Bars({ items, nameKey, valueKey, countKey }) {
  const max = Math.max(1, ...items.map(item => Number(item[valueKey])));
  return items.length ? <div className="live-bars">{items.map((item, index) => <div key={item.id || item.day || index}><div><strong>{item[nameKey]}</strong><span>{money(item[valueKey])}</span></div><div className="live-bar-track"><span style={{ width: `${Number(item[valueKey]) / max * 100}%` }} /></div>{countKey && <small>{Number(item[countKey])} {countKey === 'quantity' ? 'phần đã bán' : 'đơn thành công'}</small>}</div>)}</div> : <p className="tv4-empty">Chưa có doanh thu trong khoảng lọc.</p>;
}
function Overview({ filters, refresh, onSelect }) {
  const state = useAdminData('/overview?' + queryString(filters), refresh), data = state.data;
  return <><RequestState state={state} />{data && <><div className="live-stats">{[
    ['TỔNG DOANH THU', money(data.totals.revenue), 'Đơn đã thanh toán thành công'],
    ['DOANH THU VÉ', money(data.totals.tickets), `${Number(data.totals.seats)} ghế đã bán`],
    ['DOANH THU BẮP NƯỚC', money(data.totals.products), 'Theo giá tại thời điểm mua'],
    ['ĐƠN THÀNH CÔNG', Number(data.totals.orders).toLocaleString('vi-VN'), 'Thanh toán mô phỏng'],
  ].map(([label, value, hint]) => <article key={label}><p>{label}</p><strong>{value}</strong><small>{hint}</small></article>)}</div>
    <div className="live-chart-grid"><section className="live-section"><h2>Doanh thu vé theo phim</h2><Bars items={data.movies} nameKey="title" valueKey="revenue" countKey="orders" /></section><section className="live-section"><h2>Bắp nước bán chạy</h2><Bars items={data.products} nameKey="name" valueKey="revenue" countKey="quantity" /></section></div><section className="live-section"><h2>Doanh thu theo ngày thanh toán</h2><Bars items={data.days} nameKey="day" valueKey="revenue" countKey="orders" /></section></>}
    <Orders key={queryString(filters)} filters={filters} refresh={refresh} onSelect={onSelect} compact />
  </>;
}

const categoryNames = { combo: 'Combo', popcorn: 'Bắp rang', drink: 'Nước uống' };
const emptyProduct = { code: '', name: '', category: 'combo', description: '', price: '', image: '', isActive: true };
function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product || emptyProduct), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function save(e) {
    e.preventDefault(); if (busy) return; setBusy(true); setError('');
    try { await adminApi('/products' + (product ? '/' + product.id : ''), { method: product ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price) }) }); onSaved(); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  return <Modal title={product ? 'Chỉnh sửa bắp nước / combo' : 'Thêm bắp nước / combo'} onClose={onClose} locked={busy}><form className="live-product-form" onSubmit={save}><label>Mã sản phẩm<input required maxLength={40} pattern="[A-Za-z0-9_\-]+" value={form.code} onChange={e => update('code', e.target.value)} placeholder="COMBO-COUPLE" /></label><label>Tên sản phẩm<input required maxLength={150} value={form.name} onChange={e => update('name', e.target.value)} /></label><div className="live-form-row"><label>Phân loại<select value={form.category} onChange={e => update('category', e.target.value)}>{Object.entries(categoryNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Giá bán (VNĐ)<input required type="number" min="0" max="100000000" step="1" value={form.price} onChange={e => update('price', e.target.value)} /></label></div><label>Mô tả<textarea maxLength={3000} rows={3} value={form.description} onChange={e => update('description', e.target.value)} /></label><label>Ảnh sản phẩm<input maxLength={2000} value={form.image} onChange={e => update('image', e.target.value)} placeholder="/images/combo.jpg hoặc https://…" /><small>Đường dẫn ảnh có sẵn hoặc URL ảnh công khai.</small></label><label className="live-checkbox"><input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)} /> Đang bán trên trang chọn combo</label><p className="tv4-muted">Ngừng bán sẽ ẩn sản phẩm khỏi danh sách mua mới. Thông tin các đơn đã mua được giữ nguyên.</p>{error && <p role="alert" className="tv4-error">{error}</p>}<div className="live-form-actions"><button type="button" disabled={busy} className="tv4-secondary" onClick={onClose}>Hủy</button><button disabled={busy} className="tv4-button">{busy ? 'Đang lưu…' : 'Lưu sản phẩm'}</button></div></form></Modal>;
}
function Products({ refresh }) {
  const [revision, setRevision] = useState(0), [editing, setEditing] = useState(undefined), [query, setQuery] = useState(''), [category, setCategory] = useState('all'), [sale, setSale] = useState('all'), [notice, setNotice] = useState('');
  const state = useAdminData('/products', refresh + revision);
  const items = (state.data || []).filter(p => (category === 'all' || p.category === category) && (sale === 'all' || p.isActive === (sale === 'active')) && `${p.name} ${p.code}`.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')));
  return <section className="live-section"><div className="live-section-title"><div><p className="adm-eyebrow">AD05 • DANH MỤC BẮP NƯỚC</p><h2>Sản phẩm & Combo</h2></div><button className="tv4-button" onClick={() => setEditing(null)}><Plus size={18} /> Thêm món mới</button></div><p className="tv4-muted">Danh mục dùng chung với trang chọn combo của khách hàng.</p><div className="tv4-toolbar"><input aria-label="Tìm sản phẩm" placeholder="Tìm tên sản phẩm, mã sản phẩm…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Loại sản phẩm" value={category} onChange={e => setCategory(e.target.value)}><option value="all">Tất cả loại</option>{Object.entries(categoryNames).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><select aria-label="Trạng thái bán" value={sale} onChange={e => setSale(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="active">Đang bán</option><option value="inactive">Ngừng bán</option></select></div>{notice && <p role="status" className="live-notice">{notice}</p>}<RequestState state={state} />{state.data && <><div className="tv4-table-wrap"><table className="tv4-table live-products"><thead><tr><th>Sản phẩm & Mã</th><th>Phân loại</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td><div className="live-product-cell">{p.image ? <img src={p.image} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <Popcorn size={32} />}<div><strong>{p.name}</strong><small>{p.code}</small><small>{p.description}</small></div></div></td><td>{categoryNames[p.category]}</td><td className="live-price">{money(p.price)}</td><td><span className={'order-status ' + (p.isActive ? 'paid' : 'cancelled')}>{p.isActive ? 'Đang bán' : 'Ngừng bán'}</span></td><td><button className="tv4-secondary" onClick={() => setEditing(p)}>Sửa / Trạng thái</button></td></tr>)}</tbody></table>{!items.length && <p className="tv4-empty">Không có sản phẩm phù hợp.</p>}</div><p className="tv4-muted">Hiển thị {items.length} / {state.data.length} sản phẩm</p></>}{editing !== undefined && <ProductForm product={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); setRevision(n => n + 1); setNotice('Đã lưu sản phẩm. Trang chọn combo sẽ dùng dữ liệu mới khi tải danh sách.'); }} />}</section>;
}

export default function AdminPage({ user, onLogout, loggingOut }) {
  const [module, setModule] = useState(currentModule), [refresh, setRefresh] = useState(0), [selected, setSelected] = useState('');
  const [filters, setFilters] = useState(() => ({ from: dateInVietnam().slice(0, 8) + '01', to: dateInVietnam(), cinemaId: '' }));
  const [draft, setDraft] = useState(filters), [filterError, setFilterError] = useState('');
  const cinemas = useAdminData('/cinemas');
  useEffect(() => { const change = () => { setModule(currentModule()); setSelected(''); }; window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const title = modules.find(([code]) => code === module)?.[1];
  function applyFilters(e) { e.preventDefault(); if (draft.from && draft.to && draft.from > draft.to) { setFilterError('Ngày bắt đầu phải trước ngày kết thúc.'); return; } setFilterError(''); setFilters({ ...draft }); }
  return <div className="nova-admin live-admin"><aside className="adm-sidebar"><a className="adm-brand" href="#admin"><Clapperboard /><span>NOVA CINEMA<small>COMMAND CONSOLE</small></span></a><p className="live-sidebar-caption"><ShieldCheck size={15} /> Cổng quản trị</p><nav aria-label="Các màn quản trị">{modules.map(([code, label, Icon, enabled]) => enabled ? <a key={code} href={'#admin/' + code} className={module === code ? 'active' : ''} aria-current={module === code ? 'page' : undefined}><Icon size={19} /><span>{label}</span><small>{code.toUpperCase()}</small></a> : <span key={code} className="live-nav-disabled" title="Chức năng của thành viên khác"><Icon size={19} /><span>{label}<small>Chưa mở trong phần TV4</small></span></span>)}</nav><a href="#trang-chu" className="live-back"><ArrowLeft size={17} /> Về cổng khách hàng</a></aside><div className="adm-workspace"><header className="adm-topbar"><span>HỆ THỐNG ĐIỀU HÀNH NOVA CINEMA</span><div className="live-user"><ShieldCheck size={22} /><span>{user?.fullName || 'Quản trị viên'}<small>ADMIN</small></span><button className="tv4-secondary" disabled={loggingOut} onClick={onLogout} aria-label="Đăng xuất"><LogOut size={17} /></button></div></header><main className="adm-content"><p className="adm-eyebrow">Bảng điều khiển / {module.toUpperCase()}</p><div className="tv4-heading"><div><h1>{module.toUpperCase()} – {title}</h1><p className="tv4-muted">Dữ liệu MySQL • Tự cập nhật mỗi 30 giây</p></div><button className="tv4-secondary" onClick={() => setRefresh(n => n + 1)}><RefreshCw size={17} /> Làm mới</button></div>
    {module !== 'ad05' && <><form className="live-filters" onSubmit={applyFilters}><label>Từ ngày<input type="date" value={draft.from} onChange={e => setDraft(d => ({ ...d, from: e.target.value }))} /></label><label>Đến ngày<input type="date" value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))} /></label><label>Cụm rạp<select value={draft.cinemaId} onChange={e => setDraft(d => ({ ...d, cinemaId: e.target.value }))}><option value="">Tất cả cụm rạp</option>{cinemas.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button className="tv4-button">Áp dụng</button><button type="button" className="tv4-secondary" onClick={() => { const all = { from: '', to: '', cinemaId: '' }; setDraft(all); setFilters(all); setFilterError(''); }}>Toàn bộ thời gian</button></form>{filterError && <p role="alert" className="tv4-error">{filterError}</p>}<RequestState state={cinemas} /><p className="tv4-muted">Doanh thu tính theo ngày thanh toán; danh sách đơn tính theo ngày tạo. Đơn chưa thành công không cộng vào doanh thu. Các khoản thanh toán hiện là mô phỏng.</p></>}
    {module === 'ad01' && <Overview filters={filters} refresh={refresh} onSelect={setSelected} />}{module === 'ad06' && <Orders key={queryString(filters)} filters={filters} refresh={refresh} onSelect={setSelected} />}{module === 'ad05' && <Products refresh={refresh} />}{selected && <OrderModal code={selected} onClose={() => setSelected('')} />}
  </main></div></div>;
}
