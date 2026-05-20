import React from 'react';
import { Ticket, Clock, CheckCircle2, BarChart3, ArrowRight, MessageSquare, Zap } from 'lucide-react';
import { DUMMY_TICKETS } from '../../utils/dummyData';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const StaffDashboard = () => {
  const navigate = useNavigate();
  const [shift, setShift] = React.useState('Pagi');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Staff Overview</h1>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Tiket Baru', value: '5', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tiket Saya', value: '12', icon: Ticket, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Selesai Hari Ini', value: '8', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'SLA Rate', value: '98%', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
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
            <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-600" />
              Resolusi Tiket Mingguan
            </h3>
            <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-3 py-1.5 focus:ring-0">
              <option>7 Hari Terakhir</option>
              <option>30 Hari Terakhir</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {[35, 60, 40, 85, 50, 75, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-brand-100 rounded-t-xl relative group"
                >
                  <div className="absolute inset-0 bg-brand-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom rounded-t-xl" />
                </motion.div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card rounded-3xl p-6">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-600" />
            Aktivitas Terbaru
          </h3>
          <div className="space-y-6">
            {[
              { type: 'reply', user: 'John Customer', ticket: 'T-1001', time: '2m ago' },
              { type: 'transfer', user: 'System', ticket: 'T-1005', time: '15m ago' },
              { type: 'resolved', user: 'Sarah Staff', ticket: 'T-1002', time: '1h ago' },
              { type: 'new', user: 'Mark User', ticket: 'T-1009', time: '3h ago' },
            ].map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2 shrink-0",
                  act.type === 'new' ? "bg-blue-500" : act.type === 'resolved' ? "bg-emerald-500" : "bg-brand-500"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-slate-900">{act.user}</span>
                    {act.type === 'reply' ? ' membalas tiket ' : act.type === 'transfer' ? ' mentransfer tiket ' : act.type === 'resolved' ? ' menyelesaikan tiket ' : ' membuat tiket baru '}
                    <span className="font-mono font-bold text-brand-600">{act.ticket}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
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
