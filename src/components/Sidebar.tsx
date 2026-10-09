import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Ticket, Gift, MessageSquare, ShieldCheck, 
  Menu, X, LogOut, Settings, Users, ShieldAlert, History, User,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  isEmbedded?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onToggle: controlledOnToggle,
  isEmbedded = false
}) => {
  const { user, logout: onLogout } = useUser();
  const { t } = useLanguageTheme();
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = React.useCallback(() => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else if (controlledOnClose) {
      if (isOpen) {
        controlledOnClose();
      } else {
        setInternalIsOpen(true);
      }
    } else {
      setInternalIsOpen(prev => !prev);
    }
  }, [controlledOnToggle, controlledOnClose, isOpen]);

  const closeSidebar = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Shortcut Ctrl+B / Cmd+B untuk toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle]);

  if (!user) return null;

  const { role, name: userName, avatar } = user;

  const getNavItems = () => {
    switch (role) {
      case 'customer':
      case 'member' as any:
        return [
          { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
          { name: t('nav.forum'), path: '/forum', icon: MessageSquare },
          { name: t('nav.my_tickets'), path: '/tickets', icon: Ticket },
          { name: t('nav.rewards'), path: '/rewards', icon: Gift },
          { name: t('nav.points_history'), path: '/points-history', icon: History },
          { name: t('nav.profile'), path: '/profile', icon: User },
          { name: t('nav.settings'), path: '/settings', icon: Settings },
        ];
      case 'staff':
        return [
          { name: t('nav.staff_dashboard'), path: '/', icon: LayoutDashboard },
          { name: t('nav.forum'), path: '/forum', icon: MessageSquare },
          { name: t('nav.ticket_queue'), path: '/staff', icon: Ticket },
          { name: t('nav.profile'), path: '/profile', icon: User },
          { name: t('nav.settings'), path: '/settings', icon: Settings },
        ];
      case 'admin':
        return [
          { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
          { name: t('nav.forum'), path: '/forum', icon: MessageSquare },
          { name: t('nav.user_management'), path: '/admin/users', icon: Users },
          { name: t('nav.ticket_settings'), path: '/admin/tickets', icon: Settings },
          { name: t('nav.api_integration'), path: '/admin/api', icon: ShieldCheck },
          { name: t('nav.profile'), path: '/profile', icon: User },
          { name: t('nav.settings'), path: '/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && (window.innerWidth < 1024 || isEmbedded)) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Standalone Mobile Toggle (only rendered when not controlled via Header) */}
      {controlledIsOpen === undefined && (
        <button 
          onClick={() => setInternalIsOpen(!internalIsOpen)}
          className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.06] rounded-xl shadow-xs text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] backdrop-blur-sm"
        >
          {internalIsOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#0b0f19] border-r border-slate-200/60 dark:border-white/[0.04] transition-all duration-300 ease-in-out shadow-xl",
        isOpen ? "w-60 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-16"
      )}>
        {/* Edge Toggle Button (Collapse / Expand) - Circular button on border seam */}
        {!isEmbedded && (
          <button 
            type="button"
            onClick={handleToggle}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-white/10 rounded-full items-center justify-center shadow-xs hover:shadow-md hover:scale-110 active:scale-95 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer group"
            title={isOpen ? "Sembunyikan Sidebar (Ctrl+B)" : "Tampilkan Sidebar (Ctrl+B)"}
            aria-label={isOpen ? "Sembunyikan sidebar" : "Tampilkan sidebar"}
          >
            {isOpen ? (
              <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white" />
            ) : (
              <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white" />
            )}
          </button>
        )}

        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className={cn(
            "py-4 border-b border-slate-100 dark:border-transparent flex items-center transition-all duration-300",
            isOpen ? "px-5 justify-between" : "px-2 justify-center"
          )}>
            <div className={cn("flex items-center min-w-0", isOpen ? "gap-2.5" : "justify-center")}>
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="KroomCare Logo" 
                className="h-8 w-8 object-contain shrink-0" 
              />
              {isOpen && (
                <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white truncate">
                  KroomCare
                </span>
              )}
            </div>
            {isOpen && (
              <button 
                onClick={closeSidebar}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Sembunyikan Sidebar"
                aria-label="Sembunyikan sidebar"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <nav className={cn(
            "flex-1 py-3 space-y-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
            isOpen ? "px-3" : "px-2"
          )}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={!isOpen ? item.name : undefined}
                className={({ isActive }) => cn(
                  "flex items-center rounded-xl transition-all duration-200 text-xs sm:text-sm font-medium group relative",
                  isOpen ? "gap-2.5 px-3 py-2" : "justify-center p-2.5",
                  isActive 
                    ? "bg-blue-50/80 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100/60 dark:border-blue-500/25 shadow-xs dark:shadow-[0_0_12px_rgba(59,130,246,0.12)]" 
                    : "text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon size={19} className={cn(
                  "transition-colors shrink-0",
                  "group-hover:text-blue-500 dark:group-hover:text-blue-400"
                )} />
                {isOpen && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className={cn(
            "border-t border-slate-100 dark:border-transparent transition-all duration-300",
            isOpen ? "p-3" : "p-2"
          )}>
            {isOpen ? (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04]">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden",
                  role === 'admin' ? "bg-slate-900 text-white" : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                )}>
                  {avatar ? (
                    <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                  title={t('header.logout')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-1">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden",
                    role === 'admin' ? "bg-slate-900 text-white" : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                  )}
                  title={`${userName} (${role})`}
                >
                  {avatar ? (
                    <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userName.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                  title={t('header.logout')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className={cn("fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40", !isEmbedded && "lg:hidden")}
          />
        )}
      </AnimatePresence>
    </>
  );
};
