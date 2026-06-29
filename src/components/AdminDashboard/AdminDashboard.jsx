import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Briefcase,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ArrowLeft,
  X,
  Menu,
  Activity,
  Bell,
  Search,
  Database,
  Cpu,
  Check,
  AlertCircle,
  Trash2,
  ShieldAlert,
  Globe,
  RefreshCw,
  FileText,
  Send,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Lock,
  Eye,
  Settings2,
  Calendar,
  Layers,
  Moon,
  Sun,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCookie, deleteCookie } from '../../services/cookieService';
import { getAllUsers, toggleUserStatus as toggleStatusApi, toggleUserRole as toggleRoleApi, getAllTrips, getTripDetails, getAllLostItems, sendAdminManualNotification, getOverviewStats, sendGlobalBroadcast } from '../../services/adminService';

// Subcomponents for Admin Dashboard tabs
const StatCard = ({ icon: Icon, title, value, change, changeType, detail, color = "indigo" }) => {
  const colorMap = {
    indigo: "from-indigo-50 dark:from-indigo-500/20 to-purple-50/50 dark:to-purple-500/5 hover:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/10",
    rose: "from-rose-50 dark:from-rose-500/20 to-pink-50/50 dark:to-pink-500/5 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/10",
    emerald: "from-emerald-50 dark:from-emerald-500/20 to-teal-50/50 dark:to-teal-500/5 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/10",
    amber: "from-amber-50 dark:from-amber-500/20 to-orange-50/50 dark:to-orange-500/5 hover:border-amber-500/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/10",
  };

  const badgeColor = changeType === "positive" 
    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-transparent" 
    : "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-transparent";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      className={`rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br ${colorMap[color]} border transition-all duration-300 shadow-md dark:shadow-none`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] blur-3xl rounded-full -mr-12 -mt-12" />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm dark:shadow-none`}>
          <Icon className="w-5 h-5" />
        </div>
        {change && (
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${badgeColor}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400/60 mb-1">{title}</p>
      <h3 className="text-3xl font-black tracking-tight mb-2 text-slate-800 dark:text-white">{value}</h3>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400/60 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {detail}
      </p>
    </motion.div>
  );
};

const AdminDashboard = ({ theme, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  
  // Overview stats states
  const [overviewStats, setOverviewStats] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState(null);
  
  // Global Broadcaster state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('SystemAlert');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Database User DB Management
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Database Trips Monitor state
  const [tripsList, setTripsList] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState(null);

  // Detailed Trip view state
  const [selectedDetailedTrip, setSelectedDetailedTrip] = useState(null);
  const [detailedTripLoading, setDetailedTripLoading] = useState(false);
  const [detailedTripError, setDetailedTripError] = useState(null);
  const [showDetailedTripModal, setShowDetailedTripModal] = useState(false);

  // Lost Items real DB state
  const [lostItemsData, setLostItemsData] = useState([]);
  const [lostItemsLoading, setLostItemsLoading] = useState(false);
  const [lostItemsError, setLostItemsError] = useState(null);
  const [selectedLostItemsUser, setSelectedLostItemsUser] = useState(null);

  // Detailed manual notification states
  const [notificationTrigger, setNotificationTrigger] = useState('TripStart');
  const [notificationActivity, setNotificationActivity] = useState('');
  const [isSendingManualNotification, setIsSendingManualNotification] = useState(false);
  const [manualNotificationSuccess, setManualNotificationSuccess] = useState('');
  const [manualNotificationError, setManualNotificationError] = useState('');
  const [showManualNotificationConsole, setShowManualNotificationConsole] = useState(false);
  const [notificationCustomMessage, setNotificationCustomMessage] = useState('');

  const getActivitiesFromItinerary = () => {
    if (!selectedDetailedTrip || !selectedDetailedTrip.aiPlanJson) return [];
    try {
      const parsed = JSON.parse(selectedDetailedTrip.aiPlanJson);
      const itinerary = parsed.itinerary || [];
      const activities = [];
      itinerary.forEach(day => {
        if (day.activities) {
          day.activities.forEach(act => {
            const name = act.activity || act.name;
            if (name) activities.push(name);
          });
        }
      });
      return [...new Set(activities)]; // return unique activity names
    } catch (e) {
      console.error("Error parsing itinerary activities:", e);
      return [];
    }
  };

  const handleSendManualNotification = async (tripId) => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) {
      setManualNotificationError("No authentication token found.");
      return;
    }

    setIsSendingManualNotification(true);
    setManualNotificationSuccess('');
    setManualNotificationError('');

    try {
      const result = await sendAdminManualNotification(
        tripId,
        notificationTrigger,
        notificationTrigger === 'ActivityStart' ? notificationActivity : null,
        notificationCustomMessage.trim() || null,
        userCookie.token
      );
      setManualNotificationSuccess(`Notification successfully generated and sent! AI Message: "${result.aiMessage}"`);
      setNotificationCustomMessage(''); // Clear custom message override on success
      // Automatically reset success message after 6 seconds
      setTimeout(() => setManualNotificationSuccess(''), 6000);
    } catch (err) {
      console.error("Error sending manual notification:", err);
      setManualNotificationError(err.message || "Failed to dispatch system notification.");
    } finally {
      setIsSendingManualNotification(false);
    }
  };

  const handleViewTripDetails = async (tripId) => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    setDetailedTripLoading(true);
    setDetailedTripError(null);
    setActiveTab('trip-detail');
    setSelectedDetailedTrip(null);

    try {
      const details = await getTripDetails(tripId, userCookie.token);
      setSelectedDetailedTrip(details);
    } catch (err) {
      console.error("Error loading trip details:", err);
      setDetailedTripError(err.message || "Failed to load detailed trip audit logs.");
    } finally {
      setDetailedTripLoading(false);
    }
  };

  const closeDetailedTripModal = () => {
    setShowDetailedTripModal(false);
    setSelectedDetailedTrip(null);
    setDetailedTripError(null);
  };

  const handleBackToTrips = () => {
    setActiveTab('trips');
    setSelectedDetailedTrip(null);
    setDetailedTripError(null);
  };

  const fetchLostItems = async () => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;
    setLostItemsLoading(true);
    setLostItemsError(null);
    try {
      const data = await getAllLostItems(userCookie.token);
      const mapped = data.map(item => ({
        id: item.Id ?? item.id,
        tripId: item.TripId ?? item.tripId,
        userId: item.UserId ?? item.userId,
        itemName: item.ItemName ?? item.itemName ?? '',
        predictedLocation: item.PredictedLocation ?? item.predictedLocation ?? '',
        reason: item.Reason ?? item.reason ?? '',
        isRecovered: item.IsRecovered ?? item.isRecovered ?? false,
        recoveredFrom: item.RecoveredFrom ?? item.recoveredFrom ?? null,
        createdAt: item.CreatedAt ?? item.createdAt ?? '',
        tripDestination: item.TripDestination ?? item.tripDestination ?? 'Unknown Trip',
        userFullName: item.UserFullName ?? item.userFullName ?? 'Unknown',
        userEmail: item.UserEmail ?? item.userEmail ?? '',
        userProfileImageUrl: item.UserProfileImageUrl ?? item.userProfileImageUrl ?? null,
      }));
      setLostItemsData(mapped);
    } catch (err) {
      console.error('Failed to load lost items:', err);
      setLostItemsError(err.message || 'Failed to load lost items.');
    } finally {
      setLostItemsLoading(false);
    }
  };

  // Mock AI logs stream
  const [aiLogs, setAiLogs] = useState([
    { timestamp: "08:42:15", type: "Lost Item Prediction", prompt: "Predict lost MacBook based on trip logs...", status: "Success", duration: "182ms" },
    { timestamp: "08:35:02", type: "Itinerary Structuring", prompt: "Generate 7-day sustainable itinerary in Tokyo...", status: "Success", duration: "512ms" },
    { timestamp: "08:12:44", type: "Budget Estimation", prompt: "Estimate daily budget in Paris for solo traveler...", status: "Success", duration: "142ms" },
    { timestamp: "07:58:19", type: "Omissions Analysis", prompt: "Analyze missing packing items for Rome winter...", status: "Cached", duration: "12ms" }
  ]);

  const fetchOverviewStats = async () => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    setOverviewLoading(true);
    setOverviewError(null);
    try {
      const stats = await getOverviewStats(userCookie.token);
      setOverviewStats(stats);
      if (stats.recentActivities && stats.recentActivities.length > 0) {
        const formattedLogs = stats.recentActivities.map(act => ({
          timestamp: act.timestamp,
          type: act.type,
          prompt: act.detail,
          status: act.status,
          duration: act.duration || "142ms"
        }));
        setAiLogs(formattedLogs);
      }
    } catch (err) {
      console.error("Failed to load overview stats:", err);
      setOverviewError(err.message || "Failed to load system dashboard analytics.");
    } finally {
      setOverviewLoading(false);
    }
  };

  const navigate = useNavigate();

  useEffect(() => {
    const user = getCookie('user');
    if (!user) {
      navigate('/auth');
      return;
    }
    const role = user.role || user.Role;
    if (role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    setAdminUser(user);
  }, [navigate]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    deleteCookie('user');
    document.cookie = 'dashboard_active_tab=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    navigate('/auth');
  };

  const fetchUsers = async () => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await getAllUsers(userCookie.token);
      const mappedUsers = data.map(u => ({
        id: u.id ?? u.Id,
        fullName: u.fullName ?? u.FullName,
        email: u.email ?? u.Email,
        role: u.role ?? u.Role,
        status: u.status ?? u.Status,
        tripsCount: u.tripsCount ?? u.TripsCount ?? 0,
        joined: u.joined ?? u.Joined ?? "",
        profileImageUrl: u.profileImageUrl ?? u.ProfileImageUrl ?? null
      }));
      setUsersList(mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsersError(err.message || "Failed to load user directory.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverviewStats();
    }
  }, [activeTab]);

  const fetchTrips = async () => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    setTripsLoading(true);
    setTripsError(null);
    try {
      const data = await getAllTrips(userCookie.token);
      const mappedTrips = data.map(t => {
        let durationStr = "Flexible";
        if (t.StartDate && t.EndDate) {
          const start = new Date(t.StartDate);
          const end = new Date(t.EndDate);
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
          durationStr = `${diffDays} ${diffDays === 1 ? 'Day' : 'Days'}`;
        }
        return {
          id: t.Id ?? t.id,
          destination: t.Destination ?? t.destination ?? "Unknown",
          starting: t.Starting ?? t.starting ?? "Flexible",
          travelers: t.Travelers ?? t.travelers ?? 1,
          duration: durationStr,
          aiPlan: t.AiPlan ?? t.aiPlan ?? "Generating",
          status: t.Status ?? t.status ?? "Planned",
          user: t.UserEmail ?? t.userEmail ?? "Unknown"
        };
      });
      setTripsList(mappedTrips);
    } catch (err) {
      console.error("Failed to load trips:", err);
      setTripsError(err.message || "Failed to load trips monitor.");
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'trips') {
      fetchTrips();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'lost-items') {
      fetchLostItems();
      setSelectedLostItemsUser(null);
    }
  }, [activeTab]);

  const toggleUserStatus = async (id) => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    try {
      const result = await toggleStatusApi(id, userCookie.token);
      setUsersList(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, status: result.status };
        }
        return user;
      }));
    } catch (err) {
      alert(err.message || "Failed to toggle user status.");
    }
  };

  const toggleUserRole = async (id) => {
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) return;

    try {
      const result = await toggleRoleApi(id, userCookie.token);
      setUsersList(prev => prev.map(user => {
        if (user.id === id) {
          return { ...user, role: result.role };
        }
        return user;
      }));
    } catch (err) {
      alert(err.message || "Failed to toggle user role.");
    }
  };

  const handleGlobalBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      setBroadcastResult({ type: 'error', message: 'Please enter a message to broadcast.' });
      return;
    }
    const userCookie = getCookie('user');
    if (!userCookie || !userCookie.token) {
      setBroadcastResult({ type: 'error', message: 'Not authenticated.' });
      return;
    }
    setIsBroadcasting(true);
    setBroadcastResult(null);
    try {
      const result = await sendGlobalBroadcast(broadcastMessage.trim(), broadcastType, userCookie.token);
      setBroadcastResult({ type: 'success', message: result.message, sentCount: result.sentCount });
      setBroadcastMessage('');
      setTimeout(() => setBroadcastResult(null), 6000);
    } catch (err) {
      setBroadcastResult({ type: 'error', message: err.message || 'Broadcast failed.' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleResolveItem = (id) => {
    setLostItemsList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Recovered' ? 'Searching' : 'Recovered' };
      }
      return item;
    }));
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: Users, label: 'User Directory', id: 'users' },
    { icon: Briefcase, label: 'Trips Monitor', id: 'trips' },
    { icon: Package, label: 'Lost Items AI', id: 'lost-items' },
    { icon: FileText, label: 'System Logs', id: 'logs' },
    { icon: Settings2, label: 'Settings', id: 'settings' }
  ];

  return (
    <div className="min-h-screen relative flex bg-slate-50 dark:bg-[#09090b] text-slate-800 dark:text-white transition-colors duration-500 overflow-hidden font-sans">
      {/* Visual background enhancements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-violet-600/5 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Sidebar Component */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '80px' : '280px',
          x: mobileOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 border-r border-slate-200 dark:border-white/5 flex flex-col p-4 bg-white/95 dark:bg-[#09090b]/80 backdrop-blur-3xl lg:translate-x-0 transition-colors duration-500 ${mobileOpen ? 'w-[280px] shadow-2xl' : ''}`}
      >
        <div className="flex items-center justify-between mb-10 px-2 mt-2">
          {(!collapsed || mobileOpen) && (
            <motion.div
              layoutId="main-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl font-black italic tracking-tight text-slate-800 dark:text-white">YuGo</span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-600/10 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full">Admin</span>
            </motion.div>
          )}
          
          <button
            onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all ml-auto lg:flex hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronLeft className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} size={18} />
          </button>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all ml-auto lg:hidden flex text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Items */}
        <div className="flex flex-col gap-2 flex-grow overflow-y-auto pr-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const active = activeTab === item.id || (item.id === 'trips' && activeTab === 'trip-detail');
            return (
              <motion.button
                key={idx}
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveTab(item.id);
                  if (mobileOpen) setMobileOpen(false);
                }}
                className={`flex items-center rounded-2xl cursor-pointer transition-all duration-300 ${
                  collapsed && !mobileOpen ? 'justify-center w-12 h-12 mx-auto px-0' : 'px-4 py-3.5 gap-4 w-full'
                } ${active
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 dark:shadow-rose-600/30 font-black'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={collapsed && !mobileOpen ? 20 : 18} />
                {(!collapsed || mobileOpen) && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Logout item */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-auto">
          <motion.button
            whileHover={{ x: collapsed ? 0 : 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`flex items-center rounded-2xl cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-500 transition-all duration-300 ${
              collapsed && !mobileOpen ? 'justify-center w-12 h-12 mx-auto px-0' : 'px-4 py-3.5 gap-4 w-full'
            }`}
          >
            <LogOut size={18} />
            {(!collapsed || mobileOpen) && <span className="font-semibold text-sm tracking-wide">Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-slate-50/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between transition-colors duration-500 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white capitalize">
              {activeTab === 'trip-detail' ? 'Trip Audit Inspector' : `${activeTab.replace('-', ' ')} Panel`}
            </h1>
          </div>

          {/* Dynamic Center Brand Name */}
          <AnimatePresence mode="wait">
            {collapsed && (
              <motion.div
                layoutId="main-logo"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 z-50"
              >
                <span className="text-2xl font-black italic tracking-tight text-slate-800 dark:text-white">YuGo</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-600/10 text-rose-600 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20 px-2 py-0.5 rounded-full">Admin</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications Alert Mock */}
            <button className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative cursor-pointer">
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              <Bell size={18} />
            </button>

            {/* Admin Profile Details */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-black text-slate-800 dark:text-white">{adminUser?.fullName || 'Admin User'}</p>
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest">System Overseer</p>
              </div>
              <div className="w-10 h-10 rounded-xl border border-rose-500/30 overflow-hidden bg-gradient-to-tr from-rose-500 to-violet-500 flex items-center justify-center font-black text-white">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="relative bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center"
              onClick={e => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
                <LogOut className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sign Out?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-7">
                You'll be signed out of the admin console. Any unsaved changes will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content body */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      icon={Users}
                      title="Total Explorers"
                      value={overviewStats ? overviewStats.totalUsers.toLocaleString() : (overviewLoading ? "..." : "1,284")}
                      change={overviewStats ? `+${Math.round((overviewStats.usersThisWeek / Math.max(1, overviewStats.totalUsers - overviewStats.usersThisWeek)) * 100)}%` : "+12.4%"}
                      changeType="positive"
                      detail={overviewStats ? `${overviewStats.usersThisWeek} signed up this week` : "128 signed up this week"}
                      color="indigo"
                    />
                    <StatCard
                      icon={Briefcase}
                      title="Active Trip Plans"
                      value={overviewStats ? overviewStats.totalTrips.toLocaleString() : (overviewLoading ? "..." : "3,452")}
                      change={overviewStats ? `+${Math.round((overviewStats.tripsThisMonth / Math.max(1, overviewStats.totalTrips - overviewStats.tripsThisMonth)) * 100)}%` : "+24.8%"}
                      changeType="positive"
                      detail={overviewStats ? `${overviewStats.tripsThisMonth} itineraries built this month` : "340 itineraries built this month"}
                      color="rose"
                    />
                    <StatCard
                      icon={Package}
                      title="Lost Items AI Recoveries"
                      value={overviewStats ? `${overviewStats.recoveryRate}%` : (overviewLoading ? "..." : "94.2%")}
                      change={overviewStats ? `${overviewStats.recoveredLostItems} / ${overviewStats.totalLostItems}` : "+4.1%"}
                      changeType="positive"
                      detail={overviewStats ? `${overviewStats.totalLostItems} total items analyzed` : "518 total items analyzed"}
                      color="emerald"
                    />
                    <StatCard
                      icon={Bell}
                      title="AI Alerts Dispatched"
                      value={overviewStats ? overviewStats.totalNotifications.toLocaleString() : (overviewLoading ? "..." : "182")}
                      change="Live Feed"
                      changeType="positive"
                      detail={overviewStats ? `${overviewStats.totalNotifications} notifications active` : "Real-time updates"}
                      color="amber"
                    />
                  </div>

                  {/* Middle Section: Broadcaster and Logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Global Announce Broadcaster */}
                    <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] p-6 lg:col-span-1 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
                          <Globe className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black tracking-tight text-slate-800 dark:text-white">Global Announce</h3>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Broadcast to all users in real-time</p>
                        </div>
                      </div>

                      {/* Live DB stats context */}
                      <div className="grid grid-cols-3 gap-2 mb-5">
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                            {overviewStats ? overviewStats.totalUsers : '—'}
                          </div>
                          <div className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">Total Users</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {overviewStats ? overviewStats.inProgressTrips : '—'}
                          </div>
                          <div className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">Live Trips</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                          <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                            {overviewStats ? overviewStats.totalNotifications : '—'}
                          </div>
                          <div className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mt-0.5">Alerts Sent</div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {broadcastResult && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className={`p-4 rounded-2xl mb-4 text-xs font-bold border ${
                              broadcastResult.type === 'success'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {broadcastResult.type === 'success' && (
                              <span className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5" />
                                {broadcastResult.message}
                              </span>
                            )}
                            {broadcastResult.type === 'error' && (
                              <span className="flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {broadcastResult.message}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleGlobalBroadcast} className="space-y-4 flex-1 flex flex-col">
                        <div>
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Alert Type</label>
                          <select
                            value={broadcastType}
                            onChange={(e) => setBroadcastType(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-rose-500/50 transition-all text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            <option value="SystemAlert" className="bg-white dark:bg-[#09090b]">🔔 System Alert</option>
                            <option value="TripStart" className="bg-white dark:bg-[#09090b]">✈️ Trip Update</option>
                            <option value="Maintenance" className="bg-white dark:bg-[#09090b]">🔧 Maintenance</option>
                            <option value="Promo" className="bg-white dark:bg-[#09090b]">🎉 Campaign / Promo</option>
                            <option value="Security" className="bg-white dark:bg-[#09090b]">🛡️ Security Warning</option>
                          </select>
                        </div>

                        <div className="flex-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">Message</label>
                          <textarea
                            value={broadcastMessage}
                            onChange={(e) => setBroadcastMessage(e.target.value)}
                            rows="5"
                            placeholder="Type your announcement message here..."
                            className="w-full h-full min-h-[110px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-500/50 transition-all text-sm font-medium text-slate-800 dark:text-white resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isBroadcasting || !broadcastMessage.trim()}
                          className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                        >
                          {isBroadcasting ? (
                            <><RefreshCw size={14} className="animate-spin" /> Broadcasting...</>
                          ) : (
                            <><Send size={14} /> Broadcast to All Users</>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* AI Predictor Stream Logger */}
                    <div className="bg-white dark:bg-white/[0.01] rounded-[2rem] p-6 lg:col-span-2 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-500">
                              <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black tracking-tight text-slate-800 dark:text-white">Live AI Query logs</h3>
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Real-time LLM reasoning stream</p>
                            </div>
                          </div>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-[10px] font-black text-indigo-500 dark:text-indigo-400">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Live Syncing
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {aiLogs.map((log, index) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              key={index}
                              className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-bold text-slate-400 dark:text-slate-500 font-mono mt-0.5">{log.timestamp}</span>
                                <div>
                                  <div className="font-black text-slate-800 dark:text-slate-200">{log.type}</div>
                                  <p className="text-slate-600 dark:text-slate-400 font-medium italic truncate max-w-sm sm:max-w-md mt-0.5">"{log.prompt}"</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                }`}>
                                  {log.status}
                                </span>
                                <span className="font-mono text-slate-500 dark:text-slate-400 font-bold">{log.duration}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-xs border-t border-slate-100 dark:border-white/5 pt-4">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Tracking API endpoints: <strong>8 registered</strong></span>
                        <button
                          onClick={fetchOverviewStats}
                          className="text-indigo-600 dark:text-indigo-400 font-black hover:underline hover:text-indigo-500 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${overviewLoading ? 'animate-spin' : ''}`} /> Force Refresh Logs
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visual charts display panel */}
                  <div className="bg-white dark:bg-[#09090b]/80 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none bg-gradient-to-r from-purple-500/5 to-indigo-500/5 dark:from-purple-900/10 dark:to-indigo-900/10 animate-fade-in">
                    <h3 className="font-black tracking-tight text-slate-800 dark:text-white mb-4">API Utilization & Analytics Dashboard</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-2">
                      <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 mb-1">Gemini API Requests</div>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                          {overviewStats ? (overviewStats.totalTrips * 12).toLocaleString() : "41,208"}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">99.8% Success</div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 mb-1">Maps Geo API Calls</div>
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                          {overviewStats ? (overviewStats.totalTrips * 4).toLocaleString() : "12,891"}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">99.9% Success</div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 mb-1">Dapper Transaction Pool</div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {overviewStats ? overviewStats.dapperTransactions.toLocaleString() : "221,402"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1">4ms Avg Pool Wait</div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="text-[10px] font-black uppercase text-slate-505 dark:text-slate-400 mb-1">Cloudinary Storage</div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                          {overviewStats ? `${(overviewStats.totalUsers * 3.2 / 1024).toFixed(2)} GB` : "4.2 GB"}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-500 font-bold mt-1">84% Capacity Free</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: USERS DIRECTORY */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-black tracking-tight text-slate-800 dark:text-white">Registered User Directory</h3>
                        <p className="text-[10px] font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide">Manage authorization, access privileges, and user status</p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search users..."
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm font-medium outline-none focus:border-rose-500/50 w-full sm:w-64 text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                    {usersLoading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Fetching live database accounts...</p>
                      </div>
                    ) : usersError ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                        <h4 className="font-black text-slate-800 dark:text-white mb-2">Connection Issue</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{usersError}</p>
                        <button
                          onClick={fetchUsers}
                          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          Retry Fetching
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                              <th className="py-4 px-4">User</th>
                              <th className="py-4 px-4">Role</th>
                              <th className="py-4 px-4">Status</th>
                              <th className="py-4 px-4">Trips Created</th>
                              <th className="py-4 px-4">Joined Date</th>
                              <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                            {usersList
                              .filter(user => 
                                (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors text-sm text-slate-700 dark:text-slate-300">
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                      {user.profileImageUrl ? (
                                        <img 
                                          src={user.profileImageUrl.startsWith('http') ? user.profileImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}${user.profileImageUrl}`} 
                                          alt={user.fullName} 
                                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-white/10 shadow-sm" 
                                        />
                                      ) : (
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-black ${
                                          user.role === 'Admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                          {user.fullName.substring(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{user.fullName}</div>
                                        <div className="text-xs text-slate-550 dark:text-slate-500">{user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                      user.role === 'Admin' 
                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                        : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                                    }`}>
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                      user.status === 'Active' 
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'
                                    }`}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{user.tripsCount}</td>
                                  <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{user.joined}</td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => toggleUserRole(user.id)}
                                        title="Toggle Role"
                                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                                      >
                                        <ShieldAlert size={14} />
                                      </button>
                                      <button
                                        onClick={() => toggleUserStatus(user.id)}
                                        disabled={user.role === 'Admin'}
                                        title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                        className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer ${
                                          user.role === 'Admin' ? 'opacity-30 cursor-not-allowed' : 'text-rose-500 hover:text-rose-400'
                                        }`}
                                      >
                                        <AlertCircle size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TRIPS MONITOR */}
              {activeTab === 'trips' && (
                <div className="space-y-6">                  <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-black tracking-tight text-slate-800 dark:text-white">System Active Trips Monitor</h3>
                        <p className="text-[10px] font-bold text-slate-505 dark:text-slate-400 uppercase tracking-wide">Audit and monitor traveler itineraries, plans, and checklist logs</p>
                      </div>
                    </div>

                    {tripsLoading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Fetching live database trip plans...</p>
                      </div>
                    ) : tripsError ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                        <h4 className="font-black text-slate-800 dark:text-white mb-2">Connection Issue</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{tripsError}</p>
                        <button
                          onClick={fetchTrips}
                          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          Retry Fetching
                        </button>
                      </div>
                    ) : tripsList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Briefcase className="w-12 h-12 text-indigo-500 mb-4 animate-bounce" />
                        <h4 className="font-black text-slate-800 dark:text-white mb-2">No Travel Plans Active</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm">No travelers have created itineraries in the system yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tripsList.map((trip) => (
                          <div key={trip.id} className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl relative overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-none animate-fade-in">
                            <div className="absolute top-0 right-0 p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                trip.status === 'In Progress' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' : 
                                (trip.status === 'Planned' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' : 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20')
                              }`}>
                                {trip.status}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-rose-500" />
                                <h4 className="font-black text-lg text-slate-800 dark:text-slate-100">{trip.destination}</h4>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                                Belongs to: <span className="font-bold text-indigo-600 dark:text-indigo-400">{trip.user}</span>
                              </p>

                              <div className="grid grid-cols-3 gap-2 text-center text-xs py-3 border-t border-b border-slate-200/60 dark:border-white/5 my-4 bg-white dark:bg-black/20 rounded-2xl p-2 shadow-sm dark:shadow-none">
                                <div>
                                  <p className="text-[9px] font-black uppercase text-slate-500">Starting Point</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 truncate">{trip.starting.split(',')[0]}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase text-slate-500">Travelers</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{trip.travelers} Guests</p>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase text-slate-500">AI Plan Status</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> {trip.aiPlan}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-slate-200/40 dark:border-white/5">
                              <span className="text-slate-500 font-mono font-bold">Trip ID: #{trip.id}</span>
                              <button
                                onClick={() => handleViewTripDetails(trip.id)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer"
                              >
                                <Eye size={12} /> Inspect Trip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: LOST ITEMS AI */}
              {activeTab === 'lost-items' && (
                <div className="space-y-6 animate-fade-in">

                  {selectedLostItemsUser ? (
                    /* ── USER DETAIL SCREEN ── */
                    <div className="space-y-6">
                      {/* Back Nav */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
                        <button
                          onClick={() => setSelectedLostItemsUser(null)}
                          className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <ArrowLeft size={16} /> Back to Users
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {lostItemsData.filter(i => i.userId === selectedLostItemsUser.userId).length} lost item(s)
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                            lostItemsData.filter(i => i.userId === selectedLostItemsUser.userId).every(i => i.isRecovered)
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {lostItemsData.filter(i => i.userId === selectedLostItemsUser.userId).every(i => i.isRecovered) ? 'All Recovered' : 'Searching'}
                          </span>
                        </div>
                      </div>

                      {/* User Identity Banner */}
                      <div className="p-6 rounded-[2.5rem] bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xl shadow-rose-500/10 flex items-center gap-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-white/[0.03] blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                        {selectedLostItemsUser.profileImageUrl ? (
                          <img
                            src={selectedLostItemsUser.profileImageUrl.startsWith('http') ? selectedLostItemsUser.profileImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}${selectedLostItemsUser.profileImageUrl}`}
                            alt={selectedLostItemsUser.userFullName}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-black text-2xl shrink-0 border-2 border-white/20">
                            {selectedLostItemsUser.userFullName?.substring(0, 2).toUpperCase() || 'TU'}
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-100 opacity-80 block mb-0.5">Traveler Profile</span>
                          <h3 className="text-2xl font-black">{selectedLostItemsUser.userFullName}</h3>
                          <p className="text-sm text-rose-100 font-medium">{selectedLostItemsUser.userEmail}</p>
                        </div>
                      </div>

                      {/* Lost Items List */}
                      <div className="space-y-4">
                        {lostItemsData
                          .filter(item => item.userId === selectedLostItemsUser.userId)
                          .map((item) => (
                            <div key={item.id} className="p-6 bg-white dark:bg-[#09090b]/80 border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm animate-fade-in">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.isRecovered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                      <Package size={15} />
                                    </div>
                                    <h4 className="font-black text-base text-slate-800 dark:text-slate-100">{item.itemName}</h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                      item.isRecovered
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
                                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
                                    }`}>
                                      {item.isRecovered ? '✓ Recovered' : '⚠ Searching'}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3">
                                    Trip: <span className="text-indigo-600 dark:text-indigo-400">{item.tripDestination}</span>
                                    {item.createdAt && <span className="ml-2 font-mono text-slate-400">· {item.createdAt.split('T')[0]}</span>}
                                  </p>

                                  <div className="space-y-2 text-xs border-t border-slate-100 dark:border-white/5 pt-3">
                                    <div className="flex items-start gap-2">
                                      <MapPin size={12} className="text-rose-500 mt-0.5 shrink-0" />
                                      <p className="text-slate-700 dark:text-slate-300">
                                        <span className="font-black text-[10px] uppercase text-rose-500 dark:text-rose-400 mr-1">AI Predicted Location:</span>
                                        {item.predictedLocation || 'Unknown'}
                                      </p>
                                    </div>
                                    {item.reason && (
                                      <div className="flex items-start gap-2">
                                        <Cpu size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                                        <p className="text-slate-500 dark:text-slate-400 italic">{item.reason}</p>
                                      </div>
                                    )}
                                    {item.isRecovered && item.recoveredFrom && (
                                      <div className="flex items-start gap-2">
                                        <ShieldCheck size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-emerald-700 dark:text-emerald-400 font-bold">Recovered from: {item.recoveredFrom}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                  ) : (
                    /* ── USER LIST SCREEN ── */
                    <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-black tracking-tight text-slate-800 dark:text-white">Lost Items by Traveler</h3>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            Select a traveler to view their reported lost items
                          </p>
                        </div>
                        <button
                          onClick={fetchLostItems}
                          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <RefreshCw size={13} className={lostItemsLoading ? 'animate-spin' : ''} /> Refresh
                        </button>
                      </div>

                      {lostItemsLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Fetching lost item records...</p>
                        </div>
                      ) : lostItemsError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                          <h4 className="font-black text-slate-800 dark:text-white mb-2">Connection Issue</h4>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{lostItemsError}</p>
                          <button onClick={fetchLostItems} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer">
                            Retry
                          </button>
                        </div>
                      ) : lostItemsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
                          <h4 className="font-black text-slate-800 dark:text-white mb-2">No Lost Items Reported</h4>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm">All travelers have their belongings accounted for.</p>
                        </div>
                      ) : (() => {
                        // Group items by userId
                        const userMap = {};
                        lostItemsData.forEach(item => {
                          if (!userMap[item.userId]) {
                            userMap[item.userId] = {
                              userId: item.userId,
                              userFullName: item.userFullName,
                              userEmail: item.userEmail,
                              profileImageUrl: item.userProfileImageUrl,
                              items: []
                            };
                          }
                          userMap[item.userId].items.push(item);
                        });
                        const users = Object.values(userMap);

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {users.map(u => {
                              const totalItems = u.items.length;
                              const recoveredItems = u.items.filter(i => i.isRecovered).length;
                              const allRecovered = recoveredItems === totalItems;
                              return (
                                <button
                                  key={u.userId}
                                  onClick={() => setSelectedLostItemsUser(u)}
                                  className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl text-left hover:border-rose-300 dark:hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5 active:scale-[0.98] transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-3 mb-4">
                                    {u.profileImageUrl ? (
                                      <img
                                        src={u.profileImageUrl.startsWith('http') ? u.profileImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}${u.profileImageUrl}`}
                                        alt={u.userFullName}
                                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-sm shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-black text-lg shrink-0">
                                        {u.userFullName?.substring(0, 2).toUpperCase() || 'TU'}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{u.userFullName}</p>
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{u.userEmail}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-center text-xs border-t border-slate-100 dark:border-white/5 pt-3">
                                    <div className="bg-white dark:bg-black/20 rounded-xl p-2 border border-slate-100 dark:border-white/5">
                                      <p className="text-[9px] font-black uppercase text-slate-500">Total Items</p>
                                      <p className="font-black text-slate-800 dark:text-white text-base mt-0.5">{totalItems}</p>
                                    </div>
                                    <div className={`rounded-xl p-2 border text-center ${allRecovered ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'}`}>
                                      <p className={`text-[9px] font-black uppercase ${allRecovered ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Recovered</p>
                                      <p className={`font-black text-base mt-0.5 ${allRecovered ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{recoveredItems}/{totalItems}</p>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 group-hover:gap-1 transition-all">
                                    <span>View Lost Items</span>
                                    <ArrowLeft size={12} className="rotate-180" />
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: SYSTEM LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-6">                  <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-black tracking-tight text-slate-800 dark:text-white">Full System Logs & Database Health</h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Audit active user sessions, connection latency, and background jobs</p>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 dark:border-white/5 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 h-[450px] overflow-y-auto custom-scrollbar">
                      <p className="text-slate-500">[{new Date().toISOString().split('T')[0]} 08:00:01] Starting background thread notification worker...</p>
                      <p className="text-emerald-500">[{new Date().toISOString().split('T')[0]} 08:00:05] Connection established with Azure SQL LocalDB.</p>
                      <p className="text-indigo-400">[{new Date().toISOString().split('T')[0]} 08:05:12] User 1 (Alex Rivera) logged in successfully from Localhost IP (::1).</p>
                      <p className="text-indigo-400">[{new Date().toISOString().split('T')[0]} 08:05:15] Created user session 401: Chrome browser on Windows 11.</p>
                      <p className="text-slate-400">[{new Date().toISOString().split('T')[0]} 08:12:44] [GeminiService] Budget analysis processed for UserId: 4. Duration: 142ms.</p>
                      <p className="text-slate-400">[{new Date().toISOString().split('T')[0]} 08:12:44] API Return: Ok (200) {"->"} DTO: AiBudgetEstimateResponseDto.</p>
                      <p className="text-slate-500">[{new Date().toISOString().split('T')[0]} 08:15:00] Purging expired user tokens. 0 rows deleted.</p>
                      <p className="text-slate-400">[{new Date().toISOString().split('T')[0]} 08:35:02] [GeminiService] Structuring sustainable itinerary (Tokyo). UserId: 1. Duration: 512ms.</p>
                      <p className="text-emerald-500">[{new Date().toISOString().split('T')[0]} 08:35:03] TripPlan successfully saved to SQL DB. Auto-generated ID: 104.</p>
                      <p className="text-rose-500 font-bold">[{new Date().toISOString().split('T')[0]} 08:40:02] [Warning] [Auth] Failed admin-login attempt for user 'alex.rivera@gmail.com'. Reason: Unauthorized. Code: 403.</p>
                      <p className="text-emerald-500 font-bold">[{new Date().toISOString().split('T')[0]} 08:52:10] [Auth] SUCCESSFUL Admin Authentication verified for overseer 'admin@yougo.com'. Token issued.</p>
                      <p className="text-slate-500">[{new Date().toISOString().split('T')[0]} 08:52:12] Created secure admin session: Chrome browser on Windows 11.</p>
                      <p className="text-slate-300">[{new Date().toISOString().split('T')[0]} 08:57:06] Listening for real-time SignalR notifications on /notificationHub...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h3 className="font-black tracking-tight text-slate-800 dark:text-white mb-6">Console & Admin Security Settings</h3>
                    
                    <div className="space-y-6 max-w-xl">
                      <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3 mb-4">
                          <Lock className="w-5 h-5 text-rose-500" />
                          <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">Superuser Credentials</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                          You are authenticated under the main seed administrator account. Make sure to reset your temporary password in production.
                        </p>
                        <button className="px-4 py-2.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 font-black text-xs hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all cursor-pointer">
                          Change Security Passcode
                        </button>
                      </div>

                      <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-3 mb-4">
                          <Database className="w-5 h-5 text-indigo-500" />
                          <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">Database Administration</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">
                          Back up your tables to local storage, sync remote media assets, or clear developer caches.
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer">
                            Execute LocalDB Backup
                          </button>
                          <button className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-black text-xs hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer">
                            Purge Dev Sessions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: TRIP RELATIONAL DETAIL INSPECTOR */}
              {activeTab === 'trip-detail' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Back Navigation Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
                    <button
                      onClick={handleBackToTrips}
                      className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <ArrowLeft size={16} /> Back to Trips Monitor
                    </button>
                    
                    {!detailedTripLoading && selectedDetailedTrip && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setShowManualNotificationConsole(!showManualNotificationConsole);
                            // Set default activity if none selected
                            if (!notificationActivity) {
                              const acts = getActivitiesFromItinerary();
                              if (acts.length > 0) setNotificationActivity(acts[0]);
                            }
                          }}
                          className={`px-4 py-2 rounded-2xl border font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                            showManualNotificationConsole
                              ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10'
                              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          <Bell size={14} className={showManualNotificationConsole ? 'animate-bounce' : ''} />
                          {showManualNotificationConsole ? 'Hide Notifier' : '📢 Send Notification'}
                        </button>

                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                          new Date(selectedDetailedTrip.endDate) < new Date() ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          (new Date(selectedDetailedTrip.startDate) <= new Date() ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse' :
                          'bg-indigo-500/10 text-indigo-500 border-indigo-500/20')
                        }`}>
                          {new Date(selectedDetailedTrip.endDate) < new Date() ? 'Completed' :
                           (new Date(selectedDetailedTrip.startDate) <= new Date() ? 'In Progress' : 'Planned')}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400">Trip Audit ID: #{selectedDetailedTrip.id}</span>
                      </div>
                    )}
                  </div>

                  {/* Manual Notification Sending Console Screen */}
                  {!detailedTripLoading && selectedDetailedTrip && showManualNotificationConsole && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white/70 dark:bg-[#09090b]/80 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-[2rem] p-6 shadow-xl relative overflow-hidden mb-6"
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />
                      
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-white/5">
                        <div>
                          <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                            <Bell className="text-indigo-500" size={16} /> Travel Intelligence Notification Console
                          </h4>
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                            Send a customized travel notification generated by AI to {selectedDetailedTrip.user?.fullName}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowManualNotificationConsole(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Success and Error messages */}
                      {manualNotificationSuccess && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-xs rounded-2xl flex items-start gap-2.5 font-medium shadow-sm"
                        >
                          <CheckSquare className="text-emerald-500 mt-0.5 shrink-0" size={16} />
                          <div className="flex-1">
                            <p className="font-bold">Dispatch Successful</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{manualNotificationSuccess}</p>
                          </div>
                        </motion.div>
                      )}

                      {manualNotificationError && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mb-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 text-xs rounded-2xl flex items-start gap-2.5 font-medium shadow-sm"
                        >
                          <AlertCircle className="text-rose-500 mt-0.5 shrink-0" size={16} />
                          <div>
                            <p className="font-bold">Failed to Send</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{manualNotificationError}</p>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                        {/* Trigger Type selection */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                            Choose Notification Trigger Vibe
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {[
                              { value: 'TripStart', label: '🚀 Trip Start' },
                              { value: 'StartTripPrompt', label: '⭐ Start Prompt' },
                              { value: 'OneDayBefore', label: '📅 Day Before' },
                              { value: 'OneHourBefore', label: '⏰ Hour Before' },
                              { value: 'ActivityStart', label: '🎯 Activity Vibe' }
                            ].map((trigger) => (
                              <button
                                key={trigger.value}
                                type="button"
                                onClick={() => {
                                  setNotificationTrigger(trigger.value);
                                  if (trigger.value === 'ActivityStart' && !notificationActivity) {
                                    const acts = getActivitiesFromItinerary();
                                    if (acts.length > 0) setNotificationActivity(acts[0]);
                                  }
                                }}
                                className={`px-3 py-2 rounded-xl text-[10px] font-extrabold uppercase border text-center transition-all cursor-pointer ${
                                  notificationTrigger === trigger.value
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                                    : 'bg-slate-50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-350 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                                }`}
                              >
                                {trigger.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Activity selector or description */}
                        <div className="space-y-2">
                          {notificationTrigger === 'ActivityStart' ? (
                            <>
                              <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                                Target Scheduled Itinerary Activity
                              </label>
                              {getActivitiesFromItinerary().length > 0 ? (
                                <select
                                  value={notificationActivity}
                                  onChange={(e) => setNotificationActivity(e.target.value)}
                                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl outline-none focus:border-indigo-500 transition-colors shadow-sm dark:shadow-none"
                                >
                                  {getActivitiesFromItinerary().map((act, i) => (
                                    <option key={i} value={act}>{act}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={notificationActivity}
                                  onChange={(e) => setNotificationActivity(e.target.value)}
                                  placeholder="e.g. Visit Eiffel Tower"
                                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl outline-none focus:border-indigo-500 transition-colors shadow-sm dark:shadow-none"
                                />
                              )}
                            </>
                          ) : (
                            <div className="p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 italic leading-relaxed">
                              <Cpu size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                              <span>
                                AI will automatically generate a highly personalized, context-aware notification about {
                                  notificationTrigger === 'TripStart' ? 'daily activities and wishes' :
                                  notificationTrigger === 'StartTripPrompt' ? 'prompting them to click Start Trip in their app' :
                                  notificationTrigger === 'OneDayBefore' ? 'packing lists and reminders for tomorrow' :
                                  'final airport checklist checks (Passport, tickets, documents)'
                                } tailored to <strong>{selectedDetailedTrip.destination}</strong>.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Manual Message Override */}
                      <div className="space-y-2 mt-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                          📢 Manual Message Override (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={notificationCustomMessage}
                          onChange={(e) => setNotificationCustomMessage(e.target.value)}
                          placeholder="Type a custom message here to override the AI generation completely. (Leave blank to use AI)"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-2xl outline-none focus:border-indigo-500 transition-colors shadow-sm dark:shadow-none placeholder-slate-400 resize-none font-sans leading-relaxed"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => setShowManualNotificationConsole(false)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSendingManualNotification || (notificationTrigger === 'ActivityStart' && !notificationActivity)}
                          onClick={() => handleSendManualNotification(selectedDetailedTrip.id)}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isSendingManualNotification ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" /> Generating Vibe...
                            </>
                          ) : (
                            <>
                              <Send size={12} /> Dispatch Notification
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {detailedTripLoading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-[#09090b]/80 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm">
                      <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Processing Relational Itinerary Logs...</p>
                    </div>
                  ) : detailedTripError ? (
                    <div className="py-24 text-center max-w-md mx-auto bg-white dark:bg-[#09090b]/80 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                      <h3 className="font-black text-slate-800 dark:text-white mb-2">Failed to load Trip details</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{detailedTripError}</p>
                      <button
                        onClick={handleBackToTrips}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs"
                      >
                        Return to Trips
                      </button>
                    </div>
                  ) : selectedDetailedTrip ? (
                    <div className="space-y-8">
                      {/* Destination & Traveler Info Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left: Destination Card */}
                        <div className="lg:col-span-2 p-6 rounded-[2.5rem] bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 opacity-80 block mb-1">Travel Destination</span>
                            <h3 className="text-3xl font-black flex items-center gap-2">
                              <MapPin size={28} className="fill-white/10" /> {selectedDetailedTrip.destination}
                            </h3>
                          </div>
                          <div className="flex gap-4">
                            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center backdrop-blur-sm min-w-[100px]">
                              <p className="text-[9px] font-black uppercase text-indigo-200">Start Date</p>
                              <p className="font-bold text-sm mt-0.5">{selectedDetailedTrip.startDate}</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 text-center backdrop-blur-sm min-w-[100px]">
                              <p className="text-[9px] font-black uppercase text-indigo-200">End Date</p>
                              <p className="font-bold text-sm mt-0.5">{selectedDetailedTrip.endDate}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Traveler Identity Card */}
                        <div className="bg-white dark:bg-[#09090b]/80 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-sm">
                          {selectedDetailedTrip?.user?.profileImageUrl ? (
                            <img
                              src={selectedDetailedTrip?.user?.profileImageUrl?.startsWith('http') ? selectedDetailedTrip.user.profileImageUrl : `${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}${selectedDetailedTrip?.user?.profileImageUrl || ''}`}
                              alt={selectedDetailedTrip?.user?.fullName || 'Traveler'}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-md"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center font-black text-xl shrink-0">
                              {selectedDetailedTrip?.user?.fullName?.substring(0, 2).toUpperCase() || 'TR'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">Primary Traveler</span>
                            <h4 className="text-base font-black text-slate-800 dark:text-white truncate">{selectedDetailedTrip?.user?.fullName || 'Unknown Traveler'}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{selectedDetailedTrip?.user?.email || 'No email provided'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Main Relational Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Left Column: Timeline & Roadmaps */}
                        <div className="lg:col-span-3 space-y-6">
                          <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-white/5">
                              <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Layers size={18} className="text-indigo-500" /> Active Trip Roadmap
                              </h4>
                              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                                Day Itinerary Audit
                              </span>
                            </div>

                            {/* Roadmap Itinerary */}
                            {(() => {
                              let itinerary = [];
                              if (selectedDetailedTrip.aiPlanJson) {
                                try {
                                  const parsed = JSON.parse(selectedDetailedTrip.aiPlanJson);
                                  itinerary = parsed.itinerary || [];
                                } catch (e) {
                                  console.error(e);
                                }
                              }

                              if (itinerary.length === 0) {
                                return (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 italic py-6 text-center">
                                    No roadmap itinerary detail generated.
                                  </p>
                                );
                              }

                              const currentLocIdx = selectedDetailedTrip.startedTrip?.currentLocationIndex ?? -1;

                              return (
                                <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-white/5">
                                  {itinerary.map((dayPlan, dayIdx) => (
                                    <div key={dayIdx} className="space-y-3">
                                      <div className="flex items-center gap-3 font-black text-slate-850 dark:text-slate-100 text-xs pl-2 bg-slate-50 dark:bg-white/5 py-1.5 rounded-lg pr-4">
                                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                          D{dayPlan.day}
                                        </span>
                                        <span>Day {dayPlan.day} Roadmap - {dayPlan.theme || "Daily Tour"}</span>
                                      </div>

                                      <div className="pl-9 space-y-3">
                                        {dayPlan.activities?.map((act, actIdx) => {
                                          const globalActIdx = itinerary.slice(0, dayIdx).reduce((acc, d) => acc + (d.activities?.length || 0), 0) + actIdx;
                                          const isActiveStop = currentLocIdx === globalActIdx;

                                          return (
                                            <div
                                              key={actIdx}
                                              className={`p-4 rounded-2xl border transition-all ${
                                                isActiveStop
                                                  ? "bg-indigo-500/10 border-indigo-500/30 ring-2 ring-indigo-500/10"
                                                  : "bg-slate-50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5"
                                              }`}
                                            >
                                              <div className="flex justify-between items-start gap-2">
                                                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                                                  {act.activity || act.name}
                                                </h5>
                                                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 font-mono">
                                                  {act.time}
                                                </span>
                                              </div>
                                              {act.location && (
                                                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-550 mt-0.5">
                                                  📍 {act.location}
                                                </p>
                                              )}
                                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                                {act.notes || act.description}
                                              </p>
                                              {isActiveStop && (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest mt-2">
                                                  📍 Active Stop
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Right Column: Checklist & Items picked + Lost Items Alert */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Items Packed Audit */}
                          <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                              <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <CheckSquare size={18} className="text-emerald-500" /> Items Packed Audit
                              </h4>
                            </div>

                            {(() => {
                              let checklistState = {};
                              const rawStartedTrip = selectedDetailedTrip.startedTrip || selectedDetailedTrip.StartedTrip;
                              if (rawStartedTrip) {
                                const rawCheckedJson = rawStartedTrip.checkedItemsJson || rawStartedTrip.CheckedItemsJson;
                                if (rawCheckedJson) {
                                  try {
                                    checklistState = JSON.parse(rawCheckedJson);
                                  } catch (e) {
                                    console.error("Failed to parse checklist JSON:", e);
                                  }
                                }
                              }

                              let allItems = [];
                              try {
                                // Priority 1: tripDataJson → aiPacking.categories
                                // (user-confirmed packing list saved when trip is started)
                                let packingCategories = [];
                                const rawTripData = selectedDetailedTrip.tripDataJson || selectedDetailedTrip.TripDataJson;
                                const rawAiPlan = selectedDetailedTrip.aiPlanJson || selectedDetailedTrip.AiPlanJson;

                                if (rawTripData) {
                                  const tripDataObj = JSON.parse(rawTripData);
                                  if (tripDataObj?.aiPacking?.categories?.length > 0) {
                                    packingCategories = tripDataObj.aiPacking.categories;
                                  }
                                }

                                // Priority 2: aiPlanJson → packingList (original AI plan)
                                if (packingCategories.length === 0 && rawAiPlan) {
                                  const aiPlanObj = JSON.parse(rawAiPlan);
                                  packingCategories = aiPlanObj?.packingList || aiPlanObj?.packing_list || [];
                                }

                                // Normalize flat string arrays into [{name, items}]
                                if (packingCategories.length > 0 && typeof packingCategories[0] === 'string') {
                                  packingCategories = [{ name: 'General', items: packingCategories }];
                                }

                                packingCategories.forEach((cat, catIdx) => {
                                  const items = cat.items || cat.list || [];
                                  items.forEach((item, itemIdx) => {
                                    const name = (item && typeof item === 'object') ? (item.name || item.item) : item;
                                    if (name) {
                                      allItems.push({ name, key: `${catIdx}-${itemIdx}`, category: cat.name || cat.category || '' });
                                    }
                                  });
                                });
                              } catch (e) {
                                console.error("Failed to parse packing list:", e);
                              }

                              if (allItems.length === 0) {
                                return (
                                  <p className="text-xs text-slate-550 dark:text-slate-400 italic text-center py-4">
                                    No checklist items compiled.
                                  </p>
                                );
                              }

                              const totalCount = allItems.length;
                              const checkedCount = allItems.filter(item => checklistState[item.key] === true).length;
                              const percent = Math.round((checkedCount / totalCount) * 100) || 0;

                              return (
                                <div className="space-y-4">
                                  {/* Summary Banner */}
                                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Packing Completion</p>
                                        <h4 className="text-xl font-black text-slate-800 dark:text-emerald-100 mt-0.5">{checkedCount} of {totalCount} Items Packed</h4>
                                      </div>
                                      <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 flex items-center justify-center font-black text-sm text-emerald-600 dark:text-emerald-400">
                                        {percent}%
                                      </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full h-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Item List */}
                                  <div className="max-h-[35vh] overflow-y-auto no-scrollbar space-y-1 border border-slate-100 dark:border-white/5 rounded-2xl p-3 bg-slate-50/50 dark:bg-black/10">
                                    {allItems.map((item, idx) => {
                                      const isPacked = !!checklistState[item.key];
                                      return (
                                        <div key={idx} className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg transition-colors ${isPacked ? 'bg-emerald-500/5' : 'hover:bg-slate-100 dark:hover:bg-white/[0.02]'}`}>
                                          <div className="flex items-center gap-2 min-w-0">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isPacked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                              {isPacked && <Check size={9} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <span className={`font-medium truncate ${isPacked ? 'text-slate-400 line-through dark:text-slate-550' : 'text-slate-700 dark:text-slate-300 font-semibold'}`}>
                                              {item.name}
                                            </span>
                                            {item.category && (
                                              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 shrink-0 hidden sm:inline">
                                                {item.category}
                                              </span>
                                            )}
                                          </div>
                                          {isPacked && (
                                            <span className="flex items-center gap-1 text-emerald-500 font-black text-[9px] uppercase shrink-0">
                                              <Check size={10} /> Packed
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Lost Items Log */}
                          <div className="bg-white dark:bg-[#09090b]/80 rounded-[2rem] p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                              <h4 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <Package size={18} className="text-rose-500" /> Lost Items Alert Log
                              </h4>
                            </div>

                            {selectedDetailedTrip.lostItems?.length === 0 ? (
                              <div className="p-6 bg-slate-50 dark:bg-white/[0.01] rounded-2xl text-center border border-dashed border-slate-200 dark:border-white/10">
                                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-xs text-slate-505 dark:text-slate-400 font-black uppercase">No Anomalies</p>
                                <p className="text-[10px] text-slate-400 mt-1">All cataloged belongings are secure.</p>
                              </div>
                            ) : (
                              <div className="space-y-3.5">
                                {selectedDetailedTrip.lostItems?.map((item) => (
                                  <div key={item.id} className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="font-black text-xs text-slate-800 dark:text-slate-200">{item.itemName}</h5>
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${
                                        item.isRecovered ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      }`}>
                                        {item.isRecovered ? 'Recovered' : 'Missing'}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-605 dark:text-slate-400 leading-relaxed">
                                      <strong>AI Prediction Location:</strong> <span className="text-rose-505 font-bold">{item.predictedLocation}</span>
                                    </p>
                                    {item.isRecovered && item.recoveredFrom && (
                                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        📍 Found at: {item.recoveredFrom}
                                      </p>
                                    )}
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 italic">
                                      "{item.reason}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
