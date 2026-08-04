import React from 'react';
import { Shield, Users, Ticket, Settings, MessageSquare, BarChart3, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export const AdminDashboard = () => {
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
        setError(result.message || 'Gagal mengambil statistik dashboard.');
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('Gagal terhubung ke server backend (localhost:5000). Pastikan server backend Anda menyala.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdminData();
    // Refresh stats every 15 seconds to keep dashboard updated
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-inner">
          <Shield size={32} />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Gagal Memuat Dashboard</h3>
        <p className="text-slate-500 text-xs max-w-sm leading-relaxed">{error}</p>
        <button 
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAdminData();
          }}
          className="mt-2 px-6 py-3 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-slate-500 font-bold text-sm animate-pulse">Menghubungkan & Memuat Dashboard Admin...</p>
      </div>
    );
  }

  const { stats, staffStats, recentLogs } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Admin CRM Dashboard</h1>
          <p className="text-slate-500 mt-1">Kelola operasional dukungan dan konfigurasi sistem reward.</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Pengguna', value: stats.totalUsers.toLocaleString('id-ID'), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tiket Aktif', value: stats.activeTickets.toString(), icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sesi AI Hari Ini', value: stats.aiSessions.toString(), icon: MessageSquare, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Resolusi Rate', value: stats.resolutionRate, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Overview & Staff Performance */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold flex items-center gap-2 text-slate-900">
                <BarChart3 size={20} className="text-brand-600" />
                Statistik Performa Sistem
              </h3>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['day', 'week', 'month'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                      timeRange === range 
                        ? "bg-white text-slate-900 shadow-sm" 
                        : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {range === 'day' ? 'Hari' : range === 'week' ? 'Minggu' : 'Bulan'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={
                  timeRange === 'day' ? data.dailyStats : 
                  timeRange === 'week' ? data.weeklyStats : 
                  data.monthlyStats
                }>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                  <Bar dataKey="Tiket Masuk" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Staff Performance Recap */}
          <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2 text-slate-900">
                <Users size={20} className="text-brand-600" />
                Rekap Performa Staff (Database MySQL)
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg animate-pulse">
                Live Data
              </span>
            </div>

            {/* Performance Visual Chart */}
            <div className="h-48 mb-8 border-b border-slate-100 pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffStats}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="dealt" name="Tiket Ditangani" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="done" name="Tiket Selesai" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Staff</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tiket Ditangani</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tiket Selesai</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Efisiensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {staffStats.map((staff: any, i: number) => {
                    const dealt = staff.dealt || 0;
                    const done = staff.done || 0;
                    const percent = dealt > 0 ? Math.round((done / dealt) * 100) : 100;
                    
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                              staff.color === 'brand' ? "bg-brand-50 text-brand-600" :
                              staff.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                              staff.color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {staff.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{staff.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-slate-600">{dealt}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-emerald-600">{done}</span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  staff.color === 'brand' ? "bg-brand-600" :
                                  staff.color === 'emerald' ? "bg-emerald-600" :
                                  staff.color === 'blue' ? "bg-blue-600" : "bg-amber-600"
                                )}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
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
        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200 shadow-sm text-slate-900">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900">
              <Settings size={18} className="text-brand-600" />
              Kontrol Sistem
            </h3>
            <div className="space-y-4">
              <div 
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-150 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Maintenance Mode</span>
                <div className={cn(
                  "w-10 h-5 rounded-full relative transition-all duration-300",
                  maintenanceMode ? "bg-brand-600" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transition-transform duration-300 left-1",
                    maintenanceMode ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>
              <div 
                onClick={() => setAutoAssign(!autoAssign)}
                className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-150 transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Auto-Assign</span>
                <div className={cn(
                  "w-10 h-5 rounded-full relative transition-all duration-300",
                  autoAssign ? "bg-brand-600" : "bg-slate-200"
                )}>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transition-transform duration-300 left-1",
                    autoAssign ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              </div>
              <button 
                onClick={handleSaveConfig}
                disabled={isConfigSaving}
                className={cn(
                  "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                  configSaved 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : "bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20"
                )}
              >
                {isConfigSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : configSaved ? (
                  "Konfigurasi Disimpan!"
                ) : (
                  "Simpan Konfigurasi"
                )}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white shadow-sm">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900">
              <Clock size={18} className="text-brand-500" />
              Log Aktivitas Terbaru (Live MySQL)
            </h3>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {recentLogs.map((log: any, i: number) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-brand-600 border-2 border-white ring-2 ring-brand-50 shadow-sm" />
                  <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{log.user}</p>
                  <p className="text-[10px] text-slate-500 mb-1 leading-snug">{log.action}</p>
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-tighter">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
