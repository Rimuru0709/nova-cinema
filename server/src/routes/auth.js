import { Router, urlencoded } from "express";
import {
    createHash,
    createHmac,
    createPublicKey,
    randomBytes,
    scrypt,
    sign,
    timingSafeEqual,
    verify,
} from "node:crypto";
import { promisify } from "node:util";
import pool from "../config/db.js";

const router = Router();
const deriveKey = promisify(scrypt);

const COOKIE_NAME = "nova_session";
const SHORT_SESSION = 12 * 60 * 60;
const REMEMBERED_SESSION = 7 * 24 * 60 * 60;

const cookieOptions = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/api",
};

const oauthProviders = {
    google: {
        authorize: "https://accounts.google.com/o/oauth2/v2/auth",
        token: "https://oauth2.googleapis.com/token",
        keys: "https://www.googleapis.com/oauth2/v3/certs",
        issuers: ["https://accounts.google.com", "accounts.google.com"],
        scope: "openid email profile",
    },
    apple: {
        authorize: "https://appleid.apple.com/auth/authorize",
        token: "https://appleid.apple.com/auth/token",
        keys: "https://appleid.apple.com/auth/keys",
        issuers: ["https://appleid.apple.com"],
        scope: "name email",
    },
};

function oauthOrigin() {
    const url = new URL(process.env.CLIENT_URL || "http://localhost:5173");
    if (url.protocol !== "https:" && !(url.protocol === "http:" && url.hostname === "localhost"
        && process.env.NODE_ENV !== "production")) {
        throw new Error("CLIENT_URL must use HTTPS outside localhost");
    }
    return url;
}

function oauthConfig(provider, origin) {
    if (provider === "google") {
        const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
        return id && secret ? { id, signingKey: secret, clientSecret: () => secret } : null;
    }
    const {
        APPLE_CLIENT_ID: id, APPLE_TEAM_ID: team, APPLE_KEY_ID: keyId, APPLE_PRIVATE_KEY: key,
    } = process.env;
    if (origin.protocol !== "https:" || !id || !team || !keyId || !key) return null;
    const pem = key.replace(/\\n/g, "\n");
    return {
        id,
        signingKey: pem,
        clientSecret() {
            const now = Math.floor(Date.now() / 1000);
            const header = encodeJson({ alg: "ES256", kid: keyId });
            const payload = encodeJson({ iss: team, iat: now, exp: now + 600, aud: "https://appleid.apple.com", sub: id });
            const input = `${header}.${payload}`;
            const signature = sign("sha256", Buffer.from(input), { key: pem, dsaEncoding: "ieee-p1363" });
            return `${input}.${signature.toString("base64url")}`;
        },
    };
}

function encodeJson(value) {
    return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeJson(value) {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

function safeEqual(first, second) {
    if (typeof first !== "string" || typeof second !== "string") return false;
    const a = Buffer.from(first);
    const b = Buffer.from(second);
    return a.length === b.length && timingSafeEqual(a, b);
}

function oauthCookie(provider, origin) {
    const secure = origin.protocol === "https:";
    return {
        name: `${secure ? "__Host-" : ""}nova_oauth_${provider}`,
        options: { httpOnly: true, secure, sameSite: provider === "apple" ? "none" : "lax", path: "/" },
    };
}

function readOAuthFlow(req, name, provider, signingKey) {
    const saved = (req.headers.cookie ?? "").split(";").map((item) => item.trim())
        .find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
    if (!saved) return null;
    const [payload, mac, extra] = saved.split(".");
    if (!payload || !mac || extra || !safeEqual(mac, signOAuthFlow(payload, signingKey))) return null;
    const flow = decodeJson(payload);
    return flow.provider === provider && flow.expires > Date.now() ? flow : null;
}

function signOAuthFlow(payload, key) {
    return createHmac("sha256", key).update(payload).digest("base64url");
}

async function providerJson(url, options = {}) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(10000), redirect: "error" });
    if (!response.ok) throw new Error("OAuth provider request failed");
    return response.json();
}

async function verifyOAuthIdentity(provider, idToken, clientId, nonce) {
    if (typeof idToken !== "string" || idToken.length > 16384) throw new Error("Invalid identity token");
    const [encodedHeader, encodedClaims, signature, extra] = idToken.split(".");
    if (!encodedHeader || !encodedClaims || !signature || extra) throw new Error("Invalid identity token format");

    const header = decodeJson(encodedHeader);
    if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Invalid identity token algorithm");
    const { keys } = await providerJson(provider.keys);
    const jwk = keys.find((key) => key.kid === header.kid && key.kty === "RSA");
    if (!jwk || !verify("RSA-SHA256", Buffer.from(`${encodedHeader}.${encodedClaims}`),
        createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(signature, "base64url"))) {
        throw new Error("Invalid identity token signature");
    }
    const claims = decodeJson(encodedClaims);
    const now = Math.floor(Date.now() / 1000);
    if (!provider.issuers.includes(claims.iss) || claims.aud !== clientId
        || (claims.azp && claims.azp !== clientId) || !Number.isFinite(claims.exp) || claims.exp <= now
        || !Number.isFinite(claims.iat) || claims.iat > now + 60
        || !safeEqual(claims.nonce, nonce) || typeof claims.sub !== "string"
        || !claims.sub || Buffer.byteLength(claims.sub) > 255) {
        throw new Error("Invalid identity token claims");
    }
    return claims;
}

async function createOAuthSession(provider, claims, suggestedName) {
    const db = await pool.getConnection();
    try {
        await db.beginTransaction();
        const subject = Buffer.from(claims.sub);
        const [rows] = await db.execute(
            `SELECT CAST(u.id AS CHAR) AS id, u.status, u.role
             FROM oauth_identities i JOIN users u ON u.id = i.user_id
             WHERE i.provider = ? AND i.subject = ? FOR UPDATE`,
            [provider, subject],
        );
        let user = rows[0];
        if (user && user.status !== "active") {
            await db.rollback();
            return { error: "unavailable" };
        }

        if (!user) {
            const email = normalizeEmail(claims.email);
            if (!validEmail(email) || ![true, "true"].includes(claims.email_verified)) {
                await db.rollback();
                return { error: "email" };
            }
            const name = text(claims.name || suggestedName).replace(/[\p{Cc}\p{Cf}]/gu, "").trim();
            const fullName = (name.length >= 2 ? name : "Thành viên NOVA").slice(0, 150);
            await db.execute(
                "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
                [fullName, email, "oauth-only"],
            );
            const [ids] = await db.query("SELECT CAST(LAST_INSERT_ID() AS CHAR) AS id");
            user = ids[0];
            await db.execute(
                "INSERT INTO oauth_identities (provider, subject, user_id) VALUES (?, ?, ?)",
                [provider, subject, user.id],
            );
        }

        const token = randomBytes(32).toString("hex");
        await db.execute(
            "INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP()))",
            [tokenHash(token), user.id, SHORT_SESSION],
        );
        await db.commit();
        return { token, role: user.role || "user" };
    } catch (error) {
        await db.rollback();
        if (error.code === "ER_DUP_ENTRY") return { error: "existing_email" };
        if (error.code === "ER_NO_SUCH_TABLE") return { error: "database" };
        throw error;
    } finally {
        db.release();
    }
}

function oauthReturn(res, origin, error, role) {
    const url = new URL("/", origin);
    url.hash = error ? "dang-nhap" : role === "admin" ? "admin" : "trang-chu";
    if (error) url.searchParams.set("authError", error);
    return res.redirect(303, url.href);
}

function text(value) {
    return typeof value === "string" ? value : "";
}

function normalizeEmail(value) {
    return text(value).trim().toLowerCase();
}

function validEmail(email) {
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(value) {
    const phone = text(value).replace(/[\s().-]/g, "");

    if (/^0\d{9}$/.test(phone)) return `+84${phone.slice(1)}`;
    if (/^\+84\d{9}$/.test(phone)) return phone;

    return null;
}

function validPasswordInput(password) {
    return typeof password === "string" &&
        password.length > 0 &&
        Buffer.byteLength(password, "utf8") <= 256;
}

async function hashPassword(password) {
    const salt = randomBytes(16);
    const key = await deriveKey(password, salt, 64);

    return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
    const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(
        storedHash ?? "",
    );

    // Vẫn chạy scrypt khi tài khoản không tồn tại để giảm chênh lệch thời gian.
    const salt = match ? Buffer.from(match[1], "hex") : Buffer.alloc(16);
    const expected = match ? Buffer.from(match[2], "hex") : Buffer.alloc(64);
    const actual = await deriveKey(password, salt, 64);

    const matches = timingSafeEqual(actual, expected);
    return Boolean(match) && matches;
}

function tokenHash(token) {
    return createHash("sha256").update(token).digest();
}

function readToken(req) {
    const cookie = (req.headers.cookie ?? "")
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    const token = cookie?.slice(COOKIE_NAME.length + 1) ?? "";
    return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function publicUser(user) {
    return {
        id: String(user.id),
        fullName: user.full_name,
        email: user.email,
        phone: user.phone ?? null,
        role: user.role,
    };
}

const profileGenders = new Set(["", "male", "female", "other", "private"]);

function validBirthDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01") return false;
    const date = new Date(`${value}T00:00:00Z`);
    const todayInVietnam = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
        && value <= todayInVietnam;
}

async function preferencesFor(userId) {
    try {
        const [rows] = await pool.execute(
            `SELECT DATE_FORMAT(birth_date, '%Y-%m-%d') AS birthDate, gender,
                    CAST(favorite_cinema_id AS CHAR) AS favoriteCinemaId
             FROM user_profile_preferences WHERE user_id = ?`,
            [userId],
        );
        return { profileReady: true, ...rows[0] };
    } catch (error) {
        if (error.code !== "ER_NO_SUCH_TABLE") throw error;
        return { profileReady: false };
    }
}

function fail(res, status, message) {
    return res.status(status).json({ success: false, message });
}

router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");

    const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
    const requestOrigin = req.get("Origin");

    const appleCallback = req.method === "POST" && req.path === "/oauth/apple/callback";
    if (!appleCallback && ["POST", "PATCH"].includes(req.method) && requestOrigin && requestOrigin !== clientOrigin) {
        return fail(res, 403, "Địa chỉ gửi yêu cầu không được phép.");
    }

    next();
});

router.get("/oauth/:provider/start", (req, res) => {
    const key = req.params.provider;
    if (!Object.hasOwn(oauthProviders, key)) return fail(res, 404, "Dịch vụ đăng nhập không tồn tại.");
    const origin = oauthOrigin();
    const config = oauthConfig(key, origin);
    if (!config) return oauthReturn(res, origin, `${key}_config`);

    const provider = oauthProviders[key];
    const flow = {
        provider: key,
        state: randomBytes(32).toString("base64url"),
        nonce: randomBytes(32).toString("base64url"),
        verifier: randomBytes(32).toString("base64url"),
        expires: Date.now() + 600000,
    };
    const payload = encodeJson(flow);
    const cookie = oauthCookie(key, origin);
    res.cookie(cookie.name, `${payload}.${signOAuthFlow(payload, config.signingKey)}`, { ...cookie.options, maxAge: 600000 });
    const url = new URL(provider.authorize);
    url.search = new URLSearchParams({
        client_id: config.id,
        redirect_uri: new URL(`/api/auth/oauth/${key}/callback`, origin).href,
        response_type: "code",
        scope: provider.scope,
        state: flow.state,
        nonce: flow.nonce,
        ...(key === "apple"
            ? { response_mode: "form_post" }
            : {
                code_challenge_method: "S256",
                code_challenge: createHash("sha256").update(flow.verifier).digest("base64url"),
            }),
    }).toString();
    return res.redirect(303, url.href);
});

function oauthCallback(key) {
    return async (req, res) => {
        const origin = oauthOrigin();
        const config = oauthConfig(key, origin);
        if (!config) return oauthReturn(res, origin, `${key}_config`);
        const params = key === "apple" ? (req.body ?? {}) : req.query;
        const cookie = oauthCookie(key, origin);
        try {
            const flow = readOAuthFlow(req, cookie.name, key, config.signingKey);
            if (!flow || !safeEqual(flow.state, params.state)) return oauthReturn(res, origin, "flow");
            res.clearCookie(cookie.name, cookie.options);
            if (params.error) return oauthReturn(res, origin, "cancelled");
            if (typeof params.code !== "string" || !params.code || params.code.length > 2048) {
                return oauthReturn(res, origin, "flow");
            }

            const provider = oauthProviders[key];
            const tokens = await providerJson(provider.token, {
                method: "POST",
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: params.code,
                    client_id: config.id,
                    client_secret: config.clientSecret(),
                    redirect_uri: new URL(`/api/auth/oauth/${key}/callback`, origin).href,
                    ...(key === "google" && { code_verifier: flow.verifier }),
                }),
            });
            const claims = await verifyOAuthIdentity(provider, tokens.id_token, config.id, flow.nonce);
            let suggestedName = "";
            if (key === "apple" && typeof params.user === "string") {
                const name = JSON.parse(params.user)?.name;
                suggestedName = [text(name?.firstName), text(name?.lastName)].join(" ");
            }
            const result = await createOAuthSession(key, claims, suggestedName);
            if (result.error) return oauthReturn(res, origin, result.error);
            res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
            res.cookie(COOKIE_NAME, result.token, { ...cookieOptions, secure: origin.protocol === "https:" });
            return oauthReturn(res, origin, undefined, result.role);
        } catch (error) {
            console.error("Social sign-in:", key, error.code || error.name);
            return oauthReturn(res, origin, "unavailable");
        }
    };
}

router.get("/oauth/google/callback", oauthCallback("google"));
router.post("/oauth/apple/callback", urlencoded({ extended: false, limit: "16kb" }), oauthCallback("apple"));

router.post("/register", async (req, res) => {
    const { fullName, email, phone, password } = req.body ?? {};
    const name = text(fullName).trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (name.length < 2 || name.length > 150) {
        return fail(res, 400, "Họ tên phải có từ 2 đến 150 ký tự.");
    }

    if (!validEmail(normalizedEmail)) {
        return fail(res, 400, "Địa chỉ email không hợp lệ.");
    }

    if (phone != null && phone !== "" && !normalizedPhone) {
        return fail(res, 400, "Số điện thoại Việt Nam không hợp lệ.");
    }

    if (!validPasswordInput(password) || password.length < 8) {
        return fail(res, 400, "Mật khẩu cần ít nhất 8 ký tự và tối đa 256 byte.");
    }

    try {
        const passwordHash = await hashPassword(password);

        await pool.execute(
            `INSERT INTO users (full_name, email, phone, password_hash)
             VALUES (?, ?, ?, ?)`,
            [name, normalizedEmail, normalizedPhone, passwordHash],
        );

        return res.status(201).json({
            success: true,
            message: "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return fail(res, 409, "Email hoặc số điện thoại đã được sử dụng.");
        }

        throw error;
    }
});

router.post("/login", async (req, res) => {
    const { account, password, remember } = req.body ?? {};
    const identifier = text(account).trim();
    const email = normalizeEmail(identifier);
    const phone = normalizePhone(identifier);

    if ((!validEmail(email) && !phone && (identifier.length < 2 || identifier.length > 150))
        || !validPasswordInput(password)) {
        return fail(res, 400, "Vui lòng nhập tài khoản và mật khẩu hợp lệ.");
    }

    let condition = "full_name = ?";
    let params = [identifier];

    if (validEmail(email)) {
        condition = "email = ?";
        params = [email];
    } else if (phone) {
        condition = "phone IN (?, ?)";
        params = [phone, `0${phone.slice(3)}`];
    }

    const [users] = await pool.execute(
        `SELECT CAST(id AS CHAR) AS id, full_name, email, phone, role, status, password_hash
         FROM users
         WHERE ${condition}
         LIMIT 2`,
        params,
    );

    // A display name can belong to more than one account. Never choose between them.
    const user = users.length === 1 ? users[0] : null;
    const passwordMatches = await verifyPassword(password, user?.password_hash);

    if (!passwordMatches || user?.status !== "active") {
        return fail(res, 401, "Không đăng nhập được với thông tin đã nhập. Nếu dùng họ tên, hãy thử đăng nhập bằng email.");
    }

    const token = randomBytes(32).toString("hex");
    const duration = remember === true ? REMEMBERED_SESSION : SHORT_SESSION;
    const previousToken = readToken(req);

    if (previousToken) {
        await pool.execute(
            "DELETE FROM auth_sessions WHERE token_hash = ?",
            [tokenHash(previousToken)],
        );
    }

    const [session] = await pool.execute(
        `INSERT INTO auth_sessions (token_hash, user_id, expires_at)
         SELECT ?, id, TIMESTAMPADD(SECOND, ?, UTC_TIMESTAMP())
         FROM users WHERE id = ? AND status = 'active' AND BINARY password_hash = ?`,
        [tokenHash(token), duration, user.id, user.password_hash],
    );
    if (!session.affectedRows) return fail(res, 401, "Tài khoản hoặc mật khẩu không đúng.");

    res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
    res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        ...(remember === true ? { maxAge: duration * 1000 } : {}),
    });

    return res.json({
        success: true,
        message: "Đăng nhập thành công.",
        user: publicUser(user),
    });
});

export async function requireSession(req, res, next) {
    const token = readToken(req);

    if (!token) {
        return fail(res, 401, "Bạn chưa đăng nhập.");
    }

    const [users] = await pool.execute(
        `SELECT CAST(u.id AS CHAR) AS id, u.full_name, u.email, u.phone, u.role, u.password_hash
         FROM auth_sessions AS s
         JOIN users AS u ON u.id = s.user_id
         WHERE s.token_hash = ?
           AND s.expires_at > UTC_TIMESTAMP()
           AND u.status = 'active'
         LIMIT 1`,
        [tokenHash(token)],
    );

    if (!users[0]) {
        res.clearCookie(COOKIE_NAME, cookieOptions);
        res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
        return fail(res, 401, "Phiên đăng nhập không còn hiệu lực.");
    }

    res.locals.account = users[0];
    res.locals.sessionHash = tokenHash(token);
    next();
}

export function requireAdmin(_req, res, next) {
    if (res.locals.account.role !== "admin") {
        return fail(res, 403, "Bạn cần quyền quản trị viên để truy cập chức năng này.");
    }
    next();
}

router.get("/admin/session", requireSession, requireAdmin, (_req, res) => {
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, user: publicUser(res.locals.account) });
});

router.get("/admin/users", requireSession, requireAdmin, async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const search = req.query.q ?? "";
    if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000
        || typeof search !== "string" || search.length > 150) {
        return fail(res, 400, "Tham số tìm kiếm hoặc số trang không hợp lệ.");
    }

    const query = search.trim();
    const pageSize = 25;
    const where = query ? "WHERE LOCATE(?, full_name) > 0 OR LOCATE(?, email) > 0" : "";
    const params = query ? [query, query] : [];

    const [counts] = await pool.execute(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const total = Number(counts[0].total);
    const [users] = await pool.query(
        `SELECT CAST(id AS CHAR) AS id, full_name AS fullName, email, phone, role, status,
                DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') AS createdAt
         FROM users
         ${where}
         ORDER BY created_at DESC, id DESC
         LIMIT ? OFFSET ?`,
        [...params, pageSize, (page - 1) * pageSize],
    );
    return res.json({ success: true, users, page, pageSize, total });
});

router.get("/me", requireSession, async (_req, res) => {
    const account = res.locals.account;
    const { profileReady, ...preferences } = await preferencesFor(account.id);
    return res.json({ success: true, profileReady, user: { ...publicUser(account), ...preferences } });
});

router.patch("/me", requireSession, async (req, res) => {
    if (!req.is("application/json")) {
        return fail(res, 415, "Yêu cầu phải gửi dữ liệu JSON.");
    }

    const { fullName, phone, birthDate, gender, favoriteCinemaId } = req.body ?? {};
    const name = text(fullName).trim();
    const normalizedPhone = normalizePhone(phone);

    if (name.length < 2 || name.length > 150) {
        return fail(res, 400, "Họ tên phải có từ 2 đến 150 ký tự.");
    }

    if (typeof phone !== "string" || (phone.trim() && !normalizedPhone)) {
        return fail(res, 400, "Số điện thoại Việt Nam không hợp lệ.");
    }

    const account = res.locals.account;
    const updatePreferences = [birthDate, gender, favoriteCinemaId].some((value) => value !== undefined);
    if (updatePreferences && (
        typeof birthDate !== "string" || (birthDate !== "" && !validBirthDate(birthDate))
        || !profileGenders.has(gender)
        || typeof favoriteCinemaId !== "string"
        || (favoriteCinemaId !== "" && !/^[1-9]\d{0,18}$/.test(favoriteCinemaId))
    )) {
        return fail(res, 400, "Ngày sinh, giới tính hoặc rạp yêu thích không hợp lệ.");
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        if (normalizedPhone) {
            const [duplicates] = await connection.execute(
                "SELECT 1 FROM users WHERE id <> ? AND phone IN (?, ?) LIMIT 1",
                [account.id, normalizedPhone, `0${normalizedPhone.slice(3)}`],
            );

            if (duplicates.length) {
                await connection.rollback();
                return fail(res, 409, "Số điện thoại đã được sử dụng.");
            }
        }

        if (updatePreferences && favoriteCinemaId) {
            const [cinemas] = await connection.execute(
                `SELECT id FROM cinemas WHERE id = ? AND (
                    is_active = TRUE OR EXISTS (
                        SELECT 1 FROM user_profile_preferences
                        WHERE user_id = ? AND favorite_cinema_id = cinemas.id
                    )
                 )`,
                [favoriteCinemaId, account.id],
            );
            if (!cinemas.length) {
                await connection.rollback();
                return fail(res, 400, "Cụm rạp đã chọn không còn khả dụng.");
            }
        }

        // Kiểm tra phiên và trạng thái tài khoản ngay lúc ghi.
        const [result] = await connection.execute(
            `UPDATE users AS u
             JOIN auth_sessions AS s ON s.user_id = u.id
             SET u.full_name = ?, u.phone = ?
             WHERE u.id = ? AND u.status = 'active'
               AND s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()`,
            [name, normalizedPhone, account.id, res.locals.sessionHash],
        );

        if (!result.affectedRows) {
            await connection.rollback();
            res.clearCookie(COOKIE_NAME, cookieOptions);
        res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
            return fail(res, 401, "Phiên đăng nhập không còn hiệu lực.");
        }

        if (updatePreferences) {
            const values = [birthDate || null, gender || null, favoriteCinemaId || null];
            await connection.execute(
                `INSERT INTO user_profile_preferences (user_id, birth_date, gender, favorite_cinema_id)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE birth_date = ?, gender = ?, favorite_cinema_id = ?`,
                [account.id, ...values, ...values],
            );
        }
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_DUP_ENTRY") {
            return fail(res, 409, "Số điện thoại đã được sử dụng.");
        }
        if (error.code === "ER_NO_SUCH_TABLE" && updatePreferences) {
            return fail(res, 503, "Cần chạy cập nhật database trước khi lưu các trường mới.");
        }
        throw error;
    } finally {
        connection.release();
    }

    return res.json({
        success: true,
        message: "Đã lưu thay đổi hồ sơ.",
        user: {
            ...publicUser({ ...account, full_name: name, phone: normalizedPhone }),
            ...(updatePreferences && {
                birthDate: birthDate || null, gender: gender || null, favoriteCinemaId: favoriteCinemaId || null,
            }),
        },
    });
});

router.patch("/password", requireSession, async (req, res) => {
    if (!req.is("application/json")) return fail(res, 415, "Yêu cầu phải gửi dữ liệu JSON.");

    const { currentPassword, newPassword } = req.body ?? {};
    if (!validPasswordInput(currentPassword) || !validPasswordInput(newPassword) || newPassword.length < 8) {
        return fail(res, 400, "Mật khẩu mới cần ít nhất 8 ký tự và tối đa 256 byte.");
    }
    if (newPassword === currentPassword) {
        return fail(res, 400, "Mật khẩu mới phải khác mật khẩu hiện tại.");
    }

    const account = res.locals.account;
    if (!await verifyPassword(currentPassword, account.password_hash)) {
        return fail(res, 400, "Mật khẩu hiện tại không đúng.");
    }

    const passwordHash = await hashPassword(newPassword);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
            `UPDATE users AS u JOIN auth_sessions AS s ON s.user_id = u.id
             SET u.password_hash = ?
             WHERE u.id = ? AND u.status = 'active' AND BINARY u.password_hash = ?
               AND s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()`,
            [passwordHash, account.id, account.password_hash, res.locals.sessionHash],
        );
        if (!result.affectedRows) {
            await connection.rollback();
            res.clearCookie(COOKIE_NAME, cookieOptions);
        res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
            return fail(res, 401, "Phiên đã thay đổi. Vui lòng đăng nhập lại.");
        }
        await connection.execute("DELETE FROM auth_sessions WHERE user_id = ?", [account.id]);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);
        res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
    return res.json({ success: true, message: "Đã đổi mật khẩu. Hãy đăng nhập lại bằng mật khẩu mới." });
});

router.post("/logout", async (req, res) => {
    const token = readToken(req);

    if (token) {
        await pool.execute(
            "DELETE FROM auth_sessions WHERE token_hash = ?",
            [tokenHash(token)],
        );
    }

    res.clearCookie(COOKIE_NAME, cookieOptions);
        res.clearCookie(COOKIE_NAME, { ...cookieOptions, path: "/api/auth" });
    return res.json({ success: true, message: "Đã đăng xuất." });
});

// Express 5 chuyển lỗi từ các route async tới đây.
router.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);

    console.error("Auth API:", error.code || error.name);
    return fail(res, 500, "Máy chủ không xử lý được yêu cầu. Vui lòng thử lại.");
});

export default router;
