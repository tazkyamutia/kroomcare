import React from 'react';
import { Ticket, Gift, MessageSquare, ArrowUpRight, CheckCircle, Clock, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const DashboardHome = () => {
  const { user } = useUser();

  const userName = user?.name || 'User';
  const role = user?.role || 'customer';
  const points = user?.points || 0;

  // Progress untuk penukaran Free Domain (1000 Poin)
  const targetPoints = 1000;
  const progressPercent = Math.min((points / targetPoints) * 100, 100);
  const pointsNeeded = Math.max(targetPoints - points, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Selamat Datang, {userName}!
          </h1>
          <p className="text-slate-500 mt-1">
            {role === 'customer'
              ? 'Pantau status layanan dan reward Anda di satu tempat.'
              : 'Pantau kinerja sistem layanan pelanggan dan antrean tiket aktif.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">Semua Sistem Normal</span>
          </div>
        </div>
      </div>

      {/* RENDER KHUSUS MEMBER / CUSTOMER */}
      {role === 'customer' && (
        <>
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
            <Link to="/forum" className="group">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-slate-900/20">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Forum Komunitas</h3>
                <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors mt-1">Bantuan instan cerdas 24/7</p>
              </div>
            </Link>
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
            <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-700 to-sky-400 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden animate-fade-in">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold text-white">Poin Loyalitas</h3>
                  <Link to="/points-history" className="p-2 hover:bg-white/20 rounded-lg transition-all">
                    <ArrowUpRight size={20} className="text-brand-200" />
                  </Link>
                </div>
                <div className="mb-8">
                  <p className="text-brand-100 text-sm mb-1 font-medium">Saldo Saat Ini</p>
                  <p className="text-5xl font-bold">{points.toLocaleString('id-ID')}</p>
                </div>
                <div className="space-y-4">
                  <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-brand-100 font-medium">
                    {pointsNeeded > 0 ? (
                      <>
                        <b>{pointsNeeded.toLocaleString('id-ID')}</b> poin lagi untuk menukar <b className="text-white">Free Domain</b>
                      </>
                    ) : (
                      <span className="text-white font-bold">✨ Anda sudah bisa menukar voucher Free Domain!</span>
                    )}
                  </p>
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
        </>
      )}

      {/* RENDER KHUSUS STAF / ADMIN */}
      {role !== 'customer' && (
        <>
          {/* Quick Actions (Staff) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/staff" className="group">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-brand-600 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-brand-500/20">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                  <Ticket size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Antrean Keluhan</h3>
                <p className="text-sm text-slate-500 group-hover:text-brand-100 transition-colors mt-1">Proses tiket masuk pelanggan</p>
              </div>
            </Link>
            <Link to="/forum" className="group">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-emerald-600 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-emerald-500/20">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Forum Komunitas</h3>
                <p className="text-sm text-slate-500 group-hover:text-emerald-100 transition-colors mt-1">Pantau dan kelola diskusi publik</p>
              </div>
            </Link>
            {role === 'admin' ? (
              <Link to="/admin/users" className="group">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-slate-900/20">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                    <Users size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Manajemen User</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors mt-1">Kelola data pelanggan & staf</p>
                </div>
              </Link>
            ) : (
              <Link to="/profile" className="group">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-slate-900/20">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                    <Users size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">Profil Saya</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors mt-1">Lihat status kerja & informasi personal</p>
                </div>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Tiket Sedang Diproses', value: '14', desc: 'Butuh penyelesaian segera', icon: Clock, color: 'text-brand-600 bg-brand-50' },
              { title: 'Tiket Selesai (Hari ini)', value: '29', desc: '+12% dari kemarin', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
              { title: 'Rating Kepuasan (CSAT)', value: '4.8/5.0', desc: 'Berdasarkan 120 feedback', icon: Star, color: 'text-amber-500 bg-amber-50' },
              { title: 'Waktu Respon Rata-rata', value: '12 Min', desc: 'Performa sangat baik', icon: Clock, color: 'text-sky-600 bg-sky-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-500 max-w-[140px] leading-snug">{stat.title}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <h4 className="text-3xl font-display font-bold text-slate-900 mb-1">{stat.value}</h4>
                <p className="text-xs text-slate-400 font-medium">{stat.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
