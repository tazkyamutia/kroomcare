import { Ticket, PointTransaction, Voucher, User, ForumMessage } from '../types';

export const DUMMY_USERS: User[] = [
  { id: 'U1', name: 'John Customer', email: 'customer@kroombox.com', role: 'customer', points: 850 },
  { id: 'U2', name: 'Sarah Staff', email: 'staff@kroombox.com', role: 'staff' },
  { id: 'U3', name: 'Alex Admin', email: 'admin@kroombox.com', role: 'admin' },
  { id: 'U4', name: 'Budi Santoso', email: 'budi@gmail.com', role: 'customer', points: 300 },
  { id: 'U5', name: 'Siti Aminah', email: 'siti@outlook.com', role: 'customer', points: 150 },
  { id: 'U6', name: 'Andi Wijaya', email: 'andi@yahoo.com', role: 'customer', points: 50 },
];

export const DUMMY_TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    subject: 'Hosting Error 500 on Main Domain',
    category: 'Hosting',
    status: 'In Progress',
    priority: 'High',
    isPriority: true,
    isPrivate: true,
    createdAt: '2026-04-01T10:00:00Z',
    description: 'My website is showing a 500 internal server error since this morning.',
    customerId: 'U1',
    customerName: 'John Customer'
  },
  {
    id: 'F-2001',
    subject: 'Cara Optimasi Speed WordPress',
    category: 'Other',
    status: 'Resolved',
    priority: 'Low',
    isPrivate: false,
    createdAt: '2026-03-28T14:30:00Z',
    description: 'Ada yang tahu plugin terbaik buat optimasi speed WordPress?',
    customerId: 'U1',
    customerName: 'John Customer'
  },
  {
    id: 'T-1003',
    subject: 'SSL Certificate Not Renewing',
    category: 'Technical',
    status: 'Open',
    priority: 'Medium',
    isPrivate: true,
    createdAt: '2026-04-05T09:15:00Z',
    description: 'Auto-renewal for my SSL certificate failed.',
    customerId: 'U1',
    customerName: 'John Customer'
  },
  {
    id: 'F-2004',
    subject: 'Diskusi: Framework PHP terbaik 2026',
    category: 'Other',
    status: 'Resolved',
    priority: 'Low',
    isPrivate: false,
    createdAt: '2026-03-20T08:00:00Z',
    description: 'Menurut kalian mending Laravel atau Symfony buat project gede?',
    customerId: 'U4',
    customerName: 'Budi Santoso'
  },
  {
    id: 'T-1005',
    subject: 'Refund Kebijakan Pembatalan Layanan',
    category: 'Billing',
    status: 'Resolved',
    priority: 'Medium',
    isPrivate: true,
    createdAt: '2026-03-25T11:00:00Z',
    description: 'Apakah saya bisa mendapatkan refund jika baru berlangganan 1 hari?',
    customerId: 'U5',
    customerName: 'Siti Aminah'
  },
  {
    id: 'F-2006',
    subject: 'Rekomendasi Hosting Murah untuk Landing Page',
    category: 'Hosting',
    status: 'Resolved',
    priority: 'Low',
    isPrivate: false,
    createdAt: '2026-03-27T15:00:00Z',
    description: 'Lagi nyari hosting yang pas buat promo jualan, ada saran?',
    customerId: 'U6',
    customerName: 'Andi Wijaya'
  }
];

export const DUMMY_FORUM_MESSAGES: ForumMessage[] = [
  { 
    id: 'FM1', 
    ticketId: 'T-1001', 
    userId: 'U1', 
    userName: 'John Customer', 
    userRole: 'customer', 
    text: 'Website saya error 500, tolong bantu.', 
    createdAt: '2026-04-01T10:00:00Z' 
  },
  { 
    id: 'FM2', 
    ticketId: 'T-1001', 
    userId: 'U2', 
    userName: 'Sarah Staff', 
    userRole: 'staff', 
    text: 'Halo John, kami sedang mengecek log server Anda. Mohon tunggu sebentar.', 
    createdAt: '2026-04-01T10:15:00Z' 
  },
  { 
    id: 'FM3', 
    ticketId: 'F-2001', 
    userId: 'U4', 
    userName: 'Budi Santoso', 
    userRole: 'customer', 
    text: 'Pake WP Rocket sama Cloudflare bro, mantap tuh.', 
    createdAt: '2026-03-29T09:00:00Z' 
  },
  { 
    id: 'FM4', 
    ticketId: 'F-2001', 
    userId: 'U6', 
    userName: 'Andi Wijaya', 
    userRole: 'customer', 
    text: 'Setuju sama Budi, tambahin LiteSpeed Cache kalo servernya support.', 
    createdAt: '2026-03-29T10:30:00Z' 
  },
];

export const DUMMY_TRANSACTIONS: PointTransaction[] = [
  { id: 'TX-1', userId: 'U1', type: 'Earned', amount: 50, description: 'Lapor Bug UI (Visual Glitch)', date: '2026-04-28' },
  { id: 'TX-2', userId: 'U1', type: 'Earned', amount: 10, description: 'Feedback Forum (Saran Fitur)', date: '2026-04-25' },
  { id: 'TX-3', userId: 'U1', type: 'Earned', amount: 500, description: 'Monthly Subscription Bonus', date: '2026-04-01' },
  { id: 'TX-4', userId: 'U1', type: 'Spent', amount: 200, description: 'Redeemed 10% Discount Voucher', date: '2026-03-15' },
  { id: 'TX-5', userId: 'U4', type: 'Earned', amount: 100, description: 'Daily Check-in', date: '2026-05-01' },
  { id: 'TX-6', userId: 'U4', type: 'Spent', amount: 50, description: 'Avatar Customize', date: '2026-05-02' },
];

export const DUMMY_VOUCHERS: Voucher[] = [
  { id: 'V-1', name: '10% Discount Hosting', code: 'HOST10', discount: '10%', pointsRequired: 200, expiryDate: '2026-12-31' },
  { id: 'V-2', name: 'Free Domain for 1 Year', code: 'FREEDOMAIN', discount: '100%', pointsRequired: 1000, expiryDate: '2026-06-30' },
];

export const QUICK_REPLIES = [
  "Cara bayar tagihan?",
  "Hosting saya error",
  "Cara tukar poin?",
  "Upgrade paket VPS"
];

export const DUMMY_STAFF_STATS = [
  { id: 'U2', name: 'Sarah Staff', dealt: 42, done: 38, color: 'brand' },
  { id: 'S2', name: 'Rian CS', dealt: 35, done: 35, color: 'emerald' },
  { id: 'S3', name: 'Dina Support', dealt: 28, done: 22, color: 'blue' },
  { id: 'S4', name: 'Bimo Technical', dealt: 50, done: 45, color: 'amber' },
];
