import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Clapperboard, CupSoda, Info, Minus, Plus, Popcorn, RefreshCw, Search, ShoppingBag, Ticket, Trash2 } from 'lucide-react';
import { BOOKING_KEY, CART_KEY, DRAFT_KEY, MAX_QUANTITY, bookingContext, cartLines, cleanCart, normalizeProducts, readSession, writeSession } from './cart.js';
import './combo.css';

const currency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const tabs = [{ id: 'all', label: 'Tất cả', Icon: ShoppingBag }, { id: 'combo', label: 'Combo', Icon: Popcorn }, { id: 'popcorn', label: 'Bắp rang', Icon: Popcorn }, { id: 'drink', label: 'Nước uống', Icon: CupSoda }];
const label = { combo: 'COMBO ĐIỆN ẢNH', popcorn: 'BẮP RANG', drink: 'NƯỚC UỐNG' };
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  return <img src={!failed && product.image ? product.image : `/combo/${product.category}.svg`} onError={() => setFailed(true)} alt={product.name} loading="lazy" />;
}

function Quantity({ product, quantity, onChange, disabled }) {
  return <div className="combo-quantity" aria-label={`Số lượng ${product.name}`}>
    <button type="button" aria-label={`Giảm ${product.name}`} disabled={disabled || !quantity} onClick={() => onChange(product.id, -1)}><Minus size={15} /></button>
    <output aria-label={`Số lượng ${product.name}`}>{quantity}</output>
    <button type="button" aria-label={`Thêm ${product.name}`} disabled={disabled || quantity >= MAX_QUANTITY} onClick={() => onChange(product.id, 1)}><Plus size={15} /></button>
  </div>;
}

export default function ComboPage({ review = false }) {
  const [catalog, setCatalog] = useState({ status: 'loading', products: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  const [cart, setCart] = useState(() => cleanCart(readSession(CART_KEY, {})));
  const [booking] = useState(() => bookingContext(readSession(BOOKING_KEY, null)));
  const [now, setNow] = useState(Date.now);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const heading = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let disposed = false;
    fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/products`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Không tải được bắp nước. Kiểm tra backend và kết nối MySQL rồi thử lại.');
        const body = await response.json();
        if (!body.success) throw new Error('Không tải được danh sách sản phẩm.');
        const products = normalizeProducts(body.data);
        if (!disposed) setCatalog({ status: 'ready', products, error: '' });
      })
      .catch((error) => {
        if (!disposed) setCatalog({ status: 'error', products: [], error: error.name === 'AbortError' ? 'Kết nối quá lâu. Vui lòng thử lại.' : error.message });
      }).finally(() => clearTimeout(timeout));
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [attempt]);

  useEffect(() => { writeSession(CART_KEY, cart); }, [cart]);
  useEffect(() => {
    if (!booking) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [booking]);
  useEffect(() => { heading.current?.focus(); window.scrollTo({ top: 0 }); }, [review]);

  const ready = catalog.status === 'ready';
  const expired = Boolean(booking && Date.parse(booking.expiresAt) <= now);
  const remaining = booking ? Math.max(0, Math.ceil((Date.parse(booking.expiresAt) - now) / 1000)) : 0;
  const lines = cartLines(catalog.products, cart);
  const subtotal = lines.reduce((sum, item) => sum + item.subtotal, 0);
  const count = lines.reduce((sum, item) => sum + item.quantity, 0);
  const missing = ready && Object.keys(cart).some((id) => !catalog.products.some((p) => String(p.id) === id));
  const visible = catalog.products.filter((p) => (category === 'all' || p.category === category) && normalize(`${p.name} ${p.description || ''}`).includes(normalize(query)));

  function changeQuantity(id, delta) {
    setNotice('');
    setCart((current) => {
      const next = { ...current };
      const quantity = Math.max(0, Math.min(MAX_QUANTITY, (next[id] || 0) + delta));
      if (quantity) next[id] = quantity; else delete next[id];
      return next;
    });
  }
  function proceed(skip = false) {
    const currentTime = Date.now();
    if (booking && Date.parse(booking.expiresAt) <= currentTime) { setNow(currentTime); return; }
    if (!skip && (!ready || missing)) return;
    const chosen = skip ? [] : lines;
    const productSubtotal = skip ? 0 : subtotal;
    const draft = {
      version: 1, createdAt: new Date().toISOString(), preview: !booking,
      booking, items: chosen.map((p) => ({ productId: p.id, name: p.name, quantity: p.quantity, unitPrice: p.price })),
      productSubtotal, ticketSubtotal: booking?.ticketSubtotal ?? null,
      total: booking ? booking.ticketSubtotal + productSubtotal : null,
    };
    if (!writeSession(DRAFT_KEY, draft) || !writeSession(CART_KEY, skip ? {} : cart)) {
      setNotice('Trình duyệt chưa cho phép lưu lựa chọn. Hãy bật bộ nhớ trang web rồi thử lại.'); return;
    }
    if (skip) setCart({});
    window.location.assign('#thanh-toan');
  }

  return <div className="combo-page">
    <header className="combo-header"><div className="combo-shell combo-header-inner">
      <a href="#trang-chu" className="combo-brand"><span className="combo-brand-symbol"><Clapperboard size={25} /></span><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a>
      <nav aria-label="Điều hướng chính"><a href="#trang-chu">Trang chủ</a><a href="#phim">Phim</a><a href="#dat-ve">Lịch chiếu</a><a href="#chon-combo" aria-current="page">Bắp nước & Combo</a></nav>
      <a href="#phim" className="combo-browse"><Ticket size={17} /> Khám phá phim</a>
    </div></header>
    <main className="combo-shell combo-main">
      <div className="combo-breadcrumb"><a href="#trang-chu">Trang chủ</a><ChevronRight size={13} /><span>Đặt vé</span><ChevronRight size={13} /><span>{review ? 'Xem lại lựa chọn' : 'Chọn combo'}</span></div>
      <div className="combo-title-row"><div><p className="combo-eyebrow"><Popcorn size={15} /> THÊM HƯƠNG VỊ CHO TRẢI NGHIỆM</p><h1 ref={heading} tabIndex={-1}>{review ? 'Lựa chọn của bạn' : <>Bắp nước <span>& Combo</span></>}</h1><p className="combo-subtitle">{review ? 'Kiểm tra các món đã chọn trước bước thanh toán.' : 'Một chút giòn tan, một ngụm mát lạnh. Trọn vẹn từng thước phim.'}</p></div>
        <ol className="combo-steps" aria-label="Các bước đặt vé"><li>01 <span>Chọn ghế</span></li><li className="active">02 <span>Chọn combo</span></li><li>03 <span>Thanh toán</span></li><li>04 <span>Nhận vé</span></li></ol>
      </div>
      <div className={`combo-context ${expired ? 'combo-context-error' : ''}`} role="status">
        {booking ? <><Clock3 size={20} /><div><strong>{expired ? 'Đã hết thời gian giữ ghế' : 'Ghế của bạn đang được giữ'}</strong><span>{expired ? 'Vui lòng chọn lại suất và ghế trước khi tiếp tục.' : 'Thời gian giữ tiếp tục từ bước chọn ghế.'}</span></div><b className="combo-clock">{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</b></>
          : <><Info size={20} /><div><strong>Bạn đang xem trước thực đơn</strong><span>Chưa có ghế được giữ. Bước thanh toán sẽ dùng phim và ghế mẫu để bạn thử cùng combo đã chọn.</span></div><a href="#dat-ve">Chọn suất <ArrowRight size={15} /></a></>}
      </div>
      <div className="combo-layout"><section aria-label={review ? 'Xem lại món đã chọn' : 'Thực đơn bắp nước'}>
        {review ? <div className="combo-review combo-panel"><span className="combo-review-icon"><Check size={28} /></span><p className="combo-eyebrow">LỰA CHỌN ĐÃ ĐƯỢC LƯU TRONG PHIÊN NÀY</p><h2>{count ? `${count} món cho buổi xem phim` : 'Tiếp tục không kèm bắp nước'}</h2><p>Kiểm tra lựa chọn trước khi thanh toán. Đây chưa phải xác nhận đặt vé.</p>
          {lines.map((item) => <div className="combo-review-line" key={item.id}><span>{item.quantity} × {item.name}</span><strong>{currency(item.subtotal)}</strong></div>)}
          {!ready && <p role="status">{catalog.status === 'error' ? catalog.error : 'Đang kiểm tra lại giá sản phẩm…'}</p>}
          {missing && <p role="alert">Một số món không còn được bán. Quay lại thực đơn để cập nhật lựa chọn.</p>}
          <a href="#chon-combo" className="combo-primary"><ArrowLeft size={16} /> Quay lại chỉnh sửa</a>
        </div> : <>
          <div className="combo-feature"><div><p className="combo-eyebrow">NOVA CINEMA • FRESHLY POPPED</p><h2>Phim hay hơn<br />khi có <span>combo ngon.</span></h2><p>Chọn món yêu thích, sẵn sàng tận hưởng.</p><button type="button" onClick={() => setCategory('combo')}>Khám phá combo <ArrowRight size={16} /></button></div><img src="/combo/combo.svg" alt="Minh họa combo bắp rang và nước uống NOVA" /></div>
          <div className="combo-toolbar"><div className="combo-tabs" role="group" aria-label="Loại sản phẩm">{tabs.map(({ id, label: title, Icon }) => <button type="button" key={id} aria-pressed={category === id} className={category === id ? 'active' : ''} onClick={() => setCategory(id)}><Icon size={16} />{title}</button>)}</div><label className="combo-search"><Search size={17} /><input aria-label="Tìm bắp nước hoặc combo" placeholder="Tìm món yêu thích…" value={query} onChange={(e) => setQuery(e.target.value)} /></label></div>
          <div className="combo-section-heading"><h2>{category === 'all' ? 'Thực đơn của NOVA' : tabs.find((t) => t.id === category).label}</h2><span>{ready ? `${visible.length} lựa chọn` : 'Đang tải thực đơn'}</span></div>
          {catalog.status === 'loading' && <div className="combo-empty" role="status"><Popcorn size={30} /><p>Đang chuẩn bị thực đơn cho bạn…</p></div>}
          {catalog.status === 'error' && <div className="combo-empty" role="alert"><Info size={28} /><h3>Chưa tải được thực đơn</h3><p>{catalog.error}</p><button className="combo-secondary" onClick={() => { setCatalog({ status: 'loading', products: [], error: '' }); setAttempt((n) => n + 1); }}><RefreshCw size={15} /> Thử lại</button></div>}
          {ready && !visible.length && <div className="combo-empty"><Search size={28} /><h3>{catalog.products.length ? 'Không tìm thấy món phù hợp' : 'Thực đơn đang được cập nhật'}</h3><p>{catalog.products.length ? 'Thử từ khóa khác hoặc xem tất cả sản phẩm.' : 'Bạn vẫn có thể bỏ qua bắp nước.'}</p>{catalog.products.length > 0 && <button className="combo-secondary" onClick={() => { setCategory('all'); setQuery(''); }}>Xem tất cả</button>}</div>}
          <div className="combo-grid">{ready && visible.map((product) => <article className={`combo-card ${cart[product.id] ? 'selected' : ''}`} key={product.id}>
            <div className="combo-product-image"><ProductImage product={product} /><span className="combo-product-label">{label[product.category]}</span>{cart[product.id] > 0 && <span className="combo-selected-mark"><Check size={13} /> Đã chọn</span>}</div>
            <div className="combo-product-body"><h3>{product.name}</h3><p>{product.description}</p><div className="combo-product-bottom"><strong>{currency(product.price)}</strong><Quantity product={product} quantity={cart[product.id] || 0} onChange={changeQuantity} disabled={expired} /></div></div>
          </article>)}</div>
          <p className="combo-menu-note"><Info size={15} /> Hình minh họa sản phẩm. Chọn tối đa {MAX_QUANTITY} phần mỗi món.</p>
        </>}
      </section>
      <aside className="combo-summary combo-panel" aria-label="Tóm tắt lựa chọn"><p className="combo-eyebrow">TÓM TẮT LỰA CHỌN</p><h2>Buổi xem phim của bạn <Ticket size={21} /></h2>
        <div className="combo-movie"><span className="combo-movie-icon"><Clapperboard size={28} /></span><div><strong>{booking?.movieTitle || 'Chưa chọn phim & ghế'}</strong><p>{booking ? `${booking.cinemaName || ''} · ${booking.roomName || ''}` : 'Chọn suất chiếu để hoàn tất thông tin vé.'}</p>{booking && <p>Ghế: {booking.seats.join(', ')}</p>}</div></div>
        <div className="combo-section-heading"><h3><ShoppingBag size={17} /> Bắp nước đã chọn</h3><span>{count} món</span></div>
        {!count && <div className="combo-cart-empty"><Popcorn size={30} /><p>Thêm một chút vị ngon</p><span>Món bạn chọn sẽ xuất hiện ở đây.</span></div>}
        <div className="combo-cart-items">{lines.map((item) => <div className="combo-cart-item" key={item.id}><div><strong>{item.name}</strong><button type="button" aria-label={`Xóa ${item.name}`} disabled={expired} onClick={() => changeQuantity(item.id, -MAX_QUANTITY)}><Trash2 size={15} /></button></div><div><span>{item.quantity} × {currency(item.price)}</span><b>{currency(item.subtotal)}</b></div></div>)}</div>
        {missing && <div className="combo-warning" role="alert">Một số sản phẩm cũ không còn được bán.<button onClick={() => setCart(Object.fromEntries(lines.map((p) => [p.id, p.quantity])))}>Loại bỏ món không còn bán</button></div>}
        <div className="combo-totals"><div><span>Tiền vé</span><strong>{booking ? currency(booking.ticketSubtotal) : 'Chưa chọn ghế'}</strong></div><div><span>Tiền bắp nước</span><strong>{ready ? currency(subtotal) : '—'}</strong></div></div>
        <div className="combo-total"><span>{booking ? 'Tổng tạm tính' : 'Tạm tính bắp nước'}<small>{booking ? 'Gồm vé và các món đã chọn' : 'Chưa bao gồm tiền vé'}</small></span><strong aria-live="polite" aria-atomic="true">{ready ? currency(subtotal + (booking?.ticketSubtotal || 0)) : '—'}</strong></div>
        {notice && <p className="combo-warning" role="alert">{notice}</p>}
        {!review && <><button type="button" className="combo-primary" disabled={!ready || missing || expired} onClick={() => proceed()}>Tiếp tục thanh toán <ArrowRight size={17} /></button><button type="button" className="combo-skip" disabled={expired} onClick={() => proceed(true)}>Bỏ qua bắp nước <ChevronRight size={15} /></button><p className="combo-next-note">Tiếp theo: kiểm tra thông tin vé và thử thanh toán mô phỏng.</p></>}
        <a className="combo-back" href="#dat-ve"><ArrowLeft size={14} /> {expired ? 'Chọn lại suất và ghế' : 'Quay lại chọn suất'}</a>
      </aside></div>
      <div className="combo-service-strip"><span><Popcorn size={22} /><span><strong>Thêm vị ngon</strong><small>Bắp rang & nước uống yêu thích</small></span></span><span><ShoppingBag size={22} /><span><strong>Lựa chọn linh hoạt</strong><small>Có thể bỏ qua nếu không có nhu cầu</small></span></span><span><Ticket size={22} /><span><strong>Trọn vẹn trải nghiệm</strong><small>Tất cả lựa chọn trong một đơn</small></span></span></div>
    </main>
    <footer className="combo-footer"><div className="combo-shell"><div><a className="combo-brand" href="#trang-chu"><Clapperboard size={24} /><span>NOVA CINEMA<small>LUXURY EXPERIENCE</small></span></a><p>Thưởng thức điện ảnh theo cách của bạn.</p></div><nav aria-label="Liên kết cuối trang"><a href="#phim">Khám phá phim</a><a href="#dat-ve">Lịch chiếu</a><a href="#lien-he">Liên hệ & hỗ trợ</a></nav><small>© {new Date().getFullYear()} NOVA CINEMA</small></div></footer>
  </div>;
}
