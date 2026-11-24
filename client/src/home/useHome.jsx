import { useEffect, useState } from "react";
import {
  Wine,
  Video,
  Play,
  Clapperboard,
  Check,
} from "lucide-react";
import { MOVIES_DATA } from "../movies/movieData.js";
import RecliningSeatIcon from "./RecliningSeatIcon.jsx";

const DEFAULT_CINEMAS = [
  { id: 1, name: "NOVA Landmark 81", address: "Tầng B1, TTTM Vincom Landmark 81, TP. HCM" },
  { id: 2, name: "NOVA Westlake", address: "Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội" },
  { id: 3, name: "NOVA Vincom Bà Triệu", address: "Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội" },
];

const FALLBACK_MOVIES = MOVIES_DATA.map((m) => ({
  id: m.id,
  title: m.title,
  shortTitle: m.shortTitle,
  genre: m.genre,
  duration: m.duration || 120,
  age: m.age,
  rating: m.rating,
  reviews: m.reviews || 4200,
  format: m.format,
  country: m.id === "mai" || m.id === "lat-mat-7" ? "vietnam" : "international",
  imax: Boolean(m.format && m.format.includes("IMAX")),
  image: m.poster,
  description: m.description,
  releaseDate: m.releaseDate,
  status: m.status,
  featuredOrder: m.featuredOrder,
  trailerUrl: m.trailerUrl,
}));

const API_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const HERO_IMAGE =
  "https://images.hdqwalls.com/download/2024-dune-part-two-4k-movie-dr-1920x1080.jpg";

// Nội dung giới thiệu trải nghiệm thượng lưu chuẩn NOVA Cinema
const experiences = [
  {
    icon: Wine,
    eyebrow: "PRIVATE HOSPITALITY",
    title: "NOVA Gold Lounge",
    description:
      "Khu vực sảnh đón tiếp sang trọng biệt lập. Miễn phí cocktail đặc sắc, trà chiều thượng hạng và canapés được chuẩn bị bởi bếp trưởng danh tiếng trước giờ chiếu.",
    note: "Đặc quyền vé VIP & Gold",
  },
  {
    icon: Video,
    eyebrow: "NEXT-GEN PROJECTION",
    title: "Màn hình IMAX Laser 4K",
    description:
      "Hệ thống chiếu Laser 4K đôi độc quyền mang đến độ sáng vượt trội 80%, độ tương phản sâu thẳm cùng hệ thống âm thanh vòm 12 kênh phân tầng sống động.",
    note: "Độ phân giải siêu thực",
  },
  {
    icon: RecliningSeatIcon,
    eyebrow: "ULTIMATE COMFORT",
    title: "Ghế Da Cơ Học Ngả Tự Động",
    description:
      "Ghế bọc da bò nhập khẩu Italia, tích hợp hệ thống sưởi và massage êm dịu, bàn sạc không dây cùng nút gọi phục vụ ẩm thực tận chỗ riêng tư.",
    note: "Phục vụ ẩm thực tại chỗ",
  },
];

const filters = [
  { id: "all", label: "Tất cả phim" },
  { id: "imax", label: "IMAX Experience" },
  { id: "vietnam", label: "Phim Việt Nam" },
  { id: "family", label: "Hoạt hình & Gia đình" },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

// Lịch chiếu sử dụng ngày của Việt Nam, kể cả khi trình duyệt ở múi giờ khác.
function getToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDate(value) {
  if (!value) return "Đang cập nhật";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatReviewCount(count) {
  if (!count && count !== 0) return "0";
  const num = Number(count);
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return String(num);
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr.slice(0, 10) + "T00:00:00+07:00");
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const p = (type) => todayParts.find((item) => item.type === type).value;
  const today = new Date(`${p("year")}-${p("month")}-${p("day")}T00:00:00+07:00`);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

function trailerUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`;
}

function hideBrokenImage(event) {
  event.currentTarget.style.display = "none";
}

async function getApiData(path, signal) {
  const response = await fetch(`${API_ORIGIN}${path}`, { signal });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error("Không thể tải dữ liệu lúc này. Vui lòng thử lại.");
  }
  return payload.data;
}

export default function useHome() {
  const [catalog, setCatalog] = useState({
    status: "ready",
    movies: FALLBACK_MOVIES,
    cinemas: DEFAULT_CINEMAS,
    error: "",
  });
  const [catalogVersion, setCatalogVersion] = useState(0);
  const [showtimeResult, setShowtimeResult] = useState({
    key: "",
    status: "idle",
    data: [],
    error: "",
  });
  const [showtimeVersion, setShowtimeVersion] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const [movieChoice, setSelectedMovieId] = useState("");
  const [cinemaChoice, setCinema] = useState("");
  const [date, setDate] = useState(getToday);
  const [showtimeChoice, setTime] = useState("");
  const [interestedMovies, setInterestedMovies] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getApiData("/api/catalog", controller.signal)
      .then((data) => {
        if (!Array.isArray(data?.movies) || !Array.isArray(data?.cinemas)) {
          throw new Error("Dữ liệu phim chưa hợp lệ. Vui lòng thử lại.");
        }
        if (!controller.signal.aborted) {
          setCatalog({
            status: "ready",
            movies: data.movies.length ? data.movies : FALLBACK_MOVIES,
            cinemas: data.cinemas.length ? data.cinemas : DEFAULT_CINEMAS,
            error: "",
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          // Khi không có kết nối API, tự động dùng fallback data mượt mà
          setCatalog((prev) => ({
            status: "ready",
            movies: prev.movies.length ? prev.movies : FALLBACK_MOVIES,
            cinemas: prev.cinemas.length ? prev.cinemas : DEFAULT_CINEMAS,
            error: "",
          }));
        }
      });
    return () => controller.abort();
  }, [catalogVersion]);

  const movies = catalog.movies.filter((movie) => movie.status === "now_showing");
  const upcomingMovies = catalog.movies.filter((movie) => movie.status === "coming_soon");
  const cinemas = catalog.cinemas;
  const selectedMovie = movies.find((movie) => movie.id === movieChoice) || movies[0];
  const selectedMovieId = selectedMovie?.id || "";
  const selectedCinema = cinemas.find((item) => String(item.id) === cinemaChoice) || cinemas[0];
  const cinema = selectedCinema ? String(selectedCinema.id) : "";
  const heroMovies = [...movies]
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .slice(0, 3);
  const featuredMovie = heroMovies[heroIndex] || heroMovies[0];
  const canLoadShowtimes = Boolean(selectedMovieId && cinema && /^\d{4}-\d{2}-\d{2}$/.test(date));
  const showtimeKey = canLoadShowtimes
    ? `${selectedMovieId}|${cinema}|${date}|${showtimeVersion}`
    : "";

  useEffect(() => {
    if (!showtimeKey) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ movieId: selectedMovieId, cinemaId: cinema, date });
    getApiData(`/api/showtimes?${params}`, controller.signal)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Dữ liệu suất chiếu chưa hợp lệ.");
        if (!controller.signal.aborted) {
          setShowtimeResult({ key: showtimeKey, status: "ready", data, error: "" });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setShowtimeResult({
            key: showtimeKey,
            status: "error",
            data: [],
            error: "Chưa tải được lịch chiếu. Vui lòng thử lại.",
          });
        }
      });
    return () => controller.abort();
  }, [selectedMovieId, cinema, date, showtimeKey]);

  // Không hiển thị suất của lựa chọn cũ trong lúc yêu cầu mới đang tải.
  const showtimes = showtimeResult.key === showtimeKey ? showtimeResult.data : [];
  const showtimesLoading = Boolean(showtimeKey && showtimeResult.key !== showtimeKey);
  const showtimesError = showtimeResult.key === showtimeKey ? showtimeResult.error : "";
  const selectedShowtime = showtimes.find((item) => String(item.id) === showtimeChoice) || showtimes[0];
  const time = selectedShowtime ? String(selectedShowtime.id) : "";

  const visibleMovies = movies.filter((movie) => {
    const matchesSearch = normalizeText(movie.title).includes(normalizeText(query));
    const genre = (movie.genre || "").toLowerCase();
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "imax" && (movie.imax || (movie.format || "").toLowerCase().includes("imax"))) ||
      (activeFilter === "vietnam" && movie.country === "vietnam") ||
      (activeFilter === "family" && (genre.includes("hoạt hình") || genre.includes("gia đình") || movie.age === "P"));
    return matchesSearch && matchesFilter;
  });

  function retryCatalog() {
    setCatalog({ status: "loading", movies: [], cinemas: [], error: "" });
    setCatalogVersion((current) => current + 1);
    setShowtimeVersion((current) => current + 1);
  }

  function retryShowtimes() {
    setShowtimeVersion((current) => current + 1);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function chooseMovie(movie) {
    if (!movie) return;
    setSelectedMovieId(movie.id);
    document.getElementById("dat-ve")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function showMovieDetail(movie) {
    setModal({
      title: movie.title,
      content: (
        <div className="movie-detail">
          <img src={movie.image} alt={`Poster ${movie.title}`} onError={hideBrokenImage} />
          <div>
            <span className="text-gold">{movie.genre}</span>
            <p><strong>Thời lượng:</strong> {movie.duration} phút</p>
            <p><strong>Phân loại:</strong> {movie.age}</p>
            <p><strong>Khởi chiếu:</strong> {formatDate(movie.releaseDate)}</p>
            <p>{movie.description}</p>
            <a className="button button-dark" href={movie.trailerUrl || trailerUrl(movie.title)} target="_blank" rel="noreferrer">
              <Play size={16} />
              {movie.trailerUrl ? "Xem trailer" : "Tìm trailer"}
            </a>
          </div>
        </div>
      ),
    });
  }

  // Đây là bước tra cứu, chưa tạo đơn, giữ ghế hoặc thanh toán.
  function previewBooking(event) {
    event.preventDefault();
    if (!selectedMovie || !selectedShowtime || showtimesLoading || showtimesError) return;
    if (new Date(selectedShowtime.startsAt).getTime() <= Date.now()) {
      retryShowtimes();
      setModal({ title: "Suất chiếu đã bắt đầu", content: <p>Vui lòng chọn một suất chiếu khác.</p> });
      return;
    }
    setModal({
      title: "Suất chiếu bạn đã chọn",
      content: (
        <>
          <dl className="booking-summary">
            <div><dt>Phim</dt><dd>{selectedMovie.title}</dd></div>
            <div><dt>Rạp</dt><dd>{selectedShowtime.cinemaName}</dd></div>
            <div><dt>Phòng</dt><dd>{selectedShowtime.roomName} · {selectedShowtime.format}</dd></div>
            <div><dt>Ngày chiếu</dt><dd>{formatDate(selectedShowtime.date)}</dd></div>
            <div><dt>Giờ chiếu</dt><dd>{selectedShowtime.time}</dd></div>
            <div><dt>Giá vé từ</dt><dd>{Number(selectedShowtime.price).toLocaleString("vi-VN")} đ</dd></div>
          </dl>
          <p className="muted">Đây là bước xem lại lựa chọn. Chưa có ghế được giữ, vé được tạo hoặc thanh toán.</p>
        </>
      ),
    });
  }

  function toggleInterest(id) {
    setInterestedMovies((current) => current.includes(id)
      ? current.filter((movieId) => movieId !== id)
      : [...current, id]);
  }

  function showNotifications() {
    const selected = upcomingMovies.filter((movie) => interestedMovies.includes(movie.id));
    setModal({
      title: "Phim bạn quan tâm",
      content: selected.length ? (
        <>
          <ul className="interest-list">
            {selected.map((movie) => <li key={movie.id}><Clapperboard size={18} />{movie.title}</li>)}
          </ul>
          <p className="muted">Danh sách được ghi nhớ trong phiên xem hiện tại.</p>
        </>
      ) : <p>Bạn chưa đánh dấu phim nào. Chọn “Theo dõi phim” trong phần Phim Sắp Khởi Chiếu để thêm vào danh sách.</p>,
    });
  }

  function showMembership() {
    setModal({
      title: "NOVA Elite Club",
      content: (
        <>
          <p>Khám phá trải nghiệm hội viên với không gian điện ảnh và dịch vụ dành riêng cho bạn.</p>
          <ul className="benefit-list">
            <li><Check size={18} />Ưu đãi vé theo chương trình hội viên</li>
            <li><Check size={18} />Tích điểm khi sử dụng dịch vụ</li>
            <li><Check size={18} />Quyền lợi tại khu vực Gold Lounge</li>
          </ul>
          <p className="muted">Các quyền lợi trên giao diện là nội dung minh họa.</p>
        </>
      ),
    });
  }

  return {
    HERO_IMAGE, movies, upcomingMovies, experiences, cinemas, showtimes, filters, heroMovies,
    getToday, formatDate, formatReviewCount, getDaysUntil, trailerUrl, hideBrokenImage,
    menuOpen, setMenuOpen, searchOpen, setSearchOpen, query, setQuery, activeFilter, setActiveFilter,
    heroIndex, setHeroIndex, selectedMovieId, setSelectedMovieId, cinema, setCinema, date, setDate, time, setTime,
    interestedMovies, modal, setModal, featuredMovie, visibleMovies,
    catalogLoading: catalog.status === "loading", catalogError: catalog.error, retryCatalog,
    showtimesLoading, showtimesError, retryShowtimes,
    closeMenu, chooseMovie, showMovieDetail, previewBooking, toggleInterest, showNotifications, showMembership,
  };
}
