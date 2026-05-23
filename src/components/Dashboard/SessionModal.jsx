import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Monitor, 
  MapPin, 
  Globe, 
  Clock, 
  ShieldCheck,
  ChevronRight,
  Cpu,
  Server,
  Smartphone,
  Laptop
} from 'lucide-react';

const SessionModal = ({ isOpen, onClose, activeSessions = [], onLogoutSession }) => {
  // Handle browser back button to close modal
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ modal: 'sessions' }, '', window.location.pathname);
      
      const handlePopState = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state && window.history.state.modal === 'sessions') {
          window.history.back();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) return Smartphone;
    if (ua.includes('macintosh') || ua.includes('windows')) return Laptop;
    return Monitor;
  };

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
          className="relative w-full max-w-2xl glass border-[var(--glass-border)] rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900/40 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-[var(--glass-border)] relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Active Sessions</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{activeSessions.length} Devices Connected</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-all opacity-40 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
            <div className="space-y-4">
              {activeSessions.length === 0 ? (
                <div className="text-center py-12 opacity-40 font-bold">No active sessions found.</div>
              ) : (
                activeSessions.map((session, idx) => {
                  const DeviceIcon = getDeviceIcon(session.device);
                  return (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-6 rounded-[2.5rem] border transition-all ${idx === 0 ? 'bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-white/5 border-[var(--glass-border)] hover:bg-white/10'}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className={`p-5 rounded-2xl ${idx === 0 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-400'} flex-shrink-0`}>
                          <DeviceIcon size={28} />
                        </div>
                        
                        <div className="flex-grow space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black tracking-tight opacity-90 line-clamp-1 pr-4">
                              {session.device || 'Unknown Device'}
                            </h3>
                            {idx === 0 && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Current</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-rose-500 opacity-60" />
                              <span className="text-xs font-bold opacity-60">{session.location || 'Unknown Location'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-indigo-400 opacity-60" />
                              <span className="text-xs font-bold opacity-60">{session.ipAddress || '0.0.0.0'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-amber-500 opacity-60" />
                              <span className="text-xs font-bold opacity-60">{formatDate(session.loginAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                           {idx === 0 ? (
                             <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-40 px-4 py-2">
                               Active
                             </div>
                           ) : (
                             <button 
                               onClick={() => onLogoutSession?.(session.id)}
                               className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors px-4 py-2 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 active:scale-95"
                             >
                               Logout
                             </button>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-[var(--glass-border)] flex-shrink-0">
             <button 
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 transition-all font-black text-xs uppercase tracking-widest"
            >
              Done Viewing Sessions
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SessionModal;
