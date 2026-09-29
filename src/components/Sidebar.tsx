import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Ticket, Gift, MessageSquare, ShieldCheck, 
  Menu, X, LogOut, Settings, Users, ShieldAlert, History, User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';

import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const Sidebar: React.FC = () => {
  const { user, logout: onLogout } = useUser();
  const { t } = useLanguageTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const { role, name: userName, avatar } = user;

  const getNavItems = () => {
    switch (role) {
      case 'customer':
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
          { name: 'Integrasi API', path: '/admin/api', icon: ShieldCheck },
          { name: t('nav.profile'), path: '/profile', icon: User },
          { name: t('nav.settings'), path: '/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs text-slate-700 dark:text-white hover:bg-slate-50"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-60 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xs",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="KroomCare Logo" 
                className="h-8 w-auto object-contain" 
              />
              <span className="text-base font-bold tracking-tight text-slate-800 dark:text-white">KroomCare</span>
            </div>
            {isOpen && (
              <button 
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 text-xs sm:text-sm font-medium",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors shrink-0",
                  "group-hover:text-blue-500 dark:group-hover:text-blue-400"
                )} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden",
                role === 'admin' ? "bg-slate-900 text-white" : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
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
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
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
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};
