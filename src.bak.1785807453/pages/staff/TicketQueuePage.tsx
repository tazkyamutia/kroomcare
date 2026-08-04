import React from 'react';
import { Ticket, Search, Filter, ArrowRight, ListFilter, Loader2 } from 'lucide-react';
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
        const response = await fetch('http://localhost:5000/api/tickets');
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
                         
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Antrean Keluhan Privat</h1>
          <p className="text-slate-500 mt-1">Daftar aduan teknis dan billing yang harus ditangani secara privat.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            {tickets.filter(t => t.isPriority && t.status !== 'Resolved').length} Perlu Prioritas
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200">
        <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-slate-500 border border-slate-100">
              <ListFilter size={18} />
              <span className="text-xs font-black uppercase tracking-tighter">Filter:</span>
            </div>
            <div className="flex gap-2">
              {['All', 'Priority', 'High', 'Medium', 'Low'].map(p => (
                <button 
                  key={p}
                  onClick={() => setFilter(p)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95",
                    filter === p 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ID Tiket, Subjek, atau Nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-sm outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-brand-600" />
            </div>
          ) : filteredTickets.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="px-8 py-5">Detail Aduan</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Urgensi</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Navigasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={ticket.id} 
                    className={cn(
                      "hover:bg-slate-50 transition-colors group",
                      ticket.isPriority ? "bg-orange-50/30" : ""
                    )}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">#{ticket.id}</span>
                        {ticket.isPriority && (
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-orange-500 text-white rounded-md animate-pulse">Urgent</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{ticket.subject}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-medium">{ticket.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {ticket.customerName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{ticket.customerName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-wider",
                        ticket.isPriority ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {ticket.isPriority ? 'High' : 'Low'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          ticket.status === 'Resolved' ? "bg-emerald-500" :
                          ticket.status === 'In Progress' ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">
                          {ticket.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-brand-600 hover:text-brand-600 transition-all shadow-sm active:scale-95 group-hover:shadow-lg"
                      >
                        Buka Chat
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                <Ticket size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Antrean Bersih!</h3>
              <p className="text-slate-500 text-sm max-w-xs">Tidak ada aduan keluhan saat ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
