export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  points?: number;
  status?: 'online' | 'busy' | 'offline';
}

export interface Ticket {
  id: string;
  subject: string;
  category: 'Hosting' | 'Billing' | 'Technical' | 'Other';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  isPriority?: boolean;
  createdAt: string;
  description: string;
  customerId: string;
  customerName: string;
  assignedTo?: string; // Staff ID
  rewardGiven?: boolean;
  isPrivate?: boolean;
}

export interface ForumMessage {
  id: string;
  ticketId: string; // Used for both Forum Threads and Private Tickets in this context
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
  parentMessageId?: string; // For replies
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'Earned' | 'Spent';
  amount: number;
  description: string;
  date: string;
}

export interface Voucher {
  id: string;
  name: string;
  code: string;
  discount: string;
  pointsRequired: number;
  expiryDate: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
