import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'id' | 'en';
type Theme = 'light' | 'dark';

interface LanguageThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Forum Komunitas',
    'nav.my_tickets': 'Tiket Saya',
    'nav.rewards': 'Rewards',
    'nav.points_history': 'Riwayat Poin',
    'nav.profile': 'Profil Saya',
    'nav.settings': 'Pengaturan',
    'nav.staff_dashboard': 'Dashboard Staff',
    'nav.ticket_queue': 'Antrean Keluhan',
    'nav.user_management': 'Manajemen User',
    'nav.ticket_settings': 'Pengaturan Tiket',

    // Settings Page
    'settings.title': 'Pengaturan Sistem',
    'settings.subtitle': 'Sesuaikan bahasa dan tema aplikasi KroomCare Anda.',
    'settings.language_section': 'Pilih Bahasa',
    'settings.language_desc': 'Ubah bahasa antarmuka aplikasi.',
    'settings.theme_section': 'Pilih Tema Tampilan',
    'settings.theme_desc': 'Pilih tema gelap atau terang sesuai kenyamanan mata Anda.',
    'settings.theme_light': 'Tema Terang',
    'settings.theme_dark': 'Tema Gelap',
    'settings.save_success': 'Pengaturan berhasil disimpan!',

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

    // Settings Page
    'settings.title': 'System Settings',
    'settings.subtitle': 'Customize KroomCare application language and theme.',
    'settings.language_section': 'Choose Language',
    'settings.language_desc': 'Change the application interface language.',
    'settings.theme_section': 'Choose Theme Mode',
    'settings.theme_desc': 'Choose light or dark theme for your visual comfort.',
    'settings.theme_light': 'Light Theme',
    'settings.theme_dark': 'Dark Theme',
    'settings.save_success': 'Settings saved successfully!',

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

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kroomcare_lang') as Language) || 'id';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('kroomcare_theme') as Theme) || 'light';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kroomcare_lang', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kroomcare_theme', newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: string): string => {
    const langDict = translations[language] as Record<string, string>;
    return langDict[key] || translations['id'][key as keyof typeof translations['id']] || key;
  };

  return (
    <LanguageThemeContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
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
