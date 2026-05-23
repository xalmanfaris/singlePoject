import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Loader2, 
  RefreshCw,
  Mail,
  AlertCircle
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { changePassword } from '../../services/authService';
import { createPortal } from 'react-dom';

const PasswordChangeModal = ({ isOpen, onClose, userEmail, userName, token }) => {
  const [step, setStep] = useState(1); // 1: Password Form, 2: OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef([]);

  // EmailJS Configuration
  const EMAILJS_SERVICE_ID = 'service_fta5tv8';
  const EMAILJS_TEMPLATE_ID = 'template_5ckmgjb';
  const EMAILJS_PUBLIC_KEY = 'ZZdp8MQXZc_IDtVxT';

  const passwordRules = [
    { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
    { label: 'At least 1 uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'At least 1 number', test: (p) => /[0-9]/.test(p) },
    { label: 'At least 1 special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) }
  ];

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle browser back button to close modal
  useEffect(() => {
    if (isOpen) {
      // Add a history entry when modal opens
      window.history.pushState({ modal: 'password_change' }, '', window.location.pathname);
      
      const handlePopState = (event) => {
        // If the user hits back, close the modal
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
        // If the modal is being closed manually (not by back button), 
        // we should pop the state if we are still on the modal state
        if (window.history.state && window.history.state.modal === 'password_change') {
          window.history.back();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const togglePassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    return `${name[0]}***@${domain}`;
  };

  const validateStep1 = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    const allRulesMet = passwordRules.every(rule => rule.test(formData.newPassword));
    if (!allRulesMet) {
      setError('Please meet all password requirements');
      return false;
    }
    return true;
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    const templateParams = {
      to_name: userName,
      email: userEmail,
      passcode: newOtp,
      time: new Date().toLocaleTimeString(),
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setStep(2);
      setTimer(30);
      setCanResend(false);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyAndUpdate = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await changePassword(formData.currentPassword, formData.newPassword, token);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setStep(1);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setOtp(['', '', '', '', '', '']);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
      setStep(1); // Go back to fix password if current was wrong
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg glass border border-[var(--glass-border)] rounded-[2.5rem] shadow-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-8 pb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-black tracking-tighter">
                {success ? 'Success!' : step === 1 ? 'Change Password' : 'Verify Identity'}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 opacity-50" />
              </button>
            </div>
            <p className="opacity-50 text-sm font-medium">
              {step === 1 
                ? 'Create a strong, unique password to keep your account secure.' 
                : `Enter the 6-digit code sent to ${maskEmail(userEmail)}`}
            </p>
          </div>

          <div className="p-8 pt-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            {success ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <p className="font-bold text-lg">Password Updated Successfully!</p>
              </div>
            ) : step === 1 ? (
              /* Step 1: Form */
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] rounded-2xl py-4 px-12 outline-none focus:border-indigo-500/50 focus:bg-black/10 dark:focus:bg-white/10 transition-all font-medium"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                      <button
                        type="button"
                        onClick={() => togglePassword('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-60 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] rounded-2xl py-4 px-12 outline-none focus:border-indigo-500/50 focus:bg-black/10 dark:focus:bg-white/10 transition-all font-medium"
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                      <button
                        type="button"
                        onClick={() => togglePassword('new')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-60 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] rounded-2xl py-4 px-12 outline-none focus:border-indigo-500/50 focus:bg-black/10 dark:focus:bg-white/10 transition-all font-medium"
                      />
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                      <button
                        type="button"
                        onClick={() => togglePassword('confirm')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-60 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validation Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--glass-border)]">
                  {passwordRules.map((rule, idx) => {
                    const isMet = rule.test(formData.newPassword);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${isMet ? 'bg-emerald-500/20 text-emerald-500' : 'bg-black/10 dark:bg-white/5 opacity-40'}`}>
                          {isMet ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                        </div>
                        <span className={`text-[10px] font-bold ${isMet ? 'opacity-60' : 'opacity-30'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 glass rounded-2xl font-bold hover:bg-black/5 dark:hover:bg-white/10 transition-all border border-[var(--glass-border)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep1()) {
                        sendOtp();
                      }
                    }}
                    disabled={loading}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: OTP */
              <div className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => otpRefs.current[idx] = el}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-16 sm:w-14 sm:h-20 bg-black/5 dark:bg-white/5 border border-[var(--glass-border)] rounded-2xl text-center text-2xl font-black focus:border-indigo-500/50 focus:bg-black/10 dark:focus:bg-white/10 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    {canResend ? (
                      <button
                        onClick={sendOtp}
                        className="text-indigo-500 dark:text-indigo-400 font-bold text-sm flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Resend Code
                      </button>
                    ) : (
                      <p className="opacity-40 text-sm font-bold">
                        Resend in <span className="text-indigo-500 dark:text-indigo-400">{timer}s</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleVerifyAndUpdate}
                    disabled={loading || otp.some(d => !d)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default PasswordChangeModal;
