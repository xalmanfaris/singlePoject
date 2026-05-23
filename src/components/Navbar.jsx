import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Preview", href: "#preview" }
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-8"
    >
      <div className="relative w-full max-w-6xl" ref={menuRef}>
        <div className="glass-dark px-4 md:px-6 py-3 rounded-full flex items-center justify-between backdrop-blur-3xl transition-all duration-500 shadow-2xl relative z-50">
          <div className="flex items-center group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-xl md:text-2xl font-black tracking-tighter italic text-logo transition-transform duration-300 group-hover:scale-105">
              YuGo
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium opacity-60 hover:opacity-100 transition-all hover:tracking-wide"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full glass border flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-main"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -10, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 10, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button
              onClick={() => navigate('/auth')}
              className="hidden sm:flex bg-indigo-600 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-black hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
            >
              Get Started
            </button>

            <button
              onClick={toggleMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center glass rounded-full border hover:bg-white/5 active:scale-90 transition-all"
            >
              {isOpen ? <X className="w-5 h-5 opacity-60" /> : <Menu className="w-5 h-5 opacity-60" />}
            </button>
          </div>
        </div>


        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 10, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-4 right-4 lg:hidden glass-dark rounded-[2.5rem] p-6 border shadow-3xl z-40"
            >
              <div className="flex flex-col gap-6 items-center">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={toggleMenu}
                    className="text-lg font-bold opacity-70 hover:opacity-100 hover:text-indigo-400 transition-all w-full text-center py-2"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="w-full h-px bg-white/10" />
                <button
                  onClick={() => {
                    toggleMenu();
                    navigate('/auth');
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
