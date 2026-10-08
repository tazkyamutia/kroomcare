import React from 'react';
import { 
  User, Mail, Camera, Coins, History, CheckCircle2, Save, ArrowUpRight,
  Lock, ShieldEllipsis, ToggleLeft, ToggleRight, Eye, EyeOff, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { useUser } from '../../context/UserContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const { t, language } = useLanguageTheme();
  const userRole = user?.role || 'customer';
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  
  // Local state for profile form
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

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
        alert(language === 'en' ? 'Maximum file size is 2MB' : 'Ukuran file maksimal 2MB');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSaving(true);
    
    try {
      // 1. Simpan data profil dasar
      const res = await fetch(`/api/auth/profile/${user.id}`, {
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
        alert(result.message || (language === 'en' ? 'Failed to save profile changes.' : 'Gagal menyimpan perubahan profil.'));
        setIsSaving(false);
        return;
      }

      // 2. Jika kolom password diisi
      if (passwordForm.current || passwordForm.new || passwordForm.confirm) {
        if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
          alert(language === 'en' ? 'Please fill in all password fields.' : 'Mohon lengkapi semua kolom password.');
          setIsSaving(false);
          return;
        }

        if (passwordForm.new !== passwordForm.confirm) {
          alert(t('profile.password_match_err'));
          setIsSaving(false);
          return;
        }

        if (passwordForm.new.length < 6) {
          alert(t('profile.password_length_err'));
          setIsSaving(false);
          return;
        }

        const passRes = await fetch(`/api/auth/change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            currentPassword: passwordForm.current,
            newPassword: passwordForm.new
          })
        });

        const passResult = await passRes.json();
        if (!passRes.ok || !passResult.success) {
          alert(passResult.message || (language === 'en' ? 'Failed to change password. Make sure current password is correct.' : 'Gagal mengubah password. Pastikan password lama sesuai.'));
          setIsSaving(false);
          return;
        }

        setPasswordForm({ current: '', new: '', confirm: '' });
      }

      updateUser({
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        status: status
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Connection error while saving profile.' : 'Terjadi kendala koneksi saat menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const points = user?.points || 0;
  const [recentTransactions, setRecentTransactions] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/points/history/${user.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setRecentTransactions(result.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch history in profile:', error);
      }
    };
    fetchHistory();
  }, [user?.id]);

  const [show2FAModal, setShow2FAModal] = React.useState(false);
  const [qrCodeUrl, setQrCodeUrl] = React.useState('');
  const [setupSecret, setSetupSecret] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [modalLoading, setModalLoading] = React.useState(false);

  const handle2FAToggle = async () => {
    if (!user?.id) return;

    if (twoFactorEnabled) {
      const confirmDisable = window.confirm(language === 'en' ? 'Are you sure you want to disable 2FA?' : 'Apakah Anda yakin ingin menonaktifkan 2FA?');
      if (!confirmDisable) return;

      try {
        const response = await fetch('/api/auth/2fa/disable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id })
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setTwoFactorEnabled(false);
          updateUser({ twoFactorEnabled: false } as any);
          alert(language === 'en' ? '2FA disabled successfully.' : '2FA berhasil dinonaktifkan.');
        } else {
          alert(result.message || (language === 'en' ? 'Failed to disable 2FA.' : 'Gagal menonaktifkan 2FA.'));
        }
      } catch (err) {
        console.error(err);
        alert(language === 'en' ? 'Connection error.' : 'Koneksi gagal ke server.');
      }
    } else {
      setModalLoading(true);
      try {
        const response = await fetch('/api/auth/2fa/setup', {
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
          alert(result.message || (language === 'en' ? 'Failed to setup 2FA.' : 'Gagal menyiapkan 2FA.'));
        }
      } catch (err) {
        console.error(err);
        alert(language === 'en' ? 'Connection error.' : 'Koneksi gagal ke server.');
      } finally {
        setModalLoading(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    if (!user?.id || !setupSecret || !otpCode) return;
    setModalLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/verify', {
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
        alert(language === 'en' ? 'Two-Factor Authentication successfully enabled!' : 'Two-Factor Authentication berhasil diaktifkan!');
      } else {
        alert(result.message || (language === 'en' ? 'Invalid OTP code. Please try again.' : 'Kode OTP salah. Silakan coba lagi.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Connection error.' : 'Koneksi gagal ke server.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* 1. Header Profil (Avatar) */}
          <section className="flex flex-col sm:flex-row items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group shrink-0">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
              />
              <div 
                onClick={handlePhotoClick}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold overflow-hidden cursor-pointer relative"
              >
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.name?.split(' ').map(n => n[0]).join('').substring(0, 2)
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-full">
                  <Camera size={18} />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{formData.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{formData.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={handlePhotoClick}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Change Photo' : 'Ganti Foto'}
                </button>
                <span className="text-[11px] text-slate-400">{language === 'en' ? 'Max. 2MB' : 'Maks. 2MB'}</span>
              </div>
            </div>
          </section>

          {/* 2. Informasi Akun */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'en' ? 'Personal Information' : 'Informasi Pribadi'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('profile.name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder={language === 'en' ? 'Full name...' : 'Nama lengkap...'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('profile.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 3. Keamanan Akun */}
          <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('profile.security_title')}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('profile.current_password')}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder={language === 'en' ? 'Leave blank to keep unchanged' : 'Kosongkan jika tidak ingin mengubah'}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('profile.new_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder={language === 'en' ? 'Min. 6 characters' : 'Min. 6 karakter'}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('profile.confirm_password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder={language === 'en' ? 'Repeat new password' : 'Ulangi sandi baru'}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Admin 2FA */}
            {userRole === 'admin' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between mt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <ShieldEllipsis size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{t('profile.two_factor_title')}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('profile.two_factor_desc')}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handle2FAToggle}
                  className={cn(
                    "transition-colors cursor-pointer",
                    twoFactorEnabled ? "text-emerald-500" : "text-slate-400"
                  )}
                >
                  {twoFactorEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            )}
          </section>

          {/* 4. Customer Loyalty Summary (jika Customer) */}
          {userRole === 'customer' && (
            <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-amber-300" />
                    <span className="text-xs font-semibold text-blue-100">{t('profile.loyalty_points')}</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase">Member</span>
                </div>
                <p className="text-2xl font-bold tracking-tight">🪙 {points.toLocaleString(locale)} {t('header.pts')}</p>
              </div>

              {recentTransactions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('profile.recent_transactions')}</h4>
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                          tx.jenis_transaksi === 'masuk' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                        )}>
                          {tx.jenis_transaksi === 'masuk' ? <ArrowUpRight size={13} /> : <Coins size={13} />}
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{tx.keterangan}</span>
                      </div>
                      <span className={cn("font-semibold", tx.jenis_transaksi === 'masuk' ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                        {tx.jenis_transaksi === 'masuk' ? '+' : '-'}{tx.jumlah_poin}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 5. Status & Shift (jika Staff) */}
          {userRole === 'staff' && (
            <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('profile.work_status')}</h2>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                {[
                  { id: 'online', label: t('profile.status_online') },
                  { id: 'busy', label: t('profile.status_busy') },
                  { id: 'offline', label: t('profile.status_offline') }
                ].map((s) => (
                  <button 
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id as any)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      status === s.id 
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={() => {
                setFormData({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
                setPasswordForm({ current: '', new: '', confirm: '' });
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {language === 'en' ? 'Reset' : 'Atur Ulang'}
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 text-white cursor-pointer",
                saved ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('profile.saving')}
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={14} />
                  {t('profile.saved')}
                </>
              ) : (
                <>
                  <Save size={14} />
                  {t('profile.save_changes')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
            >
              <div className="text-center space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Setup 2FA Admin</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'en' ? 'Scan the QR code using Google Authenticator.' : 'Scan QR code menggunakan Google Authenticator.'}
                </p>
              </div>

              {qrCodeUrl && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex justify-center">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 object-contain" />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  {language === 'en' ? '6-Digit OTP Code:' : 'Kode OTP 6 Digit:'}
                </label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t('profile.cancel_btn')}
                </button>
                <button 
                  type="button" 
                  disabled={otpCode.length !== 6 || modalLoading}
                  onClick={handleVerify2FA}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading ? (language === 'en' ? 'Verifying...' : 'Memverifikasi...') : (language === 'en' ? 'Enable' : 'Aktifkan')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
