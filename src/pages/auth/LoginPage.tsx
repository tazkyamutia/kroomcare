import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, User, Lock, ArrowRight, Loader2, ArrowLeft, Mail, Instagram, Linkedin, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { DUMMY_USERS } from '../../utils/dummyData';
import { useUser } from '../../context/UserContext';

const Tiktok = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const LoginPage = () => {
  const { setUser } = useUser();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
        const redirect = searchParams.get('redirect');
        if (redirect && result.data.role === 'customer') {
          navigate(redirect);
        } else {
          navigate('/');
        }
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
        const redirect = searchParams.get('redirect');
        if (redirect && result.data.role === 'customer') {
          navigate(redirect);
        } else {
          navigate('/');
        }
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
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md z-50 border-b border-slate-200/50 dark:border-slate-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-10 w-auto group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-display font-bold text-slate-900 dark:text-white">KroomCare</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 transition-colors"
            >
              Log In
            </Link>
            <Link 
              to="/register"
              className="px-5 py-2 bg-slate-900 dark:bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-800 dark:hover:bg-blue-700 transition-all shadow-md active:scale-95"
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
            className="absolute -top-12 left-0 flex items-center gap-2 text-slate-500 hover:text-blue-650 transition-colors font-semibold group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl shadow-2xl transition-all duration-300">
            {twoFactorRequired ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center text-red-650 dark:text-red-400 shadow-sm border border-red-50 dark:border-red-900/30">
                    <Lock size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">2FA Verification</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2 leading-relaxed">
                    Enter the 6-digit OTP code from your Google Authenticator app to log in.
                  </p>
                </div>

                <form onSubmit={handleTwoFactorVerify} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block text-center">2FA OTP Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-center font-mono text-2xl font-bold tracking-[0.3em] text-slate-800 dark:text-white"
                    />
                  </div>

                  {twoFactorError && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{twoFactorError}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={twoFactorCode.length !== 6 || isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Verify & Log In
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
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline pt-2"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            ) : mode === 'forgot' ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-10 text-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-50 dark:border-blue-900/30">
                    <Mail size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Forgot Password</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2 leading-relaxed">
                    Enter your registered email address. We will send an OTP verification code to that email.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@kroombox.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Send OTP
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
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline pt-2 block"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            ) : mode === 'reset' ? (
              <div>
                <div className="flex flex-col items-center gap-4 mb-8 text-center">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-50 dark:border-emerald-900/30">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Reset Password</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-2 leading-relaxed">
                    An OTP code has been sent to <strong>{forgotEmail}</strong>. Enter the code and your new password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block text-center">OTP Code (6 Digits)</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center font-mono text-xl font-bold tracking-[0.2em] text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider block">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>
                  )}

                  {successMessage && (
                    <p className="text-xs text-emerald-650 font-medium text-center bg-emerald-50 dark:bg-emerald-950/30 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">{successMessage}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={otp.length !== 6 || isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-2">
                    <button 
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-bold"
                    >
                      Resend OTP
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                        setForgotEmail('');
                        setSuccessMessage('');
                      }}
                      className="text-slate-500 dark:text-slate-400 hover:text-blue-650 dark:hover:text-blue-400 hover:underline font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <Link to="/" className="flex flex-col items-center gap-4 mb-10 group hover:opacity-85 transition-all">
                  <img 
                    src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                    alt="Logo KroomCare" 
                    className="h-32 w-auto object-contain group-hover:scale-105 transition-transform" 
                  />
                  <h1 className="text-4xl font-display font-bold text-blue-900 dark:text-white">KroomCare</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please log in to your account</p>
                </Link>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@kroombox.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">Password</label>
                      <button 
                        type="button" 
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccessMessage('');
                          setForgotEmail(email);
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        Forgot Password?
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
                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        Log In Now
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-650 dark:text-blue-400 font-bold hover:underline">
                      Sign Up here
                    </Link>
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4">
                    Select an account (customer/staff/admin) based on testing needs.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50 py-16 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo Foot" 
                className="h-10 w-auto" 
              />
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">KroomCare</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=krooomcare@gmail.com" target="_blank" rel="noopener noreferrer" className="text-slate-450 hover:text-blue-650 transition-colors"><Mail size={24} /></a>
              <a href="https://www.instagram.com/kroombox.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-slate-450 hover:text-blue-650 transition-colors"><Instagram size={24} /></a>
              <a href="https://www.tiktok.com/@kroombox.com?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-slate-450 hover:text-blue-650 transition-colors"><Tiktok size={24} /></a>
              <a href="https://linkedin.com/company/kroomcare" target="_blank" rel="noopener noreferrer" className="text-slate-450 hover:text-blue-650 transition-colors"><Linkedin size={24} /></a>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-555">
              Transforming customer support with AI efficiency.
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Copyright &copy; 2026 KroomCare. Built with React &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
