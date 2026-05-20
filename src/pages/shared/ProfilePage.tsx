import React from 'react';
import { 
  User, Mail, Camera, Coins, History, CheckCircle2, Save, ArrowUpRight, Gift, Activity, Zap, Award, ExternalLink,
  ShieldCheck, Lock, ShieldEllipsis, ToggleLeft, ToggleRight, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DUMMY_TRANSACTIONS } from '../../utils/dummyData';
import { useUser } from '../../context/UserContext';


export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const userRole = user?.role || 'customer';
  
  // Local state for profile form
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  // Sinkronisasikan form dengan context user yang mengambil data dari database
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
      if (user.status) {
        setStatus(user.status);
      }
      if ((user as any).twoFactorEnabled !== undefined) {
        setTwoFactorEnabled((user as any).twoFactorEnabled);
      }
    }
  }, [user]);

  const [status, setStatus] = React.useState<'online' | 'busy' | 'offline'>('online');
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [securitySaved, setSecuritySaved] = React.useState(false);

  const [passwordForm, setPasswordForm] = React.useState({
    current: '',
    new: '',
    confirm: ''
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const isPasswordValid = passwordForm.new.length >= 8 && passwordForm.new === passwordForm.confirm && passwordForm.current.length > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    
    try {
      // 1. Simpan data profil dasar
      const res = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
          status: status
        })
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.message || 'Gagal menyimpan perubahan profil.');
        setIsSaving(false);
        return;
      }

      // 2. Jika kolom password diisi, lakukan pembaruan password secara bersamaan
      if (passwordForm.current || passwordForm.new || passwordForm.confirm) {
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
          alert('Harap lengkapi semua kolom kata sandi jika Anda ingin mengubah kata sandi.');
          setIsSaving(false);
          return;
        }
        if (passwordForm.new !== passwordForm.confirm) {
          alert('Konfirmasi sandi baru tidak cocok.');
          setIsSaving(false);
          return;
        }
        if (passwordForm.new.length < 8) {
          alert('Kata sandi baru minimal harus 8 karakter.');
          setIsSaving(false);
          return;
        }

        const passwordRes = await fetch(`http://localhost:5000/api/auth/profile/${user.id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current: passwordForm.current,
            newPassword: passwordForm.new
          })
        });
        const passwordResult = await passwordRes.json();
        if (!passwordRes.ok || !passwordResult.success) {
          alert(passwordResult.message || 'Gagal memperbarui kata sandi.');
          setIsSaving(false);
          return;
        }
      }

      // 3. Update User Context dan bersihkan form sandi
      updateUser({
        name: result.data.name,
        email: result.data.email,
        avatar: result.data.avatar,
        status: result.data.status
      });
      setSaved(true);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  const points = user?.points || 0;
  const [recentTransactions, setRecentTransactions] = React.useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/points/history/${user.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setRecentTransactions(result.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch history in profile:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user?.id]);
  
  // Mock staff data
  const staffStats = {
    resolved: 45,
    rewardsGiven: 300
  };

  const [show2FAModal, setShow2FAModal] = React.useState(false);
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');
  const [setupSecret, setSetupSecret] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [modalLoading, setModalLoading] = React.useState(false);

  const handle2FAToggle = async () => {
    if (!user?.id) return;

    if (twoFactorEnabled) {
      const confirmDisable = window.confirm('Apakah Anda yakin ingin menonaktifkan Two-Factor Authentication (2FA)? Keamanan akun Anda akan berkurang.');
      if (!confirmDisable) return;

      try {
        const response = await fetch('http://localhost:5000/api/auth/2fa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id })
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setTwoFactorEnabled(false);
          updateUser({ twoFactorEnabled: false } as any);
          alert('2FA berhasil dinonaktifkan.');
        } else {
          alert(result.message || 'Gagal menonaktifkan 2FA.');
        }
      } catch (err) {
        console.error(err);
        alert('Koneksi gagal ke server.');
      }
    } else {
      setModalLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/auth/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id })
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setQrCodeUrl(result.data.qrCodeUrl);
          setSetupSecret(result.data.secret);
          setShow2FAModal(true);
        } else {
          alert(result.message || 'Gagal menyiapkan 2FA.');
        }
      } catch (err) {
        console.error(err);
        alert('Koneksi gagal ke server.');
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!user?.id || !setupSecret || !otpCode) return;
    setModalLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          secret: setupSecret,
          code: otpCode
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTwoFactorEnabled(true);
        updateUser({ twoFactorEnabled: true } as any);
        setShow2FAModal(false);
        setOtpCode('');
        setSetupSecret('');
        setQrCodeUrl('');
        alert('Two-Factor Authentication (2FA) berhasil diaktifkan!');
      } else {
        alert(result.message || 'Kode OTP salah. Silakan coba lagi.');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal ke server.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24 px-4">
      {/* Page Header */}
      <div className="space-y-2 text-center pt-8">
        <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-slate-500 font-medium">Kelola informasi publik dan keamanan akun Anda dalam satu tempat.</p>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <form onSubmit={handleSave} className="space-y-12 relative z-10">
          
          {/* 1. Header Profil (Avatar) */}
          <section className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              <div 
                onClick={handlePhotoClick}
                className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-2xl flex items-center justify-center text-brand-600 text-4xl font-black overflow-hidden ring-4 ring-brand-50 transition-all group-hover:ring-brand-100 cursor-pointer"
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.name.split(' ').map(n => n[0]).join('')
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-[2px] rounded-full">
                  <Camera size={32} />
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{formData.name}</h3>
              <div className="flex flex-col items-center gap-2">
                <button 
                  type="button" 
                  onClick={handlePhotoClick}
                  className="px-6 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
                >
                  Pilih Foto Baru
                </button>
                <p className="text-[10px] text-slate-400 font-medium">Maks. ukuran 2MB (JPG, PNG)</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 2. Informasi Akun */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <User size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Informasi Akun</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                    placeholder="Masukkan nama lengkap..."
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Profesional</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
                    placeholder="email@kroomcare.com"
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 3. Keamanan (Security) */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                <Lock size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Keamanan Akun</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Kata Sandi Saat Ini</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                    className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-bold text-slate-800"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Kata Sandi Baru</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-bold text-slate-800"
                      placeholder="Min. 8 karakter"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Konfirmasi Sandi Baru</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm font-bold text-slate-800"
                      placeholder="Ulangi sandi baru"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Special Admin 2FA */}
            {userRole === 'admin' && (
              <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex items-center justify-between group mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-50 transition-transform">
                    <ShieldEllipsis size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Tambahkan verifikasi kode untuk keamanan admin maksimal.
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handle2FAToggle}
                  className={cn(
                    "transition-all duration-300 transform",
                    twoFactorEnabled ? "text-emerald-500 scale-110" : "text-slate-300"
                  )}
                >
                  {twoFactorEnabled ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                </button>
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          {/* 4. Gamifikasi Customer (atau Shift for Staff) */}
          <section className="space-y-8">
            {userRole === 'customer' && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                    <Gift size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Loyalty & Reward</h2>
                </div>

                {/* Points Card */}
                <div className="bg-gradient-to-r from-blue-700 to-sky-400 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl border border-white/30">
                        <Coins size={24} fill="currentColor" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Total Reward</h3>
                        <p className="text-sm font-bold">KroomCare Loyalty</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-6xl font-display font-black tracking-tighter">🪙 {points.toLocaleString()}</span>
                      <span className="text-brand-100 font-black uppercase text-[10px] tracking-widest bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">Poin</span>
                    </div>

                    <div className="p-5 bg-white/10 rounded-[2rem] border border-white/20 backdrop-blur-md">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-100">Level Progress</span>
                        <span className="text-[10px] font-bold">85% to Gold</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-300 to-amber-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Riwayat Aktivitas Customer */}
                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <History size={18} className="text-brand-600" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Riwayat Koin Terakhir</h3>
                  </div>
                  <div className="space-y-4">
                    {isLoadingHistory ? (
                      <div className="flex justify-center py-6">
                        <span className="text-xs text-slate-500 font-medium animate-pulse">Memuat riwayat...</span>
                      </div>
                    ) : recentTransactions.length > 0 ? (
                      recentTransactions.map((tx) => (
                        <div key={tx.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              tx.jenis_transaksi === 'masuk' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                              {tx.jenis_transaksi === 'masuk' ? <ArrowUpRight size={18} /> : <Coins size={18} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{tx.keterangan}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-tight mt-0.5">
                                {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <span className={cn("text-sm font-black", tx.jenis_transaksi === 'masuk' ? "text-emerald-600" : "text-red-600")}>
                            {tx.jenis_transaksi === 'masuk' ? '+' : '-'}{tx.jumlah_poin}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">Belum ada riwayat koin.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {userRole === 'staff' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                    <Activity size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Status & Shift</h2>
                </div>

                <div className="bg-slate-50 p-2 rounded-[2rem] border border-slate-100 flex items-center w-full">
                  {['online', 'busy', 'offline'].map((s) => (
                    <button 
                      key={s}
                      type="button"
                      onClick={() => setStatus(s as any)}
                      className={cn(
                        "flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                        status === s 
                          ? s === 'online' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                          : s === 'busy' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                          : "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "text-slate-400 hover:bg-white"
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full ring-4 ring-white/10", 
                        status === s ? "bg-white" : 
                        s === 'online' ? "bg-emerald-500" : 
                        s === 'busy' ? "bg-amber-500" : "bg-slate-400"
                      )} />
                      {s}
                    </button>
                  ))}
                </div>
                
                {/* Staff Stats Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                    <p className="text-3xl font-display font-black text-white mb-1">{staffStats.resolved}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-400">Tiket Selesai</p>
                  </div>
                  <div className="p-6 bg-brand-600 rounded-[2rem] text-white">
                    <p className="text-3xl font-display font-black text-white mb-1">{staffStats.rewardsGiven}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Poin Diberikan</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 6. Action Buttons */}
          <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6">
            <button 
              type="submit"
              disabled={isSaving}
              className={cn(
                "w-full sm:flex-1 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3",
                saved 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-brand-600 text-white shadow-brand-500/40 hover:bg-brand-700 hover:-translate-y-1"
              )}
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle2 size={20} />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <Save size={20} />
                  Simpan Perubahan
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={() => {
                setFormData({ name: user?.name || '', email: formData.email, avatar: user?.avatar || '' });
                setPasswordForm({ current: '', new: '', confirm: '' });
              }}
              className="w-full sm:w-auto px-12 py-5 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-400 font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-[0.98]"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white"
          >
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <span className="font-bold text-sm">Profil Anda berhasil diperbarui!</span>
          </motion.div>
        )}

        {show2FAModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-slate-100 shadow-2xl relative overflow-hidden"
            >
              <button 
                type="button"
                onClick={() => {
                  setShow2FAModal(false);
                  setOtpCode('');
                  setSetupSecret('');
                  setQrCodeUrl('');
                }}
                className="absolute right-6 top-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>

              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto shadow-sm">
                  <ShieldEllipsis size={32} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Setup Two-Factor (2FA)</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Tingkatkan keamanan akun Admin Anda menggunakan Google Authenticator atau aplikasi sejenis.
                  </p>
                </div>

                {qrCodeUrl && (
                  <div className="bg-slate-50 p-4 rounded-3xl inline-block border border-slate-100 shadow-inner">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 rounded-xl object-contain mx-auto" />
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kode Pengaturan Manual:</span>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-bold text-slate-800 select-all tracking-wider">{setupSecret}</code>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(setupSecret);
                        alert('Kode disalin ke papan klip!');
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">Masukkan Kode Verifikasi 2FA:</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 123456"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 text-center font-mono text-xl font-bold tracking-[0.3em] text-slate-800"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setShow2FAModal(false);
                      setOtpCode('');
                      setSetupSecret('');
                      setQrCodeUrl('');
                    }}
                    className="flex-1 py-4 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button 
                    type="button"
                    disabled={otpCode.length !== 6 || modalLoading}
                    onClick={handleVerify2FA}
                    className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {modalLoading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

};
