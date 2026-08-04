import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatWidget } from './components/ChatWidget';
import { DashboardHome } from './pages/DashboardHome';
import { TicketingPage } from './pages/TicketingPage';
import { NewTicketPage } from './pages/NewTicketPage';
import { RewardsPage } from './pages/RewardsPage';
import { PointHistoryPage } from './pages/customer/PointHistoryPage';
import { ProfilePage } from './pages/shared/ProfilePage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { TicketSettingsPage } from './pages/admin/TicketSettingsPage';
import { ApiIntegrationPage } from './pages/admin/ApiIntegrationPage';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { TicketQueuePage } from './pages/staff/TicketQueuePage';
import { ForumThreadPage } from './pages/shared/ForumThreadPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { LandingPage } from './pages/LandingPage';
import { AnimatePresence } from 'motion/react';
import { useUser } from './context/UserContext';

import { ForumPage } from './pages/ForumPage';

export default function App() {
  const { user, logout } = useUser();

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-4 md:p-8 lg:p-12 pb-24 lg:pb-12">
          <div className="max-w-6xl mx-auto">
            <Header />
            <AnimatePresence mode="wait">
              <Routes>
                {/* Customer Routes */}
                {user.role === 'customer' && (
                  <>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/forum/:id" element={<ForumThreadPage userRole="customer" />} />
                    <Route path="/tickets" element={<TicketingPage />} />
                    <Route path="/tickets/new" element={<NewTicketPage />} />
                    <Route path="/tickets/:id" element={<ForumThreadPage userRole="customer" />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/points-history" element={<PointHistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </>
                )}

                {/* Staff Routes */}
                {user.role === 'staff' && (
                  <>
                    <Route path="/" element={<StaffDashboard />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/forum/:id" element={<ForumThreadPage userRole="staff" />} />
                    <Route path="/staff" element={<TicketQueuePage />} />
                    <Route path="/staff/tickets/:id" element={<ForumThreadPage userRole="staff" />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </>
                )}

                {/* Admin Routes */}
                {user.role === 'admin' && (
                  <>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/forum/:id" element={<ForumThreadPage userRole="admin" />} />
                    <Route path="/admin/users" element={<UserManagementPage />} />
                    <Route path="/admin/tickets" element={<TicketSettingsPage />} />
                    <Route path="/admin/api" element={<ApiIntegrationPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        {user.role === 'customer' && <ChatWidget />}
      </div>
    </Router>
  );
}

