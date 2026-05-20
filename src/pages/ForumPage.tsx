import React from 'react';
import { MessageSquare, Search, Plus, ArrowRight, User, Users } from 'lucide-react';
import { DUMMY_TICKETS } from '../utils/dummyData';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

export const ForumPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const forumThreads = DUMMY_TICKETS.filter(ticket => {
    const isPublic = !ticket.isPrivate;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isPublic && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search Header Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[2.5rem] p-8 md:p-14 text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Users size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold">Forum Komunitas</h1>
          </div>
          <p className="text-indigo-50 text-lg mb-10 leading-relaxed max-w-2xl">
            Tanyakan apapun, berbagi pengalaman, dan berdiskusi dengan sesama pengguna KroomCare secara terbuka.
          </p>
          
          <div className="relative group max-w-xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Cari diskusi di forum..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white text-slate-900 rounded-2xl shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-400/30 transition-all text-lg placeholder:text-slate-400"
            />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <MessageSquare size={400} strokeWidth={1} />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Diskusi Terbaru
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{forumThreads.length}</span>
        </h2>
        
        <Link 
          to="/tickets/new"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
        >
          <Plus size={20} />
          Mulai Diskusi
        </Link>
      </div>

      {/* Forum List */}
      <div className="grid gap-6">
        {forumThreads.length > 0 ? (
          forumThreads.map((thread, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={thread.id}
              onClick={() => navigate(`/forum/${thread.id}`)}
              className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group relative"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                        <User size={14} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{thread.customerName}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(thread.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg ml-auto">
                      {thread.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-3 leading-tight">
                    {thread.subject}
                  </h3>
                  
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6">
                    {thread.description}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <MessageSquare size={16} />
                      12 Balasan
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold px-3 py-1 bg-emerald-50 rounded-full">
                      <ArrowRight size={14} />
                      Lihat Diskusi
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Diskusi tidak ditemukan</h3>
            <p className="text-slate-500 max-w-sm mb-8">Jadilah yang pertama untuk memulai diskusi baru di forum komunitas kami.</p>
            <Link 
              to="/tickets/new"
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold"
            >
              Buat Diskusi Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
