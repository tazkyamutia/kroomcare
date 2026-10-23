const crypto = require('crypto');
const db = require('../config/db');

/**
 * Middleware autentikasi JWT menggunakan Node.js built-in crypto (HMAC-SHA256).
 * Tidak memerlukan dependency eksternal (jsonwebtoken).
 *
 * Token format: base64url(header).base64url(payload).base64url(signature)
 * Payload: { userId, role, email, exp } atau { purpose: '2fa', userId, exp } untuk langkah 2FA.
 *
 * Selain token pengguna, panggilan server-ke-server (KolabPanel, sinkronisasi lokal) boleh memakai
 * header x-api-key = KROOMCARE_API_KEY dan diperlakukan sebagai role 'service'.
 */

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Tanpa secret, token bisa dipalsukan: tolak semua token daripada memakai nilai bawaan.
    throw new Error('JWT_SECRET belum diset di .env');
  }
  return secret;
};

const base64urlEncode = (buffer) => Buffer.from(buffer).toString('base64url');
const base64urlDecode = (str) => Buffer.from(str, 'base64url');

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
};

const signToken = (payload, expiresInSeconds = 12 * 60 * 60) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const headerPart = base64urlEncode(JSON.stringify(header));
  const payloadPart = base64urlEncode(JSON.stringify(body));
  const signingInput = `${headerPart}.${payloadPart}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(signingInput).digest('base64url');

  return `${signingInput}.${signature}`;
};

const verifyToken = (token) => {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;

    const [headerPart, payloadPart, signaturePart] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(`${headerPart}.${payloadPart}`)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signaturePart, 'base64url');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

    // Timing-safe comparison untuk mencegah side-channel attack
    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(base64urlDecode(payloadPart).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;

    return payload;
  } catch (err) {
    return null;
  }
};

// Token sesi untuk pengguna yang sudah lolos login / 2FA / SSO.
const issueSessionToken = (user) => signToken({
  userId: Number(user.id),
  role: user.role,
  email: user.email
});

const isServiceRequest = (req) => {
  const key = process.env.KROOMCARE_API_KEY;
  return Boolean(key) && safeEqual(req.headers['x-api-key'], key);
};

const readBearer = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
};

/**
 * Mengembalikan identitas pemanggil: { id, role, email, service } atau null.
 * Role diambil ulang dari database supaya user yang dihapus/diturunkan perannya langsung kehilangan akses.
 * `allowQueryToken` dipakai untuk EventSource (SSE) yang tidak bisa mengirim header Authorization.
 */
const resolveIdentity = async (req, { allowQueryToken = false } = {}) => {
  if (isServiceRequest(req)) {
    return { id: null, role: 'service', email: null, service: true };
  }

  const token = readBearer(req) || (allowQueryToken ? req.query.token : null);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.purpose || !payload.userId) return null;

  const [rows] = await db.query('SELECT id, role, email, nama FROM users WHERE id = ?', [payload.userId]);
  if (!rows.length) return null;

  return { id: Number(rows[0].id), role: rows[0].role, email: rows[0].email, name: rows[0].nama, service: false };
};

const authenticate = (options = {}) => async (req, res, next) => {
  try {
    const identity = await resolveIdentity(req, options);
    if (!identity) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.' });
    }
    req.user = identity;
    next();
  } catch (err) {
    console.error('[auth] gagal memverifikasi sesi:', err.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

/**
 * Middleware: memastikan request punya token valid (atau API key layanan).
 * Mengisi req.user = { id, role, email, service } bila berhasil.
 */
const requireAuth = authenticate();

const isStaffRole = (user) => Boolean(user) && (user.role === 'staff' || user.role === 'admin' || user.service === true);
const isAdminRole = (user) => Boolean(user) && (user.role === 'admin' || user.service === true);

/**
 * Middleware: memastikan request dari admin (atau layanan internal).
 * HARUS dipakai setelah requireAuth.
 */
const requireAdmin = (req, res, next) => {
  if (!isAdminRole(req.user)) {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus administrator.' });
  }
  next();
};

/**
 * Middleware: memastikan request dari staff ATAU admin (atau layanan internal).
 * HARUS dipakai setelah requireAuth.
 */
const requireStaffOrAdmin = (req, res, next) => {
  if (!isStaffRole(req.user)) {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus staf.' });
  }
  next();
};

/**
 * Middleware: pemanggil hanya boleh mengakses data miliknya sendiri, kecuali staff/admin.
 * `getId` mengambil id target dari request.
 */
const requireSelfOrStaff = (getId) => (req, res, next) => {
  const target = Number(getId(req));
  if (isStaffRole(req.user) || (Number.isInteger(target) && target === req.user.id)) return next();
  return res.status(403).json({ success: false, message: 'Akses ditolak.' });
};

const requireSelfOrAdmin = (getId) => (req, res, next) => {
  const target = Number(getId(req));
  if (isAdminRole(req.user) || (Number.isInteger(target) && target === req.user.id)) return next();
  return res.status(403).json({ success: false, message: 'Akses ditolak.' });
};

module.exports = {
  signToken,
  verifyToken,
  issueSessionToken,
  isServiceRequest,
  resolveIdentity,
  authenticate,
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin,
  requireSelfOrStaff,
  requireSelfOrAdmin,
  isStaffRole,
  isAdminRole,
  safeEqual
};
