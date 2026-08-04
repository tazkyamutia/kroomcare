import React from 'react';
import { MessageSquare, Search, Plus, ArrowRight, User, Users, Loader2, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

export const ForumPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [threads, setThreads] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Form modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchForums = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/forums');
      const result = await response.json();
      if (response.ok && result.success) {
        setThreads(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch forums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchForums();
  }, []);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Judul dan konten wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          judul: newTitle,
          konten: newContent
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        alert('Diskusi forum berhasil dibuat!');
        setNewTitle('');
        setNewContent('');
        setIsModalOpen(false);
        fetchForums(); // refresh
      } else {
        alert(result.message || 'Gagal membuat diskusi.');
      }
    } catch (error) {
      console.error('Failed to create forum thread:', error);
      alert('Terjadi kesalahan koneksi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const forumThreads = threads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          thread.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-95 text-sm"
        >
          <Plus size={20} />
          Mulai Diskusi
        </button>
      </div>

      {/* Forum List */}
      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : forumThreads.length > 0 ? (
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
                    {user?.role === 'admin' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Apakah Anda yakin ingin menghapus diskusi ini beserta seluruh balasannya?')) {
                            try {
                              const response = await fetch(`http://localhost:5000/api/forums/${thread.id}`, {
                                method: 'DELETE'
                              });
                              const result = await response.json();
                              if (response.ok && result.success) {
                                alert('Diskusi berhasil dihapus.');
                                fetchForums();
                              } else {
                                alert(result.message || 'Gagal menghapus diskusi.');
                              }
                            } catch (err) {
                              console.error('Error deleting thread:', err);
                              alert('Gagal terhubung ke server.');
                            }
                          }
                        }}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all ml-2"
                        title="Hapus Diskusi (Moderasi Admin)"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
                      {thread.replyCount || 0} Balasan
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Buat Diskusi Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modern Modal to Create Thread */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-slate-900">Mulai Diskusi Baru</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateForum} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subjek/Judul Diskusi</label>
                  <input 
                    required
                    type="text"
                    placeholder="Contoh: Cara Reset Password KroomCare?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Konten Pertanyaan / Diskusi</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tuliskan detail pertanyaan atau topik yang ingin didiskusikan..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-75 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={20} />
                      Buat Thread
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
