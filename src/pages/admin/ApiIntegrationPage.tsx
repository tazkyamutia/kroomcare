import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    fetchApiKey();
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('admin_api.title')}</h1>
        </div>
      </div>

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
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
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
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-70"
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

