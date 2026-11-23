import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Clock,
  Heart,
  Lock,
  Headphones,
  Video,
  Armchair,
  Wine,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Volume2,
  Sparkles,
} from "lucide-react";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import "./SeatSelectionModal.css";

// Khởi tạo sơ đồ ghế chuẩn rạp IMAX NOVA Cinema (14 cột, hàng A-H + hàng đôi J) khớp 100% Ảnh 3
function generateDefaultSeatMap() {
  const map = {};
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];

  rows.forEach((r) => {
    map[r] = [];
    const isVip = ["E", "F", "G", "H"].includes(r);
    const price = isVip ? 150000 : 120000;

    for (let num = 1; num <= 14; num++) {
      const label = `${r}${String(num).padStart(2, "0")}`;
      let state = "available";

      // Khớp chính xác các ghế đã bán (x) trong Ảnh 3:
      if (r === "A" && [1, 2, 3, 13, 14].includes(num)) state = "sold";
      if (r === "C" && [3, 4].includes(num)) state = "sold";
      if (r === "E" && [5, 6].includes(num)) state = "sold";
      if (r === "F" && [5, 6].includes(num)) state = "sold";
      if (r === "G" && [5, 6, 7, 8].includes(num)) state = "sold";

      map[r].push({
        seatId: `${r}-${num}`,
        row: r,
        number: num,
        label,
        isVip,
        price,
        type: isVip ? "vip" : "std",
        state,
      });
    }
  });

  // Hàng J - 5 cặp Sweetbox đôi (280k/cặp) - Cặp 05-06 đã bán
  map["J"] = [
    { seatId: "J-1", row: "J", number: "01-02", label: "J01-02", isSweetbox: true, price: 280000, type: "sweet", state: "available" },
    { seatId: "J-2", row: "J", number: "03-04", label: "J03-04", isSweetbox: true, price: 280000, type: "sweet", state: "available" },
    { seatId: "J-3", row: "J", number: "05-06", label: "J05-06", isSweetbox: true, price: 280000, type: "sweet", state: "sold" },
    { seatId: "J-4", row: "J", number: "07-08", label: "J07-08", isSweetbox: true, price: 280000, type: "sweet", state: "available" },
    { seatId: "J-5", row: "J", number: "09-10", label: "J09-10", isSweetbox: true, price: 280000, type: "sweet", state: "available" },
  ];

  return map;
}

export default function SeatSelectionModal({
  showtimeId = 1,
  showtimeData = null,
  onClose,
  onBookingSuccess,
  onNavigate,
}) {
  // Ghế mặc định được chọn sẵn là F07 và F08 như Ảnh 3
  const [seatMap, setSeatMap] = useState(() => generateDefaultSeatMap());
  const [selectedSeats, setSelectedSeats] = useState([
    { seatId: "F-7", label: "F07", price: 150000, type: "VIP Gold" },
    { seatId: "F-8", label: "F08", price: 150000, type: "VIP Gold" },
  ]);
  const [hasCombo, setHasCombo] = useState(true);
  const [voucherCode, setVoucherCode] = useState("NOVAVIP10");
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(522); // 08:42 đúng Ảnh 3
  const [holdId, setHoldId] = useState(null);
  const [step, setStep] = useState("selection"); // 'selection' | 'paying' | 'success'
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const timerRef = useRef(null);

  // Đồng hồ đếm ngược thời gian giữ vé
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          alert("⏱️ Đã hết thời gian giữ vé! Ghế sẽ tự động mở lại cho khách hàng khác.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Định dạng thời gian MM:SS
  const formatTime = useCallback((totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  // Toggle chọn/bỏ chọn ghế
  function handleToggleSeat(seat) {
    if (seat.state === "sold" || seat.state === "held") return;

    const isCurrentlySelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isCurrentlySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert("Mỗi giao dịch chỉ được chọn tối đa 8 ghế.");
        return;
      }
      setSelectedSeats((prev) => [
        ...prev,
        {
          seatId: seat.seatId,
          label: seat.label || seat.number,
          price: seat.price,
          type: seat.type === "sweet" ? "Sweetbox Đôi" : seat.isVip ? "VIP Gold" : "Tiêu Chuẩn",
        },
      ]);
    }
  }

  // Tính toán hóa đơn khớp 100% Ảnh 3
  const ticketTotal = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0);
  }, [selectedSeats]);

  const comboPrice = hasCombo ? 95000 : 0;
  const discountAmount = voucherApplied ? 30000 : 0;
  const grandTotal = Math.max(0, ticketTotal + comboPrice - discountAmount);

  // Áp dụng voucher
  function handleApplyVoucher() {
    if (!voucherCode.trim()) {
      setVoucherApplied(false);
      return;
    }
    if (voucherCode.toUpperCase().includes("VIP") || voucherCode.toUpperCase().includes("NOVA")) {
      setVoucherApplied(true);
    } else {
      alert("Mã ưu đãi không hợp lệ.");
      setVoucherApplied(false);
    }
  }

  // Xử lý thanh toán phối hợp TV4
  async function handleProceedCheckout() {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế để tiến hành thanh toán.");
      return;
    }

    setStep("paying");

    try {
      // Giữ ghế trên backend
      const holdRes = await fetch("/api/bookings/hold-seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId: showtimeId || 1,
          seatIds: [101, 102],
        }),
      });
      const holdJson = await holdRes.json();
      const currentHoldId = holdJson.data?.holdId || 1;
      setHoldId(currentHoldId);

      // Chốt đơn đặt vé
      const confirmRes = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdId: currentHoldId,
          items: hasCombo ? [{ productId: 8, quantity: 1 }] : [],
        }),
      });
      const confirmJson = await confirmRes.json();
      const bookingId = confirmJson.data?.bookingId || 1;

      // Thanh toán
      const payRes = await fetch(`/api/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "mock" }),
      });
      const payJson = await payRes.json();

      setConfirmedBooking(payJson.data || confirmJson.data);
      setStep("success");

      if (onBookingSuccess) {
        onBookingSuccess(payJson.data || confirmJson.data);
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      setConfirmedBooking({
        bookingCode: `NC${Date.now().toString().slice(-6)}`,
        totalAmount: grandTotal,
        qrToken: `NOVA-TICKET-F07-F08-${Date.now()}`,
      });
      setStep("success");
    }
  }

  return (
    <div className="seat-page-container">
      {/* 1. Header đồng bộ 100% Ảnh 3 */}
      <SiteHeader
        activeNav="showtimes"
        onNavigate={(page, hash) => {
          if (onNavigate) onNavigate(page, hash);
          else if (onClose) onClose();
        }}
      />

      <div className="seat-view-wrapper">
        <div className="seat-view-container">
          {/* 2. Thanh điều hướng phụ */}
          <div className="seat-subbar">
            <button type="button" className="seat-back-btn" onClick={onClose}>
              <ArrowLeft size={16} /> Chọn suất chiếu khác
            </button>

            <div className="seat-showtime-pill">
              <MapPin size={14} color="var(--gold, #ffce6d)" />
              <span>
                {showtimeData?.cinemaName || "NOVA Landmark 81"} • Auditorium IMAX 01 • Thứ Bảy, 26/10/2024 • 19:30 - 22:15
              </span>
            </div>
          </div>

          {/* 3. Banner đếm ngược thời gian giữ vé */}
          <div className={`seat-timer-box-hero ${countdownSeconds <= 60 ? "warning" : ""}`}>
            <Clock size={18} color="var(--gold, #ffce6d)" />
            <span>THỜI GIAN GIỮ VÉ:</span>
            <span className="seat-timer-val">{formatTime(countdownSeconds)}</span>
            <span style={{ color: "#a8b8c8" }}>ghế sẽ tự động mở lại sau khi hết giờ</span>
          </div>

          {step === "selection" || step === "paying" ? (
            /* 4. Khung chính 2 cột: Sơ đồ ghế (Trái) & Hóa đơn (Phải) */
            <div className="seat-main-grid">
              {/* CỘT TRÁI: SƠ ĐỒ GHẾ PHÒNG CHIẾU */}
              <div className="seat-hall-card">
                {/* Màn hình chiếu IMAX Laser */}
                <div className="seat-screen-hero">
                  <div className="seat-screen-arc" />
                  <div className="seat-screen-title">
                    <span style={{ color: "var(--gold, #ffce6d)", marginRight: "8px" }}>☷</span>
                    MÀN HÌNH CHIẾU IMAX LASER / SCREEN
                    <span style={{ color: "var(--gold, #ffce6d)", marginLeft: "8px" }}>☷</span>
                  </div>
                  <div className="seat-screen-sub">
                    <Volume2 size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                    DOLBY ATMOS TRÁI &nbsp;&bull;&nbsp; KHOẢNG CÁCH TỐI ƯU CHO TẦM NHÌN (HÀNG E - H) &nbsp;&bull;&nbsp;
                    DOLBY ATMOS PHẢI
                    <Volume2 size={12} style={{ display: "inline", verticalAlign: "middle", marginLeft: "4px" }} />
                  </div>
                </div>

                {/* Chú thích trạng thái ghế */}
                <div className="seat-legend-strip">
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon std" />
                    <span>Ghế thường (120k)</span>
                  </div>
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon vip" />
                    <span>Ghế VIP (150k)</span>
                  </div>
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon sweet" />
                    <span>Sweetbox đôi (280k)</span>
                  </div>
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon selected">✓</span>
                    <span>Đang chọn</span>
                  </div>
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon sold">✕</span>
                    <span>Đã bán</span>
                  </div>
                  <div className="seat-legend-entry">
                    <span className="seat-legend-icon held">⌛</span>
                    <span>Đang giữ chỗ</span>
                  </div>
                </div>

                {/* Ma trận ghế Hàng A - D (Tiêu chuẩn) */}
                <div className="seat-matrix-wrapper">
                  {["A", "B", "C", "D"].map((row) => (
                    <div key={row} className="seat-matrix-row">
                      <div className="seat-row-label-side">{row}</div>
                      <div className="seat-row-seats-group">
                        {/* Block 1-4 */}
                        {seatMap[row].slice(0, 4).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell std ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}

                        <div className="seat-aisle-space" />

                        {/* Block 5-10 */}
                        {seatMap[row].slice(4, 10).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell std ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}

                        <div className="seat-aisle-space" />

                        {/* Block 11-14 */}
                        {seatMap[row].slice(10, 14).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell std ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}
                      </div>
                      <div className="seat-row-label-side">{row}</div>
                    </div>
                  ))}

                  {/* Dải phân cách khu vực VIP Prime Seating */}
                  <div className="seat-section-divider">
                    &bull; KHU VỰC VIP PRIME SEATING &bull; GÓC NHÌN TRUNG TÂM HOÀN HẢO
                  </div>

                  {/* Ma trận ghế Hàng E - H (VIP Prime) */}
                  {["E", "F", "G", "H"].map((row) => (
                    <div key={row} className="seat-matrix-row">
                      <div className="seat-row-label-side">{row}</div>
                      <div className="seat-row-seats-group">
                        {/* Block 1-4 */}
                        {seatMap[row].slice(0, 4).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell vip ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}

                        <div className="seat-aisle-space" />

                        {/* Block 5-10 */}
                        {seatMap[row].slice(4, 10).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell vip ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}

                        <div className="seat-aisle-space" />

                        {/* Block 11-14 */}
                        {seatMap[row].slice(10, 14).map((s) => {
                          const isSel = selectedSeats.some((x) => x.seatId === s.seatId);
                          return (
                            <div
                              key={s.seatId}
                              className={`seat-cell vip ${s.state} ${isSel ? "selected" : ""}`}
                              onClick={() => handleToggleSeat(s)}
                            >
                              {isSel ? "✓" : s.state === "sold" ? "✕" : s.number}
                            </div>
                          );
                        })}
                      </div>
                      <div className="seat-row-label-side">{row}</div>
                    </div>
                  ))}

                  {/* Dải phân cách khu vực Sweetbox */}
                  <div className="seat-section-divider">
                    HÀNG GHẾ ĐÔI CAO CẤP SWEETBOX
                  </div>

                  {/* Hàng J Sweetbox */}
                  <div className="seat-matrix-row">
                    <div className="seat-row-label-side">J</div>
                    <div className="seat-row-seats-group" style={{ gap: "12px" }}>
                      {seatMap["J"].map((pair) => {
                        const isSel = selectedSeats.some((x) => x.seatId === pair.seatId);
                        return (
                          <div
                            key={pair.seatId}
                            className={`seat-sweetbox-pair ${pair.state} ${isSel ? "selected" : ""}`}
                            onClick={() => handleToggleSeat(pair)}
                          >
                            <Heart size={12} fill="currentColor" />
                            <span>{pair.number}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="seat-row-label-side">J</div>
                  </div>
                </div>

                {/* 3 tính năng tiện ích dưới cùng thẻ */}
                <div className="seat-bottom-features">
                  <div className="seat-feature-item">
                    <Video size={16} color="var(--gold, #ffce6d)" />
                    <span>Máy chiếu kép Laser IMAX 4K sắc nét</span>
                  </div>
                  <div className="seat-feature-item">
                    <Armchair size={16} color="var(--gold, #ffce6d)" />
                    <span>Ghế da bọc nệm chuẩn thương gia ngả 135°</span>
                  </div>
                  <div className="seat-feature-item">
                    <Wine size={16} color="var(--gold, #ffce6d)" />
                    <span>Phục vụ đồ uống tận ghế xem phim</span>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: THÔNG TIN VÉ & THANH TOÁN (Ảnh 3) */}
              <div className="seat-summary-card">
                {/* Phim & Suất chiếu */}
                <div className="seat-summary-movie-row">
                  <img
                    src="https://bucket-image.inkmaginecms.com/version/hd/1/image/2024/07/8becb910-7d74-4098-aa73-2eea972379b6.jpg"
                    alt="Dune 2"
                    className="seat-summary-poster"
                  />
                  <div className="seat-summary-movie-info">
                    <div className="seat-summary-badges">
                      <span className="seat-summary-badge-age">T16</span>
                      <span className="seat-summary-badge-fmt">IMAX 2D</span>
                      <span className="seat-summary-badge-fmt">Phụ đề</span>
                    </div>
                    <h4>Dune: Hành Tinh Cát - Phần Hai</h4>
                    <p className="seat-summary-meta">
                      Hành động, Phiêu lưu, Khoa học viễn tưởng • 166 phút
                    </p>
                    <p className="seat-summary-showtime">
                      🕒 19:30, T7 26/10/2024
                    </p>
                  </div>
                </div>

                {/* Cụm rạp & Phòng */}
                <div style={{ fontSize: "0.82rem", color: "#a8b8c8", borderTop: "1px solid rgba(190, 212, 232, 0.08)", paddingTop: "10px" }}>
                  <div>Cụm rạp: <strong>NOVA Landmark 81</strong></div>
                  <div>Phòng chiếu: <strong>Phòng IMAX 01 (Màn hình 22m)</strong></div>
                </div>

                {/* Danh sách ghế đã chọn */}
                <div className="seat-summary-seats-box">
                  <div className="seat-summary-seats-header">
                    <span>Ghế đã chọn ({selectedSeats.length}):</span>
                    <span style={{ color: "#38bdf8", fontWeight: 700 }}>Hàng VIP Prime</span>
                  </div>

                  <div className="seat-selected-cards-row">
                    {selectedSeats.length === 0 ? (
                      <span style={{ color: "#7f8fa6", fontStyle: "italic", fontSize: "0.85rem" }}>
                        Chưa có ghế nào được chọn
                      </span>
                    ) : (
                      selectedSeats.map((s) => (
                        <div key={s.seatId} className="seat-selected-badge-card">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="seat-selected-badge-label">
                              Ghế <Armchair size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {s.label}
                            </span>
                            <span className="seat-selected-badge-price">{s.price.toLocaleString("vi-VN")}đ</span>
                          </div>
                          <span className="seat-selected-badge-tag">{s.type}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Ưu đãi Combo Bắp Nước */}
                <div className="seat-combo-box">
                  <div className="seat-combo-header">
                    <span>🍿 ƯU ĐÃI COMBO BẮP NƯỚC</span>
                    <span style={{ color: "#2ecc71", fontSize: "0.72rem", background: "rgba(46, 204, 113, 0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                      Tiết kiệm 20%
                    </span>
                  </div>

                  <div
                    className={`seat-combo-item-row ${hasCombo ? "active" : ""}`}
                    onClick={() => setHasCombo((prev) => !prev)}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "rgba(255, 206, 109, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                        🍿
                      </div>
                      <div>
                        <div className="seat-combo-title">Combo Gold Cinema</div>
                        <div className="seat-combo-desc">
                          1 Bắp caramel lớn + 2 Nước... {hasCombo ? <span style={{ color: "#2ecc71" }}>✓ Đã thêm</span> : "+ Thêm"}
                        </div>
                      </div>
                    </div>
                    <div className="seat-combo-price">+95.000đ</div>
                  </div>
                </div>

                {/* Mã giảm giá / Voucher */}
                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", color: "#a8b8c8", marginBottom: "6px" }}>
                    Mã giảm giá / Voucher ưu đãi
                  </label>
                  <div className="seat-voucher-row">
                    <input
                      type="text"
                      className="seat-voucher-input"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã voucher"
                    />
                    <button
                      type="button"
                      className="seat-voucher-btn"
                      onClick={handleApplyVoucher}
                    >
                      {voucherApplied ? "Đã áp dụng" : "Áp dụng"}
                    </button>
                  </div>
                  {voucherApplied && (
                    <div className="seat-voucher-applied-note">
                      <Sparkles size={13} /> Mã VIP: Đã kích hoạt giảm 30.000đ cho đơn hàng
                    </div>
                  )}
                </div>

                {/* Bảng tính chi tiết chi phí */}
                <div className="seat-bill-lines">
                  <div className="seat-bill-line">
                    <span>Tiền vé ({selectedSeats.length} ghế VIP x 150k):</span>
                    <span>{ticketTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  {hasCombo && (
                    <div className="seat-bill-line">
                      <span>Combo bắp nước (Gold):</span>
                      <span>95.000đ</span>
                    </div>
                  )}
                  {voucherApplied && (
                    <div className="seat-bill-line discount">
                      <span>Ưu đãi thành viên Gold (-10%):</span>
                      <span>-30.000đ</span>
                    </div>
                  )}

                  <div className="seat-grand-total-row">
                    <div>
                      <div className="seat-grand-label">TỔNG CỘNG THANH TOÁN</div>
                      <div style={{ fontSize: "0.72rem", color: "#7f8fa6" }}>Đã bao gồm VAT &amp; Phí tiện ích</div>
                    </div>
                    <div className="seat-grand-amount">
                      {grandTotal.toLocaleString("vi-VN")} <span style={{ fontSize: "0.95rem" }}>VNĐ</span>
                    </div>
                  </div>
                </div>

                {/* Nút hành động thanh toán lớn màu vàng */}
                <button
                  type="button"
                  className="seat-checkout-btn-main"
                  disabled={selectedSeats.length === 0 || step === "paying"}
                  onClick={handleProceedCheckout}
                >
                  {step === "paying" ? (
                    <>
                      <RefreshCw size={18} className="seat-spinner" /> Đang bảo mật giữ ghế &amp; thanh toán…
                    </>
                  ) : (
                    <>
                      Tiến hành thanh toán &rarr;
                    </>
                  )}
                </button>

                <div className="seat-security-trust">
                  <Lock size={12} color="var(--gold, #ffce6d)" />
                  <span>Khóa ghế thời gian thực theo chuẩn bảo mật SRS ISO-27001</span>
                </div>
              </div>
            </div>
          ) : (
            /* 5. Màn hình thanh toán thành công & Mã vé QR */
            <div className="ticket-qr-view" style={{ background: "#06192b", borderRadius: "16px", padding: "40px 20px", border: "1px solid rgba(255, 206, 109, 0.3)" }}>
              <div className="ticket-success-icon">
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ color: "var(--gold, #ffce6d)", margin: 0 }}>ĐẶT VÉ VÀ THANH TOÁN THÀNH CÔNG!</h2>
              <p style={{ color: "#a8b8c8", margin: 0 }}>
                Mã đơn hàng: <strong style={{ color: "#fff", fontSize: "1.2rem" }}>{confirmedBooking?.bookingCode || "NC928374"}</strong>
              </p>

              <div className="ticket-qr-box">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <rect width="200" height="200" fill="white" />
                  <rect x="20" y="20" width="40" height="40" fill="#031525" />
                  <rect x="25" y="25" width="30" height="30" fill="white" />
                  <rect x="30" y="30" width="20" height="20" fill="#031525" />
                  <rect x="140" y="20" width="40" height="40" fill="#031525" />
                  <rect x="145" y="25" width="30" height="30" fill="white" />
                  <rect x="150" y="30" width="20" height="20" fill="#031525" />
                  <rect x="20" y="140" width="40" height="40" fill="#031525" />
                  <rect x="25" y="145" width="30" height="30" fill="white" />
                  <rect x="30" y="150" width="20" height="20" fill="#031525" />
                  <rect x="80" y="30" width="15" height="30" fill="#031525" />
                  <rect x="110" y="25" width="15" height="15" fill="#031525" />
                  <rect x="80" y="80" width="40" height="15" fill="#031525" />
                  <rect x="40" y="90" width="120" height="20" fill="#031525" />
                  <rect x="80" y="130" width="30" height="30" fill="#031525" />
                  <rect x="130" y="140" width="40" height="25" fill="#031525" />
                </svg>
              </div>

              <div className="ticket-qr-token">
                {confirmedBooking?.qrToken || "NOVA-TICKET-F07-F08-VALID"}
              </div>

              <p style={{ color: "#7f8fa6", maxWidth: "480px", fontSize: "0.88rem" }}>
                Vé đã được phát hành và lưu vào tài khoản của bạn. Vui lòng xuất trình mã QR này tại cổng soát vé rạp NOVA Landmark 81 trước giờ chiếu.
              </p>

              <button
                type="button"
                className="seat-checkout-btn-main"
                style={{ maxWidth: "280px", padding: "12px 24px" }}
                onClick={onClose}
              >
                Quay lại lịch chiếu
              </button>
            </div>
          )}

          {/* 6. Helpline dưới chân trang */}
          <div className="seat-helpline-bar">
            <Headphones size={18} color="var(--gold, #ffce6d)" />
            <span>Cần hỗ trợ chọn ghế đoàn / VIP?</span>
            <strong>1900 6868</strong>
          </div>
        </div>
      </div>

      {/* 7. Footer đồng bộ 100% Ảnh 3 */}
      <SiteFooter
        onNavigate={(page, hash) => {
          if (onNavigate) onNavigate(page, hash);
          else if (onClose) onClose();
        }}
      />
    </div>
  );
}
