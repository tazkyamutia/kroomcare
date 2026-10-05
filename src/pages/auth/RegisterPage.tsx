import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthIllustration } from '../../components/auth/AuthIllustration';

export const RegisterPage = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setToastMessage('Password dan konfirmasi password tidak cocok.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        setToastMessage('Registrasi berhasil. Mengarahkan ke halaman login...');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate('/login');
        }, 2000);
      } else {
        const errMsg = result.message || 'Registrasi gagal. Silakan coba lagi.';
        setError(errMsg);
        setToastMessage(errMsg);
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err: any) {
      console.error('Register error:', err);
      const errMsg = 'Gagal terhubung ke server backend. Pastikan server backend Anda berjalan.';
      setError(errMsg);
      setToastMessage(errMsg);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
        {/* Left Side: Register Form */}
        <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-y-auto">
          <div>
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

            {isSuccess ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs border border-emerald-100 dark:border-emerald-900/30">
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Account Created!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                  Your KroomCare account is ready. Redirecting to login...
                </p>
              </div>
            ) : (
              /* Standard Register Form */
              <div>
                <div className="text-center mb-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                    Sign Up
                  </h1>
                </div>

                <form onSubmit={handleRegister} className="space-y-2.5">
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="hello@delisas.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-50/80 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
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

                  {/* Confirm Password */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
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
                    <p className="text-xs text-red-600 font-medium text-center bg-red-50 dark:bg-red-950/40 py-1 rounded-lg border border-red-200 dark:border-red-900/40">
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
                        Sign up
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch to Login */}
                <div className="mt-3.5 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Sign In
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

      {/* Floating Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 ${
            toastType === 'success' ? 'bg-slate-900 border-slate-700' : 'bg-red-800 border-red-700'
          } text-white px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2.5 z-50 transition-all duration-300`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-red-300" />
          )}
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
