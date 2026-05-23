import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  User,
  Compass,
  Cpu,
  Map as MapIcon,
  ClipboardList,
  Camera,
  MapPin,
  Bell,
  ShieldCheck
} from 'lucide-react';

const steps = [
  {
    icon: <User className="w-5 h-5" />,
    title: "User Starts Journey",
    description: "Initialize your profile and set your travel preferences.",
    side: "left"
  },
  {
    icon: <Compass className="w-5 h-5" />,
    title: "Enter Trip Details",
    description: "Input your destination, budget, and travel dates.",
    side: "right"
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "AI Processing",
    description: "Our AI analyzes real-time data to craft your perfect trip.",
    side: "left"
  },
  {
    icon: <MapIcon className="w-5 h-5" />,
    title: "Smart Travel Plan",
    description: "Get a complete itinerary, transport options, and food guide.",
    side: "right"
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: "Auto Checklist Created",
    description: "A dynamic packing list is generated based on your destination.",
    side: "left"
  },
  {
    icon: <Camera className="w-5 h-5" />,
    title: "Add Important Items",
    description: "Register items like passports and electronics for tracking.",
    side: "right"
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Track & Monitor Items",
    description: "Real-time location and usage monitoring for all belongings.",
    side: "left"
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Smart Alerts",
    description: "Proactive reminders like 'Don't forget your charger'.",
    side: "right"
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Travel Safely with YuGo",
    description: "Enjoy a stress-free journey with AI-powered protection.",
    side: "center"
  }
];

const HowItWorks = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section id="how-it-works" className="py-20 px-4 md:px-6 relative transition-colors duration-500" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full glass border text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-500 mb-6 md:mb-8"
          >
            The Roadmap
          </motion.div>
          <h2 className="font-black mb-6 md:mb-8 tracking-tighter transition-colors duration-500">Your Journey, <br /><span className="text-gradient">Architected by AI</span></h2>
          <p className="opacity-60 text-base md:text-lg font-medium max-w-2xl mx-auto transition-opacity duration-500">From the first click to a safe return, see how YuGo powers every step of your travel.</p>
        </div>

        <div className="relative">

          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[2px] bg-indigo-500/10 md:-translate-x-1/2" />

          <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[4px] md:-translate-x-1/2 z-0">
            <svg width="4" height="100%" className="h-full">
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="100%"
                stroke="url(#path-gradient)"
                strokeWidth="4"
                strokeDasharray="1 1"
                style={{ pathLength }}
              />
              <defs>
                <linearGradient id="path-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="space-y-12 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center w-full pl-16 md:pl-0 ${step.side === 'left' ? 'md:flex-row' : step.side === 'right' ? 'md:flex-row-reverse' : 'flex-col md:flex-row'
                  }`}
              >

                <motion.div
                  initial={{ opacity: 0, x: 30, md: step.side === 'left' ? -50 : step.side === 'right' ? 50 : 0 }}
                  whileInView={{ opacity: 1, x: 0, md: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`w-full md:w-[45%] p-6 rounded-[2rem] glass border shadow-xl transition-all ${step.side === 'center' ? 'md:w-[60%] md:mx-auto text-center' : ''
                    }`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/20 ${step.side === 'center' ? 'mx-auto' : ''
                    }`}>
                    {React.cloneElement(step.icon, { className: 'w-5 h-5' })}
                  </div>
                  <h3 className="text-lg md:text-xl font-black mb-2 tracking-tight uppercase">{step.title}</h3>
                  <p className="opacity-60 text-sm md:text-base font-medium leading-relaxed transition-opacity duration-500">{step.description}</p>
                </motion.div>


                <div className="absolute left-[30px] md:left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-[0_0_15px_rgba(99,102,241,0.8)] border-2 md:border-4 border-indigo-600 z-20"
                  />
                </div>


                <div className="hidden md:block w-[45%]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
