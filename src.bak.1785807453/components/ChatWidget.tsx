import React from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Sparkles } from 'lucide-react';
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
          systemInstruction: "Anda adalah asisten dukungan pelanggan KroomCare. Jawab dengan singkat dan ramah."
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
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-card w-[350px] sm:w-[400px] h-[500px] rounded-2xl flex flex-col overflow-hidden shadow-2xl mb-4"
          >
            {/* Header */}
            <div className="bg-brand-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-medium leading-none">KroomCare AI</h3>
                  <span className="text-[10px] text-brand-100 flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Online Support
                  </span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-md transition-colors">
                <Minimize2 size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-brand-100 text-brand-700" : "bg-white text-slate-600 border border-slate-200"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-brand-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">AI is typing...</span>
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {!isLoading && messages.length < 4 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {QUICK_REPLIES.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(reply)}
                      className="text-[10px] px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center gap-1"
                    >
                      <Sparkles size={10} className="text-amber-500" />
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Tanyakan sesuatu..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
          isOpen ? "bg-slate-800 text-white rotate-90" : "bg-brand-600 text-white hover:scale-110"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};
