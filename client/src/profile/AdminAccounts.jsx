import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, ShieldCheck } from "lucide-react";
import "./adminAccounts.css";

export default function AdminAccounts() {
    const [draft, setDraft] = useState("");
    const [request, setRequest] = useState({ q: "", page: 1 });
    const [result, setResult] = useState({ status: "loading" });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadAccounts() {
            try {
                const params = new URLSearchParams({ q: request.q, page: String(request.page) });
                const response = await fetch(`/api/auth/admin/users?${params}`, {
                    credentials: "same-origin",
                    signal: controller.signal,
                });
                if (controller.signal.aborted) return;

                if (response.status === 401) {
                    window.location.replace("#dang-nhap");
                    return;
                }
                if (response.status === 403) {
                    setResult({ status: "forbidden" });
                    return;
                }

                const data = await response.json().catch(() => null);
                if (controller.signal.aborted) return;
                if (!response.ok || !data?.success || !Array.isArray(data.users)) {
                    setResult({ status: "error", message: data?.message || "Chưa tải được danh sách tài khoản." });
                    return;
                }
                setResult({ status: "ready", data });
            } catch {
                if (!controller.signal.aborted) {
                    setResult({ status: "error", message: "Không kết nối được với máy chủ." });
                }
            }
        }

        loadAccounts();
        return () => controller.abort();
    }, [request]);

    function loadPage(page, q = request.q) {
        setResult({ status: "loading" });
        setRequest({ page, q });
    }

    function search(event) {
        event.preventDefault();
        loadPage(1, draft.trim());
    }

    const data = result.data;
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    return (
        <div className="na-admin">
            <main className="na-admin-wrap">
                <a className="na-admin-back" href="#tai-khoan"><ArrowLeft size={18} /> Hồ sơ cá nhân</a>
                <header className="na-admin-heading">
                    <span><ShieldCheck size={24} aria-hidden="true" /></span>
                    <h1>Quản lý tài khoản</h1>
                </header>

                {result.status === "forbidden" ? (
                    <p className="na-admin-panel" role="alert">Bạn cần quyền quản trị viên để xem danh sách tài khoản.</p>
                ) : (
                    <section className="na-admin-panel" aria-label="Danh sách tài khoản">
                        <form className="na-admin-search" onSubmit={search} role="search">
                            <label>
                                <Search size={18} aria-hidden="true" />
                                <input type="search" aria-label="Tìm theo tên hoặc email" placeholder="Tìm theo tên hoặc email"
                                    value={draft} maxLength={150} onChange={(event) => setDraft(event.target.value)} />
                            </label>
                            <button type="submit">Tìm kiếm</button>
                        </form>

                        {result.status === "loading" && <p role="status">Đang tải danh sách tài khoản…</p>}
                        {result.status === "error" && (
                            <div>
                                <p role="alert">{result.message}</p>
                                <button type="button" onClick={() => loadPage(request.page)}>Thử lại</button>
                            </div>
                        )}
                        {data && (
                            <>
                                <p className="na-admin-count" aria-live="polite">{data.total.toLocaleString("vi-VN")} tài khoản</p>
                                {data.users.length > 0 ? (
                                    <div className="na-admin-table-wrap" tabIndex={0} aria-label="Bảng tài khoản có thể cuộn ngang">
                                        <table aria-label="Danh sách tài khoản">
                                            <thead>
                                                <tr><th scope="col">Mã</th><th scope="col">Họ và tên</th><th scope="col">Email</th>
                                                    <th scope="col">Số điện thoại</th><th scope="col">Vai trò</th>
                                                    <th scope="col">Trạng thái</th><th scope="col">Ngày tạo</th></tr>
                                            </thead>
                                            <tbody>
                                                {data.users.map((user) => (
                                                    <tr key={user.id}>
                                                        <td>#{user.id}</td><td>{user.fullName}</td><td>{user.email}</td>
                                                        <td>{user.phone || "—"}</td>
                                                        <td>{user.role === "admin" ? "Quản trị viên" : "Thành viên"}</td>
                                                        <td><span className={user.status === "active" ? "na-admin-active" : "na-admin-disabled"}>
                                                            {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                                                        </span></td>
                                                        <td>{user.createdAt}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : <p>Không có tài khoản phù hợp.</p>}
                                {totalPages > 1 && (
                                    <nav className="na-admin-pages" aria-label="Phân trang tài khoản">
                                        <button type="button" onClick={() => loadPage(data.page - 1)} disabled={data.page <= 1}>
                                            <ChevronLeft size={16} /> Trước
                                        </button>
                                        <span>Trang {data.page} / {totalPages}</span>
                                        <button type="button" onClick={() => loadPage(data.page + 1)} disabled={data.page >= totalPages}>
                                            Sau <ChevronRight size={16} />
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
