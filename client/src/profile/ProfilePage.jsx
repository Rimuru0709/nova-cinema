import {
    Armchair, ArrowLeft, Award, CalendarDays, ChartNoAxesColumnIncreasing, ChevronDown,
    ChevronRight, CreditCard, Crown, Gift, Headphones, Info, LockKeyhole, LogOut, Mail,
    MapPin, Menu, Nfc, Percent, Save, ShieldCheck, Smartphone, Star, Ticket, UserRound, Wine,
} from "lucide-react";

import useProfile, { benefits, navigation, stats } from "./useProfile.jsx";
import "./profile.css";

const benefitIcons = [Armchair, Wine, Percent];
const statNotes = ["≈ 125.000 VNĐ", "Mục tiêu: 5.0M", "+4 so với 2024"];

function Brand() {
    return (
        <a className="np-brand" href="#trang-chu">
            <img src="/nova-icon.png" alt="" width="44" height="44" />
            <span><strong>NOVA CINEMA</strong><small>LUXURY EXPERIENCE</small></span>
        </a>
    );
}

function AccountField({ id, label, icon: Icon, hint, required, children }) {
    return (
        <div className="np-account-field">
            <div className="np-account-label">
                <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
                {hint && <span className="np-account-hint">{hint}</span>}
            </div>
            <div className="np-account-input">
                <Icon size={15} aria-hidden="true" />
                {children}
            </div>
        </div>
    );
}

export default function ProfilePage({ onNavigate }) {
    const {
        user, loading, loggingOut, error, retry, logout,
        profile, profileReady, cinemas, saving, saveResult, updateProfileField, saveProfile,
        changingPassword, passwordError, changePassword,
    } = useProfile();
    const isAdmin = user?.role === "admin";
    const profileChanged = user && Object.keys(profile).some(
        (field) => profile[field] !== (user[field] ?? ""),
    );
    const submitting = saving || loggingOut || changingPassword;

    function followLink(event, hash) {
        if (!onNavigate || event.ctrlKey || event.metaKey || event.shiftKey) return;

        event.preventDefault();
        onNavigate(hash === "#phim" ? "movies" : "home", hash);
    }

    function scrollWithinProfile(event) {
        event.preventDefault();
        const id = event.currentTarget.hash.slice(1);
        document.getElementById(id)?.scrollIntoView({ block: "start" });
    }

    function renderLinks() {
        return navigation.map(([label, hash]) => (
            <a key={hash} href={hash} onClick={(event) => followLink(event, hash)}>
                {label}
            </a>
        ));
    }

    return (
        <div className="nova-profile">
            <header className="np-header">
                <div className="np-wrap np-header-inner">
                    <Brand />
                    <nav className="np-nav" aria-label="Menu chính">{renderLinks()}</nav>
                    <div className="np-header-actions">
                        {user && (
                            <span className="np-gold-chip">
                                {isAdmin ? <ShieldCheck size={16} /> : <Crown size={16} />}
                                {isAdmin ? "QUẢN TRỊ VIÊN" : "NOVA ELITE"}
                            </span>
                        )}
                        <a className="np-avatar" href="#tai-khoan" aria-label="Hồ sơ của tôi">
                            <UserRound size={20} />
                        </a>
                        <details className="np-mobile-menu">
                            <summary aria-label="Menu chính"><Menu size={22} /></summary>
                            <nav aria-label="Menu trên điện thoại">{renderLinks()}</nav>
                        </details>
                    </div>
                </div>
            </header>

            <main className="np-wrap np-main">
                <a className="np-back" href="#trang-chu">
                    <ArrowLeft size={16} /> Trang chủ <span>/ {isAdmin ? "Hồ sơ quản trị viên" : "Tài khoản cá nhân"}</span>
                </a>
                {isAdmin ? (
                    <h1>Hồ sơ quản trị viên</h1>
                ) : user ? (
                    <>
                        <div className="np-eyebrow">CONCIERGE PORTAL · VIP MEMBER AREA</div>
                        <h1>Hồ sơ cá nhân & Đặc quyền hội viên <strong>NOVA Elite</strong></h1>
                    </>
                ) : <h1>Hồ sơ cá nhân</h1>}

                {loading ? (
                    <p className="np-panel" role="status">Đang kiểm tra phiên đăng nhập…</p>
                ) : !user ? (
                    <div className="np-panel">
                        <p role="status">{error || "Đang chuyển tới trang đăng nhập…"}</p>
                        {error && <button className="np-button" onClick={retry}>Thử lại</button>}
                    </div>
                ) : (
                    <div className="np-layout">
                        <aside className="np-stack np-member-sidebar" aria-label={isAdmin ? "Menu quản trị" : "Tổng quan hội viên"}>
                            {!isAdmin && (
                                <>
                                    <section className="np-card">
                                        <div className="np-card-top">
                                            <div className="np-card-brand">
                                                <span className="np-card-badge"><Award size={17} aria-hidden="true" /></span>
                                                <div><strong>NOVA ELITE</strong><small>PRIORITY PRIVILEGES</small></div>
                                            </div>
                                            <span className="np-gold-chip" aria-label="Gold Tier VIP, thẻ mẫu">
                                                <Star size={10} aria-hidden="true" /> GOLD TIER VIP
                                            </span>
                                        </div>
                                        <div className="np-card-number">
                                            <span className="np-card-symbols">
                                                <CreditCard size={33} aria-hidden="true" />
                                                <Nfc size={15} aria-hidden="true" />
                                            </span>
                                            <span>•••• 8899 2025</span>
                                        </div>
                                        <div className="np-card-bottom">
                                            <div>
                                                <small>CHỦ THẺ DANH DỰ</small>
                                                <strong className="np-card-name">{user.fullName}</strong>
                                            </div>
                                            <div className="np-card-expiry">
                                                <small>HIỆU LỰC MẪU</small>
                                                <strong>12 / 2028</strong>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="np-panel np-points" id="tich-luy-nova">
                                        <div className="np-points-heading">
                                            <h2><ChartNoAxesColumnIncreasing size={16} /> Tích lũy & Thăng hạng</h2>
                                            <span>Kỳ đánh giá 2025</span>
                                        </div>
                                        <div className="np-stats">
                                            {stats.map(([label, value], index) => (
                                                <div key={label}>
                                                    <small>{label}</small>
                                                    <strong>{index === 1 ? "4.25M" : value}</strong>
                                                    <span>{statNotes[index]}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <label className="np-progress-label">
                                            Tiến độ thăng hạng <strong>Platinum Tier</strong> <span>85%</span>
                                            <progress max="100" value="85" />
                                        </label>
                                        <p className="np-points-note">Cần thêm <strong>750.000 VNĐ</strong> để đạt Platinum · Minh họa</p>
                                    </section>
                                </>
                            )}

                            <section className="np-panel np-shortcuts" aria-label="Quản lý tài khoản">
                                {isAdmin && (
                                    <a className="np-shortcut-primary" href="#quan-ly-tai-khoan">
                                        <ShieldCheck size={16} /> <span>Quản lý tài khoản</span>
                                        <ChevronRight size={13} aria-hidden="true" />
                                    </a>
                                )}
                                <a className={isAdmin ? undefined : "np-shortcut-primary"} href="#thong-tin-ho-so" onClick={scrollWithinProfile}>
                                    <UserRound size={16} /> <span>{isAdmin ? "Thông tin quản trị viên" : "Thông tin cá nhân & Tài khoản"}</span>
                                    <ChevronRight size={13} aria-hidden="true" />
                                </a>
                                {!isAdmin && (
                                    <>
                                        <a href="#tich-luy-nova" onClick={scrollWithinProfile}>
                                            <Ticket size={16} /> <span>Tích lũy & Điểm Nova</span>
                                            <small>1.250 pt</small>
                                        </a>
                                        <a href="#dac-quyen-hoi-vien" onClick={scrollWithinProfile}>
                                            <Gift size={16} /> <span>Ưu đãi & Quà tặng VIP</span>
                                            <small className="np-shortcut-tag">Gold</small>
                                        </a>
                                    </>
                                )}
                                <a href="#bao-mat-ho-so" onClick={scrollWithinProfile}>
                                    <ShieldCheck size={16} /> <span>Bảo mật tài khoản</span>
                                </a>
                                <button className="np-shortcut-logout" type="button" onClick={logout} disabled={submitting}>
                                    <LogOut size={16} /> {loggingOut ? "Đang đăng xuất…" : "Đăng xuất an toàn"}
                                </button>
                                {error && <p className="np-error" role="alert">{error}</p>}
                            </section>

                            {!isAdmin && <section className="np-panel np-support">
                                <span className="np-support-icon"><Headphones size={20} aria-hidden="true" /></span>
                                <div>
                                    <small>TRỢ LÝ ĐẶC QUYỀN</small>
                                    <strong>Hỗ trợ hội viên</strong>
                                    <p>Dành cho hội viên NOVA Elite</p>
                                </div>
                                <a href="#lien-he" onClick={(event) => followLink(event, "#lien-he")}>Liên hệ</a>
                            </section>}
                        </aside>

                        <div className="np-stack">
                            {!isAdmin && <section className="np-panel" id="dac-quyen-hoi-vien">
                                <h2><Crown size={20} /> Đặc quyền Gold Tier</h2>
                                <div className="np-benefits">
                                    {benefits.map(([title, description], index) => {
                                        const Icon = benefitIcons[index];

                                        return (
                                            <article key={title}>
                                                <Icon size={22} />
                                                <h3>{title}</h3>
                                                <p>{description}</p>
                                            </article>
                                        );
                                    })}
                                </div>
                                <p className="np-muted">Quyền lợi minh họa.</p>
                            </section>}

                            <section className="np-panel np-account-panel" id="thong-tin-ho-so">
                                <header className="np-account-heading">
                                    <div>
                                        <h2><UserRound size={18} /> {isAdmin ? "Thông tin quản trị viên" : "Thông tin tài khoản hội viên"}</h2>
                                        <p>Thông tin cá nhân được liên kết với tài khoản NOVA.</p>
                                    </div>
                                    <span className="np-account-id">Mã định danh: <strong>#NV-{user.id}</strong></span>
                                </header>
                                <form onSubmit={saveProfile} aria-busy={saving}>
                                    <div className="np-account-fields">
                                        <AccountField id="np-account-name" label="Họ và tên" icon={UserRound} required>
                                            <input id="np-account-name" name="fullName" value={profile.fullName}
                                                autoComplete="name" required minLength={2} maxLength={150}
                                                onChange={updateProfileField} disabled={submitting} />
                                        </AccountField>
                                        <AccountField id="np-account-email" label="Email đăng ký" icon={Mail} hint="Chỉ đọc">
                                            <input id="np-account-email" type="email" value={user.email ?? ""} readOnly />
                                        </AccountField>
                                        <AccountField id="np-account-phone" label="Số điện thoại" icon={Smartphone} hint="Không bắt buộc">
                                            <input id="np-account-phone" name="phone" type="tel" value={profile.phone}
                                                autoComplete="tel" maxLength={25} placeholder="Nhập số điện thoại"
                                                onChange={updateProfileField} disabled={submitting} />
                                        </AccountField>
                                        <AccountField id="np-account-birthday" label="Ngày sinh" icon={CalendarDays}>
                                            <input id="np-account-birthday" name="birthDate" type="date"
                                                min="1900-01-01" value={profile.birthDate} autoComplete="bday"
                                                onChange={updateProfileField} disabled={!profileReady || submitting} />
                                        </AccountField>
                                        <AccountField id="np-account-gender" label="Giới tính" icon={UserRound}>
                                            <select id="np-account-gender" name="gender" value={profile.gender}
                                                onChange={updateProfileField} disabled={!profileReady || submitting}>
                                                <option value="">Chưa chọn</option>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                                <option value="private">Không muốn chia sẻ</option>
                                            </select>
                                            <ChevronDown size={14} aria-hidden="true" />
                                        </AccountField>
                                        <AccountField id="np-account-cinema" label="Cụm rạp NOVA yêu thích" icon={MapPin}>
                                            <select id="np-account-cinema" name="favoriteCinemaId"
                                                value={profile.favoriteCinemaId} onChange={updateProfileField}
                                                disabled={!profileReady || cinemas === null || submitting}>
                                                <option value="">{cinemas === null ? "Chưa tải được danh sách rạp" : "Chưa chọn rạp"}</option>
                                                {profile.favoriteCinemaId && !cinemas?.some((cinema) => String(cinema.id) === profile.favoriteCinemaId) && (
                                                    <option value={profile.favoriteCinemaId}>Rạp đã lưu</option>
                                                )}
                                                {cinemas?.map((cinema) => (
                                                    <option key={cinema.id} value={String(cinema.id)}>{cinema.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={14} aria-hidden="true" />
                                        </AccountField>
                                    </div>
                                    <div className="np-account-actions">
                                        <p className={saveResult?.error ? "np-error" : "np-muted"}
                                            role={saveResult?.error ? "alert" : "status"}>
                                            <Info size={14} aria-hidden="true" />
                                            {saveResult?.message || (profileReady
                                                ? "Ngày sinh, giới tính và rạp yêu thích có thể để trống."
                                                : "Cần cập nhật database để mở các trường hồ sơ mới.")}
                                        </p>
                                        <button className="np-button np-account-save" type="submit"
                                            disabled={!profileChanged || submitting}>
                                            <Save size={15} aria-hidden="true" />
                                            {saving ? "Đang lưu…" : "Lưu thay đổi hồ sơ"}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="np-panel" id="bao-mat-ho-so">
                                <h2><LockKeyhole size={20} /> Bảo mật & Đổi mật khẩu</h2>
                                <form onSubmit={changePassword} aria-busy={changingPassword}>
                                    <div className="np-fields np-passwords">
                                        <label className="np-field">
                                            <span>Mật khẩu hiện tại</span>
                                            <input name="currentPassword" type="password" autoComplete="current-password"
                                                required maxLength={256} disabled={submitting} />
                                        </label>
                                        <label className="np-field">
                                            <span>Mật khẩu mới</span>
                                            <input name="newPassword" type="password" autoComplete="new-password"
                                                required minLength={8} maxLength={256} disabled={submitting} />
                                        </label>
                                        <label className="np-field">
                                            <span>Xác nhận mật khẩu mới</span>
                                            <input name="confirmPassword" type="password" autoComplete="new-password"
                                                required minLength={8} maxLength={256} disabled={submitting} />
                                        </label>
                                    </div>
                                    <div className="np-actions">
                                        <p className={passwordError ? "np-error" : "np-muted"}
                                            role={passwordError ? "alert" : undefined}>
                                            {passwordError || "Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu."}
                                        </p>
                                        <button className="np-button" type="submit" disabled={submitting}>
                                            {changingPassword ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            <footer className="np-footer">
                <div className="np-wrap np-footer-grid">
                    <div><Brand /><p>Không gian điện ảnh NOVA Cinema.</p></div>
                    <div><h2>Khám phá</h2><a href="#phim">Danh sách phim</a><a href="#dat-ve" onClick={(event) => followLink(event, "#dat-ve")}>Lịch chiếu</a></div>
                    {isAdmin ? (
                        <div><h2>Quản trị</h2><a href="#quan-ly-tai-khoan">Quản lý tài khoản</a></div>
                    ) : (
                        <div><h2>Hội viên</h2><a href="#uu-dai" onClick={(event) => followLink(event, "#uu-dai")}>Giá vé & Ưu đãi</a></div>
                    )}
                    <div><h2>Hỗ trợ</h2><a href="#lien-he" onClick={(event) => followLink(event, "#lien-he")}>Liên hệ NOVA Cinema</a></div>
                </div>
            </footer>
        </div>
    );
}
