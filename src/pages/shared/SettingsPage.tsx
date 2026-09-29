import React from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { Sun, Moon, CheckCircle2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, t } = useLanguageTheme();
  const [savedNotify, setSavedNotify] = React.useState(false);

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
        {/* Theme Mode Card */}
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

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                "p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm",
                theme === 'light'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
              )}
            >
              <Sun size={20} className="text-amber-500" />
              <span>{t('settings.theme_light')}</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                "p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-semibold text-xs sm:text-sm",
                theme === 'dark'
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/20 dark:text-blue-400 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400"
              )}
            >
              <Moon size={20} className="text-blue-400" />
              <span>{t('settings.theme_dark')}</span>
            </button>
          </div>
        </section>
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
