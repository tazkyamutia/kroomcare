import React from 'react';
import { Settings, Ticket, Search, Filter, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TicketSettingsPage = () => {
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
      const response = await fetch('http://localhost:5000/api/tickets');
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(result.data);
      } else {
        setError(result.message || 'Gagal memuat tiket.');
      }
    } catch (err) {
      console.error(err);
      setError('Koneksi gagal ke server.');
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
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_priority: isPriority })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, isPriority } : t));
        setToastMessage(`Prioritas Tiket #${ticketId} berhasil diperbarui.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || 'Gagal mengubah prioritas.');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal ke server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    setUpdatingId(ticketId);
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
        setToastMessage(`Status Tiket #${ticketId} berhasil diperbarui.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(result.message || 'Gagal mengubah status.');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi gagal ke server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Ticket Settings</h1>
            <p className="text-slate-500 mt-1">Konfigurasi prioritas dan pantau semua tiket sistem secara langsung dari Database MySQL.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-900">Global Ticket View</h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              {['All', 'Open', 'In Progress', 'Resolved'].map(s => (
                <button 
                  key={s} 
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "text-[10px] px-3 py-1 rounded-md font-bold transition-all",
                    statusFilter === s 
                      ? "bg-white text-slate-950 shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari ID, nama, atau subjek..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-slate-900" size={32} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-6 py-4">ID Tiket</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Subjek</th>
                  <th className="px-6 py-4">Prioritas</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-brand-600">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{ticket.customerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={ticket.subject}>
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={ticket.isPriority ? 'High' : 'Low'}
                          disabled={updatingId === ticket.id}
                          onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg focus:outline-none border-none cursor-pointer",
                            ticket.isPriority ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                          )}
                        >
                          <option value="Low">Low (Normal)</option>
                          <option value="High">High (Priority)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={ticket.status}
                          disabled={updatingId === ticket.id}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg focus:outline-none border-none transition-colors cursor-pointer",
                            ticket.status === 'Open' ? "bg-blue-100 text-blue-700" : 
                            ticket.status === 'In Progress' ? "bg-amber-100 text-amber-700" : 
                            "bg-emerald-100 text-emerald-700"
                          )}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-sm font-medium">
                      Tiket tidak ditemukan.
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
