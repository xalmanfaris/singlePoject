import React from 'react';
import { motion } from 'framer-motion';
import dashboardImg from '../assets/dashboard_3d.png';
import { Sparkles, MapPin, ShieldCheck, Zap } from 'lucide-react';

const Preview = () => {
  return (
    <section id="preview" className="py-24 md:py-32 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto text-center mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border mb-6"
        >
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Immersive Experience</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-7xl font-black mb-6 tracking-tighter"
        >
          Your Journey, <span className="text-gradient">Visualized</span>
        </motion.h2>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Experience a beautiful, 3D-integrated ecosystem that simplifies every aspect of your travel.
        </p>
      </div>

      <div className="relative perspective-2000 flex justify-center py-10">
        <motion.div
          initial={{ rotateX: 25, rotateY: -15, scale: 0.8, opacity: 0 }}
          whileInView={{ rotateX: 15, rotateY: -10, scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative w-full max-w-5xl preserve-3d group"
        >
         
          <div className="relative glass-dark rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 group-hover:shadow-[0_80px_150px_-30px_rgba(99,102,241,0.3)]">
            <img 
              src={dashboardImg} 
              alt="YuGo 3D Dashboard" 
              className="w-full h-auto object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10 pointer-events-none" />
          </div>

          
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-4 md:-left-20 glass p-4 md:p-6 rounded-3xl border shadow-2xl [transform:translateZ(100px)] z-20 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">AI Assistant</p>
              <p className="text-xs md:text-sm font-bold text-main">Route optimized...</p>
            </div>
          </motion.div>

         
          <motion.div 
            animate={{ y: [0, 25, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/2 -right-4 md:-right-24 glass p-4 md:p-6 rounded-3xl border shadow-2xl [transform:translateZ(150px)] z-20 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30">
              <MapPin className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Live Tracking</p>
              <p className="text-xs md:text-sm font-bold text-main">Safe in Zurich</p>
            </div>
          </motion.div>

        
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-10 left-10 md:left-1/4 glass p-4 md:p-6 rounded-3xl border shadow-2xl [transform:translateZ(80px)] z-20 flex items-center gap-4 hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Smart Shield</p>
              <p className="text-xs md:text-sm font-bold text-main">All items secured</p>
            </div>
          </motion.div>

         
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-indigo-600/5 blur-[180px] -z-10 rounded-full animate-pulse" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 blur-[120px] -z-10 rounded-full" />
        </motion.div>
      </div>

      <div className="mt-20 flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {[
            { label: "Active Users", val: "50k+" },
            { label: "Countries", val: "120+" },
            { label: "Smart Tags", val: "1M+" },
            { label: "AI Routes", val: "5M+" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-black text-main mb-1">{stat.val}</p>
              <p className="text-[10px] uppercase tracking-widest font-black text-main opacity-40">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Preview;
