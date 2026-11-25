import { useEffect, useState } from "react";

// ==============================
// DỮ LIỆU GIAO DIỆN
// ==============================

const DEMO_ACCOUNT = {
    account: "khachhang.demo@example.com",
    password: "NovaDemo2026!",
};

const NAVIGATION = [
    { label: "Trang chủ", href: "#trang-chu" },
    { label: "Phim", href: "#phim" },
    { label: "Lịch chiếu", href: "#dat-ve" },
    { label: "Giá vé & Ưu đãi", href: "#uu-dai" },
    { label: "Giới thiệu", href: "#trai-nghiem" },
    { label: "Liên hệ", href: "#lien-he" },
];

const BENEFITS = [
    {
        title: "Tích lũy 10% điểm Nova Points cho mỗi hóa đơn",
        description:
            "Quy đổi vé xem phim 2D/3D hoặc combo bắp nước yêu thích.",
    },
    {
        title: "Ưu tiên đặt trước ghế VIP Prime & Sweetbox 24h",
        description:
            "Sẵn sàng cho những buổi công chiếu và bom tấn cuối tuần.",
    },
    {
        title: "Trải nghiệm dịch vụ tại VIP Gold Lounge",
        description:
            "Thư giãn trong không gian riêng trước giờ chiếu.",
    },
    {
        title: "Quà tặng điện ảnh trong tháng sinh nhật",
        description:
            "Một đặc quyền dành riêng cho khoảnh khắc của bạn.",
    },
];

const AUTH_HASHES = [
    "#dang-nhap",
    "#dang-ky",
    "#login",
    "#register",
];

const PROVIDER_MESSAGES = {
    priority:
        "Priority Pay chưa được cấu hình làm dịch vụ đăng nhập của NOVA Cinema.",
};

const OAUTH_MESSAGES = {
    google_config: "Chưa cấu hình thông tin Google OAuth trên máy chủ.",
    apple_config: "Apple ID cần cấu hình Apple Developer và địa chỉ HTTPS.",
    flow: "Phiên đăng nhập đã hết hạn. Vui lòng thử lại.",
    cancelled: "Bạn đã hủy đăng nhập.",
    unavailable: "Chưa đăng nhập được qua dịch vụ này. Vui lòng thử lại.",
    email: "Dịch vụ chưa cung cấp email đã xác minh.",
    existing_email: "Email này đã có tài khoản NOVA. Hãy đăng nhập bằng phương thức bạn đã dùng trước đó.",
    database: "Máy chủ cần cập nhật database để dùng đăng nhập Google hoặc Apple ID.",
};

const POLICY_MESSAGES = {
    privacy:
        "Chính sách bảo mật chính thức sẽ được cập nhật trước khi mở đăng ký tài khoản.",
    terms:
        "Điều khoản dịch vụ chính thức sẽ được cập nhật trước khi mở đăng ký tài khoản.",
};

// ==============================
// HÀM HỖ TRỢ
// ==============================

function getModeFromHash() {
    const hash = window.location.hash.toLowerCase();

    return hash === "#dang-ky" || hash === "#register"
        ? "register"
        : "login";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidAccount(account) {
    const identifier = account.trim();
    const phone = identifier.replace(/[\s().-]/g, "");

    return (
        (identifier.length <= 254 && isValidEmail(identifier)) ||
        /^(?:0|\+84)[0-9]{9}$/.test(phone) ||
        (identifier.length >= 2 && identifier.length <= 150)
    );
}

// ==============================
// CUSTOM HOOK
// ==============================

export default function useAuth({ onNavigate } = {}) {
    const [mode, setMode] = useState(getModeFromHash);
    const [menuOpen, setMenuOpen] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);

    const [values, setValues] = useState({
        account: "",
        password: "",
        fullName: "",
        email: "",
        confirmPassword: "",
        recoveryEmail: "",
    });

    const [visiblePasswords, setVisiblePasswords] = useState({
        password: false,
        confirmPassword: false,
    });

    const [remember, setRemember] = useState(true);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(() => {
        const code = new URLSearchParams(window.location.search).get("authError");
        return Object.hasOwn(OAUTH_MESSAGES, code) ? OAUTH_MESSAGES[code] : "";
    });

    const isRegister = mode === "register";
    const hasErrors = Object.values(errors).some(Boolean);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has("authError")) {
            url.searchParams.delete("authError");
            window.history.replaceState(window.history.state, "", url);
        }
    }, []);

    // Theo dõi đường dẫn khi dùng nút Back/Forward của trình duyệt.
    useEffect(() => {
        function handleHashChange() {
            const hash = window.location.hash.toLowerCase();

            if (!AUTH_HASHES.includes(hash)) return;

            setMode(getModeFromHash());
            setForgotPassword(false);
            setErrors({});
            setMessage("");

            setVisiblePasswords({
                password: false,
                confirmPassword: false,
            });
        }

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    // Đổi tiêu đề tab trình duyệt.
    useEffect(() => {
        const previousTitle = document.title;

        document.title = `${isRegister ? "Đăng ký" : "Đăng nhập"
            } | NOVA CINEMA`;

        return () => {
            document.title = previousTitle;
        };
    }, [isRegister]);

    // ==============================
    // NHẬP DỮ LIỆU
    // ==============================

    function updateField(event) {
        const { name, value } = event.target;

        setValues((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: "",
        }));

        setMessage("");
    }

    function togglePassword(name) {
        setVisiblePasswords((current) => ({
            ...current,
            [name]: !current[name],
        }));
    }

    function handleRememberChange(event) {
        setRemember(event.target.checked);
    }

    function handleTermsChange(event) {
        setAcceptedTerms(event.target.checked);

        setErrors((current) => ({
            ...current,
            acceptedTerms: "",
        }));

        setMessage("");
    }

    // ==============================
    // MENU VÀ ĐIỀU HƯỚNG
    // ==============================

    function toggleMenu() {
        setMenuOpen((current) => !current);
    }

    function navigate(event, hash) {
        event.preventDefault();
        setMenuOpen(false);

        if (onNavigate) {
            onNavigate(hash === "#phim" ? "movies" : "home", hash);
        } else {
            window.location.hash = hash;
        }
    }

    function changeMode(nextMode) {
        setMode(nextMode);
        setForgotPassword(false);
        setErrors({});
        setMessage("");

        setVisiblePasswords({
            password: false,
            confirmPassword: false,
        });

        window.location.hash =
            nextMode === "register" ? "#dang-ky" : "#dang-nhap";
    }

    function scrollToForm() {
        document.getElementById("na-form-card")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    function showMessage(text) {
        setMessage(text);
        scrollToForm();
    }

    function openMembership() {
        document.getElementById("na-membership")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    // ==============================
    // QUÊN MẬT KHẨU
    // ==============================

    function openForgotPassword() {
        setForgotPassword(true);
        setErrors({});
        setMessage("");
    }

    function closeForgotPassword() {
        setForgotPassword(false);
        setErrors({});
        setMessage("");
    }

    // ==============================
    // KIỂM TRA FORM
    // ==============================

    function validateForm() {
        const nextErrors = {};

        if (forgotPassword) {
            if (!isValidEmail(values.recoveryEmail)) {
                nextErrors.recoveryEmail = "Vui lòng nhập email hợp lệ.";
            }

            return nextErrors;
        }

        if (isRegister) {
            if (values.fullName.trim().length < 2) {
                nextErrors.fullName = "Vui lòng nhập họ và tên.";
            }

            if (!isValidEmail(values.email)) {
                nextErrors.email = "Vui lòng nhập email hợp lệ.";
            }

            if (values.password.length < 8) {
                nextErrors.password = "Mật khẩu cần có ít nhất 8 ký tự.";
            }

            if (
                !values.confirmPassword ||
                values.confirmPassword !== values.password
            ) {
                nextErrors.confirmPassword = "Mật khẩu nhập lại chưa khớp.";
            }

            if (!acceptedTerms) {
                nextErrors.acceptedTerms =
                    "Vui lòng đồng ý điều khoản để tiếp tục.";
            }

            return nextErrors;
        }

        if (!isValidAccount(values.account)) {
            nextErrors.account =
                "Vui lòng nhập họ tên, email hoặc số điện thoại đã đăng ký.";
        }

        if (!values.password) {
            nextErrors.password = "Vui lòng nhập mật khẩu.";
        }

        return nextErrors;
    }

    // ==============================
    // GỬI FORM ĐẾN API TÀI KHOẢN
    // ==============================

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");

        const nextErrors = validateForm();
        setErrors(nextErrors);

        const firstError = Object.keys(nextErrors)[0];

        if (firstError) {
            document.getElementById(`na-${firstError}`)?.focus();
            return;
        }

        if (forgotPassword) {
            setMessage("Chức năng gửi email khôi phục đang được cập nhật.");
            return;
        }

        const action = isRegister ? "register" : "login";

        const body = isRegister
            ? {
                fullName: values.fullName,
                email: values.email,
                password: values.password,
            }
            : {
                account: values.account,
                password: values.password,
                remember,
            };

        try {
            const response = await fetch(`/api/auth/${action}`, {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Không thể kết nối API tài khoản.");
            }

            if (isRegister) {
                setValues((current) => ({
                    ...current,
                    account: body.email.trim(),
                    password: "",
                    confirmPassword: "",
                }));

                changeMode("login");
                return;
            }

            // Quyền lấy từ phiên đăng nhập trên máy chủ, không lấy từ form.
            window.location.hash = data.user?.role === "admin" ? "#admin" : "#trang-chu";
        } catch (error) {
            setMessage(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
        }
    }

    function fillDemoAccount() {
        setForgotPassword(false);
        setErrors({});

        setValues((current) => ({
            ...current,
            ...DEMO_ACCOUNT,
            ...(isRegister
                ? {
                    fullName: "Khách hàng Demo",
                    email: DEMO_ACCOUNT.account,
                    confirmPassword: DEMO_ACCOUNT.password,
                }
                : {}),
        }));

        showMessage("Đã điền thông tin mẫu. Hãy dùng email của bạn để đăng ký tài khoản.");
    }

    function showNotifications() {
        showMessage("Bạn chưa có thông báo mới.");
    }

    function handleProviderLogin(provider) {
        if (provider === "google" || provider === "apple") {
            window.location.assign(`/api/auth/oauth/${provider}/start`);
            return;
        }
        showMessage(
            PROVIDER_MESSAGES[provider] || "Chức năng này chưa được kết nối.",
        );
    }

    function showPolicy(type) {
        showMessage(POLICY_MESSAGES[type] || "Thông tin đang được cập nhật.");
    }

    return {
        navigation: NAVIGATION,
        benefits: BENEFITS,
        demoAccount: DEMO_ACCOUNT,
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
    };
}
