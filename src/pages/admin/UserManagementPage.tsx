import React from 'react';
import { UserPlus, Search, Trash2, Shield, User as UserIcon, Coins, X, ArrowUpRight, ArrowDownLeft, History, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export const UserManagementPage = () => {
  const { t, language } = useLanguageTheme();
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
      const response = await fetch('/api/admin/users');
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
      const response = await fetch(`/api/admin/users/${userId}/points`);
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
        const response = await fetch(`/api/admin/users/${userId}`, {
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
      const response = await fetch(`/api/admin/users/${userId}/reset-points`, {
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
      const response = await fetch('/api/admin/users', {
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
    const matchesSearch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'All' || 
                        (u.role || '').toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('admin_users.title')}</h1>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs self-start sm:self-auto transition-colors"
        >
          <UserPlus size={16} />
          {t('admin_users.add_user')}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {['All', 'Customer', 'Staff', 'Admin'].map(r => (
              <button 
                key={r} 
                onClick={() => setSelectedRole(r)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap",
                  selectedRole === r 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {r === 'All' ? t('admin_users.filter_all') : r}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder={t('admin_users.search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 text-xs sm:text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 sm:px-5">{t('admin_users.col_user')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_users.col_role')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_users.col_points')}</th>
                  <th className="px-4 py-3 sm:px-5">Email</th>
                  <th className="px-4 py-3 sm:px-5 text-right">{t('admin_users.col_action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs sm:text-sm">
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div 
                            onClick={() => handleOpenHistory(u)}
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden shrink-0",
                              u.role === 'admin' ? "bg-slate-900 text-white dark:bg-slate-800" : 
                              u.role === 'staff' ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" : 
                              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            )}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : u.role === 'admin' ? (
                              <Shield size={16} />
                            ) : (
                              <UserIcon size={16} />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white leading-snug truncate">{u.name}</span>
                            <button 
                              onClick={() => handleOpenHistory(u)}
                              className="text-[10px] text-blue-600 dark:text-blue-400 font-medium hover:underline text-left"
                            >
                              {t('admin_users.history_points')}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                          u.role === 'admin' ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" : 
                          u.role === 'staff' ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800" : 
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Coins size={13} className="text-amber-500" />
                          {u.points}
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5 text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenHistory(u)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/60 rounded-lg transition-colors font-semibold text-[11px]"
                          >
                            {t('admin_users.history_points')}
                          </button>
                          {u.role === 'customer' && (
                            <button 
                              onClick={() => handleResetPoints(u.id)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 rounded-lg transition-colors btn_reset_points_user"
                              title={t('admin_users.reset_points')}
                            >
                              <RefreshCw size={13} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title={t('admin_users.delete_user')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                      {language === 'en' ? 'No users found.' : 'Pengguna tidak ditemukan.'}
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{t('admin_users.modal_add_title')}</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin_users.modal_fullname')}</label>
                  <input 
                    required
                    type="text"
                    placeholder={t('admin_users.modal_fullname')}
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin_users.modal_email')}</label>
                  <input 
                    required
                    type="email"
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin_users.modal_password')}</label>
                  <input 
                    required
                    type="password"
                    placeholder={t('admin_users.modal_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin_users.modal_role')}</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  >
                    <option value="customer">Customer (Member)</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('admin_users.modal_initial_points')}</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm mt-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {t('admin_users.saving')}
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      {t('admin_users.save')}
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {language === 'en' ? 'Detailed Points History' : 'Riwayat Poin Detail'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.name} ({selectedUser.email})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-0.5">
                      {language === 'en' ? 'Points In' : 'Poin Masuk'}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      +{pointHistory.filter(tx => tx.type === 'Earned').reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/30 p-3.5 rounded-xl border border-red-100 dark:border-red-900">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400 mb-0.5">
                      {language === 'en' ? 'Points Out' : 'Poin Keluar'}
                    </p>
                    <p className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-300">
                      -{pointHistory.filter(tx => tx.type === 'Spent').reduce((acc, curr) => acc + (curr.amount || 0), 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {language === 'en' ? 'Transaction Log' : 'Log Transaksi'}
                  </h4>
                  {loadingPoints ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin text-blue-600" size={20} />
                    </div>
                  ) : pointHistory.length > 0 ? (
                    pointHistory.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            tx.type === 'Earned' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                          )}>
                            {tx.type === 'Earned' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{tx.description}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(tx.date).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "font-semibold",
                          tx.type === 'Earned' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        )}>
                          {tx.type === 'Earned' ? '+' : '-'}{tx.amount}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 flex flex-col items-center text-center text-slate-400">
                      <History className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-xs">{language === 'en' ? 'No points transaction history yet' : 'Belum ada riwayat transaksi poin'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  {language === 'en' ? 'Close' : 'Tutup'}
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
          className="toast_reset_success fixed bottom-20 right-6 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 z-50 text-xs font-semibold animate-bounce"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{language === 'en' ? 'Customer points reset to 0' : 'Poin customer berhasil direset ke 0'}</span>
        </div>
      )}
    </div>
  );
};
