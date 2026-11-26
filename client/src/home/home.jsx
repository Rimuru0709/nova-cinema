import { useState, useEffect, useRef } from "react";


import {
  Menu,
  X,
  Search,
  Bell,
  Crown,
  UserRound,
  Ticket,
  Play,
  ArrowRight,
  Star,
  MapPin,
  CalendarDays,
  Clock,
  Clapperboard,
  Monitor,
  Gem,
  Phone,
  Mail,
  CreditCard,
  Check,
  ShieldCheck,
  Tag,
  BadgeCheck,
  CheckCircle2,
  Wallet,
  QrCode,
  Volume2,
} from "lucide-react";

import useHome from "./useHome.jsx";
import "./home.css";

// Logo Nova Cinema
function Brand({ className = "" }) {
  return (
    <a
      className={`brand ${className}`}
      href="#trang-chu"
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
  );
}

// Cửa sổ thông tin
function Modal({ title, children, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-inner">
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        <button
          type="button"
          className="button button-gold modal-close"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </dialog>
  );
}

// Giao diện trang chủ
export default function Home({ onNavigate, onSelectShowtime, selectedMovieIdFromParent }) {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let controller;
    function loadRole() {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store', signal: request.signal })
        .then(async response => {
          const data = await response.json().catch(() => null);
          if (!request.signal.aborted) setIsAdmin(response.ok && data?.user?.role === 'admin');
        })
        .catch(() => { if (!request.signal.aborted) setIsAdmin(false); });
    }
    loadRole();
    window.addEventListener('focus', loadRole);
    return () => { controller?.abort(); window.removeEventListener('focus', loadRole); };
  }, []);
  const {
    HERO_IMAGE,
    movies,
    upcomingMovies,
    experiences,
    cinemas,
    showtimes,
    filters,
    heroMovies,

    getToday,
    formatDate,
    formatReviewCount,
    getDaysUntil,
    trailerUrl,
    hideBrokenImage,

    menuOpen,
    setMenuOpen,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    heroIndex,
    setHeroIndex,
    selectedMovieId,
    setSelectedMovieId,
    cinema,
    setCinema,
    date,
    setDate,
    time,
    setTime,
    interestedMovies,
    modal,
    setModal,

    featuredMovie,
    visibleMovies,
    catalogLoading,
    catalogError,
    retryCatalog,
    showtimesLoading,
    showtimesError,
    retryShowtimes,

    closeMenu,
    chooseMovie,
    showMovieDetail,
    previewBooking,
    toggleInterest,
    showNotifications,
    showMembership,
  } = useHome();

  useEffect(() => {
    if (selectedMovieIdFromParent) {
      setSelectedMovieId(selectedMovieIdFromParent);
    }
  }, [selectedMovieIdFromParent, setSelectedMovieId]);

  return (
    <>
      {/* HEADER */}
      <header className="site-header">
        <div className="container header-inner">
          <Brand />

          <nav
            id="main-navigation"
            className={`main-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Menu chính"
          >
            <a href="#trang-chu" onClick={closeMenu}>
              Trang chủ
            </a>

            <a
              href="#phim"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                if (onNavigate) {
                  onNavigate("movies");
                } else {
                  window.location.hash = "#phim";
                }
              }}
            >
              Phim
            </a>

            <a href="#dat-ve" onClick={closeMenu}>
              Lịch chiếu
            </a>

            <a href="#chon-combo" onClick={closeMenu}>
              Bắp nước
            </a>

            <a href="#ve-cua-toi" onClick={closeMenu}>
              Vé của tôi
            </a>

            <a href="#uu-dai" onClick={closeMenu}>
              Giá vé & Ưu đãi
            </a>

            <a href="#trai-nghiem" onClick={closeMenu}>
              Giới thiệu
            </a>

            <a href="#lien-he" onClick={closeMenu}>
              Liên hệ
            </a>
          </nav>

          <div className="header-actions">
            {isAdmin && <a className="home-admin-preview" href="#admin" aria-label="Mở trang quản trị" title="Mở bảng quản trị">
              <ShieldCheck size={16} />
              <span>Quản trị</span>
            </a>}
            <button
              type="button"
              className="icon-button"
              aria-label="Tìm kiếm phim"
              aria-expanded={searchOpen}
              aria-controls="movie-search"
              onClick={() => {
                setSearchOpen((current) => !current);
                setMenuOpen(false);
              }}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Xem phim đang quan tâm"
              onClick={showNotifications}
            >
              <Bell size={18} />

              {interestedMovies.length > 0 && (
                <span className="notification-count">
                  {interestedMovies.length}
                </span>
              )}
            </button>

            <a className="gold-tier" href="#uu-dai">
              <Crown size={14} />
              GOLD TIER
            </a>

            <a
              className="avatar-button"
              href="#tai-khoan"
              aria-label="Mở tài khoản cá nhân"
            >
              <UserRound size={18} />
            </a>

            <button
              type="button"
              className="icon-button menu-toggle"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
              onClick={() => {
                setMenuOpen((current) => !current);
                setSearchOpen(false);
              }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="search-panel" id="movie-search">
            <div className="container search-inner">
              <Search size={20} />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên phim bạn muốn xem..."
                aria-label="Tên phim cần tìm"
              />

              <a
                className="button button-gold"
                href="#phim-dang-chieu"
                onClick={() => setSearchOpen(false)}
              >
                Tìm phim
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* BANNER */}
        <section className="hero" id="trang-chu">
          <div
            className="hero-background"
            style={{
              backgroundImage: `url("${featuredMovie?.id === "dune"
                ? HERO_IMAGE
                : featuredMovie?.image || HERO_IMAGE
                }")`,
            }}
          />

          <div className="hero-overlay" />

          <div className="container hero-inner">
            <div className="hero-content">
              {featuredMovie ? (
                <>
                  <div className="hero-badges">
                    <span className="badge badge-gold badge-pill">
                      <Star size={12} fill="currentColor" />
                      KHỞI CHIẾU HÔM NAY
                    </span>

                    <span className="badge badge-dark badge-pill">
                      <Monitor size={12} />
                      {featuredMovie.imax ? "Độc quyền IMAX Laser" : featuredMovie.format || "Độc quyền IMAX Laser"}
                    </span>

                    <span className="badge badge-dark badge-pill">
                      <Volume2 size={12} />
                      Âm thanh Dolby Atmos
                    </span>

                    <span className="badge badge-dark badge-pill">
                      {featuredMovie.age} • {featuredMovie.duration} phút
                    </span>
                  </div>

                  <p className="eyebrow hero-eyebrow">SIÊU PHẨM MÀN ẢNH RỘNG 2026</p>

                  <h1 className="hero-title">{featuredMovie.title}</h1>

                  <p className="hero-description">
                    {featuredMovie.description}
                  </p>

                  <div className="hero-action-row">
                    <button
                      className="hero-cta-btn"
                      type="button"
                      onClick={() => chooseMovie(featuredMovie)}
                    >
                      <Ticket size={15} />
                      <span>ĐẶT VÉ NGAY</span>
                    </button>

                    <a
                      className="hero-trailer-btn"
                      href={featuredMovie.trailerUrl || trailerUrl(featuredMovie.title)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="trailer-play-circle">
                        <Play size={9} fill="#0b1e33" color="#0b1e33" className="play-triangle" />
                      </span>
                      <span>Xem Trailer</span>
                    </a>

                    <div
                      className="hero-pagination-capsule"
                      aria-label="Chọn banner phim"
                    >
                      {heroMovies.map((movie, index) => (
                        <button
                          key={movie.id}
                          type="button"
                          className={`hero-capsule-item ${heroIndex === index ? "is-active" : ""}`}
                          aria-pressed={heroIndex === index}
                          onClick={() => setHeroIndex(index)}
                        >
                          0{index + 1} • {movie.shortTitle || movie.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="catalog-state" role={catalogError ? "alert" : "status"}>
                  <p className="eyebrow">NOVA CINEMA</p>
                  <h1>{catalogLoading ? "Đang tải phim…" : catalogError ? "Chưa tải được danh sách phim" : "Hẹn bạn tại NOVA Cinema"}</h1>
                  <p className="hero-description">
                    {catalogLoading ? "Vui lòng chờ trong giây lát." : catalogError || "Các bộ phim đang được cập nhật. Vui lòng quay lại sau."}
                  </p>
                  {!catalogLoading && (
                    <button className="button button-gold" type="button" onClick={retryCatalog}>Tải lại danh sách phim</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ĐẶT VÉ NHANH */}
        <div className="container booking-wrapper" id="dat-ve">
          <form
            className="quick-booking"
            onSubmit={(e) => {
              e.preventDefault();
              if (!time) return;
              const target = showtimes.find((s) => String(s.id) === String(time));
              if (target) {
                if (new Date(target.startsAt).getTime() <= Date.now()) {
                  retryShowtimes();
                  alert("Suất chiếu đã bắt đầu. Vui lòng chọn một suất chiếu khác.");
                  return;
                }
                onSelectShowtime?.(target);
              } else {
                previewBooking(e);
              }
            }}
          >
            <label className="booking-field">
              <span className="booking-label">
                <Clapperboard size={14} />
                1. CHỌN PHIM
              </span>

              <select
                value={selectedMovieId}
                disabled={catalogLoading || !movies.length}
                onChange={(event) =>
                  setSelectedMovieId(event.target.value)
                }
              >
                {!movies.length && <option value="">Chưa có phim</option>}
                {movies.map((movie) => (
                  <option key={movie.id} value={movie.id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="booking-field">
              <span className="booking-label">
                <MapPin size={14} />
                2. CHỌN CỤM RẠP
              </span>

              <select
                value={cinema}
                disabled={catalogLoading || !cinemas.length}
                onChange={(event) => setCinema(event.target.value)}
              >
                {!cinemas.length && <option value="">Chưa có rạp</option>}
                {cinemas.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name} ({item.id === 1 ? "TP. HCM" : "Hà Nội"})
                  </option>
                ))}
              </select>
            </label>

            <label className="booking-field">
              <span className="booking-label">
                <CalendarDays size={14} />
                3. CHỌN NGÀY CHIẾU
              </span>

              <div className="booking-date-container">
                <span className="booking-date-text">
                  {date === getToday() ? `Hôm nay • ${formatDate(date)}` : formatDate(date)}
                </span>
                <input
                  type="date"
                  min={getToday()}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                  className="booking-date-hidden"
                />
              </div>
            </label>

            <label className="booking-field">
              <span className="booking-label">
                <Clock size={14} />
                4. CHỌN SUẤT CHIẾU
              </span>

              <select
                value={time}
                disabled={showtimesLoading || !showtimes.length}
                onChange={(event) => setTime(event.target.value)}
              >
                {!showtimes.length && <option value="">{showtimesLoading ? "Đang tải suất chiếu…" : "Chưa có suất chiếu"}</option>}
                {showtimes.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.time} • {item.format || 'IMAX'} {item.roomName}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button button-gold booking-submit-btn"
              type="submit"
              disabled={!time || showtimesLoading || Boolean(showtimesError)}
            >
              MUA VÉ NGAY
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="booking-status" aria-live="polite">
            {showtimesError ? (
              <>
                <span>{showtimesError}</span>
                <button type="button" className="text-link" onClick={retryShowtimes}>Thử lại</button>
              </>
            ) : showtimesLoading ? "Đang tải lịch chiếu…" : selectedMovieId && cinema && date && !showtimes.length ? "Không có suất chiếu còn mở cho lựa chọn này. Bạn có thể chọn ngày, rạp hoặc phim khác." : null}
          </div>
        </div>

        {/* PHIM ĐANG CHIẾU */}
        <section className="section" id="phim-dang-chieu">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  ĐANG TRÌNH CHIẾU TẠI HỆ THỐNG
                </p>

                <h2>Phim Đang Chiếu</h2>
              </div>

              <div className="filter-list" aria-label="Lọc phim">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-button ${activeFilter === filter.id ? "is-active" : ""
                      }`}
                    aria-pressed={activeFilter === filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {query && (
              <div className="search-result">
                Kết quả tìm kiếm: <strong>{query}</strong>

                <button type="button" onClick={() => setQuery("")}>
                  Xóa tìm kiếm
                </button>
              </div>
            )}

            {catalogLoading ? (
              <p className="data-message" role="status">Đang tải danh sách phim…</p>
            ) : catalogError ? (
              <div className="empty-state">
                <p>{catalogError}</p>
                <button className="button button-gold" type="button" onClick={retryCatalog}>Thử lại</button>
              </div>
            ) : visibleMovies.length > 0 ? (
              <div className="movie-grid">
                {visibleMovies.map((movie) => (
                  <article className="movie-card" key={movie.id}>
                    <div className="movie-poster">
                      <span className="poster-placeholder">
                        NOVA CINEMA
                      </span>

                      <img
                        src={movie.image}
                        alt={`Poster phim ${movie.title}`}
                        loading="lazy"
                        onError={hideBrokenImage}
                      />

                      <span
                        className={`age-badge ${movie.age === "T18"
                          ? "age-red"
                          : movie.age === "T16"
                            ? "age-gold"
                            : movie.age === "T13"
                              ? "age-orange"
                              : "age-green"
                          }`}
                      >
                        {movie.age}
                      </span>

                      <span className="format-badge">
                        {movie.format}
                      </span>

                      <div className="rating-badge">
                        <Star size={13} fill="currentColor" />
                        <strong>{movie.rating ? Number(movie.rating).toFixed(1) : "9.0"}</strong>
                        <span>({formatReviewCount(movie.reviews)})</span>
                      </div>
                    </div>

                    <div className="movie-body">
                      <p className="movie-genre">{movie.genre}</p>

                      <h3 title={movie.title}>{movie.title}</h3>

                      <p className="movie-meta">
                        {movie.duration} phút ·{" "}
                        {movie.country === "vietnam"
                          ? "Tiếng Việt"
                          : "Phụ đề Tiếng Việt"}
                      </p>

                      <div className="movie-actions">
                        <button
                          className="button button-gold"
                          type="button"
                          onClick={() => chooseMovie(movie)}
                        >
                          <Ticket size={15} />
                          Đặt vé
                        </button>

                        <button
                          className="button button-dark"
                          type="button"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate("movie-detail", movie.id, movie);
                            } else {
                              showMovieDetail(movie);
                            }
                          }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Search size={32} />

                <h3>{movies.length ? "Chưa tìm thấy phim phù hợp" : "Chưa có phim đang chiếu"}</h3>

                <p>{movies.length ? "Thử đổi từ khóa hoặc chọn một nhóm phim khác." : "Danh sách phim sẽ được cập nhật sớm."}</p>

                <button
                  className="button button-gold"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveFilter("all");
                  }}
                >
                  Hiện tất cả phim
                </button>
              </div>
            )}
          </div>
        </section>

        {/* PHIM SẮP CHIẾU */}
        <section
          className="section upcoming-section"
          id="phim-sap-chieu"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  LỊCH RA MẮT SẮP TỚI
                </p>

                <h2>Phim Sắp Khởi Chiếu</h2>
              </div>

              <a href="#phim-sap-chieu" className="text-link">
                Xem tất cả phim sắp chiếu
                <ArrowRight size={16} />
              </a>
            </div>

            <div className="upcoming-grid">
              {upcomingMovies.map((movie) => {
                const interested = interestedMovies.includes(movie.id);
                const daysLeft = getDaysUntil(movie.releaseDate);

                return (
                  <article className="upcoming-card" key={movie.id}>
                    <div className="upcoming-image">
                      <img
                        src={movie.image}
                        alt={`Poster ${movie.title}`}
                        loading="lazy"
                        onError={hideBrokenImage}
                      />

                      <span className="countdown-badge">
                        <Clock size={13} />
                        {daysLeft ? `Khởi chiếu sau ${String(daysLeft).padStart(2, "0")} ngày` : "Sắp khởi chiếu"}
                      </span>

                      <span className="release-date">
                        {formatDate(movie.releaseDate)}
                      </span>
                    </div>

                    <div className="upcoming-body">
                      <p className="movie-genre">{movie.genre}</p>

                      <h3>{movie.title}</h3>

                      <p className="upcoming-description">
                        {movie.description}
                      </p>

                      <div className="upcoming-actions">
                        <button
                          className={`button button-dark ${interested ? "is-following" : ""
                            }`}
                          type="button"
                          aria-pressed={interested}
                          onClick={() => toggleInterest(movie.id)}
                        >
                          {interested ? (
                            <Check size={15} />
                          ) : (
                            <Bell size={15} />
                          )}

                          {interested ? "Đã theo dõi" : "Nhận thông báo"}
                        </button>

                        <a
                          className="icon-button"
                          href={movie.trailerUrl || trailerUrl(movie.title)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Tìm trailer ${movie.title}`}
                        >
                          <Play size={16} />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            {!catalogLoading && !catalogError && !upcomingMovies.length && (
              <p className="data-message">Chưa có phim sắp chiếu. Vui lòng quay lại sau.</p>
            )}
          </div>
        </section>

        {/* TRẢI NGHIỆM */}
        <section
          className="section experience-section"
          id="trai-nghiem"
        >
          <div className="container">
            <div className="section-intro">
              <p className="eyebrow">
                <Gem size={14} />
                ĐẲNG CẤP ĐIỆN ẢNH VƯỢT TRỘI
              </p>

              <h2>Trải Nghiệm Thượng Lưu Tại NOVA Cinema</h2>

              <p>
                Mỗi suất chiếu tại NOVA Cinema là một hành trình thưởng thức nghệ thuật
                đỉnh cao, nơi công nghệ tối tân hội tụ cùng phong cách phục vụ chuẩn khách
                sạn 5 sao.
              </p>
            </div>

            <div className="experience-grid">
              {experiences.map((item) => (
                <article className="experience-card" key={item.title}>
                  <div className="experience-icon">
                    <item.icon size={22} />
                  </div>

                  <p className="experience-eyebrow">{item.eyebrow}</p>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <button
                    type="button"
                    className="experience-more"
                    onClick={() =>
                      setModal({
                        title: item.title,
                        content: <p>{item.description}</p>,
                      })
                    }
                  >
                    <span>{item.note}</span>
                    <CheckCircle2 size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HỘI VIÊN */}
        <section className="section membership-section" id="uu-dai">
          <div className="container">
            <div className="membership-banner">
              <div className="membership-copy">
                <div className="membership-topline">
                  <span className="badge badge-gold">
                    ĐẶC QUYỀN HỘI VIÊN 2026
                  </span>

                  <span>NOVA Elite Membership</span>
                </div>

                <h2>
                  Gia Nhập <span>NOVA Elite Club</span> —<br />
                  Thăng Hạng Phong Cách Điện Ảnh
                </h2>

                <p>
                  Tận hưởng ưu đãi đặc quyền giảm 20% khi thanh toán bằng thẻ
                  Techcombank Priority và Vietcombank Signature. Tích lũy 10%
                  điểm thưởng cho mỗi giao dịch vé và dịch vụ ẩm thực tại rạp.
                </p>

                <div className="membership-benefits">
                  <span>
                    <Tag size={17} />
                    Ưu đãi 20% F&B & Vé
                  </span>

                  <span>
                    <Ticket size={17} />
                    Đổi vé VIP miễn phí
                  </span>

                  <span>
                    <Crown size={17} />
                    Ưu tiên phục vụ Lounge
                  </span>
                </div>

                <div className="membership-buttons">
                  <a
                    className="button button-gold"
                    href="#dang-ky"
                    onClick={closeMenu}
                  >
                    ĐĂNG KÝ THÀNH VIÊN VIP
                  </a>

                  <button
                    type="button"
                    className="button button-dark"
                    onClick={showMembership}
                  >
                    Xem chi tiết ưu đãi hội viên
                  </button>
                </div>
              </div>

              <div className="membership-offers">
                <div className="offer-card">
                  <span className="offer-icon">
                    <CreditCard size={22} />
                  </span>

                  <div>
                    <h3>Techcombank Priority</h3>
                    <p>Giảm ngay 20% mỗi cuối tuần + IMAX</p>
                  </div>

                  <span className="offer-tag">HOT</span>
                </div>

                <div className="offer-card">
                  <span className="offer-icon">
                    <CreditCard size={22} />
                  </span>

                  <div>
                    <h3>Vietcombank Signature</h3>
                    <p>Mua 1 Tặng 1 Combo bắp nước VIP</p>
                  </div>

                  <span className="offer-tag">VOUCHER</span>
                </div>

                <div className="offer-card">
                  <span className="offer-icon">
                    <Crown size={22} />
                  </span>

                  <div>
                    <h3>Tích Điểm NOVA Point</h3>
                    <p>1.000 điểm = 01 vé Gold Lounge 2D</p>
                  </div>

                  <span className="offer-tag">QUY ĐỔI</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
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

              <a href="#trang-chu">Về chúng tôi</a>
              <a href="#uu-dai" onClick={showMembership}>Quy định thành viên VIP</a>
              <a href="#dieu-khoan" onClick={(e) => { e.preventDefault(); setModal({ title: "Chính sách bảo mật", content: <p>NOVA Cinema cam kết bảo mật tuyệt đối thông tin khách hàng và thông tin thanh toán theo chuẩn quốc tế.</p> }); }}>Chính sách bảo mật</a>
              <a href="#dieu-khoan" onClick={(e) => { e.preventDefault(); setModal({ title: "Điều khoản dịch vụ", content: <p>Quy định về việc đặt vé, đổi trả vé và sử dụng dịch vụ tại hệ thống rạp NOVA Cinema.</p> }); }}>Điều khoản dịch vụ</a>
            </div>

            <div className="footer-column">
              <h3>HỆ THỐNG CỤM RẠP NOVA</h3>

              {cinemas.map((item) => (
                <div className="cinema-address" key={item.id}>
                  <strong>{item.name}</strong>
                  <span>{item.address}</span>
                </div>
              ))}
              {!cinemas.length && <span className="muted">Thông tin rạp đang được cập nhật.</span>}
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

      {/* CỬA SỔ THÔNG TIN */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          {modal.content}
        </Modal>
      )}


    </>
  );
}
