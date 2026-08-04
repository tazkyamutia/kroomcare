import React from 'react';
import { Ticket, CheckCircle2, BarChart3, ArrowRight, MessageSquare, Zap, Loader2, Sunrise, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUser } from '../../context/UserContext';

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
  const [shift, setShift] = React.useState('Pagi');
  const [stats, setStats] = React.useState<StaffStats | null>(null);
  const [loading, setLoading] = React.useState(true);

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
    { label: 'Tiket Baru', value: String(stats.newTickets), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tiket Saya', value: String(stats.myTickets), icon: Ticket, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Selesai Hari Ini', value: String(stats.doneToday), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tingkat Penyelesaian Tiket', value: stats.slaRate, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [
    { label: 'Tiket Baru', value: '-', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Tiket Saya', value: '-', icon: Ticket, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Selesai Hari Ini', value: '-', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tingkat Penyelesaian Tiket', value: '-', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // Chart bar heights (normalize weekly data to max 100%)
  const chartBars = React.useMemo(() => {
    if (!stats?.weeklyChart?.length) {
      const mockHeights = [35, 60, 40, 85, 50, 75, 90];
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
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
      label: new Date(d.day).toLocaleDateString('id-ID', { weekday: 'short' }),
      resolved: d.resolved,
      total: d.total
    }));
  }, [stats]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Ringkasan Staff</h1>
          <p className="text-slate-500 mt-1">Pantau performa dukungan dan ringkasan aktivitas hari ini.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {['Pagi', 'Siang', 'Malam'].map(s => (
            <button
              key={s}
              onClick={() => setShift(s)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all",
                shift === s ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              Shift {s}
            </button>
          ))}
        </div>
      </div>

      {/* Banner Info Shift Dinamis */}
      <motion.div
        key={shift}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "p-6 rounded-3xl border relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm transition-all duration-300",
          shift === 'Pagi' && "bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-200/60 text-amber-900",
          shift === 'Siang' && "bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-200/60 text-sky-900",
          shift === 'Malam' && "bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border-indigo-200/60 text-indigo-900"
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
            shift === 'Pagi' && "bg-white border-amber-200 text-amber-500",
            shift === 'Siang' && "bg-white border-sky-200 text-sky-500",
            shift === 'Malam' && "bg-white border-indigo-200 text-indigo-500"
          )}>
            {shift === 'Pagi' && <Sunrise size={24} />}
            {shift === 'Siang' && <Sun size={24} />}
            {shift === 'Malam' && <Moon size={24} />}
          </div>
          <div>
            <h4 className="text-sm font-bold">
              Shift Aktif: {shift === 'Pagi' ? 'Pagi (07.00 - 15.00 WIB)' : shift === 'Siang' ? 'Siang (15.00 - 23.00 WIB)' : 'Malam (23.00 - 07.00 WIB)'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {shift === 'Pagi' && 'Selamat pagi! Pastikan untuk segera menanggapi tiket baru yang masuk dan menjaga kemudahan pelayanan.'}
              {shift === 'Siang' && 'Selamat siang! Tetap semangat menjaga kualitas penanganan keluhan dan perhatikan waktu respon tiket.'}
              {shift === 'Malam' && 'Selamat malam! Tetap waspada memantau sistem penanganan keluhan mendesak selama shift malam ini.'}
            </p>
          </div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border self-start sm:self-auto shadow-sm">
          {shift === 'Pagi' && '🌅 Mulai Hari'}
          {shift === 'Siang' && '☀️ Siang Ceria'}
          {shift === 'Malam' && '🌌 Jaga Malam'}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
            {loading ? (
              <Loader2 size={24} className="animate-spin text-slate-400 mt-1" />
            ) : (
              <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart dari database */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-600" />
              Resolusi Tiket Mingguan ({shift === 'Pagi' ? 'Shift Pagi' : shift === 'Siang' ? 'Shift Siang' : 'Shift Malam'})
            </h3>
            <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>7 Hari Terakhir</option>
            </select>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-4">
              {chartBars.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex flex-col-reverse gap-0.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.height * 2.56}px` }}
                      style={{ height: `${bar.height * 2.56}px` }}
                      className="w-full bg-brand-100 rounded-t-xl relative group"
                    >
                      <div className="absolute inset-0 bg-brand-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom rounded-t-xl" />
                      {bar.total > 0 && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          {bar.resolved}/{bar.total}
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aktivitas Terbaru dari database */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-600" />
            Aktivitas Terbaru
          </h3>
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act, i) => (
                <div key={act.id || i} className="flex gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 shrink-0",
                    act.type === 'new' ? "bg-blue-500" : act.type === 'resolved' ? "bg-emerald-500" : "bg-brand-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600">
                      <span className="font-bold text-slate-900">{act.user}</span>
                      {act.type === 'reply' ? ' membalas tiket ' :
                        act.type === 'transfer' ? ' mentransfer tiket ' :
                        act.type === 'resolved' ? ' menyelesaikan tiket ' :
                        ' membuat tiket baru '}
                      <span className="font-mono font-bold text-brand-600">{act.ticket}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada aktivitas terbaru pada shift ini.
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/staff')}
            className="w-full mt-8 py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            Lihat Semua Antrean
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
