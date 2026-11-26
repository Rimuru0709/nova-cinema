import { useEffect, useState } from 'react';
import { CheckCircle2, Ticket } from 'lucide-react';
import DemoConfirmationPage from './DemoConfirmationPage.jsx';
import OrderDetail from '../tickets/OrderDetail.jsx';
import { CustomerFrame } from '../tickets/OrderDetail.jsx';
import { bookingApi } from '../checkout/bookingApi.js';

export default function ConfirmationPage({ orderCode }) {
  if (!orderCode) return <DemoConfirmationPage />;
  return <SavedConfirmation key={orderCode} orderCode={orderCode} />;
}
function SavedConfirmation({ orderCode }) {
  const [state, setState] = useState({ loading: true }), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    bookingApi('/' + encodeURIComponent(orderCode), null, controller.signal)
      .then(order => { if (!controller.signal.aborted) setState({ order }); })
      .catch(error => { if (!controller.signal.aborted) setState({ error: error.message, auth: error.status === 401 }); });
    return () => controller.abort();
  }, [orderCode, retry]);
  return <CustomerFrame><div className="tv4-heading"><div><p className="tv4-eyebrow">04 / XÁC NHẬN ĐẶT VÉ</p><h1>Xác nhận đặt vé</h1><p className="tv4-muted">Thông tin đơn hàng được lưu trong tài khoản của bạn.</p></div><a href="#ve-cua-toi" className="tv4-secondary">Vé của tôi</a></div>
    {state.loading && <p role="status">Đang kiểm tra đơn đặt vé…</p>}
    {state.error && <div className="tv4-empty"><p role="alert">{state.error}</p>{state.auth ? <a className="tv4-button" href="#dang-nhap">Đăng nhập</a> : <button className="tv4-button" onClick={() => setRetry(n => n + 1)}>Thử lại</button>}</div>}
    {state.order && <>{state.order.status === 'paid' ? <div className="tv4-banner"><CheckCircle2 size={24} /><strong> Đặt vé thành công</strong><p>Đã xác nhận ghế và lưu đơn. Thanh toán mô phỏng, không thu tiền thật.</p><a className="tv4-button" href={'#chi-tiet-ve/' + encodeURIComponent(orderCode)}><Ticket size={18} /> Xem vé điện tử & QR</a></div> : <div className="tv4-banner">Đơn này chưa thanh toán thành công nên chưa có vé điện tử.</div>}<OrderDetail order={state.order} /></>}
  </CustomerFrame>;
}
