import { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Ticket,
  Info,
  Car,
  Wine,
  Crown,
  Compass,
} from "lucide-react";
import SiteHeader from "../components/SiteHeader.jsx";
import SiteFooter from "../components/SiteFooter.jsx";
import "./showtimesPage.css";

const CINEMAS_DATA = [
  { id: "1", city: "hcm", name: "NOVA Landmark 81", address: "Tầng B1, TTTM Vincom Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. HCM", hallsCount: 3, hallsInfo: "3 PHÒNG CHIẾU • TẦNG B1 VINCOM LANDMARK" },
  { id: "2", city: "hanoi", name: "NOVA Westlake", address: "Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội", hallsCount: 2, hallsInfo: "2 PHÒNG CHIẾU • TẦNG 4 LOTTE MALL" },
  { id: "3", city: "hanoi", name: "NOVA Vincom Bà Triệu", address: "Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội", hallsCount: 2, hallsInfo: "2 PHÒNG CHIẾU • TẦNG 6 THÁP B" },
];

const TECH_PILLS = [
  { id: "all", label: "Tất cả hình thức" },
  { id: "imax", label: "IMAX Laser" },
  { id: "vip", label: "VIP Gold Lounge & Suites" },
  { id: "atmos", label: "Dolby Atmos" },
  { id: "screenx", label: "ScreenX 270°" },
];

export default function ShowtimesPage({ onNavigate, onSelectShowtime }) {
  const [selectedCity, setSelectedCity] = useState("hcm");
  const [selectedCinemaId, setSelectedCinemaId] = useState("1");
  const [selectedTech, setSelectedTech] = useState("all");
  const [searchMovieQuery, setSearchMovieQuery] = useState("");
  const [activeDateIndex, setActiveDateIndex] = useState(0);

  // 7 ngày chiếu bắt đầu từ 26/10 như minh họa chính xác trong Ảnh 2
  const dateList = useMemo(() => {
    return [
      { id: "2026-10-26", num: "26", dayName: "Thứ Bảy", tag: "LỄ HỘI PHIM IMAX", isHot: true },
      { id: "2026-10-27", num: "27", dayName: "Chủ Nhật", tag: "Cuối tuần", isHot: false },
      { id: "2026-10-28", num: "28", dayName: "Thứ Hai", tag: "Prime Day -50%", isHot: false },
      { id: "2026-10-29", num: "29", dayName: "Thứ Ba", tag: "Vé Bước Nhảy", isHot: false },
      { id: "2026-10-30", num: "30", dayName: "Thứ Tư", tag: "Tri Ân Hội Viên", isHot: false },
      { id: "2026-10-31", num: "31", dayName: "Thứ Năm", tag: "Halloween", isHot: false },
      { id: "2026-11-01", num: "01", dayName: "Thứ Sáu", tag: "Phim Chiếu Sớm", isHot: false },
    ];
  }, []);

  const selectedDate = dateList[activeDateIndex]?.id || "2026-10-26";
  const activeCinema = CINEMAS_DATA.find((c) => c.id === selectedCinemaId) || CINEMAS_DATA[0];

  // Danh mục 4 phim hiển thị đúng 100% Ảnh 2
  const moviesCatalog = useMemo(() => {
    const movies = [
      {
        id: "dune",
        title: "Dune: Hành Tinh Cát – Phần Hai",
        subTitle: "Dune: Part Two (2024)",
        poster: "https://bucket-image.inkmaginecms.com/version/hd/1/image/2024/07/8becb910-7d74-4098-aa73-2eea972379b6.jpg",
        age: "T16",
        formats: ["2D", "IMAX"],
        director: "Denis Villeneuve",
        duration: 166,
        genre: "Hành động / Khoa học viễn tưởng",
        synopsis: "Hành trình huyền thoại của Paul Atreides khi anh hợp nhất với Chani và người Fremen trên sa mạc cằn cỗi Arrakis, nhằm thực hiện cuộc trả thù những kẻ hủy hoại gia tộc mình...",
        halls: [
          {
            name: "Phòng Chiếu IMAX Laser Grand 01",
            tag: "IMAX LASER",
            tech: "imax",
            desc: "Màn hình 22m • Âm thanh vòm 12 kênh độc quyền",
            slots: [
              { id: 1, time: "10:30", type: "12 Phụ đề", seats: "Còn 84/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
              { id: 2, time: "13:45", type: "12 Phụ đề", seats: "Còn 42/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
              { id: 3, time: "16:30", type: "12 Phụ đề", seats: "Còn 35/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
              { id: 4, time: "19:30", type: "Sắp hết", seats: "Chỉ còn 8 ghế", price: "240.000đ", priceNum: 240000, almostOut: true, roomName: "Phòng IMAX Laser 01", isHot: true },
              { id: 5, time: "22:15", type: "Suất đêm", seats: "Còn 78/145 ghế", price: "190.000đ", priceNum: 190000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
            ],
          },
          {
            name: "Phòng Chiếu Hoàng Gia VIP 01",
            tag: "VIP LOUNGE & SUITES",
            tech: "vip",
            desc: "Bàn sofa bọc nhung cao cấp, Canapés & 2nd drink miễn phí",
            slots: [
              { id: 6, time: "11:15", type: "VIP 2D", seats: "Còn 14/30 ghế", price: "350.000đ", priceNum: 350000, almostOut: false, roomName: "Phòng Hoàng Gia VIP 01" },
              { id: 7, time: "14:30", type: "VIP 2D", seats: "Còn 12/30 ghế", price: "350.000đ", priceNum: 350000, almostOut: false, roomName: "Phòng Hoàng Gia VIP 01" },
              { id: 8, time: "17:45", type: "VIP 2D", seats: "Còn 19/30 ghế", price: "350.000đ", priceNum: 350000, almostOut: false, roomName: "Phòng Hoàng Gia VIP 01" },
              { id: 9, time: "20:30", type: "VIP 2D", seats: "Chỉ còn 6 ghế", price: "380.000đ", priceNum: 380000, almostOut: true, roomName: "Phòng Hoàng Gia VIP 01" },
            ],
          },
        ],
      },
      {
        id: "oppenheimer",
        title: "Oppenheimer",
        subTitle: "Oppenheimer (2023)",
        poster: "/oppenheimer.jpg",
        age: "T18",
        formats: ["2D", "DOLBY CINEMA"],
        director: "Christopher Nolan",
        duration: 180,
        genre: "Lịch sử / Chính kịch",
        synopsis: "Câu chuyện chân thực và nghẹt thở về 'cha đẻ của bom nguyên tử' J. Robert Oppenheimer trong dự án Manhattan, bước ngoặt định hình lịch sử nhân loại...",
        halls: [
          {
            name: "Phòng Chiếu Dolby Atmos Hall 04",
            tag: "DOLBY ATMOS",
            tech: "atmos",
            desc: "Hệ thống âm thanh 64 loa độc lập • Kính 3D siêu nhẹ",
            slots: [
              { id: 10, time: "09:15", type: "Dolby Atmos", seats: "Còn 64/120 ghế", price: "160.000đ", priceNum: 160000, almostOut: false, roomName: "Phòng Dolby Atmos 04" },
              { id: 11, time: "14:00", type: "Dolby Atmos", seats: "Còn 48/120 ghế", price: "170.000đ", priceNum: 170000, almostOut: false, roomName: "Phòng Dolby Atmos 04" },
              { id: 12, time: "18:15", type: "Dolby Atmos", seats: "Còn 32/120 ghế", price: "185.000đ", priceNum: 185000, almostOut: false, roomName: "Phòng Dolby Atmos 04" },
              { id: 13, time: "21:45", type: "Dolby Atmos", seats: "Còn 70/120 ghế", price: "160.000đ", priceNum: 160000, almostOut: false, roomName: "Phòng Dolby Atmos 04" },
            ],
          },
          {
            name: "Phòng Chiếu IMAX Laser Grand 01",
            tag: "IMAX LASER",
            tech: "imax",
            desc: "Màn hình 22m • Âm thanh vòm đa tầng",
            slots: [
              { id: 14, time: "10:45", type: "IMAX 2D", seats: "Còn 55/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
              { id: 15, time: "15:15", type: "IMAX 2D", seats: "Còn 40/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
            ],
          },
        ],
      },
      {
        id: "mai",
        title: "Mai",
        subTitle: "Mai (2024)",
        poster: "https://phunuso.mediacdn.vn/603486343963435008/2024/2/20/photo-1-17084186348131729412485-1708419060885-17084190612161848993804.jpg",
        age: "T18",
        formats: ["2D", "GOLD LOUNGE"],
        director: "Trấn Thành",
        duration: 131,
        genre: "Tâm lý / Tình cảm",
        synopsis: "Câu chuyện tình yêu đầy trắc trở giữa Mai - người phụ nữ massage chịu nhiều tổn thương và Dương - chàng trai lãng tử theo đuổi đam mê âm nhạc...",
        halls: [
          {
            name: "Phòng Chiếu VIP 02",
            tag: "VIP LOUNGE & SUITES",
            tech: "vip",
            desc: "Ghế Sofa đôi ngả 135 độ • Phục vụ rượu vang tại chỗ",
            slots: [
              { id: 16, time: "10:45", type: "VIP 2D", seats: "Còn 18/30 ghế", price: "350.000đ", priceNum: 350000, almostOut: false, roomName: "Phòng Chiếu VIP 02" },
              { id: 17, time: "16:00", type: "VIP 2D", seats: "Còn 12/30 ghế", price: "350.000đ", priceNum: 350000, almostOut: false, roomName: "Phòng Chiếu VIP 02" },
            ],
          },
          {
            name: "Phòng Tiêu Chuẩn Hall 02",
            tag: "STANDARD 2D",
            tech: "all",
            desc: "Hệ thống âm thanh vòm 7.1 • Ghế nỉ bọc đệm êm ái",
            slots: [
              { id: 18, time: "13:00", type: "Tiêu chuẩn", seats: "Còn 80/100 ghế", price: "90.000đ", priceNum: 90000, almostOut: false, roomName: "Phòng Tiêu Chuẩn 02" },
              { id: 19, time: "17:30", type: "Tiêu chuẩn", seats: "Còn 65/100 ghế", price: "100.000đ", priceNum: 100000, almostOut: false, roomName: "Phòng Tiêu Chuẩn 02" },
              { id: 20, time: "22:45", type: "Suất đêm", seats: "Còn 92/100 ghế", price: "85.000đ", priceNum: 85000, almostOut: false, roomName: "Phòng Tiêu Chuẩn 02" },
            ],
          },
        ],
      },
      {
        id: "godzilla",
        title: "Godzilla x Kong: Đế Chế Mới",
        subTitle: "Godzilla x Kong: The New Empire (2024)",
        poster: "https://movingstory-prod.imgix.net/mx/posters/godzilla-x-kong-the-new-empire-a9c186e4.jpg",
        age: "T13",
        formats: ["3D", "SCREENX"],
        director: "Adam Wingard",
        duration: 115,
        genre: "Hành động / Viễn tưởng",
        synopsis: "Hai sinh vật cổ đại huyền thoại bắt tay đối đầu với một mối đe dọa khổng lồ giấu kín trong lòng Trái Đất, đe dọa sự tồn vong của nhân loại...",
        halls: [
          {
            name: "Phòng Chiếu Toàn Cảnh ScreenX Hall 05",
            tag: "SCREENX",
            tech: "screenx",
            desc: "Màn hình mở rộng 3 mặt tường góc 270 độ siêu thực",
            slots: [
              { id: 21, time: "14:15", type: "ScreenX 2D", seats: "Còn 45/90 ghế", price: "170.000đ", priceNum: 170000, almostOut: false, roomName: "Phòng ScreenX 05" },
              { id: 22, time: "18:45", type: "ScreenX 2D", seats: "Còn 28/90 ghế", price: "185.000đ", priceNum: 185000, almostOut: false, roomName: "Phòng ScreenX 05" },
            ],
          },
          {
            name: "Phòng Chiếu IMAX Laser Grand 01",
            tag: "IMAX LASER",
            tech: "imax",
            desc: "Màn hình Laser 22m • Âm thanh vòm đa tầng",
            slots: [
              { id: 23, time: "12:00", type: "IMAX 3D", seats: "Còn 50/145 ghế", price: "210.000đ", priceNum: 210000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
              { id: 24, time: "23:00", type: "Suất đêm", seats: "Còn 95/145 ghế", price: "190.000đ", priceNum: 190000, almostOut: false, roomName: "Phòng IMAX Laser 01" },
            ],
          },
        ],
      },
    ];

    let filtered = movies;
    if (searchMovieQuery.trim()) {
      const q = searchMovieQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) => m.title.toLowerCase().includes(q) || m.subTitle.toLowerCase().includes(q) || m.director.toLowerCase().includes(q)
      );
    }

    if (selectedTech !== "all") {
      filtered = filtered.map((m) => ({
        ...m,
        halls: m.halls.filter((h) => h.tech === selectedTech),
      })).filter((m) => m.halls.length > 0);
    }

    return filtered;
  }, [searchMovieQuery, selectedTech]);

  return (
    <div className="showtimes-page">
      {/* 1. Header đồng bộ 100% Ảnh 2 */}
      <SiteHeader activeNav="showtimes" onNavigate={onNavigate} />

      <div className="showtimes-container">
        {/* 2. Breadcrumbs */}
        <div className="showtimes-breadcrumb">
          <a href="#trang-chu" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate("home"); }}>
            Trang chủ
          </a>
          <span>&gt;</span>
          <a href="#lich-chieu">Lịch chiếu toàn quốc</a>
          <span>&gt;</span>
          <span className="current">{activeCinema.name}</span>
        </div>

        {/* 3. Hero Banner */}
        <div className="showtimes-hero">
          <div className="showtimes-hero-left">
            <span className="showtimes-hero-badge">CỤM RẠP TIÊU CHUẨN VIP GOLD</span>
            <h1 className="showtimes-hero-title">Lịch Chiếu Phim Đẳng Cấp Thượng Lưu</h1>
            <p className="showtimes-hero-subtitle">
              Khám phá trải nghiệm rạp chiếu sang trọng hàng đầu tại cụm rạp NOVA CINEMA LANDMARK 81. Đắm chìm vào công nghệ trình chiếu IMAX GT Laser dual 4K, hệ thống độc quyền âm thanh vòm 12 kênh, khu vực sảnh chờ riêng biệt Gold Lounge & Suites và hệ thống ẩm thực Butler Service đa chiều.
            </p>
          </div>

          <div className="showtimes-hero-right">
            <div className="showtimes-cinema-pill">
              <MapPin size={20} color="var(--gold, #ffce6d)" />
              <div>
                <div style={{ fontSize: "0.75rem", color: "#a8b8c8" }}>Cụm rạp đang xem:</div>
                <strong style={{ fontSize: "0.95rem" }}>{activeCinema.name}</strong>
                <div style={{ fontSize: "0.72rem", color: "var(--gold, #ffce6d)", marginTop: "2px" }}>
                  {activeCinema.hallsInfo}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Khung bộ lọc 4 tiêu chí */}
        <div className="showtimes-filter-card">
          <div className="showtimes-filter-grid">
            {/* Tiêu chí 1: Khu vực */}
            <div className="showtimes-filter-item">
              <label className="showtimes-filter-label">1. KHU VỰC / TỈNH THÀNH</label>
              <div className="showtimes-city-buttons">
                <button
                  type="button"
                  className={`showtimes-city-btn ${selectedCity === "hcm" ? "active" : ""}`}
                  onClick={() => { setSelectedCity("hcm"); setSelectedCinemaId("1"); }}
                >
                  TP. HCM
                </button>
                <button
                  type="button"
                  className={`showtimes-city-btn ${selectedCity === "hanoi" ? "active" : ""}`}
                  onClick={() => { setSelectedCity("hanoi"); setSelectedCinemaId("2"); }}
                >
                  Hà Nội
                </button>
                <button
                  type="button"
                  className={`showtimes-city-btn ${selectedCity === "danang" ? "active" : ""}`}
                  onClick={() => setSelectedCity("danang")}
                >
                  Đà Nẵng
                </button>
              </div>
            </div>

            {/* Tiêu chí 2: Cụm rạp */}
            <div className="showtimes-filter-item">
              <label className="showtimes-filter-label">2. CHỌN CỤM RẠP CHIẾU</label>
              <select
                className="showtimes-select"
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
              >
                {CINEMAS_DATA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city === "hcm" ? "Tầng B1" : "Hà Nội"})
                  </option>
                ))}
              </select>
            </div>

            {/* Tiêu chí 3: Định dạng */}
            <div className="showtimes-filter-item">
              <label className="showtimes-filter-label">3. ĐỊNH DẠNG CÔNG NGHỆ</label>
              <select
                className="showtimes-select"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
              >
                <option value="all">Tất cả định dạng chuẩn VIP</option>
                <option value="imax">IMAX Laser 4K</option>
                <option value="vip">VIP Gold Lounge & Suites</option>
                <option value="atmos">Dolby Atmos 3D</option>
                <option value="screenx">ScreenX 270°</option>
              </select>
            </div>

            {/* Tiêu chí 4: Tìm tên phim */}
            <div className="showtimes-filter-item">
              <label className="showtimes-filter-label">4. TÌM TÊN PHIM</label>
              <input
                type="text"
                className="showtimes-input"
                placeholder="Tìm tên phim, diễn viên..."
                value={searchMovieQuery}
                onChange={(e) => setSearchMovieQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Hàng chọn nhanh công nghệ */}
          <div className="showtimes-tech-pills">
            <div className="showtimes-pills-group">
              {TECH_PILLS.map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  className={`showtimes-tech-pill ${selectedTech === pill.id ? "active" : ""}`}
                  onClick={() => setSelectedTech(pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="showtimes-time-note">
              <Clock size={14} color="var(--gold, #ffce6d)" />
              <span>Giờ chiếu tính theo múi giờ Việt Nam (UTC+7)</span>
            </div>
          </div>
        </div>

        {/* 5. Dải chọn ngày chiếu */}
        <div className="showtimes-date-card">
          <div className="showtimes-date-header">
            <div className="showtimes-date-title">
              <Calendar size={18} color="var(--gold, #ffce6d)" />
              <span>Chọn Ngày Chiếu • Tháng 10 - 11/2024</span>
            </div>
            <div className="showtimes-date-arrows">
              <button
                type="button"
                className="showtimes-arrow-btn"
                onClick={() => setActiveDateIndex((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="showtimes-arrow-btn"
                onClick={() => setActiveDateIndex((prev) => Math.min(dateList.length - 1, prev + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="showtimes-dates-strip">
            {dateList.map((d, idx) => (
              <div
                key={d.id}
                className={`showtimes-date-item ${activeDateIndex === idx ? "active" : ""}`}
                onClick={() => setActiveDateIndex(idx)}
              >
                {idx === 0 && <span className="showtimes-date-today-badge">HÔM NAY</span>}
                <span className="showtimes-date-num">{d.num}</span>
                <span className="showtimes-date-weekday">{d.dayName}</span>
                <span className="showtimes-date-tag">{d.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Thông báo đặc quyền & Chú thích trạng thái */}
        <div className="showtimes-notice-bar">
          <div className="showtimes-notice-text">
            <Sparkles size={16} color="var(--gold, #ffce6d)" />
            <span>Đặc quyền THÀNH VIÊN: Đổi vé tự động không mất phí trước giờ chiếu 30 phút. Tích lũy điểm Gold thưởng thức ẩm thực.</span>
          </div>

          <div className="showtimes-legend-group">
            <div><span className="showtimes-legend-dot gold" /> Còn nhiều vé</div>
            <div><span className="showtimes-legend-dot red" /> Chỉ còn dưới 10 ghế</div>
            <div><span className="showtimes-legend-dot gray" /> Hết vé</div>
          </div>
        </div>

        {/* 7. Danh sách phim đang chiếu hôm nay */}
        <div className="showtimes-section-title">
          <div>
            <span>Danh Sách Phim Đang Chiếu Hôm Nay</span>
            <span style={{ fontSize: "0.85rem", color: "#38bdf8", fontWeight: 600, marginLeft: "10px" }}>
              [Đang hiển thị {moviesCatalog.length} phim]
            </span>
          </div>
          <span style={{ fontSize: "0.82rem", color: "#7f8fa6", fontWeight: 500 }}>
            Hiển thị giá vé niêm yết theo từng suất, tại rạp {activeCinema.name}
          </span>
        </div>

        {moviesCatalog.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#06192b", borderRadius: "14px", border: "1px solid rgba(190, 212, 232, 0.1)" }}>
            <Info size={36} color="var(--gold, #ffce6d)" style={{ marginBottom: "12px" }} />
            <h4 style={{ margin: "0 0 6px 0", color: "#fff" }}>Không tìm thấy suất chiếu phù hợp</h4>
            <p style={{ margin: 0, color: "#7f8fa6" }}>Vui lòng thay đổi từ khóa tìm kiếm hoặc chọn định dạng công nghệ khác.</p>
          </div>
        ) : (
          moviesCatalog.map((movie) => (
            <div className="showtimes-movie-card" key={movie.id}>
              {/* Cột trái: Poster & Tên */}
              <div className="showtimes-movie-left">
                <div className="showtimes-movie-poster-box">
                  <img src={movie.poster} alt={movie.title} className="showtimes-movie-poster" />
                  <span className="showtimes-movie-age-badge">{movie.age}</span>
                  <div className="showtimes-movie-format-badges">
                    {movie.formats.map((f) => (
                      <span key={f} className="showtimes-movie-format-badge">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="showtimes-movie-actions">
                  <button
                    type="button"
                    className="showtimes-movie-btn"
                    onClick={() => {
                      if (onNavigate) onNavigate("movie-detail", movie.id);
                    }}
                  >
                    Chi tiết
                  </button>
                  <button
                    type="button"
                    className="showtimes-movie-btn"
                    onClick={() => {
                      if (movie.halls[0]?.slots[0]) {
                        const s = movie.halls[0].slots[0];
                        if (onSelectShowtime) {
                          onSelectShowtime({
                            ...s,
                            movieTitle: movie.title,
                            moviePoster: movie.poster,
                            cinemaName: activeCinema.name,
                            format: movie.formats.join(" "),
                          });
                        }
                      }
                    }}
                  >
                    <Ticket size={13} /> Đặt vé
                  </button>
                </div>
              </div>

              {/* Cột phải: Thông tin & Suất chiếu theo từng phòng */}
              <div className="showtimes-movie-right">
                <div className="showtimes-movie-title-row">
                  <h3>{movie.title}</h3>
                  <p className="showtimes-movie-sub-info">
                    {movie.subTitle} • Đạo diễn: {movie.director} • Thời lượng: {movie.duration} phút • {movie.genre}
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "#a8b8c8", margin: "6px 0 0 0", lineHeight: 1.5 }}>
                    {movie.synopsis}
                  </p>
                </div>

                <div className="showtimes-halls-group">
                  {movie.halls.map((hall) => (
                    <div className="showtimes-hall-item" key={hall.name}>
                      <div className="showtimes-hall-header">
                        <div className="showtimes-hall-title-box">
                          <span className="showtimes-hall-tag">{hall.tag}</span>
                          <span className="showtimes-hall-name">{hall.name}</span>
                        </div>
                        <span className="showtimes-hall-features">{hall.desc}</span>
                      </div>

                      <div className="showtimes-slots-grid">
                        {hall.slots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`showtimes-slot-card ${slot.isHot ? "slot-hot" : ""}`}
                            onClick={() => {
                              if (onSelectShowtime) {
                                onSelectShowtime({
                                  id: slot.id,
                                  time: slot.time,
                                  roomName: slot.roomName,
                                  priceNum: slot.priceNum,
                                  movieTitle: movie.title,
                                  moviePoster: movie.poster,
                                  cinemaName: activeCinema.name,
                                  format: hall.tag,
                                  startsAt: `${selectedDate}T${slot.time}:00`,
                                });
                              }
                            }}
                          >
                            {slot.isHot && <span className="slot-hot-ribbon">SỐT VÉ</span>}
                            <span className="showtimes-slot-time">{slot.time}</span>
                            <span className="showtimes-slot-type">{slot.type}</span>
                            <span className={`showtimes-slot-seats ${slot.almostOut ? "almost-out" : ""}`}>
                              {slot.seats}
                            </span>
                            <span className="showtimes-slot-price">{slot.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}

        {/* 8. Thông tin cơ sở rạp chiếu & Bản đồ (Khớp 100% Ảnh 2) */}
        <div className="showtimes-cinema-map-section">
          {/* Cột trái: Thông tin tiện ích rạp */}
          <div className="showtimes-cinema-details-card">
            <h4>Cụm Rạp {activeCinema.name}</h4>
            <p className="showtimes-cinema-addr">{activeCinema.address}</p>

            <div className="showtimes-perks-grid">
              <div className="showtimes-perk-item">
                <Ticket size={18} color="var(--gold, #ffce6d)" />
                <div>
                  <strong>Hệ thống phòng chiếu VIP/IMAX:</strong>
                  <span>1.000+ GHẾ / 3 PHÒNG</span>
                </div>
              </div>

              <div className="showtimes-perk-item">
                <Car size={18} color="var(--gold, #ffce6d)" />
                <div>
                  <strong>Bãi đỗ xe ô tô &amp; xe máy:</strong>
                  <span>Tầng hầm B2 &amp; B3 Vincom (Miễn phí 3h)</span>
                </div>
              </div>

              <div className="showtimes-perk-item">
                <Wine size={18} color="var(--gold, #ffce6d)" />
                <div>
                  <strong>Ẩm thực Thượng hạng:</strong>
                  <span>Tự do chọn Menu Hàng Chuẩn Đạt 5*</span>
                </div>
              </div>

              <div className="showtimes-perk-item">
                <Crown size={18} color="var(--gold, #ffce6d)" />
                <div>
                  <strong>Sảnh VIP Chờ Riêng:</strong>
                  <span>Phục vụ phòng chờ NOVA Gold Lounge</span>
                </div>
              </div>
            </div>

            <div className="showtimes-skyview-note">
              <Sparkles size={14} color="var(--gold, #ffce6d)" />
              <span>Khách hàng sở hữu vé suất chiếu sẽ được miễn phí vé vào cổng Landmark 81 Skyview trong vòng 48h sau suất chiếu.</span>
            </div>
          </div>

          {/* Cột phải: Bản đồ cụm rạp */}
          <div className="showtimes-map-card">
            <div className="showtimes-map-header">
              <Compass size={16} color="var(--gold, #ffce6d)" />
              <span>Bản Đồ Cụm Rạp</span>
            </div>

            <div className="showtimes-map-visual">
              <div className="showtimes-map-pin">
                <MapPin size={22} color="#e74c3c" />
                <span>NOVA Landmark 81</span>
              </div>
              <button
                type="button"
                className="showtimes-direction-btn"
                onClick={() => {
                  window.open("https://maps.google.com/?q=Vincom+Landmark+81", "_blank");
                }}
              >
                Chỉ Đường &rarr;
              </button>
            </div>
            <div className="showtimes-map-footer-note">
              Khoảng cách: 3.2km từ trung tâm TP.HCM (10 phút lái xe)
            </div>
          </div>
        </div>

        {/* 9. Hai khối chính sách & Quy định ở chân trang (Ảnh 2) */}
        <div className="showtimes-policy-grid">
          {/* Box 1: Quy định thanh toán & hủy vé */}
          <div className="showtimes-policy-card">
            <h5>QUY ĐỊNH THANH TOÁN &amp; HỦY VÉ TRỰC TUYẾN</h5>
            <ul>
              <li>Khách hàng có thể hoàn/đổi vé tự do không mất phí trước giờ chiếu 30 phút qua ứng dụng hoặc hotline.</li>
              <li>Xuất hóa đơn điện tử VAT tự động qua email trong vòng 24h.</li>
              <li>Thanh toán bảo mật: Chuẩn PCI-DSS quốc tế.</li>
            </ul>
          </div>

          {/* Box 2: Hướng dẫn phân loại độ tuổi */}
          <div className="showtimes-policy-card">
            <h5>QUY ĐỊNH ĐỘ TUỔI PHIM (THEO LUẬT ĐIỆN ẢNH VN)</h5>
            <div className="showtimes-age-table">
              <div><strong>P:</strong> Mọi lứa tuổi</div>
              <div><strong>K:</strong> Dưới 13 tuổi (cùng phụ huynh)</div>
              <div><strong>T13:</strong> Từ 13 tuổi</div>
              <div><strong>T16:</strong> Từ 16 tuổi</div>
              <div><strong>T18:</strong> Từ 18 tuổi</div>
            </div>
            <p className="showtimes-age-note">
              * Khách hàng vui lòng mang theo giấy tờ tùy thân có hình để xác thực khi vào rạp.
            </p>
          </div>
        </div>
      </div>

      {/* 10. Footer đồng bộ 100% Ảnh 2 */}
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
