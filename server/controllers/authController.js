const db = require('../config/db');
const QRCode = require('qrcode');
const { verifyPassword, hashPassword, randomUnusablePassword } = require('../utils/password');
const { issueSessionToken, signToken, verifyToken, safeEqual } = require('../middleware/auth');

// Percobaan kode salah per akun (OTP reset & 2FA). Melengkapi rate limit per IP agar tebakan terdistribusi tetap terbatas.
const MAX_CODE_FAILURES = 5;
const CODE_WINDOW_MS = 15 * 60 * 1000;
const codeFailures = new Map();
const recordCodeFailure = (key) => {
  const now = Date.now();
  const entry = codeFailures.get(key);
  const current = entry && now - entry.firstAt <= CODE_WINDOW_MS ? entry : { count: 0, firstAt: now };
  current.count += 1;
  codeFailures.set(key, current);
  return current.count >= MAX_CODE_FAILURES;
};
const isCodeLocked = (key) => {
  const entry = codeFailures.get(key);
  return Boolean(entry) && Date.now() - entry.firstAt <= CODE_WINDOW_MS && entry.count >= MAX_CODE_FAILURES;
};
const clearCodeFailures = (key) => codeFailures.delete(key);

// Tiket SSO hanya boleh ditukar sekali (nonce disimpan sampai tiket kedaluwarsa).
const usedSsoNonces = new Map();
const consumeSsoNonce = (nonce, exp) => {
  const now = Date.now();
  for (const [key, until] of usedSsoNonces) if (until < now) usedSsoNonces.delete(key);
  if (!nonce || usedSsoNonces.has(nonce)) return false;
  usedSsoNonces.set(nonce, (Number(exp) || Math.floor(now / 1000) + 300) * 1000);
  return true;
};

const sessionPayload = (user) => {
  let statusMapped = 'online';
  if (user.status_kerja === 'sibuk') statusMapped = 'busy';
  else if (user.status_kerja === 'offline') statusMapped = 'offline';
  return {
    id: user.id.toString(),
    name: user.nama,
    email: user.email,
    role: user.role === 'member' ? 'customer' : user.role,
    points: user.koin_reward || 0,
    avatar: user.foto || '',
    status: statusMapped
  };
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const user = rows[0];

    // Verifikasi password (mendukung scrypt hash maupun legacy plaintext)
    const { match, needsRehash } = await verifyPassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }
    if (needsRehash) {
      await db.query('UPDATE users SET password = ? WHERE id = ?', [await hashPassword(password), user.id]);
    }

    // Cek apakah 2FA diaktifkan untuk akun ini. Langkah 2FA hanya bisa dilanjutkan dengan token sementara ini,
    // sehingga kode OTP tidak bisa ditebak tanpa lebih dulu mengetahui password.
    if (user.two_factor === 1) {
      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        userId: user.id.toString(),
        twoFactorToken: signToken({ purpose: '2fa', userId: Number(user.id) }, 5 * 60)
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      token: issueSessionToken(user),
      data: sessionPayload(user)
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// Ambil data profil tunggal
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT id, nama, email, role, koin_reward, foto, status_kerja, two_factor FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    const user = rows[0];
    const roleMapped = user.role === 'member' ? 'customer' : user.role;

    // Map db status_kerja ke frontend status
    let statusMapped = 'online';
    if (user.status_kerja === 'sibuk') statusMapped = 'busy';
    else if (user.status_kerja === 'offline') statusMapped = 'offline';

    res.status(200).json({
      success: true,
      data: {
        id: user.id.toString(),
        name: user.nama,
        email: user.email,
        role: roleMapped,
        points: user.koin_reward || 0,
        avatar: user.foto || '',
        status: statusMapped,
        twoFactorEnabled: user.two_factor === 1
      }
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.'
    });
  }
};

// Update data profil (nama, email, foto avatar, status kerja)
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, avatar, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan email wajib diisi.'
      });
    }

    // Email adalah identitas login & SSO: hanya admin yang boleh mengubahnya.
    const [currentRows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (!currentRows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    if (req.user.role !== 'admin' && String(email).trim().toLowerCase() !== String(currentRows[0].email).trim().toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Email tidak dapat diubah. Hubungi administrator.' });
    }

    // Map frontend status ke db status_kerja
    let dbStatus = 'online';
    if (status === 'busy') dbStatus = 'sibuk';
    else if (status === 'offline') dbStatus = 'offline';

    const query = 'UPDATE users SET nama = ?, email = ?, foto = ?, status_kerja = ? WHERE id = ?';
    const [result] = await db.query(query, [name, email, avatar || null, dbStatus, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: {
        id,
        name,
        email,
        avatar,
        status
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil di server.'
    });
  }
};

// Ganti password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { current, newPassword } = req.body;

    if (!current || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru wajib diisi.'
      });
    }

    // Ambil user
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    const user = rows[0];

    // Cek password saat ini (mendukung scrypt hash maupun legacy plaintext)
    const { match } = await verifyPassword(current, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah.'
      });
    }

    // Update password dengan scrypt hash
    const hashedNew = await hashPassword(newPassword);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNew, id]);

    res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui password di server.'
    });
  }
};

const crypto = require('crypto');

// Helper base32 decoding
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = base32.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const buffer = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      buffer.push((value >> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(buffer);
}

// Helper verify TOTP code
function verifyTOTP(secret, code) {
  const timeSteps = [-1, 0, 1]; // allow 30s clock drift
  for (const step of timeSteps) {
    const epoch = Math.floor(Date.now() / 1000) + step * 30;
    const counter = Math.floor(epoch / 30);
    
    const countBuffer = Buffer.alloc(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
      countBuffer[i] = tmp & 0xff;
      tmp = Math.floor(tmp / 256);
    }
    
    try {
      const key = base32Decode(secret);
      const hmac = crypto.createHmac('sha1', key);
      hmac.update(countBuffer);
      const hmacResult = hmac.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const binCode =
        ((hmacResult[offset] & 0x7f) << 24) |
        ((hmacResult[offset + 1] & 0xff) << 16) |
        ((hmacResult[offset + 2] & 0xff) << 8) |
        (hmacResult[offset + 3] & 0xff);
        
      const calculatedOtp = (binCode % 1000000).toString().padStart(6, '0');
      if (calculatedOtp === code) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}

// Helper generate random base32 secret
function generateSecret() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 16; i++) {
    const rand = crypto.randomInt(0, alphabet.length);
    secret += alphabet[rand];
  }
  return secret;
}

// Setup 2FA
const setup2FA = async (req, res) => {
  try {
    const id = req.user.id;
    const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = rows[0];
    const secret = generateSecret();
    
    const label = encodeURIComponent(`KroomCare:${user.email}`);
    const issuer = encodeURIComponent('KroomCare');
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Error in setup2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat 2FA setup.' });
  }
};

// Verify & Enable 2FA
const verify2FA = async (req, res) => {
  try {
    const { secret, code } = req.body;
    const userId = req.user.id;

    if (!userId || !secret || !code) {
      return res.status(400).json({ success: false, message: 'Secret dan kode OTP wajib diisi.' });
    }

    const isValid = verifyTOTP(secret, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Kode OTP yang Anda masukkan salah atau sudah kadaluarsa.' });
    }

    await db.query('UPDATE users SET two_factor = 1, two_factor_secret = ? WHERE id = ?', [secret, userId]);

    res.status(200).json({
      success: true,
      message: '2FA berhasil diaktifkan.'
    });
  } catch (error) {
    console.error('Error in verify2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi 2FA.' });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    // Menonaktifkan 2FA wajib membuktikan masih memegang authenticator.
    const [secretRows] = await db.query('SELECT two_factor, two_factor_secret FROM users WHERE id = ?', [userId]);
    if (!secretRows.length) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    if (secretRows[0].two_factor && secretRows[0].two_factor_secret) {
      if (!code || !verifyTOTP(secretRows[0].two_factor_secret, String(code))) {
        return res.status(400).json({ success: false, message: 'Kode OTP dari aplikasi authenticator wajib dan harus benar untuk menonaktifkan 2FA.' });
      }
    }

    await db.query('UPDATE users SET two_factor = 0, two_factor_secret = NULL WHERE id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: '2FA berhasil dinonaktifkan.'
    });
  } catch (error) {
    console.error('Error in disable2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal menonaktifkan 2FA.' });
  }
};

// Login 2FA
const login2FA = async (req, res) => {
  try {
    const { twoFactorToken, code } = req.body;
    const pending = verifyToken(twoFactorToken);
    if (!pending || pending.purpose !== '2fa' || !pending.userId) {
      return res.status(401).json({ success: false, message: 'Sesi verifikasi 2FA kedaluwarsa. Silakan login ulang.' });
    }
    const userId = pending.userId;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Kode OTP wajib diisi.' });
    }
    if (isCodeLocked(`2fa:${userId}`)) {
      return res.status(429).json({ success: false, message: 'Terlalu banyak kode salah. Coba lagi dalam 15 menit.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = rows[0];

    if (!user.two_factor || !user.two_factor_secret) {
      return res.status(400).json({ success: false, message: '2FA belum aktif untuk akun ini.' });
    }

    const isValid = verifyTOTP(user.two_factor_secret, String(code));
    if (!isValid) {
      recordCodeFailure(`2fa:${userId}`);
      return res.status(400).json({ success: false, message: 'Kode OTP salah atau sudah kadaluarsa.' });
    }
    clearCodeFailures(`2fa:${userId}`);

    res.status(200).json({
      success: true,
      message: 'Login 2FA berhasil.',
      token: issueSessionToken(user),
      data: sessionPayload(user)
    });
  } catch (error) {
    console.error('Error in login2FA:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

const nodemailer = require('nodemailer');
const dns = require('dns');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

// Request OTP Lupa Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  let otp;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
    }

    const [rows] = await db.query('SELECT id, nama FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Jawaban sama dengan email terdaftar agar daftar akun tidak bisa ditebak.
      return res.status(200).json({ success: true, message: 'Jika email terdaftar, kode OTP telah dikirim.' });
    }

    const user = rows[0];
    otp = crypto.randomInt(100000, 1000000).toString();
    clearCodeFailures(`reset:${String(email).toLowerCase()}`);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

    // Simpan OTP di Database
    await db.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?', [otp, expires, email]);

    // Kirim email
    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'KroomCare Support'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
      to: email,
      subject: 'Kode OTP Reset Password KroomCare',
      text: `Halo ${user.nama},\n\nKami menerima permintaan untuk mereset kata sandi akun Anda. Silakan gunakan kode OTP berikut untuk melanjutkan proses reset password:\n\n${otp}\n\nKode OTP ini hanya berlaku selama 10 menit. Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini dengan aman.\n\nSalam,\n${process.env.MAIL_FROM_NAME || 'KroomCare Support'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">Reset Password KroomCare</h2>
            <p style="color: #64748b; margin-top: 5px;">Keamanan Anda adalah prioritas kami</p>
          </div>
          <p>Halo, <strong>${user.nama}</strong></p>
          <p>Kami menerima permintaan untuk mereset kata sandi akun Anda. Silakan gunakan kode OTP di bawah ini untuk melanjutkan proses reset password:</p>
          <div style="text-align: center; margin: 40px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #3b82f6; background-color: #f8fafc; padding: 20px 40px; border-radius: 16px; border: 2px dashed #cbd5e1; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Kode OTP ini hanya berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa mengajukan permintaan ini, silakan abaikan email ini dengan aman.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">Ini adalah email otomatis dari sistem KroomCare, mohon tidak membalas langsung.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Jika email terdaftar, kode OTP telah dikirim.'
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengirim email OTP. Silakan periksa konfigurasi email atau coba lagi nanti.'
    });
  }
};

// Verifikasi OTP & Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, dan password baru wajib diisi.' });
    }

    const attemptKey = `reset:${String(email).toLowerCase()}`;
    const [rows] = await db.query('SELECT reset_otp, reset_otp_expires FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Kode OTP salah.' });
    }

    const user = rows[0];

    if (!user.reset_otp || !safeEqual(user.reset_otp, String(otp))) {
      // Setelah 5 kali salah, kode dibatalkan dan pengguna harus meminta kode baru.
      if (recordCodeFailure(attemptKey)) {
        clearCodeFailures(attemptKey);
        await db.query('UPDATE users SET reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?', [email]);
        return res.status(400).json({ success: false, message: 'Terlalu banyak kode salah. Silakan minta kode OTP baru.' });
      }
      return res.status(400).json({ success: false, message: 'Kode OTP salah.' });
    }
    clearCodeFailures(attemptKey);

    const now = new Date();
    if (new Date(user.reset_otp_expires) < now) {
      return res.status(400).json({ success: false, message: 'Kode OTP telah kadaluarsa.' });
    }

    // Update password dengan scrypt hash dan bersihkan field OTP
    const hashedNew = await hashPassword(newPassword);
    await db.query('UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?', [hashedNew, email]);

    res.status(200).json({
      success: true,
      message: 'Password Anda berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
  }
};
// Register User
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.'
      });
    }

    // Periksa apakah email sudah terdaftar
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const [existingUsers] = await db.query(checkQuery, [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.'
      });
    }

    // Insert user baru dengan scrypt hash dan default role 'member' dan koin_reward 0
    const hashedPwd = await hashPassword(password);
    const insertQuery = 'INSERT INTO users (nama, email, password, role, koin_reward) VALUES (?, ?, ?, ?, ?)';
    await db.query(insertQuery, [name, email, hashedPwd, 'member', 0]);

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Silakan login.'
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat registrasi.'
    });
  }
};

// Pertukaran Tiket Single Sign-On (SSO) dari Kroombox Panel
const ssoExchange = async (req, res) => {
  try {
    const { ticket } = req.body;
    if (!ticket || typeof ticket !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Tiket autentikasi SSO wajib disertakan.'
      });
    }

    const parts = ticket.split('.');
    if (parts.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Format token SSO tidak valid.'
      });
    }

    const [headerB64, payloadB64, signature] = parts;

    // Kunci rahasia untuk verifikasi HMAC-SHA256
    // Hanya kunci bersama dengan KolabPanel (KROOMCARE_API_KEY) yang boleh menandatangani tiket SSO.
    const secret = process.env.KROOMCARE_API_KEY;
    const expectedSig = secret ? crypto.createHmac('sha256', secret).update(`${headerB64}.${payloadB64}`).digest('base64url') : '';
    const isValid = Boolean(secret) && safeEqual(expectedSig, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Verifikasi tanda tangan tiket SSO gagal. Token tidak sah.'
      });
    }

    let payload;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Gagal mendekode data tiket SSO.'
      });
    }

    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      return res.status(401).json({
        success: false,
        message: 'Tiket SSO telah kedaluwarsa. Silakan muat ulang halaman.'
      });
    }

    if (!consumeSsoNonce(payload.nonce, payload.exp)) {
      return res.status(401).json({
        success: false,
        message: 'Tiket SSO sudah dipakai. Silakan muat ulang halaman.'
      });
    }

    const email = payload.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Identitas email tidak ditemukan dalam tiket SSO.'
      });
    }

    // Cari pengguna di database
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      // JIT Provisioning akun baru jika belum ada
      const targetRole = payload.role === 'admin' ? 'admin' : (payload.role === 'staff' ? 'staff' : 'member');
      const defaultPassword = await randomUnusablePassword();
      const insertQuery = `
        INSERT INTO users (nama, email, password, role, koin_reward)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [insertResult] = await db.query(insertQuery, [
        payload.name || payload.username || email.split('@')[0],
        email,
        defaultPassword,
        targetRole,
        0
      ]);

      const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [insertResult.insertId]);
      user = newUsers[0];
    }

    const roleMapped = user.role === 'member' ? 'customer' : user.role;
    const rawTheme = payload.theme || payload.themePreference || payload.mode || payload.colorScheme || null;
    const detectedTheme = rawTheme === 'dark' || rawTheme === 'light' ? rawTheme : null;

    // Token sesi bertanda tangan yang sama dengan login biasa
    const sessionToken = issueSessionToken(user);

    res.status(200).json({
      success: true,
      message: 'Autentikasi SSO berhasil.',
      token: sessionToken,
      lang: payload.lang || payload.language || null,
      theme: detectedTheme,
      data: {
        id: user.id.toString(),
        name: user.nama,
        email: user.email,
        role: roleMapped,
        points: user.koin_reward || 0,
        avatar: user.foto || '',
        lang: payload.lang || payload.language || null,
        theme: detectedTheme
      }
    });
  } catch (error) {
    console.error('Error in ssoExchange:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memproses SSO.'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  login2FA,
  forgotPassword,
  resetPassword,
  ssoExchange
};
