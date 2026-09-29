const TOKEN_KEY = 'kroomcare_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage tidak tersedia (misal SSR) => abaikan
  }
};

export const clearToken = (): void => {
  setToken(null);
};