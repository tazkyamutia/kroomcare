import React from 'react';
import { Ticket, Clock, CheckCircle2, AlertCircle, Plus, Search, MessageSquare, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';
import { useLanguageTheme } from '../context/LanguageThemeContext';

export const TicketingPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { t, language } = useLanguageTheme();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'active' | 'resolved' | 'all'>('active');
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.id) return;
    
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/tickets?user_id=${user.id}`);
        const result = await response.json();
        if (response.ok && result.success) {
          setTickets(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const filteredTickets = tickets.filter(ticket => {
    const subject = ticket.subject || ticket.judul || '';
    const desc = ticket.description || ticket.deskripsi || '';
    const status = (ticket.status || '').toLowerCase();

    const matchesSearch = subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = status !== 'resolved' && status !== 'selesai';
    } else if (statusFilter === 'resolved') {
      matchesStatus = status === 'resolved' || status === 'selesai';
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              {t('tickets.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('tickets.subtitle')}
            </p>
          </div>
          
          <Link 
            to="/tickets/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98] whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={18} />
            {t('tickets.create_btn')}
          </Link>
        </div>
      </section>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              statusFilter === 'active' 
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {t('tickets.tab_active')}
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              statusFilter === 'resolved' 
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {t('tickets.tab_resolved')}
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              statusFilter === 'all' 
                ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {t('tickets.tab_all')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder={t('tickets.search_placeholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className={cn(
                "bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                ticket.isPriority 
                  ? "border-red-200 bg-red-50/20 dark:bg-red-950/10" 
                  : "border-slate-200/80 dark:border-slate-800 hover:border-blue-400/60 shadow-xs hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                      ticket.isPriority ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    )}>
                      {ticket.isPriority ? t('tickets.priority') : (ticket.category || ticket.kategori || 'General')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      #{ticket.id} • {new Date(ticket.createdAt || ticket.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID')}
                    </span>
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1 truncate">
                    {ticket.subject || ticket.judul}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {ticket.description || ticket.deskripsi}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn(
                    "text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize",
                    (ticket.status === 'Resolved' || ticket.status === 'selesai') ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                    (ticket.status === 'In Progress' || ticket.status === 'proses') ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" : 
                    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                  )}>
                    {(ticket.status === 'Resolved' || ticket.status === 'selesai') ? t('tickets.status_resolved') :
                     (ticket.status === 'In Progress' || ticket.status === 'proses') ? t('tickets.status_processing') :
                     t('tickets.status_waiting')}
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
                    <MessageSquare size={13} />
                    <span>{language === 'en' ? 'Chat Support' : 'Dukungan Chat'}</span>
                  </div>
                </div>
              </div>
              
              {ticket.isPriority && (
                <div className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg">
                  <AlertCircle size={12} />
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-3">
              <Ticket size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{t('tickets.no_tickets')}</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
              {t('tickets.no_tickets_desc')}
            </p>
            <Link 
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <Plus size={16} />
              {t('tickets.create_btn')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

