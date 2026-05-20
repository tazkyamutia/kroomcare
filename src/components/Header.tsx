import React from 'react';
import { Sparkles, Bell, User, Settings, LogOut, ChevronDown, Ticket, Gift } from 'lucide-react';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'ticket' | 'point_in' | 'point_out';
  link: string;
}

export const Header: React.FC = () => {
  const { user, logout } = useUser();
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
          fetch(`http://localhost:5000/api/tickets?user_id=${user.id}`),
          fetch(`http://localhost:5000/api/points/history/${user.id}`)
        ]);

        const ticketsData = await ticketsRes.json();
        const pointsData = await pointsRes.json();

        if (ticketsRes.ok && ticketsData.success) {
          ticketsData.data.forEach((ticket: any) => {
            list.push({
              id: `t-create-${ticket.id}`,
              title: 'Tiket Keluhan Dibuat',
              description: `Tiket #${ticket.id} "${ticket.judul}" telah didaftarkan.`,
              time: ticket.created_at,
              type: 'ticket',
              link: '/tickets'
            });

            if (ticket.status === 'selesai') {
              list.push({
                id: `t-solve-${ticket.id}`,
                title: 'Tiket Selesai Diproses',
                description: `Tiket #${ticket.id} "${ticket.judul}" telah diselesaikan.`,
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
                title: 'Reward Koin Masuk',
                description: `Menerima +${tx.jumlah_poin} Poin: ${tx.keterangan}`,
                time: tx.created_at,
                type: 'point_in',
                link: '/points-history'
              });
            } else {
              list.push({
                id: `p-out-${tx.id}`,
                title: 'Penukaran Voucher',
                description: `Menggunakan -${tx.jumlah_poin} Poin untuk voucher: ${tx.keterangan.replace('Penukaran voucher: ', '')}`,
                time: tx.created_at,
                type: 'point_out',
                link: '/rewards'
              });
            }
          });
        }
      } else if (user.role === 'staff') {
        const ticketsRes = await fetch('http://localhost:5000/api/tickets');
        const ticketsData = await ticketsRes.json();
        if (ticketsRes.ok && ticketsData.success) {
          ticketsData.data.forEach((ticket: any) => {
            if (ticket.status === 'menunggu') {
              list.push({
                id: `staff-new-${ticket.id}`,
                title: 'Tiket Baru Masuk',
                description: `Tiket #${ticket.id} "${ticket.judul}" menunggu respon Anda.`,
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
    <header className="flex items-center justify-between mb-8 relative z-50">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-2 lg:hidden">
        <img 
          src="https://i.ibb.co.com/fGPRy8Jt/Gemini-Generated-Image-yss7sryss7sryss7-removebg-preview.png" 
          alt="Logo KroomCare" 
          className="h-10 w-auto object-contain" 
        />
        <span className="text-xl font-display font-bold tracking-tight text-slate-900">KroomCare</span>
      </div>
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        {role === 'customer' && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group cursor-pointer"
            onClick={() => navigate('/points-history')}
          >
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Loyalty</span>
              <span className="text-sm font-bold text-slate-900 leading-none mt-1">🪙 {points.toLocaleString()} <span className="text-slate-500 font-medium">Poin</span></span>
            </div>
          </motion.div>
        )}
        
        {/* Bell Button & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-11 h-11 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-brand-600 transition-all hover:shadow-md relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
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
                  className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                    <span className="text-[10px] font-black uppercase bg-brand-50 text-brand-600 px-2 py-1 rounded-lg">
                      {notifications.length} Info Baru
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
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                            notif.type === 'ticket' ? "bg-blue-50 text-blue-600" :
                            notif.type === 'point_in' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                          )}>
                            {notif.type === 'ticket' ? <Ticket size={16} /> :
                             notif.type === 'point_in' ? <Sparkles size={16} /> : <Gift size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 leading-tight">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-snug break-all">{notif.description}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-medium">
                              {new Date(notif.time).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(notif.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-8">Tidak ada notifikasi baru.</p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Avatar */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl hover:border-brand-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-9 h-9 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-inner overflow-hidden border-2 border-white ring-2 ring-brand-50">
              {avatar ? (
                <img src={avatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <ChevronDown size={14} className={cn("text-slate-400 transition-transform hidden md:block", showDropdown && "rotate-180")} />
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
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="p-4 bg-slate-50/50 rounded-2xl mb-2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-bold overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        userName.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-[140px] leading-tight">{userName}</p>
                      <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-0.5">{role}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-all text-sm font-bold group"
                    >
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <User size={16} />
                      </div>
                      Edit Profil
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 hover:text-brand-600 rounded-xl transition-all text-sm font-bold group">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                        <Settings size={16} />
                      </div>
                      Akun Settings
                    </button>
                    <div className="h-px bg-slate-100 my-2" />
                    <button 
                      onClick={() => { setShowDropdown(false); logout(); }}
                      className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-black uppercase tracking-widest"
                    >
                      <LogOut size={16} />
                      Keluar
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
