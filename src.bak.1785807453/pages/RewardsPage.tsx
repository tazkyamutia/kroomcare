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
      const response = await fetch('http://localhost:5000/api/points/redeem', {
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

          {redeemedCode && (
            <div id="code_voucher_display" className="code_voucher_display bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 p-6 rounded-3xl text-center flex flex-col items-center justify-center gap-2 mb-6">
              <CheckCircle2 className="text-emerald-500" size={32} />
              <h4 className="font-bold text-emerald-900 dark:text-emerald-400">Voucher Berhasil Ditukarkan!</h4>
              <p className="text-xs text-slate-500">Gunakan kode voucher di bawah ini saat checkout:</p>
              <div className="font-mono bg-white dark:bg-slate-900 px-4 py-2 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 select-all">
                {redeemedCode}
              </div>
              <button 
                onClick={() => setRedeemedCode('')} 
                className="mt-2 text-xs text-brand-600 font-bold hover:underline"
              >
                Tutup
              </button>
            </div>
          )}

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
                    className={cn(
                      "px-4 py-2 text-white text-xs font-bold rounded-xl transition-all active:scale-95",
                      points < voucher.pointsRequired 
                        ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-slate-900 hover:bg-brand-600 cursor-pointer"
                    )}
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

      {/* Custom Confirmation Modal */}
      {showConfirmModal && selectedVoucher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center">
            <Gift size={48} className="mx-auto text-brand-600 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Konfirmasi Penukaran</h3>
            <p className="text-sm text-slate-500 mb-6">
              Apakah Anda yakin ingin menukarkan <span className="font-bold text-slate-700 dark:text-slate-300">{selectedVoucher.pointsRequired} Poin</span> untuk "{selectedVoucher.name}"?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn_confirm"
                onClick={executeRedeem}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
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
