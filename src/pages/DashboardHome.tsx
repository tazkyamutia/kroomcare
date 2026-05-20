import React from 'react';
import { LayoutDashboard, Ticket, Gift, MessageSquare, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const DashboardHome = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Selamat Datang, John!</h1>
          <p className="text-slate-500 mt-1">Pantau status layanan dan reward Anda di satu tempat.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">Semua Sistem Normal</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/tickets" className="group">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-brand-600 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-brand-500/20">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
              <Ticket size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Buka Tiket</h3>
            <p className="text-sm text-slate-500 group-hover:text-brand-100 transition-colors mt-1">Laporkan kendala teknis layanan</p>
          </div>
        </Link>
        <Link to="/rewards" className="group">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-emerald-600 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-emerald-500/20">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
              <Gift size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Tukar Poin</h3>
            <p className="text-sm text-slate-500 group-hover:text-emerald-100 transition-colors mt-1">Gunakan voucher diskon belanja</p>
          </div>
        </Link>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-slate-900/20 cursor-pointer">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Tanya AI</h3>
          <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors mt-1">Bantuan instan cerdas 24/7</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Status */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6">Status Layanan Aktif</h3>
            <div className="space-y-4">
              {[
                { name: 'Shared Hosting - Pro', status: 'Active', expiry: '12 Des 2026', icon: '🌐' },
                { name: 'Cloud VPS - Basic', status: 'Active', expiry: '05 Jan 2027', icon: '☁️' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{service.icon}</div>
                    <div>
                      <p className="font-bold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">Berakhir pada {service.expiry}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-50 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Points Summary */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-700 to-sky-400 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white">Poin Loyalitas</h3>
              <Link to="/points-history" className="p-2 hover:bg-white/20 rounded-lg transition-all">
                <ArrowUpRight size={20} className="text-brand-200" />
              </Link>
            </div>
            <div className="mb-8">
              <p className="text-brand-100 text-sm mb-1 font-medium">Saldo Saat Ini</p>
              <p className="text-5xl font-bold">850</p>
            </div>
            <div className="space-y-4">
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[85%] shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
              <p className="text-xs text-brand-100 font-medium">150 poin lagi untuk menukar <b className="text-white">Free Domain</b></p>
              <Link to="/rewards" className="block w-full py-3.5 bg-white text-brand-600 text-center rounded-2xl text-sm font-bold hover:bg-brand-50 transition-all shadow-lg active:scale-[0.98]">
                Tukar Sekarang
              </Link>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-brand-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};
