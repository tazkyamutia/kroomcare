import React from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, User as UserIcon, Coins, X, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { DUMMY_USERS, DUMMY_TRANSACTIONS } from '../../utils/dummyData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { User, PointTransaction } from '../../types';

export const UserManagementPage = () => {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const getUserPointHistory = (userId: string) => {
    return DUMMY_TRANSACTIONS.filter(tx => tx.userId === userId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Kelola data Customer, Staff, dan Administrator.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium shadow-lg">
          <UserPlus size={20} />
          Tambah User Baru
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold">Daftar Pengguna</h3>
            <div className="flex gap-2">
              {['All', 'Customer', 'Staff', 'Admin'].map(role => (
                <button key={role} className="text-[10px] px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-500 hover:bg-brand-50 hover:text-brand-600 transition-all">
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari user..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DUMMY_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setSelectedUser(u)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm",
                          u.role === 'admin' ? "bg-slate-900 text-white" : 
                          u.role === 'staff' ? "bg-brand-100 text-brand-700" : 
                          "bg-slate-100 text-slate-500"
                        )}
                      >
                        {u.role === 'admin' ? <Shield size={20} /> : <UserIcon size={20} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 leading-tight">{u.name}</span>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="text-[10px] text-brand-600 font-bold hover:underline text-left"
                        >
                          Lihat Profil
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                      u.role === 'admin' ? "bg-slate-900 text-white" : 
                      u.role === 'staff' ? "bg-brand-100 text-brand-700" : 
                      "bg-slate-100 text-slate-500"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Coins size={14} className="text-amber-500" />
                      {u.points || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => setSelectedUser(u)}
                        className="p-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-all font-bold text-[10px] uppercase"
                      >
                        History
                      </button>
                      <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Point History Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Coins size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-slate-900">Riwayat Poin Detail</h3>
                    <p className="text-sm font-medium text-slate-500">{selectedUser.name} ({selectedUser.email})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Poin Masuk</p>
                    <p className="text-3xl font-display font-bold text-emerald-700">
                      +{getUserPointHistory(selectedUser.id).filter(tx => tx.type === 'Earned').reduce((acc, curr) => acc + curr.amount, 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Total Poin Keluar</p>
                    <p className="text-3xl font-display font-bold text-red-700">
                      -{getUserPointHistory(selectedUser.id).filter(tx => tx.type === 'Spent').reduce((acc, curr) => acc + curr.amount, 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Log Transaksi Terbaru</h4>
                  {getUserPointHistory(selectedUser.id).length > 0 ? (
                    getUserPointHistory(selectedUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-brand-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            tx.type === 'Earned' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                          )}>
                            {tx.type === 'Earned' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "text-base font-black font-display",
                          tx.type === 'Earned' ? "text-emerald-600" : "text-red-600"
                        )}>
                          {tx.type === 'Earned' ? '+' : '-'}{tx.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 flex flex-col items-center text-center opacity-40">
                      <History className="w-12 h-12 mb-4" />
                      <p className="text-sm font-bold">Belum ada riwayat transaksi poin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

