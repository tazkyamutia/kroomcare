import { getToken, clearToken } from './token';

export const UNAUTHORIZED_EVENT = 'kroomcare:unauthorized';

/**
 * Membungkus window.fetch agar otomatis menyisipkan header Authorization
 * (Bearer <jwt>) untuk semua request ke API origin yang sama.
 * Menghindari pengiriman kredensial ke origin lain.
 * Jawaban 401 dari API (sesi kedaluwarsa / dicabut) mengeluarkan pengguna agar diminta login ulang.
 */
export function installAuthFetchPatch(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = getToken();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const sameOrigin = url.startsWith('/') || new URL(url, window.location.origin).origin === window.location.origin;
    if (!token || !sameOrigin) return originalFetch(input, init);

    const headers = new Headers(init?.headers || (typeof input !== 'string' && input instanceof Request ? input.headers : undefined));
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await originalFetch(input, { ...(init || {}), headers });
    const path = new URL(url, window.location.origin).pathname;
    if (response.status === 401 && path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return response;
  };
}

// URL EventSource (SSE) tidak bisa membawa header Authorization, jadi token dikirim lewat query.
export function withAuthToken(url: string): string {
  const token = getToken();
  if (!token) return url;
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
}
