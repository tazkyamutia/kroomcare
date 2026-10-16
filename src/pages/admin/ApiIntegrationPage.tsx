import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Key, RefreshCw, Copy, CheckCircle2, AlertCircle, 
  Loader2, MessageSquare, Send, Save, Eye, EyeOff, ExternalLink, Phone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export const ApiIntegrationPage = () => {
  const { t, language } = useLanguageTheme();
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // State untuk WhatsApp Webhook (Kroomhook)
  const [waConfig, setWaConfig] = useState({
    apiKey: '',
    rawApiKey: '',
    targetJid: '6285847255010@s.whatsapp.net',
    webhookUrl: 'https://kroomhook.kroombox.com/notify'
  });
  const [showWaKey, setShowWaKey] = useState(false);
  const [isSavingWa, setIsSavingWa] = useState(false);
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [waTestResult, setWaTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/admin/api-key');
      const result = await response.json();
      if (response.ok && result.success) {
        setApiKey(result.apiKey);
      } else {
        setError(result.message || (language === 'en' ? 'Failed to fetch API Key' : 'Gagal mengambil API Key'));
      }
    } catch (err) {
      console.error(err);
      setError(language === 'en' ? 'Failed to connect to server.' : 'Koneksi gagal ke server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWaConfig = async () => {
    try {
      const response = await fetch('/api/admin/whatsapp-config');
      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setWaConfig({
          apiKey: result.data.rawApiKey || '',
          rawApiKey: result.data.rawApiKey || '',
          targetJid: result.data.targetJid || '6285847255010@s.whatsapp.net',
          webhookUrl: result.data.webhookUrl || 'https://kroomhook.kroombox.com/notify'
        });
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp config:', err);
    }
  };

  useEffect(() => {
    fetchApiKey();
    fetchWaConfig();
  }, []);

  const handleGenerateKey = async () => {
    const confirmMsg = language === 'en'
      ? 'Warning: Regenerating API Key will invalidate the previous key. Any application using the old key must be updated. Proceed?'
      : 'Peringatan: Membuat ulang API Key akan membuat key lama tidak berlaku. Aplikasi yang menggunakan key lama harus diperbarui dengan key yang baru. Lanjutkan?';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/admin/api-key/generate', {
        method: 'POST',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setApiKey(result.apiKey);
        setToastMessage(language === 'en' ? 'New API Key generated successfully!' : 'API Key baru berhasil di-generate!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || (language === 'en' ? 'Failed to generate API Key' : 'Gagal generate API Key'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Failed to connect to server while generating key.' : 'Koneksi gagal ke server saat generate key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveWaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWa(true);
    setWaTestResult(null);
    try {
      const res = await fetch('/api/admin/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: waConfig.apiKey,
          targetJid: waConfig.targetJid,
          webhookUrl: waConfig.webhookUrl
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setToastMessage(language === 'en' ? 'WhatsApp Webhook settings saved!' : 'Pengaturan WhatsApp Webhook tersimpan!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || 'Gagal menyimpan konfigurasi WhatsApp.');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSavingWa(false);
    }
  };

  const handleTestWhatsApp = async () => {
    setIsTestingWa(true);
    setWaTestResult(null);
    try {
      const res = await fetch('/api/admin/whatsapp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJid: waConfig.targetJid
        })
      });
      const result = await res.json();
      setWaTestResult({
        success: res.ok && result.success,
        message: result.message || (res.ok ? 'Pesan terkirim' : 'Gagal mengirim pesan')
      });
    } catch (err: any) {
      setWaTestResult({
        success: false,
        message: err.message || 'Koneksi gagal saat menghubungi server.'
      });
    } finally {
      setIsTestingWa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('admin_api.title')}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'en' ? 'Manage inbound API keys and external WhatsApp webhook integration.' : 'Kelola API Key integrasi dan webhook gateway WhatsApp.'}
          </p>
        </div>
      </div>

      {/* Card 1: API Key KroomCare (Inbound dari KolabPanel) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="p-4 sm:p-6">
          <div className="max-w-2xl">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
              <Key className="text-blue-600 dark:text-blue-400" size={18} />
              {t('admin_api.key_title')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              {t('admin_api.key_desc')}{' '}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                {language === 'en' ? 'Keep this key secure and confidential.' : 'Jaga kerahasiaan key ini.'}
              </strong>
            </p>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 py-3">
                <Loader2 className="animate-spin text-blue-600" size={18} />
                <span className="text-xs sm:text-sm">{language === 'en' ? 'Loading API Key...' : 'Memuat API Key...'}</span>
              </div>
            ) : error ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 mb-4 text-xs sm:text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      readOnly 
                      value={apiKey || (language === 'en' ? 'No API Key yet. Please generate one.' : 'Belum ada API Key. Silakan generate.')} 
                      className={cn(
                        "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 sm:py-2.5 px-3.5 pr-10 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none",
                        !apiKey && "italic text-slate-400"
                      )}
                    />
                    {apiKey && (
                      <button 
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                        title={language === 'en' ? 'Copy to clipboard' : 'Salin ke clipboard'}
                      >
                        {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleGenerateKey}
                    disabled={generating}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {generating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    {apiKey ? (language === 'en' ? 'Regenerate API Key' : 'Generate Ulang API Key') : t('admin_api.generate_new')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-amber-50/60 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/40 p-4 sm:p-5">
          <div className="flex gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-0.5">{language === 'en' ? 'Security Notice' : 'Perhatian Keamanan'}</p>
              <p className="text-amber-700/90 dark:text-amber-400/80 leading-relaxed">
                {language === 'en' 
                  ? 'If you suspect the API Key has been compromised, regenerate it immediately. All external systems using the previous key will immediately lose access until updated.' 
                  : 'Jika Anda mencurigai API Key telah bocor, segera lakukan Regenerate. Semua sistem eksternal yang menggunakan Key lama akan seketika kehilangan akses sampai Anda memperbarui konfigurasinya.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: WhatsApp Webhook Gateway (Kroomhook) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-emerald-600 dark:text-emerald-400" size={18} />
              WhatsApp Webhook Gateway (Kroomhook)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'en' 
                ? 'Send instant WhatsApp alerts for every new ticket without complex bot code.' 
                : 'Kirim notifikasi instan WhatsApp untuk setiap tiket keluhan baru melalui webhook Kroomhook.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5",
              waConfig.apiKey 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            )}>
              <span className={cn("w-2 h-2 rounded-full", waConfig.apiKey ? "bg-emerald-500" : "bg-amber-500")} />
              {waConfig.apiKey ? (language === 'en' ? 'API Key Configured' : 'API Key Terpasang') : (language === 'en' ? 'Key Missing (401)' : 'Key Belum Diisi (401)')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveWaConfig} className="p-4 sm:p-6 space-y-4 max-w-3xl">
          {/* Webhook Endpoint */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              Webhook Endpoint URL
            </label>
            <input 
              type="text" 
              required
              value={waConfig.webhookUrl} 
              onChange={e => setWaConfig({ ...waConfig, webhookUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="https://kroomhook.kroombox.com/notify"
            />
            <p className="text-[11px] text-slate-400">Endpoint default: <code>https://kroomhook.kroombox.com/notify</code></p>
          </div>

          {/* Webhook API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Webhook API Key (Header: <code>X-API-Key</code>)</span>
              <a 
                href="https://panel.kroombox.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                Dashboard Panel <ExternalLink size={11} />
              </a>
            </label>
            <div className="relative">
              <input 
                type={showWaKey ? "text" : "password"} 
                required
                value={waConfig.apiKey} 
                onChange={e => setWaConfig({ ...waConfig, apiKey: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3.5 pr-10 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Masukkan API Key Kroomhook Anda"
              />
              <button 
                type="button"
                onClick={() => setShowWaKey(!showWaKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showWaKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Kunci rahasia untuk autentikasi ke gateway Kroomhook. Disimpan di <code>WEBHOOK_API_KEY</code>.
            </p>
          </div>

          {/* Target WhatsApp JID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-500" />
              Target Nomor WhatsApp / Group ID (Field: <code>to</code>)
            </label>
            <input 
              type="text" 
              required
              value={waConfig.targetJid} 
              onChange={e => setWaConfig({ ...waConfig, targetJid: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Contoh: 6285847255010@s.whatsapp.net atau 120363xxx@g.us"
            />
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p>• <strong>Chat Pribadi:</strong> format internasional tanpa tanda + atau 0 di depan, diakhiri <code>@s.whatsapp.net</code> (contoh: <code>6285847255010@s.whatsapp.net</code>).</p>
              <p>• <strong>Grup WhatsApp:</strong> diakhiri <code>@g.us</code> (contoh: <code>120363000000000000@g.us</code>, bot harus sudah menjadi anggota grup).</p>
            </div>
          </div>

          {/* Test Result Alert */}
          {waTestResult && (
            <div className={cn(
              "p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm transition-all",
              waTestResult.success 
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
            )}>
              {waTestResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{waTestResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}</p>
                <p className="text-xs opacity-90 mt-0.5">{waTestResult.message}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSavingWa}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-70 cursor-pointer"
            >
              {isSavingWa ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {language === 'en' ? 'Save WhatsApp Settings' : 'Simpan Pengaturan WhatsApp'}
            </button>

            <button
              type="button"
              onClick={handleTestWhatsApp}
              disabled={isTestingWa || !waConfig.apiKey}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              {isTestingWa ? <Loader2 size={15} className="animate-spin text-emerald-600" /> : <Send size={15} />}
              {language === 'en' ? 'Test WhatsApp Message' : 'Kirim Pesan Uji Coba'}
            </button>
          </div>
        </form>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-semibold animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
