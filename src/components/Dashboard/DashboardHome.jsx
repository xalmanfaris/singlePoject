import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, Wallet, Map as MapIcon, CheckCircle2, Plus, 
  Compass, Clock, TrendingUp, ArrowRight, MapPin, 
  Cloud, Sun, Navigation, Zap, Calendar, Star,
  ShieldCheck, Luggage, Hotel, Ticket, AlertCircle, Wind, CloudRain as Rain,
  X, Sparkles, Info
} from 'lucide-react';
import { getTripInsights } from '../../services/aiService';

const DashboardHome = ({ theme, userData, trips, nextTrip, stats, notifications, setActiveTab, onViewTrip }) => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [aiInsights, setAiInsights] = useState([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      if (nextTrip) {
        setIsInsightsLoading(true);
        try {
          const dates = `${new Date(nextTrip.startDate).toLocaleDateString()} - ${new Date(nextTrip.endDate).toLocaleDateString()}`;
          const result = await getTripInsights(
            nextTrip.destination,
            nextTrip.startingLocation,
            dates,
            nextTrip.travelers || 1
          );
          if (result && result.insights) {
            setAiInsights(result.insights);
          }
        } catch (error) {
          console.error("Failed to fetch AI insights:", error);
        } finally {
          setIsInsightsLoading(false);
        }
      }
    };

    fetchInsights();
  }, [nextTrip]);

  // Icon Mapping
  const iconMap = {
    Sun, Cloud, Rain, Wind, ShieldCheck, AlertCircle, Zap, TrendingUp, MapPin
  };
  
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  // Helper for greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Live Time & Weather State
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [weatherData, setWeatherData] = React.useState({ temp: 28, condition: 'Sunny', icon: Sun });
  const [countdown, setCountdown] = React.useState({ d: 0, h: 0, m: 0, s: 0 });

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Countdown Logic
  React.useEffect(() => {
    if (!nextTrip?.startDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(nextTrip.startDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setCountdown({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [nextTrip]);

  // Simulate Local Weather
  React.useEffect(() => {
    // In a real app, you could use navigator.geolocation here
    // Setting high-quality static local weather for the current system environment
    setWeatherData({ 
      temp: 29, 
      cond: 'Mainly Sunny', 
      icon: Sun, 
      color: 'text-amber-400',
      location: 'Local'
    });
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1600px] mx-auto space-y-8 lg:space-y-12 pb-20"
    >
      {/* 🌟 1. CINEMATIC HERO SECTION */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          <motion.div 
            variants={itemVariants}
            className="relative min-h-[450px] rounded-[3.5rem] overflow-hidden group shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
          >
            {/* Immersive Background */}
            <motion.img 
              src={nextTrip?.image || `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200`} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              alt="Hero"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
            
            {/* Hero Content */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-14 flex flex-col justify-center min-h-[450px] md:min-h-[500px]">
              <div className="space-y-6">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
                >
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
                   <span className="text-white text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">AI System Online</span>
                </motion.div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mt-2 lg:mt-0">
                  {greeting},<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                    {userData?.fullName?.split(' ')[0] || 'Traveler'}
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-white/60 font-medium max-w-xl leading-relaxed">
                  {nextTrip 
                    ? `Your personalized itinerary for ${nextTrip.destination} is optimized and ready for departure.`
                    : "The world is waiting. Where shall we engineer your next unforgettable experience?"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-5 mt-8 lg:mt-12">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('plan-trip')}
                  className="bg-white text-black px-6 py-4 lg:px-10 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-base flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:shadow-white/40 transition-all"
                >
                  <Plus size={20} className="lg:w-6 lg:h-6" /> Start New Plan
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('map')}
                  className="glass text-white px-6 py-4 lg:px-10 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-sm lg:text-base flex items-center justify-center gap-3 hover:bg-white/10 transition-all border border-white/10"
                >
                  <MapIcon size={20} className="lg:w-6 lg:h-6" /> Virtual Map
                </motion.button>
              </div>
            </div>

            {/* Compact Float Stats in Hero */}
            <div className="absolute top-8 right-8 hidden xl:flex flex-col gap-3">
               <motion.div 
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.8 }}
                 className="bg-black/40 backdrop-blur-3xl px-4 py-2 rounded-2xl border border-white/30 flex items-center gap-3 shadow-2xl"
               >
                  <Clock size={14} className="text-indigo-400" />
                  <p className="text-sm font-black text-white tracking-tighter">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
               </motion.div>

               <motion.div 
                 initial={{ x: 20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 1 }}
                 className="bg-black/40 backdrop-blur-3xl px-4 py-2 rounded-2xl border border-white/30 flex items-center gap-3 shadow-2xl"
               >
                  <div className={weatherData.color}>
                    <weatherData.icon size={14} />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-white tracking-tighter">{weatherData.temp}°</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{weatherData.cond}</p>
                  </div>
               </motion.div>
            </div>
          </motion.div>
        </div>

        {/* 📊 2. PREMIUM STATS VERTICAL GRID */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          {[
            { label: "Total Journeys", value: stats.totalTrips, icon: Plane, color: "from-indigo-600 to-violet-600", trend: "+12%" },
            { label: "Budget Managed", value: `$${stats.budgetSpent.toLocaleString()}`, icon: Wallet, color: "from-emerald-600 to-teal-600", trend: "+$240" },
            { label: "Air Miles", value: stats.milesTraveled.toLocaleString(), icon: MapIcon, color: "from-amber-600 to-orange-600", trend: "Elite" },
            { label: "Checklist", value: `${stats.progress}%`, icon: CheckCircle2, color: "from-rose-600 to-pink-600", trend: "Active" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative overflow-hidden glass p-5 sm:p-6 rounded-3xl lg:rounded-[2.5rem] border border-white/5 flex flex-col justify-between group cursor-default shadow-xl min-h-[160px]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <stat.icon size={80} />
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/20`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-black text-indigo-400 uppercase">{stat.trend}</span>
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-1 text-[var(--text-main)]">{stat.label}</p>
                <h3 className="text-2xl font-black tracking-tight group-hover:text-indigo-400 transition-colors text-[var(--text-main)]">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📍 3. TRIP SPOTLIGHT & AI INTELLIGENCE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Next Journey Spotlight */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <h2 className="text-3xl font-black tracking-tighter">Journey Spotlight</h2>
            </div>
            <button 
              onClick={() => setActiveTab('my-trips')}
              className="group flex items-center gap-2 text-sm font-black opacity-40 hover:opacity-100 transition-all"
            >
              Management Console <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {nextTrip ? (
            <motion.div 
              variants={itemVariants}
              className="group relative flex flex-col min-h-[450px] rounded-[4rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              <img 
                src={`https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200`} 
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                alt="Trip"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Content Wrapper */}
              <div className="relative z-10 flex flex-col justify-between flex-grow">
                {/* Top Elements */}
                <div className="flex flex-wrap gap-2 lg:gap-3 p-6 lg:p-10">
                   <div className="glass px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl lg:rounded-2xl flex items-center gap-2 border border-white/20">
                    <Navigation size={14} className="text-indigo-400" />
                    <span className="text-[10px] lg:text-xs font-black text-white">{nextTrip.transportMode || 'Flight'}</span>
                 </div>
                 <div className="glass px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl lg:rounded-2xl flex items-center gap-2 border border-white/20">
                    <Clock size={14} className="text-indigo-400" />
                    <span className="text-[10px] lg:text-xs font-black text-white">ETA 2h 45m</span>
                 </div>
              </div>

                {/* Bottom Elements */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-8 p-6 lg:p-10 pt-0">
                  <div className="max-w-md w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-indigo-600">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <span className="text-lg lg:text-xl font-black text-white/90 tracking-tighter uppercase truncate">{nextTrip.destination}</span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight mb-6">
                      Departure from {nextTrip.startingLocation}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <button 
                          onClick={() => onViewTrip && onViewTrip(nextTrip.id)}
                          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                       >
                          View Full Details <ArrowRight size={18} />
                       </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto mt-6 sm:mt-0">
                     <p className="text-[10px] lg:text-xs font-black opacity-50 uppercase text-white tracking-widest">Countdown to Boarding</p>
                     <div className="flex gap-2 lg:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                       {[
                         { val: countdown.d, unit: 'Days' },
                         { val: countdown.h, unit: 'Hrs' },
                         { val: countdown.m, unit: 'Min' },
                         { val: countdown.s, unit: 'Sec' }
                       ].map((t, i) => (
                         <div key={i} className="flex-1 sm:w-16 h-16 lg:h-20 bg-black/40 backdrop-blur-3xl rounded-xl lg:rounded-2xl flex flex-col items-center justify-center border border-white/20 shadow-2xl">
                            <span className="text-xl lg:text-2xl font-black text-white">{t.val}</span>
                            <span className="text-[8px] font-bold text-white/40 uppercase">{t.unit}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[450px] glass border-dashed border-2 border-white/10 rounded-[4rem] flex flex-col items-center justify-center opacity-30 group hover:opacity-50 transition-all">
               <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform">
                  <Compass size={64} className="text-white" />
               </div>
               <p className="text-2xl font-black italic tracking-tighter">Adventure Awaits Your Command</p>
               <p className="text-sm font-medium mt-2">Plan your first journey with YouGo AI</p>
            </div>
          )}
        </div>

        {/* 🤖 AI Intelligence Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="flex items-center gap-3 px-2">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                 <Zap size={20} className="fill-violet-400/20" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">AI Briefing</h2>
           </div>

           <div className="glass p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
              {/* AI Pulse Decor */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]" />

              <div className="relative z-10 space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-violet-400 uppercase tracking-widest">
                       <ShieldCheck size={14} /> Intelligence Analysis
                    </div>
                    <p className="text-lg font-bold leading-relaxed text-[var(--text-main)]/80">
                       Salman, based on current weather patterns in {nextTrip?.destination || 'your destination'}, I recommend packing lightweight gear and a reliable power bank. Your flight stability is 98% positive.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {isInsightsLoading ? (
                        <div className="flex flex-col gap-4">
                           {[1, 2, 3].map(i => (
                              <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                           ))}
                        </div>
                     ) : aiInsights.length > 0 ? (
                        aiInsights.map((insight, i) => {
                           const IconComponent = iconMap[insight.icon] || Zap;
                           return (
                              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-default">
                                 <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl bg-black/40 ${insight.color || 'text-indigo-400'}`}>
                                       <IconComponent size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{insight.label}</span>
                                       <span className="text-xs font-black text-[var(--text-main)] group-hover:text-indigo-400 transition-colors">{insight.val}</span>
                                    </div>
                                 </div>
                                 <ArrowRight size={14} className="opacity-0 group-hover:opacity-40 transition-all -translate-x-2 group-hover:translate-x-0" />
                              </div>
                           );
                        })
                     ) : (
                        <div className="p-10 rounded-2xl border border-dashed border-white/10 flex flex-col items-center text-center opacity-40">
                           <Zap size={32} className="mb-2" />
                           <p className="text-xs font-bold">Select a trip to generate intelligence insights</p>
                        </div>
                     )}
                 </div>

                 {nextTrip && (
                    <button 
                      onClick={() => setShowReport(true)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-100 transition-all"
                    >
                       Full AI Intelligence Report
                    </button>
                 )}
              </div>
           </div>
        </div>
      </section>

      {/* 📅 4. CINEMATIC TIMELINE & CHECKLIST */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Travel Timeline */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-4 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">Itinerary Flow</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide no-scrollbar">
                 {nextTrip?.aiPlanJson ? JSON.parse(nextTrip.aiPlanJson).itinerary?.map((day, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveDayIdx(idx)}
                      className={`px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${activeDayIdx === idx ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'glass text-[var(--text-main)]/40 hover:text-[var(--text-main)] hover:bg-white/5'}`}
                    >
                      Day {idx + 1}
                    </button>
                 )) : (
                    ['Day 1', 'Day 2', 'Day 3'].map((d, i) => (
                      <button key={i} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${i === 0 ? 'bg-indigo-600 text-white' : 'glass text-[var(--text-main)]/40'}`}>{d}</button>
                    ))
                 )}
              </div>
            </div>

            <div className="glass p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] border border-white/5">
               <div className="relative space-y-10 sm:space-y-12">
                  <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500 via-indigo-500/20 to-transparent" />
                  
                  {(() => {
                    if (!nextTrip?.aiPlanJson) return (
                      <div className="pl-16 opacity-40 italic text-sm py-10">Select a trip to see your detailed itinerary flow.</div>
                    );
                    
                    const aiData = JSON.parse(nextTrip.aiPlanJson);
                    const itinerary = aiData.itinerary;
                    const currentDay = itinerary?.[activeDayIdx];
                    
                    if (!currentDay || !currentDay.activities || currentDay.activities.length === 0) return (
                      <div className="pl-16 opacity-40 italic text-sm py-10">No activities scheduled for Day {activeDayIdx + 1}.</div>
                    );
                    
                    return currentDay.activities.map((item, i) => (
                      <div key={i} className="relative pl-12 sm:pl-16 group">
                         <div className={`absolute left-4 top-1.5 w-4 h-4 rounded-full border-4 border-black transition-all group-hover:scale-125 z-10 ${
                            i === 0 ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-white/20'
                         }`} />
                         
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-grow min-w-0">
                               <div className="flex items-center gap-3 mb-1 flex-wrap">
                                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{item.time || 'TBD'}</span>
                                  {item.type && (
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-[var(--text-main)]/40">{item.type}</span>
                                  )}
                               </div>
                               <h4 className="text-lg sm:text-xl font-black text-[var(--text-main)] group-hover:text-indigo-400 transition-colors truncate">
                                 {item.activity || item.title}
                               </h4>
                               <div className="flex items-center gap-2 mt-1 opacity-40 text-[var(--text-main)]">
                                  <MapPin size={12} />
                                  <span className="text-xs font-bold truncate">{item.location || 'Location TBD'}</span>
                               </div>
                            </div>
                            <button className="w-full md:w-auto px-5 py-2.5 rounded-xl glass text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]/60 hover:text-[var(--text-main)] border border-white/5 transition-all">Details</button>
                         </div>
                      </div>
                    ));
                  })()}
               </div>
            </div>
         </div>

         {/* Radial Checklist */}
         <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                 <ShieldCheck size={20} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Readiness</h2>
            </div>

            <div className="glass p-10 rounded-[4rem] border border-white/5 flex flex-col items-center">
               <div className="relative w-48 h-48 mb-8">
                  {/* Outer Ring */}
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                     <motion.circle 
                        cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={552.92}
                        initial={{ strokeDashoffset: 552.92 }}
                        animate={{ strokeDashoffset: 552.92 - (552.92 * stats.progress) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className="text-indigo-500" 
                        strokeLinecap="round"
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl font-black text-[var(--text-main)]">{stats.progress}%</span>
                     <span className="text-[10px] font-bold text-[var(--text-main)]/30 uppercase tracking-[0.2em]">Ready</span>
                  </div>
               </div>

               <div className="w-full space-y-3">
                  {[
                     { label: 'Visa & Passport', done: true },
                     { label: 'Insurance Policy', done: true },
                     { label: 'Hotel Voucher', done: false },
                     { label: 'AI Packing List', done: false }
                  ].map((item, i) => (
                     <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        item.done ? 'bg-indigo-600/10 border-indigo-500/20 opacity-100' : 'bg-[var(--text-main)]/5 border-[var(--text-main)]/5 opacity-40'
                     }`}>
                        <span className="text-xs font-black text-[var(--text-main)]">{item.label}</span>
                        {item.done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-[var(--text-main)]/20" />}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* 🌍 5. EXPLORE & DISCOVER */}
      <section className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-10 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              <h2 className="text-3xl font-black tracking-tighter italic">AI Discovery Carousel</h2>
            </div>
            <div className="flex gap-3">
               <button className="p-3 glass rounded-full hover:bg-white/10 transition-all border border-white/10"><ArrowRight size={20} className="rotate-180" /></button>
               <button className="p-3 glass rounded-full hover:bg-white/10 transition-all border border-white/10"><ArrowRight size={20} /></button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
               { name: 'Swiss Alps', category: 'Weekend Escape', img: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=400' },
               { name: 'Kyoto Zen', category: 'Cultural Dive', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400' },
               { name: 'Bali Shores', category: 'Luxury Beach', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400' },
               { name: 'Icelandic Aurora', category: 'Personalized', img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=400' }
            ].map((place, i) => (
               <motion.div 
                  key={i}
                  whileHover={{ y: -15 }}
                  className="group relative h-96 rounded-[3rem] overflow-hidden border border-white/5 cursor-pointer"
               >
                  <img src={place.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={place.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  
                  <div className="absolute inset-x-8 bottom-8">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{place.category}</p>
                     <h4 className="text-2xl font-black text-white tracking-tighter">{place.name}</h4>
                     <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Explore Destination</span>
                        <ArrowRight size={14} className="text-white" />
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* 🔮 5. INTELLIGENCE REPORT MODAL */}
      {showReport && nextTrip?.aiPlanJson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowReport(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] glass rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-violet-600/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Intelligence Report</h2>
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{nextTrip.destination} Mission Analysis</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="p-3 rounded-xl hover:bg-white/5 transition-all text-[var(--text-main)]/40 hover:text-[var(--text-main)]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar scrollbar-hide no-scrollbar">
              {(() => {
                const plan = JSON.parse(nextTrip.aiPlanJson);
                return (
                  <>
                    {/* Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-black text-indigo-400 uppercase tracking-widest">
                        <Info size={16} /> Strategic Overview
                      </div>
                      <p className="text-xl font-bold leading-relaxed text-[var(--text-main)]/90 bg-white/5 p-6 rounded-3xl border border-white/5">
                        {plan.summary}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Budget Breakdown */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs font-black text-emerald-400 uppercase tracking-widest">
                          <Wallet size={16} /> Budget Allocation
                        </div>
                        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                          {Object.entries(plan.budget || {}).map(([key, val], idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                              <span className="text-xs font-bold capitalize opacity-50">{key}</span>
                              <span className="text-sm font-black text-emerald-400">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stay Suggestions */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-xs font-black text-amber-400 uppercase tracking-widest">
                          <Hotel size={16} /> Accommodation Intelligence
                        </div>
                        <div className="space-y-3">
                          {plan.staySuggestions?.map((stay, idx) => (
                            <div key={idx} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-black">{stay.type}</h4>
                                <p className="text-[10px] font-bold opacity-40">{stay.area}</p>
                              </div>
                              <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">{stay.priceRange}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs font-black text-violet-400 uppercase tracking-widest">
                        <Zap size={16} /> Field Operative Tips
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plan.tips?.map((tip, idx) => (
                          <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-violet-600/5 border border-violet-600/10 hover:bg-violet-600/10 transition-all">
                            <div className="w-1.5 h-full bg-violet-600 rounded-full" />
                            <p className="text-sm font-bold opacity-80 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-black/20">
              <button 
                onClick={() => setShowReport(false)}
                className="w-full py-4 rounded-2xl bg-[var(--text-main)] text-[var(--bg-main)] font-black text-sm hover:scale-[1.02] active:scale-100 transition-all"
              >
                Close Briefing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DashboardHome;
