const TOKEN_KEY = 'kroomcare_token';
const USER_KEY = 'kroomcare_user';

/**
 * Sesi disimpan per tab (sessionStorage) supaya login akun lain di tab lain tidak mengganti identitas tab ini.
 * Tanpa ini, pelanggan dan staff yang terbuka di browser yang sama berbagi satu token, sehingga pesan
 * pelanggan terkirim atas nama staff. localStorage hanya menyimpan login terakhir untuk tab yang baru dibuka.
 */
const safe = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

// Tab baru mengambil login terakhir sekali saat dimuat; setelah itu tab memegang sesinya sendiri.
safe(() => {
  if (!sessionStorage.getItem(TOKEN_KEY)) {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (token && user) {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, user);
    }
  }
}, undefined);

export const getToken = (): string | null => safe(() => sessionStorage.getItem(TOKEN_KEY), null);

export const setToken = (token: string | null): void => {
  safe(() => {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      // Hanya hapus login terakhir bila memang milik tab ini, agar logout satu tab tidak mengeluarkan tab lain.
      const own = sessionStorage.getItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      if (own && localStorage.getItem(TOKEN_KEY) === own) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, undefined);
};

export const clearToken = (): void => {
  setToken(null);
};

export const getStoredUser = (): string | null => safe(() => sessionStorage.getItem(USER_KEY), null);

export const setStoredUser = (userJson: string | null): void => {
  safe(() => {
    if (userJson) {
      sessionStorage.setItem(USER_KEY, userJson);
      // Login terakhir hanya diperbarui bila token tab ini memang token terakhir.
      if (localStorage.getItem(TOKEN_KEY) === sessionStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, userJson);
      }
    } else {
      sessionStorage.removeItem(USER_KEY);
    }
  }, undefined);
};

// userId di dalam token sesi (tanpa verifikasi tanda tangan; hanya untuk mendeteksi data tab yang tidak cocok).
export const getTokenUserId = (): number | null => safe(() => {
  const part = (getToken() || '').split('.')[1];
  if (!part) return null;
  const payload = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  return Number(payload.userId) || null;
}, null);
