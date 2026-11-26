import { useEffect, useState } from 'react';
export async function adminApi(path, options = {}) {
  const response = await fetch('/api/admin' + path, { credentials: 'same-origin', cache: 'no-store', ...options });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) throw Object.assign(new Error(result?.message || 'Chưa kết nối được dữ liệu quản trị.'), { status: response.status });
  return result.data;
}
export function useAdminData(path, refresh = 0) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let controller;
    const load = () => {
      controller?.abort(); controller = new AbortController(); const current = controller;
      setState(old => ({ ...(old.path === path ? old : {}), path, loading: true, error: '' }));
      adminApi(path, { signal: current.signal }).then(data => { if (!current.signal.aborted) setState({ path, data }); })
        .catch(error => { if (!current.signal.aborted) setState({ path, error: error.message, auth: error.status === 401 }); });
    };
    load(); const timer = setInterval(load, 30000); window.addEventListener('focus', load);
    return () => { controller?.abort(); clearInterval(timer); window.removeEventListener('focus', load); };
  }, [path, refresh]);
  return state.path === path ? state : { loading: true };
}
export function queryString(values) { return new URLSearchParams(Object.entries(values).filter(([, value]) => value !== '' && value != null)).toString(); }
