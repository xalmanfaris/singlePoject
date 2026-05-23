import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Briefcase,
  CheckSquare,
  Package,
  Map as MapIcon,
  Settings,
  ChevronLeft,
  LogOut,
  X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <motion.div
    whileHover={{ x: collapsed ? 0 : 5, scale: collapsed ? 1.1 : 1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center rounded-2xl cursor-pointer transition-all duration-300 ${collapsed ? 'justify-center w-12 h-12 mx-auto px-0' : 'px-4 py-3 gap-4 w-full'
      } ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
        : 'hover:bg-white/5 opacity-60 hover:opacity-100'
      }`}
  >
    <Icon size={collapsed ? 18 : 17} />
    {!collapsed && <span className="font-medium tracking-tight whitespace-nowrap">{label}</span>}
  </motion.div>
);

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: activeTab === 'dashboard',
      onClick: () => {
        setActiveTab('dashboard');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    { 
      icon: MapPin, 
      label: 'Plan Trip',
      active: activeTab === 'plan-trip',
      onClick: () => {
        setActiveTab('plan-trip');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    { 
      icon: Briefcase, 
      label: 'My Trips',
      active: activeTab === 'my-trips',
      onClick: () => {
        setActiveTab('my-trips');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    { 
      icon: CheckSquare, 
      label: 'Checklist',
      active: activeTab === 'checklist',
      onClick: () => {
        setActiveTab('checklist');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    { 
      icon: Package, 
      label: 'Item Tracker',
      active: activeTab === 'item-tracker',
      onClick: () => {
        setActiveTab('item-tracker');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    { 
      icon: MapIcon, 
      label: 'Explore Map',
      active: activeTab === 'map',
      onClick: () => {
        setActiveTab('map');
        if (mobileOpen) setMobileOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      active: activeTab === 'profile',
      onClick: () => {
        setActiveTab('profile');
        if (mobileOpen) setMobileOpen(false);
      }
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '80px' : '260px',
          x: mobileOpen ? 0 : (window.innerWidth < 1024 ? -260 : 0)
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
        className={`fixed lg:sticky top-0 left-0 h-screen z-[70] border-r border-[var(--glass-border)] flex flex-col p-4 bg-[var(--glass-bg)] backdrop-blur-3xl transition-colors duration-300 ${mobileOpen ? 'w-[260px] shadow-2xl' : ''
          }`}
      >
        <div className="flex items-center justify-between mb-10 px-2">
          {(!collapsed || mobileOpen) && (
            <motion.span
              layoutId="main-logo"
              className="text-2xl font-black italic text-logo"
            >
              YuGo
            </motion.span>
          )}
          <button
            onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all ml-auto lg:flex hidden"
          >
            <ChevronLeft className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl glass hover:bg-white/10 transition-all ml-auto lg:hidden flex"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-grow overflow-y-auto custom-scrollbar pr-2">
          {menuItems.map((item, idx) => (
            <SidebarItem
              key={idx}
              {...item}
              collapsed={collapsed && !mobileOpen}
            />
          ))}
        </div>

        <div className="pt-4 border-t border-[var(--glass-border)] mt-auto">
          <SidebarItem
            icon={LogOut}
            label="Logout"
            collapsed={collapsed && !mobileOpen}
            onClick={onLogout}
          />
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
