import React from 'react';
import { MessageSquare, User, ShieldCheck, ArrowLeft, Send, AlertTriangle, Coins, CheckCircle2, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';
import { useUser } from '../../context/UserContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { formatWIBDateTime, formatWIBTime, formatWIBDateGroup, getWIBDateKey } from '../../utils/dateUtils';

interface ForumThreadProps {
  userRole: UserRole;
}

export const ForumThreadPage: React.FC<ForumThreadProps> = ({ userRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { t, language } = useLanguageTheme();
  const [reply, setReply] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<{ id: string, name: string } | null>(null);
  
  const [ticket, setTicket] = React.useState<any | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGivingReward, setIsGivingReward] = React.useState(false);
  const [rewardPoints, setRewardPoints] = React.useState<number | ''>(50);
  const [showToastTransfer, setShowToastTransfer] = React.useState(false);

  const isTicketPath = location.pathname.includes('/tickets') || location.pathname.includes('/staff');
  const isEscalated = messages.some(msg => msg.text && (msg.text.includes("dieskalasi") || msg.text.includes("escalated")));
  const locale = language === 'en' ? 'en-US' : 'id-ID';

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const typePath = isTicketPath ? 'tickets' : 'forums';
      
      const resDetail = await fetch(`/api/${typePath}/${id}`);
      const detailResult = await resDetail.json();
      if (resDetail.ok && detailResult.success) {
        setTicket(detailResult.data);
        if (detailResult.data.rewardAmount) {
          setRewardPoints(detailResult.data.rewardAmount);
        }
      }

      const resReplies = await fetch(`/api/${typePath}/${id}/replies`);
      const repliesResult = await resReplies.json();
      if (resReplies.ok && repliesResult.success) {
        setMessages(repliesResult.data);
      }
    } catch (err) {
      console.error('Error fetching thread details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRepliesOnly = async () => {
    if (!id) return;
    try {
      const typePath = isTicketPath ? 'tickets' : 'forums';
      // Tambahkan timestamp untuk mencegah browser cache response polling
      const resReplies = await fetch(`/api/${typePath}/${id}/replies?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      const repliesResult = await resReplies.json();
      if (resReplies.ok && repliesResult.success) {
        setMessages(repliesResult.data);
      }
    } catch (_) {}
  };

  React.useEffect(() => {
    fetchDetails();

    // Auto-poll balasan baru setiap 2 detik secara background agar pesan real-time
    const interval = setInterval(() => {
      fetchRepliesOnly();
    }, 2000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (!ticket) return <div className="p-12 text-center font-bold text-slate-500">{t('thread.not_found')}</div>;

  const handleSetPriority = async () => {
    if (!ticket) return;
    const newPriority = !ticket.isPriority;
    try {
      const res = await fetch(`/api/tickets/${id}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_priority: newPriority })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTicket((prev: any) => prev ? { ...prev, isPriority: newPriority } : null);
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    }
  };

  const handleStatusChange = async (newStatus: 'Open' | 'In Progress' | 'Resolved') => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTicket((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    }
  };

  const handleTransferMaintenance = async () => {
    if (!ticket || isEscalated) return;

    try {
      const escalationText = language === 'en' 
        ? `[SYSTEM AUTO-ESCALATION]: Ticket #${id} has been escalated to Tier-2 Technical Maintenance.`
        : `[SISTEM AUTO-ESKALASI]: Tiket #${id} telah dieskalasi ke tim teknis perbaikan sistem (Maintenance).`;

      const res = await fetch(`/api/tickets/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          konten: escalationText
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setMessages((prev: any) => [...prev, result.data]);
        setShowToastTransfer(true);
        setTimeout(() => setShowToastTransfer(false), 4000);
      } else {
        alert(result.message || (language === 'en' ? 'Escalation failed.' : 'Gagal melakukan eskalasi.'));
      }
    } catch (error) {
      console.error('Error during maintenance transfer:', error);
      alert(language === 'en' ? 'Connection error during escalation.' : 'Terjadi kesalahan koneksi saat eskalasi.');
    }
  };

  const handleGiveReward = async () => {
    if (!ticket || rewardPoints === '' || rewardPoints <= 0) return;
    setIsGivingReward(true);

    try {
      const res = await fetch(`/api/points/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: id,
          user_id: ticket.customerId,
          points: rewardPoints
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setTicket((prev: any) => prev ? { ...prev, rewardGiven: true, rewardAmount: rewardPoints } : null);
        alert(result.message || (language === 'en' 
          ? `+${rewardPoints} Points have been rewarded to ${ticket.customerName}!` 
          : `+${rewardPoints} Poin berhasil dikonfirmasi untuk ${ticket.customerName}!`));
      } else {
        alert(result.message || (language === 'en' ? 'Failed to reward points.' : 'Gagal memberikan reward.'));
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    } finally {
      setIsGivingReward(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !user?.id) return;
    const contentToSend = replyingTo ? `@${replyingTo.name} ${reply}` : reply;

    try {
      let res;
      if (isTicketPath) {
        res = await fetch(`/api/tickets/${id}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, konten: contentToSend })
        });
      } else {
        res = await fetch(`/api/forums/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forum_id: id, user_id: user.id, konten: contentToSend })
        });
      }

      const result = await res.json();
      if (res.ok && result.success) {
        setMessages((prev: any) => [...prev, result.data]);
        setReply('');
        setReplyingTo(null);
        if (userRole === 'staff' && isTicketPath) {
          setTicket((prev: any) => prev ? { ...prev, status: 'In Progress' } : null);
        }
      } else {
        alert(result.message || (language === 'en' ? 'Failed to send reply.' : 'Gagal mengirim balasan.'));
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    }
  };

  const isPrivate = ticket.isPrivate;
  const isViewerStaff = 
    userRole === 'staff' || 
    userRole === 'admin' || 
    user?.role === 'staff' || 
    user?.role === 'admin' ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/admin');

  const isInitialRight = isPrivate ? !isViewerStaff : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Staff Priority Bar */}
      {userRole === 'staff' && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg transition-all",
            ticket.isPriority ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          )}
        >
          <div className="flex items-center gap-3 px-3">
            <AlertTriangle size={20} className={ticket.isPriority ? "animate-pulse" : ""} />
            <span className="text-sm font-black uppercase tracking-widest">
              {ticket.isPriority ? t('thread.priority_active') : t('thread.mark_priority')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {ticket.isPriority && (
              <button 
                id="btn_transfer_maintenance"
                data-testid="btn_transfer_maintenance"
                onClick={handleTransferMaintenance}
                disabled={isEscalated}
                className={cn(
                  "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2",
                  isEscalated 
                    ? "bg-slate-700/20 text-slate-400 border border-slate-700/30 cursor-not-allowed" 
                    : "bg-slate-900 text-white hover:bg-slate-800 border border-transparent shadow-md hover:shadow-lg cursor-pointer"
                )}
              >
                {isEscalated ? t('thread.escalated') : t('thread.transfer_maintenance')}
              </button>
            )}
            <button 
              onClick={handleSetPriority}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer",
                ticket.isPriority ? "bg-white text-orange-600" : "bg-orange-500 text-white"
              )}
            >
              {ticket.isPriority ? t('thread.cancel_priority') : t('thread.set_priority')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200/60 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                #{ticket.id}
              </span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase",
                isPrivate ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
              )}>
                {isPrivate ? t('thread.private_ticket') : t('thread.public_forum')}
              </span>
              {ticket.isPriority && (
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-bold uppercase animate-pulse">
                  {language === 'en' ? 'Priority' : 'Prioritas'}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{ticket.subject || ticket.judul}</h1>
          </div>
        </div>

        {(userRole === 'staff' || userRole === 'admin') && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[
                { val: 'Open', label: t('thread.status_new'), color: 'blue' },
                { val: 'In Progress', label: t('thread.status_process'), color: 'amber' },
                { val: 'Resolved', label: t('thread.status_resolved'), color: 'emerald' }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => handleStatusChange(s.val as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    ticket.status === s.val 
                      ? `bg-white dark:bg-slate-900 text-${s.color}-600 dark:text-${s.color}-400 shadow-sm font-black` 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Pemberian / Pengeditan Poin Reward */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xs">
                <span className="text-[10px] font-black uppercase text-slate-400">{t('thread.points_label')}</span>
                <input 
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setRewardPoints('');
                    } else {
                      const parsed = parseInt(val, 10);
                      if (!isNaN(parsed)) {
                        setRewardPoints(Math.max(0, parsed));
                      }
                    }
                  }}
                  placeholder="50"
                  className="w-14 bg-transparent border-none text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                />
              </div>

              <button 
                onClick={handleGiveReward}
                disabled={isGivingReward || rewardPoints === '' || Number(rewardPoints) < 0}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-[0.98]",
                  ticket.rewardGiven
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                )}
                title={ticket.rewardGiven 
                  ? (language === 'en' ? 'Update reward points for this customer' : 'Perbarui jumlah poin reward pelanggan') 
                  : (language === 'en' ? 'Give reward points to customer' : 'Kirim poin reward ke pelanggan')}
              >
                {ticket.rewardGiven ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>
                      {isGivingReward 
                        ? (language === 'en' ? 'Updating...' : 'Menyimpan...') 
                        : (language === 'en' ? `Reward Terkirim (${rewardPoints} Poin) • Ubah` : `Reward Terkirim (${rewardPoints} Poin) • Ubah`)}
                    </span>
                  </>
                ) : (
                  <>
                    <Coins size={16} fill="currentColor" />
                    <span>{isGivingReward ? t('thread.giving_points') : t('thread.give_points')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discussion Area */}
      <div className={cn(
        "space-y-6",
        isPrivate ? "bg-slate-100/50 dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-inner" : ""
      )}>
        {/* Original Post */}
        {!isPrivate && (
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex gap-4 md:gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900">
                <User size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{ticket.customerName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Author • Customer</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{formatWIBDateTime(ticket.createdAt || ticket.created_at, locale)}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{ticket.description || ticket.deskripsi}</p>
              </div>
            </div>
          </div>
        )}

        {/* Private Ticket Header (Email/Chat style) */}
        {isPrivate && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <ShieldCheck size={14} className="text-blue-500" />
              {language === 'en' 
                ? `Private Support Session: ${ticket.customerName} & Staff` 
                : `Sesi Chat Privat antara ${ticket.customerName} & Staff`}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {language === 'en' ? 'Ticket created on ' : 'Tiket dibuat pada '}
              {formatWIBDateTime(ticket.createdAt || ticket.created_at, locale)}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence>
            {/* Show description as first message in private chat mode */}
            {isPrivate && (
              <>
                <div className="flex justify-center my-3">
                  <span className="px-3.5 py-1 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full border border-slate-200/80 dark:border-slate-700 shadow-xs uppercase tracking-wider">
                    {formatWIBDateGroup(ticket.createdAt || ticket.created_at, locale)}
                  </span>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col",
                    isInitialRight ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl shadow-sm transition-all",
                    isInitialRight 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md" 
                      : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800"
                  )}>
                    <p className={cn(
                      "text-[10px] font-bold mb-1",
                      isInitialRight ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                    )}>
                      {ticket.customerName}
                    </p>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isInitialRight ? "text-white" : "text-slate-700 dark:text-slate-200"
                    )}>
                      {ticket.description || ticket.deskripsi}
                    </p>
                    <span className={cn(
                      "text-[9px] block mt-2 text-right",
                      isInitialRight ? "text-blue-100/80" : "text-slate-400"
                    )}>
                      {formatWIBTime(ticket.createdAt || ticket.created_at, locale)}
                    </span>
                  </div>
                </motion.div>
              </>
            )}

            {messages.map((msg, index) => {
              const isStaffOrAdmin = msg.userRole === 'staff' || msg.userRole === 'admin';
              const isMyMessage = Boolean(
                (user?.id && String(msg.userId) === String(user.id)) ||
                (user?.name && msg.userName && user.name.toLowerCase() === msg.userName.toLowerCase())
              );
              
              let isRight = false;
              if (isPrivate) {
                if (isViewerStaff) {
                  // Staff / Admin melihat tiket: balasan staff/admin di kanan, balasan customer di kiri
                  isRight = isStaffOrAdmin || isMyMessage;
                } else {
                  // User / Customer melihat tiket: pesan dari diri sendiri di kanan, pesan staff di kiri
                  // isStaffOrAdmin=true → pesan dari staff → tampil di KIRI (isRight=false)
                  // isStaffOrAdmin=false → pesan dari customer → tampil di KANAN (isRight=true)
                  isRight = !isStaffOrAdmin;
                }
              }

              // Hitung pembatas tanggal (date divider)
              const prevDateKey = index === 0
                ? (isPrivate ? getWIBDateKey(ticket.createdAt || ticket.created_at) : '')
                : getWIBDateKey(messages[index - 1].createdAt);
              const currentDateKey = getWIBDateKey(msg.createdAt);
              const showDateDivider = isPrivate && currentDateKey && currentDateKey !== prevDateKey;

              return (
                <React.Fragment key={msg.id}>
                  {showDateDivider && (
                    <div className="flex justify-center my-4">
                      <span className="px-3.5 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-200 dark:border-blue-900 shadow-xs uppercase tracking-wider">
                        {formatWIBDateGroup(msg.createdAt, locale)}
                      </span>
                    </div>
                  )}

                  <motion.div 
                    initial={{ opacity: 0, x: isPrivate ? (isRight ? 20 : -20) : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex flex-col",
                      isPrivate 
                        ? (isRight ? "items-end" : "items-start") 
                        : "items-stretch"
                    )}
                  >
                  <div className={cn(
                    "relative group transition-all",
                    isPrivate 
                      ? cn(
                          "max-w-[80%] p-4 rounded-2xl shadow-sm",
                          isRight 
                            ? "bg-blue-600 text-white rounded-tr-none shadow-md" 
                            : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800"
                        )
                      : cn(
                          "p-6 md:p-8 rounded-[2rem] border shadow-sm",
                          isStaffOrAdmin 
                            ? "bg-slate-900 border-slate-800 ml-8 md:ml-12 dark:bg-slate-950 dark:border-blue-900/50" 
                            : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                        )
                  )}>
                    {!isPrivate && (
                      <div className="flex gap-4 md:gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                          isStaffOrAdmin 
                            ? "bg-blue-600 border-blue-500 text-white" 
                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}>
                          {isStaffOrAdmin ? <ShieldCheck size={24} /> : <User size={24} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h4 className={cn(
                                "text-base font-bold",
                                isStaffOrAdmin ? "text-white" : "text-slate-900 dark:text-white"
                              )}>
                                {msg.userName}
                              </h4>
                              {isStaffOrAdmin && (
                                <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-md font-black uppercase tracking-tighter shadow-md">
                                  {msg.userRole === 'admin' ? 'Administrator' : 'Official Staff'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">{formatWIBDateTime(msg.createdAt, locale)}</span>
                              {user?.role === 'admin' && !isTicketPath && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(language === 'en' ? 'Are you sure you want to delete this reply?' : 'Apakah Anda yakin ingin menghapus balasan ini?')) {
                                      try {
                                        const res = await fetch(`/api/forums/replies/${msg.id}`, {
                                          method: 'DELETE'
                                        });
                                        const result = await res.json();
                                        if (res.ok && result.success) {
                                          setMessages(prev => prev.filter(m => m.id !== msg.id));
                                        } else {
                                          alert(result.message || (language === 'en' ? 'Failed to delete reply.' : 'Gagal menghapus balasan.'));
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        alert(language === 'en' ? 'Connection error.' : 'Koneksi gagal.');
                                      }
                                    }
                                  }}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors cursor-pointer"
                                  title={language === 'en' ? 'Delete Reply' : 'Hapus Balasan'}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className={cn(
                            "leading-relaxed text-base",
                            isStaffOrAdmin ? "text-slate-200" : "text-slate-600 dark:text-slate-300"
                          )}>
                            {msg.text}
                          </p>
                          
                          {/* Reply Action for Forum */}
                          <div className="mt-4 pt-4 border-t border-slate-100/10 flex justify-end">
                             <button 
                              onClick={() => setReplyingTo({ id: msg.id, name: msg.userName })}
                              className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Send size={12} className="-rotate-45" />
                              {language === 'en' ? 'Reply' : 'Balas'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isPrivate && (
                      <>
                        <p className={cn(
                          "text-[10px] font-bold mb-1",
                          isRight ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                        )}>
                          {msg.userName}
                        </p>
                        <p className={cn(
                          "text-sm leading-relaxed",
                          isRight ? "text-white" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {msg.text}
                        </p>
                        <span className={cn(
                          "text-[9px] block mt-2 text-right",
                          isRight ? "text-blue-100/80" : "text-slate-400"
                        )}>
                          {formatWIBTime(msg.createdAt, locale)}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              </React.Fragment>
            );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Container */}
      {ticket.status !== 'Resolved' && (
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-t-xl border-t border-slate-200/80 dark:border-slate-800 z-30 -mx-3 sm:mx-0 shadow-lg">
          <div className="max-w-4xl mx-auto">
            {replyingTo && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border-x border-t border-blue-100 dark:border-blue-900 rounded-t-xl flex items-center justify-between">
                 <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  {t('thread.replying_to')} <span className="text-blue-800 dark:text-blue-200">@{replyingTo.name}</span>
                 </p>
                 <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600 cursor-pointer">
                  <MoreHorizontal size={14} />
                 </button>
              </div>
            )}
            <div className={cn(
              "bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 p-1.5 flex items-end gap-2",
              replyingTo && "rounded-t-none"
            )}>
              <textarea 
                rows={replyingTo || isPrivate ? 1 : 2}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (reply.trim()) {
                      handleSendReply();
                    }
                  }
                }}
                placeholder={isPrivate ? (language === 'en' ? 'Type message to staff...' : 'Ketik pesan untuk staff...') : t('thread.write_reply')}
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none resize-none text-slate-800 dark:text-slate-100 text-xs sm:text-sm"
              />
              <button 
                onClick={handleSendReply}
                disabled={!reply.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs active:scale-[0.98] shrink-0 cursor-pointer"
              >
                <Send size={16} className={isPrivate ? "" : "-rotate-45"} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Escalation */}
      {showToastTransfer && (
        <div 
          id="toast_success_transfer"
          data-testid="toast_success_transfer"
          className="toast_success_transfer fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 z-50 animate-bounce"
        >
          <CheckCircle2 size={20} className="text-emerald-500" />
          <span className="text-xs font-bold">
            {language === 'en' 
              ? 'Ticket successfully escalated to Tier-2 Technical Maintenance' 
              : 'Sistem berhasil melakukan eskalasi tiket ke tim teknis'}
          </span>
        </div>
      )}
    </div>
  );
};
