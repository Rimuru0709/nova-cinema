import { useState } from "react";

import {
  Wine,
  Monitor,
  Armchair,
  Play,
  Clapperboard,
  Check,
} from "lucide-react";

// ================= DỮ LIỆU MẪU =================

const HERO_IMAGE =
  "https://images.hdqwalls.com/download/2024-dune-part-two-4k-movie-dr-1920x1080.jpg";

const movies = [
  {
    id: "dune",
    title: "Dune: Hành Tinh Cát – Phần Hai",
    shortTitle: "Dune: Part Two",
    genre: "Hành động / Khoa học viễn tưởng",
    duration: 166,
    age: "T16",
    rating: "9.6",
    reviews: "4.2K",
    format: "IMAX LASER",
    country: "international",
    imax: true,
    image:
      "https://bucket-image.inkmaginecms.com/version/hd/1/image/2024/07/8becb910-7d74-4098-aa73-2eea972379b6.jpg",
    description:
      "Cuộc hành trình của Paul Atreides khi anh hợp nhất với Chani và những người Fremen để tìm lại công lý. Đứng trước sự giằng xé giữa tình yêu và vận mệnh, anh phải ngăn chặn một tương lai đen tối chỉ mình anh có thể nhìn thấy.",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    shortTitle: "Oppenheimer",
    genre: "Chính kịch / Lịch sử",
    duration: 180,
    age: "T18",
    rating: "9.4",
    reviews: "8.9K",
    format: "DOLBY CINEMA",
    country: "international",
    imax: true,
    image:
      "https://pics.filmaffinity.com/oppenheimer-389531177-large.jpg",
    description:
      "Bước vào câu chuyện của nhà vật lý J. Robert Oppenheimer, nơi những khám phá khoa học đi cùng các lựa chọn làm thay đổi lịch sử.",
  },
  {
    id: "mai",
    title: "Mai",
    shortTitle: "Mai",
    genre: "Tâm lý / Tình cảm",
    duration: 131,
    age: "T18",
    rating: "9.1",
    reviews: "12K",
    format: "GOLD LOUNGE",
    country: "vietnam",
    imax: false,
    image:
      "https://phunuso.mediacdn.vn/603486343963435008/2024/2/20/photo-1-17084186348131729412485-1708419060885-17084190612161848993804.jpg",
    description:
      "Câu chuyện về một người phụ nữ với nhiều nỗi niềm quá khứ, một cuộc gặp gỡ bất ngờ và hành trình đi tìm quyền được hạnh phúc.",
  },
  {
    id: "godzilla",
    title: "Godzilla x Kong: Đế Chế Mới",
    shortTitle: "Godzilla x Kong",
    genre: "Hành động / Viễn tưởng",
    duration: 115,
    age: "T13",
    rating: "8.9",
    reviews: "3.1K",
    format: "4DX 3D",
    country: "international",
    imax: false,
    image:
      "https://movingstory-prod.imgix.net/mx/posters/godzilla-x-kong-the-new-empire-a9c186e4.jpg",
    description:
      "Hai Titan huyền thoại cùng đối mặt với một hiểm họa ẩn sâu trong lòng đất, đe dọa sự tồn tại của cả thế giới.",
  },
];

const upcomingMovies = [
  {
    id: "deadpool",
    title: "Deadpool & Wolverine",
    genre: "Hành động / Hài hước",
    days: 6,
    image:
      "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc%40._V1_.jpg",
    description:
      "Sự kết hợp bùng nổ của hai cá tính đối lập trong một chuyến phiêu lưu đầy bất ngờ.",
  },
  {
    id: "joker",
    title: "Joker: Folie à Deux",
    genre: "Tâm lý / Nhạc kịch / Tội phạm",
    days: 14,
    image:
      "https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/1724085929834-HJWZ76KQGWCQCCD8F3L5/Screenshot%2B2024-08-19%2Bat%2B9.41.31%E2%80%AFAM.jpg",
    description:
      "Bản tình ca đầy biến động giữa Arthur Fleck và Harley Quinn trong thế giới của âm nhạc.",
  },
  {
    id: "gladiator",
    title: "Gladiator II",
    genre: "Sử thi / Hành động",
    days: 28,
    image:
      "https://cf-img-a-in.tosshub.com/sites/visualstory/wp/2024/11/Snapinstaapp_461744425_449342244797266_453919909910667894_n_1080ITG-1732181655903.jpg?size=%2A%3A900",
    description:
      "Huyền thoại đấu trường La Mã trở lại với những trận chiến và khát vọng giành lại tự do.",
  },
];

const experiences = [
  {
    icon: Wine,
    eyebrow: "PRIVATE HOSPITALITY",
    title: "NOVA Gold Lounge",
    description:
      "Không gian đón tiếp sang trọng, riêng tư. Thư giãn cùng đồ uống và dịch vụ chăm sóc trước khi bước vào thế giới điện ảnh.",
    note: "Đặc quyền từ hạng Gold",
  },
  {
    icon: Monitor,
    eyebrow: "NEXT-GEN PROJECTION",
    title: "Màn hình IMAX Laser 4K",
    description:
      "Không gian trình chiếu rộng lớn, hình ảnh sắc nét và âm thanh sống động đưa bạn đến gần hơn với từng khoảnh khắc.",
    note: "Đắm chìm trong từng khung hình",
  },
  {
    icon: Armchair,
    eyebrow: "ULTIMATE COMFORT",
    title: "Ghế Da Cao Cấp Ngả Tự Động",
    description:
      "Thiết kế rộng rãi, đệm ngồi êm ái cùng khả năng điều chỉnh độ ngả giúp bạn tận hưởng bộ phim thật thoải mái.",
    note: "Thư giãn theo cách của bạn",
  },
];

const cinemas = [
  "NOVA Landmark 81",
  "NOVA Westlake",
  "NOVA Vincom Bà Triệu",
];

const showtimes = ["10:30", "13:00", "16:45", "19:30", "22:15"];

const filters = [
  { id: "all", label: "Tất cả phim" },
  { id: "imax", label: "IMAX Experience" },
  { id: "vietnam", label: "Phim Việt Nam" },
  { id: "international", label: "Phim Quốc Tế" },
];

const heroMovies = [movies[0], movies[1], movies[3]];

// ================= HÀM HỖ TRỢ =================

// Bỏ dấu tiếng Việt để hỗ trợ tìm kiếm.
function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

// Lấy ngày hiện tại theo định dạng YYYY-MM-DD.
function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Tính ngày chiếu minh họa cho phim sắp chiếu.
function getFutureDate(days) {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return date.toLocaleDateString("vi-VN");
}

// Mở trang tìm trailer trên YouTube.
function trailerUrl(title) {
  const query = encodeURIComponent(`${title} official trailer`);

  return `https://www.youtube.com/results?search_query=${query}`;
}

// Ẩn ảnh nếu đường dẫn ảnh không tải được.
function hideBrokenImage(event) {
  event.currentTarget.style.display = "none";
}

// ================= XỬ LÝ TRANG CHỦ =================

export default function useHome() {
  // Menu và tìm kiếm
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Từ khóa và nhóm phim
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Banner
  const [heroIndex, setHeroIndex] = useState(0);

  // Thông tin chọn suất chiếu
  const [selectedMovieId, setSelectedMovieId] = useState("dune");
  const [cinema, setCinema] = useState(cinemas[0]);
  const [date, setDate] = useState(getToday);
  const [time, setTime] = useState("19:30");

  // Phim đang theo dõi và cửa sổ thông tin
  const [interestedMovies, setInterestedMovies] = useState([]);
  const [modal, setModal] = useState(null);

  const featuredMovie = heroMovies[heroIndex];

  const selectedMovie =
    movies.find((movie) => movie.id === selectedMovieId) || movies[0];

  // Lọc phim theo từ khóa và nhóm phim.
  const visibleMovies = movies.filter((movie) => {
    const matchesSearch = normalizeText(movie.title).includes(
      normalizeText(query),
    );

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "imax" && movie.imax) ||
      movie.country === activeFilter;

    return matchesSearch && matchesFilter;
  });

  function closeMenu() {
    setMenuOpen(false);
  }

  // Chọn phim và cuộn đến khu vực chọn suất.
  function chooseMovie(movie) {
    setSelectedMovieId(movie.id);

    document.getElementById("dat-ve")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  // Hiển thị thông tin chi tiết phim.
  function showMovieDetail(movie) {
    setModal({
      title: movie.title,
      content: (
        <div className="movie-detail">
          <img
            src={movie.image}
            alt={`Poster ${movie.title}`}
            onError={hideBrokenImage}
          />

          <div>
            <span className="text-gold">{movie.genre}</span>

            <p>
              <strong>Thời lượng:</strong> {movie.duration} phút
            </p>

            <p>
              <strong>Phân loại:</strong> {movie.age}
            </p>

            <p>{movie.description}</p>

            <a
              className="button button-dark"
              href={trailerUrl(movie.title)}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={16} />
              Tìm trailer
            </a>
          </div>
        </div>
      ),
    });
  }

  // Xem lại lựa chọn; chưa tạo vé hoặc thanh toán.
  function previewBooking(event) {
    event.preventDefault();

    const formattedDate = new Date(
      `${date}T12:00:00`,
    ).toLocaleDateString("vi-VN");

    setModal({
      title: "Suất chiếu bạn đã chọn",
      content: (
        <>
          <dl className="booking-summary">
            <div>
              <dt>Phim</dt>
              <dd>{selectedMovie.title}</dd>
            </div>

            <div>
              <dt>Rạp</dt>
              <dd>{cinema}</dd>
            </div>

            <div>
              <dt>Ngày chiếu</dt>
              <dd>{formattedDate}</dd>
            </div>

            <div>
              <dt>Giờ chiếu</dt>
              <dd>{time}</dd>
            </div>
          </dl>

          <p className="muted">
            Đây là bước xem lại lựa chọn. Chưa có vé được tạo và chưa
            phát sinh thanh toán.
          </p>
        </>
      ),
    });
  }

  // Thêm hoặc bỏ theo dõi phim.
  function toggleInterest(id) {
    setInterestedMovies((current) =>
      current.includes(id)
        ? current.filter((movieId) => movieId !== id)
        : [...current, id],
    );
  }

  // Hiển thị danh sách phim đang theo dõi.
  function showNotifications() {
    const selected = upcomingMovies.filter((movie) =>
      interestedMovies.includes(movie.id),
    );

    setModal({
      title: "Phim bạn quan tâm",
      content: selected.length ? (
        <>
          <ul className="interest-list">
            {selected.map((movie) => (
              <li key={movie.id}>
                <Clapperboard size={18} />
                {movie.title}
              </li>
            ))}
          </ul>

          <p className="muted">
            Danh sách được ghi nhớ trong phiên xem hiện tại.
          </p>
        </>
      ) : (
        <p>
          Bạn chưa đánh dấu phim nào. Chọn “Theo dõi phim” trong phần
          Phim Sắp Khởi Chiếu để thêm vào danh sách.
        </p>
      ),
    });
  }

  // Hiển thị thông tin hội viên.
  function showMembership() {
    setModal({
      title: "NOVA Elite Club",
      content: (
        <>
          <p>
            Khám phá trải nghiệm hội viên với không gian điện ảnh và
            dịch vụ dành riêng cho bạn.
          </p>

          <ul className="benefit-list">
            <li>
              <Check size={18} />
              Ưu đãi vé theo chương trình hội viên
            </li>

            <li>
              <Check size={18} />
              Tích điểm khi sử dụng dịch vụ
            </li>

            <li>
              <Check size={18} />
              Quyền lợi tại khu vực Gold Lounge
            </li>
          </ul>

          <p className="muted">
            Các quyền lợi trên giao diện là nội dung minh họa.
          </p>
        </>
      ),
    });
  }

  // Trả về dữ liệu và hàm để home.jsx sử dụng.
  return {
    HERO_IMAGE,
    movies,
    upcomingMovies,
    experiences,
    cinemas,
    showtimes,
    filters,
    heroMovies,

    getToday,
    getFutureDate,
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

    closeMenu,
    chooseMovie,
    showMovieDetail,
    previewBooking,
    toggleInterest,
    showNotifications,
    showMembership,
  };
}