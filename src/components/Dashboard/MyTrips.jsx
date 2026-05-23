import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Calendar, Users, ArrowRight, Loader2, MapPin, CheckSquare, Play, AlertCircle, PartyPopper, Trash2, Navigation, Edit3, Check } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import { getMyTrips, getChecklistState, saveChecklistState, saveTripPlan, deleteTripPlan, updateTripLocation, getTripLocation, predictLostItems, saveLostItemReason, removeItemFromDb, updateActivityTime, updateTripStartTime } from '../../services/tripService';
import { analyzeOmissions } from '../../services/aiService';
import TripMap from './TripMap';

const MyTrips = ({ theme, setActiveTab, setSelectedChecklistTrip, preSelectedTripId, clearPreSelectedTrip }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // Start Trip States
  const [showStartModal, setShowStartModal] = useState(false);
  const [startCheckedState, setStartCheckedState] = useState({});
  const [isSavingChecklist, setIsSavingChecklist] = useState(false);
  const [showForgetWarning, setShowForgetWarning] = useState(false);
  const [strictDisclaimer, setStrictDisclaimer] = useState(null);
  const [activePackingList, setActivePackingList] = useState([]);
  const [ongoingTrips, setOngoingTrips] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  
  // Arrival Modal States
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [arrivalCheckedState, setArrivalCheckedState] = useState({});
  const [pendingLocationIndex, setPendingLocationIndex] = useState(null);
  const [isSavingArrival, setIsSavingArrival] = useState(false);
  
  // Omission Prediction States
  const [lostItemPredictions, setLostItemPredictions] = useState(null);
  const [isPredictingLost, setIsPredictingLost] = useState(false);
  const [omissionReasons, setOmissionReasons] = useState({});
  
  // Time Edit States
  const [editingTimeKey, setEditingTimeKey] = useState(null); // format: "day-activityIndex"
  const [newTimeValue, setNewTimeValue] = useState("");
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  
  // Trip Start Time States
  const [isEditingStartTime, setIsEditingStartTime] = useState(false);
  const [newStartTimeValue, setNewStartTimeValue] = useState("");
  const [isUpdatingStartTime, setIsUpdatingStartTime] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDT1B7JIH_xNNgqO2E9ruBACSu43Qee9mg" // Same key as PlanTrip
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (preSelectedTripId && trips.length > 0) {
      const trip = trips.find(t => t.id == preSelectedTripId);
      if (trip) {
        setSelectedTrip(trip);
      }
    }
  }, [preSelectedTripId, trips]);

  useEffect(() => {
    if (selectedTrip) {
      // Check if trip is ongoing
      getChecklistState(selectedTrip.id).then(res => {
        if (res && res.checkedItemsJson) {
          setOngoingTrips(prev => ({ ...prev, [selectedTrip.id]: true }));
        }
      }).catch(() => {});

      // Get current location
      getTripLocation(selectedTrip.id).then(res => {
        if (res && res.currentLocationIndex !== undefined) {
          setCurrentLocationIndex(res.currentLocationIndex);
        }
      }).catch(() => {});
    }
  }, [selectedTrip]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await getMyTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
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
    const handleBack = () => {
      setSelectedTrip(null);
      if (clearPreSelectedTrip) clearPreSelectedTrip();
    };

    let aiPlan = null;
    let tripDetails = null;
    try {
      if (selectedTrip.aiPlanJson) aiPlan = JSON.parse(selectedTrip.aiPlanJson);
      if (selectedTrip.tripDataJson) tripDetails = JSON.parse(selectedTrip.tripDataJson);
    } catch(e) {}

    let packingList = tripDetails?.aiPacking?.categories || aiPlan?.packingList || aiPlan?.packing_list || [];
    
    if (Array.isArray(packingList) && packingList.length > 0 && typeof packingList[0] === 'string') {
        packingList = [{ name: "General", items: packingList }];
    } else if (!Array.isArray(packingList)) {
        packingList = [];
    }

    const handleStartTripClick = async () => {
      if (ongoingTrips[selectedTrip.id]) return; // Already ongoing

      setActivePackingList(packingList);
      setShowStartModal(true);
      setShowForgetWarning(false);
      setStrictDisclaimer(null);
      try {
        const response = await getChecklistState(selectedTrip.id);
        if (response && response.checkedItemsJson) {
          setStartCheckedState(JSON.parse(response.checkedItemsJson));
        } else {
          setStartCheckedState({});
        }
      } catch (e) {
        console.error("Failed to load checklist state", e);
        setStartCheckedState({});
      }
    };

    const handleToggleStartItem = (key) => {
      setStartCheckedState(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };


    const handleToggleCategory = (catIdx) => {
      const category = activePackingList[catIdx];
      const items = category.items || [];
      const allSelected = items.length > 0 && items.every((_, itemIdx) => startCheckedState[`${catIdx}-${itemIdx}`]);
      
      setStartCheckedState(prev => {
        const next = { ...prev };
        items.forEach((_, itemIdx) => {
          next[`${catIdx}-${itemIdx}`] = !allSelected;
        });
        return next;
      });
    };

    const handleConfirmStart = async () => {
      let totalItems = 0;
      let checkedCount = 0;
      let uncheckedItemsList = [];
      
      activePackingList.forEach((category, catIdx) => {
        (category.items || []).forEach((item, itemIdx) => {
          totalItems++;
          if (startCheckedState[`${catIdx}-${itemIdx}`]) {
            checkedCount++;
          } else {
            uncheckedItemsList.push(typeof item === 'string' ? item : item.name || JSON.stringify(item));
          }
        });
      });

      if (checkedCount < totalItems) {
        if (!showForgetWarning) {
          setShowForgetWarning(true);
          return;
        }

        // Proceed Anyway Flow
        setIsSavingChecklist(true);
        setStrictDisclaimer(null);
        try {
          // AI Analysis
          const aiAnalysis = await analyzeOmissions(selectedTrip.destination, JSON.stringify(uncheckedItemsList));
          
          if (aiAnalysis && aiAnalysis.isMandatoryMissing) {
            setStrictDisclaimer(aiAnalysis.message);
            setIsSavingChecklist(false);
            return;
          }

          // Not mandatory. Remove items and save.
          let newPackingList = JSON.parse(JSON.stringify(activePackingList));
          newPackingList.forEach((cat, cIdx) => {
             cat.items = (cat.items || []).filter((it, iIdx) => startCheckedState[`${cIdx}-${iIdx}`]);
          });
          newPackingList = newPackingList.filter(cat => cat.items.length > 0);

          let tripDetailsObj = JSON.parse(selectedTrip.tripDataJson || "{}");
          if (tripDetailsObj.aiPacking) tripDetailsObj.aiPacking.categories = newPackingList;
          let aiPlanObj = JSON.parse(selectedTrip.aiPlanJson || "{}");
          if (aiPlanObj.packingList) aiPlanObj.packingList = newPackingList;

          // Build correct payload for backend DTO
          const payload = {
            id: selectedTrip.id,
            destination: selectedTrip.destination,
            startingLocation: selectedTrip.startingLocation,
            startDate: selectedTrip.startDate,
            endDate: selectedTrip.endDate,
            travelers: selectedTrip.travelers,
            tripData: tripDetailsObj,
            aiPlan: aiPlanObj
          };
          
          await saveTripPlan(payload);

          // update local selectedTrip so UI doesn't crash on rerender
          selectedTrip.tripDataJson = JSON.stringify(tripDetailsObj);
          selectedTrip.aiPlanJson = JSON.stringify(aiPlanObj);

          let newCheckedState = {};
          newPackingList.forEach((cat, cIdx) => {
              cat.items.forEach((it, iIdx) => {
                  newCheckedState[`${cIdx}-${iIdx}`] = true;
              });
          });
          
          await saveChecklistState(selectedTrip.id, JSON.stringify(newCheckedState));
          
          setOngoingTrips(prev => ({...prev, [selectedTrip.id]: true}));
          setShowStartModal(false);

        } catch (e) {
          console.error("Failed AI logic", e);
        } finally {
          setIsSavingChecklist(false);
        }
      } else {
        // All Checked Flow
        setIsSavingChecklist(true);
        try {
          await saveChecklistState(selectedTrip.id, JSON.stringify(startCheckedState));
          setOngoingTrips(prev => ({...prev, [selectedTrip.id]: true}));
          setShowStartModal(false);
        } catch (e) {
          console.error("Failed to save checklist", e);
        } finally {
          setIsSavingChecklist(false);
        }
      }
    };

    const handleDeleteTrip = () => {
      setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
      setIsDeleting(true);
      try {
        await deleteTripPlan(selectedTrip.id);
        setShowDeleteModal(false);
        setSelectedTrip(null);
        fetchTrips();
      } catch (e) {
        console.error("Failed to delete trip", e);
        alert("Failed to delete trip.");
      } finally {
        setIsDeleting(false);
      }
    };

    const handleUpdateLocation = (globalIndex) => {
      setPendingLocationIndex(globalIndex);
      setArrivalCheckedState({});
      setActivePackingList(packingList);
      setShowArrivalModal(true);
    };

    const handleConfirmArrival = async () => {
      if (!activePackingList || !Array.isArray(activePackingList)) {
        console.error("No active packing list found during arrival confirmation");
        return;
      }

      // Check for forgotten items
      const forgottenItems = [];
      activePackingList.forEach((cat, catIdx) => {
        if (cat && cat.items) {
          cat.items.forEach((item, itemIdx) => {
            if (!arrivalCheckedState[`${catIdx}-${itemIdx}`]) {
              forgottenItems.push(typeof item === 'string' ? item : item.name);
            }
          });
        }
      });

      if (forgottenItems.length > 0) {
        setIsPredictingLost(true);
        setLostItemPredictions(null); 
        setShowArrivalModal(true); 
        try {
          // Prepare history: starting location + all activities up to the current one
          const history = [
            { day: 1, location: selectedTrip.startingLocation || "Starting Point", activity: "Beginning of journey" }
          ];
          
          if (aiPlan && Array.isArray(aiPlan.itinerary)) {
            let currentGlobalIdx = 0;
            for (let d = 0; d < aiPlan.itinerary.length; d++) {
              const day = aiPlan.itinerary[d];
              if (day && Array.isArray(day.activities)) {
                for (let i = 0; i < day.activities.length; i++) {
                  if (pendingLocationIndex !== null && currentGlobalIdx < pendingLocationIndex) {
                    const act = day.activities[i];
                    history.push({ 
                      day: day.day || (d + 1), 
                      location: act.location || "Stop", 
                      activity: act.activity || "Sightseeing" 
                    });
                  }
                  currentGlobalIdx++;
                }
              }
            }
          }

          const result = await predictLostItems(selectedTrip.id, {
            destination: selectedTrip.destination,
            previousLocationsJson: JSON.stringify(history),
            lostItemsJson: JSON.stringify(forgottenItems)
          });
          
          if (result && result.predictions) {
            setLostItemPredictions(result);
          } else {
             // If AI specifically fails to format, create a pseudo-prediction from history
             setLostItemPredictions({
                predictions: forgottenItems.map(item => ({
                    itemName: item,
                    predictedLocation: history.length > 0 ? history[history.length-1].location : selectedTrip.startingLocation,
                    explanation: "Our system suggests checking your most recent location while we recalibrate the AI.",
                    isMandatory: ["passport", "visa", "license", "id"].some(m => item.toLowerCase().includes(m))
                })),
                generalAdvice: "It looks like some items were left behind. Based on your trip history, please check your last visited location."
             });
          }
          return; 
        } catch (e) {
          console.error("Prediction failed", e);
          // Last resort fallback so UI doesn't break
          setLostItemPredictions({
            predictions: forgottenItems.map(item => ({
                itemName: item,
                predictedLocation: selectedTrip.startingLocation,
                explanation: "Please check your starting point or most recent stop.",
                isMandatory: false
            })),
            generalAdvice: "We encountered an issue with AI analysis, but safety first: double check your items!"
          });
          return;
        } finally {
          setIsPredictingLost(false);
        }
      }

      setIsSavingArrival(true);
      console.log("[DEBUG] Starting arrival confirmation...", { tripId: selectedTrip.id, pendingLocationIndex });
      
      try {
        await updateTripLocation(selectedTrip.id, pendingLocationIndex);
        console.log("[DEBUG] Location updated successfully");
        
        await saveChecklistState(selectedTrip.id, JSON.stringify(arrivalCheckedState));
        console.log("[DEBUG] Checklist state saved successfully");
        
        setCurrentLocationIndex(pendingLocationIndex);
        setShowArrivalModal(false);
        setLostItemPredictions(null);
        setOmissionReasons({});
      } catch (e) {
        console.error("[ERROR] Failed to update arrival:", e);
        alert(`Failed to update location: ${e.message}`);
      } finally {
        setIsSavingArrival(false);
      }
    };

    const handleProceedAnyway = async () => {
      if (!lostItemPredictions || !lostItemPredictions.predictions) return;

      setIsSavingArrival(true);
      try {
        // 0. Resolve the correct current packing list (same logic as render)
        let aiPlanObj = null;
        let tripDetailsObj = null;
        try {
            if (selectedTrip.aiPlanJson) aiPlanObj = JSON.parse(selectedTrip.aiPlanJson);
            if (selectedTrip.tripDataJson) tripDetailsObj = JSON.parse(selectedTrip.tripDataJson);
        } catch(e) {}
        const oldPackingList = tripDetailsObj?.aiPacking?.categories || aiPlanObj?.packingList || aiPlanObj?.packing_list || [];

        // 1. Save reasons to DB (Non-blocking)
        for (const prediction of lostItemPredictions.predictions) {
            try {
                const reason = omissionReasons[prediction.itemName] || "Proceeded without item";
                await saveLostItemReason(selectedTrip.id, {
                    itemName: prediction.itemName,
                    predictedLocation: prediction.predictedLocation,
                    reason: reason
                });
            } catch (e) {
                console.warn("Could not save lost item reason, continuing...", e);
            }
        }

        // 2. Update Location (Critical)
        if (pendingLocationIndex !== null) {
          try {
            await updateTripLocation(selectedTrip.id, pendingLocationIndex);
            setCurrentLocationIndex(pendingLocationIndex);
          } catch (e) {
            console.error("Location update failed", e);
            throw new Error("Could not update your location on the server.");
          }
        }
        
        // 3. CALCULATE FINAL STATES LOCALLY
        let finalPackingList = [...oldPackingList];
        let itemsToDiscard = lostItemPredictions.predictions.map(p => p.itemName);

        finalPackingList = finalPackingList.map(cat => ({
            ...cat,
            items: (cat.items || []).filter(item => {
                const name = typeof item === 'string' ? item : item.name;
                return !itemsToDiscard.some(discard => discard.toLowerCase() === name.toLowerCase());
            })
        })).filter(cat => cat.items.length > 0);

        const finalCheckedState = {};
        finalPackingList.forEach((newCat, newCatIdx) => {
            (newCat.items || []).forEach((item, newItemIdx) => {
                const itemName = typeof item === 'string' ? item : item.name;
                oldPackingList.forEach((oldCat, oldCatIdx) => {
                    const oldItemIdx = (oldCat.items || []).findIndex(oi => 
                        (typeof oi === 'string' ? oi : oi.name) === itemName
                    );
                    if (oldItemIdx !== -1 && arrivalCheckedState[`${oldCatIdx}-${oldItemIdx}`]) {
                        finalCheckedState[`${newCatIdx}-${newItemIdx}`] = true;
                    }
                });
            });
        });

        const finalAiPlan = aiPlanObj ? { ...aiPlanObj, packingList: finalPackingList } : null;
        const finalTripData = tripDetailsObj ? { 
            ...tripDetailsObj, 
            aiPacking: { ...tripDetailsObj.aiPacking, categories: finalPackingList } 
        } : null;

        // 4. SYNC REMOVALS WITH BACKEND
        for (const itemName of itemsToDiscard) {
            try {
                await removeItemFromDb(selectedTrip.id, itemName);
            } catch (e) {
                console.error(`Failed to remove ${itemName}`, e);
            }
        }

        try {
            await saveChecklistState(selectedTrip.id, JSON.stringify(finalCheckedState));
        } catch (e) {
            console.error("Failed to save checklist state", e);
        }
        
        // 5. UPDATE UI STATE
        const updatedTrip = {
            ...selectedTrip,
            aiPlanJson: finalAiPlan ? JSON.stringify(finalAiPlan) : selectedTrip.aiPlanJson,
            tripDataJson: finalTripData ? JSON.stringify(finalTripData) : selectedTrip.tripDataJson
        };

        setSelectedTrip(updatedTrip);
        setActivePackingList(finalPackingList);
        setArrivalCheckedState(finalCheckedState);
        setStartCheckedState(finalCheckedState);
        
        setShowArrivalModal(false);
        setLostItemPredictions(null);
        setOmissionReasons({});
      } catch (e) {
        console.error("Proceed anyway failed:", e);
        alert(e.message || "Something went wrong while updating your trip.");
      } finally {
        setIsSavingArrival(false);
      }
    };

    const handleAvoidItem = async (itemName) => {
        // 0. Resolve the correct current packing list (same logic as render)
        let aiPlanObj = null;
        let tripDetailsObj = null;
        try {
            if (selectedTrip.aiPlanJson) aiPlanObj = JSON.parse(selectedTrip.aiPlanJson);
            if (selectedTrip.tripDataJson) tripDetailsObj = JSON.parse(selectedTrip.tripDataJson);
        } catch(e) {}
        
        const oldPackingList = tripDetailsObj?.aiPacking?.categories || aiPlanObj?.packingList || aiPlanObj?.packing_list || [];

        // 1. Calculate new packing list
        const newPackingList = oldPackingList.map(cat => ({
            ...cat,
            items: (cat.items || []).filter(item => (typeof item === 'string' ? item : item.name) !== itemName)
        })).filter(cat => cat.items.length > 0);

        const updatedAiPlan = aiPlanObj ? { ...aiPlanObj, packingList: newPackingList } : null;
        const updatedTripData = tripDetailsObj ? { 
            ...tripDetailsObj, 
            aiPacking: { ...tripDetailsObj.aiPacking, categories: newPackingList } 
        } : null;

        // 2. Recalculate Checklist State (Mapping old indices to new ones)
        const newCheckedState = {};
        oldPackingList.forEach((cat, catIdx) => {
            const newCatIdx = newPackingList.findIndex(nc => (nc.name || nc.category) === (cat.name || cat.category));
            if (newCatIdx === -1) return;

            cat.items?.forEach((item, itemIdx) => {
                const name = typeof item === 'string' ? item : item.name;
                if (name === itemName) return;

                const key = `${catIdx}-${itemIdx}`;
                if (arrivalCheckedState[key] || startCheckedState[key]) {
                    const newItemIdx = newPackingList[newCatIdx].items.findIndex(ni => (typeof ni === 'string' ? ni : ni.name) === name);
                    if (newItemIdx !== -1) {
                        newCheckedState[`${newCatIdx}-${newItemIdx}`] = true;
                    }
                }
            });
        });

        try {
            // 3. Save to TripPlans (updates AiPlanJson) via direct deep removal in Backend
            await removeItemFromDb(selectedTrip.id, itemName);
            
            // 4. Save to StartedTrips (updates CheckedItemsJson)
            await saveChecklistState(selectedTrip.id, JSON.stringify(newCheckedState));

            // 5. Update local state
            const updatedTrip = {
                ...selectedTrip,
                aiPlanJson: updatedAiPlan ? JSON.stringify(updatedAiPlan) : selectedTrip.aiPlanJson,
                tripDataJson: updatedTripData ? JSON.stringify(updatedTripData) : selectedTrip.tripDataJson
            };

            setSelectedTrip(updatedTrip);
            setActivePackingList(newPackingList);
            setArrivalCheckedState(newCheckedState);
            setStartCheckedState(newCheckedState);
            
            // 6. Update predictions view
            if (lostItemPredictions) {
                const remainingPredictions = lostItemPredictions.predictions.filter(p => p.itemName !== itemName);
                if (remainingPredictions.length === 0) {
                    setLostItemPredictions(null);
                } else {
                    setLostItemPredictions({
                        ...lostItemPredictions,
                        predictions: remainingPredictions
                    });
                }
            }
        } catch (e) {
            console.error("Avoid failed", e);
            alert("Failed to discard item. Please try again.");
        }
    };

    const handleToggleArrivalItem = (key) => {
      setArrivalCheckedState(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    const handleToggleArrivalCategory = (catIdx) => {
      const category = activePackingList[catIdx];
      const items = category.items || [];
      const allSelected = items.length > 0 && items.every((_, itemIdx) => arrivalCheckedState[`${catIdx}-${itemIdx}`]);
      
      const nextState = { ...arrivalCheckedState };
      items.forEach((_, itemIdx) => {
        nextState[`${catIdx}-${itemIdx}`] = !allSelected;
      });
      setArrivalCheckedState(nextState);
    };

    const handleSaveTimeEdit = async (dayNum, actIdx) => {
      if (!newTimeValue) {
        setEditingTimeKey(null);
        return;
      }
      
      setIsUpdatingTime(true);
      try {
        await updateActivityTime(selectedTrip.id, dayNum, actIdx, newTimeValue);
        
        // Update local state to reflect change immediately
        const aiPlanObj = JSON.parse(selectedTrip.aiPlanJson);
        const day = aiPlanObj.itinerary.find(d => d.day === dayNum);
        if (day && day.activities[actIdx]) {
          day.activities[actIdx].time = newTimeValue;
          selectedTrip.aiPlanJson = JSON.stringify(aiPlanObj);
        }
        
        setEditingTimeKey(null);
      } catch (e) {
        console.error("Failed to update time", e);
        alert("Failed to update time.");
      } finally {
        setIsUpdatingTime(false);
      }
    };

    const handleSaveStartTimeEdit = async () => {
      if (!newStartTimeValue) {
        setIsEditingStartTime(false);
        return;
      }
      
      setIsUpdatingStartTime(true);
      try {
        // Create new date object with the new time
        const currentStartDate = new Date(selectedTrip.startDate);
        const [hours, minutes] = newStartTimeValue.split(':');
        currentStartDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        // Format to local date-time string that backend can parse without UTC shift
        const year = currentStartDate.getFullYear();
        const month = String(currentStartDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentStartDate.getDate()).padStart(2, '0');
        const localIsoString = `${year}-${month}-${day}T${newStartTimeValue}:00`;
        
        console.log(`[DEBUG] Updating Trip ${selectedTrip.id} to ${localIsoString}`);
        await updateTripStartTime(selectedTrip.id, localIsoString);
        
        // Update local state correctly using setter to trigger re-render
        const updatedTrip = { ...selectedTrip, startDate: localIsoString };
        setSelectedTrip(updatedTrip);
        
        // Also update the trips list so the change persists if we go back
        setTrips(prev => prev.map(t => t.id === selectedTrip.id ? updatedTrip : t));
        
        setIsEditingStartTime(false);
      } catch (e) {
        console.error("Failed to update trip start time", e);
        alert("Failed to update trip start time.");
      } finally {
        setIsUpdatingStartTime(false);
      }
    };

    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={handleBack} 
            className="text-sm font-bold opacity-60 hover:opacity-100 flex items-center gap-2 transition-opacity text-indigo-400"
          >
            ← Back to Explorations
          </button>
          
          <div className="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
            <button 
              onClick={handleDeleteTrip}
              disabled={isDeleting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 border border-red-500/20 disabled:opacity-50 flex-1 sm:flex-initial justify-center"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>
            <button 
              onClick={() => {
                if (setSelectedChecklistTrip) setSelectedChecklistTrip(selectedTrip);
                setActiveTab('checklist');
              }}
              className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-indigo-600 dark:text-indigo-400 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 flex-1 sm:flex-initial justify-center"
            >
              <CheckSquare size={16} /> <span>View Checklist</span>
            </button>
            <button 
              onClick={handleStartTripClick}
              className={`${
                ongoingTrips[selectedTrip.id] 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              } text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2`}
            >
              {ongoingTrips[selectedTrip.id] ? (
                <><PartyPopper size={16} /> Ongoing Trip 🎉</>
              ) : (
                <><Play size={16} /> Start Trip</>
              )}
            </button>
          </div>
        </div>

        <div className={`p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-2xl ${theme === 'light' ? 'bg-white border-black/5' : 'bg-black/20 border-white/5'}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 justify-between mb-8 pb-8 border-b border-indigo-500/20">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black mb-2">{selectedTrip.destination}</h1>
              <p className="text-sm sm:base opacity-60 flex items-center gap-2 font-medium">
                <MapPin size={16} /> From {selectedTrip.startingLocation || 'Unknown Origin'}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <div className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <Calendar size={16} />
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-sm">{new Date(selectedTrip.startDate).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1 group/starttime">
                    {isEditingStartTime ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input 
                          type="time" 
                          value={newStartTimeValue}
                          onChange={(e) => setNewStartTimeValue(e.target.value)}
                          className={`text-[10px] font-bold px-1 py-0.5 rounded border focus:outline-none focus:border-indigo-500 ${theme === 'light' ? 'bg-white border-black/10' : 'bg-black/40 border-white/10'}`}
                          autoFocus
                        />
                        <button 
                          onClick={handleSaveStartTimeEdit}
                          disabled={isUpdatingStartTime}
                          className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                        >
                          {isUpdatingStartTime ? <Loader2 size={8} className="animate-spin" /> : <Check size={8} />}
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] opacity-60 font-bold">
                          {new Date(selectedTrip.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button 
                          onClick={() => {
                            const date = new Date(selectedTrip.startDate);
                            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                            setNewStartTimeValue(timeStr);
                            setIsEditingStartTime(true);
                          }}
                          className="opacity-0 group-hover/starttime:opacity-100 transition-opacity p-0.5 hover:bg-indigo-500/10 rounded text-indigo-500"
                        >
                          <Edit3 size={10} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                <Users size={16} />
                <span className="font-bold text-xs sm:text-sm">{selectedTrip.travelers}</span>
              </div>
            </div>
          </div>

          {/* Google Maps Integration */}
          <div className="mb-8 w-full h-[250px] sm:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-indigo-500/10">
             {aiPlan && isLoaded ? (
                  <TripMap 
                    aiTripPlan={aiPlan} 
                    transportMode={tripDetails?.transport || 'car'} 
                    theme={theme} 
                    isLoaded={isLoaded} 
                    currentLocationIndex={currentLocationIndex}
                  />
             ) : (
                 <iframe
                   width="100%"
                   height="100%"
                   frameBorder="0"
                   style={{ border: 0 }}
                   src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedTrip.destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                   allowFullScreen
                   title="Trip Destination Map"
                 ></iframe>
             )}
          </div>

          {aiPlan && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-2">
                 Day-wise Itinerary
              </h2>
              <div className="space-y-4">
                {aiPlan.itinerary?.map((day, idx) => (
                  <div key={idx} className={`p-4 sm:p-6 rounded-2xl border ${theme === 'light' ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'}`}>
                    <h3 className="font-bold text-lg mb-4 text-indigo-500">Day {day.day}: {day.title}</h3>
                    <div className="space-y-4 pl-4 border-l-2 border-indigo-500/20">
                      {day.activities?.map((act, i) => {
                        // Calculate global activity index
                        let globalActivityIndex = 0;
                        for (let d = 0; d < idx; d++) {
                          const dayActivities = aiPlan.itinerary[d]?.activities;
                          if (Array.isArray(dayActivities)) {
                            globalActivityIndex += dayActivities.length;
                          }
                        }
                        globalActivityIndex += i;

                        const isHere = currentLocationIndex === globalActivityIndex;

                        return (
                          <div key={i} className="relative flex justify-between items-start">
                            <div className="flex-1">
                              <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${isHere ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-indigo-500'}`}></div>
                              
                              <div className="flex items-center gap-2 mb-1">
                                {editingTimeKey === `${day.day}-${i}` ? (
                                  <div className="flex items-center gap-1">
                                    <input 
                                      type="text" 
                                      value={newTimeValue}
                                      onChange={(e) => setNewTimeValue(e.target.value)}
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded border focus:outline-none focus:border-indigo-500 ${theme === 'light' ? 'bg-white border-black/10' : 'bg-black/40 border-white/10'}`}
                                      autoFocus
                                    />
                                    <button 
                                      onClick={() => handleSaveTimeEdit(day.day, i)}
                                      disabled={isUpdatingTime}
                                      className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                                    >
                                      {isUpdatingTime ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="group/time flex items-center gap-2">
                                    <p className="text-[10px] font-bold opacity-50">{act.time}</p>
                                    <button 
                                      onClick={() => {
                                        setEditingTimeKey(`${day.day}-${i}`);
                                        setNewTimeValue(act.time);
                                      }}
                                      className="opacity-0 group-hover/time:opacity-100 transition-opacity p-1 hover:bg-indigo-500/10 rounded text-indigo-500"
                                    >
                                      <Edit3 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <p className="font-medium text-sm flex items-center gap-2">
                                {act.activity} at {act.location}
                                {isHere && (
                                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] rounded-full flex items-center gap-1 animate-pulse">
                                    <MapPin size={8} /> We are here
                                  </span>
                                )}
                              </p>
                            </div>
                            
                            {ongoingTrips[selectedTrip.id] && globalActivityIndex === currentLocationIndex + 1 && (
                              <button 
                                onClick={() => handleUpdateLocation(globalActivityIndex)}
                                className="text-[10px] font-bold px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition-all flex items-center gap-1"
                              >
                                <Navigation size={10} /> Update Location
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!aiPlan && (
             <div className="py-12 flex flex-col items-center justify-center opacity-40">
                <Compass size={40} className="mb-4" />
                <p className="font-bold">Detailed itinerary data not found for this trip.</p>
             </div>
          )}
        </div>

        {/* Start Trip Modal */}
        {showStartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className={`w-full max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col border shadow-2xl ${theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1a1b26] border-white/10'}`}
            >
              <div className="p-6 border-b flex justify-between items-center bg-indigo-500/10 border-indigo-500/20">
                <div>
                  <h2 className="text-2xl font-black text-indigo-500 flex items-center gap-2">
                    <Play size={24} /> Start Trip Checklist
                  </h2>
                  <p className="text-sm opacity-60 font-medium mt-1">Please ensure you have all items before you leave!</p>
                </div>
                <button onClick={() => setShowStartModal(false)} className="opacity-50 hover:opacity-100 p-2">✕</button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                {activePackingList.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center opacity-50 border border-dashed border-current rounded-2xl">
                    <CheckSquare size={40} className="mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Checklist Found</h3>
                    <p className="text-sm">We couldn't find a packing list for this trip in the database.</p>
                  </div>
                ) : (
                  activePackingList.map((category, catIdx) => {
                    const items = category.items || [];
                    const allSelected = items.length > 0 && items.every((_, itemIdx) => startCheckedState[`${catIdx}-${itemIdx}`]);
                    
                    return (
                    <div key={catIdx}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold opacity-80">{category.name || category.category || "General"}</h3>
                        <button 
                          onClick={() => handleToggleCategory(catIdx)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            allSelected 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'
                          }`}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item, itemIdx) => {
                          const key = `${catIdx}-${itemIdx}`;
                          const isChecked = startCheckedState[key];
                          return (
                            <div 
                              key={itemIdx} 
                              onClick={() => handleToggleStartItem(key)}
                              className={`flex justify-between items-center p-3 rounded-xl cursor-pointer border transition-all ${
                                isChecked 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                                  : theme === 'light' ? 'bg-black/5 border-black/5 hover:bg-black/10' : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                            >
                              <span className={`text-sm font-medium ${isChecked ? 'line-through opacity-70' : ''}`}>
                                {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                              </span>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isChecked 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-gray-400'
                              }`}>
                                {isChecked && <CheckSquare size={14} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>

              <div className="p-6 border-t border-white/10 bg-black/5 dark:bg-white/5">
                {strictDisclaimer && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">Cannot Proceed!</p>
                      <p className="opacity-90">{strictDisclaimer}</p>
                    </div>
                  </motion.div>
                )}

                {showForgetWarning && !strictDisclaimer && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3 text-orange-600 dark:text-orange-400">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold">You forgot something!</p>
                      <p className="opacity-80">There are unchecked items on your list. Are you sure you want to proceed without them?</p>
                      <p className="opacity-60 text-xs mt-1">If you proceed, these items will be removed from your trip checklist.</p>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowStartModal(false)} className="px-5 py-2.5 rounded-xl font-bold opacity-60 hover:opacity-100 transition-opacity">
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmStart}
                    disabled={isSavingChecklist}
                    className={`px-6 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg ${
                      showForgetWarning ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                    }`}
                  >
                    {isSavingChecklist ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    {showForgetWarning ? 'Proceed Anyway' : 'Confirm & Start'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className={`w-full max-w-md rounded-[2rem] overflow-hidden flex flex-col border shadow-2xl ${theme === 'light' ? 'bg-white border-black/10' : 'bg-[#1a1b26] border-white/10'}`}
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-black mb-2">Delete Trip?</h2>
                <p className="opacity-60 text-sm mb-8">
                  Are you sure you want to delete <strong className="opacity-100">{selectedTrip.destination}</strong>? This action cannot be undone and all associated checklist data will be lost.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isDeleting ? 'Deleting...' : 'Delete Trip'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Arrival Confirmation Modal */}
        {showArrivalModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className={`w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col border shadow-2xl ${theme === 'light' ? 'bg-white border-black/10' : 'bg-[#0f111a] border-white/10'}`}
            >
              <div className="p-5 sm:p-8 border-b bg-emerald-500/10 border-emerald-500/20 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isPredictingLost ? <Loader2 size={24} className="text-emerald-500 animate-spin" /> : <MapPin size={24} className="text-emerald-500" />}
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-emerald-500">
                  {lostItemPredictions ? "You Forgot Something!" : "Arrived at Destination!"}
                </h2>
                <p className="opacity-60 text-xs sm:text-sm font-medium mt-1">
                  {lostItemPredictions 
                    ? "Our AI has predicted where your items might be." 
                    : "Please confirm you have all your items before proceeding."}
                </p>
              </div>

              {lostItemPredictions ? (
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6 bg-indigo-500/5">
                  <div className="flex items-center gap-3 text-indigo-600 mb-4">
                    <AlertCircle size={24} />
                    <h3 className="text-xl font-bold">Lost Item AI Analysis</h3>
                  </div>
                  <p className="text-sm opacity-70 mb-6 font-medium">{lostItemPredictions.generalAdvice}</p>
                  
                  {lostItemPredictions.predictions.map((p, pIdx) => (
                    <div key={pIdx} className={`p-6 rounded-3xl border transition-all ${p.isMandatory ? 'border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/5' : 'border-indigo-500/20 bg-white/50 dark:bg-white/5 shadow-sm'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            {p.itemName} 
                            {p.isMandatory && <span className="text-[9px] px-2 py-0.5 bg-red-500 text-white rounded-full uppercase tracking-widest font-black animate-pulse">Critical</span>}
                          </h4>
                          <p className="text-sm text-indigo-600 font-black mt-1 flex items-center gap-1">
                            <MapPin size={12} /> Possible Location: {p.predictedLocation}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleAvoidItem(p.itemName)}
                          className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-tighter"
                        >
                          Discard Item
                        </button>
                      </div>
                      <p className="text-sm opacity-70 italic mb-4 font-medium leading-relaxed">"{p.explanation}"</p>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Reason for proceeding without item:</label>
                        <input 
                          type="text"
                          placeholder="Why are you leaving this behind?"
                          className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all ${theme === 'light' ? 'bg-white border-black/10 focus:border-indigo-500' : 'bg-black/20 border-white/10 focus:border-indigo-500'}`}
                          value={omissionReasons[p.itemName] || ''}
                          onChange={(e) => setOmissionReasons(prev => ({ ...prev, [p.itemName]: e.target.value }))}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                     <button 
                       onClick={() => setLostItemPredictions(null)}
                       className="flex-1 py-4 rounded-2xl font-bold bg-black/5 dark:bg-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10"
                     >
                       ← Go Back & Double Check
                     </button>
                     <button 
                       onClick={handleProceedAnyway}
                       disabled={isSavingArrival}
                       className="flex-[2] py-4 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                     >
                       {isSavingArrival ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                       Confirm & Proceed Anyway
                     </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
                    {activePackingList.map((category, catIdx) => {
                      const items = category.items || [];
                      const allSelected = items.length > 0 && items.every((_, itemIdx) => arrivalCheckedState[`${catIdx}-${itemIdx}`]);
                      
                      return (
                        <div key={catIdx}>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold opacity-90">{category.name || "General"}</h3>
                            <button 
                              onClick={() => handleToggleArrivalCategory(catIdx)}
                              className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                                allSelected 
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                  : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20'
                              }`}
                            >
                              {allSelected ? 'Deselect All' : 'Select All Items'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map((item, itemIdx) => {
                              const key = `${catIdx}-${itemIdx}`;
                              const isChecked = arrivalCheckedState[key];
                              return (
                                <div 
                                  key={itemIdx} 
                                  onClick={() => handleToggleArrivalItem(key)}
                                  className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer border transition-all ${
                                    isChecked 
                                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
                                      : theme === 'light' ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'
                                  }`}
                                >
                                  <span className={`text-sm font-bold ${isChecked ? 'opacity-100' : 'opacity-60'}`}>
                                    {typeof item === 'string' ? item : item.name}
                                  </span>
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                    isChecked 
                                      ? 'bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                                      : 'border-gray-400 opacity-30'
                                  }`}>
                                    {isChecked && <CheckSquare size={14} />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 sm:p-8 border-t border-white/10 bg-black/5 dark:bg-white/5 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={() => setShowArrivalModal(false)}
                      disabled={isSavingArrival || isPredictingLost}
                      className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold bg-black/10 dark:bg-white/10 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleConfirmArrival}
                      disabled={isSavingArrival || isPredictingLost}
                      className="py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-first sm:order-last"
                    >
                      {isSavingArrival || isPredictingLost ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <PartyPopper size={18} />
                      )}
                      <span className="text-sm sm:text-base">
                        {isPredictingLost ? 'Analyzing Items...' : isSavingArrival ? 'Updating Location...' : 'Confirm Arrival'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
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
            My Trips <span className="text-indigo-500">🌍</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg opacity-40 font-medium tracking-tight">
            Review your past and upcoming adventures.
          </motion.p>
        </div>
        <motion.button 
          variants={itemVariants}
          onClick={() => setActiveTab('plan-trip')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          Plan New Trip
        </motion.button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
          <p className="font-bold opacity-60">Loading your trips...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-center">
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div className="py-20 glass rounded-[2.5rem] border-dashed border-white/10 flex flex-col items-center justify-center opacity-40 text-center">
          <Compass size={60} className="mb-4" />
          <h3 className="text-2xl font-black tracking-tight mb-2">No trips found</h3>
          <p className="font-medium">You haven't saved any trip plans yet.</p>
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
                  <MapPin size={24} />
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
              
              <div className="flex items-center gap-4 text-sm font-bold opacity-80 border-t pt-4 border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{trip.travelers}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyTrips;
