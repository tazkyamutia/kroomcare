import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  Star, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Coins, 
  Users, 
  Mail, 
  Send, 
  Instagram, 
  Linkedin, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Award,
  Menu,
  X,
  Zap,
  Bot,
  Database,
  Check,
  MoreVertical,
  Activity
} from 'lucide-react';
import { useLanguageTheme } from '../context/LanguageThemeContext';

// TikTok SVG Icon
const TiktokIcon: React.FC<{ size?: number } & React.SVGProps<SVGSVGElement>> = ({ size = 16, ...props }) => (
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

// Integration Orbit Icons
interface OrbitItem {
  name: string;
  icon: React.ReactNode;
  orbitClass: string;
  delay: number;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme, language, toggleLanguage, t } = useLanguageTheme();
  const shouldReduceMotion = useReducedMotion();

  // Scroll detection for floating pill navbar
  const [isScrolled, setIsScrolled] = useState(false);
  // Active navigation tab (matching reference where Ikhtisar is active)
  const [activeNav, setActiveNav] = useState('ikhtisar');
  // Mobile drawer open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterToast, setNewsletterToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Track window scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

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
          message: t('landing.newsletter_success'),
          type: 'success'
        });
        setNewsletterEmail('');
      } else {
        setNewsletterToast({
          show: true,
          message: result.message || t('landing.newsletter_fail'),
          type: 'error'
        });
      }
    } catch {
      setNewsletterToast({
        show: true,
        message: t('landing.newsletter_conn_err'),
        type: 'error'
      });
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => {
        setNewsletterToast(prev => ({ ...prev, show: false }));
      }, 4000);
    }
  };

  const closeMobileMenuAndNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // Integration icons placed on concentric orbits around the hero
  const ORBIT_ITEMS: OrbitItem[] = [
    {
      name: t('landing.orbit_gemini'),
      icon: <Bot size={16} className="text-blue-500" />,
      orbitClass: 'top-[16%] left-[10%] sm:left-[16%]',
      delay: 0.1
    },
    {
      name: t('landing.orbit_wa'),
      icon: <Phone size={15} className="text-emerald-500" />,
      orbitClass: 'top-[12%] right-[12%] sm:right-[18%]',
      delay: 0.2
    },
    {
      name: t('landing.orbit_db'),
      icon: <Database size={15} className="text-sky-600" />,
      orbitClass: 'top-[42%] left-[4%] sm:left-[8%]',
      delay: 0.3
    },
    {
      name: t('landing.orbit_sla'),
      icon: <Activity size={15} className="text-teal-500" />,
      orbitClass: 'top-[45%] right-[5%] sm:right-[9%]',
      delay: 0.4
    },
    {
      name: t('landing.orbit_points'),
      icon: <Coins size={15} className="text-amber-500" />,
      orbitClass: 'bottom-[22%] left-[8%] sm:left-[14%]',
      delay: 0.5
    },
    {
      name: t('landing.orbit_escalation'),
      icon: <Zap size={15} className="text-purple-500" />,
      orbitClass: 'bottom-[20%] right-[10%] sm:right-[15%]',
      delay: 0.6
    }
  ];

  const TRUST_ITEMS = [
    {
      name: 'Google Gemini AI',
      badge: 'AI CRM Engine',
      desc: t('landing.infra_gemini_desc'),
      status: 'Active 2.5 Flash',
      icon: <Bot size={18} className="text-white" />,
      iconBg: 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500',
      iconShadow: 'shadow-blue-500/30',
      dotColor: 'bg-blue-500',
      glowGradient: 'from-blue-600/30 via-indigo-600/20 to-cyan-500/10',
      borderHover: 'hover:border-blue-500/60 dark:hover:border-blue-400/60',
      accentBar: 'from-blue-600 via-indigo-600 to-cyan-500',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40'
    },
    {
      name: 'WhatsApp Cloud',
      badge: 'Official Meta API',
      desc: t('landing.infra_wa_desc'),
      status: 'Live 2-Way Sync',
      icon: <Phone size={17} className="text-white" />,
      iconBg: 'bg-gradient-to-tr from-emerald-500 via-teal-600 to-green-600',
      iconShadow: 'shadow-emerald-500/30',
      dotColor: 'bg-emerald-500',
      glowGradient: 'from-emerald-500/30 via-teal-600/20 to-green-600/10',
      borderHover: 'hover:border-emerald-500/60 dark:hover:border-emerald-400/60',
      accentBar: 'from-emerald-500 via-teal-600 to-green-600',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
    },
    {
      name: 'Resend Mailing',
      badge: 'Smart Delivery',
      desc: t('landing.infra_resend_desc'),
      status: 'SLA 99.9% Inbox',
      icon: <Mail size={17} className="text-white" />,
      iconBg: 'bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600',
      iconShadow: 'shadow-purple-500/30',
      dotColor: 'bg-purple-500',
      glowGradient: 'from-purple-600/30 via-violet-600/20 to-indigo-600/10',
      borderHover: 'hover:border-purple-500/60 dark:hover:border-purple-400/60',
      accentBar: 'from-purple-600 via-violet-600 to-indigo-600',
      badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-900/40'
    },
    {
      name: 'MySQL Enterprise',
      badge: 'v8.0 ACID Secured',
      desc: t('landing.infra_mysql_desc'),
      status: 'Zero-Loss Storage',
      icon: <Database size={17} className="text-white" />,
      iconBg: 'bg-gradient-to-tr from-sky-600 via-blue-700 to-indigo-700',
      iconShadow: 'shadow-sky-500/30',
      dotColor: 'bg-sky-500',
      glowGradient: 'from-sky-600/30 via-blue-700/20 to-indigo-700/10',
      borderHover: 'hover:border-sky-500/60 dark:hover:border-sky-400/60',
      accentBar: 'from-sky-600 via-blue-700 to-indigo-700',
      badgeColor: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-900/40'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300 overflow-x-clip">
      
      {/* 1. TOP NAVIGATION BAR (KROOMCARE FLOATING CAPSULE ISLAND) */}
      <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <div className="max-w-5xl mx-auto bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-full shadow-lg shadow-slate-900/5 px-3.5 sm:px-5 py-2 flex items-center justify-between pointer-events-auto transition-all">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="KroomCare Beranda"
          >
            <img 
              src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
              alt="Logo KroomCare" 
              className="h-6 sm:h-7 w-auto object-contain group-hover:scale-105 transition-transform duration-200" 
            />
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
              KroomCare
            </span>
          </div>

          {/* Center Navigation Links (Tailored specifically for KroomCare) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 p-1 rounded-full backdrop-blur-xs">
            <a 
              href="#features"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/80 rounded-full transition-all duration-150"
            >
              {t('landing.nav_features')}
            </a>
            <a 
              href="/rewards"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login?redirect=/rewards');
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/80 rounded-full transition-all duration-150"
            >
              <span>{t('landing.nav_rewards')}</span>
              <span className="px-1.5 py-0.2 text-[8px] font-black uppercase rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                NEW
              </span>
            </a>
            <a 
              href="#about"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/80 rounded-full transition-all duration-150"
            >
              {t('landing.nav_about')}
            </a>
          </nav>

          {/* Right Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Toggle Pill (Matching requested pill model) */}
            <button
              onClick={toggleLanguage}
              className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-full border border-blue-500 hover:border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-900/90 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer select-none"
              title={t('landing.switch_lang_title')}
            >
              {language === 'id' ? (
                <span className="inline-flex w-4 h-2.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 flex-col">
                  <span className="h-1/2 bg-[#e00000] w-full" />
                  <span className="h-1/2 bg-white w-full" />
                </span>
              ) : (
                <span className="inline-flex w-4 h-2.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 relative bg-[#012169]">
                  <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
                    <clipPath id="uk-flag-landing">
                      <path d="M0,0 v30 h60 v-30 z"/>
                    </clipPath>
                    <clipPath id="uk-diag-landing">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                    </clipPath>
                    <g clipPath="url(#uk-flag-landing)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-landing)" stroke="#C8102E" strokeWidth="4"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                    </g>
                  </svg>
                </span>
              )}
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
                {language === 'id' ? 'ID' : 'EN'}
              </span>
            </button>

            {/* Theme Toggle Pill */}
            <button 
              onClick={toggleTheme}
              className="flex items-center p-0.5 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 rounded-full transition-all text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-2xs"
              aria-label="Toggle theme mode"
              title="Toggle theme mode"
            >
              <span className={`p-1 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow-2xs text-amber-500' : 'text-slate-400'}`}>
                <Sun size={12} />
              </span>
              <span className={`p-1 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-2xs text-blue-400' : 'text-slate-400'}`}>
                <Moon size={12} />
              </span>
            </button>

            {/* Log In Link */}
            <button 
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {t('landing.login_btn')}
            </button>

            {/* Primary Action Button (Solid Pill) */}
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center min-h-[34px] px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <span>{t('landing.register_btn')}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden max-w-sm mx-auto mt-2 p-4 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xl space-y-2 pointer-events-auto"
            >
              <div className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('landing.nav_features')}
                </a>
                <a 
                  href="/rewards"
                  onClick={(e) => {
                    e.preventDefault();
                    closeMobileMenuAndNavigate('/login?redirect=/rewards');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{t('landing.nav_rewards')}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-blue-500 text-white">NEW</span>
                </a>
                <a 
                  href="#about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('landing.nav_about')}
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full py-2 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
                  <span>{t('landing.switch_lang_title')}</span>
                </button>
                <button
                  onClick={() => closeMobileMenuAndNavigate('/login')}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('landing.login_btn')}
                </button>
                <button
                  onClick={() => closeMobileMenuAndNavigate('/login')}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-xs"
                >
                  {t('landing.register_btn')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT */}
      <main>
        {/* 2. HERO SECTION WITH CONCENTRIC ORBIT RINGS (DRIBBLE MODEL) */}
        <section className="relative pt-28 sm:pt-34 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
          
          {/* Concentric Orbit Rings Background (Radiating from behind the headline) */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[850px] sm:w-[1100px] h-[850px] sm:h-[1100px] pointer-events-none -z-10 flex items-center justify-center">
            {/* Outer Orbit 3 */}
            <div className="absolute w-[800px] sm:w-[1050px] h-[800px] sm:h-[1050px] rounded-full border border-slate-200/60 dark:border-slate-800/60" />
            {/* Middle Orbit 2 */}
            <div className="absolute w-[580px] sm:w-[760px] h-[580px] sm:h-[760px] rounded-full border border-slate-200/70 dark:border-slate-800/80" />
            {/* Inner Orbit 1 */}
            <div className="absolute w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full border border-slate-200/80 dark:border-slate-800" />
            {/* Faint Center Radial Mask Glow */}
            <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl" />
          </div>

          {/* Floating Integration Bubbles on Orbits */}
          <div className="max-w-5xl mx-auto relative pointer-events-none">
            {ORBIT_ITEMS.map((item, idx) => (
              <motion.div
                key={item.name}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: item.delay, ease: 'easeOut' }}
                className={`absolute ${item.orbitClass} z-20 pointer-events-auto`}
              >
                <div 
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 shadow-md flex items-center justify-center hover:scale-110 hover:shadow-lg transition-transform duration-200 cursor-pointer"
                  title={item.name}
                >
                  {item.icon}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            
            {/* Top Rating / Social Proof Badge (Refined typography) */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mb-3 sm:mb-4 px-3 py-1 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-white/10 rounded-full text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs"
            >
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  G
                </span>
                <span>{t('landing.hero_badge_google')}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Star size={11} className="fill-emerald-500 text-emerald-500" />
                <span>{t('landing.hero_badge_csat')}</span>
              </div>
            </motion.div>

            {/* Main Headline (Clean, refined, horizontal single-line on desktop) */}
            <motion.h1 
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight leading-snug text-slate-900 dark:text-white mb-4 sm:mb-5 max-w-4xl w-full sm:whitespace-nowrap"
            >
              {t('landing.hero_title_prefix')}
              <span className="text-blue-600 dark:text-blue-500">
                {t('landing.hero_title_highlight')}
              </span>
            </motion.h1>

            {/* Single Primary Pill CTA Button */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
              className="flex justify-center mb-4 sm:mb-6"
            >
              {/* Primary Black Pill CTA */}
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto min-h-[38px] px-6 py-2 bg-slate-950 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full font-medium text-xs shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span>{t('landing.hero_cta_btn')}</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>

          </div>
        </section>

        {/* 3. SHOWCASE: COMPACT VERTICALLY STACKED FEATURE CARDS (EFFICIENT & RESPONSIVE) */}
        <section id="features" className="relative scroll-mt-20 pt-1 sm:pt-2 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="relative w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
            
            {/* Ambient Backlight Glow Blur */}
            <div 
              aria-hidden="true"
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-80 bg-blue-500/10 dark:bg-blue-600/15 blur-3xl rounded-full pointer-events-none -z-10" 
            />

            {/* CARD 01: CRM SMART TICKET ROUTING */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="sticky top-20 sm:top-24 z-10 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg overflow-hidden text-left p-4 sm:p-5 lg:p-6 transition-all hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
                {/* Left Column: Feature Description & Bullets */}
                <div className="lg:col-span-6 space-y-2.5">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    {t('landing.f1_badge')}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    {t('landing.f1_title')}
                  </h3>
                  <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('landing.f1_desc')}
                  </p>
                  <ul className="space-y-1.5 pt-0.5 text-[11px] sm:text-[11.5px] text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      <span>{t('landing.f1_bullet1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      <span>{t('landing.f1_bullet2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      <span>{t('landing.f1_bullet3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Dot-Grid Canvas with Floating UI Mockup */}
                <div className="lg:col-span-6">
                  <div className="relative rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 sm:p-4 overflow-hidden min-h-[175px] sm:min-h-[190px] flex flex-col justify-center gap-2 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]">
                    
                    {/* Floating Top Badge */}
                    <div className="self-start px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 text-[9.5px] font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('landing.f1_mockup_badge')}</span>
                    </div>

                    {/* Floating Mini Dark Terminal Card (CRM Style) */}
                    <div className="bg-slate-900 text-slate-200 rounded-xl p-2.5 sm:p-3 border border-slate-800 shadow-md font-mono text-[10px] sm:text-[10.5px] space-y-1 w-[94%] self-center">
                      <div className="flex items-center gap-1 pb-1 border-b border-slate-800 text-[9.5px] text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="ml-1 text-slate-400">crm-ai analyze</span>
                      </div>
                      <p className="text-emerald-400">$ {t('landing.f1_mockup_cmd')}</p>
                      <p className="text-slate-300">✓ {t('landing.f1_mockup_cat_label')} <span className="text-blue-400">{t('landing.f1_mockup_cat_val')}</span></p>
                      <p className="text-slate-300">✓ {t('landing.f1_mockup_assigned_label')} <span className="text-emerald-400">{t('landing.f1_mockup_assigned_val')}</span></p>
                    </div>

                    {/* Floating Bottom Ticket Status Card */}
                    <div className="self-end bg-white dark:bg-slate-800/90 rounded-xl px-3 py-1.5 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-2 text-xs w-[88%]">
                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[9px]">
                        T
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 dark:text-white truncate text-[10px]">{t('landing.f1_mockup_ticket_assigned')}</p>
                        <p className="text-[9px] text-slate-400">{t('landing.f1_mockup_sla')}</p>
                      </div>
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {t('landing.f1_mockup_status')}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 02: CRM GAMIFIKASI & CSAT RETENTION */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="sticky top-24 sm:top-28 z-20 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg overflow-hidden text-left p-4 sm:p-5 lg:p-6 transition-all hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
                {/* Left Column: Feature Description & Bullets */}
                <div className="lg:col-span-6 space-y-2.5">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    {t('landing.f2_badge')}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    {t('landing.f2_title')}
                  </h3>
                  <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('landing.f2_desc')}
                  </p>
                  <ul className="space-y-1.5 pt-0.5 text-[11px] sm:text-[11.5px] text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{t('landing.f2_bullet1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{t('landing.f2_bullet2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{t('landing.f2_bullet3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Dot-Grid Canvas with Floating UI Mockup */}
                <div className="lg:col-span-6">
                  <div className="relative rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 sm:p-4 overflow-hidden min-h-[175px] sm:min-h-[190px] flex flex-col justify-center gap-2 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]">
                    
                    {/* Floating Top Badge */}
                    <div className="self-start px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 text-[9.5px] font-bold flex items-center gap-1.5 shadow-xs">
                      <Star size={10} className="fill-amber-400 text-amber-500" />
                      <span>{t('landing.f2_mockup_badge')}</span>
                    </div>

                    {/* Floating Leaderboard Rank 1 Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 sm:p-3 border border-slate-200/90 dark:border-white/10 shadow-xs flex items-center justify-between gap-3 w-[94%] self-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                          T
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11.5px] font-bold text-slate-900 dark:text-white">Tariq A.</span>
                            <span className="text-[8.5px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-md">{t('landing.f2_mockup_rank')}</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400">{t('landing.f2_mockup_stats')}</p>
                        </div>
                      </div>
                      <span className="text-[10.5px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded-md shrink-0">
                        2,450 pts
                      </span>
                    </div>

                    {/* Floating Bottom Milestone Progress Card */}
                    <div className="self-end bg-white dark:bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-1 w-[88%]">
                      <div className="flex items-center justify-between text-[9.5px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t('landing.f2_mockup_target')}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">98%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[98%]" />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 03: CRM OMNICHANNEL & CUSTOMER ENGAGEMENT */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="sticky top-28 sm:top-32 z-30 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg overflow-hidden text-left p-4 sm:p-5 lg:p-6 transition-all hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
                {/* Left Column: Feature Description & Bullets */}
                <div className="lg:col-span-6 space-y-2.5">
                  <span className="text-[10px] sm:text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    {t('landing.f3_badge')}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    {t('landing.f3_title')}
                  </h3>
                  <p className="text-[11.5px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('landing.f3_desc')}
                  </p>
                  <ul className="space-y-1.5 pt-0.5 text-[11px] sm:text-[11.5px] text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{t('landing.f3_bullet1')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{t('landing.f3_bullet2')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{t('landing.f3_bullet3')}</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Dot-Grid Canvas with Floating UI Mockup */}
                <div className="lg:col-span-6">
                  <div className="relative rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 sm:p-4 overflow-hidden min-h-[175px] sm:min-h-[190px] flex flex-col justify-center gap-2 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]">
                    
                    {/* Floating Top Badge */}
                    <div className="self-start px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 text-[9.5px] font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('landing.f3_mockup_badge')}</span>
                    </div>

                    {/* Floating WhatsApp Message Preview Card */}
                    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl p-2.5 sm:p-3 shadow-xs w-[94%] self-center space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>{t('landing.f3_mockup_wa_title')}</span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-800 dark:text-slate-200 leading-snug">
                        {t('landing.f3_mockup_wa_body')}
                      </p>
                      <p className="text-[8.5px] text-slate-400 text-right">{t('landing.f3_mockup_wa_time')}</p>
                    </div>

                    {/* Floating Bottom Delivery Rate Card */}
                    <div className="self-end bg-white dark:bg-slate-800/90 rounded-xl px-3 py-1.5 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between text-xs w-[88%]">
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{t('landing.f3_mockup_status_title')}</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.2 bg-emerald-50 dark:bg-emerald-950/50 rounded-full">
                        {t('landing.f3_mockup_status_rate')}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* 4. CLIENT LOGO TRUST BAR (EYE CATCHING INFRASTRUCTURE CARDS) */}
        <section className="relative py-12 sm:py-16 border-y border-slate-200/70 dark:border-white/5 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/70 dark:from-[#090e1c] dark:via-[#0b0f19] dark:to-[#090e1c] overflow-hidden">
          {/* Ambient decorative soft glow lights */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-blue-500/5 dark:bg-blue-600/10 blur-3xl rounded-full pointer-events-none -z-10" />
          <div aria-hidden="true" className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-purple-500/5 dark:bg-purple-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            
            {/* Header Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20 border border-blue-500/20 dark:border-blue-400/30 shadow-xs mb-3">
              <Sparkles size={13} className="text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-[10.5px] sm:text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                {t('landing.infra_badge')}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              {t('landing.infra_title')}
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              {t('landing.infra_desc')}
            </p>

            {/* 4 Focused, Eye-Catching Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {TRUST_ITEMS.map((item) => (
                <div 
                  key={item.name}
                  className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-default text-left overflow-hidden ${item.borderHover}`}
                >
                  {/* Dynamic Ambient Glow Behind Card on Hover */}
                  <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${item.glowGradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10 pointer-events-none`} />

                  {/* Top Row: Icon with 3D gradient + Status Pill */}
                  <div className="flex items-center justify-between w-full mb-3.5">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${item.iconBg} shadow-md ${item.iconShadow} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-white/5 text-[9.5px] sm:text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} animate-pulse`} />
                      <span>{item.status}</span>
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Bottom Animated Accent Bar */}
                  <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className={`h-1 w-8 group-hover:w-full rounded-full bg-gradient-to-r ${item.accentBar} transition-all duration-300`} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      {/* 6. NEWSLETTER & FOOTER */}
      <footer id="about" className="scroll-mt-24 bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-white border-t border-slate-200/60 dark:border-white/5">
        
        {/* Newsletter Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-5 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-md text-white">
            <div>
              <h3 className="text-sm sm:text-base font-bold">{t('landing.newsletter_title')}</h3>
              <p className="text-xs text-blue-100 mt-0.5">{t('landing.newsletter_desc')}</p>
            </div>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('landing.newsletter_placeholder')}
                className="w-full sm:w-60 px-3.5 py-2 bg-white text-slate-800 text-xs rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={newsletterLoading}
                className="min-h-[36px] px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <Send size={12} />
                <span>{newsletterLoading ? '...' : t('landing.newsletter_btn')}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Info & Links */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 pb-8 border-b border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
            
            {/* Brand column */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <img 
                  src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                  alt="Logo KroomCare" 
                  loading="lazy"
                  className="h-6 sm:h-7 w-auto object-contain" 
                />
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">KroomCare</span>
              </div>
              <p className="leading-relaxed">{t('landing.footer_brand_desc')}</p>
              <div className="flex items-center gap-2 pt-1">
                {[
                  { icon: Instagram, label: 'Instagram Kroombox', href: 'https://www.instagram.com/kroombox' },
                  { icon: TiktokIcon, label: 'TikTok Kroombox', href: 'https://www.tiktok.com/@kroombox' },
                  { icon: Linkedin, label: 'LinkedIn Kroombox', href: 'https://www.linkedin.com/company/kroombox/' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <Icon size={12} />
                  </a>
                ))}
              </div>
            </div>

            {/* Produk */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200">{t('landing.footer_products')}</h4>
              <ul className="space-y-1.5">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">{t('landing.footer_f_features')}</a></li>
                <li><a href="/login?redirect=/rewards" className="hover:text-blue-600 transition-colors">{t('landing.footer_f_rewards')}</a></li>
                <li><a href="/login" className="hover:text-blue-600 transition-colors">{t('landing.footer_f_tickets')}</a></li>
                <li><a href="/login" className="hover:text-blue-600 transition-colors">{t('landing.footer_f_forum')}</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200">{t('landing.footer_contact')}</h4>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <Mail size={12} className="text-blue-500 shrink-0" />
                  <a href="mailto:krooomcare@gmail.com" className="hover:text-blue-600 transition-colors">krooomcare@gmail.com</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Phone size={12} className="text-blue-500 shrink-0" />
                  <a href="https://wa.me/6287886746543" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">+62 878-8674-6543</a>
                </li>
                <li className="flex items-start gap-1.5">
                  <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                  <span>Telkom University, Bandung</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-200">{t('landing.footer_legal')}</h4>
              <ul className="space-y-1.5">
                <li><a href="#" className="hover:text-blue-600 transition-colors">{t('landing.footer_privacy')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{t('landing.footer_terms')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">{t('landing.footer_security')}</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} KroomCare. {t('landing.footer_rights')}</p>
            <p>{t('landing.footer_tagline')}</p>
          </div>
        </div>

      </footer>

      {/* Floating Toast Notification */}
      {newsletterToast.show && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-full shadow-xl border border-slate-800 flex items-center gap-2.5 z-50 text-xs"
        >
          <div className={`w-2 h-2 rounded-full ${newsletterToast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span>{newsletterToast.message}</span>
        </div>
      )}

    </div>
  );
};
