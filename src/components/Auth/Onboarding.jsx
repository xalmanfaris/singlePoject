import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Globe, Plane, Wallet, Compass, ArrowRight, Check, Loader2, Sparkles, ChevronDown, Search, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { completeRegistration } from '../../services/authService';
import { getCookie, setCookie } from '../../services/cookieService';

// Comprehensive Country List
const ALL_COUNTRIES = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
].sort((a, b) => a.name.localeCompare(b.name));

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');

  // Country Selector States
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(ALL_COUNTRIES.find(c => c.name === 'United States'));
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    country: '',
    travelType: 'Solo',
    budgetPreference: 'Moderate',
    travelStyle: 'Adventure',
    preferredTransport: 'Flight',
    profileImageUrl: '',
  });

  const [previewUrl, setPreviewUrl] = useState('');
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const storedUser = getCookie('user');
    if (!storedUser) navigate('/auth');
    else setUser(storedUser);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview instantly
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setProfileFile(file);
  };

  const handleSubmit = async () => {
    const token = user?.token || user?.Token;

    if (!user || !token) {
      setError('User session not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('PhoneNumber', `${selectedCountry.code} ${formData.phoneNumber}`);
      data.append('Country', formData.country);
      data.append('TravelType', formData.travelType);
      data.append('BudgetPreference', formData.budgetPreference);
      data.append('TravelStyle', formData.travelStyle);
      data.append('PreferredTransport', formData.preferredTransport);

      if (profileFile) {
        data.append('ProfileImage', profileFile);
      } else {
        data.append('ProfileImageUrl', formData.profileImageUrl);
      }

      await completeRegistration(data, token);

      const updatedUser = { ...user, isProfileComplete: true };
      setCookie('user', updatedUser);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.includes(searchQuery)
  );

  const travelTypes = ['Solo', 'Couple', 'Family', 'Friends', 'Business'];
  const budgets = ['Budget', 'Moderate', 'Luxury', 'Ultra-Luxury'];
  const styles = ['Adventure', 'Relaxation', 'Cultural', 'Nightlife', 'Nature'];
  const transports = ['Flight', 'Train', 'Bus', 'Car', 'Bike'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden relative transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
      >
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Almost there!
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-4 text-slate-900 dark:text-white">
              Personalize your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Journey.</span>
            </h1>
            <p className="text-slate-500 dark:text-muted text-lg leading-relaxed max-w-md">
              Welcome {user?.fullName || 'Traveler'}! Help us tailor your YouGo experience by sharing your travel preferences.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-400 dark:text-white/30'}`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <div className={`text-sm font-bold ${step >= s ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-white/20'}`}>
                  {s === 1 ? 'Contact & Location' : s === 2 ? 'Travel Identity' : 'Financial Style'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <motion.div
            className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 p-8 sm:p-10 rounded-[2.5rem] relative shadow-2xl dark:shadow-none"
            layout
          >
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  {/* Profile Image Section */}
                  <div className="flex flex-col items-center gap-4 pb-4">
                    <div className="relative group cursor-pointer">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-upload"
                        accept="image/*"
                      />
                      <label htmlFor="profile-upload" className="block relative cursor-pointer">
                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-white/50 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-2xl shadow-indigo-500/20 relative">
                          {previewUrl || formData.profileImageUrl ? (
                            <img src={previewUrl || formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors">Upload</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white dark:border-[#1a1a1a]">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Identity</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:opacity-40">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1">Phone Number</label>
                      <div className="flex gap-3">
                        {/* Custom Country Selector */}
                        <div className="relative" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                            className="h-[60px] min-w-[100px] flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 hover:border-indigo-500/50 transition-all font-bold text-slate-900 dark:text-white"
                          >
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.code}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isCountryOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute top-full left-0 mt-2 w-64 max-h-80 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                              >
                                <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                  <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                                    <input
                                      type="text"
                                      placeholder="Search country..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      className="w-full bg-slate-50 dark:bg-white/5 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-1 ring-indigo-500/50"
                                    />
                                  </div>
                                </div>
                                <div className="overflow-y-auto flex-1 scrollbar-thin">
                                  {filteredCountries.map((c) => (
                                    <button
                                      key={c.name}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(c);
                                        setIsCountryOpen(false);
                                        setSearchQuery('');
                                      }}
                                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">{c.flag}</span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{c.name}</span>
                                      </div>
                                      <span className="text-xs font-black opacity-40">{c.code}</span>
                                    </button>
                                  ))}
                                  {filteredCountries.length === 0 && (
                                    <div className="p-4 text-center text-xs text-muted">No results found.</div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="relative group flex-1">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:opacity-40 group-focus-within:text-indigo-500 transition-all" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="555-000-0000"
                            className="w-full h-[60px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 text-slate-900 dark:text-white transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-white/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1">Country</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:opacity-40 group-focus-within:text-indigo-500 transition-all" />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Where are you from?"
                          className="w-full h-[60px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500/50 focus:bg-white/10 text-slate-900 dark:text-white transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all group shadow-lg shadow-indigo-600/30"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1 flex items-center gap-2">
                        <Plane className="w-4 h-4" />
                        Travel Type
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {travelTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setFormData(p => ({ ...p, travelType: type }))}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.travelType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1 flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        Travel Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {styles.map((style) => (
                          <button
                            key={style}
                            onClick={() => setFormData(p => ({ ...p, travelStyle: style }))}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.travelStyle === style ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1 flex items-center gap-2">
                        <Plane className="w-4 h-4" />
                        Preferred Transport
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {transports.map((transport) => (
                          <button
                            key={transport}
                            onClick={() => setFormData(p => ({ ...p, preferredTransport: transport }))}
                            className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.preferredTransport === transport ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:border-indigo-500/50 hover:bg-indigo-500/5'}`}
                          >
                            {transport}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all">Back</button>
                    <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all group shadow-lg shadow-indigo-600/30">Last Step <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:opacity-50 ml-1 flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        Budget Preference
                      </label>
                      <div className="space-y-3">
                        {budgets.map((budget) => (
                          <button
                            key={budget}
                            onClick={() => setFormData(p => ({ ...p, budgetPreference: budget }))}
                            className={`w-full py-4 px-6 rounded-2xl text-left font-bold flex items-center justify-between transition-all border ${formData.budgetPreference === budget ? 'bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-white ring-1 ring-indigo-500' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                          >
                            {budget}
                            {formData.budgetPreference === budget && <Check className="w-5 h-5 text-indigo-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-lg hover:bg-white/10 transition-all">Back</button>
                    <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 group disabled:opacity-50">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Complete Journey <Check className="w-5 h-5 group-hover:scale-110 transition-transform" /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
