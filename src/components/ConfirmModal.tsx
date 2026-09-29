import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mb-2",
              isDestructive ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 mt-2">{message}</p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors shadow-sm",
                isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-brand-600 hover:bg-brand-700"
              )}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
