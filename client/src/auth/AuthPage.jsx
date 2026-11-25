import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  ContactRound,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  FlaskConical,
  Home,
  Info,
  LockKeyhole,
  LogIn,
  Mail,
  Menu,
  Phone,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserRoundPlus,
  Wallet,
  Wifi,
  X,
} from "lucide-react";

import useAuth from "./useAuth.jsx";
import "./auth.css";

// ==============================
// LOGO
// ==============================

function Brand({ onClick }) {
  return (
    <a
      className="na-brand"
      href="#trang-chu"
      onClick={onClick}
      aria-label="NOVA Cinema - Trang chủ"
    >
      <img src="/nova-icon.png" alt="" width="54" height="54" />

      <span>
        <strong>NOVA CINEMA</strong>
        <small>LUXURY EXPERIENCE</small>
      </span>
    </a>
  );
}

// ==============================
// Ô NHẬP THÔNG THƯỜNG
// ==============================

function InputField({
  name,
  label,
  icon: Icon,
  value,
  onChange,
  error,
  hint,
  type = "text",
  ...props
}) {
  return (
    <div className="na-field">
      <div className="na-field-heading">
        <label htmlFor={`na-${name}`}>{label}</label>
        {hint && <span>{hint}</span>}
      </div>

      <div className={`na-input-wrap ${error ? "has-error" : ""}`}>
        <Icon size={21} aria-hidden="true" />

        <input
          {...props}
          id={`na-${name}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `na-${name}-error` : undefined}
        />
      </div>

      {error && (
        <p className="na-field-error" id={`na-${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

// ==============================
// Ô NHẬP MẬT KHẨU
// ==============================

function PasswordField({
  name,
  label,
  value,
  onChange,
  error,
  autoComplete,
  visible,
  onToggle,
  onForgot,
}) {
  return (
    <div className="na-field">
      <div className="na-field-heading">
        <label htmlFor={`na-${name}`}>{label}</label>

        {onForgot && (
          <button
            className="na-text-link"
            type="button"
            onClick={onForgot}
          >
            Quên mật khẩu?
          </button>
        )}
      </div>

      <div className={`na-input-wrap ${error ? "has-error" : ""}`}>
        <LockKeyhole size={21} aria-hidden="true" />

        <input
          id={`na-${name}`}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder="Nhập mật khẩu của bạn"
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `na-${name}-error` : undefined}
        />

        <button
          className="na-password-toggle"
          type="button"
          onClick={onToggle}
          aria-controls={`na-${name}`}
          aria-pressed={visible}
          aria-label={`${visible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>

      {error && (
        <p className="na-field-error" id={`na-${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

// ==============================
// TRANG TÀI KHOẢN
// ==============================

export default function AuthPage({ onNavigate }) {
  const {
    navigation,
    benefits,
    demoAccount,
    currentYear,

    isRegister,
    menuOpen,
    forgotPassword,
    values,
    visiblePasswords,
    remember,
    acceptedTerms,
    errors,
    message,
    hasErrors,

    updateField,
    togglePassword,
    handleRememberChange,
    handleTermsChange,
    toggleMenu,
    navigate,
    changeMode,
    openMembership,
    openForgotPassword,
    closeForgotPassword,
    handleSubmit,
    fillDemoAccount,
    showNotifications,
    handleProviderLogin,
    showPolicy,
  } = useAuth({ onNavigate });

  return (
    <div className="nova-auth-page">
      {/* HEADER */}
      <header className="na-header">
        <div className="na-container na-header-inner">
          <Brand onClick={(event) => navigate(event, "#trang-chu")} />

          <nav
            id="na-navigation"
            className={`na-nav ${menuOpen ? "is-open" : ""}`}
            aria-label="Điều hướng chính"
          >
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => navigate(event, item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="na-header-actions">
            <a
              className="na-icon-button na-desktop-action"
              href="#phim"
              onClick={(event) => navigate(event, "#phim")}
              aria-label="Tìm kiếm phim"
            >
              <Search size={21} />
            </a>

            <button
              className="na-icon-button na-desktop-action"
              type="button"
              aria-label="Thông báo"
              onClick={showNotifications}
            >
              <Bell size={21} />
              <span className="na-notification-dot" />
            </button>

            <button
              className="na-tier"
              type="button"
              onClick={openMembership}
            >
              <Crown size={17} />
              GOLD TIER
            </button>

            <button
              className="na-avatar"
              type="button"
              aria-label="Mở đăng nhập"
              onClick={() => changeMode("login")}
            >
              <UserRound size={21} />
            </button>

            <button
              className="na-icon-button na-menu-toggle"
              type="button"
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              aria-controls="na-navigation"
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>

      <main className="na-container na-main">
        {/* ĐƯỜNG DẪN */}
        <nav className="na-breadcrumb" aria-label="Đường dẫn trang">
          <a
            href="#trang-chu"
            onClick={(event) => navigate(event, "#trang-chu")}
          >
            <Home size={16} />
            Trang chủ
          </a>

          <ChevronRight size={14} />
          <span>Tài khoản</span>
          <ChevronRight size={14} />

          <span aria-current="page">
            Đăng nhập & Đăng ký
          </span>
        </nav>

        {/* GIỚI THIỆU */}
        <section className="na-intro" aria-labelledby="na-welcome">
          <span className="na-eyebrow">
            <Sparkles size={16} />
            KHÔNG GIAN THÀNH VIÊN NOVA
          </span>

          <h1 id="na-welcome">
            Chào mừng đến với <span>NOVA CINEMA</span>
          </h1>

          <div className="na-intro-bottom">
            <p>
              Hòa mình vào không gian điện ảnh thượng lưu và mở khóa
              những đặc quyền thành viên VIP Gold được may đo riêng biệt.
            </p>

            <div className="na-security-pill">
              <ShieldCheck size={23} />

              <span>
                TÀI KHOẢN CỦA BẠN
                <strong>Một điểm chạm, ngàn trải nghiệm</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="na-layout">
          {/* FORM */}
          <section
            className="na-form-card"
            id="na-form-card"
            aria-label="Đăng nhập và đăng ký tài khoản"
          >
            <div className="na-tabs" aria-label="Chọn loại biểu mẫu">
              <button
                className={!isRegister ? "is-active" : ""}
                type="button"
                aria-pressed={!isRegister}
                onClick={() => changeMode("login")}
              >
                <LogIn size={20} />
                Đăng nhập
              </button>

              <button
                className={isRegister ? "is-active" : ""}
                type="button"
                aria-pressed={isRegister}
                onClick={() => changeMode("register")}
              >
                <UserRoundPlus size={20} />
                Đăng ký thành viên mới
              </button>
            </div>

            {forgotPassword && (
              <div className="na-recovery-heading">
                <button
                  className="na-back-link"
                  type="button"
                  onClick={closeForgotPassword}
                >
                  <ArrowLeft size={17} />
                  Trở lại đăng nhập
                </button>

                <h2>Quên mật khẩu?</h2>
                <p>Nhập email đã dùng để đăng ký tài khoản.</p>
              </div>
            )}

            <form className="na-form" onSubmit={handleSubmit} noValidate>
              {forgotPassword ? (
                <InputField
                  name="recoveryEmail"
                  label="Email khôi phục"
                  type="email"
                  icon={Mail}
                  value={values.recoveryEmail}
                  onChange={updateField}
                  error={errors.recoveryEmail}
                  autoComplete="email"
                  placeholder="ban@example.com"
                  required
                />
              ) : isRegister ? (
                <>
                  <div className="na-register-grid">
                    <InputField
                      name="fullName"
                      label="Họ và tên"
                      icon={UserRound}
                      value={values.fullName}
                      onChange={updateField}
                      error={errors.fullName}
                      autoComplete="name"
                      placeholder="Nguyễn Văn An"
                      required
                    />

                    <InputField
                      name="email"
                      label="Địa chỉ email"
                      type="email"
                      icon={Mail}
                      value={values.email}
                      onChange={updateField}
                      error={errors.email}
                      autoComplete="email"
                      placeholder="ban@example.com"
                      required
                    />
                  </div>

                  <PasswordField
                    name="password"
                    label="Mật khẩu"
                    value={values.password}
                    onChange={updateField}
                    error={errors.password}
                    autoComplete="new-password"
                    visible={visiblePasswords.password}
                    onToggle={() => togglePassword("password")}
                  />

                  <PasswordField
                    name="confirmPassword"
                    label="Nhập lại mật khẩu"
                    value={values.confirmPassword}
                    onChange={updateField}
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                    visible={visiblePasswords.confirmPassword}
                    onToggle={() => togglePassword("confirmPassword")}
                  />

                  <p className="na-password-hint">
                    Sử dụng ít nhất 8 ký tự cho mật khẩu của bạn.
                  </p>

                  <div>
                    <label className="na-check-label">
                      <input
                        id="na-acceptedTerms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={handleTermsChange}
                        aria-invalid={Boolean(errors.acceptedTerms)}
                        aria-describedby={
                          errors.acceptedTerms
                            ? "na-acceptedTerms-error"
                            : undefined
                        }
                      />

                      <span>
                        Tôi đồng ý với điều khoản sử dụng và chính sách
                        bảo mật.
                      </span>
                    </label>

                    {errors.acceptedTerms && (
                      <p
                        className="na-field-error"
                        id="na-acceptedTerms-error"
                      >
                        {errors.acceptedTerms}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <InputField
                    name="account"
                    label="Tài khoản truy cập"
                    hint="Họ tên, email hoặc SĐT"
                    icon={UserRound}
                    value={values.account}
                    onChange={updateField}
                    error={errors.account}
                    autoComplete="username"
                    placeholder="Nhập thông tin đã đăng ký"
                    required
                  />

                  <PasswordField
                    name="password"
                    label="Mật khẩu xác thực"
                    value={values.password}
                    onChange={updateField}
                    error={errors.password}
                    autoComplete="current-password"
                    visible={visiblePasswords.password}
                    onToggle={() => togglePassword("password")}
                    onForgot={openForgotPassword}
                  />

                  <div className="na-form-row">
                    <label className="na-check-label">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={handleRememberChange}
                      />

                      <span>
                        Ghi nhớ đăng nhập trên thiết bị này
                      </span>
                    </label>

                    <span className="na-small-note">
                      <LockKeyhole size={15} />
                      Tài khoản cá nhân
                    </span>
                  </div>
                </>
              )}

              <button className="na-submit" type="submit">
                {forgotPassword
                  ? "Tiếp tục khôi phục"
                  : isRegister
                    ? "Đăng ký thành viên"
                    : "Đăng nhập ngay"}

                <ArrowRight size={22} />
              </button>

              {hasErrors && (
                <p className="na-field-error" role="alert">
                  Vui lòng kiểm tra các thông tin được đánh dấu phía trên.
                </p>
              )}
            </form>

            {message && (
              <div className="na-message" role="status">
                <Info size={20} />
                <span>{message}</span>
              </div>
            )}

            <div className="na-info-box">
              <ShieldCheck size={23} />

              <div>
                <strong>Thông tin của bạn, trải nghiệm của bạn</strong>

                <p>
                  Đăng nhập để quản lý vé, theo dõi phim yêu thích và khám
                  phá quyền lợi thành viên tại NOVA Cinema.
                </p>
              </div>
            </div>

            {!forgotPassword && (
              <>
                <div className="na-divider">
                  <span>HOẶC TIẾP TỤC VỚI</span>
                </div>

                <div className="na-socials">
                  <button
                    type="button"
                    onClick={() => handleProviderLogin("google")}
                  >
                    <span className="na-google-letter">G</span>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderLogin("apple")}
                  >
                    <ContactRound size={20} />
                    Apple ID
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProviderLogin("priority")}
                  >
                    <CreditCard size={20} />
                    Priority Pay
                  </button>
                </div>
              </>
            )}

            <p className="na-preview-note">
              Google và Apple ID có thể dùng để tạo tài khoản NOVA hoặc đăng nhập lại.
            </p>
          </section>

          {/* THẺ THÀNH VIÊN VÀ TÀI KHOẢN MẪU */}
          <aside className="na-sidebar">
            <section className="na-membership-panel" id="na-membership">
              <div className="na-panel-heading">
                <div>
                  <span>ĐẶC QUYỀN HOÀNG GIA</span>
                  <h2>NOVA Elite Club</h2>
                </div>

                <span className="na-round-crown">
                  <Crown size={26} />
                </span>
              </div>

              <div className="na-membership-card">
                <div className="na-card-top">
                  <div>
                    <p>NOVA LUXURY MEMBERSHIP</p>
                    <h3>GOLD TIER VIP</h3>
                  </div>

                  <Wifi size={31} />
                </div>

                <div className="na-card-number">
                  <ContactRound size={30} />
                  <span>•••• 8899 2026</span>
                </div>

                <div className="na-card-bottom">
                  <div>
                    <small>CHỦ SỞ HỮU THẺ</small>
                    <strong>THÀNH VIÊN NOVA</strong>
                  </div>

                  <div>
                    <small>THẺ MINH HỌA</small>
                    <strong>12/28</strong>
                  </div>
                </div>
              </div>

              <h3 className="na-benefits-title">
                ĐẶC QUYỀN ĐẲNG CẤP DÀNH CHO TÀI KHOẢN GOLD
              </h3>

              <ul className="na-benefits">
                {benefits.map((benefit) => (
                  <li key={benefit.title}>
                    <Check size={16} />

                    <div>
                      <strong>{benefit.title}</strong>
                      <p>{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="na-preview-note">
                Thẻ và quyền lợi là nội dung minh họa.
              </p>
            </section>

            <section className="na-demo-panel">
              <div className="na-demo-heading">
                <h2>
                  <FlaskConical size={22} />
                  TRẢI NGHIỆM TÀI KHOẢN MẪU
                </h2>

                <span>QUICK FILL</span>
              </div>

              <p className="na-demo-copy">
                Chọn thông tin mẫu bên dưới để điền nhanh và trải nghiệm
                giao diện đăng nhập.
              </p>

              <button
                className="na-demo-account"
                type="button"
                onClick={fillDemoAccount}
              >
                <UserRound size={23} />

                <span className="na-demo-account-text">
                  <strong>Khách hàng · VIP Member</strong>
                  <small>{demoAccount.account}</small>
                  <span>Mật khẩu mẫu: {demoAccount.password}</span>
                </span>

                <LogIn size={20} />
              </button>

              <div className="na-demo-meta">
                <span>
                  <ShieldCheck size={14} />
                  Chỉ dùng thử giao diện
                </span>

                <span>NOVA Cinema</span>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="na-footer">
        <div className="na-container">
          <div className="na-footer-grid">
            <div>
              <Brand
                onClick={(event) => navigate(event, "#trang-chu")}
              />

              <p className="na-footer-description">
                Đẳng cấp điện ảnh thượng lưu. Tận hưởng không gian trình
                chiếu hiện đại cùng những trải nghiệm đáng nhớ.
              </p>

              <span className="na-certification">
                <BadgeCheck size={22} />
                Trải nghiệm dành riêng cho bạn
              </span>
            </div>

            <div>
              <h2>KHÁM PHÁ & ĐIỀU KHOẢN</h2>

              <div className="na-footer-links">
                <a
                  href="#trai-nghiem"
                  onClick={(event) => navigate(event, "#trai-nghiem")}
                >
                  Về chúng tôi
                </a>

                <button type="button" onClick={openMembership}>
                  Quyền lợi thành viên VIP
                </button>

                <button
                  type="button"
                  onClick={() => showPolicy("privacy")}
                >
                  Chính sách bảo mật
                </button>

                <button
                  type="button"
                  onClick={() => showPolicy("terms")}
                >
                  Điều khoản dịch vụ
                </button>
              </div>
            </div>

            <div>
              <h2>HỆ THỐNG CỤM RẠP NOVA</h2>

              <div className="na-cinemas">
                <div>
                  <strong>NOVA Landmark 81</strong>
                  <p>Tầng B1, TTTM Vincom Landmark 81, TP. HCM</p>
                </div>

                <div>
                  <strong>NOVA Westlake</strong>
                  <p>Tầng 4, Lotte Mall West Lake, Tây Hồ, Hà Nội</p>
                </div>

                <div>
                  <strong>NOVA Vincom Bà Triệu</strong>
                  <p>
                    Tầng 6, Tháp B, 191 Bà Triệu, Hai Bà Trưng, Hà Nội
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2>LIÊN HỆ & HỖ TRỢ</h2>

              <ul className="na-contact">
                <li>
                  <Phone size={21} />

                  <div>
                    <span>Chăm sóc khách hàng</span>
                    <strong>Hotline đang cập nhật</strong>
                  </div>
                </li>

                <li>
                  <Mail size={21} />
                  <span>Email đang cập nhật</span>
                </li>

                <li>
                  <Clock3 size={21} />
                  <span>08:00 – 24:00 hằng ngày</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="na-footer-bottom">
            <p>
              © {currentYear} NOVA CINEMA. Trải nghiệm điện ảnh theo cách
              của bạn.
            </p>

            <span className="na-payments">
              NOVA Experience
              <CreditCard size={20} />
              <Wallet size={20} />
              <QrCode size={20} />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
