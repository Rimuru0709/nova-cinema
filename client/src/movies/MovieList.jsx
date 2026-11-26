/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Home,
  Search,
  Bell,
  Crown,
  UserRound,
  ShieldCheck,
  Menu,
  X,
  Star,
  Clock,
  Ticket,
  Info,
  RotateCcw,
  Film,
  Calendar,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Check,
  Armchair,
  Wine,
  Phone,
  Mail,
  CreditCard,
  Wallet,
  QrCode,
  BadgeCheck,
  Play,
} from "lucide-react";

import {
  MOVIES_DATA,
  FORMAT_OPTIONS,
  GENRE_OPTIONS,
  AGE_OPTIONS,
  SORT_OPTIONS,
} from "./movieData.js";
import "./movieList.css";

// Helper bỏ dấu tiếng Việt khi tìm kiếm
function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export default function MovieList({ onNavigate, onSelectMovieAndBook }) {
  // Navigation & UI States
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [interestedIds, setInterestedIds] = useState([]);
  const searchInputRef = useRef(null);

  // Filter States
  const [statusTab, setStatusTab] = useState("now_showing"); // 'now_showing' | 'coming_soon'
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("popular");
  const [formatFilter, setFormatFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");

  // Pagination States
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  // Shortcut Cmd+K / Ctrl+K để focus vào ô tìm kiếm
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Tính số lượng cho từng tab
  const totalNowShowing = useMemo(
    () => 12,
    []
  );
  const totalComingSoon = useMemo(
    () => 8,
    []
  );

  // Lọc và sắp xếp phim
  const filteredMovies = useMemo(() => {
    let result = MOVIES_DATA.filter((movie) => {
      // Lọc theo tab trạng thái
      if (statusTab === "coming_soon") {
        if (movie.status !== "coming_soon") return false;
      } else if (statusTab === "now_showing") {
        if (formatFilter !== "all" || genreFilter !== "all" || ageFilter !== "all" || searchQuery.trim()) {
          if (movie.status !== "now_showing" && movie.id !== "avatar-3") {
            return false;
          }
        }
      }

      // Lọc theo từ khóa tìm kiếm (tựa đề, shortTitle, đạo diễn, thể loại)
      if (searchQuery.trim()) {
        const q = normalize(searchQuery);
        const matchTitle = normalize(movie.title).includes(q);
        const matchShort = normalize(movie.shortTitle).includes(q);
        const matchDirector = normalize(movie.director).includes(q);
        const matchGenre = normalize(movie.genre).includes(q);
        if (!matchTitle && !matchShort && !matchDirector && !matchGenre) {
          return false;
        }
      }

      // Lọc theo Định dạng
      if (formatFilter !== "all") {
        const f = formatFilter.toLowerCase();
        const mf = (movie.format || "").toLowerCase();
        const mt = (movie.formatTag || "").toLowerCase();
        if (!mf.includes(f) && !mt.includes(f)) {
          return false;
        }
      }

      // Lọc theo Thể loại
      if (genreFilter !== "all") {
        const g = genreFilter.toLowerCase();
        const mg = (movie.genre || "").toLowerCase();
        const mgu = (movie.genreUpper || "").toLowerCase();
        if (!mg.includes(g) && !mgu.includes(g)) {
          return false;
        }
      }

      // Lọc theo Độ tuổi
      if (ageFilter !== "all") {
        if (movie.age !== ageFilter) {
          return false;
        }
      }

      return true;
    });

    // Sắp xếp
    result.sort((a, b) => {
      if (sortOption === "popular") {
        return (a.featuredOrder || 99) - (b.featuredOrder || 99);
      }
      if (sortOption === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortOption === "newest") {
        return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
      }
      if (sortOption === "duration_asc") {
        return (a.duration || 999) - (b.duration || 999);
      }
      if (sortOption === "duration_desc") {
        return (b.duration || 0) - (a.duration || 0);
      }
      return 0;
    });

    return result;
  }, [statusTab, searchQuery, sortOption, formatFilter, genreFilter, ageFilter]);

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, searchQuery, sortOption, formatFilter, genreFilter, ageFilter, pageSize]);

  // Phân trang
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMovies.slice(start, start + pageSize);
  }, [filteredMovies, currentPage, pageSize]);

  // Đặt lại tất cả bộ lọc
  function handleResetFilters() {
    setStatusTab("now_showing");
    setSearchQuery("");
    setSortOption("popular");
    setFormatFilter("all");
    setGenreFilter("all");
    setAgeFilter("all");
    setCurrentPage(1);
  }

  // Chức năng thông báo / quan tâm phim
  function toggleInterest(movie) {
    setInterestedIds((prev) => {
      const exists = prev.includes(movie.id);
      const next = exists ? prev.filter((id) => id !== movie.id) : [...prev, movie.id];
      setModal({
        title: exists ? "Đã bỏ theo dõi" : "Đã bật nhận thông báo",
        content: (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ fontSize: "14px", color: "#e2e8f0", marginBottom: "8px" }}>
              {exists
                ? `Bạn đã hủy nhận thông báo cho phim ${movie.title}.`
                : `NOVA Cinema sẽ gửi thông báo ưu tiên khi ${movie.title} mở bán suất chiếu VIP!`}
            </p>
            <span style={{ fontSize: "12px", color: "#ffce6d" }}>★ Đặc quyền NOVA Privilege</span>
          </div>
        ),
      });
      return next;
    });
  }

  // Mở modal xem thông tin chi tiết phim
  function openMovieDetail(movie) {
    if (onNavigate) {
      onNavigate("movie-detail", movie.id, movie);
      return;
    }
    setModal({
      title: movie.title,
      content: (
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <img
            src={movie.poster}
            alt={movie.title}
            onError={(e) => {
              if (movie.fallbackPoster && e.currentTarget.src !== movie.fallbackPoster) {
                e.currentTarget.src = movie.fallbackPoster;
              }
            }}
            style={{
              width: "200px",
              height: "285px",
              objectFit: "cover",
              borderRadius: "12px",
              border: "1px solid rgba(255, 206, 109, 0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          />
          <div style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px" }}>
              <span
                style={{
                  background: movie.ageColor || "#ea580c",
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "5px",
                }}
              >
                {movie.age}
              </span>
              <span
                style={{
                  border: "1px solid #ffce6d",
                  color: "#ffce6d",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "5px",
                }}
              >
                {movie.formatTag}
              </span>
              {movie.rating && (
                <span style={{ color: "#fbbf24", fontWeight: "700", fontSize: "13px" }}>
                  ★ {movie.rating}
                </span>
              )}
            </div>

            <p style={{ color: "#38bdf8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>
              {movie.genreUpper || movie.genre}
            </p>

            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "14px" }}>
              {movie.description}
            </p>

            <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "18px" }}>
              <div><strong>Đạo diễn:</strong> {movie.director || "Đang cập nhật"}</div>
              <div><strong>Thời lượng:</strong> {movie.duration ? `${movie.duration} phút` : "Sắp phát hành"}</div>
              <div><strong>Định dạng chiếu:</strong> {movie.techSub || movie.format}</div>
              <div><strong>Ngày phát hành:</strong> {movie.releaseDate || movie.releaseTag || "Sắp chiếu"}</div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {movie.actionType === "notify" ? (
                <button
                  type="button"
                  className="btn-book-notify"
                  style={{ flex: "none", padding: "0 18px" }}
                  onClick={() => toggleInterest(movie)}
                >
                  <Bell size={15} /> Nhận thông báo mở bán
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-book-primary"
                  style={{ flex: "none", padding: "0 22px" }}
                  onClick={() => {
                    setModal(null);
                    handleBookClick(movie);
                  }}
                >
                  <Ticket size={16} /> {movie.actionType === "presale" ? "Mở bán vé trước" : "Đặt vé ngay"}
                </button>
              )}

              {movie.trailerUrl && (
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-dark"
                  style={{ height: "40px", fontSize: "12px", borderRadius: "9px" }}
                >
                  <Play size={15} /> Xem Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    });
  }

  // Xử lý khi nhấn nút Đặt vé ngay
  function handleBookClick(movie) {
    if (onSelectMovieAndBook) {
      onSelectMovieAndBook(movie);
    } else if (onNavigate) {
      onNavigate("home", "#dat-ve");
    } else {
      window.location.hash = "#dat-ve";
    }
  }

  // Modal Gold Tier VIP
  function openVipModal() {
    setModal({
      title: "NOVA VIP Privilege Club",
      content: (
        <div>
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <Crown size={40} color="#ffce6d" style={{ margin: "0 auto 8px" }} />
            <h3 style={{ fontSize: "17px", color: "#ffce6d", marginBottom: "6px" }}>Đặc Quyền Hội Viên Thượng Lưu</h3>
            <p style={{ fontSize: "13px", color: "#cbd5e1" }}>
              Nâng tầm trải nghiệm điện ảnh với các tiện nghi riêng biệt và dịch vụ đẳng cấp hoàng gia.
            </p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e2e8f0" }}>
              <Check size={16} color="#ffce6d" /> Đặt trước ghế Sweetbox & giường nằm 72 giờ
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e2e8f0" }}>
              <Check size={16} color="#ffce6d" /> Miễn phí sử dụng NOVA VIP Gold Lounge cùng trà chiều
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e2e8f0" }}>
              <Check size={16} color="#ffce6d" /> Tặng 2 vé IMAX Laser 4K hàng năm khi gia hạn thẻ
            </li>
          </ul>
        </div>
      ),
    });
  }

  // Modal Danh sách phim quan tâm
  function openInterestedModal() {
    const list = MOVIES_DATA.filter((m) => interestedIds.includes(m.id));
    setModal({
      title: "Phim Bạn Đang Quan Tâm",
      content: list.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {list.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "rgba(15,30,48,0.7)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <img
                  src={m.poster}
                  alt={m.title}
                  style={{ width: "36px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                />
                <div>
                  <strong style={{ color: "#fff", fontSize: "13px" }}>{m.title}</strong>
                  <div style={{ fontSize: "11px", color: "#38bdf8" }}>{m.formatTag}</div>
                </div>
              </div>
              <button
                type="button"
                className="chip-btn"
                style={{ fontSize: "11px", color: "#ef4444" }}
                onClick={() => toggleInterest(m)}
              >
                Hủy
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "16px 0" }}>
          Bạn chưa đăng ký thông báo phim nào. Nhấn “Nhận thông báo mở bán” trên thẻ phim để nhận tin sớm nhất!
        </p>
      ),
    });
  }

  return (
    <div className="movie-list-page">
      {/* =====================================================
          SITE HEADER
          ===================================================== */}
      <header className="site-header">
        <div className="container header-inner">
          {/* Logo Brand */}
          <a
            className="brand"
            href="#trang-chu"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate("home", "#trang-chu");
              else window.location.hash = "#trang-chu";
            }}
            aria-label="Nova Cinema trang chủ"
          >
            <span className="brand-symbol">
              <img
                src="/nova-icon.png"
                alt="Nova Cinema Logo"
                className="brand-icon-img"
              />
            </span>
            <span className="brand-text">
              <strong>NOVA CINEMA</strong>
              <small>LUXURY EXPERIENCE</small>
            </span>
          </a>

          {/* Navigation Bar */}
          <nav
            id="main-navigation"
            className={`main-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Menu chính"
          >
            <a
              href="#trang-chu"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) onNavigate("home", "#trang-chu");
                else window.location.hash = "#trang-chu";
              }}
            >
              Trang chủ
            </a>

            {/* Phim: đang ở trang Danh sách phim, cuộn lên đầu */}
            <a
              href="#phim"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Phim
            </a>

            <a
              href="#dat-ve"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) onNavigate("home", "#dat-ve");
                else window.location.hash = "#dat-ve";
              }}
            >
              Lịch chiếu
            </a>

            <a
              href="#uu-dai"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) onNavigate("home", "#uu-dai");
                else window.location.hash = "#uu-dai";
              }}
            >
              Giá vé & Ưu đãi
            </a>

            <a
              href="#trai-nghiem"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) onNavigate("home", "#trai-nghiem");
                else window.location.hash = "#trai-nghiem";
              }}
            >
              Giới thiệu
            </a>

            <a
              href="#lien-he"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) onNavigate("home", "#lien-he");
                else window.location.hash = "#lien-he";
              }}
            >
              Liên hệ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="header-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Tìm kiếm phim"
              onClick={() => searchInputRef.current?.focus()}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Xem phim đang quan tâm"
              onClick={openInterestedModal}
            >
              <Bell size={18} />
              {interestedIds.length > 0 && (
                <span className="notification-count">{interestedIds.length}</span>
              )}
            </button>

            <button
              type="button"
              className="gold-tier"
              onClick={openVipModal}
            >
              <Crown size={14} />
              GOLD TIER
            </button>

            <button
              type="button"
              className="avatar-button"
              aria-label="Xem thông tin hội viên"
              onClick={openVipModal}
            >
              <UserRound size={18} />
            </button>

            <button
              type="button"
              className="icon-button menu-toggle"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT AREA
          ===================================================== */}
      <main className="movie-list-content">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="catalog-breadcrumbs" aria-label="Breadcrumb">
            <a
              href="#trang-chu"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("home", "#trang-chu");
                else window.location.hash = "#trang-chu";
              }}
            >
              <Home size={14} />
              <span>Trang chủ</span>
            </a>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Danh sách phim</span>
          </nav>

          {/* Catalog Page Header */}
          <div className="catalog-header">
            <div className="catalog-header-left">
              <span className="catalog-eyebrow">
                <span className="catalog-eyebrow-line"></span>
                CATALOG ĐIỆN ẢNH ĐỘC QUYỀN
              </span>
              <h1 className="catalog-title">
                Kho Phim Điện Ảnh <span className="catalog-title-italic">Đỉnh Cao</span>
              </h1>
            </div>

            {/* Badges thông số bên phải gộp chung thành 1 khung bo góc như ảnh 2 */}
            <div className="header-stat-capsule">
              <div className="stat-capsule-item">
                <div className="stat-icon-gold">
                  <Film size={18} />
                </div>
                <div className="stat-capsule-text">
                  <span className="stat-label-gold">SUẤT CHIẾU HÔM NAY</span>
                  <div className="stat-val-group">
                    <span className="stat-num-blue">64</span>
                    <span className="stat-txt-white">Khung giờ</span>
                  </div>
                </div>
              </div>

              <div className="stat-capsule-divider" />

              <div className="stat-capsule-item">
                <div className="stat-icon-blue">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Dolby Atmos"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 17l4-10 4 10" />
                    <path d="M9.5 13h5" />
                  </svg>
                </div>
                <div className="stat-capsule-text">
                  <span className="stat-label-blue">CHUẨN CÔNG NGHỆ</span>
                  <div className="stat-val-group">
                    <span className="stat-num-blue">IMAX Laser</span>
                    <span className="stat-txt-white">• Atmos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              PRIMARY TOOLBAR (Tabs, Search, Sort)
              ===================================================== */}
          <div className="catalog-toolbar">
            {/* Status Tabs: Đang Chiếu vs Sắp Khởi Chiếu */}
            <div className="status-tabs" role="tablist">
              <button
                type="button"
                className={`tab-pill ${statusTab === "now_showing" ? "active" : ""}`}
                onClick={() => setStatusTab("now_showing")}
              >
                <Ticket size={16} />
                <span>Đang Chiếu</span>
                <span className="tab-count">{totalNowShowing}</span>
              </button>

              <button
                type="button"
                className={`tab-pill ${statusTab === "coming_soon" ? "active" : ""}`}
                onClick={() => setStatusTab("coming_soon")}
              >
                <Calendar size={16} />
                <span>Sắp Khởi Chiếu</span>
                <span className="tab-count">{totalComingSoon}</span>
              </button>
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="toolbar-right">
              <div className="search-input-wrapper">
                <Search size={16} className="search-input-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="catalog-search-input"
                  placeholder="Tìm phim theo tựa đề, đạo diễn Christopher Nolan, d..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-shortcut-badge">⌘K</span>
              </div>

              <div className="sort-wrapper">
                <span className="sort-label">Sắp xếp:</span>
                <select
                  className="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Sắp xếp danh sách phim"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* =====================================================
              SECONDARY FILTERS PANEL
              ===================================================== */}
          <div className="secondary-filter-panel">
            {/* Hàng 1: Định dạng */}
            <div className="filter-row">
              <span className="filter-row-label">
                <Layers size={13} className="filter-row-label-icon" />
                ĐỊNH DẠNG:
              </span>
              <div className="filter-pills">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    className={`chip-btn ${formatFilter === fmt.id ? "active" : ""}`}
                    onClick={() => setFormatFilter(fmt.id)}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hàng 2: Thể loại */}
            <div className="filter-row">
              <span className="filter-row-label">
                <Sparkles size={13} className="filter-row-label-icon" />
                THỂ LOẠI:
              </span>
              <div className="filter-pills">
                {GENRE_OPTIONS.map((gnr) => (
                  <button
                    key={gnr.id}
                    type="button"
                    className={`chip-btn ${genreFilter === gnr.id ? "active" : ""}`}
                    onClick={() => setGenreFilter(gnr.id)}
                  >
                    {gnr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hàng 3: Độ tuổi & Tổng số lượng / Nút đặt lại */}
            <div className="filter-row">
              <span className="filter-row-label">
                <ShieldCheck size={13} className="filter-row-label-icon" />
                ĐỘ TUỔI:
              </span>
              <div className="filter-pills">
                {AGE_OPTIONS.map((age) => (
                  <button
                    key={age.id}
                    type="button"
                    className={`chip-btn ${ageFilter === age.id ? "active" : ""}`}
                    onClick={() => setAgeFilter(age.id)}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thống kê và Reset */}
            <div className="filter-summary-row">
              <span>
                Đang hiển thị <strong>{paginatedMovies.length}</strong> trong số{" "}
                <strong>{filteredMovies.length}</strong> tác phẩm
              </span>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} />
                Đặt lại bộ lọc
              </button>
            </div>
          </div>

          {/* =====================================================
              MOVIE CARDS GRID
              ===================================================== */}
          {paginatedMovies.length > 0 ? (
            <div className="movie-grid">
              {paginatedMovies.map((movie) => (
                <article key={movie.id} className="movie-card">
                  {/* Poster Box */}
                  <div
                    className="movie-poster-box"
                    style={{ cursor: "pointer" }}
                    onClick={() => openMovieDetail(movie)}
                  >
                    <img
                      src={movie.poster}
                      alt={`Poster ${movie.title}`}
                      className="movie-poster-img"
                      loading="lazy"
                      onError={(e) => {
                        if (
                          movie.fallbackPoster &&
                          e.currentTarget.src !== movie.fallbackPoster
                        ) {
                          e.currentTarget.src = movie.fallbackPoster;
                        }
                      }}
                    />

                    {/* Top Overlays: Age chip + Format Tag + Rating */}
                    <div className="poster-top-overlay">
                      <div className="poster-top-left">
                        <span
                          className="age-badge"
                          style={{ background: movie.ageColor || "#ea580c" }}
                        >
                          {movie.age}
                        </span>
                        {movie.formatTag && (
                          <span className="format-tag-pill">
                            {movie.formatTag}
                          </span>
                        )}
                        {movie.specialBadge && (
                          <span className="special-sub-badge">
                            {movie.specialBadge}
                          </span>
                        )}
                      </div>

                      {movie.rating ? (
                        <div className="poster-rating-badge">
                          <Star size={12} className="star-icon" fill="#fbbf24" />
                          <span>{movie.rating}</span>
                        </div>
                      ) : movie.releaseTag ? (
                        <div className="poster-release-tag">
                          <span>{movie.releaseTag}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Bottom Overlay on Poster: Duration & Subtitle/Tech */}
                    <div className="poster-bottom-bar">
                      <span className="poster-duration">
                        <Clock size={12} />
                        {movie.duration ? `${movie.duration} phút` : "Sắp phát hành"}
                      </span>
                      <span className="poster-tech-sub" title={movie.techSub}>
                        {movie.techSub}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="movie-card-body">
                    <span className="movie-genre-line" title={movie.genreUpper}>
                      {movie.genreUpper || movie.genre}
                    </span>

                    <h3
                      className="movie-card-title"
                      title={movie.title}
                      style={{ cursor: "pointer" }}
                      onClick={() => openMovieDetail(movie)}
                    >
                      {movie.title}
                    </h3>

                    <p className="movie-card-desc" title={movie.description}>
                      {movie.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="movie-card-actions">
                      {movie.actionType === "notify" ? (
                        <button
                          type="button"
                          className="btn-book-notify"
                          onClick={() => toggleInterest(movie)}
                        >
                          <Bell size={14} />
                          Nhận thông báo mở bán
                        </button>
                      ) : movie.actionType === "presale" ? (
                        <button
                          type="button"
                          className="btn-book-primary"
                          onClick={() => handleBookClick(movie)}
                        >
                          <Ticket size={15} />
                          Mở bán vé trước
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-book-primary"
                          onClick={() => handleBookClick(movie)}
                        >
                          <Ticket size={15} />
                          Đặt vé ngay
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-info-circle"
                        aria-label={`Xem thông tin chi tiết ${movie.title}`}
                        onClick={() => openMovieDetail(movie)}
                      >
                        <Info size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <Film size={44} className="empty-state-icon" />
              <h3 className="empty-state-title">Không tìm thấy phim phù hợp</h3>
              <p className="empty-state-desc">
                Rất tiếc, không có phim nào khớp với bộ lọc của bạn. Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác.
              </p>
              <button
                type="button"
                className="button button-gold"
                onClick={handleResetFilters}
              >
                <RotateCcw size={15} /> Đặt lại bộ lọc
              </button>
            </div>
          )}

          {/* =====================================================
              PAGINATION BAR
              ===================================================== */}
          <div className="catalog-pagination-bar">
            {/* Hiển thị mỗi trang */}
            <div className="page-size-selector">
              <span>Hiển thị mỗi trang:</span>
              {[12, 24, 48].map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-pill ${pageSize === size || (pageSize === 8 && size === 12) ? "active" : ""}`}
                  onClick={() => setPageSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
              <button
                type="button"
                className="page-num-btn"
                aria-label="Trang trước"
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                className={`page-num-btn ${currentPage === 1 ? "active" : ""}`}
                onClick={() => {
                  setCurrentPage(1);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                1
              </button>

              <button
                type="button"
                className={`page-num-btn ${currentPage === 2 ? "active" : ""}`}
                onClick={() => {
                  setCurrentPage(2);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                2
              </button>

              <button
                type="button"
                className={`page-num-btn ${currentPage === 3 ? "active" : ""}`}
                onClick={() => {
                  setCurrentPage(3);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                3
              </button>

              <span className="page-dots">...</span>

              <button
                type="button"
                className={`page-num-btn ${currentPage === 8 ? "active" : ""}`}
                onClick={() => {
                  setCurrentPage(8);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                8
              </button>

              <button
                type="button"
                className="page-num-btn"
                aria-label="Trang sau"
                disabled={currentPage >= 8}
                onClick={() => {
                  setCurrentPage((p) => Math.min(8, p + 1));
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Thống kê trang */}
            <div className="page-summary-info">
              Trang {currentPage} / 8 (Tổng {filteredMovies.length} tác phẩm)
            </div>
          </div>

          {/* =====================================================
              VIP PRIVILEGE CLUB BANNER
              ===================================================== */}
          <section className="vip-privilege-banner" aria-label="Ưu đãi VIP">
            <div className="vip-banner-content">
              <span className="vip-badge-eyebrow">
                <Crown size={14} />
                NOVA VIP PRIVILEGE CLUB
              </span>

              <h2 className="vip-banner-title">
                Đặc Quyền Đặt Vé Sớm & Giữ Ghế Sweetbox Hạng Nhất
              </h2>

              <p className="vip-banner-desc">
                Hội viên Gold & Diamond nhận ưu đãi mở cổng đặt vé trước 72 giờ đối với các bom tấn chiếu định dạng IMAX Laser GT, miễn phí nâng cấp gói ẩm thực Fine Dining tại NOVA VIP Lounge.
              </p>

              <div className="vip-perks-row">
                <div className="vip-perk-item">
                  <BadgeCheck size={17} />
                  <span>Không xếp hàng đón tiếp</span>
                </div>
                <div className="vip-perk-item">
                  <Armchair size={16} />
                  <span>Ghế đôi bọc da thủ công</span>
                </div>
                <div className="vip-perk-item">
                  <Wine size={16} />
                  <span>Cocktail & Finger Food cao cấp</span>
                </div>
              </div>
            </div>

            <div className="vip-banner-cta">
              <button
                type="button"
                className="btn-vip-register"
                onClick={openVipModal}
              >
                Đăng Ký Thẻ VIP Hội Viên →
              </button>
              <span className="vip-cta-note">
                Nhận ngay 2 vé IMAX miễn phí khi kích hoạt
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* =====================================================
          SITE FOOTER
          ===================================================== */}
      <footer className="site-footer" id="lien-he">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-brand-header">
                <span className="footer-brand-symbol">
                  <img
                    src="/nova-icon.png"
                    alt="NOVA CINEMA"
                    className="footer-brand-img"
                  />
                </span>
                <div className="footer-brand-title">
                  <span>NOVA</span>
                  <span>CINEMA</span>
                </div>
              </div>

              <p>
                Đẳng cấp điện ảnh thượng lưu. Tận hưởng không gian
                trình chiếu IMAX Laser, Dolby Atmos chuẩn quốc tế cùng
                đặc quyền ẩm thực VIP Lounge thượng hạng.
              </p>

              <div className="footer-badge">
                <BadgeCheck size={18} className="footer-badge-icon" />
                <span>Chứng nhận tiêu chuẩn rạp VIP 2025</span>
              </div>
            </div>

            <div className="footer-column">
              <h3>KHÁM PHÁ & ĐIỀU KHOẢN</h3>
              <a
                href="#trang-chu"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate("home", "#trang-chu");
                  else window.location.hash = "#trang-chu";
                }}
              >
                Về chúng tôi
              </a>
              <a
                href="#uu-dai"
                onClick={(e) => {
                  e.preventDefault();
                  openVipModal();
                }}
              >
                Quy định thành viên VIP
              </a>
              <a
                href="#dieu-khoan"
                onClick={(e) => {
                  e.preventDefault();
                  setModal({
                    title: "Chính sách bảo mật",
                    content: (
                      <p>
                        NOVA Cinema cam kết bảo mật tuyệt đối thông tin khách hàng và thông tin thanh toán theo chuẩn quốc tế.
                      </p>
                    ),
                  });
                }}
              >
                Chính sách bảo mật
              </a>
              <a
                href="#dieu-khoan"
                onClick={(e) => {
                  e.preventDefault();
                  setModal({
                    title: "Điều khoản dịch vụ",
                    content: (
                      <p>
                        Quy định về việc đặt vé, đổi trả vé và sử dụng dịch vụ tại hệ thống rạp NOVA Cinema.
                      </p>
                    ),
                  });
                }}
              >
                Điều khoản dịch vụ
              </a>
            </div>

            <div className="footer-column">
              <h3>HỆ THỐNG CỤM RẠP NOVA</h3>
              <div className="cinema-address">
                <strong>NOVA Landmark 81</strong>
                <span>Tầng B1, TTTM Vincom Landmark 81, TP. HCM</span>
              </div>
              <div className="cinema-address">
                <strong>NOVA Westlake</strong>
                <span>Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội</span>
              </div>
              <div className="cinema-address">
                <strong>NOVA Vincom Bà Triệu</strong>
                <span>Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội</span>
              </div>
            </div>

            <div className="footer-column">
              <h3>LIÊN HỆ & HỖ TRỢ</h3>
              <div className="footer-contact-item">
                <Phone size={18} className="footer-contact-icon" />
                <div className="footer-contact-text">
                  <span className="contact-label">Hotline Chăm sóc VIP (24/7)</span>
                  <strong className="contact-phone">1900 6868</strong>
                </div>
              </div>

              <div className="footer-contact-item">
                <Mail size={18} className="footer-contact-icon" />
                <span className="contact-value">contact@novacinema.vn</span>
              </div>

              <div className="footer-contact-item">
                <Clock size={18} className="footer-contact-icon" />
                <span className="contact-value">08:00 - 24:00 hàng ngày</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 NOVA CINEMA JSC. All rights reserved. Trải nghiệm điện ảnh chuẩn Hoàng gia.</p>

            <div className="footer-safe-payment">
              <span>Thanh toán an toàn:</span>
              <div className="payment-mini-icons">
                <CreditCard size={18} />
                <Wallet size={18} />
                <QrCode size={18} />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================
          MODAL
          ===================================================== */}
      {modal && (
        <dialog
          className="modal"
          open
          onCancel={(e) => {
            e.preventDefault();
            setModal(null);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="modal-inner">
            <div className="modal-header">
              <h2>{modal.title}</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setModal(null)}
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">{modal.content}</div>
            <button
              type="button"
              className="button button-gold modal-close"
              onClick={() => setModal(null)}
            >
              Đóng
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
