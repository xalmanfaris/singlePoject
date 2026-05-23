import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 md:py-32 px-4 md:px-6 grain transition-colors duration-500">
      <div className="max-w-6xl mx-auto glass-dark p-10 md:p-32 rounded-[3rem] md:rounded-[4rem] border relative overflow-hidden group shadow-3xl">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />


        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/10 blur-[80px] md:blur-[120px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h2 className="font-black mb-8 md:mb-10 leading-[1.1] tracking-tighter transition-colors duration-500">
            Ready to Start Your <br />
            <span className="text-gradient">Smart Journey?</span>
          </h2>
          <p className="opacity-60 text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed transition-opacity duration-500">
            Join thousands of smart travelers using AI to plan, track, and enjoy their trips like never before.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 bg-indigo-600 text-white rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl flex items-center justify-center gap-3 mx-auto hover:bg-indigo-500 transition-all group hover:scale-105 active:scale-95 shadow-3xl shadow-indigo-600/30"
          >
            Start Your Free Trial <ArrowRight className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
