import React from 'react';
import { Gift, History, Ticket as VoucherIcon, ArrowUpRight, ArrowDownRight, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
  const [redeemedCode, setRedeemedCode] = React.useState('');
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  const points = user?.points || 0;

  const fetchPointHistory = async () => {
    if (!user?.id) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/points/history/${user.id}`);
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

  const handleRedeem = (pointsRequired: number, voucherName: string) => {
    if (!user?.id) {
      setToastMessage('Anda harus login terlebih dahulu.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    if (points < pointsRequired) {
      setToastMessage('Koin tidak mencukupi.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setSelectedVoucher({ pointsRequired, name: voucherName });
    setShowConfirmModal(true);
  };

  const executeRedeem = async () => {
    if (!selectedVoucher || !user?.id) return;
    setShowConfirmModal(false);

    try {
      const response = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          points_required: selectedVoucher.pointsRequired,
          keterangan: `Penukaran voucher: ${selectedVoucher.name}`
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const randCode = 'KRM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        setRedeemedCode(randCode);
        setToastMessage('Voucher berhasil ditukarkan!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        // Update user context points locally
        updateUser({ points: points - selectedVoucher.pointsRequired });
        fetchPointHistory(); // Segarkan riwayat poin
      } else {
        setToastMessage(result.message || 'Gagal menukarkan voucher.');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      setToastMessage('Terjadi kesalahan koneksi.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Manajemen Poin & Voucher</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Kumpulkan poin dari aktivitas Anda dan tukarkan dengan voucher menarik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Points Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-sky-600 rounded-xl p-5 text-white relative overflow-hidden shadow-xs">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-blue-100 mb-1">
                <Sparkles size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Poin Anda</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 tracking-tight">{points.toLocaleString('id-ID')} <span className="text-xs font-normal text-blue-100">pts</span></h2>
              <div className="p-3 bg-white/10 rounded-lg backdrop-blur-xs border border-white/15">
                <p className="text-[10px] text-blue-100 mb-0.5">Estimasi Nilai Tukar</p>
                <p className="text-sm font-semibold">Rp {(points * 100).toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <History size={14} className="text-blue-500" />
                Riwayat Poin
              </h3>
              <button 
                onClick={() => navigate('/points-history')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-2">
              {isLoadingHistory ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                        tx.jenis_transaksi === 'masuk' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                      )}>
                        {tx.jenis_transaksi === 'masuk' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[130px] leading-tight">{tx.keterangan}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-xs font-bold",
                      tx.jenis_transaksi === 'masuk' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {tx.jenis_transaksi === 'masuk' ? '+' : '-'}{tx.jumlah_poin}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada riwayat transaksi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Voucher Store */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <VoucherIcon size={16} className="text-blue-500" />
              Tukarkan Voucher
            </h3>
          </div>

          {redeemedCode && (
            <div id="code_voucher_display" className="code_voucher_display bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 p-4 rounded-xl text-center flex flex-col items-center justify-center gap-1.5">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h4 className="font-semibold text-sm text-emerald-900 dark:text-emerald-400">Voucher Berhasil Ditukarkan!</h4>
              <p className="text-xs text-slate-500">Gunakan kode voucher di bawah ini saat checkout:</p>
              <div className="font-mono bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 rounded-lg font-bold text-sm text-slate-900 dark:text-white select-all">
                {redeemedCode}
              </div>
              <button 
                onClick={() => setRedeemedCode('')} 
                className="mt-1 text-xs text-blue-600 font-semibold hover:underline"
              >
                Tutup
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DUMMY_VOUCHERS.map((voucher, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={voucher.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Gift size={16} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md">
                      {voucher.discount} OFF
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 mb-0.5">{voucher.name}</h4>
                  <p className="text-[11px] text-slate-400 mb-3">Berlaku hingga {new Date(voucher.expiryDate).toLocaleDateString('id-ID')}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{voucher.pointsRequired} Pts</span>
                  </div>
                  <button 
                    onClick={() => handleRedeem(voucher.pointsRequired, voucher.name)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-[0.98]",
                      points < voucher.pointsRequired 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                    )}
                  >
                    Tukarkan
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && selectedVoucher && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl max-w-sm w-full shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-xl flex items-center justify-center text-blue-600 mx-auto">
              <Gift size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Konfirmasi Penukaran</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apakah Anda yakin ingin menukarkan <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVoucher.pointsRequired} Poin</span> untuk "{selectedVoucher.name}"?
            </p>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn_confirm"
                onClick={executeRedeem}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
              >
                Tukar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div 
          id={toastType === 'success' ? "toast_success" : "toast_error"} 
          className={cn(
            "fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 z-50 animate-bounce transition-all duration-300",
            toastType === 'success' ? "border-emerald-500" : "border-red-500"
          )}
        >
          {toastType === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
