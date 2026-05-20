import React from 'react';
import { MessageSquare, User, ShieldCheck, ArrowLeft, Send, AlertTriangle, Coins, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { DUMMY_TICKETS, DUMMY_FORUM_MESSAGES } from '../../utils/dummyData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { UserRole, Ticket, ForumMessage } from '../../types';

interface ForumThreadProps {
  userRole: UserRole;
}

export const ForumThreadPage: React.FC<ForumThreadProps> = ({ userRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<{ id: string, name: string } | null>(null);
  
  // Local state to simulate ticket updates
  const [ticket, setTicket] = React.useState<Ticket | undefined>(
    DUMMY_TICKETS.find(t => t.id === id)
  );
  
  const [messages, setMessages] = React.useState(
    DUMMY_FORUM_MESSAGES.filter(m => m.ticketId === id)
  );

  const [isGivingReward, setIsGivingReward] = React.useState(false);

  if (!ticket) return <div className="p-12 text-center font-bold text-slate-500">Thread tidak ditemukan</div>;

  const handleSetPriority = () => {
    setTicket(prev => prev ? { ...prev, isPriority: !prev.isPriority } : undefined);
  };

  const handleStatusChange = (newStatus: Ticket['status']) => {
    setTicket(prev => prev ? { ...prev, status: newStatus } : undefined);
  };

  const handleGiveReward = () => {
    setIsGivingReward(true);
    setTimeout(() => {
      setTicket(prev => prev ? { ...prev, rewardGiven: true } : undefined);
      setIsGivingReward(false);
      alert(`+50 Poin telah diberikan kepada ${ticket.customerName}!`);
    }, 1000);
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;
    
    const newMessage: ForumMessage = {
      id: `MSG-${Date.now()}`,
      ticketId: ticket.id,
      userId: userRole === 'staff' ? 'U2' : (userRole === 'admin' ? 'U3' : 'U1'), // Simplified for demo
      userName: userRole === 'staff' ? 'Sarah Staff' : (userRole === 'admin' ? 'Alex Admin' : 'John Customer'),
      userRole: userRole,
      text: replyingTo ? `@${replyingTo.name} ${reply}` : reply,
      createdAt: new Date().toISOString(),
      parentMessageId: replyingTo?.id
    };
    
    setMessages(prev => [...prev, newMessage]);
    setReply('');
    setReplyingTo(null);
  };

  const isPrivate = ticket.isPrivate;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Staff Priority Bar */}
      {userRole === 'staff' && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "p-3 rounded-2xl flex items-center justify-between shadow-lg transition-all",
            ticket.isPriority ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-600"
          )}
        >
          <div className="flex items-center gap-3 px-3">
            <AlertTriangle size={20} className={ticket.isPriority ? "animate-pulse" : ""} />
            <span className="text-sm font-black uppercase tracking-widest">
              {ticket.isPriority ? 'Mendesak: Prioritas Aktif' : 'Tandai sebagai Prioritas?'}
            </span>
          </div>
          <button 
            onClick={handleSetPriority}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95",
              ticket.isPriority ? "bg-white text-orange-600" : "bg-orange-500 text-white"
            )}
          >
            {ticket.isPriority ? 'Batalkan Prioritas' : 'Set as Priority'}
          </button>
        </motion.div>
      )}

      {/* Main Header */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                {ticket.id}
              </span>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase",
                isPrivate ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"
              )}>
                {isPrivate ? 'Tiket Privat' : 'Forum Publik'}
              </span>
              {ticket.isPriority && (
                <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-md font-black uppercase animate-pulse">
                  Priority
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">{ticket.subject}</h1>
          </div>
        </div>

        {userRole === 'staff' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {[
                { val: 'Open', label: 'Tiket Baru', color: 'blue' },
                { val: 'In Progress', label: 'Proses', color: 'amber' },
                { val: 'Resolved', label: 'Selesai', color: 'emerald' }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => handleStatusChange(s.val as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    ticket.status === s.val 
                      ? `bg-white text-${s.color}-600 shadow-sm font-black` 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {!ticket.rewardGiven ? (
              <button 
                onClick={handleGiveReward}
                disabled={isGivingReward}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Coins size={16} fill="currentColor" />
                {isGivingReward ? 'Memberi...' : 'Beri Reward Poin'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={16} />
                Reward Terkirim
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discussion Area */}
      <div className={cn(
        "space-y-6",
        isPrivate ? "bg-slate-100/50 p-6 rounded-[3rem] border border-slate-200 shadow-inner" : ""
      )}>
        {/* Original Post */}
        {!isPrivate && (
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex gap-4 md:gap-6">
              <div className="w-14 h-14 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 border border-brand-100">
                <User size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{ticket.customerName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Author • Customer</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{new Date(ticket.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg">{ticket.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Private Ticket Header (Email/Chat style) */}
        {isPrivate && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <ShieldCheck size={14} className="text-blue-500" />
              Sesi Chat Privat antara {ticket.customerName} & Staff
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Tiket dibuat pada {new Date(ticket.createdAt).toLocaleString('id-ID')}</p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence>
            {/* Show description as first message in private chat mode */}
            {isPrivate && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start"
              >
                <div className="max-w-[80%] bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                  <p className="text-sm font-bold text-blue-600 mb-1">{ticket.customerName}</p>
                  <p className="text-slate-700 leading-relaxed">{ticket.description}</p>
                  <span className="text-[9px] text-slate-400 block mt-2 text-right">
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, x: isPrivate ? (msg.userRole === 'staff' ? 20 : -20) : -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={msg.id} 
                className={cn(
                  "flex flex-col",
                  isPrivate 
                    ? (msg.userRole === 'staff' ? "items-end" : "items-start") 
                    : "items-stretch"
                )}
              >
                <div className={cn(
                  "relative group transition-all",
                  isPrivate 
                    ? cn(
                        "max-w-[80%] p-4 rounded-2xl shadow-sm",
                        msg.userRole === 'staff' 
                          ? "bg-slate-900 text-white rounded-tr-none" 
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                      )
                    : cn(
                        "p-6 md:p-8 rounded-[2.5rem] border shadow-sm",
                        msg.userRole === 'staff' 
                          ? "bg-slate-900 border-slate-800 ml-8 md:ml-12" 
                          : "bg-white border-slate-200"
                      )
                )}>
                  {!isPrivate && (
                    <div className="flex gap-4 md:gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 border",
                        msg.userRole === 'staff' 
                          ? "bg-brand-600 border-brand-500 text-white" 
                          : "bg-slate-50 border-slate-100 text-slate-600"
                      )}>
                        {msg.userRole === 'staff' ? <ShieldCheck size={28} /> : <User size={28} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h4 className={cn(
                              "text-base font-bold",
                              msg.userRole === 'staff' ? "text-white" : "text-slate-900"
                            )}>
                              {msg.userName}
                            </h4>
                            {msg.userRole === 'staff' && (
                              <span className="text-[10px] px-2 py-0.5 bg-brand-600 text-white rounded-md font-black uppercase tracking-tighter shadow-lg shadow-brand-500/20">Official Staff</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <p className={cn(
                          "leading-relaxed text-lg",
                          msg.userRole === 'staff' ? "text-slate-200" : "text-slate-600"
                        )}>
                          {msg.text}
                        </p>
                        
                        {/* Reply Action for Forum */}
                        <div className="mt-4 pt-4 border-t border-slate-100/10 flex justify-end">
                           <button 
                            onClick={() => setReplyingTo({ id: msg.id, name: msg.userName })}
                            className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-400 transition-colors flex items-center gap-1.5"
                          >
                            <Send size={12} className="-rotate-45" />
                            Balas
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPrivate && (
                    <>
                      <p className={cn(
                        "text-[10px] font-bold mb-1",
                        msg.userRole === 'staff' ? "text-blue-400" : "text-blue-600"
                      )}>
                        {msg.userName}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <span className={cn(
                        "text-[9px] block mt-2 text-right",
                        msg.userRole === 'staff' ? "text-slate-500" : "text-slate-400"
                      )}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Reply Container */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-slate-50/80 backdrop-blur-md rounded-t-[3rem] border-t border-slate-200 z-30 -mx-4 md:mx-0">
        <div className="max-w-4xl mx-auto">
          {replyingTo && (
            <div className="px-6 py-3 bg-indigo-50 border-x border-t border-indigo-100 rounded-t-2xl flex items-center justify-between mb-0">
               <p className="text-xs text-indigo-600 font-bold">
                Membalas ke <span className="text-indigo-800">@{replyingTo.name}</span>
               </p>
               <button onClick={() => setReplyingTo(null)} className="text-indigo-400 hover:text-indigo-600">
                <MoreHorizontal size={16} />
               </button>
            </div>
          )}
          <div className={cn(
            "bg-white rounded-3xl border border-slate-200 shadow-xl p-2 flex items-end gap-2",
            replyingTo && "rounded-t-none"
          )}>
            <textarea 
              rows={replyingTo || isPrivate ? 1 : 2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={isPrivate ? "Ketik pesan untuk staff..." : "Tambahkan komentar di diskusi ini..."}
              className="flex-1 px-4 py-3 bg-transparent focus:outline-none resize-none text-slate-700 text-sm"
            />
            <button 
              onClick={handleSendReply}
              disabled={!reply.trim()}
              className="p-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
            >
              <Send size={20} className={isPrivate ? "" : "-rotate-45"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

