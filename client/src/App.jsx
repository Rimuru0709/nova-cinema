import { useState, useEffect } from "react";
import Home from "./home/home.jsx";
import MovieList from "./movies/MovieList.jsx";
import MovieDetail from "./movies/MovieDetail.jsx";
import AuthPage from "./auth/AuthPage.jsx";
import ProfilePage from "./profile/ProfilePage.jsx";
import AdminAccounts from "./profile/AdminAccounts.jsx";

// Phân tích URL hash để xác định trang và ID phim tương ứng
function getPageAndMovieFromHash() {
  const hash = window.location.hash || "";
  const lower = hash.toLowerCase();

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

function App() {
  const initial = getPageAndMovieFromHash();
  const [currentPage, setCurrentPage] = useState(initial.page);
  const [selectedMovieId, setSelectedMovieId] = useState(initial.movieId || "dune-2");
  const [selectedMovieData, setSelectedMovieData] = useState(null);

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
      // Khi click vào thanh Phim, chuyển sang trang Danh sách phim
      setCurrentPage("movies");
      window.location.hash = "#phim";
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Khi người dùng bấm "Đặt vé ngay" hoặc chọn suất từ trang chi tiết
  function handleSelectMovieAndBook(movie) {
    setSelectedMovieId(movie.id || "dune-2");
    setCurrentPage("home");
    window.location.hash = "#dat-ve";
    setTimeout(() => {
      const el = document.querySelector("#dat-ve");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  }

  if (currentPage === "admin-accounts") {
    return <AdminAccounts />;
  }

  if (currentPage === "profile") {
  return <ProfilePage onNavigate={handleNavigate} />;
}

  // Hiển thị trang đăng nhập / đăng ký
  if (currentPage === "auth") {
    return <AuthPage onNavigate={handleNavigate} />;
  }

  if (currentPage === "movie-detail") {
    return (
      <MovieDetail
        movieId={selectedMovieId}
        initialMovie={selectedMovieData}
        onNavigate={handleNavigate}
        onSelectMovieAndBook={handleSelectMovieAndBook}
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
      selectedMovieIdFromParent={selectedMovieId}
    />
  );
}

export default App;
