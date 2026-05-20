import React from 'react';
import { Shield, Users, Ticket, Settings, MessageSquare, BarChart3, ArrowRight } from 'lucide-react';
import { DUMMY_TICKETS as INITIAL_TICKETS } from '../utils/dummyData';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { DUMMY_STAFF_STATS } from '../utils/dummyData';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const AdminDashboard = () => {
  const [tickets] = React.useState(INITIAL_TICKETS);

  return (
    <div className="space-y-8">
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
          { label: 'Total Pengguna', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tiket Aktif', value: tickets.filter(t => t.status !== 'Resolved').length.toString(), icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Sesi AI Hari Ini', value: '156', icon: MessageSquare, color: 'text-brand-600', bg: 'bg-brand-50' },
          { label: 'Resolusi Rate', value: '94%', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Overview & Staff Performance */}
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <div className="glass-card rounded-3xl p-8">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900">
              <BarChart3 size={20} className="text-brand-600" />
              Statistik Performa Sistem
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-brand-100 rounded-t-lg relative group"
                  >
                    <div className="absolute inset-0 bg-brand-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom rounded-t-lg" />
                  </motion.div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff Performance Recap */}
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold flex items-center gap-2 text-slate-900">
                <Users size={20} className="text-brand-600" />
                Rekap Performa Staff
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-brand-50 text-brand-600 rounded-lg">
                Live Data
              </span>
            </div>

            {/* Performance Visual Chart */}
            <div className="h-48 mb-8 border-b border-slate-50 pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DUMMY_STAFF_STATS}>
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
                  {DUMMY_STAFF_STATS.map((staff, i) => (
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
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{staff.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-sm font-bold text-slate-600">{staff.dealt}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-sm font-bold text-emerald-600">{staff.done}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(staff.done / staff.dealt) * 100}%` }}
                              className={cn(
                                "h-full rounded-full",
                                staff.color === 'brand' ? "bg-brand-600" :
                                staff.color === 'emerald' ? "bg-emerald-600" :
                                staff.color === 'blue' ? "bg-blue-600" : "bg-amber-600"
                              )}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            {Math.round((staff.done / staff.dealt) * 100)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Settings & Activity Log */}
        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-6 bg-slate-900 text-white shadow-xl shadow-slate-900/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings size={18} className="text-brand-400" />
              Kontrol Sistem
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance Mode</span>
                <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                  <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-400 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Auto-Assign</span>
                <div className="w-10 h-5 bg-brand-600 rounded-full relative">
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <button className="w-full py-4 bg-brand-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                Simpan Konfigurasi
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-200">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-900">
              <MessageSquare size={18} className="text-brand-500" />
              Log Aktivitas Terbaru
            </h3>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                { user: 'Sarah Staff', action: 'Memasukkan point ke U1', time: '2m' },
                { user: 'Alex Admin', action: 'Update setting server', time: '15m' },
                { user: 'Rian CS', action: 'Selesaikan tiket T-1006', time: '1h' },
              ].map((log, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-brand-600 border-2 border-white ring-2 ring-brand-50 shadow-sm" />
                  <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{log.user}</p>
                  <p className="text-[10px] text-slate-500 mb-1">{log.action}</p>
                  <span className="text-[10px] font-black text-brand-400 uppercase tracking-tighter">{log.time} ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
