import React from 'react';
import { History, ArrowUpCircle, ArrowDownCircle, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useUser } from '../../context/UserContext';

export const PointHistoryPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (!user?.id) return;

    const fetchPointHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/points/history/${user.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setTransactions(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch point history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPointHistory();
  }, [user]);

  // Hitung total poin secara dinamis
  const totalEarned = transactions
    .filter(tx => tx.jenis_transaksi === 'masuk')
    .reduce((acc, tx) => acc + tx.jumlah_poin, 0);

  const totalSpent = transactions
    .filter(tx => tx.jenis_transaksi === 'keluar')
    .reduce((acc, tx) => acc + tx.jumlah_poin, 0);

  const filteredTransactions = transactions.filter(tx =>
    tx.keterangan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Riwayat Poin</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau perolehan dan penggunaan poin loyalitas Anda.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowUpCircle size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Poin Masuk</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">+{totalEarned.toLocaleString('id-ID')} Poin</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <ArrowDownCircle size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Poin Keluar</p>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">-{totalSpent.toLocaleString('id-ID')} Poin</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <History size={18} className="text-blue-600 dark:text-blue-400" />
            Daftar Transaksi
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 sm:px-5">ID Transaksi</th>
                  <th className="px-4 py-3 sm:px-5">Keterangan</th>
                  <th className="px-4 py-3 sm:px-5">Tanggal</th>
                  <th className="px-4 py-3 sm:px-5">Tipe</th>
                  <th className="px-4 py-3 sm:px-5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    key={tx.id} 
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs sm:text-sm"
                  >
                    <td className="px-4 py-3 sm:px-5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">TX-{tx.id}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{tx.keterangan}</p>
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-slate-500 dark:text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                        tx.jenis_transaksi === 'masuk' ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                      )}>
                        {tx.jenis_transaksi === 'masuk' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className={cn(
                      "px-4 py-3 sm:px-5 text-right font-semibold",
                      tx.jenis_transaksi === 'masuk' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {tx.jenis_transaksi === 'masuk' ? '+' : '-'}{tx.jumlah_poin} Poin
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Belum ada riwayat transaksi poin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
