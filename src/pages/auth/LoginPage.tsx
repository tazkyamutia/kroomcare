import React from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../../context/UserContext';
import { AuthIllustration } from '../../components/auth/AuthIllustration';

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
      const response = await fetch('/api/auth/login', {
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
      const response = await fetch('/api/auth/login/2fa', {
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
      const response = await fetch('/api/auth/forgot-password', {
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
      const response = await fetch('/api/auth/reset-password', {
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
    <div className="h-screen w-full bg-white dark:bg-slate-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden font-sans transition-colors duration-300">
      {/* Main Split Auth Container - Fits cleanly without page scroll */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-4xl min-h-[400px] max-h-[94vh] bg-white dark:bg-[#111827] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-2"
      >
        {/* Left Side: Login Form */}
        <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-y-auto h-full">
          <div className="flex flex-col justify-between h-full">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between mb-3.5">
              <Link to="/" className="flex items-center gap-2 group">
                <img
                  src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png"
                  alt="Logo KroomCare"
                  className="h-6 w-auto object-contain group-hover:scale-105 transition-transform"
                />
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  KroomCare
                </span>
              </Link>
              <Link
                to="/"
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              >
                Back to Home
              </Link>
            </div>

            {/* 2FA Verification Form Mode */}
            {twoFactorRequired ? (
              <div>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-red-100 dark:border-red-900/30">
                    <Lock size={22} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    2FA Verification
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Enter the 6-digit OTP code from your Google Authenticator app.
                  </p>
                </div>

                <form onSubmit={handleTwoFactorVerify} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-center">
                      2FA OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-mono text-xl font-bold tracking-[0.25em] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {twoFactorError && (
                    <p className="text-xs text-red-600 font-medium text-center bg-red-50 dark:bg-red-950/30 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30">
                      {twoFactorError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={twoFactorCode.length !== 6 || isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Log In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorRequired(false);
                      setTwoFactorUserId('');
                      setTwoFactorCode('');
                      setTwoFactorError('');
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium hover:underline pt-1 block"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            ) : mode === 'forgot' ? (
              /* Forgot Password Mode */
              <div>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-blue-100 dark:border-blue-900/30">
                    <Mail size={22} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Forgot Password
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Enter your registered email address to receive an OTP code.
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@kroombox.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 font-medium text-center bg-red-50 dark:bg-red-950/30 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="w-full text-center text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-medium hover:underline pt-1 block"
                  >
                    Back to Login
                  </button>
                </form>
              </div>
            ) : mode === 'reset' ? (
              /* Reset Password Mode */
              <div>
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs border border-emerald-100 dark:border-emerald-900/30">
                    <ShieldCheck size={22} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Reset Password
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    An OTP code has been sent to <strong>{forgotEmail}</strong>.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 text-center">
                      OTP Code (6 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center font-mono text-lg font-bold tracking-[0.2em] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 font-medium text-center bg-red-50 dark:bg-red-950/30 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30">
                      {error}
                    </p>
                  )}

                  {successMessage && (
                    <p className="text-xs text-emerald-600 font-medium text-center bg-emerald-50 dark:bg-emerald-950/30 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/30">
                      {successMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={otp.length !== 6 || isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Reset Password'}
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold hover:underline"
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
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-semibold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Standard Sign In Form */
              <div className="my-auto py-1">
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                    Sign In
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Welcome back! Please enter your details to continue
                  </p>
                </div>


                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-3">
                  {/* Email Field */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@delisas.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccessMessage('');
                          setForgotEmail(email);
                        }}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2.5 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 font-medium text-center bg-red-50 dark:bg-red-950/40 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40">
                      {error}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 mt-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Sign in
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch to Register */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cityscape Architectural Illustration */}
        <div className="hidden lg:block border-l border-slate-100 dark:border-slate-800/80">
          <AuthIllustration />
        </div>
      </motion.div>
    </div>
  );
};
