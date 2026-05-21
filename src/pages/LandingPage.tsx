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
  Sun,
  Moon,
  ArrowUpRight
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme, t } = useLanguageTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 overflow-x-hidden">
      <style>{`
        @keyframes morph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 30% / 50% 60% 30% 75%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        @keyframes float-slower {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .morphing-liquid {
          animation: morph 12s ease-in-out infinite, float-slower 8s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md z-50 border-b border-slate-200/50 dark:border-slate-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="KroomCare Logo" 
              className="h-9 w-auto group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">KroomCare</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#rewards" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Rewards</a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition-all"
              aria-label="Toggle Theme"
              title="Toggle Light/Dark Mode"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button 
              onClick={() => navigate('/login')}
              className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1.5"
            >
              Log In
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-36 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] sm:w-[60rem] h-[35rem] sm:h-[60rem] bg-gradient-to-tr from-blue-300/10 via-indigo-200/5 to-purple-300/10 dark:from-blue-900/10 dark:via-indigo-950/5 dark:to-purple-900/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-7 px-4 py-1.5 bg-blue-500/10 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-sm"
          >
            <Zap size={11} className="fill-blue-500 text-blue-500 dark:fill-blue-400 dark:text-blue-400 animate-pulse" />
            <span>AI & Gamification CRM Power</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white mb-6"
          >
            Elevate Your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">Customer Support</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed"
          >
            Unlock your support potential in a fully integrated, gamified CRM workspace. Powered by smart routing and real-time response optimizations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-20"
          >
            <button 
              onClick={() => navigate('/login')}
              className="group relative px-7 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full font-bold text-sm sm:text-base shadow-lg shadow-slate-950/10 dark:shadow-blue-650/20 active:scale-95 transition-all flex items-center gap-2.5 overflow-hidden"
            >
              <span>Get Started & Explore</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
            </button>
          </motion.div>

          {/* Interactive Glossy Fluid Bubble Visualization */}
          <div className="relative w-72 sm:w-96 h-72 sm:h-96 mt-6 flex items-center justify-center">
            {/* Morphing Liquid Drop */}
            <div className="absolute inset-0 morphing-liquid bg-gradient-to-tr from-blue-600/80 via-indigo-500/70 to-pink-500/80 dark:from-blue-600/90 dark:via-indigo-500/80 dark:to-pink-500/90 blur-[1px] shadow-[inset_10px_10px_20px_rgba(255,255,255,0.4),0_30px_50px_rgba(59,130,246,0.4)] dark:shadow-[inset_10px_10px_20px_rgba(255,255,255,0.2),0_40px_60px_rgba(99,102,241,0.5)] border border-white/20 dark:border-white/10" />

            {/* Glowing inner orb */}
            <div className="absolute w-2/3 h-2/3 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/0 blur-md pointer-events-none mix-blend-screen" />
            
            {/* Center Logo image inside bubble */}
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo Bubble" 
              className="relative w-28 sm:w-36 h-auto object-contain z-10 drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] animate-pulse" 
            />

            {/* Floating Glassmorphic Card 1 (Left) */}
            <div className="absolute left-[-15%] sm:left-[-25%] top-[15%] p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 rounded-2xl shadow-xl flex flex-col items-start gap-1.5 text-left max-w-[150px] sm:max-w-[190px] transition-all hover:scale-105 z-20">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Support Metrics</span>
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ArrowUpRight size={12} />
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">Unparalleled AI Accuracy</h4>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">99.8%</span>
            </div>

            {/* Floating Glassmorphic Card 2 (Right) */}
            <div className="absolute right-[-15%] sm:right-[-25%] bottom-[15%] p-4 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 rounded-2xl shadow-xl flex flex-col items-start gap-2 text-left max-w-[150px] sm:max-w-[190px] transition-all hover:scale-105 z-20">
              <div className="flex items-center gap-1.5 w-full justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tickets Solved</span>
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight size={12} />
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">96%</span>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[96%]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              Powerful KroomCare Ecosystem
            </h2>
            <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Coins size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Customer Loyalty Gamification</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Earn coin rewards dynamically for submitting support requests or assisting other members in the community forums. Swap coins for unique vouchers.
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-6 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline group"
              >
                <span>Go to Rewards</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Agent Availability Matching</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Support staff can update their shift availability status in real-time. Automatically assigns pending tickets only to active, online agents.
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-6 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline group"
              >
                <span>View Queue</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between items-start transition-all"
            >
              <div className="space-y-5">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Google Authenticator 2FA</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Add an extra layer of protection to your profile with Time-based One-Time Passwords (TOTP). Secure client details and dashboard metrics safely.
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-6 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline group"
              >
                <span>Configure Protection</span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50 py-16 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo Footer" 
                className="h-8 w-auto" 
              />
              <span className="text-xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">KroomCare</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="mailto:support@kroomcare.com" className="text-slate-450 hover:text-blue-650 transition-colors" aria-label="Mail">
                <Mail size={20} />
              </a>
              <a href="#" className="text-slate-450 hover:text-blue-650 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-450 hover:text-blue-650 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-slate-450 hover:text-blue-650 transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
              Fostering client retention and operational efficiency through interactive support.
            </p>
            <p className="text-xs text-slate-450 font-semibold text-center md:text-right">
              Copyright &copy; 2026 KroomCare. Built with React &amp; Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
