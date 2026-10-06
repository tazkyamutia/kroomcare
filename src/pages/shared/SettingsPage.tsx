import React from 'react';
import { useLanguageTheme, Language } from '../../context/LanguageThemeContext';
import { Sun, Moon, Laptop, CheckCircle2, Palette, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const { themeMode, setTheme, language, setLanguage, t } = useLanguageTheme();
  const [savedNotify, setSavedNotify] = React.useState(false);
  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    triggerNotify();
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    triggerNotify();
  };

  const triggerNotify = () => {
    setSavedNotify(true);
    setTimeout(() => {
      setSavedNotify(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Language Selection Card - Hidden in Support Center / Embedded Panel */}
        {!isEmbedded && (
        <section className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('settings.language_section')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('settings.language_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => handleLanguageChange('id')}
              className={cn(
                "p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all font-semibold text-xs sm:text-sm text-left cursor-pointer",
                language === 'id'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex w-5 h-3.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 flex-col">
                  <span className="h-1/2 bg-[#e00000] w-full" />
                  <span className="h-1/2 bg-white w-full" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm">{t('settings.lang_id')}</p>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40">ID</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal">Bahasa resmi sistem (Indonesia)</p>
                </div>
              </div>
              {language === 'id' && <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />}
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all font-semibold text-xs sm:text-sm text-left cursor-pointer",
                language === 'en'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex w-5 h-3.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 relative bg-[#012169]">
                  <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
                    <clipPath id="uk-flag-settings">
                      <path d="M0,0 v30 h60 v-30 z"/>
                    </clipPath>
                    <clipPath id="uk-diag-settings">
                      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                    </clipPath>
                    <g clipPath="url(#uk-flag-settings)">
                      <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-settings)" stroke="#C8102E" strokeWidth="4"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                    </g>
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm">{t('settings.lang_en')}</p>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40">EN</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-normal">System global language (English)</p>
                </div>
              </div>
              {language === 'en' && <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />}
            </button>
          </div>
        </section>
        )}

        {/* Theme Mode Card - Hidden in Support Center / Embedded Panel */}
        {!isEmbedded && (
          <section className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Palette size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('settings.theme_section')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('settings.theme_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => handleThemeChange('system')}
                className={cn(
                  "p-3 rounded-xl border flex sm:flex-col items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm cursor-pointer",
                  themeMode === 'system'
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
                )}
              >
                <Laptop size={18} className="text-blue-500" />
                <span>{t('settings.theme_system')}</span>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={cn(
                  "p-3 rounded-xl border flex sm:flex-col items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm cursor-pointer",
                  themeMode === 'light'
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
                )}
              >
                <Sun size={18} className="text-amber-500" />
                <span>{t('settings.theme_light')}</span>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={cn(
                  "p-3 rounded-xl border flex sm:flex-col items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm cursor-pointer",
                  themeMode === 'dark'
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs ring-2 ring-blue-500/20"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
                )}
              >
                <Moon size={18} className="text-indigo-400" />
                <span>{t('settings.theme_dark')}</span>
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {savedNotify && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{t('settings.save_success')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
