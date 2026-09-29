import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { setToken as saveTokenUtil } from '../../utils/token';
import { Loader2, ShieldCheck, AlertCircle, Headphones } from 'lucide-react';

export const SSOPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const ticket = searchParams.get('ticket');
    const redirectPath = searchParams.get('redirect') || '/';

    if (!ticket) {
      setStatus('error');
      setErrorMessage('Tiket autentikasi SSO tidak ditemukan dalam URL.');
      return;
    }

    const performExchange = async () => {
      try {
        const response = await fetch('/api/auth/sso-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ticket })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Gagal memverifikasi tiket SSO.');
        }

        if (!isMounted) return;

        // 1. Simpan token ke storage via utility & context
        saveTokenUtil(data.token);
        if (setToken) setToken(data.token);

        // 2. Set user di context & localStorage
        if (setUser) setUser(data.data);
        localStorage.setItem('kroomcare_user', JSON.stringify(data.data));

        setStatus('success');

        // 3. Navigasi ke rute tujuan
        setTimeout(() => {
          if (isMounted) {
            navigate(redirectPath, { replace: true });
          }
        }, 300);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[SSO] Handshake failed:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Terjadi kesalahan saat memproses login SSO.');
      }
    };

    performExchange();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Headphones className="w-8 h-8" />
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-semibold text-base">Menghubungkan ke KroomCare CRM...</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mengotentikasi sesi akun KolabPanel Anda. Harap tunggu sebentar.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Autentikasi Berhasil
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Membuka workspace CRM Anda...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Gagal Memuat Sesi SSO
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {errorMessage}
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl transition-colors"
              >
                Ke Halaman Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
