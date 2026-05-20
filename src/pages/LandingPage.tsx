import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Coins, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  Twitter, 
  Instagram, 
  Github,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-10 w-auto" 
            />
            <span className="text-xl font-display font-bold text-slate-900">KroomCare</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-blue-800 transition-all shadow-md active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="KroomCare Logo" 
              className="h-40 md:h-56 w-auto object-contain drop-shadow-2xl" 
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-blue-900 mb-6 tracking-tight"
          >
            KroomCare
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-500 mb-10 max-w-2xl leading-relaxed"
          >
            Support that Cares, Rewards that Inspire. 
            <br className="hidden md:block" /> 
            Empowering your customer support with AI and gamification.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-700 to-sky-400 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Fitur Ekosistem KroomCare</h2>
            <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Gamifikasi */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start transition-all"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                <Coins size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Gamifikasi Pelanggan</h3>
              <p className="text-slate-500 leading-relaxed overflow-hidden">
                Sistem reward otomatis dimana pengguna mendapatkan koin setiap kali mengirim tiket keluhan atau aktif di forum. Poin dicatat transparan dan dapat ditukar dengan benefit layanan.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline group"
              >
                <span>Lihat Riwayat Poin</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 2: Shift Efficiency */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start transition-all"
            >
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 mb-8">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Manajemen Shift Staf</h3>
              <p className="text-slate-500 leading-relaxed">
                Staf dapat memperbarui status ketersediaan (Online/Sibuk/Offline) secara real-time. Memastikan distribusi tiket keluhan hanya masuk ke staf yang sedang aktif agar respons lebih cepat.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline group"
              >
                <span>Atur Status Ketersediaan</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 3: Admin Security */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-start transition-all"
            >
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mb-8">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Kontrol Keamanan Admin</h3>
              <p className="text-slate-500 leading-relaxed">
                Panel kontrol akses tingkat lanjut yang dilengkapi visibilitas kata sandi (eye-toggle) dan Autentikasi Dua Faktor (2FA) wajib untuk memproteksi data sensitif sistem.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline group"
              >
                <span>Kelola Konfigurasi 2FA</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer & Footnote */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo Foot" 
                className="h-12 w-auto" 
              />
              <span className="text-2xl font-display font-bold text-slate-900">KroomCare</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:support@kroomcare.com" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Mail size={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Github size={24} />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Transforming customer relations through technology.
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
