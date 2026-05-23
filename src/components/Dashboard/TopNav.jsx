import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, ChevronDown, Sun, Moon, Menu, Command, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDropdown from './ProfileDropdown';

const TopNav = ({ theme, toggleTheme, setMobileOpen, userData, setActiveTab, onLogout, collapsed, isProfileOpen, setIsProfileOpen, unreadCount, onNotificationClick }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setActiveTab('profile');
    setIsProfileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full px-4 md:px-8 py-4 bg-transparent">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-[1600px] mx-auto flex items-center justify-between px-6 py-3 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl shadow-2xl shadow-black/5 relative"
      >
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-2xl glass hover:bg-white/10 transition-all lg:hidden flex items-center justify-center border border-white/5"
          >
            <Menu size={20} className="opacity-70" />
          </button>

          <motion.div
            animate={{
              width: isSearchFocused ? '450px' : '320px',
              borderColor: isSearchFocused
                ? 'rgba(99, 102, 241, 0.5)'
                : (theme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)')
            }}
            className="relative hidden md:flex items-center group"
          >
            <Search
              className={`absolute left-4 transition-all duration-300 ${isSearchFocused ? 'text-indigo-500 opacity-100' : 'opacity-40'}`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search adventures, flights..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full bg-white/5 border-inherit rounded-[1.25rem] py-2.5 pl-12 pr-6 focus:outline-none focus:bg-white/10 transition-all placeholder:opacity-30 text-sm font-medium border"
            />
          </motion.div>
        </div>

        {/* Dynamic Center Brand Name */}
        <AnimatePresence mode="wait">
          {collapsed && (
            <motion.div 
              layoutId="main-logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2 hidden md:block"
            >
              <span className="text-2xl font-black italic text-logo">YuGo</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl glass border border-white/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: 20, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -20, opacity: 0, rotate: 45 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              >
                {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative w-10 h-10 rounded-2xl glass border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group"
          >
            <Bell size={18} className="opacity-70 group-hover:opacity-100 group-hover:text-indigo-400 transition-all" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-[var(--bg-main)] flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </motion.button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-4 ml-2 border-l border-white/10 cursor-pointer group"
            >
              <div className="text-right hidden xl:block">
                <p className="text-sm font-black tracking-tight leading-none mb-1 group-hover:text-indigo-500 transition-colors">
                  {userData?.fullName || ''}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.15em]">{userData?.travelType || ''}</p>
                </div>
              </div>

              <div className="relative">
                <div className="w-11 h-11 rounded-2xl glass flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all overflow-hidden p-0.5">
                  <div className="w-full h-full rounded-[0.85rem] overflow-hidden bg-white/5">
                    {userData?.profileImageUrl ? (
                      <img src={userData.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                        <User size={20} className="opacity-40" />
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-lg flex items-center justify-center border-2 border-[var(--bg-main)] shadow-lg lg:hidden"
                  animate={{ rotate: isProfileOpen ? 180 : 0 }}
                >
                  <ChevronDown size={10} className="text-white" />
                </motion.div>
              </div>
              <ChevronDown
                size={14}
                className={`opacity-20 group-hover:opacity-100 group-hover:text-indigo-500 transition-all hidden xl:block ${isProfileOpen ? 'rotate-180 opacity-100 text-indigo-500' : ''}`}
              />
            </div>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              userData={userData}
              theme={theme}
              toggleTheme={toggleTheme}
              onProfileClick={handleProfileClick}
              onLogout={onLogout}
            />
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default TopNav;
