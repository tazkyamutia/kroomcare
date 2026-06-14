const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'krooomcare@gmail.com',
    pass: 'arub dkir jegn lvsh'
  }
});

const otp = '123456';
const mailOptions = {
  from: '"KroomCare Support" <krooomcare@gmail.com>',
  to: 'mutiaramadhan2410@gmail.com',
  subject: 'Kode OTP Reset Password KroomCare',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #1e3a8a; margin: 0; font-size: 24px;">Reset Password KroomCare</h2>
        <p style="color: #64748b; margin-top: 5px;">Keamanan Anda adalah prioritas kami</p>
      </div>
      <p>Halo, <strong>Test User</strong></p>
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

console.log('Sending real test email to mutiaramadhan2410@gmail.com...');
transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.error('Send Error:', error);
  } else {
    console.log('Email sent successfully:', info.response);
  }
  process.exit(0);
});
