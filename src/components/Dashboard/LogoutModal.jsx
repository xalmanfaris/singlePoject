import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass rounded-[2.5rem] border border-[var(--glass-border)] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] -mr-16 -mt-16" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl glass hover:bg-white/10 transition-all opacity-40 hover:opacity-100"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
                <AlertTriangle size={32} className="text-rose-500" />
              </div>

              <h2 className="text-2xl font-black tracking-tight mb-2">Wait! Leaving already?</h2>
              <p className="text-sm opacity-60 font-medium mb-10 max-w-[280px]">
                Are you sure you want to log out? Your current travel session will be saved.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={onClose}
                  className="py-4 rounded-2xl glass border border-[var(--glass-border)] font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-500/20"
                >
                  <LogOut size={18} />
                  Yes, Logout
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
