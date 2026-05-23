import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, ClipboardCheck, Search, Bell, Wallet, Target, Map as MapIcon } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />,
    title: "AI Travel Planner",
    description: "Personalized itineraries based on your interests, budget, and travel style."
  },
  {
    icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-violet-500" />,
    title: "Transport Optimization",
    description: "Best routes via train, bus, flight, or car with real-time cost comparison."
  },
  {
    icon: <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />,
    title: "Smart Budget Planner",
    description: "Total trip cost breakdown of travel, stay, and activities to keep you on track."
  },
  {
    icon: <ClipboardCheck className="w-5 h-5 md:w-6 md:h-6 text-sky-500" />,
    title: "Auto Smart Checklist",
    description: "Packing lists generated from your destination, weather, and travel type."
  },
  {
    icon: <Search className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />,
    title: "Lost Item Tracker",
    description: "Upload and track critical belongings like passports and bags with ease."
  },
  {
    icon: <Target className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />,
    title: "AI Prediction System",
    description: "Suggests where items may be lost based on behavior and usage patterns."
  },
  {
    icon: <Bell className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />,
    title: "Smart Alerts",
    description: "Passive reminders for forgotten chargers or undetected passport items."
  },
  {
    icon: <MapIcon className="w-5 h-5 md:w-6 md:h-6 text-indigo-500" />,
    title: "Map Integration",
    description: "Visual navigation for travel routes and last known item locations."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 px-4 md:px-6 relative overflow-hidden grain transition-colors duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full glass border text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-500 mb-6 md:mb-8"
          >
            Capabilities
          </motion.div>
          <h2 className="font-black mb-6 md:mb-8 tracking-tighter">Everything You Need <br /><span className="text-gradient">In One Single Platform</span></h2>
          <p className="opacity-60 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed transition-opacity duration-500">Planning, execution, and safety. We combine advanced AI with practical tracking to simplify every single journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              className="glass p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border hover:border-indigo-500/40 transition-all duration-300 group flex flex-col h-full shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-300 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 tracking-tight">{feature.title}</h3>
              <p className="opacity-60 text-sm md:text-base leading-relaxed font-medium flex-grow transition-opacity duration-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
