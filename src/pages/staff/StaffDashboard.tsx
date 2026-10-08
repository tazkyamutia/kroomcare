import React from 'react';
import { Ticket, CheckCircle2, BarChart3, ArrowRight, MessageSquare, Zap, Loader2, Sunrise, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUser } from '../../context/UserContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

interface StaffStats {
  newTickets: number;
  myTickets: number;
  doneToday: number;
  slaRate: string;
  weeklyChart: { day: string; total: number; resolved: number }[];
  recentActivity: { id: number; user: string; type: string; ticket: string; time: string }[];
}

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t, language } = useLanguageTheme();
  const [shift, setShift] = React.useState('Pagi');
  const [stats, setStats] = React.useState<StaffStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const locale = language === 'en' ? 'en-US' : 'id-ID';

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const staffId = user?.id || '';
        const response = await fetch(`/api/admin/stats/staff?staffId=${staffId}&shift=${shift}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setStats(result.data);
        }
      } catch (err) {
        console.error('Gagal mengambil data staff dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id, shift]);

  const statCards = stats ? [
    { label: t('staff.new_tickets'), value: String(stats.newTickets), icon: Zap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: t('staff.my_tickets'), value: String(stats.myTickets), icon: Ticket, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: t('staff.done_today'), value: String(stats.doneToday), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: t('staff.sla_rate'), value: stats.slaRate, icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  ] : [
    { label: t('staff.new_tickets'), value: '-', icon: Zap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: t('staff.my_tickets'), value: '-', icon: Ticket, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { label: t('staff.done_today'), value: '-', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: t('staff.sla_rate'), value: '-', icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  ];

  // Chart bar heights
  const chartBars = React.useMemo(() => {
    if (!stats?.weeklyChart?.length) {
      const mockHeights = [35, 60, 40, 85, 50, 75, 90];
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayLabel = d.toLocaleDateString(locale, { weekday: 'short' });
        const totalVal = Math.round(mockHeights[i] / 10);
        return {
          height: mockHeights[i],
          label: dayLabel,
          resolved: Math.max(0, totalVal - 1),
          total: totalVal
        };
      });
    }
    const maxTotal = Math.max(...stats.weeklyChart.map(d => d.total), 1);
    return stats.weeklyChart.map(d => ({
      height: Math.max(10, Math.round((d.total / maxTotal) * 100)),
      label: new Date(d.day).toLocaleDateString(locale, { weekday: 'short' }),
      resolved: d.resolved,
      total: d.total
    }));
  }, [stats, locale]);

  const shiftOptions = [
    { id: 'Pagi', label: t('staff.shift_morning') },
    { id: 'Siang', label: t('staff.shift_afternoon') },
    { id: 'Malam', label: t('staff.shift_night') }
  ];

  return (
    <div className="space-y-5">
      {/* Header & Shift Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('staff.title')}</h1>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs self-start sm:self-auto">
          {shiftOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setShift(opt.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                shift === opt.id 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner Info Shift Dinamis */}
      <motion.div
        key={shift}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "p-4 sm:p-5 rounded-xl sm:rounded-2xl border relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs",
          shift === 'Pagi' && "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 text-amber-900 dark:text-amber-200",
          shift === 'Siang' && "bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/70 dark:border-sky-900/40 text-sky-900 dark:text-sky-200",
          shift === 'Malam' && "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs border",
            shift === 'Pagi' && "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
            shift === 'Siang' && "bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400",
            shift === 'Malam' && "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
          )}>
            {shift === 'Pagi' && <Sunrise size={18} />}
            {shift === 'Siang' && <Sun size={18} />}
            {shift === 'Malam' && <Moon size={18} />}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold">
              {language === 'en' ? 'Active Shift: ' : 'Shift Aktif: '}
              {shift === 'Pagi' ? (language === 'en' ? 'Morning (07.00 - 15.00)' : 'Pagi (07.00 - 15.00 WIB)') : 
               shift === 'Siang' ? (language === 'en' ? 'Afternoon (15.00 - 23.00)' : 'Siang (15.00 - 23.00 WIB)') : 
               (language === 'en' ? 'Night (23.00 - 07.00)' : 'Malam (23.00 - 07.00 WIB)')}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {shift === 'Pagi' && (language === 'en' ? 'Good morning! Respond promptly to incoming tickets and maintain customer satisfaction.' : 'Selamat pagi! Pastikan segera menanggapi tiket baru dan menjaga kepuasan pengguna.')}
              {shift === 'Siang' && (language === 'en' ? 'Good afternoon! Keep up the great response rate for ongoing technical requests.' : 'Selamat siang! Tetap semangat menjaga kualitas respon tiket kendala hosting.')}
              {shift === 'Malam' && (language === 'en' ? 'Good evening! Keep an eye on urgent system complaints during this night shift.' : 'Selamat malam! Pantau sistem penanganan keluhan mendesak selama shift malam ini.')}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto shadow-xs shrink-0">
          {shift === 'Pagi' && (language === 'en' ? '🌅 Start Day' : '🌅 Mulai Hari')}
          {shift === 'Siang' && (language === 'en' ? '☀️ Midday' : '☀️ Siang Ceria')}
          {shift === 'Malam' && (language === 'en' ? '🌌 Night Guard' : '🌌 Jaga Malam')}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden"
          >
            <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
              <stat.icon size={18} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{stat.label}</p>
            {loading ? (
              <Loader2 size={18} className="animate-spin text-slate-400 mt-1" />
            ) : (
              <p className={cn("text-xl sm:text-2xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
              {language === 'en' ? 'Weekly Ticket Resolution' : 'Resolusi Tiket Mingguan'}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 font-medium">
              {language === 'en' ? 'Last 7 Days' : '7 Hari Terakhir'}
            </span>
          </div>
          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-3 pt-6">
              {chartBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col-reverse items-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(8, bar.height * 1.5)}px` }}
                      className="w-full max-w-[36px] bg-blue-100 dark:bg-blue-950/60 rounded-t-md relative group transition-colors hover:bg-blue-600 dark:hover:bg-blue-500"
                    >
                      {bar.total > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {bar.resolved}/{bar.total}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
            {t('staff.recent_activity')}
          </h3>
          <div className="space-y-3.5 flex-1">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act, i) => (
                <div key={act.id || i} className="flex gap-3 text-xs">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    act.type === 'new' ? "bg-blue-500" : act.type === 'resolved' ? "bg-emerald-500" : "bg-indigo-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">{act.user}</span>
                      {language === 'en' ? (
                        act.type === 'reply' ? ' replied to ticket ' :
                        act.type === 'transfer' ? ' transferred ticket ' :
                        act.type === 'resolved' ? ' resolved ticket ' :
                        ' created new ticket '
                      ) : (
                        act.type === 'reply' ? ' membalas tiket ' :
                        act.type === 'transfer' ? ' mentransfer tiket ' :
                        act.type === 'resolved' ? ' menyelesaikan tiket ' :
                        ' membuat tiket baru '
                      )}
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{act.ticket}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                {t('staff.no_activity')}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/staff')}
            className="w-full mt-4 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 dark:border-slate-700 cursor-pointer"
          >
            {t('staff.open_queue')}
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
