import React from 'react';
import { Sparkles, Bell, User, Settings, LogOut, ChevronDown, Ticket, Gift, Sun, Moon, Star, Menu } from 'lucide-react';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { withAuthToken } from '../utils/fetchAuth';

interface AppNotification {
  id: string | number;
  title: string;
  description: string;
  time: string;
  type: string;
  link: string;
  is_read?: boolean;
}

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isEmbedded?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen = true, isEmbedded = false }) => {
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
      const res = await fetch(`/api/notifications?_t=${Date.now()}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const mapped: AppNotification[] = result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.message || item.pesan || '',
            time: item.created_at,
            type: item.type || 'ticket',
            link: item.link || '/tickets',
            is_read: Boolean(item.is_read)
          }));
          setNotifications(mapped);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real-time notifications:', error);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchNotifications();

    // 1. Subscribe ke Real-time Stream Staff Channel (presence-staff-notifications)
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let fallbackInterval: any = null;
    let retryDelay = 1000;
    let isConnected = false;

    const startFallbackPolling = () => {
      if (!fallbackInterval) {
        fallbackInterval = setInterval(fetchNotifications, 5000);
      }
    };

    const stopFallbackPolling = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    const connectSSE = () => {
      try {
        eventSource = new EventSource(withAuthToken('/api/realtime/staff'));

        eventSource.addEventListener('connected', () => {
          isConnected = true;
          retryDelay = 1000;
          stopFallbackPolling();
        });

        // Event: Tiket Baru Dibuat dari Kroombox Panel atau Customer
        eventSource.addEventListener('TicketCreated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            const newNotif: AppNotification = {
              id: Date.now(),
              title: `Tiket Baru #${data.ticket_id}`,
              description: `Tiket #${data.ticket_id} (${data.category || 'General'}) dari ${data.customer_name}: "${data.subject || data.title}"`,
              time: data.timestamp || data.created_at || new Date().toISOString(),
              type: 'ticket',
              link: data.link || `/tickets/${data.ticket_id}`,
              is_read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
          } catch (parseErr) {
            console.warn('[Header SSE] Parse TicketCreated error:', parseErr);
          }
        });

        // Event: Balasan Chat Baru Masuk
        eventSource.addEventListener('MessageSent', () => {
          fetchNotifications();
        });

        eventSource.onerror = () => {
          isConnected = false;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Mulai fallback polling (interval 5 detik) saat koneksi putus
          startFallbackPolling();

          // Auto-reconnect dengan exponential backoff (1s, 2s, 4s, maks 15s)
          reconnectTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 15000);
            connectSSE();
          }, retryDelay);
        };
      } catch (err) {
        startFallbackPolling();
      }
    };

    // Channel realtime staf hanya untuk staff/admin; pelanggan cukup memeriksa notifikasinya berkala.
    const isStaffViewer = user?.role === 'staff' || user?.role === 'admin';
    if (isStaffViewer) {
      connectSSE();
    } else if (!fallbackInterval) {
      fallbackInterval = setInterval(fetchNotifications, 15000);
    }

    // Cleanup: unsubscribe & clear timers saat unmount
    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      stopFallbackPolling();
    };
  }, [fetchNotifications, user?.role]);

  const unreadCount = React.useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!user?.id) return;
    setShowNotifications(false);
    if (!notif.is_read) {
      try {
        fetch(`/api/notifications/${notif.id}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    navigate(notif.link);
  };

  if (!user) return null;

  const { role, name: userName, points = 0, avatar } = user;

  const renderNotificationBell = (isSm: boolean = false) => (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className={cn(
          "flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-all relative backdrop-blur-sm cursor-pointer",
          isSm 
            ? "w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-blue-300 dark:hover:border-blue-500/30" 
            : "w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5 rounded-xl shadow-xs hover:border-slate-300 dark:hover:border-white/15 dark:hover:bg-slate-900/80"
        )}
        aria-label="Notifikasi"
        title="Notifikasi"
      >
        <Bell size={isSm ? 13 : 17} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-pulse",
            isSm 
              ? "-top-1 -right-1 min-w-[15px] h-[15px] text-[9px] px-0.5" 
              : "-top-1 -right-1 min-w-[18px] h-[18px] text-[10px] px-1 border-2"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
              className={cn(
                "absolute right-0 mt-2 bg-white dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-3 z-50 overflow-hidden",
                isSm ? "w-72 sm:w-80" : "w-80 sm:w-96"
              )}
            >
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-white/5 mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {language === 'en' ? 'Mark all read' : 'Tandai semua dibaca'}
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto space-y-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer",
                        !notif.is_read 
                          ? "bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/60 dark:hover:bg-blue-950/60" 
                          : "hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        notif.type === 'ticket' || notif.type === 'ticket_reply' ? "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" :
                        notif.type === 'point_in' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                      )}>
                        {notif.type === 'ticket' || notif.type === 'ticket_reply' ? <Ticket size={14} /> :
                         notif.type === 'point_in' ? <Sparkles size={14} /> : <Gift size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={cn(
                            "text-xs leading-tight truncate",
                            !notif.is_read ? "font-bold text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"
                          )}>
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug break-words line-clamp-2">{notif.description}</p>
                        <p className="text-[9px] text-slate-400 mt-1 font-medium">
                          {new Date(notif.time).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date(notif.time).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short' })}
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
  );

  if (isEmbeddedEffective) {
    return (
      <header className="flex items-center justify-between gap-2 mb-2 sm:mb-3 relative z-20 bg-transparent border-none">
        {/* Subtle integration breadcrumb badge */}
        <div className="flex items-center gap-1.5 select-none text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="hidden xs:inline">Support Center</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[150px] sm:max-w-none">
            {userName}
          </span>
        </div>

        {/* Compact Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {(role === 'customer' || (role as string) === 'member') && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-500/30 transition-all cursor-pointer backdrop-blur-xs"
              onClick={() => navigate('/points-history')}
              title="Klik untuk melihat poin loyalitas"
            >
              <Star size={11} className="fill-amber-400 text-amber-500" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                {(points || 75).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{t('header.pts')}</span>
              </span>
            </motion.div>
          )}

          {renderNotificationBell(true)}
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6 relative z-30 bg-transparent border-none shadow-none">
      {/* Brand Logo & Name & Toggle Button (Mobile Only) */}
      <div className="flex lg:hidden items-center gap-2 sm:gap-2.5 shrink-0">
        <button 
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.08] rounded-xl shadow-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          title={isSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
          aria-label="Toggle navigation menu"
        >
          <Menu size={17} />
        </button>

        <div className="flex items-center gap-2 select-none">
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

        {renderNotificationBell(false)}

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

        {/* Theme Quick Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-slate-900/50 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 hover:border-blue-200 dark:hover:border-white/15 dark:hover:bg-slate-900/80 transition-all shadow-xs backdrop-blur-sm cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>

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
