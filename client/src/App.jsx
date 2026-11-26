import { useState, useEffect } from "react";
import Home from "./home/home.jsx";
import MovieList from "./movies/MovieList.jsx";
import MovieDetail from "./movies/MovieDetail.jsx";
import AuthPage from "./auth/AuthPage.jsx";
import ProfilePage from "./profile/ProfilePage.jsx";
import AdminAccounts from "./profile/AdminAccounts.jsx";
import ComboPage from "./combo/ComboPage.jsx";
import CheckoutPage from "./checkout/CheckoutPage.jsx";
import ConfirmationPage from "./confirmation/ConfirmationPage.jsx";
import TicketsPage from "./tickets/TicketsPage.jsx";
import AdminPage from "./admin/AdminPage.jsx";
import AdminAccess from "./admin/AdminAccess.jsx";
import ShowtimesPage from "./showtimes/ShowtimesPage.jsx";
import SeatSelectionModal from "./components/SeatSelectionModal.jsx";

// Phân tích URL hash để xác định trang và ID phim tương ứng
function getPageAndMovieFromHash() {
  const hash = window.location.hash || "";
  const lower = hash.toLowerCase();
  if (lower === "#admin" || lower.startsWith("#admin/")) {
    return { page: "admin", movieId: "" };
  }
  if (lower === "#xac-nhan-dat-ve" || lower.startsWith("#xac-nhan-dat-ve/")) {
    return { page: "confirmation", movieId: "", orderCode: safeDecode(hash.split("/")[1] || "") };
  }
  if (
    lower.startsWith("#chi-tiet-ve") ||
    lower === "#ve-cua-toi" ||
    lower === "#lich-su-dat-ve" ||
    lower === "#my-tickets"
  ) {
    const parts = hash.split("/");
    const orderCode = parts.length > 1 ? safeDecode(parts[1]) : "";
    return { page: "tickets", movieId: "", orderCode };
  }
  if (lower === "#thanh-toan" || lower === "#xem-lai-combo") {
    return { page: "checkout", movieId: "" };
  }
  if (lower === "#chon-combo") {
    return { page: "combo", movieId: "" };
  }

  if (lower === "#quan-ly-tai-khoan") {
    return { page: "admin-accounts", movieId: "" };
  }

  if (lower === "#tai-khoan") {
  return { page: "profile", movieId: "" };
}

  // Trang đăng nhập / đăng ký
  if (
    lower === "#dang-nhap" ||
    lower === "#dang-ky" ||
    lower === "#login" ||
    lower === "#register"
  ) {
    return {
      page: "auth",
      movieId: "",
    };
  }

  if (["#dat-ve", "#lich-chieu", "#showtimes", "#lich-chieu-phim"].includes(lower)) return { page: "showtimes" };
  if (lower.startsWith("#chon-ghe/") || lower === "#chon-ghe") return { page: "seat-selection", showtimeId: hash.split('/')[1] || '' };
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

  if (
    lower === "#trang-chu" ||
    lower === "#home" ||
    lower === "#dat-ve" ||
    lower === "#uu-dai" ||
    lower === "#trai-nghiem" ||
    lower === "#lien-he"
  ) {
    return { page: "home", movieId: "" };
  }

  // Mặc định ban đầu hiển thị Trang chủ (hoặc trang chi tiết nếu có hash)
  return { page: "home", movieId: "" };
}

function safeDecode(value) { try { return decodeURIComponent(value); } catch { return ''; } }

function App() {
  const initial = getPageAndMovieFromHash();
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [selectedMovieId, setSelectedMovieId] = useState(initial.movieId || "dune-2");
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(initial.showtimeId || "");
  const [selectedMovieData, setSelectedMovieData] = useState(null);
  const [selectedOrderCode, setSelectedOrderCode] = useState(initial.orderCode || "");

  // Lắng nghe sự kiện hashchange của trình duyệt
  useEffect(() => {
    function handleHashChange() {
      const state = getPageAndMovieFromHash();
      setCurrentPage(state.page);
      setSelectedShowtimeId(state.showtimeId || "");
      if (state.movieId) {
        setSelectedMovieId(state.movieId);
        setSelectedMovieData(null);
      }
      if (state.orderCode !== undefined) {
        setSelectedOrderCode(state.orderCode);
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
      // Khi click vào thanh Phim, chuyển sang trang Danh sách phim
      setCurrentPage("movies");
      window.location.hash = "#phim";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === 'showtimes' || page === 'lich-chieu') {
      setCurrentPage('showtimes'); window.location.hash = '#lich-chieu';
    } else if (page === 'seat-selection') {
      handleSelectShowtime(target);
    } else {
      setCurrentPage("home");
      window.location.hash = target || "#trang-chu";
      if (!target || target === "#trang-chu") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setTimeout(() => {
          const el = document.querySelector(target);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
      }
    }
  }

  function handleSelectShowtime(showtime) {
    if (!showtime?.id) return;
    setSelectedShowtimeId(String(showtime.id));
    setCurrentPage('seat-selection');
    window.location.hash = '#chon-ghe/' + showtime.id;
    window.scrollTo({top:0});
  }
  function handleSelectMovieAndBook(movie) {
    handleNavigate('movie-detail', movie.id, movie);
  }
  if (currentPage === 'seat-selection') return <SeatSelectionModal key={selectedShowtimeId} showtimeId={selectedShowtimeId} onClose={() => { window.location.hash = '#lich-chieu'; }} onNavigate={handleNavigate} />;
  if (currentPage === 'showtimes') return <ShowtimesPage onNavigate={handleNavigate} onSelectShowtime={handleSelectShowtime} />;

  if (currentPage === "admin-accounts") {
    return <AdminAccess>{() => <AdminAccounts />}</AdminAccess>;
  }

  if (currentPage === "profile") {
  return <ProfilePage onNavigate={handleNavigate} />;
}

  // Hiển thị trang đăng nhập / đăng ký
  if (currentPage === "auth") {
    return <AuthPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "admin") {
    return <AdminAccess>{(session) => <AdminPage {...session} />}</AdminAccess>;
  }
  if (currentPage === "confirmation") {
    return <ConfirmationPage orderCode={selectedOrderCode} />;
  }
  if (currentPage === "tickets") {
    return <TicketsPage targetOrderCode={selectedOrderCode} />;
  }
  if (currentPage === "checkout") {
    return <CheckoutPage />;
  }
  if (currentPage === "combo") {
    return <ComboPage />;
  }

  if (currentPage === "movie-detail") {
    return (
      <MovieDetail
        key={selectedMovieId}
        movieId={selectedMovieId}
        initialMovie={selectedMovieData}
        onNavigate={handleNavigate}
        onSelectMovieAndBook={handleSelectMovieAndBook}
        onSelectShowtime={handleSelectShowtime}
      />
    );
  }

  if (currentPage === "movies") {
    return (
      <MovieList
        onNavigate={handleNavigate}
        onSelectMovieAndBook={handleSelectMovieAndBook}
      />
    );
  }

  return (
    <Home
      onNavigate={handleNavigate}
      onSelectShowtime={handleSelectShowtime}
      selectedMovieIdFromParent={selectedMovieId}
    />
  );
}

export default App;
