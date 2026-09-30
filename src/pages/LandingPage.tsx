import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  Star, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Coins, 
  Users, 
  Mail, 
  Send, 
  Instagram, 
  Linkedin, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Zap, 
  Award,
  SlidersHorizontal
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

const TiktokIcon = ({ size = 16, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
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

export const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useLanguageTheme();

  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterLoading, setNewsletterLoading] = React.useState(false);
  const [newsletterToast, setNewsletterToast] = React.useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    try {
      const response = await fetch('http://newsletterHost/api/newsletter/subscribe'.replace('newsletterHost', window.location.hostname + ':5000'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setNewsletterToast({
          show: true,
          message: 'Berhasil berlangganan newsletter KroomCare.',
          type: 'success'
        });
        setNewsletterEmail('');
      } else {
        setNewsletterToast({
          show: true,
          message: result.message || 'Gagal berlangganan. Coba lagi.',
          type: 'error'
        });
      }
    } catch {
      setNewsletterToast({
        show: true,
        message: 'Koneksi ke server backend gagal.',
        type: 'error'
      });
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => {
        setNewsletterToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 overflow-x-hidden">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md z-50 border-b border-slate-200/60 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => navigate('/')}
          >
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              KroomCare
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a 
              href="/rewards"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login?redirect=/rewards');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Rewards
            </a>
            <a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About Us</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Pricing</a>
          </div>

          {/* Right Actions & Theme Switch */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2.5 py-1.5"
            >
              Log In
            </button>

            {/* Premium Theme Switcher */}
            <button 
              onClick={toggleTheme}
              className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 rounded-full transition-all text-slate-600 dark:text-slate-300"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              <span className={`p-1 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow-xs text-amber-500' : 'text-slate-400'}`}>
                <Sun size={13} />
              </span>
              <span className={`p-1 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-xs text-blue-400' : 'text-slate-400'}`}>
                <Moon size={13} />
              </span>
            </button>
            
            {/* Primary CTA */}
            <button 
              onClick={() => navigate('/register')}
              className="px-4.5 py-2 bg-[#0b132b] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 overflow-hidden">
        {/* Soft Circular Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] sm:w-[50rem] h-[34rem] sm:h-[50rem] bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-purple-400/10 dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-5 px-3.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-300 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
            <span>AI &amp; Gamification CRM Power</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white mb-4"
          >
            Elevate Your{' '}
            <span className="text-blue-600 dark:text-blue-500">
              Customer Support
            </span>
          </motion.h1>

          {/* Supporting Text - Concise */}
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs sm:text-base text-slate-500 dark:text-slate-400 mb-7 max-w-xl leading-relaxed"
          >
            Unlock your team's potential with a fully integrated, gamified CRM and AI-powered smart routing.
          </motion.p>

          {/* Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-14"
          >
            <button 
              onClick={() => navigate('/login')}
              className="group px-6 py-3 bg-[#0b132b] hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Get Started &amp; Explore</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* 3. HERO PRODUCT VISUALIZATION (Multi-Module Ecosystem) */}
          <div className="relative w-full max-w-5xl mx-auto pt-4">
            
            {/* Subtle Floating Accents */}
            <div className="absolute -top-3 left-[18%] hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-300 z-30 animate-pulse">
              <MessageSquare size={13} className="text-blue-500" />
              <span>Mini Community</span>
            </div>

            <div className="absolute -bottom-2 right-[20%] hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-md text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-30">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Floating Ticket Status</span>
            </div>

            {/* Composite Grid of Layered UI Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start text-left">
              
              {/* Module 1: Tickets Manager (Back-Left, 4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 dark:border-white/10 shadow-lg relative z-20 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Tickets Manager</h4>
                  </div>
                  <Search size={14} className="text-slate-400" />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md">All</span>
                  <span className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Customer</span>
                  <span className="px-2 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Filters</span>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'Ticket #12', name: 'Alif N.', status: 'Resolved', variant: 'green' },
                    { id: 'Ticket #20', name: 'Nadia S.', status: 'In Progress', variant: 'amber' },
                    { id: 'Ticket #30', name: 'Rian K.', status: 'In Progress', variant: 'amber' },
                    { id: 'Ticket #25', name: 'Dewi A.', status: 'Resolved', variant: 'green' },
                  ].map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-700 dark:text-slate-300">
                          {t.name[0]}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{t.id}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.variant === 'green' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60' 
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Modules: Service Status & AI Queue (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Module 2: Service Status & SLA */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Service Status &amp; SLA</span>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      All Systems Normal
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white">99.8%</div>
                      <div className="text-[10px] text-slate-400">SLA Target Met</div>
                    </div>
                    {/* Micro Bars Graphic */}
                    <div className="flex items-end gap-1 h-8">
                      {[40, 65, 80, 50, 95, 85, 100].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-gradient-to-t from-blue-500 to-teal-400 rounded-full" 
                          style={{ height: `${h}%` }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Module 3: AI-Powered Routing */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 dark:border-white/10 shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI-Powered Routing</h4>
                  </div>
                  
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Intelligent Ticket Queue</span>
                      <ArrowRight size={12} className="text-slate-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-red-50 dark:bg-red-950/40 text-red-600 rounded">High</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded">Urgent</span>
                      <span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400 ml-auto">Auto-Assigned by AI</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Module 4: Team Leaderboard (Front-Right, 4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-4.5 border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Gamification CRM</h4>
                    <span className="text-[10px] text-slate-400">Top customer support agents</span>
                  </div>
                  <Award size={15} className="text-amber-500" />
                </div>

                {/* Agents Podium Cards */}
                <div className="grid grid-cols-3 gap-1.5 text-center items-end pt-1">
                  
                  {/* #2 */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                    <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                      N
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1">#2</div>
                    <div className="text-[9px] text-slate-400">1,980 pts</div>
                  </div>

                  {/* #1 Winner */}
                  <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 relative -mt-2 shadow-xs">
                    <Star size={11} className="fill-amber-400 text-amber-500 absolute top-1 right-1" />
                    <div className="w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      T
                    </div>
                    <div className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 mt-1">#1</div>
                    <div className="text-[10px] font-bold text-slate-900 dark:text-white">2,450 pts</div>
                  </div>

                  {/* #3 */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                    <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                      R
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1">#3</div>
                    <div className="text-[9px] text-slate-400">1,980 pts</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500">Customer Support</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">1,450 pts</span>
                </div>
              </div>

            </div>

          </div>

          {/* 4. LOWER-PAGE FEATURE TEASER */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500">
            <span className="text-slate-700 dark:text-slate-300">Tickets Manager</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300">Gamification CRM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-slate-700 dark:text-slate-300">AI-Powered Routing</span>
          </div>

        </div>
      </section>

      {/* 5. FEATURES SECTION - CONCISE */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-14">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Powerful KroomCare Ecosystem
            </h2>
            <div className="h-1 w-10 bg-blue-600 mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 shadow-xs space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Coins size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Loyalty Gamification</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Kumpulkan poin dari setiap interaksi dan tukarkan dengan voucher eksklusif secara instan.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 shadow-xs space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Agent Matching</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Penugasan tiket otomatis kepada staf yang sedang online sesuai kualifikasi dan beban kerja.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/5 shadow-xs space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Enterprise Security &amp; 2FA</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Proteksi data pelanggan dengan standar Time-based One-Time Passwords (TOTP) Google Authenticator.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER & FOOTER */}
      <footer id="about" className="bg-[#fafbfc] dark:bg-[#0b0f19] text-slate-900 dark:text-white border-t border-slate-200/60 dark:border-white/5">
        
        {/* Newsletter Banner - Compact */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md text-white">
            <div>
              <h3 className="text-base sm:text-lg font-bold">Dapatkan Pembaruan KroomCare</h3>
              <p className="text-xs text-blue-100 mt-1">Tips CRM, informasi fitur baru, dan penawaran menarik langsung di email Anda.</p>
            </div>

            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Masukkan email Anda..."
                className="w-full md:w-64 px-3.5 py-2.5 bg-white text-slate-800 text-xs rounded-xl focus:outline-none placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={newsletterLoading}
                className="px-4.5 py-2.5 bg-[#0b132b] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
              >
                <Send size={13} />
                <span>{newsletterLoading ? '...' : 'Subscribe'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Info & Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
            
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img 
                  src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                  alt="Logo KroomCare" 
                  className="h-8 w-auto object-contain" 
                />
                <span className="text-base font-bold text-slate-900 dark:text-white">KroomCare</span>
              </div>
              <p className="leading-relaxed">Platform CRM modern berbasis AI dan gamifikasi untuk operasional customer support.</p>
              <div className="flex items-center gap-2 pt-1">
                {[
                  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/kroombox' },
                  { icon: TiktokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@kroombox' },
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/kroombox/' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Produk */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-200">Produk</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-blue-600">Fitur Utama</a></li>
                <li><a href="/login?redirect=/rewards" className="hover:text-blue-600">Rewards &amp; Poin</a></li>
                <li><a href="/login" className="hover:text-blue-600">Sistem Tiket</a></li>
                <li><a href="/login" className="hover:text-blue-600">Forum Komunitas</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-200">Kontak</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5">
                  <Mail size={13} className="text-blue-500" />
                  <a href="mailto:krooomcare@gmail.com" className="hover:text-blue-600">krooomcare@gmail.com</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone size={13} className="text-blue-500" />
                  <a href="https://wa.me/6287886746543" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">+62 878-8674-6543</a>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin size={13} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>Telkom University, Bandung</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-slate-200">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-600">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-blue-600">Syarat Layanan</a></li>
                <li><a href="#" className="hover:text-blue-600">Status Keamanan</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} KroomCare. All rights reserved.</p>
            <p>Designed with high precision &amp; modern SaaS standards.</p>
          </div>
        </div>

      </footer>

      {/* Floating Toast */}
      {newsletterToast.show && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 z-50 text-xs">
          <div className={`w-2 h-2 rounded-full ${newsletterToast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span>{newsletterToast.message}</span>
        </div>
      )}

    </div>
  );
};
