import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, CheckCircle2, Circle, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { getMyTrips } from '../../services/tripService';

const ChecklistTab = ({ theme, setActiveTab, selectedTrip, setSelectedTrip }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (!selectedTrip) {
      fetchTrips();
    } else {
      setLoading(false);
    }
  }, [selectedTrip]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getMyTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load trips.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (categoryIndex, itemIndex) => {
      const key = `${categoryIndex}-${itemIndex}`;
      setCheckedItems(prev => ({
          ...prev,
          [key]: !prev[key]
      }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (selectedTrip) {
    let aiPlan = null;
    let tripData = null;
    try {
      if (selectedTrip.aiPlanJson) aiPlan = JSON.parse(selectedTrip.aiPlanJson);
      if (selectedTrip.tripDataJson) tripData = JSON.parse(selectedTrip.tripDataJson);
    } catch (e) {}

    // Extract user-preferred packing list from tripData.aiPacking, or fallback to aiPlan
    let packingList = tripData?.aiPacking?.categories || aiPlan?.packingList || aiPlan?.packing_list || [];
    
    if (Array.isArray(packingList) && packingList.length > 0 && typeof packingList[0] === 'string') {
        // If it's a flat list of strings
        packingList = [{ name: "General", items: packingList }];
    } else if (!Array.isArray(packingList)) {
        packingList = [];
    }

    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedTrip(null)} 
          className="mb-6 text-sm font-bold opacity-60 hover:opacity-100 flex items-center gap-2 transition-opacity"
        >
          <ArrowLeft size={16} /> Back to All Checklists
        </button>

        <div className={`p-8 rounded-[2.5rem] border shadow-2xl ${theme === 'light' ? 'bg-white border-black/5' : 'bg-black/20 border-white/5'}`}>
          <div className="mb-8 pb-8 border-b border-indigo-500/20">
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <CheckCircle2 className="text-indigo-500" size={36} /> Checklist
            </h1>
            <p className="opacity-60 flex items-center gap-2 font-medium text-lg">
              {selectedTrip.destination}
            </p>
          </div>

          <div className="space-y-8">
              {packingList.length === 0 ? (
                  <div className={`p-12 rounded-3xl border flex flex-col items-center justify-center text-center opacity-50 ${theme === 'light' ? 'bg-black/[0.02] border-black/5' : 'bg-white/[0.02] border-white/5'}`}>
                      <CheckCircle2 size={48} className="mb-4 text-indigo-500 opacity-50" />
                      <h3 className="text-xl font-bold mb-2">No Checklist Found</h3>
                      <p className="text-sm">We couldn't find a packing list for this trip in the database.</p>
                  </div>
              ) : (
                  packingList.map((category, catIdx) => (
                      <div key={catIdx} className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-black/[0.02] border-black/5' : 'bg-white/[0.02] border-white/5'}`}>
                          <h2 className="text-xl font-bold mb-4 text-indigo-500">{category.name || category.category || "Packing List"}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(category.items || []).map((item, itemIdx) => {
                                  const isChecked = checkedItems[`${catIdx}-${itemIdx}`];
                                  return (
                                      <div 
                                          key={itemIdx} 
                                          onClick={() => toggleItem(catIdx, itemIdx)}
                                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isChecked ? 'opacity-50' : 'hover:bg-indigo-500/10'}`}
                                      >
                                          {isChecked ? (
                                              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                                          ) : (
                                              <Circle className="opacity-30 shrink-0" size={20} />
                                          )}
                                          <span className={`font-medium ${isChecked ? 'line-through' : ''}`}>
                                              {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                                          </span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ))
              )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 variants={itemVariants} className="text-4xl font-black tracking-tighter mb-2">
            Trip Checklists <span className="text-indigo-500">✅</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg opacity-40 font-medium tracking-tight">
            Manage packing lists and preparations for your trips.
          </motion.p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="font-bold opacity-60">Loading your checklists...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-center">
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div className="py-20 glass rounded-[2.5rem] border-dashed border-white/10 flex flex-col items-center justify-center opacity-40 text-center">
          <CheckCircle2 size={60} className="mb-4" />
          <h3 className="text-2xl font-black tracking-tight mb-2">No checklists found</h3>
          <p className="font-medium">Plan a trip to view its checklist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <motion.div
              variants={itemVariants}
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`p-6 rounded-[2rem] border cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${theme === 'light' ? 'bg-white border-black/5 shadow-md hover:shadow-xl' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-xs font-bold opacity-40">
                  {new Date(trip.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-black mb-1 group-hover:text-indigo-500 transition-colors">
                {trip.destination}
              </h3>
              <p className="text-sm font-medium opacity-60 mb-6">
                From {trip.startingLocation}
              </p>
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-indigo-500 font-bold text-sm group-hover:gap-2 transition-all">
                <span>View Checklist</span>
                <ArrowLeft className="rotate-180 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" size={16} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ChecklistTab;
