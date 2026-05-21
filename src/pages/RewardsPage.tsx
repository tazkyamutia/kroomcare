import React from 'react';
import { Gift, History, Ticket as VoucherIcon, ArrowUpRight, ArrowDownRight, Sparkles, Loader2 } from 'lucide-react';
import { DUMMY_VOUCHERS } from '../utils/dummyData';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

export const RewardsPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  const points = user?.points || 0;

  const fetchPointHistory = async () => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5000/api/points/history/${user.id}`);
      const result = await response.json();
      if (response.ok && result.success) {
        // Ambil maksimal 3 transaksi terakhir untuk panel samping
        setTransactions(result.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to fetch point history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    fetchPointHistory();
  }, [user]);

  const handleRedeem = async (pointsRequired: number, voucherName: string) => {
    if (!user?.id) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }
    if (points < pointsRequired) {
      alert('Poin Anda tidak mencukupi untuk menukarkan voucher ini.');
      return;
    }

    const confirmRedeem = window.confirm(`Apakah Anda yakin ingin menukarkan ${pointsRequired} Poin untuk "${voucherName}"?`);
    if (!confirmRedeem) return;

    try {
      const response = await fetch('http://localhost:5000/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          points_required: pointsRequired,
          keterangan: `Penukaran voucher: ${voucherName}`
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Voucher berhasil ditukarkan!');
        // Update user context points locally
        updateUser({ points: points - pointsRequired });
        fetchPointHistory(); // Segarkan riwayat poin
      } else {
        alert(result.message || 'Gagal menukarkan voucher.');
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Manajemen Poin & Voucher</h1>
        <p className="text-slate-500 mt-1">Kumpulkan poin dari aktivitas Anda dan tukarkan dengan voucher menarik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Points Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-brand-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-brand-100 mb-2">
                <Sparkles size={18} />
                <span className="text-sm font-medium uppercase tracking-wider">Total Poin Anda</span>
              </div>
              <h2 className="text-5xl font-bold mb-6">{points.toLocaleString('id-ID')}</h2>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <p className="text-xs text-brand-100 mb-1">Estimasi Nilai Tukar</p>
                <p className="text-lg font-semibold">Rp {(points * 100).toLocaleString('id-ID')}</p>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-brand-400/20 rounded-full blur-3xl" />
          </div>

          {/* History */}
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold flex items-center gap-2">
                <History size={18} className="text-brand-500" />
                Riwayat Poin
              </h3>
              <button 
                onClick={() => navigate('/points-history')}
                className="text-xs text-brand-600 font-medium hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-brand-600" size={24} />
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        tx.jenis_transaksi === 'masuk' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {tx.jenis_transaksi === 'masuk' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{tx.keterangan}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      tx.jenis_transaksi === 'masuk' ? "text-emerald-600" : "text-red-600"
                    )}>
                      {tx.jenis_transaksi === 'masuk' ? '+' : '-'}{tx.jumlah_poin}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">Belum ada riwayat transaksi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Voucher Store */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <VoucherIcon size={22} className="text-brand-500" />
              Tukarkan Voucher
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {DUMMY_VOUCHERS.map((voucher, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                key={voucher.id}
                className="glass-card rounded-3xl p-6 flex flex-col relative group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                    <Gift size={24} />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-brand-100 text-brand-700 rounded-full">
                    {voucher.discount} OFF
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 mb-1">{voucher.name}</h4>
                <p className="text-xs text-slate-500 mb-6">Berlaku hingga {new Date(voucher.expiryDate).toLocaleDateString('id-ID')}</p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-slate-200">
                  <div className="flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-sm font-bold text-slate-900">{voucher.pointsRequired} Poin</span>
                  </div>
                  <button 
                    onClick={() => handleRedeem(voucher.pointsRequired, voucher.name)}
                    disabled={points < voucher.pointsRequired}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all active:scale-95"
                  >
                    Tukarkan
                  </button>
                </div>

                {/* Decorative cutouts */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white dark:bg-[#0b0f19] rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white dark:bg-[#0b0f19] rounded-full -translate-y-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
