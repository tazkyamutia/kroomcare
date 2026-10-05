import React from 'react';
import { 
  Ticket, Gift, MessageSquare, ArrowUpRight, CheckCircle, Clock, 
  Star, Users, Globe, Server, Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const DashboardHome = () => {
  const { user } = useUser();
  const { t } = useLanguageTheme();

  const userDisplayName = user?.name || 'tazkyaa';
  const role = user?.role || 'customer';
  // Use user's points or default to 75 as in mockup specification
  const points = user?.points !== undefined && user?.points !== null ? user.points : 75;

  // Progress untuk penukaran Free Domain (1000 Poin)
  const targetPoints = 1000;
  const progressPercent = Math.min((points / targetPoints) * 100, 100);
  const pointsNeeded = Math.max(targetPoints - points, 0);

  return (
    <div className="space-y-5">
      {/* Welcome Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.welcome')}, {userDisplayName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {role === 'customer'
              ? t('dashboard.subtitle_customer')
              : t('dashboard.subtitle_staff')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t('dashboard.system_normal')}</span>
          </div>
        </div>
      </div>

      {/* RENDER KHUSUS MEMBER / CUSTOMER */}
      {role === 'customer' && (
        <>
          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Buka Tiket */}
            <Link to="/tickets" className="group block">
              <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400/80 dark:hover:border-blue-500/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <div className="relative">
                      <Ticket size={22} className="stroke-[2.2]" />
                      <Search size={11} className="absolute -bottom-1 -right-1 text-teal-600 dark:text-teal-400 stroke-[2.5] bg-white dark:bg-slate-900 rounded-full" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {t('dashboard.open_ticket')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {t('dashboard.open_ticket_desc')}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </Link>

            {/* Card 2 — Tukar Poin */}
            <Link to="/rewards" className="group block">
              <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-400/80 dark:hover:border-teal-500/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Gift size={22} className="stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {t('dashboard.redeem_points')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {t('dashboard.redeem_points_desc')}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </Link>

            {/* Card 3 — Forum Komunitas */}
            <Link to="/forum" className="group block sm:col-span-2 lg:col-span-1">
              <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <Users size={22} className="stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t('dashboard.community_forum')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {t('dashboard.community_forum_desc')}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
            </Link>
          </div>

          {/* Lower Split Section: Status Layanan Aktif + Poin Loyalitas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Status Layanan Aktif */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('dashboard.active_services')}
                  </h2>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                    {t('dashboard.services_connected')}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Shared Hosting - Pro */}
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Shared Hosting - Pro
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('dashboard.expires_on')} 12 Des 2026
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                      {t('dashboard.active')}
                    </span>
                  </div>

                  {/* Cloud VPS - Basic */}
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Server size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Cloud VPS - Basic
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t('dashboard.expires_on')} 05 Jan 2027
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1 rounded-full">
                      {t('dashboard.active')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{t('dashboard.managed_by')}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 99.98% {t('dashboard.uptime')}
                </span>
              </div>
            </div>

            {/* POIN LOYALITAS Card */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-blue-600 via-blue-600 to-sky-600 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
              {/* Subtle circular background gradients */}
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                    {t('dashboard.loyalty_points')}
                  </h3>
                  <Link 
                    to="/points-history" 
                    className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg transition-all text-white"
                    title={t('nav.points_history')}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className="mb-4">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
                    {points > 0 ? points.toLocaleString('id-ID') : '75'} 
                    <span className="text-sm font-medium text-blue-100">{t('header.pts')}</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-white h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${progressPercent > 0 ? progressPercent : 7.5}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-50 font-medium leading-relaxed">
                    {pointsNeeded > 0 ? (
                      <>
                        <b className="text-white">{pointsNeeded.toLocaleString('id-ID')}</b> {t('dashboard.points_needed_prefix')} <b className="text-white">{t('dashboard.free_domain')}</b>
                      </>
                    ) : (
                      <span className="text-white font-semibold">{t('dashboard.can_redeem_domain')}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6">
                <Link 
                  to="/rewards" 
                  className="block w-full py-2.5 bg-white text-blue-600 text-center rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  {t('dashboard.redeem_now')}
                </Link>
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
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{t('dashboard.ticket_queue')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.process_tickets_desc')}</p>
              </div>
            </Link>
            <Link to="/forum" className="group">
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{t('dashboard.community_forum')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.monitor_forum_desc')}</p>
              </div>
            </Link>
            {role === 'admin' ? (
              <Link to="/admin/users" className="group sm:col-span-2 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-400 transition-all">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('dashboard.user_management')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.manage_users_desc')}</p>
                </div>
              </Link>
            ) : (
              <Link to="/profile" className="group sm:col-span-2 lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-400 transition-all">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 mb-3 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Users size={20} />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t('nav.profile')}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.view_profile_desc')}</p>
                </div>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: t('dashboard.tickets_in_progress'), value: '14', desc: t('dashboard.tickets_in_progress_desc'), icon: Clock, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
              { title: t('dashboard.tickets_resolved'), value: '29', desc: t('dashboard.tickets_resolved_desc'), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
              { title: t('dashboard.csat_rating'), value: '4.8/5.0', desc: t('dashboard.csat_rating_desc'), icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
              { title: t('dashboard.response_time'), value: '12 Min', desc: t('dashboard.response_time_desc'), icon: Clock, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
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
