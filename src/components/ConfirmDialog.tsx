'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-panel rounded-3xl max-w-sm w-full p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${
              confirmVariant === 'danger' ? 'bg-rose-500' : confirmVariant === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl border ${
                  confirmVariant === 'danger' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' : 
                  confirmVariant === 'warning' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' : 
                  'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {confirmVariant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <button
                  onClick={onCancel}
                  className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {message}
              </p>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-950 transition-all active:scale-95 shadow-lg ${
                    confirmVariant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 
                    confirmVariant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 
                    'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
