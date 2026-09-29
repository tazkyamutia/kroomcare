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
    <div className="space-y-4 sm:space-y-5">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Selamat Datang, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {role === 'customer'
              ? 'Pantau status layanan dan reward Anda di satu tempat.'
              : 'Pantau kinerja sistem layanan pelanggan dan antrean tiket aktif.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Semua Sistem Normal</span>
          </div>
        </div>
      </div>

      {/* RENDER KHUSUS MEMBER / CUSTOMER */}
      {role === 'customer' && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/tickets" className="group">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Ticket size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Buka Tiket</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Laporkan kendala teknis layanan</p>
              </div>
            </Link>
            <Link to="/rewards" className="group">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Gift size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Tukar Poin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gunakan voucher diskon belanja</p>
              </div>
            </Link>
            <Link to="/forum" className="group sm:col-span-2 lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-400 transition-all">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Forum Komunitas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bantuan instan cerdas 24/7</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Active Status */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-3">Status Layanan Aktif</h3>
              <div className="space-y-2.5">
                {[
                  { name: 'Shared Hosting - Pro', status: 'Active', expiry: '12 Des 2026', icon: '🌐' },
                  { name: 'Cloud VPS - Basic', status: 'Active', expiry: '05 Jan 2027', icon: '☁️' },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{service.icon}</div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">{service.name}</p>
                        <p className="text-[11px] text-slate-400">Berakhir pada {service.expiry}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md">
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Points Summary */}
            <div className="rounded-xl p-5 bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-xs relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Poin Loyalitas</h3>
                  <Link to="/points-history" className="p-1 hover:bg-white/20 rounded-lg transition-all text-white">
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
                <div className="mb-4">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{points.toLocaleString('id-ID')} <span className="text-xs font-normal text-blue-100">pts</span></p>
                </div>
                <div className="space-y-3">
                  <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-blue-50 leading-relaxed">
                    {pointsNeeded > 0 ? (
                      <>
                        <b className="text-white">{pointsNeeded.toLocaleString('id-ID')}</b> poin lagi untuk <b className="text-white">Free Domain</b>
                      </>
                    ) : (
                      <span className="text-white font-semibold">✨ Bisa ditukar voucher Free Domain!</span>
                    )}
                  </p>
                  <Link to="/rewards" className="block w-full py-2 bg-white text-blue-600 text-center rounded-lg text-xs font-semibold hover:bg-blue-50 transition-all shadow-xs active:scale-[0.98]">
                    Tukar Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENDER KHUSUS STAF / ADMIN */}
      {role !== 'customer' && (
        <>
          {/* Quick Actions (Staff) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link to="/staff" className="group">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 transition-all">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Ticket size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Antrean Keluhan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Proses tiket masuk pelanggan</p>
              </div>
            </Link>
            <Link to="/forum" className="group">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">Forum Komunitas</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pantau dan kelola diskusi publik</p>
              </div>
            </Link>
            {role === 'admin' ? (
              <Link to="/admin/users" className="group sm:col-span-2 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-400 transition-all">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Manajemen User</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola data pelanggan & staf</p>
                </div>
              </Link>
            ) : (
              <Link to="/profile" className="group sm:col-span-2 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-400 transition-all">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Profil Saya</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lihat status kerja & personal info</p>
                </div>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: 'Tiket Diproses', value: '14', desc: 'Butuh penyelesaian segera', icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
              { title: 'Tiket Selesai', value: '29', desc: '+12% dari kemarin', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
              { title: 'Rating CSAT', value: '4.8/5.0', desc: 'Berdasarkan 120 feedback', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
              { title: 'Waktu Respon', value: '12 Min', desc: 'Performa sangat baik', icon: Clock, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-tight">{stat.title}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                </div>
                <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{stat.value}</h4>
                <p className="text-[10px] text-slate-400">{stat.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
