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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const user = DUMMY_USERS.find(u => u.email === email);
      if (user) {
        setUser(user);
        navigate('/');
      } else {
        setError('Email tidak terdaftar. Gunakan: customer@kroombox.com, staff@kroombox.com, atau admin@kroombox.com');
      }
      setIsLoading(false);
    }, 1500);
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
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
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
