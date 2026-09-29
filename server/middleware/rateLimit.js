/**
 * Rate limiter in-memory sederhana (sliding window per IP + route).
 * Tidak memerlukan dependency eksternal (express-rate-limit / Redis).
 *
 * Keterbatasan: state disimpan di memori proses tunggal. Cukup untuk
 * workload single-instance; untuk multi-instance sebaiknya pakai Redis.
 */

const windowMs = 15 * 60 * 1000; // default window 15 menit
const maxRequests = 100;         // default max request per window

// Map: `${ip}:${route}` -> array timestamps
const hitStore = new Map();

// Periodic cleanup untuk mencegah memory leak
setInterval(() => {
  const cutoff = Date.now() - windowMs;
  for (const [key, timestamps] of hitStore.entries()) {
    const active = timestamps.filter((t) => t > cutoff);
    if (active.length === 0) hitStore.delete(key);
    else hitStore.set(key, active);
  }
}, windowMs).unref();

const rateLimit = (options = {}) => {
  const limit = options.max || maxRequests;
  const window = options.windowMs || windowMs;
  const message = options.message || 'Terlalu banyak permintaan. Silakan coba lagi nanti.';

  // Ikuti API express-rate-limit: jika max <= 0, disable
  if (limit <= 0) return (req, res, next) => next();

  return (req, res, next) => {
    // Ambil IP klien; handle proxy trust bila ada
    const ip = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'].split(',')[0].trim()
      : req.ip || req.connection.remoteAddress || 'unknown';

    const key = `${ip}:${req.method}:${req.originalUrl || req.url}`;
    const now = Date.now();
    const cutoff = now - window;

    const timestamps = (hitStore.get(key) || []).filter((t) => t > cutoff);
    timestamps.push(now);
    hitStore.set(key, timestamps);

    if (timestamps.length > limit) {
      const retryAfter = Math.ceil((timestamps[0] + window - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, message });
    }

    // Header standar rate limit
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - timestamps.length)));
    next();
  };
};

module.exports = rateLimit;