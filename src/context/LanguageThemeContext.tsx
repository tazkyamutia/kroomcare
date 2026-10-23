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

    // Extended Profile
    'profile.work_status': 'Status Kerja',
    'profile.security_title': 'Keamanan & Password',
    'profile.security_subtitle': 'Perbarui kata sandi Anda untuk menjaga keamanan akun.',
    'profile.current_password': 'Password Saat Ini',
    'profile.new_password': 'Password Baru',
    'profile.confirm_password': 'Konfirmasi Password Baru',
    'profile.password_match_err': 'Password baru dan konfirmasi tidak cocok.',
    'profile.password_length_err': 'Password baru minimal 6 karakter.',
    'profile.two_factor_title': 'Autentikasi Dua Faktor (2FA)',
    'profile.two_factor_desc': 'Amankan akun Anda dengan kode verifikasi 6 digit dari aplikasi Google Authenticator.',
    'profile.two_factor_active': '2FA Aktif',
    'profile.two_factor_inactive': '2FA Nonaktif',
    'profile.disable_2fa': 'Nonaktifkan 2FA',
    'profile.enable_2fa': 'Aktifkan 2FA',
    'profile.status_online': 'Online (Siap Melayani)',
    'profile.status_busy': 'Sibuk (Sedang Menangani)',
    'profile.status_offline': 'Offline (Tidak Bertugas)',
    'profile.loyalty_points': 'Poin Loyalitas',
    'profile.points_history': 'Riwayat Poin',
    'profile.recent_transactions': 'Transaksi Terakhir',
    'profile.no_transactions': 'Belum ada transaksi poin.',
    'profile.view_all_history': 'Lihat Semua Riwayat',

    // Staff Dashboard
    'staff.title': 'Ringkasan Staff',
    'staff.subtitle': 'Pantau performa dukungan dan ringkasan aktivitas operasional.',
    'staff.new_tickets': 'Tiket Baru',
    'staff.my_tickets': 'Tiket Saya',
    'staff.done_today': 'Selesai Hari Ini',
    'staff.sla_rate': 'Tingkat SLA',
    'staff.shift_morning': 'Pagi',
    'staff.shift_afternoon': 'Siang',
    'staff.shift_night': 'Malam',
    'staff.weekly_activity': 'Aktivitas Mingguan',
    'staff.recent_activity': 'Aktivitas Terbaru',
    'staff.resolved': 'Selesai',
    'staff.total': 'Total',
    'staff.no_activity': 'Belum ada aktivitas tercatat hari ini.',
    'staff.open_queue': 'Buka Antrean Keluhan',

    // Ticket Queue
    'queue.title': 'Antrean Keluhan Privat',
    'queue.subtitle': 'Daftar aduan teknis dan billing yang harus ditangani secara privat.',
    'queue.needs_priority': 'Perlu Prioritas',
    'queue.filter_all': 'Semua',
    'queue.filter_priority': 'Prioritas',
    'queue.filter_high': 'Tinggi',
    'queue.filter_low': 'Rendah',
    'queue.search_placeholder': 'Cari ID, subjek, nama...',
    'queue.no_tickets': 'Belum ada antrean tiket aktif.',
    'queue.handle_ticket': 'Tangani Tiket',

    // Forum & Ticket Thread
    'thread.not_found': 'Thread atau tiket tidak ditemukan.',
    'thread.private_ticket': 'Tiket Privat',
    'thread.public_forum': 'Forum Publik',
    'thread.priority_active': 'Mendesak: Prioritas Aktif',
    'thread.mark_priority': 'Tandai sebagai Prioritas?',
    'thread.cancel_priority': 'Batalkan Prioritas',
    'thread.set_priority': 'Tetapkan Prioritas',
    'thread.escalated': 'Sudah Dieskalasi',
    'thread.transfer_maintenance': 'Transfer ke Pemeliharaan',
    'thread.status_new': 'Tiket Baru',
    'thread.status_process': 'Proses',
    'thread.status_resolved': 'Selesai',
    'thread.points_label': 'Poin:',
    'thread.give_points': 'Beri Poin',
    'thread.giving_points': 'Memberi...',
    'thread.reward_sent': 'Reward Terkirim',
    'thread.write_reply': 'Tulis balasan Anda...',
    'thread.send_reply': 'Kirim Balasan',
    'thread.replying_to': 'Membalas',
    'thread.cancel_reply': 'Batal',

    // Settings additions
    'settings.embedded_notice_title': 'Pengaturan Terhubung ke Kroombox Panel',
    'settings.embedded_notice_desc': 'Mode tampilan (Tema Terang/Gelap) dan Bahasa Support Center disinkronkan secara otomatis mengikuti preferensi akun Anda di Kroombox Panel.',
    'settings.current_active_theme': 'Tema Aktif:',
    'settings.current_active_lang': 'Bahasa Aktif:',

    // Admin Dashboard & Management
    'admin.title': 'Admin CRM Dashboard',
    'admin.subtitle': 'Kelola operasional dukungan dan performa sistem.',
    'admin.loading': 'Memuat Dashboard Admin...',
    'admin.load_failed': 'Gagal Memuat Dashboard',
    'admin.retry': 'Coba Lagi',
    'admin.total_users': 'Total Pengguna',
    'admin.active_tickets': 'Tiket Aktif',
    'admin.ai_sessions_today': 'Sesi AI Hari Ini',
    'admin.resolution_rate': 'Tingkat Resolusi',
    'admin.system_performance': 'Statistik Performa Sistem',
    'admin.range_day': 'Hari',
    'admin.range_week': 'Minggu',
    'admin.range_month': 'Bulan',
    'admin.chart_incoming': 'Tiket Masuk',
    'admin.chart_resolved': 'Selesai',
    'admin.staff_recap': 'Rekap Performa Staff',
    'admin.live_data': 'Live Data',
    'admin.col_staff_name': 'Nama Staff',
    'admin.col_dealt': 'Ditangani',
    'admin.col_done': 'Selesai',
    'admin.col_efficiency': 'Efisiensi',
    'admin.system_control': 'Kontrol Sistem',
    'admin.maintenance_mode': 'Maintenance Mode',
    'admin.auto_assign': 'Auto-Assign Tiket',
    'admin.save_config': 'Simpan Konfigurasi',
    'admin.config_saved': 'Konfigurasi Disimpan!',
    'admin.recent_activity_logs': 'Log Aktivitas Terbaru',

    // User Management
    'admin_users.title': 'Manajemen Pengguna',
    'admin_users.subtitle': 'Kelola data Pelanggan, Staf, dan Administrator secara terpusat.',
    'admin_users.add_user': 'Tambah Pengguna',
    'admin_users.filter_all': 'Semua',
    'admin_users.search_placeholder': 'Cari nama atau email...',
    'admin_users.col_user': 'Pengguna',
    'admin_users.col_role': 'Peran',
    'admin_users.col_points': 'Koin / Poin',
    'admin_users.col_action': 'Aksi',
    'admin_users.history_points': 'Riwayat Koin',
    'admin_users.reset_points': 'Reset Poin',
    'admin_users.delete_user': 'Hapus',
    'admin_users.modal_add_title': 'Tambah Pengguna Baru',
    'admin_users.modal_fullname': 'Nama Lengkap',
    'admin_users.modal_email': 'Email',
    'admin_users.modal_password': 'Password',
    'admin_users.modal_role': 'Peran (Role)',
    'admin_users.modal_initial_points': 'Poin Awal',
    'admin_users.cancel': 'Batal',
    'admin_users.save': 'Simpan Pengguna',
    'admin_users.saving': 'Menyimpan...',

    // Ticket Settings
    'admin_tickets.title': 'Pengaturan Tiket',
    'admin_tickets.subtitle': 'Kelola status, prioritas, dan antrean tiket seluruh pengguna.',
    'admin_tickets.search_placeholder': 'Cari ID tiket, subjek...',
    'admin_tickets.col_id': 'ID Tiket',
    'admin_tickets.col_subject': 'Subjek',
    'admin_tickets.col_customer': 'Pelanggan',
    'admin_tickets.col_status': 'Status',
    'admin_tickets.col_priority': 'Prioritas',
    'admin_tickets.priority_high': 'Prioritas Tinggi',
    'admin_tickets.priority_normal': 'Standar',

    // API Integration
    'admin_api.title': 'Integrasi & Keamanan',
    'admin_api.subtitle': 'Kelola API Key untuk menghubungkan KroomCare dengan sistem eksternal.',
    'admin_api.key_title': 'API Key KroomCare',
    'admin_api.key_desc': 'Gunakan kunci ini untuk otentikasi webhook dan integrasi sistem Kroombox.',
    'admin_api.generate_new': 'Generate API Key Baru',
    'admin_api.copy': 'Salin',
    'admin_api.copied': 'Tersalin!',

    // Landing Page
    'landing.nav_features': 'Fitur',
    'landing.nav_rewards': 'Rewards',
    'landing.nav_about': 'Tentang Kami',
    'landing.login_btn': 'Masuk',
    'landing.register_btn': 'Mulai Gratis',
    'landing.switch_lang_title': 'Ganti ke English',
    'landing.hero_badge_google': '4.9 Google',
    'landing.hero_badge_csat': '4.9 Kepuasan Pelanggan',
    'landing.hero_title_prefix': 'CRM Berbasis AI untuk Tingkatkan ',
    'landing.hero_title_highlight': 'Layanan Pelanggan',
    'landing.hero_cta_btn': 'Mulai Gratis Sekarang',
    'landing.orbit_gemini': 'Gemini AI',
    'landing.orbit_wa': 'Bot WhatsApp',
    'landing.orbit_db': 'Database MySQL',
    'landing.orbit_sla': 'SLA Instan',
    'landing.orbit_points': 'Poin Loyalitas',
    'landing.orbit_escalation': 'Eskalasi Otomatis',
    'landing.f1_badge': '01 / FITUR CRM',
    'landing.f1_title': 'Klasifikasi Keluhan Pelanggan & Smart Agent Matching',
    'landing.f1_desc': 'Sistem CRM cerdas menganalisis pesan keluhan pelanggan seketika, menentukan urgensi kendala, dan mendistribusikan tiket ke agen customer care yang tepat tanpa antrean manual.',
    'landing.f1_bullet1': 'Analisis Kategori Kendala & Prioritas Tiket Pelanggan (< 1 Detik)',
    'landing.f1_bullet2': 'Pencocokan Cerdas Beban Kerja Tim Customer Support',
    'landing.f1_bullet3': 'Pemantauan SLA Respon untuk Menjaga Kepuasan Pelanggan (CSAT)',
    'landing.f1_mockup_badge': 'AI CRM Engine Aktif · 0.8s Match',
    'landing.f1_mockup_cmd': 'crm route --customer-ticket #1042',
    'landing.f1_mockup_cat_label': 'Kategori:',
    'landing.f1_mockup_cat_val': 'Kendala Layanan & Akun (99.4%)',
    'landing.f1_mockup_assigned_label': 'Ditugaskan:',
    'landing.f1_mockup_assigned_val': 'Tariq A. (Customer Success Agent)',
    'landing.f1_mockup_ticket_assigned': 'Tiket Keluhan #1042 Ditugaskan',
    'landing.f1_mockup_sla': 'Target SLA Respon: 15 menit',
    'landing.f1_mockup_status': 'Aktif',
    'landing.f2_badge': '02 / FITUR CRM',
    'landing.f2_title': 'Leaderboard Tim Support & Peningkatan Kepuasan Pelanggan',
    'landing.f2_desc': 'Tingkatkan standar kepuasan pelanggan dengan budaya kerja interaktif. Staf customer service termotivasi memberikan solusi tercepat dan paling ramah demi meraih rating CSAT tertinggi.',
    'landing.f2_bullet1': 'Poin XP Otomatis untuk Resolusi Cepat & Feedback Bintang 5',
    'landing.f2_bullet2': 'Peringkat Mingguan Agen Customer Care & Lencana Kehormatan',
    'landing.f2_bullet3': 'Katalog Rewards & Apresiasi Kinerja Pelayanan Pelanggan',
    'landing.f2_mockup_badge': 'Leaderboard CSAT Minggu Ini Aktif',
    'landing.f2_mockup_rank': 'Top Agent #1',
    'landing.f2_mockup_stats': 'CSAT 4.9/5.0 · 38 Keluhan Pelanggan Tuntas',
    'landing.f2_mockup_target': 'Target Pelayanan Prima (CSAT > 95%)',
    'landing.f3_badge': '03 / FITUR CRM',
    'landing.f3_title': 'Notifikasi Pelanggan Real-Time & Komunikasi Omnichannel',
    'landing.f3_desc': 'Bangun kepercayaan pelanggan dengan transparansi penuh. Integrasi resmi WhatsApp CRM mengirimkan progres penanganan tiket secara otomatis sejak laporan diterima hingga solusi tuntas.',
    'landing.f3_bullet1': 'Notifikasi Otomatis ke WhatsApp Pelanggan (< 2 Detik)',
    'landing.f3_bullet2': 'Riwayat Interaksi Pelanggan Terpusat & Terverifikasi Dua Arah',
    'landing.f3_bullet3': 'Pengumpulan Rating Kepuasan (CSAT) Seketika Pasca-Solusi',
    'landing.f3_mockup_badge': 'CRM WhatsApp Gateway · Live 200 OK',
    'landing.f3_mockup_wa_title': 'KroomCare Customer Care',
    'landing.f3_mockup_wa_body': '“Halo Kak Alif, tiket keluhan #1042 Anda telah selesai ditangani dengan baik. Mohon berikan penilaian kepuasan layanan kami!”',
    'landing.f3_mockup_wa_time': 'Baru saja · Terkirim ✓✓',
    'landing.f3_mockup_status_title': 'Pembaruan Status Tiket CRM',
    'landing.f3_mockup_status_rate': '100% Terkirim ke Pelanggan',
    'landing.infra_badge': 'Infrastruktur Teknologi Pendukung Platform CRM',
    'landing.infra_title': 'Fondasi Handal untuk Kecepatan & Keamanan Layanan Pelanggan',
    'landing.infra_desc': 'Ditenagai integrasi AI cerdas, gateway komunikasi resmi WhatsApp, dan arsitektur database enterprise ber-SLA tinggi.',
    'landing.infra_gemini_desc': 'Routing tiket cerdas & analisis sentimen keluhan pelanggan otomatis dalam hitungan sub-detik.',
    'landing.infra_wa_desc': 'Notifikasi instan & tiket update dua arah langsung terhubung ke nomor WhatsApp pelanggan.',
    'landing.infra_resend_desc': 'Pengiriman email respon tiket & laporan berkala dengan jaminan deliverability SLA 99.9%.',
    'landing.infra_mysql_desc': 'Penyimpanan terenkripsi data tiket, histori interaksi, & audit trail dengan redundansi tinggi.',
    'landing.newsletter_title': 'Dapatkan Pembaruan KroomCare',
    'landing.newsletter_desc': 'Tips CRM, informasi fitur baru, dan penawaran menarik langsung di email Anda.',
    'landing.newsletter_placeholder': 'Masukkan email Anda...',
    'landing.newsletter_btn': 'Subscribe',
    'landing.newsletter_success': 'Berhasil berlangganan newsletter KroomCare.',
    'landing.newsletter_fail': 'Gagal berlangganan. Coba lagi.',
    'landing.newsletter_conn_err': 'Koneksi ke server backend gagal.',
    'landing.footer_brand_desc': 'Platform CRM modern berbasis AI dan gamifikasi untuk operasional customer support.',
    'landing.footer_products': 'Produk',
    'landing.footer_f_features': 'Fitur Utama',
    'landing.footer_f_rewards': 'Rewards & Poin',
    'landing.footer_f_tickets': 'Sistem Tiket',
    'landing.footer_f_forum': 'Forum Komunitas',
    'landing.footer_contact': 'Kontak',
    'landing.footer_legal': 'Legal',
    'landing.footer_privacy': 'Kebijakan Privasi',
    'landing.footer_terms': 'Syarat Layanan',
    'landing.footer_security': 'Status Keamanan',
    'landing.footer_rights': 'All rights reserved.',
    'landing.footer_tagline': 'Dirancang dengan presisi tinggi & standar SaaS modern.',
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

    // Extended Profile
    'profile.work_status': 'Work Status',
    'profile.security_title': 'Security & Password',
    'profile.security_subtitle': 'Update your password to keep your account secure.',
    'profile.current_password': 'Current Password',
    'profile.new_password': 'New Password',
    'profile.confirm_password': 'Confirm New Password',
    'profile.password_match_err': 'New password and confirmation do not match.',
    'profile.password_length_err': 'New password must be at least 6 characters.',
    'profile.two_factor_title': 'Two-Factor Authentication (2FA)',
    'profile.two_factor_desc': 'Protect your account with a 6-digit verification code from Google Authenticator.',
    'profile.two_factor_active': '2FA Active',
    'profile.two_factor_inactive': '2FA Inactive',
    'profile.disable_2fa': 'Disable 2FA',
    'profile.enable_2fa': 'Enable 2FA',
    'profile.status_online': 'Online (Ready to serve)',
    'profile.status_busy': 'Busy (Handling requests)',
    'profile.status_offline': 'Offline (Off-duty)',
    'profile.loyalty_points': 'Loyalty Points',
    'profile.points_history': 'Points History',
    'profile.recent_transactions': 'Recent Transactions',
    'profile.no_transactions': 'No point transactions recorded yet.',
    'profile.view_all_history': 'View All History',

    // Staff Dashboard
    'staff.title': 'Staff Overview',
    'staff.subtitle': 'Monitor support performance and operational activities summary.',
    'staff.new_tickets': 'New Tickets',
    'staff.my_tickets': 'My Tickets',
    'staff.done_today': 'Resolved Today',
    'staff.sla_rate': 'SLA Rate',
    'staff.shift_morning': 'Morning',
    'staff.shift_afternoon': 'Afternoon',
    'staff.shift_night': 'Night',
    'staff.weekly_activity': 'Weekly Activity',
    'staff.recent_activity': 'Recent Activity',
    'staff.resolved': 'Resolved',
    'staff.total': 'Total',
    'staff.no_activity': 'No recent activity recorded today.',
    'staff.open_queue': 'Open Ticket Queue',

    // Ticket Queue
    'queue.title': 'Private Ticket Queue',
    'queue.subtitle': 'List of technical and billing issues to be handled privately.',
    'queue.needs_priority': 'Needs Priority',
    'queue.filter_all': 'All',
    'queue.filter_priority': 'Priority',
    'queue.filter_high': 'High',
    'queue.filter_low': 'Low',
    'queue.search_placeholder': 'Search ID, subject, name...',
    'queue.no_tickets': 'No active tickets in queue.',
    'queue.handle_ticket': 'Handle Ticket',

    // Forum & Ticket Thread
    'thread.not_found': 'Thread or ticket not found.',
    'thread.private_ticket': 'Private Ticket',
    'thread.public_forum': 'Public Forum',
    'thread.priority_active': 'Urgent: Priority Active',
    'thread.mark_priority': 'Mark as Priority?',
    'thread.cancel_priority': 'Cancel Priority',
    'thread.set_priority': 'Set as Priority',
    'thread.escalated': 'Already Escalated',
    'thread.transfer_maintenance': 'Transfer to Maintenance',
    'thread.status_new': 'New Ticket',
    'thread.status_process': 'In Progress',
    'thread.status_resolved': 'Resolved',
    'thread.points_label': 'Points:',
    'thread.give_points': 'Reward Points',
    'thread.giving_points': 'Rewarding...',
    'thread.reward_sent': 'Reward Sent',
    'thread.write_reply': 'Write your reply...',
    'thread.send_reply': 'Send Reply',
    'thread.replying_to': 'Replying to',
    'thread.cancel_reply': 'Cancel',

    // Settings additions
    'settings.embedded_notice_title': 'Settings Managed by Kroombox Panel',
    'settings.embedded_notice_desc': 'Support Center display mode (Light/Dark theme) and language are automatically synchronized with your preferences in Kroombox Panel.',
    'settings.current_active_theme': 'Active Theme:',
    'settings.current_active_lang': 'Active Language:',

    // Admin Dashboard & Management
    'admin.title': 'Admin CRM Dashboard',
    'admin.subtitle': 'Manage support operations and system performance.',
    'admin.loading': 'Loading Admin Dashboard...',
    'admin.load_failed': 'Failed to Load Dashboard',
    'admin.retry': 'Retry',
    'admin.total_users': 'Total Users',
    'admin.active_tickets': 'Active Tickets',
    'admin.ai_sessions_today': 'AI Sessions Today',
    'admin.resolution_rate': 'Resolution Rate',
    'admin.system_performance': 'System Performance Stats',
    'admin.range_day': 'Day',
    'admin.range_week': 'Week',
    'admin.range_month': 'Month',
    'admin.chart_incoming': 'Incoming Tickets',
    'admin.chart_resolved': 'Resolved',
    'admin.staff_recap': 'Staff Performance Summary',
    'admin.live_data': 'Live Data',
    'admin.col_staff_name': 'Staff Name',
    'admin.col_dealt': 'Handled',
    'admin.col_done': 'Resolved',
    'admin.col_efficiency': 'Efficiency',
    'admin.system_control': 'System Control',
    'admin.maintenance_mode': 'Maintenance Mode',
    'admin.auto_assign': 'Auto-Assign Tickets',
    'admin.save_config': 'Save Configuration',
    'admin.config_saved': 'Configuration Saved!',
    'admin.recent_activity_logs': 'Recent Activity Logs',

    // User Management
    'admin_users.title': 'User Management',
    'admin_users.subtitle': 'Centrally manage Customer, Staff, and Administrator accounts.',
    'admin_users.add_user': 'Add User',
    'admin_users.filter_all': 'All',
    'admin_users.search_placeholder': 'Search name or email...',
    'admin_users.col_user': 'User',
    'admin_users.col_role': 'Role',
    'admin_users.col_points': 'Coins / Points',
    'admin_users.col_action': 'Actions',
    'admin_users.history_points': 'Points History',
    'admin_users.reset_points': 'Reset Points',
    'admin_users.delete_user': 'Delete',
    'admin_users.modal_add_title': 'Add New User',
    'admin_users.modal_fullname': 'Full Name',
    'admin_users.modal_email': 'Email Address',
    'admin_users.modal_password': 'Password',
    'admin_users.modal_role': 'Role',
    'admin_users.modal_initial_points': 'Initial Points',
    'admin_users.cancel': 'Cancel',
    'admin_users.save': 'Save User',
    'admin_users.saving': 'Saving...',

    // Ticket Settings
    'admin_tickets.title': 'Ticket Settings',
    'admin_tickets.subtitle': 'Manage statuses, priorities, and ticket queues across all users.',
    'admin_tickets.search_placeholder': 'Search ticket ID, subject...',
    'admin_tickets.col_id': 'Ticket ID',
    'admin_tickets.col_subject': 'Subject',
    'admin_tickets.col_customer': 'Customer',
    'admin_tickets.col_status': 'Status',
    'admin_tickets.col_priority': 'Priority',
    'admin_tickets.priority_high': 'High Priority',
    'admin_tickets.priority_normal': 'Standard',

    // API Integration
    'admin_api.title': 'Integration & Security',
    'admin_api.subtitle': 'Manage API Keys to connect KroomCare with external systems.',
    'admin_api.key_title': 'KroomCare API Key',
    'admin_api.key_desc': 'Use this key for webhook authentication and Kroombox system integration.',
    'admin_api.generate_new': 'Generate New API Key',
    'admin_api.copy': 'Copy',
    'admin_api.copied': 'Copied!',

    // Landing Page
    'landing.nav_features': 'Features',
    'landing.nav_rewards': 'Rewards',
    'landing.nav_about': 'About Us',
    'landing.login_btn': 'Log In',
    'landing.register_btn': 'Get Started Free',
    'landing.switch_lang_title': 'Switch to Indonesian',
    'landing.hero_badge_google': '4.9 Google',
    'landing.hero_badge_csat': '4.9 Customer Satisfaction',
    'landing.hero_title_prefix': 'AI-Powered CRM to Elevate ',
    'landing.hero_title_highlight': 'Customer Support',
    'landing.hero_cta_btn': 'Get Started Free',
    'landing.orbit_gemini': 'Gemini AI',
    'landing.orbit_wa': 'WhatsApp Bot',
    'landing.orbit_db': 'MySQL Database',
    'landing.orbit_sla': 'Instant SLA',
    'landing.orbit_points': 'Loyalty Points',
    'landing.orbit_escalation': 'Auto Escalation',
    'landing.f1_badge': '01 / CRM FEATURE',
    'landing.f1_title': 'Smart Complaint Classification & Agent Matching',
    'landing.f1_desc': 'Intelligent CRM system analyzes customer complaints instantly, assesses urgency, and routes tickets to the most qualified support agent with zero manual queuing.',
    'landing.f1_bullet1': 'Issue Category & Priority Analysis in < 1 Second',
    'landing.f1_bullet2': 'Smart Support Agent Workload & Skill Matching',
    'landing.f1_bullet3': 'Continuous SLA Response Monitoring to Boost CSAT',
    'landing.f1_mockup_badge': 'AI CRM Engine Active · 0.8s Match',
    'landing.f1_mockup_cmd': 'crm route --customer-ticket #1042',
    'landing.f1_mockup_cat_label': 'Category:',
    'landing.f1_mockup_cat_val': 'Account & Service Issues (99.4%)',
    'landing.f1_mockup_assigned_label': 'Assigned to:',
    'landing.f1_mockup_assigned_val': 'Tariq A. (Customer Success Agent)',
    'landing.f1_mockup_ticket_assigned': 'Customer Ticket #1042 Assigned',
    'landing.f1_mockup_sla': 'Target Response SLA: 15 mins',
    'landing.f1_mockup_status': 'Active',
    'landing.f2_badge': '02 / CRM FEATURE',
    'landing.f2_title': 'Support Team Leaderboard & CSAT Gamification',
    'landing.f2_desc': 'Elevate support quality through engaging team gamification. Motivate customer care agents to deliver rapid, friendly resolutions to achieve top CSAT ratings.',
    'landing.f2_bullet1': 'Automated XP Rewards for Fast Resolution & 5-Star CSAT',
    'landing.f2_bullet2': 'Weekly Agent Leaderboards & Badges of Honor',
    'landing.f2_bullet3': 'Curated Rewards Catalog & Performance Recognition',
    'landing.f2_mockup_badge': 'Weekly CSAT Leaderboard Live',
    'landing.f2_mockup_rank': 'Top Agent #1',
    'landing.f2_mockup_stats': 'CSAT 4.9/5.0 · 38 Resolved Tickets',
    'landing.f2_mockup_target': 'Service Excellence Goal (CSAT > 95%)',
    'landing.f3_badge': '03 / CRM FEATURE',
    'landing.f3_title': 'Real-Time Customer Notifications & Omnichannel Sync',
    'landing.f3_desc': 'Build customer loyalty through end-to-end transparency. Official WhatsApp CRM integration sends automatic ticket progress updates from submission to resolution.',
    'landing.f3_bullet1': 'Instant WhatsApp Notifications to Customers (< 2 Sec)',
    'landing.f3_bullet2': 'Unified & Verified Two-Way Customer Interaction History',
    'landing.f3_bullet3': 'Real-Time CSAT Satisfaction Survey Post-Resolution',
    'landing.f3_mockup_badge': 'CRM WhatsApp Gateway · Live 200 OK',
    'landing.f3_mockup_wa_title': 'KroomCare Customer Care',
    'landing.f3_mockup_wa_body': '“Hi Alif, your support ticket #1042 has been successfully resolved. Please rate our service satisfaction!”',
    'landing.f3_mockup_wa_time': 'Just now · Delivered ✓✓',
    'landing.f3_mockup_status_title': 'CRM Ticket Status Updates',
    'landing.f3_mockup_status_rate': '100% Delivered to Customers',
    'landing.infra_badge': 'Technology Infrastructure Powering KroomCare CRM',
    'landing.infra_title': 'Reliable Foundation for Customer Service Speed & Security',
    'landing.infra_desc': 'Driven by intelligent AI routing, official WhatsApp Business gateways, and enterprise-grade ACID database architecture.',
    'landing.infra_gemini_desc': 'Intelligent ticket classification and customer sentiment analysis in sub-seconds.',
    'landing.infra_wa_desc': 'Instant notifications and two-way ticket updates directly linked to customer WhatsApp.',
    'landing.infra_resend_desc': 'Fast transactional response emails & reports with a 99.9% inbox deliverability SLA.',
    'landing.infra_mysql_desc': 'High-redundancy encrypted storage for ticket records, interaction history, and audit trails.',
    'landing.newsletter_title': 'Get KroomCare Updates',
    'landing.newsletter_desc': 'CRM tips, product updates, and special perks delivered straight to your inbox.',
    'landing.newsletter_placeholder': 'Enter your email address...',
    'landing.newsletter_btn': 'Subscribe',
    'landing.newsletter_success': 'Successfully subscribed to KroomCare newsletter.',
    'landing.newsletter_fail': 'Subscription failed. Please try again.',
    'landing.newsletter_conn_err': 'Connection to server failed.',
    'landing.footer_brand_desc': 'Modern AI-powered and gamified CRM platform for enterprise customer care operations.',
    'landing.footer_products': 'Products',
    'landing.footer_f_features': 'Key Features',
    'landing.footer_f_rewards': 'Rewards & Points',
    'landing.footer_f_tickets': 'Ticketing System',
    'landing.footer_f_forum': 'Community Forum',
    'landing.footer_contact': 'Contact',
    'landing.footer_legal': 'Legal',
    'landing.footer_privacy': 'Privacy Policy',
    'landing.footer_terms': 'Terms of Service',
    'landing.footer_security': 'Security Status',
    'landing.footer_rights': 'All rights reserved.',
    'landing.footer_tagline': 'Designed with high precision & modern SaaS standards.',
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
  for (const name of ['kp_theme', 'kroombox_theme', 'theme']) {
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
  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

  // 1. Embedded mode inside Kroombox Panel Support Center:
  // ALWAYS prioritize Kroombox Panel's theme!
  if (isEmbedded) {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme') || params.get('mode') || params.get('themeMode') || params.get('colorScheme');
      if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme as Theme;
    } catch (_) {}

    // Check shared cookie across .kroombox.com domain (updated by panel bridge in real-time)
    const cookieTheme = getSharedCookieTheme();
    if (cookieTheme) return cookieTheme;

    // Check live broadcast cache from parent postMessage
    if (lastKnownParentTheme) return lastKnownParentTheme;

    // Check parent document if accessible (same-origin)
    const parentTheme = detectParentTheme();
    if (parentTheme) return parentTheme;

    // Check stored parent theme from past sync
    try {
      const stored = localStorage.getItem('kroombox_parent_theme');
      if (stored === 'dark' || stored === 'light') return stored as Theme;
    } catch (_) {}

    return 'light';
  }

  // 2. Standalone CRM: check URL, user setting, cookie, and OS media query
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme') || params.get('mode') || params.get('themeMode') || params.get('colorScheme');
      if (urlTheme === 'dark' || urlTheme === 'light') return urlTheme as Theme;
    }
  } catch (_) {}

  try {
    const saved = localStorage.getItem('kroomcare_theme_mode');
    if (saved === 'dark' || saved === 'light') return saved as Theme;
  } catch (_) {}

  const cookieTheme = getSharedCookieTheme();
  if (cookieTheme) return cookieTheme;

  // Local Standalone default matches Kroombox Panel: Light mode!
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
      if (isEmbedded) {
        // In embedded mode, theme is always strictly synced to Kroombox Panel
        return 'system';
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const urlTheme = params.get('theme') || params.get('mode');
        if (urlTheme === 'light' || urlTheme === 'dark') return urlTheme;
      } catch (_) {}

      const savedMode = localStorage.getItem('kroomcare_theme_mode');
      if (savedMode === 'light' || savedMode === 'dark') {
        return savedMode as ThemeMode;
      }
      return 'light';
    }
    return 'light';
  });

  // Current active resolved theme: 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      if (isEmbedded) {
        return resolveSystemTheme();
      }

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
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, []);

  const syncUrlTheme = useCallback((newTheme: Theme) => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('theme') || url.searchParams.has('mode') || url.searchParams.has('themeMode') || url.searchParams.has('colorScheme')) {
          url.searchParams.set('theme', newTheme);
          if (url.searchParams.has('mode')) url.searchParams.set('mode', newTheme);
          if (url.searchParams.has('themeMode')) url.searchParams.set('themeMode', newTheme);
          if (url.searchParams.has('colorScheme')) url.searchParams.set('colorScheme', newTheme);
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      }
    } catch (_) {}
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
    try {
      if (!isEmbedded) {
        localStorage.setItem('kroomcare_theme_mode', mode);
      }
    } catch (_) {}

    if (mode === 'dark') {
      setResolvedTheme('dark');
      applyThemeToDOM('dark');
      syncUrlTheme('dark');
    } else if (mode === 'light') {
      setResolvedTheme('light');
      applyThemeToDOM('light');
      syncUrlTheme('light');
    } else {
      const sys = resolveSystemTheme();
      setResolvedTheme(sys);
      applyThemeToDOM(sys);
      syncUrlTheme(sys);
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
      const typeStr = (data.type || data.action || data.event || '').toLowerCase();
      if (
        typeStr.includes('theme') ||
        typeStr.includes('mode') ||
        data.type === 'KROOMBOX_THEME_CHANGE' ||
        data.type === 'THEME_CHANGE' ||
        data.type === 'SET_THEME' ||
        data.type === 'KP_THEME_CHANGE' ||
        data.type === 'CHANGE_THEME'
      ) {
        const val = (data.theme || data.mode || data.colorScheme || data.colorMode || data.value || '').toLowerCase().trim();
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

  // Re-sync with system or parent panel
  useEffect(() => {
    // If standalone CRM and user explicitly chose 'light' or 'dark', honor it always
    if (!isEmbedded && themeMode !== 'system') {
      applyThemeToDOM(themeMode);
      setResolvedTheme(themeMode);
      syncUrlTheme(themeMode);
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
      syncUrlTheme(newTheme);
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
      // Hanya panel induk yang boleh mengatur tema/bahasa; abaikan pesan dari jendela lain.
      if (!isEmbedded || event.source !== window.parent) return;
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
      const sendHandshake = () => {
        try {
          window.parent.postMessage({ type: 'GET_THEME' }, '*');
          window.parent.postMessage({ type: 'REQUEST_THEME' }, '*');
          window.parent.postMessage({ type: 'KP_GET_THEME' }, '*');
          window.parent.postMessage('getTheme', '*');
        } catch (_) {}
      };
      sendHandshake();
      const t1 = setTimeout(sendHandshake, 80);
      const t2 = setTimeout(sendHandshake, 250);
      const t3 = setTimeout(sendHandshake, 600);
      setTimeout(() => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      }, 3000);
    }

    // 5. Focus & Visibility listener
    const handleVisibility = () => {
      const latest = resolveSystemTheme();
      setResolvedTheme(latest);
      applyThemeToDOM(latest);
      syncUrlTheme(latest);
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
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [themeMode, isEmbedded, applyThemeToDOM, syncUrlTheme]);

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
      // Hanya panel induk yang boleh mengatur tema/bahasa; abaikan pesan dari jendela lain.
      if (!isEmbedded || event.source !== window.parent) return;
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

    return () => {
      window.removeEventListener('message', handleMessage);
      if (parentObserver) {
        parentObserver.disconnect();
      }
      if (onParentStorage) {
        try { window.parent.removeEventListener('storage', onParentStorage); } catch (_) {}
      }
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
