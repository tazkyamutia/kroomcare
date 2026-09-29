import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../context/UserContext';

export const NewTicketPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [formData, setFormData] = React.useState({
    subject: '',
    category: 'Hosting',
    priority: 'Medium',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert('Anda harus login terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          judul: formData.subject,
          deskripsi: formData.description,
          is_priority: formData.priority === 'High' ? 1 : 0
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        updateUser({ points: (user.points || 0) + 50 });
        alert('Tiket berhasil dibuat!');
        navigate('/tickets');
      } else {
        alert(result.message || 'Gagal membuat tiket.');
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Terjadi kesalahan koneksi server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/tickets')}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Buat Tiket Baru</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ajukan keluhan atau kendala teknis layanan Anda</p>
        </div>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subjek Kendala</label>
          <input 
            required
            type="text"
            placeholder="Contoh: Website Error 500"
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori</label>
            <select 
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Hosting">Hosting</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="Domain">Domain</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prioritas</label>
            <select 
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi Detail</label>
          <textarea 
            required
            rows={4}
            placeholder="Jelaskan kendala Anda secara mendetail..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5">
          <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
            Tim dukungan kami akan merespons tiket Anda dalam waktu maksimal 24 jam kerja. Pastikan deskripsi sudah lengkap untuk mempercepat proses mitigasi.
          </p>
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
              <Send size={16} />
              Kirim Tiket
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};
