import React from 'react';
import { 
  MessageSquare, Search, Plus, ArrowRight, User, Users, 
  Loader2, X, Trash2, SlidersHorizontal, ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

export const ForumPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const userDisplayName = user?.name || 'tazkyaa';
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

  const defaultThreads = [
    {
      id: 'demo-1',
      authorName: 'tazkyaa',
      authorAvatar: '',
      date: '15 Jun',
      subject: 'Optimasi Cache VPS',
      description: 'Bagaimana cara set up Redis cache?',
      replyCount: 0,
      category: 'FORUM'
    },
    {
      id: 'demo-2',
      authorName: 'tazkyaa',
      authorAvatar: '',
      date: '12 Jun',
      subject: 'Konfigurasi SSL Auto-Renew Let\'s Encrypt',
      description: 'Panduan setting auto-renew sertifikat SSL di Nginx server tanpa downtime.',
      replyCount: 3,
      category: 'FORUM'
    },
    {
      id: 'demo-3',
      authorName: 'admin',
      authorAvatar: '',
      date: '10 Jun',
      subject: 'Best Practices Migrasi Database MySQL ke MariaDB',
      description: 'Tips transfer dump data besar dengan mysqldump tanpa lock table berkepanjangan.',
      replyCount: 5,
      category: 'FORUM'
    }
  ];

  const formattedThreads = threads.map(t => ({
    id: t.id,
    authorName: t.customerName || t.nama_pembuat || 'tazkyaa',
    authorAvatar: t.avatar || '',
    date: new Date(t.createdAt || t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    subject: t.subject || t.judul,
    description: t.description || t.konten,
    replyCount: t.replyCount || t.jumlah_balasan || 0,
    category: 'FORUM'
  }));

  const sourceThreads = formattedThreads.length > 0 ? formattedThreads : defaultThreads;

  const forumThreads = sourceThreads.filter(thread => {
    const matchesSearch = thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          thread.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Forum Hero / Welcome Card */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/5 shadow-xs transition-all relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Selamat Datang di Forum Komunitas Kroombox, {userDisplayName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              Tanyakan apapun, berbagi pengalaman, dan berdiskusi dengan sesama pengguna KroomCare secara terbuka.
            </p>
          </div>
          
          <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
            {/* Minimal Modern Forum Communication Illustration / Graphic */}
            <div className="hidden md:flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/20 border border-blue-100/60 dark:border-blue-800/30 shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MessageSquare size={18} />
              </div>
              <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center shadow-xs -ml-1">
                <Users size={14} />
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow-blue-500/25 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Plus size={16} className="stroke-[2.5]" />
              <span>+ Mulai Diskusi</span>
            </button>
          </div>
        </div>
      </section>

      {/* Forum Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input 
            type="text" 
            placeholder="Cari diskusi di forum..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/5 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <button 
          type="button"
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-xs shrink-0"
          title="Filter Diskusi"
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {/* Two-Column Composition: Discussions + Loyalty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Primary Column: Recent Discussions */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Diskusi Terbaru
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-bold">
                {forumThreads.length}
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={28} className="animate-spin text-blue-600" />
              </div>
            ) : forumThreads.length > 0 ? (
              forumThreads.map((thread, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={thread.id}
                  onClick={() => navigate(`/forum/${thread.id}`)}
                  className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                        {thread.authorAvatar ? (
                          <img src={thread.authorAvatar} alt={thread.authorName} className="w-full h-full object-cover" />
                        ) : (
                          (thread.authorName || 't')[0].toLowerCase()
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {thread.authorName} - {thread.date}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-full border border-teal-200/50 dark:border-teal-800/40">
                      FORUM
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                    {thread.subject}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {thread.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                      <MessageSquare size={13} />
                      <span>{thread.replyCount} Balasan</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Lihat Diskusi</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white dark:bg-slate-900 p-8 sm:p-14 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-3">
                  <Search size={22} />
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
        </div>

        {/* Secondary Column: Forum Loyalty Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-blue-600 via-blue-600 to-sky-600 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[250px]">
            {/* Subtle circular background gradients */}
            <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-blue-100 uppercase tracking-widest">
                  POIN LOYALITAS FORUM
                </h3>
                <Link 
                  to="/points-history" 
                  className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg transition-all text-white"
                  title="Riwayat Poin"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="mb-4">
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
                  {user?.points || 75} 
                  <span className="text-sm font-medium text-blue-100">pts</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-teal-300 via-sky-200 to-white h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)]" 
                    style={{ width: `${Math.min(((user?.points || 75) / 1000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Target: Buka Lencana Forum Premium
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6">
              <Link 
                to="/rewards" 
                className="block w-full py-2.5 bg-white text-blue-600 text-center rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-50 active:scale-[0.98] transition-all shadow-sm"
              >
                Tukar Sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Modal to Create Thread */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
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
                    placeholder="Contoh: Optimasi Cache VPS"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
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
