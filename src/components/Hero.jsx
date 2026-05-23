import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 md:pt-28 px-4 md:px-6 overflow-hidden mesh-bg grain transition-colors duration-500">

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-indigo-600/10 blur-[80px] md:blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-rose-600/10 blur-[70px] md:blur-[120px] rounded-full z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full glass border mb-8 md:mb-10 shadow-lg"
        >
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Next Gen Travel Planning</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="font-black mb-6 md:mb-10 leading-[0.95] tracking-tighter transition-colors duration-500"
        >
          Plan Smarter <br />
          <span className="text-gradient">Travel with YuGo</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-base md:text-xl opacity-60 max-w-3xl mx-auto mb-10 md:mb-14 leading-relaxed font-medium transition-opacity duration-500"
        >
          Get personalized itineraries, smart packing lists, and never lose your belongings again. The ultimate companion for modern global explorers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 px-4"
        >
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all group hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/20"
          >
            Get Started <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 glass rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-indigo-500/10 transition-all border"
          >
            Explore Features
          </button>
        </motion.div>
      </div>



      <div className="absolute left-[5%] top-1/2 -translate-y-1/2 hidden 2xl:block pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass p-6 rounded-[2rem] border shadow-3xl backdrop-blur-3xl"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <div className="h-2 w-32 bg-indigo-500/20 rounded-full mb-3" />
          <div className="h-2 w-20 bg-indigo-500/10 rounded-full" />
        </motion.div>
      </div>

      <div className="absolute right-[5%] bottom-[15%] hidden 2xl:block pointer-events-none">
        <motion.div
          animate={{ y: [0, 30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="glass p-6 rounded-[2rem] border shadow-3xl backdrop-blur-3xl"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-violet-600 rounded-2xl mb-4 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Plane className="text-white w-7 h-7" strokeWidth={2.5} />
          </div>
          <div className="h-2 w-28 bg-rose-500/20 rounded-full mb-3" />
          <div className="h-2 w-16 bg-rose-500/10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
