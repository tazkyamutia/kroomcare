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

    // Tickets
    'tickets.title': 'Tiket Saya',
    'tickets.subtitle': 'Daftar keluhan privat Anda. Hanya Anda dan Tim Support KroomCare yang dapat melihat diskusi di sini.',
    'tickets.create_btn': 'Buat Keluhan',
    'tickets.tab_active': 'Aktif',
    'tickets.tab_resolved': 'Selesai',
    'tickets.tab_all': 'Semua',
    'tickets.search_placeholder': 'Cari berdasarkan judul atau isi kendala...',
    'tickets.no_tickets': 'Belum ada tiket keluhan.',
    'tickets.no_tickets_desc': 'Jika Anda mengalami kendala teknis atau pertanyaan, buat tiket keluhan baru untuk bantuan tim kami.',
    'tickets.status_resolved': 'Selesai',
    'tickets.status_waiting': 'Menunggu',
    'tickets.status_processing': 'Diproses',
    'tickets.priority': 'Prioritas',
    'tickets.create_title': 'Buat Tiket Baru',
    'tickets.create_subtitle': 'Ajukan keluhan atau kendala teknis layanan Anda',
    'tickets.subject': 'Subjek Kendala',
    'tickets.subject_placeholder': 'Contoh: Website Error 500',
    'tickets.category': 'Kategori',
    'tickets.priority_label': 'Tingkat Prioritas',
    'tickets.priority_normal': 'Normal (Reguler)',
    'tickets.priority_high': 'Tinggi (Urgent)',
    'tickets.description': 'Detail Keluhan',
    'tickets.description_placeholder': 'Jelaskan kendala Anda secara rinci...',
    'tickets.submit_btn': 'Kirim Tiket',
    'tickets.submitting': 'Mengirim...',
    'tickets.coin_reward_notice': 'Dapatkan +50 Kroom Poin setelah tiket dibuat!',
    'tickets.success_created': 'Tiket berhasil dibuat!',
    'tickets.error_created': 'Gagal membuat tiket.',
    'tickets.must_login': 'Anda harus login terlebih dahulu.',

    // Forum
    'forum.title': 'Forum Komunitas',
    'forum.subtitle': 'Berbagi pengalaman, bertanya, dan berdiskusi dengan sesama pengguna secara terbuka.',
    'forum.create_btn': 'Mulai Diskusi',
    'forum.search_placeholder': 'Cari diskusi di forum...',
    'forum.filter_title': 'Filter Diskusi',
    'forum.recent_discussions': 'Diskusi Terbaru',
    'forum.replies': 'Balasan',
    'forum.view_discussion': 'Lihat Diskusi',
    'forum.no_threads': 'Diskusi tidak ditemukan',
    'forum.no_threads_desc': 'Jadilah yang pertama untuk memulai diskusi baru di forum komunitas kami.',
    'forum.create_first_discussion': 'Buat Diskusi Pertama',
    'forum.modal_title': 'Mulai Diskusi Baru',
    'forum.form_subject': 'Subjek/Judul Diskusi',
    'forum.form_subject_placeholder': 'Contoh: Optimasi Cache VPS',
    'forum.form_content': 'Konten Pertanyaan / Diskusi',
    'forum.form_content_placeholder': 'Tuliskan detail pertanyaan atau topik yang ingin didiskusikan...',
    'forum.submitting': 'Mengirim...',
    'forum.create_thread_btn': 'Buat Thread',
    'forum.must_login': 'Anda harus login terlebih dahulu.',
    'forum.required_fields': 'Judul dan konten wajib diisi.',
    'forum.create_success': 'Diskusi forum berhasil dibuat!',
    'forum.create_fail': 'Gagal membuat diskusi.',
    'forum.connection_error': 'Terjadi kesalahan koneksi server.',
    'forum.badge': 'FORUM',

    // Rewards
    'rewards.title': 'Manajemen Poin & Voucher',
    'rewards.subtitle': 'Kumpulkan poin dari aktivitas Anda dan tukarkan dengan voucher menarik.',
    'rewards.total_points': 'Total Poin Anda',
    'rewards.pts': 'pts',
    'rewards.estimated_value': 'Estimasi Nilai Tukar',
    'rewards.history_title': 'Riwayat Poin',
    'rewards.view_all': 'Lihat Semua',
    'rewards.no_history': 'Belum ada riwayat transaksi.',
    'rewards.redeem_voucher': 'Tukarkan Voucher',
    'rewards.redeemed_success': 'Voucher Berhasil Ditukarkan!',
    'rewards.redeemed_code_instruction': 'Gunakan kode voucher di bawah ini saat checkout:',
    'rewards.close': 'Tutup',
    'rewards.valid_until': 'Berlaku hingga',
    'rewards.redeem_button': 'Tukarkan',
    'rewards.confirm_title': 'Konfirmasi Penukaran',
    'rewards.confirm_message_prefix': 'Apakah Anda yakin ingin menukarkan',
    'rewards.confirm_points': 'Poin',
    'rewards.confirm_for': 'untuk',
    'rewards.cancel': 'Batal',
    'rewards.confirm_button': 'Tukar',
    'rewards.must_login': 'Anda harus login terlebih dahulu.',
    'rewards.insufficient_points': 'Koin tidak mencukupi.',
    'rewards.redeem_success_toast': 'Voucher berhasil ditukarkan!',
    'rewards.redeem_fail': 'Gagal menukarkan voucher.',
    'rewards.connection_error': 'Terjadi kesalahan koneksi.',
    'rewards.my_balance': 'Saldo Koin Saya',
    'rewards.redeem_btn': 'Tukar Voucher',

    // Points History
    'points_history.title': 'Riwayat Poin',
    'points_history.subtitle': 'Pantau perolehan dan penggunaan poin loyalitas Anda.',
    'points_history.total_earned': 'Total Poin Masuk',
    'points_history.total_spent': 'Total Poin Keluar',
    'points_history.list_title': 'Daftar Transaksi',
    'points_history.search_placeholder': 'Cari transaksi...',
    'points_history.col_id': 'ID Transaksi',
    'points_history.col_desc': 'Keterangan',
    'points_history.col_date': 'Tanggal',
    'points_history.col_type': 'Tipe',
    'points_history.col_amount': 'Jumlah',
    'points_history.type_in': 'Masuk',
    'points_history.type_out': 'Keluar',
    'points_history.no_data': 'Belum ada riwayat transaksi poin.',
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

    // Tickets
    'tickets.title': 'My Tickets',
    'tickets.subtitle': 'Your private support requests. Only you and the KroomCare Support Team can access discussions here.',
    'tickets.create_btn': 'Create Ticket',
    'tickets.tab_active': 'Active',
    'tickets.tab_resolved': 'Resolved',
    'tickets.tab_all': 'All',
    'tickets.search_placeholder': 'Search by subject or description...',
    'tickets.no_tickets': 'No tickets found.',
    'tickets.no_tickets_desc': 'If you are facing technical issues or have inquiries, open a support ticket for assistance.',
    'tickets.status_resolved': 'Resolved',
    'tickets.status_waiting': 'Waiting',
    'tickets.status_processing': 'Processing',
    'tickets.priority': 'Priority',
    'tickets.create_title': 'Create New Ticket',
    'tickets.create_subtitle': 'Submit a technical inquiry or issue with your service',
    'tickets.subject': 'Issue Subject',
    'tickets.subject_placeholder': 'e.g. Website Error 500',
    'tickets.category': 'Category',
    'tickets.priority_label': 'Priority Level',
    'tickets.priority_normal': 'Normal (Standard)',
    'tickets.priority_high': 'High (Urgent)',
    'tickets.description': 'Issue Description',
    'tickets.description_placeholder': 'Describe your issue in detail...',
    'tickets.submit_btn': 'Submit Ticket',
    'tickets.submitting': 'Submitting...',
    'tickets.coin_reward_notice': 'Earn +50 Kroom Points once ticket is submitted!',
    'tickets.success_created': 'Ticket created successfully!',
    'tickets.error_created': 'Failed to create ticket.',
    'tickets.must_login': 'You must be logged in first.',

    // Forum
    'forum.title': 'Community Forum',
    'forum.subtitle': 'Share experiences, ask questions, and discuss openly with fellow users.',
    'forum.create_btn': 'Start Discussion',
    'forum.search_placeholder': 'Search discussions in forum...',
    'forum.filter_title': 'Filter Discussions',
    'forum.recent_discussions': 'Recent Discussions',
    'forum.replies': 'Replies',
    'forum.view_discussion': 'View Discussion',
    'forum.no_threads': 'No discussions found',
    'forum.no_threads_desc': 'Be the first to start a new discussion in our community forum.',
    'forum.create_first_discussion': 'Create First Discussion',
    'forum.modal_title': 'Start New Discussion',
    'forum.form_subject': 'Discussion Subject/Title',
    'forum.form_subject_placeholder': 'e.g. VPS Cache Optimization',
    'forum.form_content': 'Question / Discussion Content',
    'forum.form_content_placeholder': 'Write down detailed questions or topics you would like to discuss...',
    'forum.submitting': 'Submitting...',
    'forum.create_thread_btn': 'Post Thread',
    'forum.must_login': 'You must be logged in first.',
    'forum.required_fields': 'Subject and content are required.',
    'forum.create_success': 'Forum discussion created successfully!',
    'forum.create_fail': 'Failed to create discussion.',
    'forum.connection_error': 'Server connection error.',
    'forum.badge': 'FORUM',

    // Rewards
    'rewards.title': 'Points & Voucher Management',
    'rewards.subtitle': 'Collect points from your activities and redeem them for exciting vouchers.',
    'rewards.total_points': 'Your Total Points',
    'rewards.pts': 'pts',
    'rewards.estimated_value': 'Estimated Exchange Value',
    'rewards.history_title': 'Points History',
    'rewards.view_all': 'View All',
    'rewards.no_history': 'No transaction history yet.',
    'rewards.redeem_voucher': 'Redeem Vouchers',
    'rewards.redeemed_success': 'Voucher Successfully Redeemed!',
    'rewards.redeemed_code_instruction': 'Use the voucher code below during checkout:',
    'rewards.close': 'Close',
    'rewards.valid_until': 'Valid until',
    'rewards.redeem_button': 'Redeem',
    'rewards.confirm_title': 'Confirm Redemption',
    'rewards.confirm_message_prefix': 'Are you sure you want to redeem',
    'rewards.confirm_points': 'Points',
    'rewards.confirm_for': 'for',
    'rewards.cancel': 'Cancel',
    'rewards.confirm_button': 'Redeem',
    'rewards.must_login': 'You must be logged in first.',
    'rewards.insufficient_points': 'Insufficient points.',
    'rewards.redeem_success_toast': 'Voucher redeemed successfully!',
    'rewards.redeem_fail': 'Failed to redeem voucher.',
    'rewards.connection_error': 'Connection error occurred.',
    'rewards.my_balance': 'My Coin Balance',
    'rewards.redeem_btn': 'Redeem Voucher',

    // Points History
    'points_history.title': 'Points History',
    'points_history.subtitle': 'Monitor your earned and spent loyalty points.',
    'points_history.total_earned': 'Total Points In',
    'points_history.total_spent': 'Total Points Out',
    'points_history.list_title': 'Transaction List',
    'points_history.search_placeholder': 'Search transactions...',
    'points_history.col_id': 'Transaction ID',
    'points_history.col_desc': 'Description',
    'points_history.col_date': 'Date',
    'points_history.col_type': 'Type',
    'points_history.col_amount': 'Amount',
    'points_history.type_in': 'In',
    'points_history.type_out': 'Out',
    'points_history.no_data': 'No points transaction history yet.',
  }
};

// Get shared cookie set across .kroombox.com domain by Kroombox Panel
function getSharedCookie(name: string): string | null {
  try {
    if (typeof document !== 'undefined') {
      const regex = new RegExp('(?:^|;\\s*)' + name + '=([^;]+)');
      const match = document.cookie.match(regex);
      if (match) {
        return decodeURIComponent(match[1]).trim();
      }
    }
  } catch (_) {}
  return null;
}

function getSharedCookieTheme(): Theme | null {
  for (const name of ['kp_theme', 'kroombox_theme', 'theme', 'panel_theme', 'theme_mode']) {
    const val = getSharedCookie(name)?.toLowerCase().trim();
    if (val === 'dark' || val === 'light') return val as Theme;
  }
  return null;
}

let lastKnownParentLang: Language | null = null;

// Detect language from Kroombox Panel (URL param, shared cookies, parent document, or broadcast)
function detectParentLanguage(): Language | null {
  if (typeof window === 'undefined') return null;

  // 1. Live parent document inspection if accessible (single source of truth)
  try {
    if (window.parent && window.parent !== window) {
      const pDoc = window.parent.document;
      if (pDoc) {
        const pStorage = window.parent.localStorage;
        if (pStorage) {
          for (const key of ['kp_language', 'kp_lang', 'kroombox_lang', 'lang', 'language', 'locale', 'i18nextLng']) {
            const val = (pStorage.getItem(key) || '').toLowerCase().trim();
            if (val.startsWith('en')) {
              lastKnownParentLang = 'en';
              return 'en';
            }
            if (val.startsWith('id')) {
              lastKnownParentLang = 'id';
              return 'id';
            }
          }
        }

        const docLang = (pDoc.documentElement.lang || pDoc.body?.getAttribute('data-lang') || pDoc.body?.getAttribute('data-locale') || '').toLowerCase().trim();
        if (docLang.startsWith('en')) {
          lastKnownParentLang = 'en';
          return 'en';
        }
        if (docLang.startsWith('id')) {
          lastKnownParentLang = 'id';
          return 'id';
        }
      }
    }
  } catch (_) {}

  // 2. Shared cookies with Kroombox Panel (kp_language, kp_lang, kroombox_lang)
  const cookieNames = ['kp_language', 'kp_lang', 'kroombox_lang', 'kroombox_language', 'panel_lang', 'lang', 'locale'];
  for (const name of cookieNames) {
    const val = getSharedCookie(name)?.toLowerCase().trim();
    if (val) {
      if (val.startsWith('en')) {
        lastKnownParentLang = 'en';
        return 'en';
      }
      if (val.startsWith('id')) {
        lastKnownParentLang = 'id';
        return 'id';
      }
    }
  }

  // 3. Stored last known parent language (from live postMessage broadcast)
  if (lastKnownParentLang) return lastKnownParentLang;
  try {
    const stored = localStorage.getItem('kroombox_parent_lang');
    if (stored === 'en' || stored === 'id') return stored as Language;
  } catch (_) {}

  // 4. Initial cold fallback ONLY: URL search params (e.g. ?lang=id or ?lang=en)
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = (params.get('lang') || params.get('locale') || params.get('language') || '').toLowerCase().trim();
    if (urlLang.startsWith('en')) {
      lastKnownParentLang = 'en';
      return 'en';
    }
    if (urlLang.startsWith('id')) {
      lastKnownParentLang = 'id';
      return 'id';
    }
  } catch (_) {}

  return null;
}

function parseLanguageFromData(data: any): Language | null {
  if (!data) return null;
  if (typeof data === 'string') {
    const lower = data.toLowerCase().trim();
    if (lower === 'id' || lower === 'en') return lower as Language;
    if (lower === 'lang:id' || lower === 'language:id') return 'id';
    if (lower === 'lang:en' || lower === 'language:en') return 'en';
    try {
      const parsed = JSON.parse(data);
      return parseLanguageFromData(parsed);
    } catch (_) {}
  }
  if (typeof data === 'object') {
    if (data.type === 'KROOMBOX_LANG_CHANGE' || data.type === 'LANG_CHANGE' || data.type === 'LANGUAGE_CHANGE' || data.type === 'SET_LANGUAGE') {
      const val = (data.lang || data.language || data.locale || '').toLowerCase().trim();
      if (val.startsWith('en')) return 'en';
      if (val.startsWith('id')) return 'id';
    }
    const candidate = data.lang || data.language || data.locale || data.kp_lang;
    if (typeof candidate === 'string') {
      const lower = candidate.toLowerCase().trim();
      if (lower.startsWith('en')) return 'en';
      if (lower.startsWith('id')) return 'id';
    }
    if (data.payload) return parseLanguageFromData(data.payload);
    if (data.data) return parseLanguageFromData(data.data);
  }
  return null;
}

// Store last known theme reported by parent panel (via postMessage, cookie, URL, storage, or parent DOM)
let lastKnownParentTheme: Theme | null = (() => {
  try {
    const fromCookie = getSharedCookieTheme();
    if (fromCookie) return fromCookie;
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
          for (const key of ['kp_theme', 'theme', 'kroombox_theme', 'kolab_theme', 'theme_mode', 'mode', 'color-theme', 'next-theme', 'color_mode']) {
            const val = pStorage.getItem(key)?.toLowerCase().trim();
            if (val === 'dark' || val === 'light') {
              lastKnownParentTheme = val as Theme;
              try { localStorage.setItem('kroombox_parent_theme', val); } catch (_) {}
              return val as Theme;
            }
          }
        }
      } catch (_) {}

      const pDoc = window.parent.document;
      if (pDoc) {
        const pHtml = pDoc.documentElement;
        const pBody = pDoc.body;

        // 3. Check if parent explicitly has dark classes or data attributes
        const hasDarkClass =
          pHtml.classList.contains('dark') ||
          pHtml.classList.contains('theme-dark') ||
          pHtml.classList.contains('dark-mode') ||
          pHtml.classList.contains('night') ||
          Boolean(pBody?.classList.contains('dark')) ||
          Boolean(pBody?.classList.contains('theme-dark')) ||
          Boolean(pBody?.classList.contains('dark-mode')) ||
          Boolean(pBody?.classList.contains('night')) ||
          pHtml.getAttribute('data-theme') === 'dark' ||
          pHtml.getAttribute('data-mode') === 'dark' ||
          pHtml.getAttribute('data-color-mode') === 'dark' ||
          pBody?.getAttribute('data-theme') === 'dark' ||
          pBody?.getAttribute('data-mode') === 'dark' ||
          pBody?.getAttribute('data-color-mode') === 'dark';

        if (hasDarkClass) {
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
        if (bodyTheme === 'dark') {
          lastKnownParentTheme = 'dark';
          try { localStorage.setItem('kroombox_parent_theme', 'dark'); } catch (_) {}
          return 'dark';
        }

        const htmlTheme = checkBg(pHtml);
        if (htmlTheme === 'dark') {
          lastKnownParentTheme = 'dark';
          try { localStorage.setItem('kroombox_parent_theme', 'dark'); } catch (_) {}
          return 'dark';
        }

        if (pRoot) {
          const rootTheme = checkBg(pRoot);
          if (rootTheme === 'dark') {
            lastKnownParentTheme = 'dark';
            try { localStorage.setItem('kroombox_parent_theme', 'dark'); } catch (_) {}
            return 'dark';
          }
        }

        // Parent document is accessible and has NO dark indicators -> Parent is in LIGHT mode!
        lastKnownParentTheme = 'light';
        try { localStorage.setItem('kroombox_parent_theme', 'light'); } catch (_) {}
        return 'light';
      }
    }
  } catch (_) {
    // Cross-origin SOP restriction: parent document is not directly inspectable
  }

  // 5. Stored last known parent theme from past sync or broadcast
  if (lastKnownParentTheme) return lastKnownParentTheme;

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

  // 3. Check parent iframe theme (Kroombox Panel Support Center)
  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;
  if (isEmbedded) {
    const parentTheme = detectParentTheme();
    if (parentTheme) {
      return parentTheme;
    }
    if (lastKnownParentTheme) {
      return lastKnownParentTheme;
    }
    // When embedded in Kroombox Panel and parent theme not explicitly detected:
    // Check OS / system media query preference, default to 'light' (matching Kroombox Panel's clean light UI)
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
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
  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      if (isEmbedded) {
        // When embedded in Support Center: ALWAYS prioritize Kroombox Panel's language!
        const parentLang = detectParentLanguage();
        if (parentLang) return parentLang;
        const savedEmbedded = localStorage.getItem('kroombox_parent_lang');
        if (savedEmbedded === 'id' || savedEmbedded === 'en') return savedEmbedded as Language;
        return 'id';
      } else {
        // Standalone KroomCare CRM: use KroomCare's own independent setting!
        try {
          const savedStandalone = localStorage.getItem('kroomcare_lang');
          if (savedStandalone === 'id' || savedStandalone === 'en') return savedStandalone as Language;
        } catch (_) {}
        return 'id';
      }
    }
    return 'id';
  });

  // User preference: 'system' | 'light' | 'dark'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') || params.get('mode');
        if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
      } catch (_) {}
    }
    if (isEmbedded) {
      // In embedded mode, ALWAYS follow panel (system / responsive)
      return 'system';
    }
    const savedMode = typeof window !== 'undefined' ? localStorage.getItem('kroomcare_theme_mode') : null;
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
      return savedMode as ThemeMode;
    }
    return 'system';
  });

  // Current active resolved theme: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') || params.get('mode');
        if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
      } catch (_) {}
      if (!isEmbedded) {
        const savedMode = localStorage.getItem('kroomcare_theme_mode');
        if (savedMode === 'dark' || savedMode === 'light') return savedMode;
      }
    }
    return resolveSystemTheme();
  });

  const applyThemeToDOM = useCallback((t: Theme) => {
    const root = window.document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      if (isEmbedded) {
        // When embedded in Support Center, save to parent preference
        localStorage.setItem('kroombox_parent_lang', lang);
      } else {
        // Standalone CRM setting
        localStorage.setItem('kroomcare_lang', lang);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
      if (typeof window !== 'undefined' && window.location.search) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('lang') || url.searchParams.has('locale') || url.searchParams.has('language')) {
          url.searchParams.set('lang', lang);
          if (url.searchParams.has('locale')) url.searchParams.set('locale', lang);
          if (url.searchParams.has('language')) url.searchParams.set('language', lang);
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      }
    } catch (_) {}
  }, [isEmbedded]);

  const toggleLanguage = useCallback(() => {
    const nextLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const setTheme = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (!isEmbedded) {
      localStorage.setItem('kroomcare_theme_mode', mode);
    }
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
      if (lower === 'mode:dark') return 'dark';
      if (lower === 'mode:light') return 'light';
      try {
        const parsed = JSON.parse(data);
        return parseThemeFromData(parsed);
      } catch (_) {}
    }
    if (typeof data === 'object') {
      if (data.type === 'KROOMBOX_THEME_CHANGE' || data.type === 'THEME_CHANGE' || data.type === 'SET_THEME' || data.type === 'KP_THEME_CHANGE' || data.type === 'THEME' || data.type === 'CHANGE_THEME') {
        const val = (data.theme || data.mode || data.colorScheme || data.colorMode || '').toLowerCase().trim();
        if (val === 'dark' || val === 'light') return val as Theme;
      }
      if (data.isDark === true || data.darkMode === true || data.dark === true) return 'dark';
      if (data.isDark === false || data.darkMode === false || data.dark === false) return 'light';
      if (data.theme === 'dark' || data.theme === 'light') return data.theme;
      if (data.mode === 'dark' || data.mode === 'light') return data.mode;
      if (data.colorScheme === 'dark' || data.colorScheme === 'light') return data.colorScheme;
      if (data.colorMode === 'dark' || data.colorMode === 'light') return data.colorMode;
      if (data.payload === 'dark' || data.payload === 'light') return data.payload;
      if (data.payload && typeof data.payload === 'object') {
        return parseThemeFromData(data.payload);
      }
      if (data.data === 'dark' || data.data === 'light') return data.data;
      if (data.data && typeof data.data === 'object') {
        return parseThemeFromData(data.data);
      }
      if (data.value === 'dark' || data.value === 'light') return data.value;
    }
    return null;
  };

  // Re-sync with system or parent when in 'system' mode or when embedded
  useEffect(() => {
    // If standalone and user explicitly locked to 'light' or 'dark', honor it
    if (!isEmbedded && themeMode !== 'system') {
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

  // Real-time synchronization with Kroombox Panel language when embedded in Support Center
  useEffect(() => {
    if (!isEmbedded) return;

    let lastSyncedLang: Language = language;

    const syncLanguage = (newLang: Language) => {
      if (lastSyncedLang === newLang && typeof document !== 'undefined' && document.documentElement.lang === newLang) {
        return;
      }
      lastSyncedLang = newLang;
      lastKnownParentLang = newLang;

      try {
        localStorage.setItem('kroombox_parent_lang', newLang);
      } catch (_) {}

      // Keep URL search parameter synchronized so stale initial URL never reverts language
      try {
        if (typeof window !== 'undefined' && window.location.search) {
          const url = new URL(window.location.href);
          if (url.searchParams.has('lang') || url.searchParams.has('locale') || url.searchParams.has('language')) {
            url.searchParams.set('lang', newLang);
            if (url.searchParams.has('locale')) url.searchParams.set('locale', newLang);
            if (url.searchParams.has('language')) url.searchParams.set('language', newLang);
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          }
        }
      } catch (_) {}

      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }

      setLanguageState(prev => {
        if (prev !== newLang) {
          return newLang;
        }
        return prev;
      });
    };

    // 1. Initial check
    const currentLang = detectParentLanguage();
    if (currentLang) syncLanguage(currentLang);

    // 2. Listen to postMessage from parent (Kroombox Panel language broadcast)
    const handleMessage = (event: MessageEvent) => {
      const incomingLang = parseLanguageFromData(event.data);
      if (incomingLang) {
        syncLanguage(incomingLang);
      }
    };
    window.addEventListener('message', handleMessage);

    // 3. MutationObserver on parent document if same-origin (watching parent lang or data-lang attribute)
    let parentObserver: MutationObserver | null = null;
    let onParentStorage: (() => void) | null = null;
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window && window.parent.document) {
        const syncFromParent = () => {
          const latest = detectParentLanguage();
          if (latest && latest !== lastSyncedLang) {
            syncLanguage(latest);
          }
        };

        parentObserver = new MutationObserver(syncFromParent);
        if (window.parent.document.documentElement) {
          parentObserver.observe(window.parent.document.documentElement, {
            attributes: true,
            attributeFilter: ['lang', 'data-lang', 'data-locale']
          });
        }
        if (window.parent.document.body) {
          parentObserver.observe(window.parent.document.body, {
            attributes: true,
            attributeFilter: ['lang', 'data-lang', 'data-locale']
          });
        }

        onParentStorage = syncFromParent;
        window.parent.addEventListener('storage', onParentStorage);
      }
    } catch (_) {}

    // 4. Request initial language from parent if embedded in iframe
    try {
      window.parent.postMessage({ type: 'GET_LANGUAGE' }, '*');
      window.parent.postMessage({ type: 'REQUEST_LANGUAGE' }, '*');
      window.parent.postMessage({ type: 'KP_GET_LANG' }, '*');
      window.parent.postMessage('getLanguage', '*');
    } catch (_) {}

    // 5. Gentle fallback polling (1000ms) only when language actually changed
    const interval = setInterval(() => {
      const latest = detectParentLanguage();
      if (latest && latest !== lastSyncedLang) {
        syncLanguage(latest);
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (parentObserver) {
        parentObserver.disconnect();
      }
      if (onParentStorage) {
        try { window.parent.removeEventListener('storage', onParentStorage); } catch (_) {}
      }
      clearInterval(interval);
    };
  }, [isEmbedded]);

  const t = useCallback((key: string): string => {
    const langDict = (translations[language] || translations['id']) as Record<string, string>;
    const defaultDict = translations['id'] as Record<string, string>;
    const enDict = translations['en'] as Record<string, string>;
    return langDict[key] || defaultDict[key] || enDict[key] || key;
  }, [language]);

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
