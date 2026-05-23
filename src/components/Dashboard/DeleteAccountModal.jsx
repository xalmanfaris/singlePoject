import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, userEmail }) => {
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    await onConfirm(reason);
    setIsDeleting(false);
  };

  const reasons = [
    "I'm not using it anymore",
    "Privacy concerns",
    "Found a better alternative",
    "Technical issues",
    "Other"
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass border-[var(--glass-border)] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900/40 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-rose-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Delete Account</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60">Action is permanent</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all opacity-40 hover:opacity-100"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
              <AlertTriangle className="text-rose-500 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-[13px] font-medium text-slate-600 dark:text-rose-200/60 leading-relaxed">
                Deleting your account will permanently remove all your data and saved preferences.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-slate-900 dark:text-white">Why are you leaving?</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {reasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`text-left px-4 py-2.5 rounded-xl border transition-all text-xs font-bold ${
                        reason === r 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-500' 
                        : 'bg-black/5 dark:bg-white/5 border-[var(--glass-border)] hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-white opacity-60'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-1 text-slate-900 dark:text-white">
                  Type <span className="text-rose-500 font-black">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] rounded-xl py-3 px-4 focus:outline-none focus:border-rose-500/50 transition-all font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white placeholder:opacity-20"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--glass-border)] flex flex-col gap-2">
            <button 
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || isDeleting}
              className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                confirmText === 'DELETE' && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white opacity-30 cursor-not-allowed'
              }`}
            >
              {isDeleting ? 'Deleting...' : 'Delete My Account'}
              {!isDeleting && <Trash2 size={14} />}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-white transition-all font-black text-[10px] uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteAccountModal;
