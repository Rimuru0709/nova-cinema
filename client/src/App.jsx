import Home from "./home/home.jsx";
import MovieList from "./movies/MovieList.jsx";
import MovieDetail from "./movies/MovieDetail.jsx";
import ShowtimesPage from "./showtimes/ShowtimesPage.jsx";
import SeatSelectionModal from "./components/SeatSelectionModal.jsx";

// Phân tích URL hash để xác định trang và ID phim tương ứng
function getPageAndMovieFromHash() {
  const hash = window.location.hash || "";
  const lower = hash.toLowerCase();

  // Chi tiết phim chỉ khi có hash chi tiết hoặc phim/:id
  if (
    lower.startsWith("#chi-tiet") ||
    lower.startsWith("#movie-detail") ||
    (lower.startsWith("#phim/") && lower.length > 6)
  ) {
    const parts = hash.split("/");
    const id = parts.length > 1 ? parts[1] : "dune-2";
    return { page: "movie-detail", movieId: id || "dune-2" };
  }

  // Khi bấm vào Phim trên thanh điều hướng (#phim, #danh-sach-phim, #catalog): chuyển sang trang Danh sách phim
  if (
    lower === "#phim" ||
    lower === "#danh-sach-phim" ||
    lower === "#catalog" ||
    lower === "#movies" ||
    lower === "#movie-list"
  ) {
    return { page: "movies", movieId: "" };
  }

  // Trang Lịch Chiếu Phim Đẳng Cấp Thượng Lưu (Ảnh 2)
  if (
    lower === "#lich-chieu" ||
    lower === "#showtimes" ||
    lower === "#lich-chieu-phim" ||
    lower === "#dat-ve"
  ) {
    return { page: "showtimes", movieId: "" };
  }

  // Màn hình Chọn Ghế & Giữ Ghế (Ảnh 3)
  if (lower === "#chon-ghe" || lower === "#seat-selection") {
    return { page: "seat-selection", movieId: "" };
  }

  if (
    lower === "#trang-chu" ||
    lower === "#home" ||
    lower === "#uu-dai" ||
    lower === "#trai-nghiem" ||
    lower === "#lien-he"
  ) {
    return { page: "home", movieId: "" };
  }

  // Mặc định ban đầu hiển thị Trang chủ
  return { page: "home", movieId: "" };
}

function App() {
  const initial = getPageAndMovieFromHash();
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [selectedMovieId, setSelectedMovieId] = useState(initial.movieId || "dune-2");
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [selectedShowtimeData, setSelectedShowtimeData] = useState(null);

  // Lắng nghe sự kiện hashchange của trình duyệt
  useEffect(() => {
    function handleHashChange() {
      const state = getPageAndMovieFromHash();
      setCurrentPage(state.page);
      if (state.movieId) {
        setSelectedMovieId(state.movieId);
        setSelectedMovieData(null);
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Điều hướng giữa các trang
  function handleNavigate(page, target, extra) {
    if (page === "movie-detail") {
      const id =
        (typeof target === "string" && target !== "movies" && target !== "movie-list" ? target : "") ||
        (extra && extra.id) ||
        (typeof extra === "string" ? extra : "") ||
        selectedMovieId ||
        "dune-2";
      setSelectedMovieId(id);
      if (extra && typeof extra === "object") {
        setSelectedMovieData(extra);
      } else if (target && typeof target === "object") {
        setSelectedMovieData(target);
      } else {
        setSelectedMovieData(null);
      }
      setCurrentPage("movie-detail");
      window.location.hash = `#chi-tiet/${id}`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "movies" || page === "movie-list" || page === "catalog") {
      setCurrentPage("movies");
      window.location.hash = "#phim";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "showtimes" || page === "lich-chieu") {
      setCurrentPage("showtimes");
      window.location.hash = "#lich-chieu";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "seat-selection") {
      if (target && typeof target === "object") {
        setSelectedShowtimeData(target);
      }
      setCurrentPage("seat-selection");
      window.location.hash = "#chon-ghe";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentPage("home");
      window.location.hash = target || "#trang-chu";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Khi người dùng bấm chọn một suất chiếu từ bất kỳ màn hình nào
  function handleSelectShowtime(showtime) {
    setSelectedShowtimeData(showtime);
    setCurrentPage("seat-selection");
    window.location.hash = "#chon-ghe";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Màn hình 3: Chọn Ghế & Giữ Ghế (Ảnh 3)
  if (currentPage === "seat-selection") {
    return (
      <SeatSelectionModal
        showtimeId={selectedShowtimeData?.id || 1}
        showtimeData={selectedShowtimeData}
        onClose={() => handleNavigate("showtimes")}
        onBookingSuccess={() => { }}
        onNavigate={handleNavigate}
      />
    );
  }

  // Màn hình 2: Lịch Chiếu Phim Đẳng Cấp Thượng Lưu (Ảnh 2)
  if (currentPage === "showtimes") {
    return (
      <ShowtimesPage
        onNavigate={handleNavigate}
        onSelectShowtime={handleSelectShowtime}
      />
    );
  }

  // Màn hình 1: Chi Tiết Phim (Ảnh 1)
  if (currentPage === "movie-detail") {
    return (
      <MovieDetail
        movieId={selectedMovieId}
        initialMovie={selectedMovieData}
        onNavigate={handleNavigate}
        onSelectShowtime={handleSelectShowtime}
      />
    );
  }

  // Danh Sách Phim
  if (currentPage === "movies") {
    return (
      <MovieList
        onNavigate={handleNavigate}
        onSelectShowtime={handleSelectShowtime}
      />
    );
  }

  // Trang Chủ
  return (
    <Home
      onNavigate={handleNavigate}
      selectedMovieIdFromParent={selectedMovieId}
      onSelectShowtime={handleSelectShowtime}
    />
  );
>>>>>>> bd0698c (Tính năng lịch chiếu và Chọn suất chiếu, chọn ghế)
}

export default App;