import { useEffect, useState } from "react";

export const navigation = [
    ["Trang chủ", "#trang-chu"],
    ["Phim", "#phim"],
    ["Lịch chiếu", "#dat-ve"],
    ["Giá vé & Ưu đãi", "#uu-dai"],
    ["Giới thiệu", "#trai-nghiem"],
    ["Liên hệ", "#lien-he"],
];

export const benefits = [
    ["Giữ chỗ trước 24 giờ", "Ưu tiên đặt vé sớm cho các suất chiếu nổi bật."],
    ["Canapés & Lounge", "Thư giãn tại không gian VIP Gold Lounge."],
    ["Ưu đãi bắp nước", "Khám phá ưu đãi dành riêng cho hội viên."],
];

export const stats = [
    ["Nova Points", "1.250"],
    ["Chi tiêu năm nay", "4.250.000 ₫"],
    ["Suất chiếu đã xem", "18"],
];

function openLogin() {
    window.location.replace("#dang-nhap");
}

function profileFields(user = {}) {
    return {
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        birthDate: user.birthDate ?? "",
        gender: user.gender ?? "",
        favoriteCinemaId: user.favoriteCinemaId ?? "",
    };
}

export default function useProfile() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(() => profileFields());
    const [profileReady, setProfileReady] = useState(false);
    const [cinemas, setCinemas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [saveResult, setSaveResult] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        window.scrollTo(0, 0);

        async function loadProfile() {
            try {
                const response = await fetch("/api/auth/me", {
                    credentials: "same-origin",
                    signal: controller.signal,
                });

                if (response.status === 401) {
                    if (!controller.signal.aborted) openLogin();
                    return;
                }

                const data = await response.json().catch(() => null);

                if (!response.ok || !data?.success || !data.user) {
                    throw new Error("Chưa tải được hồ sơ. Vui lòng thử lại.");
                }

                if (!controller.signal.aborted) {
                    setUser(data.user);
                    setProfile(profileFields(data.user));
                    setProfileReady(data.profileReady === true);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError("Chưa tải được hồ sơ. Vui lòng thử lại.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        loadProfile();

        async function loadCinemas() {
            try {
                const response = await fetch("/api/cinemas", { signal: controller.signal });
                const data = await response.json();
                if (!response.ok || !data.success || !Array.isArray(data.data)) throw new Error();
                if (!controller.signal.aborted) setCinemas(data.data);
            } catch {
                if (!controller.signal.aborted) setCinemas(null);
            }
        }

        loadCinemas();
        return () => controller.abort();
    }, [attempt]);

    function retry() {
        setLoading(true);
        setError("");
        setAttempt((current) => current + 1);
    }

    function updateProfileField(event) {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
        setSaveResult(null);
    }

    async function saveProfile(event) {
        event.preventDefault();
        if (saving || loggingOut || changingPassword) return;

        setSaving(true);
        setSaveResult(null);

        try {
            const response = await fetch("/api/auth/me", {
                method: "PATCH",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profileReady
                    ? profile
                    : { fullName: profile.fullName, phone: profile.phone }),
            });

            if (response.status === 401) {
                openLogin();
                return;
            }

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success || !data.user) {
                setSaveResult({
                    error: true,
                    message: data?.message || "Chưa lưu được hồ sơ. Vui lòng thử lại.",
                });
                return;
            }

            setUser(data.user);
            setProfile(profileFields(data.user));
            setSaveResult({ error: false, message: data.message });
        } catch {
            setSaveResult({ error: true, message: "Chưa lưu được hồ sơ. Vui lòng thử lại." });
        } finally {
            setSaving(false);
        }
    }

    async function changePassword(event) {
        event.preventDefault();
        if (changingPassword || saving || loggingOut) return;

        const form = event.currentTarget;
        const fields = new FormData(form);
        const currentPassword = fields.get("currentPassword");
        const newPassword = fields.get("newPassword");
        if (newPassword !== fields.get("confirmPassword")) {
            setPasswordError("Xác nhận mật khẩu mới chưa khớp.");
            return;
        }

        setChangingPassword(true);
        setPasswordError("");

        try {
            const response = await fetch("/api/auth/password", {
                method: "PATCH",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (response.status === 401) {
                openLogin();
                return;
            }

            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.success) {
                setPasswordError(data?.message || "Chưa đổi được mật khẩu. Vui lòng thử lại.");
                return;
            }

            form.reset();
            setUser(null);
            openLogin();
        } catch {
            setPasswordError("Chưa đổi được mật khẩu. Vui lòng thử lại.");
        } finally {
            setChangingPassword(false);
        }
    }

    async function logout() {
        setLoggingOut(true);
        setError("");

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error("Chưa đăng xuất được. Vui lòng thử lại.");
            }

            setUser(null);
            openLogin();
        } catch {
            setError("Chưa đăng xuất được. Vui lòng thử lại.");
        } finally {
            setLoggingOut(false);
        }
    }

    return {
        user, loading, loggingOut, error, retry, logout,
        profile, profileReady, cinemas, saving, saveResult, updateProfileField, saveProfile,
        changingPassword, passwordError, changePassword,
    };
}
