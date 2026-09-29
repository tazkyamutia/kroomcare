import React from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { QUICK_REPLIES } from '../utils/dummyData';
import { cn } from '../lib/utils';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya asisten AI KroomCare. Ada yang bisa saya bantu terkait layanan hosting atau kendala teknis Anda?' }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input.trim();
    if (!messageToSend || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: messageToSend,
        config: {
          systemInstruction: "Anda adalah asisten dukungan pelanggan KroomCare. Jawab dengan singkat, tepat, dan ramah."
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Maaf, saya mengalami kendala teknis.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Maaf, sistem AI sedang sibuk.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="w-[calc(100vw-32px)] sm:w-[380px] h-[480px] rounded-2xl flex flex-col overflow-hidden shadow-xl mb-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
          >
            {/* Header */}
            <div className="bg-blue-600 p-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs leading-none">KroomCare AI</h3>
                  <span className="text-[10px] text-blue-100 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online Support
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors">
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/60 dark:bg-slate-950/40">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  )}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-2.5 rounded-xl text-xs shadow-xs",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-700"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl rounded-tl-none border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">AI sedang mengetik...</span>
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {!isLoading && messages.length < 4 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(reply)}
                      className="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                    >
                      <Sparkles size={10} className="text-amber-500" />
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanyakan sesuatu..."
                  className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-200",
          isOpen ? "bg-slate-800 text-white" : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
        )}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>
    </div>
  );
};
