import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Globe,
  Camera,
  Save,
  Shield,
  Bell,
  Moon,
  Sun,
  MapPin,
  Plane,
  Briefcase,
  CreditCard,
  History,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  RefreshCcw,
  Train,
  Bus,
  Bike,
  Footprints,
  Car,
  Compass,
  Heart,
  Lock
} from 'lucide-react';
import { updateProfile, updateProfileImage, terminateSession, deleteAccount } from '../../services/authService';
import { getCookie, setCookie } from '../../services/cookieService';
import PasswordChangeModal from './PasswordChangeModal';
import SessionModal from './SessionModal';
import DeleteAccountModal from './DeleteAccountModal';

const countriesList = [
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
];

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-lg shadow-indigo-500/5">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-xl font-black tracking-tight leading-none mb-1.5">{title}</h3>
      <p className="text-sm opacity-40 font-medium">{description}</p>
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder, disabled, type = "text", onClick, readOnly }) => (
  <div className="space-y-2 group">
    <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 ml-1 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all pointer-events-none">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full bg-white/5 border border-[var(--glass-border)] rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-medium text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {onClick && (
        <div
          className="absolute inset-0 cursor-pointer z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
          }}
        />
      )}
    </div>
  </div>
);

const PhoneInput = ({ label, value = '', onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse the current value to get code and number
  const getInitialParts = () => {
    const val = String(value || '');
    const sortedCountries = [...countriesList].sort((a, b) => b.code.length - a.code.length);
    const country = sortedCountries.find(c => val.startsWith(c.code));

    if (country) {
      return {
        code: country.code,
        number: val.substring(country.code.length)
      };
    }
    return { code: '+91', number: val };
  };

  const { code, number } = getInitialParts();
  const selectedCountry = countriesList.find(c => c.code === code) || countriesList[2];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCodeChange = (newCode) => {
    // Force a clean string update
    const cleanNumber = String(number).replace(/[^0-9]/g, '');
    onChange(`${newCode}${cleanNumber}`);
    setIsOpen(false);
  };

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    onChange(`${code}${val}`);
  };

  return (
    <div className="space-y-2 group">
      <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30 ml-1 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all">
        {label}
      </label>
      <div className="relative flex items-stretch">
        {/* Unified Container for a more realistic look */}
        <div className="flex w-full items-stretch bg-white/5 border border-[var(--glass-border)] rounded-2xl overflow-hidden focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className={`h-full px-4 flex items-center gap-2 hover:bg-white/5 transition-all border-r border-[var(--glass-border)] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-lg leading-none">{selectedCountry.flag}</span>
              <span className="text-xs font-black opacity-60 group-focus-within:opacity-100">{selectedCountry.code}</span>
              <ChevronRight size={12} className={`opacity-40 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 top-full mt-2 w-64 max-h-64 overflow-y-auto glass border-[var(--glass-border)] rounded-2xl z-[150] p-2 custom-scrollbar shadow-2xl bg-slate-900/95 backdrop-blur-3xl"
                >
                  <div className="px-3 py-2 mb-2 border-b border-[var(--glass-border)]">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">Select Country</p>
                  </div>
                  {countriesList.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCodeChange(c.code)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all text-left group/item"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{c.flag}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black">{c.code}</span>
                          <span className="text-[10px] opacity-40 font-bold group-hover/item:opacity-100">{c.name}</span>
                        </div>
                      </div>
                      {selectedCountry.code === c.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-grow min-w-0">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 group-focus-within:text-indigo-500 transition-all">
              <Phone size={16} />
            </div>
            <input
              type="text"
              value={number}
              onChange={handleNumberChange}
              placeholder="000 000 0000"
              disabled={disabled}
              className={`w-full h-full py-4 pl-12 pr-4 bg-transparent focus:outline-none transition-all font-bold tracking-wider placeholder:opacity-20 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectOption = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${active
      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
      : 'bg-white/5 border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20 opacity-60 hover:opacity-100'
      }`}
  >
    <Icon size={18} />
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const Profile = ({ userData, setUserData, theme, toggleTheme, isModalOpen, isMobileMenuOpen }) => {
  const [formData, setFormData] = useState({ ...userData });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error'
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({ ...userData });
  }, [userData]);

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handlePreferenceChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      const storedUser = getCookie('user');
      const token = storedUser?.token || storedUser?.Token;
      const result = await updateProfileImage(file, token);
      setUserData({ ...userData, profileImageUrl: result.imageUrl });
      setPreviewImage(null);
    } catch (error) {
      console.error('Image upload failed:', error);
      setSaveStatus('error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const storedUser = getCookie('user');
      const token = storedUser?.token || storedUser?.Token;

      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        country: formData.country,
        travelType: formData.travelType,
        budgetPreference: formData.budgetPreference,
        travelStyle: formData.travelStyle,
        preferredTransport: formData.preferredTransport
      };

      const result = await updateProfile(updateData, token);
      setUserData(result);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    try {
      const storedUser = getCookie('user');
      const token = storedUser?.token || storedUser?.Token;
      await terminateSession(sessionId, token);
      
      // Update local state to reflect session removal
      setUserData({
        ...userData,
        activeSessions: userData.activeSessions.filter(s => s.id !== sessionId)
      });
    } catch (error) {
      console.error('Failed to terminate session:', error);
    }
  };

  const handleDeleteAccount = async (reason) => {
    try {
      const storedUser = getCookie('user');
      const token = storedUser?.token || storedUser?.Token;
      
      // Call API
      await deleteAccount(token);
      
      // Log deletion reason (demo)
      console.log('Account deleted. Reason:', reason);
      
      // Clear all local data
      document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'dashboard_active_tab=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Redirect to Auth
      window.location.href = '/auth';
    } catch (error) {
      console.error('Failed to delete account:', error);
      setSaveStatus('error');
    }
  };

  const resetAIData = () => {
    setFormData({
      ...formData,
      travelType: 'Solo',
      budgetPreference: 'Medium',
      travelStyle: 'Adventure',
      preferredTransport: 'Flight'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto pb-32 px-4"
    >
      {/* 1. Profile Identity Hero */}
      <div className="relative mb-8 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent blur-3xl -z-10" />
        <div className="glass p-6 md:p-8 border-[var(--glass-border)] relative flex flex-col md:flex-row items-center gap-6 overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />

          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] p-0.5 shadow-xl relative group/avatar transition-transform duration-500">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 relative">
                {(previewImage || userData?.profileImageUrl) ? (
                  <img src={previewImage || userData.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-500/10"><User className="text-indigo-500" size={32} /></div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
              >
                <Camera size={14} />
              </button>
              <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
            </div>
          </div>

          <div className="text-center md:text-left flex-grow">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1.5">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">{userData?.fullName || ''}</h1>
              <span className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] self-center md:self-auto">Pro</span>
            </div>
            <p className="text-base opacity-40 font-medium mb-4">{userData?.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-indigo-400" /> {userData?.country || 'Global Explorer'}
              </div>
              <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-[var(--glass-border)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} className="text-purple-400" /> {userData?.travelType || 'Solo'}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-1 pr-2">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Strength</p>
            <div className="text-2xl font-black text-indigo-500">85%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. Identity & Contact Section */}
        <div className="lg:col-span-12 xl:col-span-5">
          <div className="glass p-8 md:p-10 rounded-[3rem] border-[var(--glass-border)] h-full">
            <SectionHeader icon={User} title="Personal Identity" description="Basic information and contact details." />
            <div className="space-y-6">
              <InputField label="Full Name" icon={User} value={formData.fullName} onChange={(e) => handleInputChange(e, 'fullName')} />
              <InputField label="Email Address" icon={Mail} value={formData.email} disabled />
              <PhoneInput label="Phone Number" value={formData.phoneNumber} onChange={(value) => handleInputChange({ target: { value } }, 'phoneNumber')} />
              <InputField label="Country / Location" icon={MapPin} value={formData.country} onChange={(e) => handleInputChange(e, 'country')} />
              <InputField
                label="Security"
                icon={Lock}
                value="••••••••"
                type="password"
                readOnly
                onClick={() => setIsPasswordModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* 3. AI Travel DNA Section (The Highlight) */}
        <div className="lg:col-span-12 xl:col-span-7">
          <div className="glass p-8 md:p-10 rounded-[3rem] border-[var(--glass-border)] h-full relative overflow-hidden group/dna">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full -mr-48 -mt-48 blur-[100px]" />

            <SectionHeader icon={Sparkles} title="AI Travel DNA" description="Configure your personalized recommendation engine." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-purple-400" />
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">Travel Companions</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Solo', 'Family', 'Friends', 'Couple'].map(type => (
                    <SelectOption key={type} icon={type === 'Solo' ? User : type === 'Family' ? Briefcase : History} label={type} active={formData.travelType === type} onClick={() => handlePreferenceChange('travelType', type)} />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-purple-400" />
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">Budget Range</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Low', 'Medium', 'High'].map(budget => (
                    <SelectOption key={budget} icon={CreditCard} label={budget} active={formData.budgetPreference === budget} onClick={() => handlePreferenceChange('budgetPreference', budget)} />
                  ))}
                </div>
              </div>

              <div className="space-y-6 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-purple-400" />
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">Travel Style</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Adventure', icon: Compass },
                    { label: 'Relaxing', icon: Sun },
                    { label: 'Cultural', icon: Globe },
                    { label: 'Luxury', icon: Heart },
                    { label: 'Business', icon: Briefcase }
                  ].map(style => (
                    <SelectOption
                      key={style.label}
                      icon={style.icon}
                      label={style.label}
                      active={formData.travelStyle === style.label}
                      onClick={() => handlePreferenceChange('travelStyle', style.label)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Plane size={14} className="text-purple-400" />
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-30">Preferred Transport</label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Flight', 'Train', 'Bus', 'Bike', 'Walking', 'Car'].map(transport => (
                    <SelectOption
                      key={transport}
                      icon={
                        transport === 'Flight' ? Plane :
                          transport === 'Train' ? Train :
                            transport === 'Bus' ? Bus :
                              transport === 'Bike' ? Bike :
                                transport === 'Walking' ? Footprints :
                                  Car
                      }
                      label={transport}
                      active={formData.preferredTransport === transport}
                      onClick={() => handlePreferenceChange('preferredTransport', transport)}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Experience & App Settings */}
        <div className="lg:col-span-12 xl:col-span-6">
          <div className="glass p-8 md:p-10 rounded-[3rem] border-[var(--glass-border)] h-full">
            <SectionHeader icon={Bell} title="Experience" description="Manage your application interface." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[2.5rem] bg-white/5 border border-[var(--glass-border)] flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">{theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}</div>
                  <span className="text-sm font-black tracking-tight">Dark Mode</span>
                </div>
                <button onClick={toggleTheme} className="w-12 h-6 rounded-full bg-white/10 relative p-1 transition-all"><motion.div animate={{ x: theme === 'dark' ? 24 : 0 }} className="w-4 h-4 bg-indigo-500 rounded-full" /></button>
              </div>
              <div className="p-6 rounded-[2.5rem] bg-white/5 border border-[var(--glass-border)] flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500"><Bell size={22} /></div>
                  <span className="text-sm font-black tracking-tight">Alerts</span>
                </div>
                <div className="w-12 h-6 rounded-full bg-indigo-500/20 relative p-1 transition-all cursor-pointer"><div className="w-4 h-4 bg-indigo-500 rounded-full translate-x-6" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Security & Privacy */}
        <div className="lg:col-span-12 xl:col-span-6">
          <div className="glass p-8 md:p-10 rounded-[3rem] border-[var(--glass-border)] h-full">
            <SectionHeader icon={Shield} title="Security" description="Keep your account and data safe." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 transition-all group text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 group-hover:rotate-12 transition-transform"><Shield size={22} /></div>
                  <span className="text-sm font-black tracking-tight">Password</span>
                </div>
                <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
              </button>
              <button 
                onClick={() => setIsSessionModalOpen(true)}
                className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-[var(--glass-border)] hover:bg-white/10 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:rotate-12 transition-transform"><History size={22} /></div>
                  <span className="text-sm font-black tracking-tight">Sessions</span>
                </div>
                <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* 6. Danger Zone */}
        <div className="lg:col-span-12">
          <div className="glass p-8 md:p-10 rounded-[3rem] border-rose-500/20 bg-rose-500/5 h-full relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mb-32 blur-[80px]" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 shadow-lg shadow-rose-500/5">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight leading-none mb-1.5 text-rose-500">Danger Zone</h3>
                  <p className="text-sm opacity-40 font-medium">Permanently delete your account and all associated data.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Floating Action Bar */}
      <AnimatePresence>
        {(!isModalOpen && !isMobileMenuOpen) && (
          <motion.div
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-10 left-1/2 z-[50] w-fit max-w-md"
          >
            <div className="glass p-2.5 rounded-[2.5rem] border-white/20 bg-indigo-600/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-between gap-4">
              <div className="pl-6 hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5 leading-none">Status</p>
                <p className="text-xs font-black text-indigo-400">Ready to Sync</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isSaving}
                className={`px-12 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isSaving ? 'bg-white/10 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30'
                  }`}
              >
                {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'Syncing...' : 'Save All Changes'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Success Feedback */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-32 left-1/2 -translate-x-1/2 px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 z-[200] backdrop-blur-3xl border ${saveStatus === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'}`}>
            {saveStatus === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span className="font-black text-xs uppercase tracking-widest leading-none">{saveStatus === 'success' ? 'Profile Synced Successfully!' : 'Sync Failed. Please check connection.'}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userEmail={userData?.email}
        userName={userData?.fullName}
        token={getCookie('user')?.token || getCookie('user')?.Token}
      />
      <SessionModal 
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        activeSessions={userData?.activeSessions || []}
        onLogoutSession={handleLogoutSession}
      />
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        userEmail={userData?.email}
      />
    </motion.div>
  );
};

export default Profile;
