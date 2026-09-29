import React from 'react';
import { Ticket, Search, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const TicketQueuePage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAllTickets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/tickets');
        const result = await response.json();
        if (response.ok && result.success) {
          setTickets(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch all tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (t.status === 'Resolved') return false;

    const matchesFilter = filter === 'All' || 
                        (filter === 'Priority' ? t.isPriority : 
                         filter === 'High' ? t.isPriority : 
                         filter === 'Low' ? !t.isPriority : !t.isPriority);
                         
    const matchesSearch = (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const priorityCount = tickets.filter(t => t.isPriority && t.status !== 'Resolved').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Antrean Keluhan Privat</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Daftar aduan teknis dan billing yang harus ditangani secara privat.</p>
        </div>
        {priorityCount > 0 && (
          <div className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {priorityCount} Perlu Prioritas
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 dark:border-slate-800">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'All', label: 'Semua' },
              { id: 'Priority', label: 'Prioritas' },
              { id: 'High', label: 'High' },
              { id: 'Low', label: 'Low' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  filter === tab.id 
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Cari ID, subjek, nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 sm:px-5">Detail Aduan</th>
                  <th className="px-4 py-3 sm:px-5">Pelanggan</th>
                  <th className="px-4 py-3 sm:px-5">Urgensi</th>
                  <th className="px-4 py-3 sm:px-5">Status</th>
                  <th className="px-4 py-3 sm:px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    key={ticket.id} 
                    className={cn(
                      "hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group text-xs sm:text-sm",
                      ticket.isPriority ? "bg-amber-50/20 dark:bg-amber-950/10" : ""
                    )}
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                          #{ticket.id}
                        </span>
                        {ticket.isPriority && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-red-500 text-white rounded">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{ticket.subject}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">{ticket.description}</p>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                          {ticket.customerName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate">{ticket.customerName}</span>
                          <span className="text-[10px] text-slate-400">{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider",
                        ticket.isPriority ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800" : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      )}>
                        {ticket.isPriority ? 'High' : 'Low'}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ticket.status === 'Resolved' ? "bg-emerald-500" :
                          ticket.status === 'In Progress' ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {ticket.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 sm:px-5 text-right">
                      <button 
                        onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs"
                      >
                        Buka
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-2">
                <Ticket size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Antrean Bersih</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tidak ada aduan tiket aktif saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
