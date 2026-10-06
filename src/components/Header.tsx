import React from 'react';
import { Sparkles, Bell, User, Settings, LogOut, ChevronDown, Ticket, Gift, Sun, Moon, Star, Menu } from 'lucide-react';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'ticket' | 'point_in' | 'point_out';
  link: string;
}

interface HeaderProps {
  onToggleSidebar?: () => void;
  isEmbedded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isEmbedded = false }) => {
  const isEmbeddedEffective = isEmbedded || (typeof window !== 'undefined' && window.parent && window.parent !== window);
  const { user, logout } = useUser();
  const { theme, toggleTheme, language, toggleLanguage, t } = useLanguageTheme();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const navigate = useNavigate();

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      const list: AppNotification[] = [];

      if (user.role === 'customer') {
        const [ticketsRes, pointsRes] = await Promise.all([
          fetch(`/api/tickets?user_id=${user.id}`),
          fetch(`/api/points/history/${user.id}`)
        ]);

        const ticketsData = await ticketsRes.json();
        const pointsData = await pointsRes.json();

        if (ticketsRes.ok && ticketsData.success) {
          ticketsData.data.forEach((ticket: any) => {
            list.push({
              id: `t-create-${ticket.id}`,
              title: 'Complaint Ticket Created',
              description: `Ticket #${ticket.id} "${ticket.judul}" has been registered.`,
              time: ticket.created_at,
              type: 'ticket',
              link: '/tickets'
            });

            if (ticket.status === 'selesai') {
              list.push({
                id: `t-solve-${ticket.id}`,
                title: 'Ticket Resolved',
                description: `Ticket #${ticket.id} "${ticket.judul}" has been resolved.`,
                time: ticket.updated_at || ticket.created_at,
                type: 'ticket',
                link: '/tickets'
              });
            }
          });
        }

        if (pointsRes.ok && pointsData.success) {
          pointsData.data.forEach((tx: any) => {
            if (tx.jenis_transaksi === 'masuk') {
              list.push({
                id: `p-in-${tx.id}`,
                title: 'Coin Reward Received',
                description: `Received +${tx.jumlah_poin} Points: ${tx.keterangan}`,
                time: tx.created_at,
                type: 'point_in',
                link: '/points-history'
              });
            } else {
              list.push({
                id: `p-out-${tx.id}`,
                title: 'Voucher Redeemed',
                description: `Used -${tx.jumlah_poin} Points for voucher: ${tx.keterangan.replace('Penukaran voucher: ', '')}`,
                time: tx.created_at,
                type: 'point_out',
                link: '/rewards'
              });
            }
          });
        }
      } else if (user.role === 'staff') {
        const ticketsRes = await fetch('/api/tickets');
        const ticketsData = await ticketsRes.json();
        if (ticketsRes.ok && ticketsData.success) {
          ticketsData.data.forEach((ticket: any) => {
            if (ticket.status === 'menunggu') {
              list.push({
                id: `staff-new-${ticket.id}`,
                title: 'New Ticket Received',
                description: `Ticket #${ticket.id} "${ticket.judul}" is awaiting your response.`,
                time: ticket.created_at,
                type: 'ticket',
                link: '/staff'
              });
            }
          });
        }
      }

      list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(list.slice(0, 5));
    } catch (error) {
      console.error('Failed to construct notifications:', error);
    }
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();

    // Polling notifikasi setiap 10 detik agar terasa real-time
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  if (!user) return null;

  const { role, name: userName, points = 0, avatar } = user;

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 relative z-30 bg-transparent border-none shadow-none">
      {/* Brand Logo & Name & Toggle Button */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button 
          onClick={onToggleSidebar}
          className={cn(
            "p-1.5 sm:p-2 bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.08] rounded-xl shadow-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0",
            !isEmbedded && "lg:hidden"
          )}
          title="Menu Navigasi"
          aria-label="Toggle navigation menu"
        >
          <Menu size={17} />
        </button>

        <div className={cn("flex items-center gap-2 select-none", !isEmbedded && "lg:hidden")}>
          <img 
            src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
            alt="Logo KroomCare" 
            className="h-7 sm:h-8 w-auto object-contain" 
          />
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-800 dark:text-white truncate">KroomCare</span>
        </div>
      </div>

      <div className="flex-1 min-w-0" />
      
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {(role === 'customer' || (role as string) === 'member') && (
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/60 dark:border-white/5 shadow-xs transition-all hover:border-blue-300 dark:hover:border-white/15 dark:hover:bg-slate-900/80 group cursor-pointer backdrop-blur-sm shrink-0"
            onClick={() => navigate('/points-history')}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-50 dark:bg-amber-950/40 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
              <Star size={12} className="fill-amber-400 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="hidden md:block text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">{t('header.loyalty')}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none sm:mt-0.5">{(points || 75).toLocaleString()} <span className="text-slate-400 font-medium">{t('header.pts')}</span></span>
            </div>
          </motion.div>
        )}
        
        {/* Bell Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white dark:hover:border-white/15 dark:hover:bg-slate-900/80 transition-all shadow-xs relative backdrop-blur-sm"
          >
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-transparent z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xl p-3 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-white/5 mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{t('header.notifications')}</h3>
                    <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                      {notifications.length} {t('header.info')}
                    </span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-1">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false);
                            navigate(notif.link);
                          }}
                          className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                            notif.type === 'ticket' ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" :
                            notif.type === 'point_in' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                          )}>
                            {notif.type === 'ticket' ? <Ticket size={14} /> :
                             notif.type === 'point_in' ? <Sparkles size={14} /> : <Gift size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug break-all">{notif.description}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium">
                              {new Date(notif.time).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date(notif.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">{t('header.no_notifications')}</p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Language Quick Toggle (Pill model with flag & code) - Hidden in Support Center / Embedded panel */}
        {!isEmbeddedEffective && (
          <button
            onClick={toggleLanguage}
            title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-full border border-blue-500 hover:border-blue-600 dark:border-blue-400/90 bg-white dark:bg-slate-900/90 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer select-none"
          >
            {language === 'id' ? (
              <span className="inline-flex w-4 h-2.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 flex-col">
                <span className="h-1/2 bg-[#e00000] w-full" />
                <span className="h-1/2 bg-white w-full" />
              </span>
            ) : (
              <span className="inline-flex w-4 h-2.5 rounded-[2px] overflow-hidden shadow-2xs border border-slate-300/80 dark:border-white/20 shrink-0 relative bg-[#012169]">
                <svg viewBox="0 0 60 30" className="w-full h-full object-cover">
                  <clipPath id="uk-flag-header">
                    <path d="M0,0 v30 h60 v-30 z"/>
                  </clipPath>
                  <clipPath id="uk-diag-header">
                    <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                  </clipPath>
                  <g clipPath="url(#uk-flag-header)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-header)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                  </g>
                </svg>
              </span>
            )}
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
              {language === 'id' ? 'ID' : 'EN'}
            </span>
          </button>
        )}

        {/* Theme Quick Toggle - Hidden in Support Center / Embedded panel */}
        {!isEmbeddedEffective && (
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 hover:border-blue-200 dark:hover:border-white/15 dark:hover:bg-slate-900/80 transition-all shadow-xs backdrop-blur-sm cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        )}

        {/* Interactive Avatar */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-xl hover:border-slate-300 dark:hover:border-white/15 dark:hover:bg-slate-900/80 transition-all shadow-xs backdrop-blur-sm"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <ChevronDown size={13} className={cn("text-slate-400 transition-transform hidden sm:block", showDropdown && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-transparent z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 z-50 overflow-hidden"
                >
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-1.5 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/60 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        userName.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{userName}</p>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">{role}</p>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <button 
                      onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-all text-xs font-medium"
                    >
                      <User size={14} className="text-slate-400" />
                      {t('header.edit_profile')}
                    </button>
                    <button 
                      onClick={() => { setShowDropdown(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg transition-all text-xs font-medium"
                    >
                      <Settings size={14} className="text-slate-400" />
                      {t('header.account_settings')}
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                    <button 
                      onClick={() => { setShowDropdown(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all text-xs font-semibold"
                    >
                      <LogOut size={14} />
                      {t('header.logout')}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
