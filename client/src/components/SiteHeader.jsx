import { useState } from "react";
import {
  Search,
  Bell,
  Crown,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

export default function SiteHeader({ activeNav = "home", onNavigate, notificationCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleNav(page, hash) {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(page, hash);
    } else {
      window.location.hash = hash || `#${page}`;
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleNav("movies", `#phim?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* LOGO */}
        <a
          className="brand"
          href="#trang-chu"
          aria-label="Nova Cinema trang chủ"
          onClick={(e) => {
            e.preventDefault();
            handleNav("home", "#trang-chu");
          }}
        >
          <span className="brand-symbol">
            <img
              src="/nova-icon.png"
              alt="Nova Cinema Logo"
              className="brand-icon-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </span>
          <span className="brand-text">
            <strong>NOVA CINEMA</strong>
            <small>LUXURY EXPERIENCE</small>
          </span>
        </a>

        {/* NAVIGATION LINKS */}
        <nav
          id="main-navigation"
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Menu chính"
        >
          <a
            href="#trang-chu"
            className={activeNav === "home" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("home", "#trang-chu");
            }}
          >
            Trang chủ
          </a>

          <a
            href="#phim"
            className={activeNav === "movies" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("movies", "#phim");
            }}
          >
            Phim
          </a>

          <a
            href="#lich-chieu"
            className={activeNav === "showtimes" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("showtimes", "#lich-chieu");
            }}
          >
            Lịch chiếu
          </a>

          <a
            href="#uu-dai"
            className={activeNav === "deals" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("home", "#uu-dai");
            }}
          >
            Giá vé & Ưu đãi
          </a>

          <a
            href="#trai-nghiem"
            className={activeNav === "about" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("home", "#trai-nghiem");
            }}
          >
            Giới thiệu
          </a>

          <a
            href="#lien-he"
            className={activeNav === "contact" ? "is-active" : ""}
            onClick={(e) => {
              e.preventDefault();
              handleNav("home", "#lien-he");
            }}
          >
            Liên hệ
          </a>
        </nav>

        {/* HEADER ACTIONS */}
        <div className="header-actions">
          {/* SEARCH BUTTON */}
          <button
            type="button"
            className="icon-button"
            aria-label="Tìm kiếm phim"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            <Search size={18} />
          </button>

          {/* NOTIFICATION BUTTON */}
          <button
            type="button"
            className="icon-button notification-button"
            aria-label="Thông báo"
            onClick={() => {
              alert("Bạn đang ở hạng thẻ GOLD TIER. Không có thông báo chưa đọc.");
            }}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="notification-count">{notificationCount}</span>
            )}
          </button>

          {/* GOLD TIER BADGE */}
          <a
            className="gold-tier"
            href="#uu-dai"
            onClick={(e) => {
              e.preventDefault();
              handleNav("home", "#uu-dai");
            }}
          >
            <Crown size={14} />
            GOLD TIER
          </a>

          {/* QUẢN TRỊ ADMIN BUTTON */}
          <button
            type="button"
            className="admin-badge-btn"
            title="Khu vực quản trị rạp"
            onClick={() => {
              alert("Bảng điều khiển quản trị NOVA Cinema (Admin Portal)");
            }}
          >
            <ShieldCheck size={14} />
            <span>Quản trị Admin</span>
          </button>

          {/* USER AVATAR WITH ONLINE DOT */}
          <div className="avatar-wrapper" style={{ position: "relative", display: "inline-block" }}>
            <button
              type="button"
              className="avatar-button"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                padding: "1px",
                border: "2px solid var(--gold, #ffce6d)",
                overflow: "hidden",
                background: "#0a1f33",
                cursor: "pointer",
              }}
              title="Tài khoản VIP"
              onClick={() => {
                alert("Hội viên VIP Gold: Nguyễn Hoàng Long (Điểm tích lũy: 1.450 CinePoints)");
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            </button>
            <span
              style={{
                position: "absolute",
                bottom: "1px",
                right: "1px",
                width: "9px",
                height: "9px",
                backgroundColor: "#2ecc71",
                borderRadius: "50%",
                border: "1.5px solid #06192b",
                display: "block",
              }}
            />
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            className="icon-button menu-toggle"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* EXPANDABLE SEARCH PANEL */}
      {searchOpen && (
        <div className="search-panel" style={{ padding: "10px 0", background: "#06192b", borderTop: "1px solid rgba(190, 212, 232, 0.12)" }}>
          <div className="container">
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Search size={18} color="var(--gold, #ffce6d)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên phim, diễn viên hoặc rạp chiếu..."
                autoFocus
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                className="button button-gold"
                style={{ padding: "6px 16px", minHeight: "36px", fontSize: "0.85rem" }}
              >
                Tìm kiếm
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSearchOpen(false)}
                aria-label="Đóng tìm kiếm"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
