import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  History, 
  Heart, 
  MapPin, 
  LogOut, 
  Sun, 
  Moon, 
  Globe,
  Compass,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const MenuItem = ({ icon: Icon, label, onClick, secondary, danger }) => (
  <motion.div
    whileHover={{ x: 4, backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-colors group ${
      danger ? 'text-rose-500 hover:bg-rose-500/10' : 'text-[var(--text-main)] hover:text-indigo-500'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${danger ? 'bg-rose-500/10' : 'bg-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-500'} transition-colors`}>
        <Icon size={16} />
      </div>
      <span className={`text-sm font-semibold tracking-tight ${danger ? '' : 'opacity-80 group-hover:opacity-100'}`}>{label}</span>
    </div>
    {secondary && <ChevronRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
  </motion.div>
);

const ProfileDropdown = ({ isOpen, onClose, userData, theme, toggleTheme, onProfileClick, onLogout }) => {
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      filter: 'blur(10px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        type: 'spring', 
        damping: 20, 
        stiffness: 300 
      }
    },
    exit: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95,
      filter: 'blur(10px)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-x-0 top-[88px] bottom-0 z-40 lg:hidden bg-black/40" 
            onClick={onClose} 
          />
          
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`
              fixed lg:absolute 
              inset-x-4 top-20 lg:top-full lg:right-0 lg:left-auto lg:mt-4 
              w-auto md:w-[360px] lg:w-[320px] 
              max-h-[80vh] lg:max-h-none overflow-y-auto custom-scrollbar
              ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'} 
              backdrop-blur-3xl border border-[var(--glass-border)] 
              rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] 
              z-[100]
            `}
          >
            {/* Mobile Pull Handle - Visual only */}
            <div className="w-12 h-1.5 bg-[var(--text-main)]/10 rounded-full mx-auto mt-3 lg:hidden" />

            {/* User Info Section */}
            <div className="p-6 flex items-center gap-4 bg-gradient-to-b from-indigo-500/5 to-transparent relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/20 p-0.5 shadow-xl shadow-indigo-500/5">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-white/5">
                    {userData?.profileImageUrl ? (
                      <img src={userData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                        <User className="text-indigo-500" size={28} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-[var(--bg-main)] shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="relative z-10">
                <h4 className="font-black text-xl tracking-tighter leading-tight bg-gradient-to-r from-[var(--text-main)] to-[var(--text-main)]/60 bg-clip-text text-transparent">
                  {userData?.fullName || ''}
                </h4>
                <p className="text-xs text-muted font-black uppercase tracking-widest opacity-40 mb-1.5">{userData?.email || ''}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                    {userData?.travelType || ''}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Active Now</span>
                </div>
              </div>
            </div>

            <div className="px-2 pb-2 mt-2">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--glass-border)] to-transparent mx-4 mb-4" />

              {/* Main Menu */}
              <div className="space-y-0.5">
                <MenuItem icon={User} label="My Profile" onClick={onProfileClick} secondary />
                <MenuItem icon={Compass} label="Travel Preferences" onClick={onProfileClick} secondary />
                <MenuItem icon={Bell} label="Notifications" secondary />
                <MenuItem icon={Shield} label="Security" secondary />
              </div>

              <div className="h-px bg-[var(--glass-border)] mx-4 my-3" />

              {/* Secondary Options */}
              <div className="space-y-0.5">
                <MenuItem icon={History} label="Travel History" />
                <MenuItem icon={Heart} label="Saved Trips" />
                <MenuItem icon={MapPin} label="Saved Locations" />
              </div>

              <div className="h-px bg-[var(--glass-border)] mx-4 my-3" />

              {/* UI Settings */}
              <div className="flex items-center justify-between px-4 py-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Appearance</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="w-12 h-6 rounded-full bg-white/5 border border-white/10 relative p-1 transition-colors hover:border-indigo-500/30"
                >
                  <motion.div 
                    animate={{ x: theme === 'dark' ? 24 : 0 }}
                    className="w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40"
                  />
                </button>
              </div>

              {/* Logout Section */}
              <div className="mt-2 pt-2 border-t border-[var(--glass-border)]">
                <MenuItem 
                  icon={LogOut} 
                  label="Log Out" 
                  danger 
                  onClick={() => {
                    onClose();
                    onLogout();
                  }} 
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;
