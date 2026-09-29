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
      const response = await fetch('/api/forums');
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
      const response = await fetch('/api/forums', {
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
    <div className="space-y-4 sm:space-y-5">
      {/* Search Header Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
              Forum Komunitas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tanyakan apapun, berbagi pengalaman, dan berdiskusi dengan sesama pengguna KroomCare secara terbuka.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.98] whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={18} />
            Mulai Diskusi
          </button>
        </div>

        {/* Search bar inside header */}
        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Cari diskusi di forum..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </section>

      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Diskusi Terbaru
          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-md text-xs font-semibold">{forumThreads.length}</span>
        </h2>
      </div>

      {/* Forum List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
        ) : forumThreads.length > 0 ? (
          forumThreads.map((thread, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              key={thread.id}
              onClick={() => navigate(`/forum/${thread.id}`)}
              className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400/60 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        <User size={12} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{thread.customerName || thread.nama_pembuat || 'Pengguna'}</span>
                    </div>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {new Date(thread.createdAt || thread.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-md ml-auto">
                      {thread.category || 'Komunitas'}
                    </span>
                    {user?.role === 'admin' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Apakah Anda yakin ingin menghapus diskusi ini beserta seluruh balasannya?')) {
                            try {
                              const response = await fetch(`/api/forums/${thread.id}`, {
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
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-all ml-1"
                        title="Hapus Diskusi (Moderasi Admin)"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1 truncate">
                    {thread.subject || thread.judul}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {thread.description || thread.konten}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <MessageSquare size={13} />
                      <span>{thread.replyCount || 0} Balasan</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                      <span>Lihat Diskusi</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-3">
              <Search size={24} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Diskusi tidak ditemukan</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
              Jadilah yang pertama untuk memulai diskusi baru di forum komunitas kami.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <Plus size={16} />
              Buat Diskusi Pertama
            </button>
          </div>
        )}
      </div>

      {/* Modern Modal to Create Thread */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Mulai Diskusi Baru</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateForum} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subjek/Judul Diskusi</label>
                  <input 
                    required
                    type="text"
                    placeholder="Contoh: Cara Reset Password KroomCare?"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Konten Pertanyaan / Diskusi</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Tuliskan detail pertanyaan atau topik yang ingin didiskusikan..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs disabled:opacity-75 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <MessageSquare size={16} />
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
