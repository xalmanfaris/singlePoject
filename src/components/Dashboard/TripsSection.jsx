import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Map as MapIcon, Package } from 'lucide-react';

export const TripCard = ({ city, date, status, image }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="glass rounded-[2.5rem] overflow-hidden border-white/5 group cursor-pointer"
  >
    <div className="h-48 relative overflow-hidden">
      <img src={image} alt={city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-6">
        <h4 className="text-xl font-bold text-white tracking-tight">{city}</h4>
        <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
          <Calendar size={12} />
          <span>{date}</span>
        </div>
      </div>
      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{status}</span>
      </div>
    </div>
    <div className="p-6 flex justify-between items-center bg-[var(--text-main)]/[0.02]">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold opacity-60">Live Tracking</span>
      </div>
      <motion.button 
        whileHover={{ x: 3 }}
        className="text-xs font-bold text-indigo-400 flex items-center gap-1"
      >
        View Itinerary <MapPin size={12} />
      </motion.button>
    </div>
  </motion.div>
);

export const ItemTracker = () => {
  const items = [];

  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/5 h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold tracking-tight">Item Tracker</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-[var(--text-main)]/[0.05] hover:bg-[var(--text-main)]/[0.1] transition-all border border-[var(--glass-border)]"
        >
          Manage Items
        </motion.button>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--text-main)]/[0.05] border border-[var(--glass-border)] hover:border-[var(--text-main)]/[0.1] transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl glass border border-[var(--glass-border)] group-hover:bg-[var(--text-main)]/[0.1] transition-all">
                <item.icon size={20} className={item.color} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">{item.name}</p>
                <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ rotate: 15 }}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <MapIcon size={16} className="opacity-40" />
            </motion.button>
          </div>
        )) : (
          <div className="py-12 glass rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center opacity-20">
            <Package size={32} className="mb-2" />
            <p className="text-xs font-bold text-center">No items registered for tracking</p>
          </div>
        )}
      </div>
    </div>
  );
};
