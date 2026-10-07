import React from 'react';
import { Settings, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguageTheme } from '../../context/LanguageThemeContext';

export const TicketSettingsPage = () => {
  const { t, language } = useLanguageTheme();
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets');
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(result.data);
      } else {
        setError(result.message || (language === 'en' ? 'Failed to load tickets.' : 'Gagal memuat tiket.'));
      }
    } catch (err) {
      console.error(err);
      setError(language === 'en' ? 'Failed to connect to server.' : 'Koneksi gagal ke server.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  const handlePriorityChange = async (ticketId: string, value: string) => {
    const isPriority = value === 'High';
    setUpdatingId(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_priority: isPriority })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, isPriority } : t));
        setToastMessage(language === 'en' ? `Ticket #${ticketId} priority updated successfully.` : `Prioritas Tiket #${ticketId} berhasil diperbarui.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || (language === 'en' ? 'Failed to update priority.' : 'Gagal mengubah prioritas.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Failed to connect to server.' : 'Koneksi gagal ke server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    setUpdatingId(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
        setToastMessage(language === 'en' ? `Ticket #${ticketId} status updated successfully.` : `Status Tiket #${ticketId} berhasil diperbarui.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || (language === 'en' ? 'Failed to update status.' : 'Gagal mengubah status.'));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'en' ? 'Failed to connect to server.' : 'Koneksi gagal ke server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('admin_tickets.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('admin_tickets.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap",
                  statusFilter === s 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {s === 'All' ? t('admin_users.filter_all') : s === 'Open' ? (language === 'en' ? 'Open' : 'Baru') : s === 'In Progress' ? (language === 'en' ? 'In Progress' : 'Proses') : (language === 'en' ? 'Resolved' : 'Selesai')}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder={t('admin_tickets.search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 text-xs sm:text-sm">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 sm:px-5">{t('admin_tickets.col_id')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_tickets.col_customer')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_tickets.col_subject')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_tickets.col_priority')}</th>
                  <th className="px-4 py-3 sm:px-5">{t('admin_tickets.col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-xs sm:text-sm">
                      <td className="px-4 py-3 sm:px-5 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                        #{ticket.id}
                      </td>
                      <td className="px-4 py-3 sm:px-5 font-medium text-slate-900 dark:text-white">{ticket.customerName}</td>
                      <td className="px-4 py-3 sm:px-5 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={ticket.subject}>
                        {ticket.subject}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <select 
                          value={ticket.isPriority ? 'High' : 'Low'}
                          disabled={updatingId === ticket.id}
                          onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-semibold px-2 py-1 rounded-lg focus:outline-none cursor-pointer border transition-colors",
                            ticket.isPriority 
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" 
                              : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          )}
                        >
                          <option value="Low">{t('admin_tickets.priority_normal')}</option>
                          <option value="High">{t('admin_tickets.priority_high')}</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <select 
                          value={ticket.status}
                          disabled={updatingId === ticket.id}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-semibold px-2 py-1 rounded-lg focus:outline-none cursor-pointer border transition-colors",
                            ticket.status === 'Open' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800" : 
                            ticket.status === 'In Progress' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" : 
                            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                          )}
                        >
                          <option value="Open">{language === 'en' ? 'Open' : 'Baru'}</option>
                          <option value="In Progress">{language === 'en' ? 'In Progress' : 'Proses'}</option>
                          <option value="Resolved">{language === 'en' ? 'Resolved' : 'Selesai'}</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                      {language === 'en' ? 'No tickets found.' : 'Tiket tidak ditemukan.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-800 text-xs font-semibold animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

