import React from 'react';
import { History, ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { DUMMY_TRANSACTIONS } from '../../utils/dummyData';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const PointHistoryPage = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Riwayat Poin</h1>
        <p className="text-slate-500 mt-1">Pantau perolehan dan penggunaan poin loyalitas Anda.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Poin Masuk</p>
            <p className="text-2xl font-bold text-slate-900">+1,250 Poin</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Poin Keluar</p>
            <p className="text-2xl font-bold text-slate-900">-400 Poin</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <History size={20} className="text-brand-600" />
            Daftar Transaksi
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm w-full sm:w-64"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DUMMY_TRANSACTIONS.map((tx, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={tx.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600">{tx.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase",
                      tx.type === 'Earned' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {tx.type === 'Earned' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-right font-bold",
                    tx.type === 'Earned' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {tx.type === 'Earned' ? '+' : '-'}{tx.amount} Poin
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
