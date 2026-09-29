import { getToken } from './token';

/**
 * Membungkus window.fetch agar otomatis menyisipkan header Authorization
 * (Bearer <jwt>) untuk semua request ke API origin yang sama.
 * Menghindari pengiriman kredensial ke origin lain.
 */
export function installAuthFetchPatch(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = getToken();
    if (!token) return originalFetch(input, init);

    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const sameOrigin = url.startsWith('/') || new URL(url, window.location.origin).origin === window.location.origin;
    if (!sameOrigin) return originalFetch(input, init);

    const headers = new Headers(init?.headers || (typeof input !== 'string' && input instanceof Request ? input.headers : undefined));
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return originalFetch(input, { ...(init || {}), headers });
  };
}