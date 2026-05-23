import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CloudRain, Zap } from 'lucide-react';
import { react } from "@"
export const StatCard = ({ label, value, icon: Icon, trend, colorClass }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-[2rem] border-[var(--glass-border)] relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 -mr-10 -mt-10 ${colorClass}`} />
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-2xl bg-[var(--text-main)]/[0.05] border border-[var(--glass-border)] group-hover:border-[var(--text-main)]/[0.1] transition-all">
        <Icon size={24} className="opacity-70" />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-sm font-medium opacity-40 uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-3xl font-black tracking-tight">{value}</p>
  </motion.div>
);

export const AiAssistant = () => {
  const insights = [];

  return (
    <div className="col-span-full lg:col-span-2 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-indigo-400" />
        <h2 className="text-xl font-bold tracking-tight">AI Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.length > 0 ? insights.map((insight, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-4 rounded-2xl border-[var(--glass-border)] flex gap-4 items-center group cursor-pointer hover:bg-[var(--text-main)]/[0.05] transition-all"
          >
            <div className="p-2 rounded-xl bg-[var(--text-main)]/[0.05] border border-[var(--glass-border)] group-hover:scale-110 transition-transform">
              <insight.icon size={18} className="opacity-70" />
            </div>
            <p className="text-sm font-medium opacity-80 leading-snug">{insight.text}</p>
          </motion.div>
        )) : (
          <div className="col-span-full py-8 glass rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center opacity-20">
            <Sparkles size={24} className="mb-2" />
            <p className="text-xs font-bold">Your AI assistant is analyzing your data...</p>
          </div>
        )}
      </div>
    </div>
  );
};
