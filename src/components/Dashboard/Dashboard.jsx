import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import LogoutModal from './LogoutModal';
import Profile from './Profile';
import PlanTrip from './PlanTrip';
import MyTrips from './MyTrips';
import ExploreMap from './ExploreMap';
import ChecklistTab from './ChecklistTab';
import DashboardHome from './DashboardHome';
import ItemTracker from './ItemTracker';
import { StatCard, AiAssistant } from './AiAssistant';
import { TripCard } from './TripsSection';
import { getUserProfile, logout } from '../../services/authService';
import { getCookie, deleteCookie, setCookie } from '../../services/cookieService';
import { getMyTrips } from '../../services/tripService';
import * as signalR from '@microsoft/signalr';
import { getNotifications, markAsRead } from '../../services/notificationService';
import { Bell, X, Info, Calendar as CalIcon, MapPin as PinIcon, Clock } from 'lucide-react';
import {
  Plane,
  Wallet,
  Map as MapIcon,
  CheckCircle2,
  Plus,
  Compass,
  LayoutGrid
} from 'lucide-react';

const Dashboard = ({ theme, toggleTheme }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return getCookie('dashboard_active_tab') || 'dashboard';
  });
  const [selectedChecklistTrip, setSelectedChecklistTrip] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Trip and Stats State
  const [trips, setTrips] = useState([]);
  const [nextTrip, setNextTrip] = useState(null);
  const [stats, setStats] = useState({
    totalTrips: 0,
    budgetSpent: 0,
    milesTraveled: 0,
    progress: 0
  });

  // Sync activeTab with browser history to handle back button correctly
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize history state on mount
    if (!window.history.state || !window.history.state.tab) {
      window.history.replaceState({ tab: activeTab }, '', window.location.pathname);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (activeTab) {
      setCookie('dashboard_active_tab', activeTab);

      // Update history state when tab changes, but only if it's different from current state
      if (!window.history.state || window.history.state.tab !== activeTab) {
        window.history.pushState({ tab: activeTab }, '', window.location.pathname);
      }
    }
  }, [activeTab]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = getCookie('user');
        if (storedUser) {
          const { token, Token } = storedUser;
          const profile = await getUserProfile(token || Token);
          setUserData(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserData();

    // Fetch Notifications
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        // Backend returns properties in PascalCase or camelCase depending on serialization
        // JS normally expects camelCase, but Dapper/C# might send PascalCase
        const formatted = data.map(n => ({
          id: n.id || n.Id,
          tripId: n.tripId || n.TripId,
          destination: n.destination || n.Destination,
          message: n.message || n.Message,
          type: n.type || n.Type,
          timestamp: n.timestamp || n.Timestamp,
          isRead: n.isRead ?? n.IsRead
        }));
        setNotifications(formatted);
        setUnreadCount(formatted.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();

    // Fetch Dashboard Data (Trips & Stats)
    const loadDashboardData = async () => {
      try {
        const allTrips = await getMyTrips();
        setTrips(allTrips);

        if (allTrips.length > 0) {
          // Find most imminent upcoming trip
          const upcoming = allTrips
            .filter(t => new Date(t.startDate) > new Date())
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

          setNextTrip(upcoming || allTrips[0]);

          // Calculate Stats (Simulated for premium feel, but based on real count)
          setStats({
            totalTrips: allTrips.length,
            budgetSpent: allTrips.length * 1250,
            milesTraveled: allTrips.length * 840,
            progress: 65
          });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    loadDashboardData();
  }, []);

  // SignalR Initialization
  useEffect(() => {
    const userCookie = getCookie('user');
    if (!userCookie) return;

    const userId = userCookie.id || userCookie.Id;
    if (!userId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL || 'https://yugo-g2fmdcdefuc5ewba.southeastasia-01.azurewebsites.net'}/notificationHub`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("Connected to SignalR!");
          const userCookie = getCookie('user');
          const userId = userCookie.id || userCookie.Id;
          connection.invoke("JoinUserGroup", userId.toString());

          connection.on("ReceiveNotification", (notification) => {
            const newNotif = {
              id: notification.id || notification.Id,
              tripId: notification.tripId || notification.TripId,
              destination: notification.destination || notification.Destination,
              message: notification.message || notification.Message,
              type: notification.type || notification.Type,
              timestamp: notification.timestamp || notification.Timestamp,
              isRead: false
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: browser notification
            if (Notification.permission === "granted") {
              new Notification("YuGo Adventure Update", { body: newNotif.message });
            }
          });
        })
        .catch(e => console.log("Connection failed: ", e));
    }
  }, [connection]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleLogout = async () => {
    try {
      const storedUser = getCookie('user');
      if (storedUser) {
        const { token, Token, refreshToken, RefreshToken } = storedUser;
        await logout(token || Token, refreshToken || RefreshToken);
      }
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      deleteCookie('user');
      deleteCookie('dashboard_active_tab');
      navigate('/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500/30 font-sans transition-colors duration-500 overflow-x-hidden">
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'checklist') {
            setSelectedChecklistTrip(null);
          }
          setActiveTab(tab);
        }}
        onLogout={() => setShowLogoutModal(true)}
      />

      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        <TopNav
          theme={theme}
          toggleTheme={toggleTheme}
          setMobileOpen={setMobileOpen}
          userData={userData}
          setActiveTab={(tab) => {
            if (tab === 'checklist') {
              setSelectedChecklistTrip(null);
            }
            setActiveTab(tab);
          }}
          onLogout={() => setShowLogoutModal(true)}
          collapsed={collapsed}
          isProfileOpen={isProfileDropdownOpen}
          setIsProfileOpen={setIsProfileDropdownOpen}
          unreadCount={unreadCount}
          onNotificationClick={async () => {
            setShowNotificationDrawer(true);
            // Mark all as read when opening drawer
            try {
              const unread = notifications.filter(n => !n.isRead);
              for (const n of unread) {
                await markAsRead(n.id);
              }
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
              setUnreadCount(0);
            } catch (error) {
              console.error('Error marking as read:', error);
            }
          }}
        />

        {/* Notification Drawer */}
        <AnimatePresence>
          {showNotificationDrawer && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotificationDrawer(false)}
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md bg-[var(--bg-main)] border-l border-[var(--glass-border)] shadow-2xl flex flex-col"
              >
                <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-indigo-600/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500 rounded-xl text-white">
                      <Bell size={20} />
                    </div>
                    <h2 className="text-xl font-black">Trip Notifications</h2>
                  </div>
                  <button
                    onClick={() => setShowNotificationDrawer(false)}
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-8">
                      <Bell size={48} className="mb-4" />
                      <p className="font-bold">No notifications yet</p>
                      <p className="text-sm">We'll let you know when your next adventure is about to start!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notif, i) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={i}
                          className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase rounded-lg">
                              {notif.type === 'ActivityStart' ? 'Activity Soon' : 'Trip Alert'}
                            </span>
                            <span className="text-[10px] opacity-40 font-bold flex items-center gap-1">
                              <Clock size={10} /> {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed mb-3">{notif.message}</p>
                          <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                              <PinIcon size={10} /> {notif.destination}
                            </div>
                            <button
                              onClick={() => {
                                setActiveTab('my-trips');
                                setShowNotificationDrawer(false);
                              }}
                              className="ml-auto text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-tight"
                            >
                              Manage Trip →
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <DashboardHome
                key="dashboard-home"
                theme={theme}
                userData={userData}
                trips={trips}
                nextTrip={nextTrip}
                stats={stats}
                notifications={notifications}
                setActiveTab={setActiveTab}
                onViewTrip={(tripId) => {
                  setSelectedTripId(tripId);
                  setActiveTab('my-trips');
                }}
              />
            ) : activeTab === 'plan-trip' ? (
              <PlanTrip
                key="plan-trip"
                theme={theme}
                setActiveTab={setActiveTab}
              />
            ) : activeTab === 'my-trips' ? (
              <MyTrips
                key="my-trips"
                theme={theme}
                setActiveTab={setActiveTab}
                setSelectedChecklistTrip={setSelectedChecklistTrip}
                preSelectedTripId={selectedTripId}
                clearPreSelectedTrip={() => setSelectedTripId(null)}
              />
            ) : activeTab === 'map' ? (
              <ExploreMap theme={theme} />
            ) : activeTab === 'checklist' ? (
              <ChecklistTab
                key="checklist"
                theme={theme}
                setActiveTab={setActiveTab}
                selectedTrip={selectedChecklistTrip}
                setSelectedTrip={setSelectedChecklistTrip}
              />
            ) : activeTab === 'profile' ? (
              <Profile
                key="profile"
                userData={userData}
                setUserData={setUserData}
                theme={theme}
                toggleTheme={toggleTheme}
                isModalOpen={showLogoutModal || isProfileDropdownOpen}
                isMobileMenuOpen={mobileOpen}
              />
            ) : activeTab === 'item-tracker' ? (
              <ItemTracker
                key="item-tracker"
                theme={theme}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
