import React, { useState, useEffect } from 'react';
import { ShieldCheck, Key, RefreshCw, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ApiIntegrationPage = () => {
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
        setError(result.message || 'Gagal mengambil API Key');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi gagal ke server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKey();
  }, []);

  const handleGenerateKey = async () => {
    if (!window.confirm('Peringatan: Membuat ulang API Key akan membuat key lama tidak berlaku. Aplikasi yang menggunakan key lama (seperti KolabPanel) harus diperbarui dengan key yang baru. Lanjutkan?')) {
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
        setToastMessage('API Key baru berhasil di-generate!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || 'Gagal generate API Key');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal ke server saat generate key.');
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Integrasi & Keamanan</h1>
            <p className="text-slate-500 mt-1">Kelola API Key untuk menghubungkan KroomCare dengan aplikasi eksternal (KolabPanel).</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="p-8">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Key className="text-brand-500" size={20} />
              KroomCare API Key
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              API Key ini digunakan untuk autentikasi sistem luar (seperti integrasi JIT Provisioning tiket dari KolabPanel) agar dapat mengirimkan keluhan pelanggan secara aman ke sistem KroomCare. 
              <strong> Jaga kerahasiaan key ini.</strong>
            </p>

            {loading ? (
              <div className="flex items-center gap-3 text-slate-500 py-4">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Memuat API Key...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 mb-6">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      readOnly 
                      value={apiKey || 'Belum ada API Key. Silakan generate.'} 
                      className={cn(
                        "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-mono text-sm text-slate-700 focus:outline-none",
                        !apiKey && "italic text-slate-400"
                      )}
                    />
                    {apiKey && (
                      <button 
                        onClick={handleCopy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleGenerateKey}
                    disabled={generating}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md disabled:opacity-70"
                  >
                    {generating ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    {apiKey ? 'Regenerate API Key' : 'Generate API Key'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-amber-50/50 border-t border-amber-100 p-6">
          <div className="flex gap-3 text-amber-800">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold mb-1">Perhatian Keamanan</p>
              <p className="text-amber-700/80">Jika Anda mencurigai API Key telah bocor, segera lakukan Regenerate. Semua sistem eksternal yang menggunakan Key lama akan seketika kehilangan akses sampai Anda memperbarui konfigurasi mereka dengan Key yang baru.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
