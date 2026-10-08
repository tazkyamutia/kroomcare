import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const NewTicketPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { t } = useLanguageTheme();
  const [formData, setFormData] = React.useState({
    subject: '',
    category: 'Hosting',
    priority: 'Medium',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert(t('tickets.must_login'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          judul: formData.subject,
          deskripsi: formData.description,
          is_priority: formData.priority === 'High' ? 1 : 0
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const addedPoints = typeof result.data?.pointsAwarded === 'number' ? result.data.pointsAwarded : 0;
        if (addedPoints > 0) {
          updateUser({ points: (user.points || 0) + addedPoints });
        }
        alert(result.message || t('tickets.success_created'));
        navigate('/tickets');
      } else {
        alert(result.message || t('tickets.error_created'));
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert(t('tickets.error_created'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/tickets')}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('tickets.create_title')}</h1>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('tickets.subject')}</label>
          <input 
            required
            type="text"
            placeholder={t('tickets.subject_placeholder')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('tickets.category')}</label>
            <select 
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Hosting">Hosting</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Domain">Domain</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('tickets.priority_label')}</label>
            <select 
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">{t('tickets.priority_normal')}</option>
              <option value="High">{t('tickets.priority_high')}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('tickets.description')}</label>
          <textarea 
            required
            rows={4}
            placeholder={t('tickets.description_placeholder')}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
            ✨ {t('tickets.coin_reward_notice')}
          </p>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-75 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              {t('tickets.submitting')}
            </>
          ) : (
            <>
              <Send size={16} />
              {t('tickets.submit_btn')}
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};
