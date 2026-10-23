import React from 'react';
import { MessageSquare, User, ShieldCheck, ArrowLeft, Send, AlertTriangle, Coins, CheckCircle2, MoreHorizontal, Loader2, Trash2, AlertCircle, CheckCheck, RotateCw } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types';
import { useUser } from '../../context/UserContext';
import { useLanguageTheme } from '../../context/LanguageThemeContext';
import { formatWIBDateTime, formatWIBTime, formatWIBDateGroup, getWIBDateKey } from '../../utils/dateUtils';
import { withAuthToken } from '../../utils/fetchAuth';

// Penanda balasan eskalasi (teks baru & lama) — sama dengan server/utils/ticketAccess.js.
const ESCALATION_MARKERS = ['[ESKALASI]', '[SISTEM AUTO-ESKALASI]', '[SYSTEM AUTO-ESCALATION]', 'Tiket telah dieskalasi ke tim teknis'];
const isEscalationMessage = (msg: any) => {
  const text = String(msg?.text || msg?.konten || msg?.message || '');
  return (msg?.userRole === 'staff' || msg?.userRole === 'admin') && ESCALATION_MARKERS.some(m => text.startsWith(m));
};

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
  const [staffOptions, setStaffOptions] = React.useState<{ id: string; name: string; role: string }[]>([]);
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);

  const isTicketPath = location.pathname.includes('/tickets') || location.pathname.includes('/staff');
  const isEscalated = Boolean(ticket?.isEscalated) || messages.some(isEscalationMessage);
  const locale = language === 'en' ? 'en-US' : 'id-ID';

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const prevMessagesCountRef = React.useRef(0);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const typePath = isTicketPath ? 'tickets' : 'forums';
      
      const resDetail = await fetch(`/api/${typePath}/${id}?_t=${Date.now()}`);
      const detailResult = await resDetail.json();
      if (resDetail.ok && detailResult.success) {
        setTicket(detailResult.data);
        if (detailResult.data.rewardAmount) {
          setRewardPoints(detailResult.data.rewardAmount);
        }
      }

      const resReplies = await fetch(`/api/${typePath}/${id}/replies?_t=${Date.now()}`);
      const repliesResult = await resReplies.json();
      if (resReplies.ok && repliesResult.success) {
        setMessages(repliesResult.data);
        prevMessagesCountRef.current = repliesResult.data.length;
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
      // Gunakan query param timestamp untuk anti-cache tanpa header kustom agar tidak memicu CORS error di iframe/embed
      const resReplies = await fetch(`/api/${typePath}/${id}/replies?_t=${Date.now()}`);
      const repliesResult = await resReplies.json();
      if (resReplies.ok && repliesResult.success && Array.isArray(repliesResult.data)) {
        setMessages(prev => {
          if (prev.length !== repliesResult.data.length || JSON.stringify(prev) !== JSON.stringify(repliesResult.data)) {
            return repliesResult.data;
          }
          return prev;
        });

        // Jika ada balasan baru masuk dari lawan bicara, scroll otomatis ke pesan terbaru
        if (repliesResult.data.length > prevMessagesCountRef.current) {
          prevMessagesCountRef.current = repliesResult.data.length;
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }

      // Sinkronisasi status tiket bila diubah oleh staf (misal dari Open ke In Progress / Resolved)
      if (isTicketPath) {
        const resDetail = await fetch(`/api/tickets/${id}?_t=${Date.now()}`);
        const detailResult = await resDetail.json();
        if (resDetail.ok && detailResult.success && detailResult.data) {
          const d = detailResult.data;
          setTicket((prev: any) => {
            if (!prev) return prev;
            if (prev.status === d.status && prev.assignedTo === d.assignedTo && prev.isPriority === d.isPriority && prev.isEscalated === d.isEscalated) return prev;
            return { ...prev, status: d.status, assignedTo: d.assignedTo, assignedStaffName: d.assignedStaffName, isPriority: d.isPriority, isEscalated: d.isEscalated };
          });
        }
      }
    } catch (err) {
      console.warn('Polling error:', err);
    }
  };

  React.useEffect(() => {
    fetchDetails();

    // 1. Real-time Subscription Channel: private-ticket.{id} & kroomcare_ticket_{id}
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let fallbackInterval: any = null;
    let retryDelay = 1000;
    let isConnected = false;

    const startFallbackPolling = () => {
      if (!fallbackInterval) {
        fallbackInterval = setInterval(fetchRepliesOnly, 5000);
      }
    };

    const stopFallbackPolling = () => {
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
        fallbackInterval = null;
      }
    };

    const connectTicketStream = () => {
      if (!id || !isTicketPath) return;

      try {
        eventSource = new EventSource(withAuthToken(`/api/tickets/${id}/realtime`));

        eventSource.addEventListener('connected', () => {
          isConnected = true;
          retryDelay = 1000;
          stopFallbackPolling();
        });

        eventSource.addEventListener('MessageSent', (event: MessageEvent) => {
          try {
            const incoming = JSON.parse(event.data);
            const incomingMsgText = incoming.content || incoming.text || incoming.konten || incoming.message || '';

            setMessages(prev => {
              // Deduplikasi: hindari memasukkan pesan yang sudah ada
              const incomingId = String(incoming.id || incoming.message_id);
              const isDuplicate = prev.some(m => String(m.id) === incomingId || String(m.message_id) === incomingId);
              if (isDuplicate) return prev;

              // Cocokkan dengan pesan optimistic yang sedang berstatus 'sending' jika kontennya sama
              const matchIdx = prev.findIndex(m => m.status === 'sending' && (m.konten === incomingMsgText || m.text === incomingMsgText));
              if (matchIdx !== -1) {
                const nextList = [...prev];
                nextList[matchIdx] = {
                  ...nextList[matchIdx],
                  ...incoming,
                  id: incomingId,
                  konten: incomingMsgText,
                  status: 'sent'
                };
                return nextList;
              }

              // Tambahkan pesan baru secara immutable
              return [...prev, {
                ...incoming,
                id: incomingId,
                konten: incomingMsgText,
                status: 'sent'
              }];
            });

            // Auto-scroll halus ke elemen pesan terbawah
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          } catch (err) {
            console.warn('[Realtime] Parse MessageSent error:', err);
          }
        });

        // Perubahan status / penugasan / prioritas dari pihak lain langsung tampil tanpa reload.
        const patchTicket = (patch: (data: any) => Record<string, any>) => (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            setTicket((prev: any) => prev ? { ...prev, ...patch(data) } : prev);
          } catch (err) {
            console.warn('[Realtime] Parse ticket event error:', err);
          }
        };
        eventSource.addEventListener('StatusChanged', patchTicket(d => ({ status: d.status })) as EventListener);
        eventSource.addEventListener('TicketAssigned', patchTicket(d => ({ assignedTo: d.assignedTo || undefined, assignedStaffName: d.assignedStaffName })) as EventListener);
        eventSource.addEventListener('TicketUpdated', patchTicket(d => ('isPriority' in d ? { isPriority: !!d.isPriority } : {})) as EventListener);

        eventSource.onerror = () => {
          isConnected = false;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Saat sambungan realtime terputus, aktifkan fallback short-polling 5 detik
          startFallbackPolling();

          // Auto-reconnect dengan exponential backoff (1s, 2s, 4s, maks 15s)
          reconnectTimeout = setTimeout(() => {
            retryDelay = Math.min(retryDelay * 2, 15000);
            connectTicketStream();
          }, retryDelay);
        };
      } catch (err) {
        startFallbackPolling();
      }
    };

    if (id && isTicketPath) {
      connectTicketStream();
    } else {
      startFallbackPolling();
    }

    // 2. Lifecycle Clean up: Unsubscribe & tutup koneksi saat komponen unmount untuk mencegah memory leak
    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      stopFallbackPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.pathname, isTicketPath]);


  React.useEffect(() => {
    if (!isTicketPath || user?.role !== 'admin') return;
    fetch('/api/admin/staff')
      .then(res => res.json())
      .then(result => { if (result.success && Array.isArray(result.data)) setStaffOptions(result.data); })
      .catch(() => {});
  }, [isTicketPath, user?.role]);

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
    if (!ticket || isChangingStatus) return;
    setIsChangingStatus(true);
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTicket((prev: any) => {
          if (!prev) return null;
          const claimed = newStatus === 'In Progress' && !prev.assignedTo && user?.role === 'staff';
          return { ...prev, status: newStatus, ...(claimed ? { assignedTo: String(user?.id), assignedStaffName: user?.name } : {}) };
        });
      } else {
        alert(result.message || (language === 'en' ? 'Failed to update status.' : 'Gagal mengubah status.'));
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleAssign = async (staffId: string | null) => {
    if (!ticket || isAssigning) return;
    setIsAssigning(true);
    try {
      const res = await fetch(`/api/tickets/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: staffId })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setTicket((prev: any) => prev ? { ...prev, assignedTo: result.data.assignedTo || undefined, assignedStaffName: result.data.assignedStaffName } : null);
      } else {
        alert(result.message || (language === 'en' ? 'Failed to assign ticket.' : 'Gagal menugaskan tiket.'));
      }
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? 'Connection error.' : 'Terjadi kesalahan koneksi.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleTransferMaintenance = async () => {
    if (!ticket || isEscalated) return;

    try {
      const res = await fetch(`/api/tickets/${id}/escalate`, { method: 'PUT' });

      const result = await res.json();
      if (res.ok && result.success) {
        const escReply = result.data?.reply;
        setMessages((prev: any) => escReply && !prev.some((m: any) => String(m.id) === String(escReply.id)) ? [...prev, escReply] : prev);
        setTicket((prev: any) => prev ? { ...prev, isEscalated: true, isPriority: true, status: 'In Progress' } : null);
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
        body: JSON.stringify({ ticket_id: id, points: rewardPoints })
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
    if (!reply.trim() || !user?.id || !id) return;
    const contentToSend = replyingTo ? `@${replyingTo.name} ${reply}` : reply;
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    // 1. Optimistic UI: Pesan langsung tampil di antarmuka pengirim dengan status 'sending'
    const optimisticMessage = {
      id: tempId,
      tempId,
      ticket_id: id,
      ticketId: id,
      userId: String(user.id),
      sender_id: String(user.id),
      userName: user.name || (userRole === 'staff' ? 'Staff KroomCare' : 'Me'),
      sender_name: user.name || (userRole === 'staff' ? 'Staff KroomCare' : 'Me'),
      userRole: userRole === 'member' ? 'customer' : (user.role || userRole),
      sender_type: (userRole === 'staff' || userRole === 'admin') ? 'staff' : 'user',
      text: contentToSend,
      konten: contentToSend,
      message: contentToSend,
      createdAt: nowIso,
      created_at: nowIso,
      status: 'sending' as const
    };

    setMessages((prev: any) => [...prev, optimisticMessage]);
    setReply('');
    setReplyingTo(null);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);

    try {
      let res;
      if (isTicketPath) {
        res = await fetch(`/api/tickets/${id}/replies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ konten: contentToSend })
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
        // 2. Sukses: Update status pesan menjadi 'sent' dengan ID permanen dari backend
        setMessages((prev: any) => prev.map((m: any) => 
          (m.id === tempId || m.tempId === tempId) ? { ...result.data, status: 'sent' } : m
        ));
        if (isTicketPath) {
          const staffSender = user?.role === 'staff' || user?.role === 'admin';
          // Balasan staff menandai tiket diproses; balasan pelanggan pada tiket selesai membukanya kembali.
          setTicket((prev: any) => {
            if (!prev) return null;
            if (staffSender) return { ...prev, status: 'In Progress', ...(!prev.assignedTo ? { assignedTo: String(user?.id), assignedStaffName: user?.name } : {}) };
            return prev.status === 'Resolved' ? { ...prev, status: 'Open' } : prev;
          });
        }
      } else {
        // Gagal dari respons server: Tandai status 'failed' dengan tombol retry
        setMessages((prev: any) => prev.map((m: any) => 
          (m.id === tempId || m.tempId === tempId) ? { ...m, status: 'failed' } : m
        ));
      }
    } catch (error) {
      console.error('[SendReply] Network/Server Error:', error);
      // Gagal koneksi/timeout: Tandai status 'failed' tanpa menghilangkan pesan
      setMessages((prev: any) => prev.map((m: any) => 
        (m.id === tempId || m.tempId === tempId) ? { ...m, status: 'failed' } : m
      ));
    }
  };

  const handleRetryMessage = async (failedMsg: any) => {
    const targetText = failedMsg.text || failedMsg.konten || failedMsg.message;
    if (!targetText || !user?.id || !id) return;

    // Ubah status kembali menjadi 'sending'
    setMessages((prev: any) => prev.map((m: any) => 
      (m.id === failedMsg.id || m.tempId === failedMsg.id) ? { ...m, status: 'sending' } : m
    ));

    try {
      const res = await fetch(`/api/tickets/${id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konten: targetText })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessages((prev: any) => prev.map((m: any) => 
          (m.id === failedMsg.id || m.tempId === failedMsg.id) ? { ...result.data, status: 'sent' } : m
        ));
      } else {
        setMessages((prev: any) => prev.map((m: any) => 
          (m.id === failedMsg.id || m.tempId === failedMsg.id) ? { ...m, status: 'failed' } : m
        ));
      }
    } catch (err) {
      setMessages((prev: any) => prev.map((m: any) => 
        (m.id === failedMsg.id || m.tempId === failedMsg.id) ? { ...m, status: 'failed' } : m
      ));
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
      {(userRole === 'staff' || userRole === 'admin') && isTicketPath && (
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

            {/* Penanggung jawab tiket: admin memilih staff, staff mengambil tiket yang belum dipegang */}
            {isTicketPath && (
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400">{language === 'en' ? 'Handler' : 'Penanggung jawab'}</span>
                {user?.role === 'admin' ? (
                  <select
                    value={ticket.assignedTo || ''}
                    disabled={isAssigning}
                    onChange={(e) => handleAssign(e.target.value || null)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">{language === 'en' ? 'Unassigned' : 'Belum ditugaskan'}</option>
                    {ticket.assignedTo && !staffOptions.some(s => s.id === String(ticket.assignedTo)) && (
                      <option value={ticket.assignedTo}>{ticket.assignedStaffName || `#${ticket.assignedTo}`}</option>
                    )}
                    {staffOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}{s.role === 'admin' ? ' (Admin)' : ''}</option>
                    ))}
                  </select>
                ) : ticket.assignedTo ? (
                  <span className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">
                    {String(ticket.assignedTo) === String(user?.id) ? (language === 'en' ? 'You' : 'Anda') : (ticket.assignedStaffName || `#${ticket.assignedTo}`)}
                  </span>
                ) : (
                  <button
                    onClick={() => handleAssign(String(user?.id))}
                    disabled={isAssigning}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-wider text-[10px] cursor-pointer"
                  >
                    {language === 'en' ? 'Take ticket' : 'Ambil tiket'}
                  </button>
                )}
              </div>
            )}

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
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className={cn(
                            "text-[10px] font-bold",
                            isRight ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                          )}>
                            {msg.userName}
                          </p>
                          {isStaffOrAdmin && (
                            <span className={cn(
                              "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md",
                              isRight
                                ? "bg-white/20 text-white"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                            )}>
                              {msg.userRole === 'admin' ? 'Admin' : 'Staff'}
                            </span>
                          )}
                        </div>
                        <p className={cn(
                          "text-sm leading-relaxed",
                          isRight ? "text-white" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {msg.text}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          <span className={cn(
                            "text-[9px]",
                            isRight ? "text-blue-100/80" : "text-slate-400"
                          )}>
                            {formatWIBTime(msg.createdAt, locale)}
                          </span>
                          {isRight && msg.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-blue-100/80" title={language === 'en' ? 'Sending...' : 'Mengirim...'}>
                              <Loader2 size={10} className="animate-spin" />
                            </span>
                          )}
                          {isRight && (msg.status === 'sent' || !msg.status) && (
                            <CheckCheck size={11} className={isRight ? "text-blue-200" : "text-slate-400"} />
                          )}
                        </div>
                        {msg.status === 'failed' && (
                          <div className="flex items-center justify-between gap-1.5 mt-1.5 text-[10px] text-red-100 bg-red-900/80 px-2.5 py-1 rounded-lg shadow-sm border border-red-700/60">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle size={11} className="text-red-300 shrink-0" />
                              <span>{language === 'en' ? 'Failed to send' : 'Gagal terkirim'}</span>
                            </div>
                            <button
                              onClick={() => handleRetryMessage(msg)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded font-bold text-white text-[9px] cursor-pointer transition-colors"
                            >
                              <RotateCw size={9} />
                              {language === 'en' ? 'Retry' : 'Coba Lagi'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </React.Fragment>
            );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Pelanggan: tandai selesai atau buka kembali tiketnya sendiri */}
      {isTicketPath && isPrivate && !isViewerStaff && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ticket.status === 'Resolved'
              ? (language === 'en' ? 'This ticket is resolved. Reply below or reopen it if the problem persists.' : 'Tiket ini sudah selesai. Balas di bawah atau buka kembali bila masalah belum tuntas.')
              : (ticket.assignedStaffName
                ? (language === 'en' ? `Handled by ${ticket.assignedStaffName}.` : `Ditangani oleh ${ticket.assignedStaffName}.`)
                : (language === 'en' ? 'Waiting for a staff member to pick up this ticket.' : 'Menunggu staff mengambil tiket ini.'))}
          </p>
          <button
            onClick={() => handleStatusChange(ticket.status === 'Resolved' ? 'Open' : 'Resolved')}
            disabled={isChangingStatus}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50",
              ticket.status === 'Resolved'
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            )}
          >
            {ticket.status === 'Resolved'
              ? (language === 'en' ? 'Reopen ticket' : 'Buka kembali')
              : (language === 'en' ? 'Mark as resolved' : 'Tandai selesai')}
          </button>
        </div>
      )}

      {/* Reply Container — tetap tersedia pada tiket selesai; balasan pelanggan membuka kembali tiket */}
      {(

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
