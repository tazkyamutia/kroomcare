import React from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { Globe, Sun, Moon, CheckCircle2, ShieldCheck, Palette, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, theme, setTheme, t } = useLanguageTheme();
  const [savedNotify, setSavedNotify] = React.useState(false);

  const handleLanguageChange = (lang: 'id' | 'en') => {
    setLanguage(lang);
    triggerNotify();
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    triggerNotify();
  };

  const triggerNotify = () => {
    setSavedNotify(true);
    setTimeout(() => {
      setSavedNotify(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24 px-4">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-slate-500 mt-2 text-sm dark:text-slate-400">
          {t('settings.subtitle')}
        </p>
      </div>

      <hr className="border-slate-100 dark:border-slate-800" />

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Language Selection Card */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-850">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Languages size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('settings.language_section')}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5">
                {t('settings.language_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleLanguageChange('id')}
              className={cn(
                "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all font-bold text-sm",
                language === 'id'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
              )}
            >
              <span className="text-2xl">🇮🇩</span>
              <span>Bahasa Indonesia</span>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all font-bold text-sm",
                language === 'en'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
              )}
            >
              <span className="text-2xl">🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </section>

        {/* Theme Mode Card */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-850">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Palette size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t('settings.theme_section')}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed mt-0.5">
                {t('settings.theme_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all font-bold text-sm",
                theme === 'light'
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
              )}
            >
              <Sun size={24} className="text-amber-500" />
              <span>{t('settings.theme_light')}</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                "p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all font-bold text-sm",
                theme === 'dark'
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/20 dark:text-indigo-400"
                  : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
              )}
            >
              <Moon size={24} className="text-blue-400" />
              <span>{t('settings.theme_dark')}</span>
            </button>
          </div>
        </section>

      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {savedNotify && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white"
          >
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold text-sm">{t('settings.save_success')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
