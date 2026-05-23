import React from 'react';
import { Plane, Twitter, Github, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-24 px-6 border-t border-indigo-500/10 grain transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8 group cursor-pointer">

              <span className="text-2xl font-black tracking-tighter italic text-logo">
                YuGo
              </span>
            </div>
            <p className="opacity-60 text-sm leading-relaxed font-medium transition-opacity duration-500">
              The AI-powered travel companion that helps you plan smarter, travel safer, and never lose your belongings.
            </p>
          </div>

          <div>
            <h4 className="font-black mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Product</h4>
            <ul className="space-y-4 text-sm font-medium opacity-60 transition-opacity duration-500">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">AI Planner</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Smart Tracking</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Checklists</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Company</h4>
            <ul className="space-y-4 text-sm font-medium opacity-60 transition-opacity duration-500">
              <li><a href="#" className="hover:text-indigo-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 text-xs uppercase tracking-[0.2em] opacity-40">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 glass flex items-center justify-center rounded-2xl hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-2 group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-12 h-12 glass flex items-center justify-center rounded-2xl hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-2 group">
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="w-12 h-12 glass flex items-center justify-center rounded-2xl hover:bg-indigo-600 hover:text-white transition-all hover:-translate-y-2 group">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-indigo-500/5 text-xs font-bold opacity-40 uppercase tracking-widest">
          <p>© 2026 YuGo AI. All rights reserved.</p>
          <p>Handcrafted for global explorers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
