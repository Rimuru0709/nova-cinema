import { useState, useEffect } from "react";
import Home from "./home/home.jsx";
import MovieList from "./movies/MovieList.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = (window.location.hash || "").toLowerCase();
    if (hash === "#phim" || hash === "#danh-sach-phim" || hash.startsWith("#phim")) {
      return "movies";
    }
    return "home";
  });

  const [selectedMovieId, setSelectedMovieId] = useState("");

  // Lắng nghe sự kiện hashchange của trình duyệt
  useEffect(() => {
    function handleHashChange() {
      const hash = (window.location.hash || "").toLowerCase();
      if (hash === "#phim" || hash === "#danh-sach-phim" || hash.startsWith("#phim")) {
        setCurrentPage("movies");
      } else {
        setCurrentPage("home");
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Điều hướng giữa các trang
  function handleNavigate(page, targetHash) {
    if (page === "movies") {
      setCurrentPage("movies");
      window.location.hash = "#phim";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentPage("home");
      window.location.hash = targetHash || "#trang-chu";
      if (!targetHash || targetHash === "#trang-chu") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setTimeout(() => {
          const el = document.querySelector(targetHash);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
      }
    }
  }

  // Khi người dùng bấm "Đặt vé ngay" từ trang danh sách phim
  function handleSelectMovieAndBook(movie) {
    setSelectedMovieId(movie.id);
    setCurrentPage("home");
    window.location.hash = "#dat-ve";
    setTimeout(() => {
      const el = document.querySelector("#dat-ve");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
  }

  return currentPage === "movies" ? (
    <MovieList
      onNavigate={handleNavigate}
      onSelectMovieAndBook={handleSelectMovieAndBook}
    />
  ) : (
    <Home
      onNavigate={handleNavigate}
      selectedMovieIdFromParent={selectedMovieId}
    />
  );
}

export default App;
