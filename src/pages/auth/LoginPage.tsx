import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight, Loader2, ArrowLeft, Mail, Twitter, Instagram, Github, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { DUMMY_USERS } from '../../utils/dummyData';
import { useUser } from '../../context/UserContext';

export const LoginPage = () => {
  const { setUser } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  // State untuk 2FA
  const [twoFactorRequired, setTwoFactorRequired] = React.useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = React.useState('');
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [twoFactorError, setTwoFactorError] = React.useState('');

  // State untuk Lupa Password & Reset Password
  const [mode, setMode] = React.useState<'login' | 'forgot' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.twoFactorRequired) {
          setTwoFactorRequired(true);
          setTwoFactorUserId(result.userId);
          setIsLoading(false);
          return;
        }
        setUser(result.data);
        navigate('/');
      } else {
        setError(result.message || 'Login gagal. Periksa kembali email dan password Anda.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server backend. Pastikan server backend Anda berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTwoFactorError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login/2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: twoFactorUserId, code: twoFactorCode }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);
        navigate('/');
      } else {
        setTwoFactorError(result.message || 'Kode OTP salah atau sudah kadaluarsa.');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setTwoFactorError('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(result.message);
        setMode('reset');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message || 'Gagal memproses permintaan lupa password.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail, otp, newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Kata sandi Anda berhasil diperbarui! Silakan masuk kembali.');
        setMode('login');
        setEmail(forgotEmail);
        setPassword('');
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message || 'Verifikasi OTP gagal atau sudah kadaluarsa.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-10 w-auto group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-display font-bold text-slate-900">KroomCare</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-sm font-semibold text-blue-600 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/register"
              className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative"
        >
          <Link 
            to="/" 
            className="absolute -top-12 left-0 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-semibold group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          <div className="glass-card p-8 rounded-3xl shadow-2xl">
            {twoFactorRequired ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-50">
                    <Lock size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900">Verifikasi 2FA</h1>
                  <p className="text-sm text-slate-500 max-w-xs mt-2 leading-relaxed">
                    Masukkan 6-digit kode OTP dari aplikasi Google Authenticator Anda untuk masuk.
                  </p>
                </div>

                <form onSubmit={handleTwoFactorVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block text-center">Kode OTP 2FA</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-center font-mono text-2xl font-bold tracking-[0.3em] text-slate-800"
                    />
                  </div>

                  {twoFactorError && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{twoFactorError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={twoFactorCode.length !== 6 || isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Verifikasi & Masuk
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setTwoFactorRequired(false);
                      setTwoFactorUserId('');
                      setTwoFactorCode('');
                      setTwoFactorError('');
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-700 hover:underline pt-2"
                  >
                    Kembali ke Login
                  </button>
                </form>
              </div>
            ) : mode === 'forgot' ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                    <Mail size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900">Lupa Password</h1>
                  <p className="text-sm text-slate-500 max-w-xs mt-2 leading-relaxed">
                    Masukkan email terdaftar Anda. Kami akan mengirimkan kode verifikasi OTP ke email tersebut.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@kroombox.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Kirim OTP
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-750 hover:underline pt-2 block"
                  >
                    Kembali ke Login
                  </button>
                </form>
              </div>
            ) : mode === 'reset' ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-8 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900">Atur Ulang Password</h1>
                  <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
                    Kode OTP telah dikirim ke email <strong>{forgotEmail}</strong>. Masukkan kode tersebut dan password baru Anda.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block text-center">Kode OTP (6 Digit)</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-center font-mono text-xl font-bold tracking-[0.2em] text-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Konfirmasi Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi baru"
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
                  )}

                  {successMessage && (
                    <p className="text-xs text-emerald-650 font-medium text-center bg-emerald-50 py-2 rounded-lg border border-emerald-100">{successMessage}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={otp.length !== 6 || isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Atur Ulang Sandi
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-slate-500 hover:text-brand-600 hover:underline font-bold"
                    >
                      Kirim Ulang OTP
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setForgotEmail('');
                        setSuccessMessage('');
                      }}
                      className="text-slate-500 hover:text-brand-600 hover:underline font-bold"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <Link to="/" className="flex flex-col items-center gap-4 mb-10 group hover:opacity-80 transition-all">
                  <img 
                    src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                    alt="Logo KroomCare" 
                    className="h-32 w-auto object-contain group-hover:scale-105 transition-transform" 
                  />
                  <h1 className="text-4xl font-display font-bold text-blue-900">KroomCare</h1>
                  <p className="text-sm text-slate-500 mt-1">Silakan masuk ke akun Anda</p>
                </Link>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@kroombox.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccessMessage('');
                          setForgotEmail(email);
                        }}
                        className="text-xs text-brand-650 hover:underline font-bold"
                      >
                        Lupa Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 italic ml-1">*Password simulasi aktif (password apa saja boleh).</p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-brand-500/20"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Masuk Sekarang
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-sm text-slate-500">
                    Belum punya akun?{' '}
                    <Link to="/register" className="text-brand-600 font-bold hover:underline">
                      Daftar di sini
                    </Link>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-4">
                    Pilih akun (customer/staff/admin) sesuai kebutuhan pengujian.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo Foot" 
                className="h-10 w-auto" 
              />
              <span className="text-2xl font-display font-bold text-slate-900">KroomCare</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:support@kroomcare.com" className="text-slate-400 hover:text-blue-600 transition-colors"><Mail size={24} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Twitter size={24} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Instagram size={24} /></a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Github size={24} /></a>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Transforming customer support with AI efficiency.
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Hak Cipta &copy; 2026 KroomCare. Dibangun dengan integrasi React &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
