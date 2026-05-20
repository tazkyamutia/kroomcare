const db = require('../config/db');

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
        message: 'Email tidak terdaftar.'
      });
    }

    const user = rows[0];

    // Cek password secara sederhana (plaintext sesuai isi database)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Password salah.'
      });
    }

    // Cek apakah 2FA diaktifkan untuk akun ini
    if (user.two_factor === 1) {
      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        userId: user.id.toString()
      });
    }

    // Map 'member' ke 'customer' untuk kompatibilitas dengan frontend React
    const roleMapped = user.role === 'member' ? 'customer' : user.role;

    res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        id: user.id.toString(),
        name: user.nama,
        email: user.email,
        role: roleMapped,
        points: user.koin_reward || 0,
        avatar: user.foto || ''
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
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
      message: 'Gagal mengambil data profil.',
      error: error.message
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
      message: 'Gagal memperbarui profil di server.',
      error: error.message
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

    // Cek password saat ini
    if (user.password !== current) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini salah.'
      });
    }

    // Update password
    await db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id]);

    res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui password di server.',
      error: error.message
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
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID wajib diisi.' });
    }

    const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = rows[0];
    const secret = generateSecret();
    
    const label = encodeURIComponent(`KroomCare:${user.email}`);
    const issuer = encodeURIComponent('KroomCare');
    const otpauthUrl = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCodeUrl
      }
    });
  } catch (error) {
    console.error('Error in setup2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat 2FA setup.', error: error.message });
  }
};

// Verify & Enable 2FA
const verify2FA = async (req, res) => {
  try {
    const { id, secret, code } = req.body;

    if (!id || !secret || !code) {
      return res.status(400).json({ success: false, message: 'ID, secret, dan OTP code wajib diisi.' });
    }

    const isValid = verifyTOTP(secret, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Kode OTP yang Anda masukkan salah atau sudah kadaluarsa.' });
    }

    await db.query('UPDATE users SET two_factor = 1, two_factor_secret = ? WHERE id = ?', [secret, id]);

    res.status(200).json({
      success: true,
      message: '2FA berhasil diaktifkan.'
    });
  } catch (error) {
    console.error('Error in verify2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal memverifikasi 2FA.', error: error.message });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID wajib diisi.' });
    }

    await db.query('UPDATE users SET two_factor = 0, two_factor_secret = NULL WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: '2FA berhasil dinonaktifkan.'
    });
  } catch (error) {
    console.error('Error in disable2FA:', error);
    res.status(500).json({ success: false, message: 'Gagal menonaktifkan 2FA.', error: error.message });
  }
};

// Login 2FA
const login2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ success: false, message: 'User ID dan Kode OTP wajib diisi.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    const user = rows[0];

    if (!user.two_factor || !user.two_factor_secret) {
      return res.status(400).json({ success: false, message: '2FA belum aktif untuk akun ini.' });
    }

    const isValid = verifyTOTP(user.two_factor_secret, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Kode OTP salah atau sudah kadaluarsa.' });
    }

    const roleMapped = user.role === 'member' ? 'customer' : user.role;
    let statusMapped = 'online';
    if (user.status_kerja === 'sibuk') statusMapped = 'busy';
    else if (user.status_kerja === 'offline') statusMapped = 'offline';

    res.status(200).json({
      success: true,
      message: 'Login 2FA berhasil.',
      data: {
        id: user.id.toString(),
        name: user.nama,
        email: user.email,
        role: roleMapped,
        points: user.koin_reward || 0,
        avatar: user.foto || '',
        status: statusMapped
      }
    });
  } catch (error) {
    console.error('Error in login2FA:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kroomcare97@gmail.com',
    pass: 'knwn yzan nnwo egfx'
  }
});

// Request OTP Lupa Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
    }

    const [rows] = await db.query('SELECT id, nama FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });
    }

    const user = rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dari sekarang

    // Simpan OTP di Database
    await db.query('UPDATE users SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?', [otp, expires, email]);

    // Kirim email
    const mailOptions = {
      from: '"KroomCare Support" <kroomcare97@gmail.com>',
      to: email,
      subject: 'Kode OTP Reset Password KroomCare',
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
      message: 'Kode OTP telah berhasil dikirim ke email Anda.'
    });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim email OTP.', error: error.message });
  }
};

// Verifikasi OTP & Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, dan password baru wajib diisi.' });
    }

    const [rows] = await db.query('SELECT reset_otp, reset_otp_expires FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak terdaftar.' });
    }

    const user = rows[0];

    if (!user.reset_otp || user.reset_otp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP salah.' });
    }

    const now = new Date();
    if (new Date(user.reset_otp_expires) < now) {
      return res.status(400).json({ success: false, message: 'Kode OTP telah kadaluarsa.' });
    }

    // Update password dan bersihkan field OTP
    await db.query('UPDATE users SET password = ?, reset_otp = NULL, reset_otp_expires = NULL WHERE email = ?', [newPassword, email]);

    res.status(200).json({
      success: true,
      message: 'Password Anda berhasil diperbarui.'
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui password.', error: error.message });
  }
};

module.exports = {
  login,
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  login2FA,
  forgotPassword,
  resetPassword
};
