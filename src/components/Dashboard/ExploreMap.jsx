import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Search, 
  Navigation, 
  MapPin, 
  Calendar, 
  ChevronRight,
  Globe,
  Compass
} from 'lucide-react';
import { getMyTrips } from '../../services/tripService';
import TripMap from './TripMap';
import { useJsApiLoader } from '@react-google-maps/api';

const ExploreMap = ({ theme }) => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDT1B7JIH_xNNgqO2E9ruBACSu43Qee9mg"
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const data = await getMyTrips();
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAiPlan = (trip) => {
    if (!trip || !trip.aiPlanJson) return null;
    try {
      return typeof trip.aiPlanJson === 'string' ? JSON.parse(trip.aiPlanJson) : trip.aiPlanJson;
    } catch (e) {
      console.error("Error parsing AI Plan JSON", e);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="text-indigo-400 animate-pulse" size={24} />
          </div>
        </div>
      </div>
    );
  }

  const currentAiPlan = getAiPlan(selectedTrip);

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden p-1">
      {/* Sidebar Trip List */}
      <div className="w-full lg:w-80 flex flex-col gap-4 lg:gap-6 h-[40%] lg:h-full overflow-hidden">
        <div className={`p-1 rounded-2xl flex items-center gap-3 px-4 border shadow-xl ${
          theme === 'dark' 
            ? 'glass border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          <Search size={18} className={theme === 'dark' ? 'text-white/40' : 'text-gray-400'} />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`bg-transparent border-none outline-none py-3 text-sm w-full ${
              theme === 'dark' 
                ? 'text-white placeholder:text-white/20' 
                : 'text-gray-900 placeholder:text-gray-400'
            }`}
          />
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-1 lg:pr-2">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTrip(trip)}
              className={`p-3 lg:p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedTrip?.id === trip.id
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : theme === 'dark'
                    ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'
                    : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold tracking-tight truncate flex-1 text-sm lg:text-base ${
                  selectedTrip?.id === trip.id ? 'text-indigo-400' : ''
                }`}>{trip.destination}</h3>
                {selectedTrip?.id === trip.id && (
                  <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
                    <Navigation size={12} />
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-3 lg:gap-4 text-[10px] lg:text-xs ${
                theme === 'dark' ? 'opacity-40' : 'opacity-60'
              }`}>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{trip.startingLocation}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredTrips.length === 0 && (
            <div className="text-center py-6 lg:py-10 opacity-40">
              <Compass size={32} className="mx-auto mb-2 lg:mb-3" />
              <p className="text-xs lg:text-sm">No trips found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-grow relative rounded-3xl lg:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/20 group h-[60%] lg:h-full">
        <AnimatePresence mode="wait">
          {selectedTrip ? (
            <motion.div
              key={selectedTrip.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {currentAiPlan ? (
                <TripMap 
                  aiTripPlan={currentAiPlan}
                  isLoaded={isLoaded}
                  theme={theme}
                  transportMode={currentAiPlan.transportMode || 'car'}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/40">
                    No map data available for this trip
                </div>
              )}
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6 animate-pulse">
                <Globe size={48} className="text-indigo-500" />
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tight">Select a journey to explore</h2>
              <p className="max-w-xs opacity-40 text-sm font-medium leading-relaxed">
                Choose a trip from the sidebar to visualize your AI-generated routes and discovery points.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExploreMap;
