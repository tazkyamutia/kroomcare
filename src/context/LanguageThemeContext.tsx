import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'id' | 'en';
export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export interface LanguageThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  themeMode: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Forum Komunitas',
    'nav.my_tickets': 'Tiket Saya',
    'nav.rewards': 'Hadiah & Rewards',
    'nav.points_history': 'Riwayat Poin',
    'nav.profile': 'Profil Saya',
    'nav.settings': 'Pengaturan',
    'nav.staff_dashboard': 'Dashboard Staff',
    'nav.ticket_queue': 'Antrean Keluhan',
    'nav.user_management': 'Manajemen Pengguna',
    'nav.ticket_settings': 'Pengaturan Tiket',
    'nav.api_integration': 'Integrasi API',

    // Header
    'header.notifications': 'Notifikasi',
    'header.no_notifications': 'Belum ada notifikasi baru.',
    'header.info': 'Info',
    'header.loyalty': 'Loyalitas',
    'header.pts': 'pts',
    'header.edit_profile': 'Edit Profil',
    'header.account_settings': 'Pengaturan Akun',
    'header.logout': 'Keluar',
    'header.switch_lang': 'Ganti Bahasa',
    'header.switch_theme': 'Ganti Tema',

    // Settings Page
    'settings.title': 'Pengaturan Sistem',
    'settings.subtitle': 'Sesuaikan preferensi tampilan dan bahasa aplikasi KroomCare Anda.',
    'settings.language_section': 'Pilih Bahasa',
    'settings.language_desc': 'Ubah bahasa antarmuka aplikasi ke Bahasa Indonesia atau English.',
    'settings.theme_section': 'Pilih Tema Tampilan',
    'settings.theme_desc': 'Pilih tema gelap, terang, atau otomatis mengikuti sistem/panel.',
    'settings.theme_system': 'Otomatis (Sistem / Panel)',
    'settings.theme_light': 'Tema Terang',
    'settings.theme_dark': 'Tema Gelap',
    'settings.save_success': 'Pengaturan berhasil diperbarui!',
    'settings.lang_id': 'Bahasa Indonesia',
    'settings.lang_en': 'English',

    // Dashboard Home
    'dashboard.welcome': 'Selamat Datang di Support Center Kroombox',
    'dashboard.subtitle_customer': 'Pantau status layanan dan reward Anda di satu tempat.',
    'dashboard.subtitle_staff': 'Pantau kinerja sistem layanan pelanggan dan antrean tiket aktif.',
    'dashboard.system_normal': 'Semua Sistem Normal',
    'dashboard.open_ticket': 'Buka Tiket',
    'dashboard.open_ticket_desc': 'Laporkan kendala teknis layanan',
    'dashboard.redeem_points': 'Tukar Poin',
    'dashboard.redeem_points_desc': 'Gunakan voucher diskon belanja',
    'dashboard.community_forum': 'Forum Komunitas',
    'dashboard.community_forum_desc': 'Bantuan instan cerdas 24/7',
    'dashboard.active_services': 'Status Layanan Aktif',
    'dashboard.services_connected': '2 Layanan Terhubung',
    'dashboard.expires_on': 'Berakhir pada',
    'dashboard.active': 'Aktif',
    'dashboard.managed_by': 'Dikelola otomatis oleh Cloud Hosting Kroombox',
    'dashboard.uptime': 'Uptime',
    'dashboard.loyalty_points': 'POIN LOYALITAS',
    'dashboard.points_needed_prefix': 'poin lagi untuk',
    'dashboard.free_domain': 'Free Domain',
    'dashboard.can_redeem_domain': '✨ Bisa ditukar voucher Free Domain!',
    'dashboard.redeem_now': 'Tukar Sekarang',
    'dashboard.ticket_queue': 'Antrean Keluhan',
    'dashboard.ticket_queue_desc': 'Tinjau dan respon tiket customer',
    'dashboard.user_management': 'Manajemen Pengguna',
    'dashboard.user_management_desc': 'Kelola akun pengguna, staf, dan admin',
    'dashboard.ticket_settings': 'Pengaturan Tiket',
    'dashboard.ticket_settings_desc': 'Kategori, prioritas & konfigurasi SLA',
    'dashboard.tickets_in_progress': 'Tiket Diproses',
    'dashboard.tickets_in_progress_desc': 'Butuh penyelesaian segera',
    'dashboard.tickets_resolved': 'Tiket Selesai',
    'dashboard.tickets_resolved_desc': '+12% dari kemarin',
    'dashboard.csat_rating': 'Rating CSAT',
    'dashboard.csat_rating_desc': 'Berdasarkan 120 feedback',
    'dashboard.response_time': 'Waktu Respon',
    'dashboard.response_time_desc': 'Performa sangat baik',
    'dashboard.process_tickets_desc': 'Proses tiket masuk pelanggan',
    'dashboard.monitor_forum_desc': 'Pantau dan kelola diskusi publik',
    'dashboard.manage_users_desc': 'Kelola data pelanggan & staf',
    'dashboard.view_profile_desc': 'Lihat status kerja & personal info',

    // Profile Page
    'profile.title': 'Profil Pengguna',
    'profile.subtitle': 'Kelola informasi pribadi dan keamanan akun Anda.',
    'profile.save_btn': 'Simpan Perubahan',
    'profile.cancel_btn': 'Batal',
    'profile.name': 'Nama Lengkap',
    'profile.email': 'Alamat Email',
    'profile.status': 'Status Kerja',

    // Shared / Button
    'btn.back': 'Kembali',
    'btn.logout': 'Keluar',
    'btn.save': 'Simpan',
    'btn.cancel': 'Batal',

    // Landing Page
    'landing.login_btn': 'Masuk',
    'landing.register_btn': 'Mulai Sekarang',
    'landing.hero_badge': 'Teknologi AI & Gamifikasi',
    'landing.hero_title': 'Dukungan Pelanggan Modern',
    'landing.hero_subtitle': 'Layanan bantuan CRM terintegrasi AI dengan sistem reward koin yang interaktif. Memberikan solusi CRM terbaik untuk tingkatkan kepuasan pengguna.',
    'landing.hero_cta': 'Mulai Dasbor',
    'landing.features_title': 'Fitur Utama Ekosistem KroomCare',
    'landing.feature_1_title': 'Gamifikasi Koin Pelanggan',
    'landing.feature_1_desc': 'Dapatkan reward koin otomatis setiap kali mengajukan tiket bantuan atau aktif berdiskusi di forum komunitas. Koin dapat ditukar dengan rewards menarik.',
    'landing.feature_1_cta': 'Buka Halaman Rewards',
    'landing.feature_2_title': 'Manajemen Shift Staf',
    'landing.feature_2_desc': 'Staf dapat memperbarui status kerja secara real-time (Online, Sibuk, Offline) agar distribusi tiket bantuan hanya masuk ke staf yang sedang aktif.',
    'landing.feature_2_cta': 'Lihat Antrean Tiket',
    'landing.feature_3_title': 'Keamanan & Proteksi Ganda',
    'landing.feature_3_desc': 'Dilengkapi dengan sistem Autentikasi Dua Faktor (2FA) mandiri menggunakan Google Authenticator untuk mengamankan data sensitif pengguna.',
    'landing.feature_3_cta': 'Masuk untuk Pengaturan 2FA',
    'landing.footer_text': 'Meningkatkan loyalitas pelanggan melalui ekosistem CRM cerdas.',
  },
  en: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Community Forum',
    'nav.my_tickets': 'My Tickets',
    'nav.rewards': 'Rewards',
    'nav.points_history': 'Points History',
    'nav.profile': 'My Profile',
    'nav.settings': 'Settings',
    'nav.staff_dashboard': 'Staff Dashboard',
    'nav.ticket_queue': 'Ticket Queue',
    'nav.user_management': 'User Management',
    'nav.ticket_settings': 'Ticket Settings',
    'nav.api_integration': 'API Integration',

    // Header
    'header.notifications': 'Notifications',
    'header.no_notifications': 'No new notifications.',
    'header.info': 'Info',
    'header.loyalty': 'Loyalty',
    'header.pts': 'pts',
    'header.edit_profile': 'Edit Profile',
    'header.account_settings': 'Account Settings',
    'header.logout': 'Log Out',
    'header.switch_lang': 'Switch Language',
    'header.switch_theme': 'Toggle Theme',

    // Settings Page
    'settings.title': 'System Settings',
    'settings.subtitle': 'Customize KroomCare application appearance and language preferences.',
    'settings.language_section': 'Choose Language',
    'settings.language_desc': 'Change the application interface language to Indonesian or English.',
    'settings.theme_section': 'Choose Theme Mode',
    'settings.theme_desc': 'Choose light, dark, or automatic system/panel theme.',
    'settings.theme_system': 'Auto (System / Panel)',
    'settings.theme_light': 'Light Theme',
    'settings.theme_dark': 'Dark Theme',
    'settings.save_success': 'Settings saved successfully!',
    'settings.lang_id': 'Indonesian',
    'settings.lang_en': 'English',

    // Dashboard Home
    'dashboard.welcome': 'Welcome to Kroombox Support Center',
    'dashboard.subtitle_customer': 'Monitor your service status and rewards in one place.',
    'dashboard.subtitle_staff': 'Monitor customer service system performance and active ticket queue.',
    'dashboard.system_normal': 'All Systems Operational',
    'dashboard.open_ticket': 'Open Ticket',
    'dashboard.open_ticket_desc': 'Report technical service issues',
    'dashboard.redeem_points': 'Redeem Points',
    'dashboard.redeem_points_desc': 'Use discount shopping vouchers',
    'dashboard.community_forum': 'Community Forum',
    'dashboard.community_forum_desc': '24/7 intelligent instant help',
    'dashboard.active_services': 'Active Services Status',
    'dashboard.services_connected': '2 Services Connected',
    'dashboard.expires_on': 'Expires on',
    'dashboard.active': 'Active',
    'dashboard.managed_by': 'Managed automatically by Kroombox Cloud Hosting',
    'dashboard.uptime': 'Uptime',
    'dashboard.loyalty_points': 'LOYALTY POINTS',
    'dashboard.points_needed_prefix': 'more points for',
    'dashboard.free_domain': 'Free Domain',
    'dashboard.can_redeem_domain': '✨ Eligible to redeem Free Domain voucher!',
    'dashboard.redeem_now': 'Redeem Now',
    'dashboard.ticket_queue': 'Ticket Queue',
    'dashboard.ticket_queue_desc': 'Review and respond to customer tickets',
    'dashboard.user_management': 'User Management',
    'dashboard.user_management_desc': 'Manage user, staff, and admin accounts',
    'dashboard.ticket_settings': 'Ticket Settings',
    'dashboard.ticket_settings_desc': 'Categories, priorities & SLA configuration',
    'dashboard.tickets_in_progress': 'Tickets in Progress',
    'dashboard.tickets_in_progress_desc': 'Requires prompt action',
    'dashboard.tickets_resolved': 'Tickets Resolved',
    'dashboard.tickets_resolved_desc': '+12% from yesterday',
    'dashboard.csat_rating': 'CSAT Rating',
    'dashboard.csat_rating_desc': 'Based on 120 feedback',
    'dashboard.response_time': 'Response Time',
    'dashboard.response_time_desc': 'Optimal performance',
    'dashboard.process_tickets_desc': 'Process incoming customer tickets',
    'dashboard.monitor_forum_desc': 'Monitor and manage public discussions',
    'dashboard.manage_users_desc': 'Manage customers & staff data',
    'dashboard.view_profile_desc': 'View work status & personal info',

    // Profile Page
    'profile.title': 'User Profile',
    'profile.subtitle': 'Manage your personal information and account security.',
    'profile.save_btn': 'Save Changes',
    'profile.cancel_btn': 'Cancel',
    'profile.name': 'Full Name',
    'profile.email': 'Email Address',
    'profile.status': 'Work Status',

    // Shared / Button
    'btn.back': 'Back',
    'btn.logout': 'Log Out',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',

    // Landing Page
    'landing.login_btn': 'Log In',
    'landing.register_btn': 'Get Started',
    'landing.hero_badge': 'AI & Gamification Power',
    'landing.hero_title': 'Modern Customer Support',
    'landing.hero_subtitle': 'AI-assisted CRM platform with an interactive coin reward system. Delivers the ultimate customer support experience to enhance retention.',
    'landing.hero_cta': 'Explore Dashboard',
    'landing.features_title': 'Key Features of KroomCare Ecosystem',
    'landing.feature_1_title': 'Customer Coin Gamification',
    'landing.feature_1_desc': 'Earn automatic coin rewards for every ticket submitted or active discussion in the community forum. Redeem accumulated coins for benefits.',
    'landing.feature_1_cta': 'Go to Rewards Page',
    'landing.feature_2_title': 'Agent Shift Management',
    'landing.feature_2_desc': 'Agents can toggle their status in real-time (Online, Busy, Offline). Ensures incoming tickets are routed only to available agents.',
    'landing.feature_2_cta': 'Inspect Ticket Queue',
    'landing.feature_3_title': 'Two-Factor Authentication',
    'landing.feature_3_desc': 'Dashboard security reinforced with Google Authenticator TOTP 2FA. Safeguards your administrative and personal workspace data.',
    'landing.feature_3_cta': 'Login to Set up 2FA',
    'landing.footer_text': 'Driving customer loyalty through innovative CRM ecosystem.',
  }
};

// Get shared theme cookie set across .kroombox.com domain by Kroombox Panel
function getSharedCookieTheme(): Theme | null {
  try {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)kp_theme=([^;]+)/);
      if (match) {
        const val = decodeURIComponent(match[1]).trim().toLowerCase();
        if (val === 'dark' || val === 'light') return val as Theme;
      }
    }
  } catch (_) {}
  return null;
}

// Store last known theme reported by parent panel (via postMessage, cookie, URL, storage, or parent DOM)
let lastKnownParentTheme: Theme | null = (() => {
  try {
    const fromCookie = getSharedCookieTheme();
    if (fromCookie) return fromCookie;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kroombox_parent_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }
  } catch (_) {}
  return null;
})();

function detectParentTheme(): Theme | null {
  // 1. Shared cookie across .kroombox.com is completely immune to iframe SOP restrictions
  const cookieTheme = getSharedCookieTheme();
  if (cookieTheme) {
    lastKnownParentTheme = cookieTheme;
    try { localStorage.setItem('kroombox_parent_theme', cookieTheme); } catch (_) {}
    return cookieTheme;
  }

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      // 2. Check parent localStorage if accessible
      try {
        const pStorage = window.parent.localStorage;
        if (pStorage) {
          for (const key of ['kp_theme', 'theme', 'kroombox_theme', 'kolab_theme', 'theme_mode', 'mode', 'color-theme', 'next-theme']) {
            const val = pStorage.getItem(key);
            if (val === 'dark' || val === 'light') {
              lastKnownParentTheme = val;
              try { localStorage.setItem('kroombox_parent_theme', val); } catch (_) {}
              return val;
            }
          }
        }
      } catch (_) {}

      const pDoc = window.parent.document;
      const pHtml = pDoc.documentElement;
      const pBody = pDoc.body;

      // 3. Check if parent explicitly has dark classes or data attributes
      if (
        pHtml.classList.contains('dark') ||
        pHtml.classList.contains('theme-dark') ||
        pHtml.classList.contains('dark-mode') ||
        pHtml.classList.contains('night') ||
        pBody.classList.contains('dark') ||
        pBody.classList.contains('theme-dark') ||
        pBody.classList.contains('dark-mode') ||
        pBody.classList.contains('night') ||
        pHtml.getAttribute('data-theme') === 'dark' ||
        pHtml.getAttribute('data-mode') === 'dark' ||
        pHtml.getAttribute('data-color-mode') === 'dark' ||
        pBody.getAttribute('data-theme') === 'dark' ||
        pBody.getAttribute('data-mode') === 'dark' ||
        pBody.getAttribute('data-color-mode') === 'dark'
      ) {
        lastKnownParentTheme = 'dark';
        try { localStorage.setItem('kroombox_parent_theme', 'dark'); } catch (_) {}
        return 'dark';
      }

      // Check root container in parent
      const pRoot = pDoc.getElementById('root') || pDoc.querySelector('#app') || pDoc.querySelector('main');
      if (pRoot) {
        if (
          pRoot.classList.contains('dark') ||
          pRoot.classList.contains('theme-dark') ||
          pRoot.getAttribute('data-theme') === 'dark' ||
          pRoot.getAttribute('data-mode') === 'dark'
        ) {
          lastKnownParentTheme = 'dark';
          try { localStorage.setItem('kroombox_parent_theme', 'dark'); } catch (_) {}
          return 'dark';
        }
      }

      // 4. Check computed background color brightness of parent elements
      const checkBg = (el: Element | null): Theme | null => {
        if (!el) return null;
        try {
          const bg = window.parent.getComputedStyle(el).backgroundColor;
          if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
            const rgb = bg.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
              const brightness = (parseInt(rgb[0], 10) * 299 + parseInt(rgb[1], 10) * 587 + parseInt(rgb[2], 10) * 114) / 1000;
              return brightness < 128 ? 'dark' : 'light';
            }
          }
        } catch (_) {}
        return null;
      };

      const bodyTheme = checkBg(pBody);
      if (bodyTheme) {
        lastKnownParentTheme = bodyTheme;
        try { localStorage.setItem('kroombox_parent_theme', bodyTheme); } catch (_) {}
        return bodyTheme;
      }

      const htmlTheme = checkBg(pHtml);
      if (htmlTheme) {
        lastKnownParentTheme = htmlTheme;
        try { localStorage.setItem('kroombox_parent_theme', htmlTheme); } catch (_) {}
        return htmlTheme;
      }

      if (pRoot) {
        const rootTheme = checkBg(pRoot);
        if (rootTheme) {
          lastKnownParentTheme = rootTheme;
          try { localStorage.setItem('kroombox_parent_theme', rootTheme); } catch (_) {}
          return rootTheme;
        }
      }

      // Parent document was accessible and has NO dark indicators -> Parent is in LIGHT mode!
      lastKnownParentTheme = 'light';
      try { localStorage.setItem('kroombox_parent_theme', 'light'); } catch (_) {}
      return 'light';
    }
  } catch (_) {
    // Cross-origin restriction: check shared cookie first, then last known parent theme, then stored
    const fallbackCookie = getSharedCookieTheme();
    if (fallbackCookie) return fallbackCookie;
    if (lastKnownParentTheme) {
      return lastKnownParentTheme;
    }
    try {
      const stored = localStorage.getItem('kroombox_parent_theme') as Theme;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) {}
    return null;
  }
  return null;
}

function resolveSystemTheme(): Theme {
  // 1. Check URL Parameter ?theme=dark / ?theme=light / ?mode=dark / ?mode=light
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme') || params.get('mode') || params.get('themeMode') || params.get('colorScheme');
      if (urlTheme === 'dark' || urlTheme === 'light') {
        lastKnownParentTheme = urlTheme;
        try { localStorage.setItem('kroombox_parent_theme', urlTheme); } catch (_) {}
        return urlTheme;
      }
    }
  } catch (_) {}

  // 2. Check shared cookie from Kroombox Panel (accessible even across subdomains)
  const cookieTheme = getSharedCookieTheme();
  if (cookieTheme) {
    lastKnownParentTheme = cookieTheme;
    return cookieTheme;
  }

  // 3. Check parent iframe theme (Kroombox Panel)
  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;
  if (isEmbedded) {
    const parentTheme = detectParentTheme();
    if (parentTheme) {
      return parentTheme;
    }
    if (lastKnownParentTheme) {
      return lastKnownParentTheme;
    }
    // If embedded and no explicit parent theme detected, default to 'light' (matching Kroombox Panel's base UI)
    return 'light';
  }

  // 4. Standalone direct window or fallback: check system media query
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }

  return 'light';
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kroomcare_lang');
        if (saved === 'id' || saved === 'en') return saved as Language;
      } catch (_) {}
    }
    return 'id';
  });

  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

  // User preference: 'system' | 'light' | 'dark'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') || params.get('mode');
        if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
      } catch (_) {}
    }
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('kroomcare_theme_mode') : null;
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode as ThemeMode;
    }
    return isEmbedded ? 'system' : (savedMode === 'system' ? 'system' : 'system');
  });

  // Current active resolved theme: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') || params.get('mode');
        if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
      } catch (_) {}
      const savedMode = localStorage.getItem('kroomcare_theme_mode');
      if (savedMode === 'dark' || savedMode === 'light') return savedMode;
    }
    return resolveSystemTheme();
  });

  const applyThemeToDOM = useCallback((t: Theme) => {
    const root = window.document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kroomcare_lang', lang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
    } catch (_) {}
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('kroomcare_theme_mode', mode);
    if (mode === 'dark') {
      setResolvedTheme('dark');
      applyThemeToDOM('dark');
    } else if (mode === 'light') {
      setResolvedTheme('light');
      applyThemeToDOM('light');
    } else {
      const sys = resolveSystemTheme();
      setResolvedTheme(sys);
      applyThemeToDOM(sys);
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  // Helper to parse any incoming message format into Theme
  const parseThemeFromData = (data: any): Theme | null => {
    if (!data) return null;
    if (typeof data === 'string') {
      const lower = data.toLowerCase().trim();
      if (lower === 'dark' || lower === 'light') return lower as Theme;
      if (lower === 'theme:dark') return 'dark';
      if (lower === 'theme:light') return 'light';
      try {
        const parsed = JSON.parse(data);
        return parseThemeFromData(parsed);
      } catch (_) {}
    }
    if (typeof data === 'object') {
      if (data.theme === 'dark' || data.theme === 'light') return data.theme;
      if (data.mode === 'dark' || data.mode === 'light') return data.mode;
      if (data.colorScheme === 'dark' || data.colorScheme === 'light') return data.colorScheme;
      if (data.payload === 'dark' || data.payload === 'light') return data.payload;
      if (data.payload && typeof data.payload === 'object') {
        if (data.payload.theme === 'dark' || data.payload.theme === 'light') return data.payload.theme;
        if (data.payload.mode === 'dark' || data.payload.mode === 'light') return data.payload.mode;
      }
      if (data.data === 'dark' || data.data === 'light') return data.data;
      if (data.data && typeof data.data === 'object') {
        if (data.data.theme === 'dark' || data.data.theme === 'light') return data.data.theme;
        if (data.data.mode === 'dark' || data.data.mode === 'light') return data.data.mode;
      }
      if (data.value === 'dark' || data.value === 'light') return data.value;
    }
    return null;
  };

  // Re-sync with system or parent when in 'system' mode or when embedded
  useEffect(() => {
    // If user is explicitly locked to 'light' or 'dark', honor it
    if (themeMode !== 'system') {
      applyThemeToDOM(themeMode);
      setResolvedTheme(themeMode);
      return;
    }

    const syncTheme = (newTheme: Theme) => {
      setResolvedTheme(prev => {
        if (prev !== newTheme) {
          applyThemeToDOM(newTheme);
          return newTheme;
        }
        return prev;
      });
      applyThemeToDOM(newTheme);
    };

    // Initial check
    const currentSys = resolveSystemTheme();
    syncTheme(currentSys);

    // 1. Listen to system preference changes (for standalone mode)
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleMediaChange = () => {
      const nextTheme = resolveSystemTheme();
      syncTheme(nextTheme);
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    // 2. Listen to postMessage from parent (Kroombox Panel theme broadcast)
    const handleMessage = (event: MessageEvent) => {
      const incomingTheme = parseThemeFromData(event.data);
      if (incomingTheme) {
        lastKnownParentTheme = incomingTheme;
        try { localStorage.setItem('kroombox_parent_theme', incomingTheme); } catch (_) {}
        syncTheme(incomingTheme);
      }
    };
    window.addEventListener('message', handleMessage);

    // 3. MutationObserver on parent document if same-origin (0ms real-time responsive sync)
    let parentObserver: MutationObserver | null = null;
    let onParentStorage: (() => void) | null = null;
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window && window.parent.document) {
        const syncFromParent = () => {
          const latest = detectParentTheme();
          if (latest) {
            syncTheme(latest);
          }
        };

        parentObserver = new MutationObserver(syncFromParent);
        if (window.parent.document.documentElement) {
          parentObserver.observe(window.parent.document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-mode', 'data-color-mode', 'style']
          });
        }
        if (window.parent.document.body) {
          parentObserver.observe(window.parent.document.body, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-mode', 'data-color-mode', 'style']
          });
        }

        onParentStorage = syncFromParent;
        window.parent.addEventListener('storage', onParentStorage);
      }
    } catch (_) {}

    // 4. Request initial theme from parent if embedded in iframe
    if (isEmbedded) {
      try {
        window.parent.postMessage({ type: 'GET_THEME' }, '*');
        window.parent.postMessage({ type: 'REQUEST_THEME' }, '*');
        window.parent.postMessage({ type: 'KP_GET_THEME' }, '*');
        window.parent.postMessage('getTheme', '*');
      } catch (_) {}
    }

    // 5. Polling interval (200ms) for ultra-responsiveness
    const interval = setInterval(() => {
      const latest = resolveSystemTheme();
      syncTheme(latest);
    }, 200);

    // 6. Focus & Visibility listener
    const handleVisibility = () => {
      const latest = resolveSystemTheme();
      setResolvedTheme(latest);
      applyThemeToDOM(latest);
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({ type: 'GET_THEME' }, '*');
        } catch (_) {}
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
      window.removeEventListener('message', handleMessage);
      if (parentObserver) {
        parentObserver.disconnect();
      }
      if (onParentStorage) {
        try { window.parent.removeEventListener('storage', onParentStorage); } catch (_) {}
      }
      clearInterval(interval);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [themeMode, applyThemeToDOM]);

  const t = (key: string): string => {
    const langDict = (translations[language] || translations['id']) as Record<string, string>;
    const defaultDict = translations['id'] as Record<string, string>;
    const enDict = translations['en'] as Record<string, string>;
    return langDict[key] || defaultDict[key] || enDict[key] || key;
  };

  return (
    <LanguageThemeContext.Provider value={{ language, setLanguage, toggleLanguage, theme: resolvedTheme, themeMode, setTheme, toggleTheme, t }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
