import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ArrowRight, Loader2, CheckCircle2, ArrowLeft, Instagram, Linkedin, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
        setToastMessage('Registrasi berhasil. Silakan login.');
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-12 rounded-3xl text-center shadow-2xl transition-all duration-300"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400">Your account has been created. Redirecting to login page...</p>
        </motion.div>
      </div>
    );
  }

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
              className="text-sm font-semibold text-slate-650 dark:text-blue-450 hover:text-blue-600 transition-colors"
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
            <Link to="/" className="flex flex-col items-center gap-4 mb-10 group hover:opacity-85 transition-all">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo KroomCare" 
                className="h-32 w-auto object-contain group-hover:scale-105 transition-transform" 
              />
              <h1 className="text-4xl font-display font-bold text-blue-900 dark:text-white">KroomCare</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join the KroomCare ecosystem</p>
            </Link>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <p id="alert_error" className="alert_error text-xs text-red-500 font-medium text-center bg-red-50 dark:bg-red-950/30 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{error}</p>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="johndoe@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-slate-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-500/20 mt-4"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Register Now
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-650 dark:text-blue-400 font-bold hover:underline">
                  Log in here
                </Link>
              </p>
            </div>
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
            <p className="text-sm text-slate-500">
              Transforming customer support with AI efficiency.
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Copyright &copy; 2026 KroomCare. Built with React &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {showToast && (
        <div 
          id={toastType === 'success' ? "toast_success" : "toast_error"} 
          className={`toast_${toastType} fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 z-50 animate-bounce transition-all duration-300`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
