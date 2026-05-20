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

export const Sidebar: React.FC = () => {
  const { user, logout: onLogout } = useUser();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const { role, name: userName, avatar } = user;

  const getNavItems = () => {
    switch (role) {
      case 'customer':
        return [
          { name: 'Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Forum Komunitas', path: '/forum', icon: MessageSquare },
          { name: 'Tiket Saya', path: '/tickets', icon: Ticket },
          { name: 'Rewards', path: '/rewards', icon: Gift },
          { name: 'Riwayat Poin', path: '/points-history', icon: History },
          { name: 'Profil', path: '/profile', icon: User },
        ];
      case 'staff':
        return [
          { name: 'Staff Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Forum Komunitas', path: '/forum', icon: MessageSquare },
          { name: 'Antrean Keluhan', path: '/staff', icon: Ticket },
          { name: 'Profil', path: '/profile', icon: User },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', path: '/', icon: LayoutDashboard },
          { name: 'Forum Komunitas', path: '/forum', icon: MessageSquare },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Ticket Settings', path: '/admin/tickets', icon: Settings },
          { name: 'Profil', path: '/profile', icon: User },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <img 
                src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
                alt="Logo KroomCare" 
                className="h-20 w-auto object-contain" 
              />
              <span className="text-2xl font-display font-bold tracking-tight text-slate-900">KroomCare</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-brand-50 text-brand-600 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  "group-hover:text-brand-500"
                )} />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium overflow-hidden",
                role === 'admin' ? "bg-slate-900 text-white" : "bg-brand-100 text-brand-700"
              )}>
                {avatar ? (
                  <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  userName.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
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
