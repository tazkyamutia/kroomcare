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

  const isEmbedded = typeof window !== 'undefined' && window.parent && window.parent !== window;

  return (
    <div className={cn("space-y-3 sm:space-y-4", isEmbedded && "pt-1")}>
      {/* Standalone Header Section (Hidden in Embedded mode to eliminate duplicate headers) */}
      {!isEmbedded && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t('tickets.title')}
              </h1>
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
      )}

      {/* Unified Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white/60 dark:bg-slate-900/40 p-1.5 sm:p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xs">
        {/* Status Filter Tabs */}
        <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              statusFilter === 'active' 
                ? "bg-blue-600 text-white shadow-xs" 
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
                ? "bg-blue-600 text-white shadow-xs" 
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
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            {t('tickets.tab_all')}
          </button>
        </div>

        {/* Search Input & Action Button in Embedded */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder={t('tickets.search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 sm:py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {isEmbedded && (
            <Link 
              to="/tickets/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all shrink-0 active:scale-95"
            >
              <Plus size={15} />
              <span>{t('tickets.create_btn')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-2.5 sm:space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={32} className="animate-spin text-blue-600" />
            <span className="text-xs text-slate-400 font-medium">Memuat tiket...</span>
          </div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className={cn(
                "bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                ticket.isPriority 
                  ? "border-red-200/80 bg-red-50/20 dark:bg-red-950/10 shadow-xs" 
                  : "border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md shadow-2xs"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                      ticket.isPriority ? "bg-red-500 text-white" : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50"
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
                    (ticket.status === 'Resolved' || ticket.status === 'selesai') ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50" :
                    (ticket.status === 'In Progress' || ticket.status === 'proses') ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50" : 
                    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50"
                  )}>
                    {(ticket.status === 'Resolved' || ticket.status === 'selesai') ? t('tickets.status_resolved') :
                     (ticket.status === 'In Progress' || ticket.status === 'proses') ? t('tickets.status_processing') :
                     t('tickets.status_waiting')}
                  </span>
                  <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900 group-hover:bg-blue-600 group-hover:text-white transition-all">
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
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center">
            {/* Elegant Icon Container */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner mb-4">
              <Ticket size={28} className="stroke-[1.75]" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              {t('tickets.no_tickets')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
              {t('tickets.no_tickets_desc')}
            </p>

            <Link 
              to="/tickets/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-[0.98] mb-8"
            >
              <Plus size={17} />
              {t('tickets.create_btn')}
            </Link>

            {/* Quick Helper Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <div 
                onClick={() => navigate('/forum')}
                className="p-3 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {language === 'en' ? 'Solution Forum' : 'Forum Komunitas'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {language === 'en' ? 'Find instant answers & discuss with fellow webmasters.' : 'Temukan jawaban cepat & panduan dari sesama pengguna hosting.'}
                </p>
              </div>

              <div 
                onClick={() => navigate('/rewards')}
                className="p-3 bg-slate-50/80 dark:bg-slate-800/40 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 rounded-xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Gift size={14} className="text-amber-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {language === 'en' ? 'Loyalty Rewards' : 'Poin & Hadiah'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {language === 'en' ? 'Earn points and redeem discounts for your hosting plan.' : 'Kumpulkan koin reward dan tukarkan dengan diskon hosting.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

