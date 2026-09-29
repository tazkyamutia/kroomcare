const crypto = require('crypto');

/**
 * Middleware autentikasi JWT menggunakan Node.js built-in crypto (HMAC-SHA256).
 * Tidak memerlukan dependency eksternal (jsonwebtoken).
 *
 * Token format: base64url(header).base64url(payload).base64url(signature)
 * Payload: { userId, role, email, exp }
 */

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fallback aman: hanya untuk development, log peringatan agar tidak digunakan di production.
    console.error('[auth] JWT_SECRET belum diset di .env! Gunakan nilai acak yang kuat.');
    return 'dev-insecure-fallback-secret-change-me';
  }
  return secret;
};

const base64urlEncode = (buffer) => Buffer.from(buffer).toString('base64url');
const base64urlDecode = (str) => Buffer.from(str, 'base64url');

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
    const parts = token.split('.');
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
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch (err) {
    return null;
  }
};

/**
 * Middleware: memastikan request punya token valid.
 * Mengisi req.user = { id, role, email } bila berhasil.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Autentikasi diperlukan.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }

  req.user = {
    id: payload.userId,
    role: payload.role,
    email: payload.email
  };
  next();
};

/**
 * Middleware: memastikan request dari admin.
 * HARUS dipakai setelah requireAuth.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus administrator.' });
  }
  next();
};

/**
 * Middleware: memastikan request dari staff ATAU admin.
 * HARUS dipakai setelah requireAuth.
 */
const requireStaffOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus staf.' });
  }
  next();
};

module.exports = {
  signToken,
  verifyToken,
  requireAuth,
  requireAdmin,
  requireStaffOrAdmin
};