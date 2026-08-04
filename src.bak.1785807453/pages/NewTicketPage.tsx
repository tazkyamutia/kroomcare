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
      const response = await fetch('http://localhost:5000/api/tickets', {
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/tickets')}
          className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-display font-bold text-slate-900">Buat Tiket Baru</h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card p-8 rounded-3xl space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Subjek Kendala</label>
          <input 
            required
            type="text"
            placeholder="Contoh: Website Error 500"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kategori</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
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
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Prioritas</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Deskripsi Detail</label>
          <textarea 
            required
            rows={5}
            placeholder="Jelaskan kendala Anda secara mendetail..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Tim dukungan kami akan merespons tiket Anda dalam waktu maksimal 24 jam kerja. Pastikan deskripsi sudah lengkap untuk mempercepat proses mitigasi.
          </p>
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-75 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Mengirim...
            </>
          ) : (
            <>
              <Send size={20} />
              Kirim Tiket
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
};
