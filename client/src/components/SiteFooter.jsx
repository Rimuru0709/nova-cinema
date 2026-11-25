import {
  BadgeCheck,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Wallet,
  QrCode,
} from "lucide-react";

export default function SiteFooter({ onNavigate }) {
  function handleNav(page, hash) {
    if (onNavigate) {
      onNavigate(page, hash);
    } else {
      window.location.hash = hash || `#${page}`;
    }
  }

  return (
    <footer className="site-footer" id="lien-he">
      <div className="container">
        <div className="footer-grid">
          {/* CỘT 1: THƯƠNG HIỆU */}
          <div className="footer-brand">
            <div className="footer-brand-header">
              <span className="footer-brand-symbol">
                <img
                  src="/nova-icon.png"
                  alt="NOVA CINEMA"
                  className="footer-brand-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </span>
              <div className="footer-brand-title">
                <span>NOVA</span>
                <span>CINEMA</span>
              </div>
            </div>

            <p>
              Đẳng cấp điện ảnh thượng lưu. Tận hưởng không gian trình chiếu
              IMAX Laser, Dolby Atmos chuẩn quốc tế cùng đặc quyền ẩm thực VIP
              Lounge thượng hạng.
            </p>

            <div className="footer-badge">
              <BadgeCheck size={18} className="footer-badge-icon" />
              <span>Chứng nhận tiêu chuẩn rạp VIP 2025</span>
            </div>
          </div>

          {/* CỘT 2: KHÁM PHÁ & ĐIỀU KHOẢN */}
          <div className="footer-column">
            <h3>KHÁM PHÁ & ĐIỀU KHOẢN</h3>
            <a
              href="#trang-chu"
              onClick={(e) => {
                e.preventDefault();
                handleNav("home", "#trang-chu");
              }}
            >
              Về chúng tôi
            </a>
            <a
              href="#uu-dai"
              onClick={(e) => {
                e.preventDefault();
                handleNav("home", "#uu-dai");
              }}
            >
              Quy định thành viên VIP
            </a>
            <a
              href="#chinh-sach"
              onClick={(e) => {
                e.preventDefault();
                alert("NOVA Cinema cam kết bảo mật tuyệt đối thông tin khách hàng và thanh toán theo chuẩn quốc tế PCI-DSS.");
              }}
            >
              Chính sách bảo mật
            </a>
            <a
              href="#dieu-khoan"
              onClick={(e) => {
                e.preventDefault();
                alert("Quy định về việc đặt vé, đổi trả vé và sử dụng dịch vụ tại hệ thống rạp NOVA Cinema.");
              }}
            >
              Điều khoản dịch vụ
            </a>
          </div>

          {/* CỘT 3: HỆ THỐNG CỤM RẠP NOVA */}
          <div className="footer-column">
            <h3>HỆ THỐNG CỤM RẠP NOVA</h3>

            <div className="cinema-address">
              <strong>NOVA Landmark 81</strong>
              <span>Tầng B1, TTTM Vincom Landmark 81, TP. HCM</span>
            </div>

            <div className="cinema-address">
              <strong>NOVA Westlake</strong>
              <span>Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội</span>
            </div>

            <div className="cinema-address">
              <strong>NOVA Vincom Bà Triệu</strong>
              <span>Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội</span>
            </div>
          </div>

          {/* CỘT 4: LIÊN HỆ & HỖ TRỢ */}
          <div className="footer-column">
            <h3>LIÊN HỆ & HỖ TRỢ</h3>

            <div className="footer-contact-item">
              <Phone size={18} className="footer-contact-icon" />
              <div className="footer-contact-text">
                <span className="contact-label">Hotline Chăm sóc VIP (24/7)</span>
                <strong className="contact-phone">1900 6868</strong>
              </div>
            </div>

            <div className="footer-contact-item">
              <Mail size={18} className="footer-contact-icon" />
              <span className="contact-value">contact@novacinema.vn</span>
            </div>

            <div className="footer-contact-item">
              <Clock size={18} className="footer-contact-icon" />
              <span className="contact-value">08:00 - 24:00 hàng ngày</span>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT BAR */}
        <div className="footer-bottom">
          <p>© 2025 NOVA CINEMA JSC. All rights reserved. Trải nghiệm điện ảnh chuẩn Hoàng gia.</p>

          <div className="footer-safe-payment">
            <span>Thanh toán an toàn:</span>
            <div className="payment-mini-icons">
              <CreditCard size={18} title="Thẻ tín dụng / Ghi nợ" />
              <Wallet size={18} title="Ví điện tử" />
              <QrCode size={18} title="VietQR / Chuyển khoản" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
