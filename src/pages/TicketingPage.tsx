import React from 'react';
import { Ticket, Clock, CheckCircle2, AlertCircle, Plus, Search, MessageSquare, ArrowRight, Lightbulb } from 'lucide-react';
import { DUMMY_TICKETS } from '../utils/dummyData';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

export const TicketingPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTickets = DUMMY_TICKETS.filter(ticket => {
    // Only Private Tickets for current user (or Staff/Admin seeing private tickets)
    // For Member view: just their own private tickets
    const isMine = ticket.customerId === user?.id;
    const isPrivate = ticket.isPrivate;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return isPrivate && isMine && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Tiket Saya</h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Daftar keluhan privat Anda. Hanya Anda dan Tim Support KroomCare yang dapat melihat diskusi di sini.
            </p>
          </div>
          
          <Link 
            to="/tickets/new"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all font-bold shadow-lg shadow-brand-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={24} />
            Buat Keluhan
          </Link>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" size={22} />
        <input 
          type="text" 
          placeholder="Cari dalam tiket saya..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all text-base placeholder:text-slate-400"
        />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className={cn(
                "bg-white p-6 md:p-8 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden",
                ticket.isPriority ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-brand-200 shadow-sm hover:shadow-xl"
              )}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                      ticket.isPriority ? "bg-red-500 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {ticket.isPriority ? 'Prioritas' : ticket.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      ID: {ticket.id} • {new Date(ticket.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-3 leading-tight">
                    {ticket.subject}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-1 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className={cn(
                    "text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tight",
                    ticket.status === 'Resolved' ? "bg-emerald-100 text-emerald-700" :
                    ticket.status === 'In Progress' ? "bg-amber-100 text-amber-700" : 
                    "bg-blue-100 text-blue-700"
                  )}>
                    {ticket.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-brand-600 font-bold text-xs bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-100">
                    <MessageSquare size={14} />
                    Chat Support
                  </div>
                </div>
              </div>
              
              {ticket.isPriority && (
                <div className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-bl-2xl animate-pulse">
                  <AlertCircle size={14} />
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
            <Ticket size={48} className="text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada tiket keluhan</h3>
            <p className="text-slate-500 max-w-sm mb-8">Punya kendala teknis atau billing? Tim support kami siap membantu Anda secara privat.</p>
            <Link 
              to="/tickets/new"
              className="px-8 py-3.5 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20"
            >
              Buat Tiket Sekarang
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

