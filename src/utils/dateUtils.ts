/**
 * Utility untuk memformat tanggal dan waktu selalu mengikuti zona waktu WIB (Asia/Jakarta, UTC+7)
 */

export const parseToDate = (dateInput: string | Date | undefined | null): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;
  if (typeof dateInput === 'string') {
    // Jika format standar SQL "YYYY-MM-DD HH:mm:ss" tanpa zona waktu, tetapkan sebagai WIB (+07:00)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateInput)) {
      const parsed = new Date(dateInput.replace(' ', 'T') + '+07:00');
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
};

export const formatWIBDateTime = (
  dateInput: string | Date | undefined | null,
  locale: string = 'id-ID',
  includeSeconds: boolean = true
): string => {
  const d = parseToDate(dateInput);
  if (!d) return '';

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  const formatted = d.toLocaleString(locale, options);
  return `${formatted} WIB`;
};

export const formatWIBTime = (
  dateInput: string | Date | undefined | null,
  locale: string = 'id-ID'
): string => {
  const d = parseToDate(dateInput);
  if (!d) return '';

  return d.toLocaleTimeString(locale, {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatWIBDate = (
  dateInput: string | Date | undefined | null,
  locale: string = 'id-ID',
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = parseToDate(dateInput);
  if (!d) return '';

  return d.toLocaleDateString(locale, {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  });
};

export const getWIBDateKey = (dateInput: string | Date | undefined | null): string => {
  const d = parseToDate(dateInput);
  if (!d) return '';
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
};

export const formatWIBDateGroup = (
  dateInput: string | Date | undefined | null,
  locale: string = 'id-ID'
): string => {
  const d = parseToDate(dateInput);
  if (!d) return '';

  const nowWIB = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  const targetWIB = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });

  const formattedDate = d.toLocaleDateString(locale, {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (targetWIB === nowWIB) {
    return locale.startsWith('en') ? `Today • ${formattedDate}` : `Hari Ini • ${formattedDate}`;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWIB = yesterday.toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  if (targetWIB === yesterdayWIB) {
    return locale.startsWith('en') ? `Yesterday • ${formattedDate}` : `Kemarin • ${formattedDate}`;
  }

  return formattedDate;
};

