import { useState, useRef, useEffect, useMemo } from "react";
import {
  Home,
  Search,
  Bell,
  Crown,
  UserRound,
  ShieldCheck,
  Star,
  Clock,
  Ticket,
  ChevronRight,
  ChevronLeft,
  Check,
  Wine,
  Volume2,
  Share2,
  Play,
  Heart,
  ThumbsUp,
  Monitor,
  Globe,
  Film,
  Sparkles,
  Menu,
  X,
  BadgeCheck,
  SquarePen,
} from "lucide-react";

import { MOVIES_DATA } from "./movieData.js";
import {
  getYoutubeId,
  getCastForMovie,
  getReviewsForMovie,
  getRatingMetaForMovie,
} from "./movieDetailData.js";
import "../home/home.css";
import "./movieDetail.css";

// Dữ liệu ngày chiếu
const SHOW_DATES = [
  { id: "2026-10-26", day: "26/10", tag: "HÔM NAY", weekday: "Thứ Bảy" },
  { id: "2026-10-27", day: "27/10", tag: "NGÀY MAI", weekday: "Chủ Nhật" },
  { id: "2026-10-28", day: "28/10", tag: "THỨ HAI", weekday: "Tiêu chuẩn" },
  { id: "2026-10-29", day: "29/10", tag: "THỨ BA", weekday: "Ngày hội Phim" },
  { id: "2026-10-30", day: "30/10", tag: "THỨ TƯ", weekday: "Tiêu chuẩn" },
  { id: "2026-10-31", day: "31/10", tag: "THỨ NĂM", weekday: "Tiêu chuẩn" },
];

// Danh sách cụm rạp
const CINEMA_LOCATIONS = [
  { id: "landmark", name: "NOVA Landmark 81 (TP.HCM) (3 Phòng)" },
  { id: "westlake", name: "NOVA Westlake (Hà Nội)" },
  { id: "vincom", name: "NOVA Vincom Bà Triệu (Hà Nội)" },
];

// Dữ liệu phòng chiếu và các suất chiếu
const HALLS_DATA = [
  {
    id: "hall-imax",
    name: "Phòng chiếu IMAX Laser Grand 01",
    tag: "1.43:1 DUAL",
    desc: "Màn hình cong vòm 28 x 21m • Hệ thống âm thanh 12 kênh độc quyền • Ghế da đệm Microfiber",
    minPrice: "210.000 đ",
    slots: [
      { id: "s1", time: "10:30", type: "12 Phụ đề", seats: "Còn 84/145 ghế", price: "210k", priceNum: 210000, almostOut: false },
      { id: "s2", time: "13:45", type: "12 Phụ đề", seats: "Còn 42/145 ghế", price: "210k", priceNum: 210000, almostOut: false },
      { id: "s3", time: "16:30", type: "12 Phụ đề", seats: "Còn 35/145 ghế", price: "210k", priceNum: 210000, almostOut: false },
      { id: "s4", time: "19:30", type: "Sắp hết", seats: "Chỉ còn 8 ghế", price: "240k", priceNum: 240000, almostOut: true },
      { id: "s5", time: "22:15", type: "Suất đêm", seats: "Còn 78/145 ghế", price: "190k", priceNum: 190000, almostOut: false },
    ],
  },
  {
    id: "hall-vip",
    name: "Phòng VIP Gold Lounge & Suites",
    tag: "BUTLER & WINE SERVICE",
    desc: "Ghế Sofa đôi bọc nhung cao cấp • Phục vụ rượu vang, đồ ăn nhẹ theo yêu cầu tại chỗ",
    minPrice: "350.000 đ",
    slots: [
      { id: "s6", time: "11:15", type: "VIP 2D", seats: "Còn 14/30 ghế", price: "350k", priceNum: 350000, almostOut: false },
      { id: "s7", time: "14:30", type: "VIP 2D", seats: "Còn 12/30 ghế", price: "350k", priceNum: 350000, almostOut: false },
      { id: "s8", time: "17:45", type: "VIP 2D", seats: "Còn 19/30 ghế", price: "350k", priceNum: 350000, almostOut: false },
      { id: "s9", time: "20:30", type: "VIP 2D", seats: "Còn 6/30 ghế", price: "380k", priceNum: 380000, almostOut: false },
    ],
  },
  {
    id: "hall-dolby",
    name: "Phòng Dolby Atmos 3D Hall 04",
    tag: "DOLBY 3D",
    desc: "Hệ thống âm thanh đa chiều 64 loa độc lập • Kính 3D siêu nhẹ chống mỏi mắt",
    minPrice: "160.000 đ",
    slots: [
      { id: "s10", time: "09:45", type: "3D Atmos", seats: "Còn 92/170 ghế", price: "160k", priceNum: 160000, almostOut: false },
      { id: "s11", time: "12:30", type: "3D Atmos", seats: "Còn 66/170 ghế", price: "170k", priceNum: 170000, almostOut: false },
      { id: "s12", time: "15:15", type: "3D Atmos", seats: "Còn 47/170 ghế", price: "170k", priceNum: 170000, almostOut: false },
      { id: "s13", time: "18:45", type: "3D Atmos", seats: "Còn 19/170 ghế", price: "185k", priceNum: 185000, almostOut: false },
      { id: "s14", time: "21:30", type: "3D Atmos", seats: "Còn 61/170 ghế", price: "160k", priceNum: 160000, almostOut: false },
    ],
  },
];

export default function MovieDetail({ movieId = "dune-2", onNavigate, onSelectMovieAndBook, initialMovie = null }) {
  // Tìm thông tin phim hiện tại (mặc định lấy Dune 2 nếu không tìm thấy)
  const currentMovie = useMemo(() => {
    const targetId = String(movieId || "").toLowerCase().trim();

    // Kiểm tra xem initialMovie có đúng là phim đang xem (hoặc alias) không
    const isMatchingInitial =
      initialMovie &&
      (!targetId ||
        initialMovie.id === movieId ||
        String(initialMovie.id || "").toLowerCase() === targetId ||
        (initialMovie.id === "dune" && targetId === "dune-2") ||
        (initialMovie.id === "dune-2" && targetId === "dune") ||
        (initialMovie.id === "godzilla" && targetId === "godzilla-kong") ||
        (initialMovie.id === "godzilla-kong" && targetId === "godzilla") ||
        (initialMovie.id === "deadpool" && targetId === "deadpool-wolverine") ||
        (initialMovie.id === "deadpool-wolverine" && targetId === "deadpool") ||
        (initialMovie.id === "joker" && targetId === "joker-2") ||
        (initialMovie.id === "joker-2" && targetId === "joker") ||
        (initialMovie.id === "gladiator" && targetId === "gladiator-2") ||
        (initialMovie.id === "gladiator-2" && targetId === "gladiator"));

    if (isMatchingInitial) {
      const staticMatch = MOVIES_DATA.find((m) =>
        m.id === initialMovie.id ||
        (m.id === "dune-2" && initialMovie.id === "dune") ||
        (m.id === "godzilla-kong" && initialMovie.id === "godzilla") ||
        (m.id === "deadpool-wolverine" && initialMovie.id === "deadpool") ||
        (m.title && initialMovie.title && m.title.toLowerCase().includes(initialMovie.title.toLowerCase()))
      );
      return {
        ...(staticMatch || {}),
        ...initialMovie,
        trailerUrl: initialMovie.trailerUrl || staticMatch?.trailerUrl || (initialMovie.id === "mai" || initialMovie.title?.toLowerCase().includes("mai") ? "https://www.youtube.com/watch?v=EX6clvId19s" : undefined),
        rating: initialMovie.rating !== undefined && initialMovie.rating !== null ? initialMovie.rating : (staticMatch?.rating || 9.1),
        reviews: initialMovie.reviews !== undefined && initialMovie.reviews !== null ? initialMovie.reviews : (staticMatch?.reviews || 12000),
      };
    }

    // Nếu không khớp initialMovie, tra cứu trực tiếp theo targetId trong MOVIES_DATA
    const found = MOVIES_DATA.find((m) => {
      const mId = String(m.id).toLowerCase();
      return (
        mId === targetId ||
        (mId === "dune-2" && targetId === "dune") ||
        (mId === "godzilla-kong" && targetId === "godzilla") ||
        (mId === "deadpool-wolverine" && targetId === "deadpool") ||
        (mId === "joker-2" && targetId === "joker") ||
        (mId === "gladiator-2" && targetId === "gladiator") ||
        (mId === "lat-mat-7" && targetId === "lat-mat") ||
        mId.startsWith(targetId) ||
        targetId.startsWith(mId)
      );
    });

    return found || MOVIES_DATA[0];
  }, [movieId, initialMovie]);

  // YouTube Trailer ID chuyên biệt cho phim hiện tại
  const youtubeId = useMemo(() => {
    return getYoutubeId(currentMovie, currentMovie.id);
  }, [currentMovie]);

  // Dàn diễn viên & ê-kíp sản xuất riêng theo phim hiện tại
  const castList = useMemo(() => {
    return getCastForMovie(currentMovie);
  }, [currentMovie]);

  // Thông số đánh giá & phân bổ sao theo phim hiện tại
  const ratingMeta = useMemo(() => {
    return getRatingMetaForMovie(currentMovie);
  }, [currentMovie]);

  // Danh sách đánh giá của phim hiện tại
  const [reviewsList, setReviewsList] = useState(() => getReviewsForMovie(currentMovie));

  // Cập nhật reviews khi đổi phim
  useEffect(() => {
    setReviewsList(getReviewsForMovie(currentMovie));
  }, [currentMovie]);

  // States tương tác
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() =>
    Math.round(20000 + (currentMovie.rating || 9) * 1200)
  );
  const [selectedDate, setSelectedDate] = useState("2026-10-26");
  const [selectedCinema, setSelectedCinema] = useState("landmark");
  const [selectedSlot, setSelectedSlot] = useState({
    hallName: "Phòng chiếu IMAX Laser Grand 01",
    slotTime: "13:45",
    price: "210.000 đ",
    priceNum: 210000,
  });

  // Reset trạng thái yêu thích & cuộn lên đầu trang khi đổi phim
  useEffect(() => {
    setIsLiked(false);
    setLikeCount(Math.round(20000 + (currentMovie.rating || 9) * 1200));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentMovie.id]);

  // Modal & Toast states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({ author: "", score: "10", content: "" });
  const [toastMessage, setToastMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const showtimesRef = useRef(null);

  // Danh sách các phim tương tự (loại bỏ phim hiện tại)
  const similarMovies = useMemo(() => {
    const others = MOVIES_DATA.filter((m) => m.id !== currentMovie.id);
    const sameGenre = others.filter((m) => m.genre === currentMovie.genre);
    const combined = [...sameGenre, ...others];
    const unique = Array.from(new Set(combined.map((m) => m.id))).map((id) =>
      combined.find((m) => m.id === id)
    );
    return unique.slice(0, 3);
  }, [currentMovie.id, currentMovie.genre]);

  // Hiển thị thông báo Toast
  function triggerToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  }

  // Xử lý bấm Yêu thích
  function handleToggleFavorite() {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
      triggerToast(`Đã xóa "${currentMovie.title}" khỏi danh sách yêu thích`);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      triggerToast(`❤️ Đã thêm "${currentMovie.title}" vào phim Yêu thích!`);
    }
  }

  // Xử lý bấm Chia sẻ
  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("🔗 Đã sao chép liên kết phim vào clipboard!");
    } else {
      triggerToast("🔗 Đã chia sẻ liên kết phim!");
    }
  }

  // Cuộn tới phần Đặt vé & Lịch chiếu
  function scrollToBooking() {
    if (showtimesRef.current) {
      showtimesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Xử lý khi bấm nút "Chọn Suất & Ghế" ở thanh Sticky Bar
  function handleStickyBookClick() {
    if (onSelectMovieAndBook) {
      onSelectMovieAndBook({
        ...currentMovie,
        selectedSlot,
        selectedDate,
        selectedCinema,
      });
    } else {
      scrollToBooking();
      triggerToast(`Đã chọn suất ${selectedSlot.slotTime} (${selectedSlot.hallName}). Đang chuyển tới đặt ghế...`);
    }
  }

  // Xử lý gửi nhận xét mới
  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewFormData.author.trim() || !reviewFormData.content.trim()) {
      alert("Vui lòng điền họ tên và nội dung đánh giá!");
      return;
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewFormData.author,
      tier: "THÀNH VIÊN NOVA",
      hallSeen: "Đã xem tại rạp",
      score: `${reviewFormData.score} / 10`,
      content: reviewFormData.content,
      time: "Vừa xong",
      likes: 1,
    };
    setReviewsList([newRev, ...reviewsList]);
    setShowReviewModal(false);
    setReviewFormData({ author: "", score: "10", content: "" });
    triggerToast("✨ Cảm ơn bạn! Đánh giá đã được đăng thành công.");
  }

  // Xử lý bấm thích 1 bình luận
  function handleLikeReview(revId) {
    setReviewsList((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, likes: r.likes + 1, liked: true } : r))
    );
  }

  return (
    <div className="movie-detail-page">
      {/* TOAST THÔNG BÁO */}
      {toastMessage && (
        <div className="detail-toast">
          <Sparkles size={16} color="#ffce6d" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* THANH ĐIỀU HƯỚNG ĐỒNG BỘ 100% TRANG CHỦ */}
      <header className="site-header">
        <div className="container header-inner">
          {/* LOGO BRAND */}
          <a
            className="brand"
            href="#trang-chu"
            aria-label="Nova Cinema trang chủ"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate("home", "#trang-chu");
              else window.location.hash = "#trang-chu";
            }}
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

          {/* NAV LINKS */}
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

            <a
              href="#phim"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                if (onNavigate) {
                  onNavigate("movies");
                } else {
                  window.location.hash = "#phim";
                }
              }}
            >
              Phim
            </a>

            <a
              href="#dat-ve"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                scrollToBooking();
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

          {/* ACTION BUTTONS & USER */}
          <div className="header-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Tìm kiếm phim"
              onClick={() => onNavigate && onNavigate("movie-list")}
            >
              <Search size={18} />
            </button>

            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Xem phim đang quan tâm"
              onClick={() => triggerToast("Bạn chưa có thông báo mới nào.")}
            >
              <Bell size={18} />
            </button>

            <a
              className="gold-tier"
              href="#uu-dai"
              onClick={(e) => {
                e.preventDefault();
                triggerToast("Hạng thẻ hiện tại: GOLD TIER (Giảm 15% bắp nước & phòng VIP)");
              }}
            >
              <Crown size={14} />
              GOLD TIER
            </a>

            <button
              type="button"
              className="avatar-button"
              aria-label="Xem thông tin hội viên"
              onClick={() => triggerToast("Hồ sơ hội viên NOVA Cinema")}
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
              }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="detail-breadcrumb-bar">
        <div className="container">
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
            <a
              href="#phim"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate("movies");
                else window.location.hash = "#phim";
              }}
            >
              Danh sách phim
            </a>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">
              {currentMovie.title}
            </span>
          </nav>
        </div>
      </div>

      {/* PHẦN HERO: 2 CỘT (LEFT: POSTER & PRIVILEGES | RIGHT: TRAILER BANNER & SPECS) */}
      <main className="container">
        <div className="detail-hero-grid">
          {/* CỘT TRÁI: POSTER, RATINGS, YÊU THÍCH, ĐẶC QUYỀN */}
          <div className="detail-poster-col">
            <div className="detail-poster-wrapper">
              <img
                src={currentMovie.poster || "/posters/dune.jpg"}
                alt={currentMovie.title}
                className="detail-poster-img"
                onError={(e) => {
                  if (currentMovie.fallbackPoster && e.currentTarget.src !== currentMovie.fallbackPoster) {
                    e.currentTarget.src = currentMovie.fallbackPoster;
                  }
                }}
              />
              <div className="detail-poster-badge-top">
                <span
                  className="detail-age-pill"
                  style={{ background: currentMovie.ageColor || "#ea580c" }}
                >
                  {currentMovie.age || "T16"}
                </span>
                <span className="detail-format-pill">
                  {currentMovie.formatTag || currentMovie.format || "IMAX Laser"}
                </span>
              </div>
              <div className="detail-poster-badge-right">
                <Clock size={12} />
                <span>
                  {currentMovie.duration
                    ? `${Math.floor(currentMovie.duration / 60)}h ${currentMovie.duration % 60}m / ${currentMovie.duration} phút`
                    : "Sắp công bố"}
                </span>
              </div>
            </div>

            {/* RATINGS ROW */}
            <div className="detail-ratings-box">
              <div className="detail-rating-item">
                <div className="detail-rating-score-row">
                  <span className="detail-rating-num">{ratingMeta.imdb}</span>
                  <div className="detail-rating-meta">
                    <span className="detail-rating-source">IMDb</span>
                    <span className="detail-rating-sub">{ratingMeta.imdbSub}</span>
                  </div>
                </div>
              </div>

              <div className="detail-rating-item" style={{ paddingLeft: "10px" }}>
                <div className="detail-rating-score-row">
                  <Star size={18} fill="#ffce6d" color="#ffce6d" />
                  <span className="detail-rating-num">
                    {ratingMeta.novaScore}
                    <small style={{ fontSize: "14px", color: "#8da4be" }}>/10</small>
                  </span>
                  <div className="detail-rating-meta">
                    <span className="detail-rating-source">NOVA</span>
                    <span className="detail-rating-sub">{ratingMeta.totalReviews} đánh giá</span>
                  </div>
                </div>
              </div>
            </div>

            {/* YÊU THÍCH VÀ CHIA SẺ */}
            <div className="detail-fav-share-row">
              <button
                type="button"
                className={`detail-fav-btn ${isLiked ? "active" : ""}`}
                onClick={handleToggleFavorite}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                <span>
                  {isLiked
                    ? `Đã thích (${(likeCount / 1000).toFixed(1)}K)`
                    : `Yêu thích (${(likeCount / 1000).toFixed(1)}K)`}
                </span>
              </button>

              <button
                type="button"
                className="detail-share-btn"
                title="Chia sẻ phim"
                onClick={handleShare}
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* ĐẶC QUYỀN TRẢI NGHIỆM NOVA */}
            <div className="detail-privileges-box">
              <div className="detail-privileges-title">
                <Sparkles size={14} color="#ffce6d" />
                <span>ĐẶC QUYỀN TRẢI NGHIỆM NOVA</span>
              </div>

              <div className="detail-privilege-item">
                <Check size={16} className="detail-privilege-icon" />
                <span>Tự động tích lũy Cinepoints (hạng VIP/Gold)</span>
              </div>

              <div className="detail-privilege-item">
                <Wine size={16} className="detail-privilege-icon" />
                <span>Không gian phòng chờ riêng biệt VIP Lounge (nước ngọt & snack miễn phí)</span>
              </div>

              <div className="detail-privilege-item">
                <Monitor size={16} className="detail-privilege-icon" />
                <span>Màn chiếu chuẩn quốc tế {currentMovie.format || "IMAX GT Dual Laser"} tỉ lệ tối ưu.</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BANNER TRAILER 4K & THÔNG TIN CHI TIẾT */}
          <div className="detail-content-col">
            {/* TRAILER BANNER WITH DYNAMIC OVERLAYS */}
            <div
              className="detail-trailer-banner"
              onClick={() => setShowVideoModal(true)}
              title={`Xem Trailer chính thức • ${currentMovie.title}`}
            >
              <img
                src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                alt={`${currentMovie.title} Trailer`}
                className="detail-trailer-bg"
                onError={(e) => {
                  if (e.currentTarget.src.includes("maxresdefault")) {
                    e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                  } else if (currentMovie.fallbackPoster && e.currentTarget.src !== currentMovie.fallbackPoster) {
                    e.currentTarget.src = currentMovie.fallbackPoster;
                  } else {
                    e.currentTarget.src = currentMovie.poster || "/posters/dune.jpg";
                  }
                }}
              />

              {/* TOP OVERLAY BAR */}
              <div className="detail-trailer-top-bar">
                <div className="detail-trailer-label">
                  <Play size={14} fill="#fff" />
                  <span>Trailer chính thức • {currentMovie.shortTitle || currentMovie.title}</span>
                  <span className="detail-tag-small">Official</span>
                </div>
                <div className="detail-trailer-badges-right">
                  <span className="detail-badge-gold-outline">4K HDR</span>
                  <span className="detail-badge-res">1080p</span>
                </div>
              </div>

              {/* PLAY BUTTON IN CENTER */}
              <div className="detail-play-btn-center">
                <Play size={28} fill="currentColor" style={{ marginLeft: "4px" }} />
              </div>

              {/* BOTTOM OVERLAY BAR */}
              <div className="detail-trailer-bot-bar">
                <div className="detail-trailer-audio-meta">
                  <Volume2 size={16} color="#ffce6d" />
                  <span>Dolby Atmos Sound</span>
                </div>
                <div className="detail-scrubber">
                  <div className="detail-scrubber-progress" />
                </div>
                <span className="detail-trailer-sub-note">
                  {currentMovie.techSub || "Phụ đề & Lồng tiếng Việt"}
                </span>
              </div>
            </div>

            {/* HÀNG CÁC PILLS CÔNG NGHỆ */}
            <div className="detail-tech-pills-row">
              <span className="detail-tech-pill">{currentMovie.format || "IMAX Laser GT"}</span>
              <span className="detail-tech-pill">Dolby Atmos</span>
              <span className="detail-tech-pill">ScreenX</span>
              <span className="detail-tech-pill">Hội trường NOVA</span>
              <span className="detail-tech-pill">Phòng VIP Gold Lounge & Suites</span>
              <span className="detail-tech-pill">Âm thanh chuẩn quốc tế</span>
            </div>

            {/* TIÊU ĐỀ & GENRE */}
            <div>
              <div className="detail-genre-release">
                {currentMovie.genreUpper || currentMovie.genre} • KHỞI CHIẾU: {currentMovie.releaseDate || "Đang chiếu tại rạp"}
              </div>
              <h1 className="detail-movie-title">
                {currentMovie.title}
              </h1>
              <div className="detail-movie-short-title">
                {currentMovie.shortTitle || currentMovie.title}
              </div>
            </div>

            {/* 4 STAT CARDS GRID */}
            <div className="detail-stat-cards-grid">
              <div className="detail-stat-card">
                <div className="detail-stat-label-row">
                  <Clock size={14} />
                  <span>THỜI LƯỢNG</span>
                </div>
                <div className="detail-stat-val">
                  {currentMovie.duration ? `${currentMovie.duration} phút` : "Sắp công bố"}
                </div>
                <div className="detail-stat-note">
                  {currentMovie.duration
                    ? `(${Math.floor(currentMovie.duration / 60)} giờ ${currentMovie.duration % 60} phút)`
                    : "Chờ cập nhật"}
                </div>
              </div>

              <div className="detail-stat-card">
                <div className="detail-stat-label-row">
                  <ShieldCheck size={14} />
                  <span>ĐỘ TUỔI</span>
                </div>
                <div className="detail-stat-val">
                  {currentMovie.age ? `${currentMovie.age} - Khuyên dùng` : "Mọi độ tuổi"}
                </div>
                <div className="detail-stat-note">
                  {currentMovie.age === "T18"
                    ? "Khán giả từ 18 tuổi"
                    : currentMovie.age === "T16"
                    ? "Khán giả từ 16 tuổi"
                    : currentMovie.age === "T13"
                    ? "Khán giả từ 13 tuổi"
                    : "Phù hợp mọi gia đình"}
                </div>
              </div>

              <div className="detail-stat-card">
                <div className="detail-stat-label-row">
                  <Globe size={14} />
                  <span>NGÔN NGỮ</span>
                </div>
                <div className="detail-stat-val">Tiếng Anh / Gốc</div>
                <div className="detail-stat-note">
                  {currentMovie.techSub || "Phụ đề & Lồng tiếng Việt"}
                </div>
              </div>

              <div className="detail-stat-card">
                <div className="detail-stat-label-row">
                  <Film size={14} />
                  <span>ĐẠO DIỄN</span>
                </div>
                <div className="detail-stat-val">
                  {currentMovie.director || "Đang cập nhật"}
                </div>
                <div className="detail-stat-note">Đạo diễn & Biên kịch</div>
              </div>
            </div>

            {/* TÓM TẮT NỘI DUNG */}
            <div className="detail-synopsis-box">
              <div className="detail-synopsis-label">TÓM TẮT NỘI DUNG</div>
              <p className="detail-synopsis-text">
                {currentMovie.description ||
                  "Hành trình điện ảnh tuyệt tác được trình chiếu trên hệ thống phòng chiếu hiện đại bậc nhất của NOVA Cinema với chất lượng hình ảnh sắc nét và âm thanh chân thực."}
              </p>
            </div>

            {/* CALL TO ACTION BUTTONS */}
            <div className="detail-hero-actions">
              <button
                type="button"
                className="detail-btn-primary-gold"
                onClick={scrollToBooking}
              >
                <Ticket size={18} />
                <span>Đặt vé xem ngay</span>
              </button>

              <button
                type="button"
                className="detail-btn-outline-dark"
                onClick={() =>
                  triggerToast(`🔔 Bạn đã đăng ký nhận thông báo suất chiếu đặc biệt của ${currentMovie.title}!`)
                }
              >
                <Bell size={16} />
                <span>Thông báo khi có Ghế trống</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION: DÀN DIỄN VIÊN & ĐỘI NGŨ SẢN XUẤT */}
        <section className="detail-section">
          <div className="detail-section-header">
            <div>
              <div className="detail-eyebrow">HỘI TỤ CÁC NGÔI SAO</div>
              <h2 className="detail-section-title">
                Dàn diễn viên & Đội ngũ sản xuất
              </h2>
            </div>
            <div className="detail-arrow-controls">
              <button
                type="button"
                className="detail-arrow-btn"
                title="Lùi lại"
                onClick={() => triggerToast("Dàn diễn viên chính thức của phim")}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="detail-arrow-btn"
                title="Xem tiếp"
                onClick={() => triggerToast("Dàn diễn viên chính thức của phim")}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="detail-cast-carousel">
            {castList.map((actor) => (
              <div className="detail-cast-card" key={actor.id}>
                <div className="detail-cast-avatar-box">
                  <img
                    src={actor.avatar}
                    alt={actor.name}
                    className="detail-cast-avatar-img"
                    onError={(e) => {
                      if (actor.fallback && e.currentTarget.src !== actor.fallback) {
                        e.currentTarget.src = actor.fallback;
                      }
                    }}
                  />
                </div>
                <div className="detail-cast-name">{actor.name}</div>
                <div className="detail-cast-character">{actor.character}</div>
                <div className="detail-cast-role">{actor.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: LỊCH CHIẾU & CHỌN SUẤT XEM PHIM */}
        <section className="detail-section" ref={showtimesRef} id="lich-chieu">
          <div className="detail-section-header">
            <div>
              <div className="detail-eyebrow">ĐẶT CHỖ TRỰC TIẾP CHỈ 1 PHÚT</div>
              <h2 className="detail-section-title">
                Lịch Chiếu & Chọn Suất Xem Phim
              </h2>
            </div>

            <div className="detail-showtime-legend">
              <div className="detail-legend-item">
                <span className="detail-dot detail-dot-gold" />
                <span>Đang chọn</span>
              </div>
              <div className="detail-legend-item">
                <span className="detail-dot detail-dot-white" />
                <span>Còn ghế</span>
              </div>
              <div className="detail-legend-item">
                <span className="detail-dot detail-dot-red" />
                <span>Sắp hết vé</span>
              </div>
            </div>
          </div>

          {/* HÀNG TAB CHỌN NGÀY */}
          <div className="detail-dates-row">
            {SHOW_DATES.map((d) => (
              <div
                key={d.id}
                className={`detail-date-tab ${selectedDate === d.id ? "active" : ""}`}
                onClick={() => setSelectedDate(d.id)}
              >
                <span className="detail-date-tag">{d.tag}</span>
                <span className="detail-date-day">{d.day}</span>
                <span className="detail-date-weekday">{d.weekday}</span>
              </div>
            ))}
          </div>

          {/* LỌC CỤM RẠP */}
          <div className="detail-cinema-filter-row">
            <span className="detail-filter-label">Cụm rạp:</span>
            {CINEMA_LOCATIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`detail-cinema-pill ${selectedCinema === c.id ? "active" : ""}`}
                onClick={() => setSelectedCinema(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* CÁC PHÒNG CHIẾU VÀ SUẤT CHIẾU */}
          <div className="detail-halls-list">
            {HALLS_DATA.map((hall) => (
              <div className="detail-hall-card" key={hall.id}>
                <div className="detail-hall-header">
                  <div className="detail-hall-info">
                    <div className="detail-hall-name-row">
                      <Monitor size={18} className="detail-hall-icon" />
                      <span className="detail-hall-name">{hall.name}</span>
                      <span className="detail-hall-tag">{hall.tag}</span>
                    </div>
                    <div className="detail-hall-desc">{hall.desc}</div>
                  </div>

                  <div className="detail-hall-price">
                    GIÁ VÉ TỪ {hall.minPrice}
                  </div>
                </div>

                {/* SUẤT CHIẾU GRID */}
                <div className="detail-slots-grid">
                  {hall.slots.map((slot) => {
                    const isSelected =
                      selectedSlot.slotTime === slot.time &&
                      selectedSlot.hallName === hall.name;

                    return (
                      <div
                        key={slot.id}
                        className={`detail-slot-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedSlot({
                            hallName: hall.name,
                            slotTime: slot.time,
                            price: `${slot.priceNum.toLocaleString("vi-VN")} đ`,
                            priceNum: slot.priceNum,
                          });
                          triggerToast(`Đã chọn suất ${slot.time} - ${hall.name}`);
                        }}
                      >
                        <div className="detail-slot-top">
                          <span className="detail-slot-time">{slot.time}</span>
                          {slot.almostOut ? (
                            <span className="detail-slot-badge-red">Sắp hết</span>
                          ) : (
                            <span className="detail-slot-type">{slot.type}</span>
                          )}
                        </div>
                        <div className="detail-slot-bottom">
                          <span className={`detail-slot-seats ${slot.almostOut ? "almost-out" : ""}`}>
                            {slot.seats}
                          </span>
                          <span className="detail-slot-price">{slot.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: ĐÁNH GIÁ TỪ HỘI VIÊN & CHUYÊN GIA (3 CỘT NGANG NHAU NHƯ ẢNH 1) */}
        <section className="detail-section">
          <div className="detail-section-header">
            <div>
              <div className="detail-eyebrow">CẢM NHẬN TỪ KHÁN GIẢ</div>
              <h2 className="detail-section-title">
                Đánh giá từ Hội viên & Chuyên gia
              </h2>
            </div>
            <button
              type="button"
              className="detail-btn-write-review"
              onClick={() => setShowReviewModal(true)}
            >
              <SquarePen size={15} />
              <span>Viết nhận xét</span>
            </button>
          </div>

          <div className="detail-reviews-grid">
            {/* THẺ 1: TỔNG HỢP ĐIỂM SỐ */}
            <div className="detail-rating-summary-card">
              <div className="detail-summary-header">TỔNG ĐIỂM ĐÁNH GIÁ</div>
              <div className="detail-summary-score-row">
                <span className="detail-summary-big-score">{ratingMeta.novaScore}</span>
                <span className="detail-summary-max-score">/ 10</span>
              </div>

              <div className="detail-summary-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#ffce6d" color="#ffce6d" />
                ))}
                <span className="detail-summary-count">({ratingMeta.totalReviews} lượt bình chọn)</span>
              </div>

              <div className="detail-summary-quote">
                {ratingMeta.quote.replace(/^[“"']|[”"']$/g, "")}
              </div>

              {/* PROGRESS BARS (5 sao, 4 sao, 3 sao, < 3 sao) */}
              <div className="detail-breakdown-list">
                <div className="detail-breakdown-row">
                  <span className="detail-breakdown-star-label">5 sao</span>
                  <div className="detail-breakdown-bar-track">
                    <div className="detail-breakdown-bar-fill" style={{ width: `${ratingMeta.fiveStars}%` }} />
                  </div>
                  <span className="detail-breakdown-percent">{ratingMeta.fiveStars}%</span>
                </div>

                <div className="detail-breakdown-row">
                  <span className="detail-breakdown-star-label">4 sao</span>
                  <div className="detail-breakdown-bar-track">
                    <div className="detail-breakdown-bar-fill" style={{ width: `${ratingMeta.fourStars}%` }} />
                  </div>
                  <span className="detail-breakdown-percent">{ratingMeta.fourStars}%</span>
                </div>

                <div className="detail-breakdown-row">
                  <span className="detail-breakdown-star-label">3 sao</span>
                  <div className="detail-breakdown-bar-track">
                    <div className="detail-breakdown-bar-fill" style={{ width: `${ratingMeta.threeStars}%` }} />
                  </div>
                  <span className="detail-breakdown-percent">{ratingMeta.threeStars}%</span>
                </div>

                <div className="detail-breakdown-row">
                  <span className="detail-breakdown-star-label">&lt; 3 sao</span>
                  <div className="detail-breakdown-bar-track">
                    <div className="detail-breakdown-bar-fill" style={{ width: `${Math.max(1, (ratingMeta.twoStars || 0) + (ratingMeta.oneStars || 0))}%` }} />
                  </div>
                  <span className="detail-breakdown-percent">{Math.max(1, (ratingMeta.twoStars || 0) + (ratingMeta.oneStars || 0))}%</span>
                </div>
              </div>
            </div>

            {/* THẺ 2 & 3: HAI ĐÁNH GIÁ TIÊU BIỂU NẰM CÙNG MỘT HÀNG NGANG */}
            {reviewsList.slice(0, 2).map((rev) => (
              <div className="detail-review-card" key={rev.id}>
                <div className="detail-review-header">
                  <div className="detail-reviewer-info">
                    <div className="detail-reviewer-avatar">
                      {rev.avatar ? (
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="detail-reviewer-avatar-img"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="detail-reviewer-avatar-fallback">
                        {rev.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-reviewer-meta">
                      <div className="detail-reviewer-name-row">
                        <span className="detail-reviewer-name">{rev.author}</span>
                      </div>
                      <div className="detail-reviewer-sub-row">
                        {rev.tier && (
                          <span className={`detail-tier-badge ${rev.tier.includes("CRITIC") || rev.tier.includes("PHÊ BÌNH") ? "badge-critic" : ""}`}>
                            {rev.tier}
                          </span>
                        )}
                        {rev.hallSeen && (
                          <span className="detail-seen-hall">• {rev.hallSeen}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="detail-review-score-pill">
                    {rev.score.replace(/\s+/g, "")}
                  </div>
                </div>

                <p className="detail-review-content">"{rev.content.replace(/^[“"']|[”"']$/g, "")}"</p>

                <div className="detail-review-footer">
                  <span className="detail-review-time">{rev.time}</span>
                  <button
                    type="button"
                    className={`detail-like-btn ${rev.liked ? "liked" : ""}`}
                    onClick={() => handleLikeReview(rev.id)}
                  >
                    <ThumbsUp size={13} fill={rev.liked ? "currentColor" : "none"} />
                    <span>{rev.likes} hữu ích</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: TÁC PHẨM ĐIỆN ẢNH TƯƠNG TỰ */}
        <section className="detail-section">
          <div className="detail-section-header">
            <div>
              <div className="detail-eyebrow">DÀNH CHO NGƯỜI HÂM MỘ</div>
              <h2 className="detail-section-title">
                Tác phẩm điện ảnh tương tự
              </h2>
            </div>

            <a
              className="detail-similar-status"
              style={{ textDecoration: "none", cursor: "pointer" }}
              onClick={() => onNavigate && onNavigate("movie-list")}
            >
              Xem tất cả phim cùng thể loại →
            </a>
          </div>

          <div className="detail-similar-grid">
            {similarMovies.map((movie) => (
              <div
                className="detail-similar-card"
                key={movie.id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (onNavigate) {
                    onNavigate("movie-detail", movie.id, movie);
                  }
                }}
              >
                <div className="detail-similar-media">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="detail-similar-img"
                    onError={(e) => {
                      if (movie.fallbackPoster && e.currentTarget.src !== movie.fallbackPoster) {
                        e.currentTarget.src = movie.fallbackPoster;
                      }
                    }}
                  />
                  <div className="detail-similar-badges">
                    <span className="detail-age-pill">{movie.age || "T16"}</span>
                    <span className="detail-format-pill">{movie.format || "IMAX"}</span>
                  </div>
                </div>

                <div className="detail-similar-body">
                  <h3 className="detail-similar-title">{movie.title}</h3>
                  <p className="detail-similar-desc">{movie.description}</p>

                  <div className="detail-similar-footer">
                    <span className="detail-similar-status">
                      {movie.status === "coming_soon" ? "Sắp chiếu" : "Đang chiếu"}
                    </span>
                    <span
                      className="detail-similar-action"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigate) {
                          onNavigate("movie-detail", movie.id, movie);
                        }
                      }}
                    >
                      Chi tiết <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* THANH ĐẶT VÉ GHIM CỐ ĐỊNH Ở DƯỚI CÙNG (STICKY BOTTOM BAR) */}
      <div className="detail-sticky-bar">
        <div className="detail-container detail-sticky-inner">
          <div className="detail-sticky-left">
            <img
              src={currentMovie.poster || "/posters/dune.jpg"}
              alt={currentMovie.title}
              className="detail-sticky-thumb"
              onError={(e) => {
                if (currentMovie.fallbackPoster && e.currentTarget.src !== currentMovie.fallbackPoster) {
                  e.currentTarget.src = currentMovie.fallbackPoster;
                }
              }}
            />
            <div className="detail-sticky-info">
              <span className="detail-sticky-title">
                {currentMovie.title}
              </span>
              <span className="detail-sticky-sub">
                NOVA Landmark 81 • Hôm nay 26/10 • Suất chiếu: {selectedSlot.slotTime} ({selectedSlot.hallName})
              </span>
            </div>
          </div>

          <div className="detail-sticky-right">
            <div className="detail-sticky-price-box">
              <span className="detail-sticky-price-label">Giá vé từ</span>
              <span className="detail-sticky-price-val">{selectedSlot.price}</span>
            </div>

            <button
              type="button"
              className="detail-btn-primary-gold"
              onClick={handleStickyBookClick}
            >
              <Ticket size={18} />
              <span>Chọn Suất & Ghế</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER CHUẨN NOVA LUXURY */}
      <footer className="detail-footer">
        <div className="detail-container">
          <div className="detail-footer-grid">
            <div className="detail-footer-brand-col">
              <div className="detail-brand" onClick={() => onNavigate && onNavigate("home")}>
                <div className="detail-brand-symbol">
                  <img src="/nova-icon.png" alt="Nova Cinema" onError={(e) => (e.target.style.display = "none")} />
                </div>
                <div className="detail-brand-text">
                  <strong>NOVA CINEMA</strong>
                  <small>LUXURY EXPERIENCE</small>
                </div>
              </div>
              <p className="detail-footer-desc">
                Đẳng cấp điện ảnh thượng lưu. Trải nghiệm hệ thống phòng chiếu IMAX Laser, Dolby Atmos chuẩn quốc tế cùng đặc quyền ẩm thực VIP Lounge thượng hạng.
              </p>
              <div className="detail-footer-badge">
                <BadgeCheck size={18} />
                <span>Chứng nhận tiêu chuẩn rạp VIP Quốc Tế</span>
              </div>
            </div>

            <div className="detail-footer-col">
              <div className="detail-footer-col-title">KHÁM PHÁ & DỊCH VỤ HOÀN</div>
              <a onClick={() => onNavigate && onNavigate("movies")}>Về chúng tôi</a>
              <a onClick={() => triggerToast("Chương trình Hội viên NOVA VIP")}>Quy định thành viên VIP</a>
              <a onClick={() => triggerToast("Chính sách bảo mật NOVA Cinema")}>Chính sách bảo mật</a>
              <a onClick={() => triggerToast("Điều khoản dịch vụ")}>Điều khoản dịch vụ</a>
            </div>

            <div className="detail-footer-col">
              <div className="detail-footer-col-title">HỆ THỐNG CỤM RẠP NOVA</div>
              <a href="#lich-chieu">NOVA Landmark 81 (Tầng B1, Vincom Landmark 81, TP.HCM)</a>
              <a href="#lich-chieu">NOVA Westlake (Tầng 4, Lotte Mall West Lake, Hà Nội)</a>
              <a href="#lich-chieu">NOVA Vincom Bà Triệu (Tầng 6, Tháp B, Bà Triệu, Hà Nội)</a>
            </div>

            <div className="detail-footer-col">
              <div className="detail-footer-col-title">LIÊN HỆ & HỖ TRỢ</div>
              <a style={{ color: "#ffce6d", fontWeight: "700" }}>Tổng đài chăm sóc VIP 24/7:</a>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#ffce6d" }}>1900 6888</span>
              <a href="mailto:contact@novacinema.vn">contact@novacinema.vn</a>
              <span style={{ color: "#8da4be" }}>08:00 - 24:00 hàng ngày</span>
            </div>
          </div>

          <div className="detail-footer-bot">
            <div>
              © 2024 NOVA CINEMA JSC. All rights reserved. Tiêu chuẩn điện ảnh chuẩn Hoàng gia.
            </div>
            <div>
              Thanh toán an toàn qua VNPAY, MoMo, Visa/Mastercard
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL VIDEO TRAILER YOUTUBE 4K RIÊNG CỦA PHIM */}
      {showVideoModal && (
        <div className="detail-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Trailer chính thức • {currentMovie.title}</h3>
              <button
                type="button"
                className="detail-modal-close-btn"
                onClick={() => setShowVideoModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="detail-modal-video-frame">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={`${currentMovie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIẾT NHẬN XÉT */}
      {showReviewModal && (
        <div className="detail-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="detail-modal-container" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Viết nhận xét • {currentMovie.title}</h3>
              <button
                type="button"
                className="detail-modal-close-btn"
                onClick={() => setShowReviewModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#ffce6d", fontWeight: "700", marginBottom: "6px" }}>
                  HỌ VÀ TÊN / DANH XƯNG
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Minh Trí, CFA"
                  value={reviewFormData.author}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, author: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,206,109,0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#ffce6d", fontWeight: "700", marginBottom: "6px" }}>
                  ĐIỂM ĐÁNH GIÁ (1 - 10)
                </label>
                <select
                  value={reviewFormData.score}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, score: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0c1829",
                    border: "1px solid rgba(255,206,109,0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                    outline: "none",
                  }}
                >
                  <option value="10">10 / 10 - Tuyệt phẩm điện ảnh</option>
                  <option value="9.8">9.8 / 10 - Xuất sắc vượt trội</option>
                  <option value="9.5">9.5 / 10 - Rất đáng xem tại rạp</option>
                  <option value="9.0">9.0 / 10 - Phim rất hay</option>
                  <option value="8.5">8.5 / 10 - Tốt</option>
                  <option value="8.0">8.0 / 10 - Khá</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#ffce6d", fontWeight: "700", marginBottom: "6px" }}>
                  CẢM NHẬN & ĐÁNH GIÁ CỦA BẠN
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Chia sẻ cảm xúc về âm thanh, hình ảnh IMAX, diễn xuất..."
                  value={reviewFormData.content}
                  onChange={(e) => setReviewFormData({ ...reviewFormData, content: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,206,109,0.3)",
                    borderRadius: "8px",
                    color: "#fff",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="detail-btn-outline-dark"
                  onClick={() => setShowReviewModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="detail-btn-primary-gold">
                  Đăng đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
