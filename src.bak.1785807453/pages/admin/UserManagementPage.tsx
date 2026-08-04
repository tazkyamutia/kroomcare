import React from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, User as UserIcon, Coins, X, ArrowUpRight, ArrowDownLeft, History, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const UserManagementPage = () => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [pointHistory, setPointHistory] = React.useState<any[]>([]);
  const [loadingPoints, setLoadingPoints] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('All');
  const [showToastReset, setShowToastReset] = React.useState(false);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [nama, setNama] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('customer');
  const [points, setPoints] = React.useState('0');
  const [submitting, setSubmitting] = React.useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      const result = await response.json();
      if (response.ok && result.success) {
        setUsers(result.data);
      } else {
        setError(result.message || 'Gagal memuat data pengguna.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi gagal ke server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPointHistory = async (userId: string) => {
    setLoadingPoints(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/points`);
      const result = await response.json();
      if (response.ok && result.success) {
        setPointHistory(result.data);
      } else {
        setPointHistory([]);
      }
    } catch (err) {
      console.error(err);
      setPointHistory([]);
    } finally {
      setLoadingPoints(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenHistory = (user: any) => {
    setSelectedUser(user);
    fetchPointHistory(user.id);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"? Seluruh data tiket, forum, dan riwayat koin miliknya juga akan dibersihkan.`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok && result.success) {
          alert('Pengguna berhasil dihapus.');
          setUsers(prev => prev.filter(u => u.id !== userId));
        } else {
          alert(result.message || 'Gagal menghapus pengguna.');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal terhubung ke server.');
      }
    }
  };

  const handleResetPoints = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/reset-points`, {
        method: 'PUT'
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setShowToastReset(true);
        setTimeout(() => setShowToastReset(false), 3000);
        fetchUsers();
      } else {
        alert(result.message || 'Gagal mengatur ulang poin koin.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !password.trim()) {
      alert('Mohon isi semua data wajib.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama,
          email,
          password,
          role,
          koin_reward: parseInt(points) || 0
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Pengguna baru berhasil ditambahkan!');
        setNama('');
        setEmail('');
        setPassword('');
        setRole('customer');
        setPoints('0');
        setIsAddModalOpen(false);
        fetchUsers();
      } else {
        alert(result.message || 'Gagal menambahkan pengguna.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || 
                        u.role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">Kelola data Customer, Staff, dan Administrator langsung dari Database MySQL.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold shadow-lg"
        >
          <UserPlus size={20} />
          Tambah User Baru
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900">Daftar Pengguna</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {['All', 'Customer', 'Staff', 'Admin'].map(r => (
                <button 
                  key={r} 
                  onClick={() => setSelectedRole(r)}
                  className={cn(
                    "text-[10px] px-3 py-1 rounded-md font-bold transition-all",
                    selectedRole === r 
                      ? "bg-white text-slate-950 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-slate-900" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => handleOpenHistory(u)}
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm overflow-hidden",
                              u.role === 'admin' ? "bg-slate-900 text-white" : 
                              u.role === 'staff' ? "bg-indigo-100 text-indigo-700" : 
                              "bg-slate-100 text-slate-500"
                            )}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : u.role === 'admin' ? (
                              <Shield size={20} />
                            ) : (
                              <UserIcon size={20} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 leading-tight">{u.name}</span>
                            <button 
                              onClick={() => handleOpenHistory(u)}
                              className="text-[10px] text-brand-600 font-bold hover:underline text-left mt-0.5"
                            >
                              Lihat Profil
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider",
                          u.role === 'admin' ? "bg-slate-900 text-white" : 
                          u.role === 'staff' ? "bg-indigo-100 text-indigo-700" : 
                          "bg-slate-100 text-slate-500"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Coins size={14} className="text-amber-500" />
                          {u.points}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenHistory(u)}
                            className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider"
                          >
                            History
                          </button>
                          {u.role === 'customer' && (
                            <button 
                              onClick={() => handleResetPoints(u.id)}
                              className="p-2 hover:bg-blue-50 text-blue-500 hover:text-blue-600 rounded-lg transition-all btn_reset_points_user"
                              title="Reset Points"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                            title="Hapus Pengguna"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-sm font-medium">
                      Pengguna tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-slate-900">Tambah Pengguna Baru</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <input 
                    required
                    type="text"
                    placeholder="Nama Lengkap"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alamat Email</label>
                  <input 
                    required
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input 
                    required
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
                  >
                    <option value="customer">Customer (Member)</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Koin Reward Awal</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20 text-sm"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-75 transition-all shadow-lg flex items-center justify-center gap-2 text-sm mt-6"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Simpan Pengguna
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
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
                      +{pointHistory.filter(tx => tx.type === 'Earned').reduce((acc, curr) => acc + curr.amount, 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Total Poin Keluar</p>
                    <p className="text-3xl font-display font-bold text-red-700">
                      -{pointHistory.filter(tx => tx.type === 'Spent').reduce((acc, curr) => acc + curr.amount, 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Log Transaksi Terbaru</h4>
                  {loadingPoints ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-slate-900" size={24} />
                    </div>
                  ) : pointHistory.length > 0 ? (
                    pointHistory.map(tx => (
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
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Toast Reset Points Success */}
      {showToastReset && (
        <div 
          id="toast_reset_success"
          className="toast_reset_success fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 z-50 animate-bounce"
        >
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="text-xs font-bold">Poin loyalitas koin customer berhasil direset ke angka 0</span>
        </div>
      )}
    </div>
  );
};
