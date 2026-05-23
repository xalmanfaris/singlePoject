import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Preview from './components/Preview';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Auth from './components/Auth/Auth';
import Onboarding from './components/Auth/Onboarding';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

import { getCookie } from './services/cookieService';
 
const ProtectedRoute = ({ children }) => {
  const user = getCookie('user');
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = getCookie('user');
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  const role = user.role || user.Role;
  if (role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const Landing = ({ theme, toggleTheme }) => (
  <>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <Preview />
      <CTA />
    </main>
    <Footer />
  </>
);

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-500">
        <div className="fixed inset-0 bg-grid -z-10 opacity-40 transition-opacity duration-500" />
        
        <Routes>
          <Route path="/" element={<Landing theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard theme={theme} toggleTheme={toggleTheme} />
              </AdminRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
