import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import './admin.css';

export default function AdminAccess({ children }) {
  const [session, setSession] = useState({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [logoutPending, setLogoutPending] = useState(false);

  useEffect(() => {
    let controller;
    let stopped = false;
    async function checkSession() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch('/api/auth/admin/session', {
          credentials: 'same-origin', cache: 'no-store', signal: request.signal,
        });
        const data = await response.json().catch(() => null);
        if (stopped || request.signal.aborted || logoutPending) return;
        if (response.status === 401) {
          setSession({ status: 'loading' });
          window.location.replace('#dang-nhap');
        } else if (response.status === 403) {
          setSession({ status: 'forbidden' });
        } else if (response.ok && data?.success && data.user?.role === 'admin') {
          setSession({ status: 'ready', user: data.user });
        } else {
          setSession({ status: 'error' });
        }
      } catch {
        if (!stopped && !request.signal.aborted && !logoutPending) setSession({ status: 'error' });
      }
    }
    checkSession();
    const timer = window.setInterval(checkSession, 60000);
    window.addEventListener('focus', checkSession);
    return () => {
      stopped = true;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', checkSession);
    };
  }, [attempt, logoutPending]);

  async function logout() {
    if (logoutPending) return;
    setLogoutPending(true);
    setLoggingOut(true);
    setLogoutError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error();
      setSession({ status: 'loading' });
      window.location.replace('#dang-nhap');
    } catch {
      setLogoutError('Chưa đăng xuất được. Vui lòng thử lại.');
    } finally {
      setLogoutPending(false);
      setLoggingOut(false);
    }
  }

  if (session.status === 'ready') return <>
    {logoutError && <div className="adm-access-notice" role="alert">{logoutError}</div>}
    {children({ user: session.user, onLogout: logout, loggingOut })}
  </>;

  return <main className="nova-admin adm-access"><section className="adm-access-card">
    <ShieldCheck size={36} aria-hidden="true" />
    <p className="adm-eyebrow">NOVA CINEMA • ADMIN</p>
    <h1>{session.status === 'forbidden' ? 'Tài khoản chưa có quyền quản trị' : session.status === 'error' ? 'Chưa kiểm tra được phiên đăng nhập' : 'Đang kiểm tra quyền truy cập…'}</h1>
    <p role={session.status === 'loading' ? 'status' : 'alert'}>{session.status === 'forbidden' ? 'Bạn đang đăng nhập bằng tài khoản khách hàng. Hãy dùng tài khoản được cấp quyền admin.' : session.status === 'error' ? 'Kiểm tra server đang chạy rồi thử lại.' : 'Vui lòng chờ trong giây lát.'}</p>
    <div className="adm-access-actions">
      {session.status === 'error' && <button className="adm-gold-button" onClick={() => { setSession({ status: 'loading' }); setAttempt(value => value + 1); }}>Thử lại</button>}
      {session.status === 'forbidden' && <a className="adm-gold-button" href="#dang-nhap">Đăng nhập tài khoản khác</a>}
      <a className="adm-soft-button" href="#trang-chu">Về trang chủ</a>
    </div>
  </section></main>;
}
