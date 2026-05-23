import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome, Apple, ArrowLeft, Sparkles, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import verticalPic from '../../assets/verticalpic.jpg';
import { login, register, socialLogin, adminLogin } from '../../services/authService';
import { setCookie, getCookie } from '../../services/cookieService';
import emailjs from '@emailjs/browser';
import { useGoogleLogin } from '@react-oauth/google';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const user = getCookie('user');
    if (user) {
      const role = user.role || user.Role;
      if (role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const socialData = {
          email: userInfo.email,
          fullName: userInfo.name,
          provider: 'Google',
          externalId: userInfo.sub,
        };

        const result = await socialLogin(socialData);
        setCookie('user', result);


        if (result.isProfileComplete || result.IsProfileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        setError(err.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Login Failed'),
  });

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // EmailJS Configuration
  const EMAILJS_SERVICE_ID = 'service_fta5tv8';
  const EMAILJS_TEMPLATE_ID = 'template_5ckmgjb';
  const EMAILJS_PUBLIC_KEY = 'ZZdp8MQXZc_IDtVxT';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const sendOtp = async () => {
    if (!formData.email || !formData.fullName) {
      setError('Please fill in your name and email first.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions.');
      return;
    }

    if (!canResend) return;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    const templateParams = {
      to_name: formData.fullName,
      email: formData.email,
      passcode: otp,
      time: new Date().toLocaleTimeString(),
    };

    try {
      console.log('Sending OTP via EmailJS...');
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setIsOtpSent(true);
      setCanResend(false);
      setTimer(180);
      setError('');
    } catch (err) {
      console.error('EmailJS Error Object:', err);
      setError(`OTP failed to send: ${err.text || err.message || 'Unknown error'}`);
    }
  };

  const validateForm = () => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }


    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain both letters and numbers.');
      return false;
    }

    if (!isLogin && !formData.fullName) {
      setError('Please enter your full name.');
      return false;
    }

    return true;
  };

  const handleVerify = async (otpValue) => {
    if (otpValue === generatedOtp) {
      setLoading(true);
      try {
        const result = await register(formData.fullName, formData.email, formData.password);
        setCookie('user', result);
        navigate('/onboarding');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else if (otpValue.length === 6) {
      setError('Invalid OTP. Please check your email.');
    }
  };

  useEffect(() => {
    if (userOtp.length === 6) {
      handleVerify(userOtp);
    }
  }, [userOtp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Unified login calls the main login function which authenticates both Users and Admins
        const result = await login(formData.email, formData.password);
        setCookie('user', result);

        document.cookie = 'dashboard_active_tab=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        const role = result.role || result.Role;
        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (result.isProfileComplete || result.IsProfileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        if (!isOtpSent) {
          await sendOtp();
        } else {
          handleVerify(userOtp);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: 0.1 }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-6 overflow-hidden mesh-bg grain">

      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-rose-600/10 blur-[100px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-bold hover:bg-white/10 transition-all z-50 group shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Back to Home</span>
        <span className="sm:hidden text-xs">Back to Home</span>
      </motion.button>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-4xl flex flex-col md:flex-row glass-dark rounded-[2.5rem] md:rounded-[3.5rem] border shadow-3xl overflow-hidden relative mt-16 md:mt-0"
      >

        <div className="hidden md:flex flex-1 relative p-12 flex-col justify-between overflow-hidden">

          <motion.img
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src={verticalPic}
            alt="Auth Background"
            className="absolute inset-0 w-full h-full object-cover"
          />


          <motion.div
            animate={{
              x: [0, 30, 0],
              y: [0, 50, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -40, 0],
              y: [0, -60, 0],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full"
          />
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-[-20%] right-[-20%] w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-full animate-pulse" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-4xl font-black tracking-tighter italic text-white">YuGo</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gradient leading-tight tracking-tighter mb-6">
              {isLogin ? "Welcome back to the future of travel." : "Start your smart journey today."}
            </h2>
            <p className="text-white/70 text-lg font-medium leading-relaxed max-w-sm">
              {isLogin
                ? "Your personalized itineraries and smart tracking are just one click away."
                : "Join thousands of global explorers using AI to simplify every single journey."}
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-500 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                 </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white">
                +2k
              </div>
            </div>
            <p className="text-white/60 text-sm font-bold tracking-wide uppercase">Trusted by explorers worldwide</p>
          </div>
        </div>


        <div className="flex-[1.2] p-8 md:p-12 lg:p-16 relative bg-white/[0.02]">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">

            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="mb-10 mt-8 md:mt-0">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </h1>
                  <p className="text-muted font-medium">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="ml-2 text-indigo-500 font-bold hover:underline"
                    >
                      {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                  </p>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-3 rounded-xl text-xs font-bold ${error.includes('successful') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}
                    >
                      {error}
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isOtpSent ? (
                    <>
                      {!isLogin && (
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all" />
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required={!isLogin}
                              placeholder="Your Name"
                              className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest ml-1 opacity-50">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-all group-focus-within:text-indigo-500" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Your Email"
                            className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white/10 transition-all font-medium focus:border-indigo-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black uppercase tracking-widest opacity-50">Password</label>
                          {isLogin && (
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400">Forgot?</button>
                          )}
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-all group-focus-within:text-indigo-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="w-full bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:bg-white/10 transition-all font-medium focus:border-indigo-500/50"
                          />
                          {formData.password.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 hover:text-indigo-500 transition-all focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      <div className="p-6 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors" />
                        <p className="text-sm font-medium text-indigo-900/70 dark:text-indigo-200/80 leading-relaxed relative z-10">
                          We've sent a 6-digit verification code to <br />
                          <span className="text-indigo-600 dark:text-white font-black text-base">{formData.email}</span>.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-xs font-black uppercase tracking-[0.2em] opacity-50 dark:opacity-40">Verification Code</label>
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${timer > 0 ? 'text-indigo-500' : 'text-emerald-500'}`}>
                            {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Ready to Resend'}
                          </span>
                        </div>

                        <div className="relative">
                          {/* Real Hidden Input */}
                          <input
                            type="text"
                            maxLength="6"
                            value={userOtp}
                            onChange={(e) => setUserOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-default z-10"
                            autoFocus
                          />

                          {/* Styled Visual Boxes */}
                          <div className="flex justify-between gap-3">
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                              const isFocused = userOtp.length === index;
                              const isFilled = userOtp.length > index;

                              return (
                                <motion.div
                                  key={index}
                                  initial={false}
                                  animate={{
                                    scale: isFocused ? 1.05 : 1,
                                    borderColor: isFocused ? 'rgba(99, 102, 241, 0.8)' : (isFilled ? 'rgba(99, 102, 241, 0.4)' : 'rgba(156, 163, 175, 0.2)')
                                  }}
                                  className={`flex-1 h-16 sm:h-20 bg-slate-50/50 dark:bg-white/5 border-2 rounded-2xl flex items-center justify-center text-3xl font-black transition-all relative overflow-hidden ${isFocused ? 'bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''} ${isFilled ? 'text-indigo-600 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}
                                >
                                  {userOtp[index] || ''}

                                  {isFocused && (
                                    <motion.div
                                      animate={{ opacity: [0, 1, 0] }}
                                      transition={{ duration: 1, repeat: Infinity }}
                                      className="absolute bottom-4 w-6 h-1 bg-indigo-500 rounded-full"
                                    />
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-xs font-bold px-1">
                          <button
                            type="button"
                            onClick={() => { setIsOtpSent(false); setError(''); setUserOtp(''); }}
                            className="text-slate-400 dark:text-white/40 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-2"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Change Details
                          </button>
                          <button
                            type="button"
                            onClick={sendOtp}
                            disabled={!canResend}
                            className={`transition-colors flex items-center gap-2 ${canResend ? 'text-indigo-500 hover:text-indigo-400' : 'text-slate-500 cursor-not-allowed opacity-50'}`}
                          >
                            Resend Code
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 mt-6 ml-1"
                    >
                      <div className="relative flex items-center h-5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-white/20 bg-white/5 transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                        />
                        <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                      <label htmlFor="terms" className="text-sm font-medium text-muted leading-tight cursor-pointer select-none">
                        I agree to the <span className="text-indigo-500 hover:underline">Terms of Service</span> and <span className="text-indigo-500 hover:underline">Privacy Policy</span>.
                      </label>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-10 py-5 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl group disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : (isOtpSent ? 'Verify OTP' : 'Send OTP')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <>
                  <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                      <span className="bg-transparent px-4 text-muted">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleGoogleLogin()}
                      className="flex items-center justify-center gap-3 py-4 glass rounded-2xl hover:bg-white/10 transition-all font-bold text-sm active:scale-95"
                    >
                      <Chrome className="w-5 h-5" />
                      Google
                    </button>
                    <button className="flex items-center justify-center gap-3 py-4 glass rounded-2xl hover:bg-white/10 transition-all font-bold text-sm active:scale-95">
                      <Apple className="w-5 h-5" />
                      Apple
                    </button>
                  </div>
                </>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
