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
  Zap,
  Globe
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguageTheme();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-10 w-auto group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-display font-extrabold text-slate-900 tracking-tight">KroomCare</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher Pill */}
            <button 
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              title="Ganti Bahasa / Switch Language"
            >
              <Globe size={13} className="text-slate-400" />
              <span>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-bold text-slate-650 hover:text-blue-600 transition-colors px-2 py-1"
            >
              {t('landing.login_btn')}
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-3 sm:px-5 py-2 bg-blue-650 hover:bg-blue-800 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              {t('landing.register_btn')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 px-4 overflow-hidden">
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] sm:w-[50rem] h-[30rem] sm:h-[50rem] bg-gradient-to-tr from-blue-300/20 to-sky-300/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-750 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-2 shadow-sm"
          >
            <Zap size={12} className="fill-blue-500 text-blue-500 animate-pulse" />
            <span>{t('landing.hero_badge')}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="KroomCare Logo" 
              className="h-32 sm:h-48 md:h-56 w-auto object-contain drop-shadow-[0_15px_15px_rgba(37,99,235,0.15)] hover:scale-105 transition-transform duration-500" 
            />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight leading-none mb-6"
          >
            {t('landing.hero_title')}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed px-2"
          >
            {t('landing.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-slate-900/10 hover:bg-blue-650 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 overflow-hidden"
            >
              <span>{t('landing.hero_cta')}</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 px-4 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-4 tracking-tight">
              {t('landing.features_title')}
            </h2>
            <div className="h-1.5 w-16 bg-blue-655 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Feature 1: Gamifikasi */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/50 flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Coins size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t('landing.feature_1_title')}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {t('landing.feature_1_desc')}
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-650 font-bold text-sm hover:underline group"
              >
                <span>{t('landing.feature_1_cta')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 2: Shift Efficiency */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/50 flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-6">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
                  <Users size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t('landing.feature_2_title')}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {t('landing.feature_2_desc')}
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-650 font-bold text-sm hover:underline group"
              >
                <span>{t('landing.feature_2_cta')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 3: Admin Security */}
            <motion.div 
              whileHover={{ y: -8 }}
              className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl shadow-slate-100/50 flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-6">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{t('landing.feature_3_title')}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {t('landing.feature_3_desc')}
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-8 flex items-center gap-2 text-blue-650 font-bold text-sm hover:underline group"
              >
                <span>{t('landing.feature_3_cta')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer & Footnote */}
      <footer className="bg-slate-50 border-t border-slate-200 py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo Foot" 
                className="h-10 w-auto" 
              />
              <span className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">KroomCare</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:support@kroomcare.com" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Mail size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Twitter size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Instagram size={22} />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors">
                <Github size={22} />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center md:text-left">
              {t('landing.footer_text')}
            </p>
            <p className="text-xs text-slate-400 font-medium text-center md:text-right">
              Hak Cipta &copy; 2026 KroomCare. Dibangun dengan integrasi React &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
