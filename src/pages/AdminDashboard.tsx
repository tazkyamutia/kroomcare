import React from 'react';
import { Shield, Users, Ticket, Settings, MessageSquare, BarChart3, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const AdminDashboard = () => {
  const { t, language } = useLanguageTheme();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [autoAssign, setAutoAssign] = React.useState(true);
  const [isConfigSaving, setIsConfigSaving] = React.useState(false);
  const [configSaved, setConfigSaved] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<'day' | 'week' | 'month'>('day');

  const handleSaveConfig = () => {
    setIsConfigSaving(true);
    setTimeout(() => {
      setIsConfigSaving(false);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    }, 1000);
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const result = await response.json();
      if (response.ok && result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.message || (language === 'en' ? 'Failed to fetch dashboard statistics.' : 'Gagal mengambil statistik dashboard.'));
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError(language === 'en' ? 'Failed to connect to backend server. Make sure your server is running.' : 'Gagal terhubung ke server backend (localhost:5000). Pastikan server backend Anda menyala.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 px-4 text-center">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center shadow-xs">
          <Shield size={24} />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{t('admin.load_failed')}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm leading-relaxed">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAdminData();
          }}
          className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
        >
          {t('admin.retry')}
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t('admin.loading')}</p>
      </div>
    );
  }

  const { stats, staffStats, recentLogs } = data;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
          <Shield size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('admin.title')}</h1>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t('admin.total_users'), value: stats.totalUsers?.toLocaleString(language === 'en' ? 'en-US' : 'id-ID') || '0', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
          { label: t('admin.active_tickets'), value: stats.activeTickets?.toString() || '0', icon: Ticket, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          { label: t('admin.ai_sessions_today'), value: stats.aiSessions?.toString() || '0', icon: MessageSquare, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
          { label: t('admin.resolution_rate'), value: stats.resolutionRate || '0%', icon: BarChart3, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
        ].map((stat, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
              <stat.icon size={18} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Analytics & Staff Performance */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Performance Chart */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
                {t('admin.system_performance')}
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                {(['day', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      timeRange === range 
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {range === 'day' ? t('admin.range_day') : range === 'week' ? t('admin.range_week') : t('admin.range_month')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={
                  timeRange === 'day' ? data.dailyStats : 
                  timeRange === 'week' ? data.weeklyStats : 
                  data.monthlyStats
                }>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 500 }} />
                  <Bar dataKey="Tiket Masuk" name={t('admin.chart_incoming')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Selesai" name={t('admin.chart_resolved')} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Performance Recap */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Users size={18} className="text-blue-600 dark:text-blue-400" />
                {t('admin.staff_recap')}
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900">
                {t('admin.live_data')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3">{t('admin.col_staff_name')}</th>
                    <th className="pb-3 text-center">{t('admin.col_dealt')}</th>
                    <th className="pb-3 text-center">{t('admin.col_done')}</th>
                    <th className="pb-3 text-right">{t('admin.col_efficiency')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {staffStats?.map((staff: any, i: number) => {
                    const dealt = staff.dealt || 0;
                    const done = staff.done || 0;
                    const percent = dealt > 0 ? Math.round((done / dealt) * 100) : 100;
                    
                    return (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                              {staff.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{staff.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">{dealt}</td>
                        <td className="py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">{done}</td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className="h-full rounded-full bg-blue-600"
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Settings & Activity Log */}
        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm sm:text-base font-semibold mb-3.5 flex items-center gap-2 text-slate-900 dark:text-white">
              <Settings size={18} className="text-blue-600 dark:text-blue-400" />
              {t('admin.system_control')}
            </h3>
            <div className="space-y-3">
              <div 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('admin.maintenance_mode')}</span>
                <div className={cn(
                  "w-9 h-5 rounded-full relative transition-all duration-300",
                  maintenanceMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                )}>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 left-0.5",
                    maintenanceMode ? "translate-x-4" : "translate-x-0"
                  )} />
                </div>
              </div>
              <div 
                onClick={() => setAutoAssign(!autoAssign)}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('admin.auto_assign')}</span>
                <div className={cn(
                  "w-9 h-5 rounded-full relative transition-all duration-300",
                  autoAssign ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                )}>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 left-0.5",
                    autoAssign ? "translate-x-4" : "translate-x-0"
                  )} />
                </div>
              </div>
              <button 
                onClick={handleSaveConfig}
                disabled={isConfigSaving}
                className={cn(
                  "w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2",
                  configSaved 
                    ? "bg-emerald-600 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                {isConfigSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : configSaved ? (
                  t('admin.config_saved')
                ) : (
                  t('admin.save_config')
                )}
              </button>
            </div>
          </div>

          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <h3 className="text-sm sm:text-base font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock size={18} className="text-blue-600 dark:text-blue-400" />
              {t('admin.recent_activity_logs')}
            </h3>
            <div className="space-y-3.5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {recentLogs?.map((log: any, i: number) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{log.user}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{log.action}</p>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

