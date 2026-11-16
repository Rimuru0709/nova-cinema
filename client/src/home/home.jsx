import { useEffect, useRef } from "react";

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
  Gift,
  CreditCard,
  Check,
} from "lucide-react";

import useHome from "./useHome.jsx";
import "./home.css";

// Logo
function Brand() {
  return (
    <a
      className="brand"
      href="#trang-chu"
      aria-label="Nova Cinema trang chủ"
    >
      <span className="brand-symbol">
        <Clapperboard size={25} />
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
export default function Home() {
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

            <a href="#phim-dang-chieu" onClick={closeMenu}>
              Phim
            </a>

            <a href="#dat-ve" onClick={closeMenu}>
              Lịch chiếu
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

            <button
              type="button"
              className="avatar-button"
              aria-label="Xem thông tin hội viên"
              onClick={showMembership}
            >
              <UserRound size={18} />
            </button>

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
              backgroundImage: `url("${
                featuredMovie?.id === "dune"
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
                <span className="badge badge-gold">
                  <Gem size={13} />
                  ĐIỆN ẢNH ĐỈNH CAO
                </span>

                <span className="badge badge-dark">
                  <Monitor size={13} />
                  {featuredMovie.format}
                </span>

                <span className="badge badge-dark">
                  {featuredMovie.age} · {featuredMovie.duration} phút
                </span>
              </div>

              <p className="eyebrow">SIÊU PHẨM TRÊN MÀN ẢNH RỘNG</p>

              <h1>{featuredMovie.title}</h1>

              <p className="hero-description">
                {featuredMovie.description}
              </p>

              <div className="hero-buttons">
                <button
                  className="button button-gold"
                  type="button"
                  onClick={() => chooseMovie(featuredMovie)}
                >
                  <Ticket size={18} />
                  ĐẶT VÉ NGAY
                </button>

                <a
                  className="button button-glass"
                  href={featuredMovie.trailerUrl || trailerUrl(featuredMovie.title)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Play size={17} />
                  Xem trailer
                </a>
              </div>

              <div
                className="hero-pagination"
                aria-label="Chọn banner phim"
              >
                {heroMovies.map((movie, index) => (
                  <button
                    key={movie.id}
                    type="button"
                    className={heroIndex === index ? "is-active" : ""}
                    aria-pressed={heroIndex === index}
                    onClick={() => setHeroIndex(index)}
                  >
                    <span>0{index + 1}</span>
                    {movie.shortTitle}
                  </button>
                ))}
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
          <form className="quick-booking" onSubmit={previewBooking}>
            <label className="booking-field">
              <span>
                <Clapperboard size={15} />
                PHIM
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
                    {movie.shortTitle}
                  </option>
                ))}
              </select>
            </label>

            <label className="booking-field">
              <span>
                <MapPin size={15} />
                CỤM RẠP
              </span>

              <select
                value={cinema}
                disabled={catalogLoading || !cinemas.length}
                onChange={(event) => setCinema(event.target.value)}
              >
                {!cinemas.length && <option value="">Chưa có rạp</option>}
                {cinemas.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="booking-field">
              <span>
                <CalendarDays size={15} />
                NGÀY CHIẾU
              </span>

              <input
                type="date"
                min={getToday()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>

            <label className="booking-field">
              <span>
                <Clock size={15} />
                SUẤT CHIẾU
              </span>

              <select
                value={time}
                disabled={showtimesLoading || !showtimes.length}
                onChange={(event) => setTime(event.target.value)}
              >
                {!showtimes.length && <option value="">{showtimesLoading ? "Đang tải suất chiếu…" : "Chưa có suất chiếu"}</option>}
                {showtimes.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.time} · {item.roomName} · {item.format}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button button-gold booking-submit"
              type="submit"
              disabled={!time || showtimesLoading || Boolean(showtimesError)}
            >
              CHỌN SUẤT
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
                    className={`filter-button ${
                      activeFilter === filter.id ? "is-active" : ""
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
                        className={`age-badge ${
                          movie.age === "T18" ? "age-red" : ""
                        }`}
                      >
                        {movie.age}
                      </span>

                      <span className="format-badge">
                        {movie.format}
                      </span>

                      <div className="rating-badge">
                        <Star size={13} fill="currentColor" />
                        <strong>{movie.rating}</strong>
                        <span>({movie.reviews})</span>
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
                          onClick={() => showMovieDetail(movie)}
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
                  LÊN LỊCH CHO TRẢI NGHIỆM TIẾP THEO
                </p>

                <h2>Phim Sắp Khởi Chiếu</h2>
              </div>

              <span className="text-link">
                Những câu chuyện đáng mong chờ
                <ArrowRight size={16} />
              </span>
            </div>

            <div className="upcoming-grid">
              {upcomingMovies.map((movie) => {
                const interested = interestedMovies.includes(movie.id);

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
                        Sắp khởi chiếu
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
                          className={`button button-dark ${
                            interested ? "is-following" : ""
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

                          {interested ? "Đã theo dõi" : "Theo dõi phim"}
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
                Mỗi suất chiếu là một hành trình thưởng thức nghệ thuật
                đỉnh cao, nơi công nghệ tiên tiến kết hợp cùng không
                gian và dịch vụ đầy tinh tế.
              </p>
            </div>

            <div className="experience-grid">
              {experiences.map((item) => (
                <article className="experience-card" key={item.title}>
                  <div className="experience-icon">
                    <item.icon size={26} />
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
                    {item.note}
                    <ArrowRight size={16} />
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
                    ĐẶC QUYỀN HỘI VIÊN
                  </span>

                  <span>NOVA Elite Membership</span>
                </div>

                <h2>
                  Gia Nhập <span>NOVA Elite Club</span>
                  <br />
                  Thăng Hạng Phong Cách Điện Ảnh
                </h2>

                <p>
                  Khám phá ưu đãi dành cho hội viên, tích điểm cho mỗi
                  trải nghiệm và tận hưởng những đặc quyền tại NOVA
                  Cinema.
                </p>

                <div className="membership-benefits">
                  <span>
                    <Ticket size={17} />
                    Ưu đãi vé xem phim
                  </span>

                  <span>
                    <Gift size={17} />
                    Quà tặng hội viên
                  </span>

                  <span>
                    <Crown size={17} />
                    Đặc quyền Gold Lounge
                  </span>
                </div>

                <div className="membership-buttons">
                  <button
                    type="button"
                    className="button button-gold"
                    onClick={showMembership}
                  >
                    KHÁM PHÁ THÀNH VIÊN VIP
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    className="button button-dark"
                    onClick={showMembership}
                  >
                    Xem chi tiết ưu đãi
                  </button>
                </div>
              </div>

              <div className="membership-offers">
                <div className="offer-card">
                  <span className="offer-icon">
                    <CreditCard size={22} />
                  </span>

                  <div>
                    <h3>Đối tác thanh toán</h3>
                    <p>Khám phá chương trình ưu đãi theo kỳ</p>
                  </div>

                  <span className="offer-tag">HOT</span>
                </div>

                <div className="offer-card">
                  <span className="offer-icon">
                    <Gift size={22} />
                  </span>

                  <div>
                    <h3>Quà tặng thành viên</h3>
                    <p>Voucher dành cho trải nghiệm tiếp theo</p>
                  </div>

                  <span className="offer-tag">VOUCHER</span>
                </div>

                <div className="offer-card">
                  <span className="offer-icon">
                    <Crown size={22} />
                  </span>

                  <div>
                    <h3>Tích điểm NOVA Point</h3>
                    <p>Đổi điểm để nhận thêm quyền lợi</p>
                  </div>

                  <span className="offer-tag">QUYỀN LỢI</span>
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
              <Brand />

              <p>
                Đẳng cấp điện ảnh thượng lưu. Tận hưởng không gian
                trình chiếu hiện đại cùng những trải nghiệm đáng nhớ.
              </p>

              <span className="footer-vip">
                <Crown size={16} />
                Chương trình hội viên NOVA Elite
              </span>
            </div>

            <div className="footer-column">
              <h3>KHÁM PHÁ NOVA</h3>

              <a href="#phim-dang-chieu">Phim đang chiếu</a>
              <a href="#phim-sap-chieu">Phim sắp chiếu</a>
              <a href="#trai-nghiem">Trải nghiệm điện ảnh</a>
              <a href="#uu-dai">Quyền lợi thành viên</a>

              <button type="button" onClick={showMembership}>
                Thông tin chương trình
              </button>
            </div>

            <div className="footer-column">
              <h3>HỆ THỐNG CỤM RẠP</h3>

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

              <p className="footer-contact">
                <Phone size={16} />
                Hotline đang cập nhật
              </p>

              <p className="footer-contact">
                <Mail size={16} />
                Email đang cập nhật
              </p>

              <p className="footer-contact">
                <Clock size={16} />
                08:00 – 24:00 hằng ngày
              </p>

              <div className="payment-icons">
                <CreditCard size={25} />
                <Ticket size={25} />
                <Crown size={25} />
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} NOVA CINEMA.</p>

            <p>
              Giao diện minh họa. Lịch chiếu, điểm đánh giá, thông tin
              rạp và ưu đãi là dữ liệu mẫu.
            </p>
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
