import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Users, Plane, Train, Bus, Car, Bike, Footprints, Ship, Truck, TramFront, Clock,
  DollarSign, Home, CheckSquare, Sparkles, ArrowRight, ArrowLeft,
  Map as MapIcon, ChevronRight, Edit3, Save, Package, Navigation, Utensils, Heart, Plus, Loader2
} from 'lucide-react';
import { getTransportSuggestion, getPreferenceSuggestion, getBudgetEstimate, getActivitySuggestions, getPackingSuggestions, generateTripPlan } from '../../services/aiService';
import { saveTripPlan } from '../../services/tripService';
import { GoogleMap, useJsApiLoader, Marker, Polyline, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const steps = [
  { id: 1, title: 'Basics' },
  { id: 2, title: 'Transport' },
  { id: 3, title: 'Preferences' },
  { id: 4, title: 'Packing' },
  { id: 5, title: 'AI Plan' },
  { id: 6, title: 'Review' }
];

import TripMap from './TripMap';

const PlanTrip = ({ theme, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isSuggestingPref, setIsSuggestingPref] = useState(false);
  const [aiPreference, setAiPreference] = useState(null);
  const [budgetEstimate, setBudgetEstimate] = useState(null);
  const [isEstimatingBudget, setIsEstimatingBudget] = useState(false);
  const [aiActivities, setAiActivities] = useState(null);
  const [isFetchingActivities, setIsFetchingActivities] = useState(false);
  const [aiPacking, setAiPacking] = useState(null);
  const [isSuggestingPacking, setIsSuggestingPacking] = useState(false);
  const [newPackingItem, setNewPackingItem] = useState('');
  const [aiTripPlan, setAiTripPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      const payload = {
        destination: tripData.destination,
        startingLocation: tripData.startingLocation,
        startDate: tripData.startDate ? new Date(`${tripData.startDate}T${tripData.startTime || '00:00'}`).toISOString() : new Date().toISOString(),
        endDate: tripData.endDate || new Date().toISOString(),
        travelers: tripData.travelers,
        tripData: {
          ...tripData,
          aiSuggestion,
          aiPreference,
          budgetEstimate,
          aiActivities,
          aiPacking
        },
        aiPlan: aiTripPlan
      };
      await saveTripPlan(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to save trip:", error);
      alert("Failed to save trip. Please ensure you are logged in.");
    } finally {
      setIsSaving(false);
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDT1B7JIH_xNNgqO2E9ruBACSu43Qee9mg" // Replace with actual key
  });
  const [tripData, setTripData] = useState({
    destination: '',
    startingLocation: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    travelers: 1,
    transport: 'flight',
    budgetMode: 'AI',
    budgetRange: { min: 25000, max: 80000 },
    budgetStyle: 'Standard',
    tripType: 'adventure',
    foodPreferences: 'local',
    stayType: 'hotel',
    packingItems: ['Passport', 'Charger', 'Camera', 'Comfortable Shoes']
  });

  const updateData = (key, value) => {
    setTripData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchEstimate = async () => {
      if (tripData.destination.length > 2 && tripData.startingLocation.length > 2) {
        setIsEstimatingBudget(true);
        try {
          const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
          const estimate = await getBudgetEstimate(tripData.startingLocation, tripData.destination, datesStr, tripData.travelers);
          setBudgetEstimate(estimate);
        } catch (error) {
          console.error('Budget Estimate Error:', error);
        } finally {
          setIsEstimatingBudget(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchEstimate();
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [tripData.destination, tripData.startingLocation, tripData.startDate, tripData.endDate, tripData.travelers]);

  const handleTransportSelect = async (modeId) => {
    updateData('transport', modeId);
    setIsSuggesting(true);
    try {
      const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
      const suggestion = await getTransportSuggestion(tripData.startingLocation, tripData.destination, datesStr, modeId);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('AI Suggestion Error:', error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const fetchActivities = async (type) => {
    if (!tripData.destination) return;
    setIsFetchingActivities(true);
    try {
      const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
      const activities = await getActivitySuggestions(tripData.startingLocation, tripData.destination, datesStr, type, tripData.travelers);
      setAiActivities(activities);
    } catch (error) {
      console.error('Activities Error:', error);
    } finally {
      setIsFetchingActivities(false);
    }
  };

  const handleTripTypeChange = (type) => {
    updateData('tripType', type.toLowerCase());
    fetchActivities(type);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      setIsSuggesting(true);
      setCurrentStep(2);
      try {
        const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
        const suggestion = await getTransportSuggestion(tripData.startingLocation, tripData.destination, datesStr);
        setAiSuggestion(suggestion);
        if (suggestion && suggestion.recommendedMode) {
          updateData('transport', suggestion.recommendedMode.toLowerCase());
        }
      } catch (error) {
        console.error('AI Suggestion Error:', error);
      } finally {
        setIsSuggesting(false);
      }
    } else if (currentStep === 2) {
      setIsSuggestingPref(true);
      setCurrentStep(3);
      try {
        const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
        const suggestion = await getPreferenceSuggestion(
          tripData.startingLocation,
          tripData.destination,
          datesStr,
          tripData.travelers,
          tripData.transport,
          tripData.budgetMode,
          tripData.budgetRange,
          tripData.budgetStyle
        );
        setAiPreference(suggestion);
        if (suggestion) {
          let budgetVal = 50;
          const budgStr = (suggestion.budget || '').toLowerCase();
          if (budgStr.includes('backpacker')) budgetVal = 20;
          else if (budgStr.includes('luxury') || budgStr.includes('5-star')) budgetVal = 90;
          else if (budgStr.includes('comfortable')) budgetVal = 75;
          else if (budgStr.includes('standard')) budgetVal = 50;

          const tt = (suggestion.tripType && suggestion.tripType[0]) ? suggestion.tripType[0].toLowerCase() : tripData.tripType;
          const fd = (suggestion.food && suggestion.food[0]) ? suggestion.food[0].toLowerCase() : tripData.foodPreferences;
          const st = (suggestion.stay) ? suggestion.stay.toLowerCase().replace('apartment', 'apt') : tripData.stayType;

          setTripData(prev => ({
            ...prev,
            budget: budgetVal,
            tripType: tt,
            foodPreferences: fd,
            stayType: st
          }));
        }
      } catch (error) {
        console.error('AI Preference Error:', error);
      } finally {
        setIsSuggestingPref(false);
      }
    } else if (currentStep === 3) {
      setIsSuggestingPacking(true);
      setCurrentStep(4);
      try {
        const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
        const suggestion = await getPackingSuggestions(
          tripData.destination,
          tripData.startingLocation,
          datesStr,
          tripData.travelers,
          tripData.transport,
          tripData.tripType,
          tripData.foodPreferences,
          tripData.stayType,
          tripData.budgetStyle
        );
        setAiPacking(suggestion);
      } catch (error) {
        console.error('AI Packing Error:', error);
      } finally {
        setIsSuggestingPacking(false);
      }
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleRegeneratePacking = async () => {
    setIsSuggestingPacking(true);
    try {
      const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
      const suggestion = await getPackingSuggestions(
        tripData.destination,
        tripData.startingLocation,
        datesStr,
        tripData.travelers,
        tripData.transport,
        tripData.tripType,
        tripData.foodPreferences,
        tripData.stayType,
        tripData.budgetStyle
      );
      setAiPacking(suggestion);
    } catch (error) {
      console.error('AI Packing Error:', error);
    } finally {
      setIsSuggestingPacking(false);
    }
  };

  const togglePackingItem = (categoryIndex, itemIndex) => {
    if (!aiPacking) return;
    const newPacking = { ...aiPacking };
    newPacking.categories[categoryIndex].items.splice(itemIndex, 1);
    setAiPacking(newPacking);
  };

  const handleAddPackingItem = (e, categoryIndex) => {
    if (e.key === 'Enter' && newPackingItem.trim()) {
      const newPacking = { ...aiPacking };
      newPacking.categories[categoryIndex].items.push(newPackingItem.trim());
      setAiPacking(newPacking);
      setNewPackingItem('');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const datesStr = (tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : '';
      const plan = await generateTripPlan(
        tripData.startingLocation,
        tripData.destination,
        tripData.startDate,
        tripData.endDate,
        tripData.travelers,
        tripData.transport,
        tripData.budgetMode,
        tripData.budgetRange.min,
        tripData.budgetRange.max,
        tripData.budgetStyle,
        tripData.tripType,
        tripData.foodPreferences,
        tripData.stayType
      );
      setAiTripPlan(plan);
      setCurrentStep(6);
    } catch (error) {
      console.error('AI Trip Plan Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-8 pb-20 relative"
    >
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden border ${
                theme === 'light' ? 'bg-white border-black/5' : 'bg-[#0f111a] border-white/10'
              }`}
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
                  <Plane size={40} className="text-white ml-2" />
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tighter">Happy Journey! ✨</h2>
                <p className="opacity-70 font-medium mb-8 leading-relaxed">
                  Your amazing trip to <strong className="text-indigo-500">{tripData.destination}</strong> has been perfectly crafted and securely saved to your account.
                </p>
                
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setActiveTab('my-trips');
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/30 hover:-translate-y-1 active:scale-95"
                >
                  View My Trips
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Plan New Trip
          </h1>
          <p className="text-lg opacity-60 font-medium tracking-tight">
            Let AI craft your perfect journey.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Premium Sliding Pill Stepper Navigation */}
      <div className="hidden md:flex justify-center mb-8">
        <div className={`flex items-center p-1.5 rounded-[2rem] border shadow-sm backdrop-blur-xl relative overflow-hidden ${theme === 'light' ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            // Map icons based on step id
            const Icon = step.id === 1 ? MapPin : step.id === 2 ? Navigation : step.id === 3 ? Heart : step.id === 4 ? Package : step.id === 5 ? Sparkles : CheckSquare;
            
            return (
              <div
                key={step.id}
                className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-500 z-10 ${isActive ? 'text-white' : isCompleted ? (theme === 'light' ? 'text-indigo-600' : 'text-indigo-400') : (theme === 'light' ? 'text-black/40 hover:text-black/60' : 'text-white/40 hover:text-white/60')}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full -z-10 shadow-lg shadow-indigo-500/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                   {isCompleted ? <CheckSquare size={16} /> : <Icon size={16} />}
                </div>
                <span>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass p-6 md:p-10 rounded-[2.5rem] border-[var(--glass-border)] bg-gradient-to-br from-[var(--text-main)]/[0.02] to-transparent min-h-[500px] relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* Step 1: Basics */}
          {currentStep === 1 && (
            <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">Where do you want to go?</h2>
                <p className="opacity-60">Enter your destination and basic trip details.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* LEFT SIDE: Main Inputs */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-60 ml-2">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                      <input type="text" placeholder="e.g. Tokyo, Japan" className={`w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black placeholder-black/40' : 'bg-white/5 border border-white/10'}`} value={tripData.destination} onChange={e => updateData('destination', e.target.value)} />
                    </div>
                    {tripData.destination && tripData.destination.length > 2 && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="ml-2 mt-2 flex flex-col gap-1">
                        {isEstimatingBudget ? (
                          <p className="text-xs text-indigo-400 font-bold flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> Analyzing AI budget estimate...</p>
                        ) : budgetEstimate ? (
                          <>
                            <p className="text-xs text-indigo-400 font-bold flex items-center gap-1"><Sparkles size={12} /> Estimated budget for this trip: ₹{budgetEstimate.estimatedMin?.toLocaleString()} – ₹{budgetEstimate.estimatedMax?.toLocaleString()}</p>
                            <p className="text-xs text-green-400 font-bold flex items-center gap-1"><Calendar size={12} /> Best time to save money: {budgetEstimate.bestTime}</p>
                          </>
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-60 ml-2">Starting Location</label>
                    <div className="relative">
                      <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                      <input type="text" placeholder="e.g. New York, USA" className={`w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black placeholder-black/40' : 'bg-white/5 border border-white/10'}`} value={tripData.startingLocation} onChange={e => updateData('startingLocation', e.target.value)} />
                    </div>
                  </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-60 ml-2">Start Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full rounded-2xl py-4 pl-10 pr-2 focus:outline-none focus:border-indigo-500 transition-colors text-sm ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black [color-scheme:light]' : 'bg-white/5 border border-white/10 [color-scheme:dark]'}`}
                            value={tripData.startDate}
                            onChange={e => updateData('startDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-60 ml-2">Start Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                          <input
                            type="time"
                            className={`w-full rounded-2xl py-4 pl-10 pr-2 focus:outline-none focus:border-indigo-500 transition-colors text-sm ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black [color-scheme:light]' : 'bg-white/5 border border-white/10 [color-scheme:dark]'}`}
                            value={tripData.startTime}
                            onChange={e => updateData('startTime', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-60 ml-2">End Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                          <input
                            type="date"
                            min={tripData.startDate || new Date().toISOString().split('T')[0]}
                            className={`w-full rounded-2xl py-4 pl-10 pr-2 focus:outline-none focus:border-indigo-500 transition-colors text-sm ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black [color-scheme:light]' : 'bg-white/5 border border-white/10 [color-scheme:dark]'}`}
                            value={tripData.endDate}
                            onChange={e => updateData('endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold opacity-60 ml-2">Travelers</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                          <input type="number" min="1" className={`w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-indigo-500 transition-colors ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black' : 'bg-white/5 border border-white/10'}`} value={tripData.travelers} onChange={e => updateData('travelers', parseInt(e.target.value))} />
                        </div>
                      </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Smart Budget Card */}
                <div className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden ${tripData.budgetMode === 'AI' ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : theme === 'light' ? 'bg-white border-black/10 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DollarSign size={80} />
                  </div>

                  <h3 className="text-xl font-black mb-1 flex items-center gap-2">
                    <DollarSign size={20} className="text-indigo-400" />
                    Budget Planner
                  </h3>
                  <p className="text-sm opacity-60 font-medium mb-6">How do you want to plan?</p>

                  <div className="space-y-3 mb-6 relative z-10">
                    {[
                      { id: 'AI', label: 'AI Decide', hint: '(Recommended)' },
                      { id: 'Manual', label: 'Set My Budget', hint: '' },
                      { id: 'Ignore', label: 'Ignore Budget', hint: '' }
                    ].map(mode => (
                      <label key={mode.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${tripData.budgetMode === mode.id ? (theme === 'light' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-700' : 'bg-indigo-500/20 border-indigo-500 text-white') : (theme === 'light' ? 'bg-black/5 border-black/10 hover:bg-black/10 text-black/70' : 'bg-black/20 border-white/5 opacity-70 hover:opacity-100')}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tripData.budgetMode === mode.id ? 'border-indigo-400' : (theme === 'light' ? 'border-black/30' : 'border-white/40')}`}>
                          {tripData.budgetMode === mode.id && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                        </div>
                        <span className="font-bold text-sm">{mode.label} <span className="opacity-60 font-normal text-xs">{mode.hint}</span></span>
                        <input type="radio" name="budgetMode" value={mode.id} checked={tripData.budgetMode === mode.id} onChange={() => updateData('budgetMode', mode.id)} className="hidden" />
                      </label>
                    ))}
                  </div>

                  <AnimatePresence>
                    {tripData.budgetMode === 'Manual' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold opacity-60">Budget Range</label>
                            <span className="text-xs font-bold text-indigo-400">₹{tripData.budgetRange.min.toLocaleString()} - ₹{tripData.budgetRange.max.toLocaleString()}</span>
                          </div>

                          <div className="flex gap-4">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold text-sm">₹</span>
                              <input type="number" min="0" value={tripData.budgetRange.min} onChange={e => updateData('budgetRange', { ...tripData.budgetRange, min: parseInt(e.target.value) || 0 })} className={`w-full rounded-xl py-2 pl-7 pr-2 focus:outline-none focus:border-indigo-500 text-sm font-bold ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black' : 'bg-black/40 border border-white/10'}`} />
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 font-bold text-sm">₹</span>
                              <input type="number" min="0" value={tripData.budgetRange.max} onChange={e => updateData('budgetRange', { ...tripData.budgetRange, max: parseInt(e.target.value) || 0 })} className={`w-full rounded-xl py-2 pl-7 pr-2 focus:outline-none focus:border-indigo-500 text-sm font-bold ${theme === 'light' ? 'bg-black/5 border border-black/10 text-black' : 'bg-black/40 border border-white/10'}`} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold opacity-60">Style</label>
                          <div className="flex flex-wrap gap-2">
                            {['Budget 💸', 'Standard 👍', 'Comfortable 😊', 'Luxury 💎'].map(style => {
                              const styleName = style.split(' ')[0];
                              return (
                                <button key={style} onClick={() => updateData('budgetStyle', styleName)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tripData.budgetStyle === styleName ? 'bg-indigo-500 text-white' : (theme === 'light' ? 'bg-black/5 text-black/60 hover:bg-black/10' : 'bg-black/40 text-white/60 hover:bg-white/10')}`}>
                                  {style}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {tripData.budgetMode === 'AI' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 flex items-start gap-2">
                      <Sparkles size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium opacity-80 leading-relaxed text-indigo-100">
                        AI will optimize your trip based on your destination, dates, and realistic travel costs.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Transport */}
          {currentStep === 2 && (
            <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">How will you get there?</h2>
                <p className="opacity-60">Select your preferred mode of transportation.</p>
              </div>

              {aiSuggestion && aiSuggestion.isPossible === false && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl border flex items-start gap-4 ${theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-500/20 border-red-500/40'}`}>
                  <div className={`mt-1 ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${theme === 'light' ? 'text-red-700' : 'text-red-400'}`}>Not Recommended or Impossible</h3>
                    <p className={`text-sm opacity-90 ${theme === 'light' ? 'text-red-900' : 'text-red-200'}`}>{aiSuggestion.reason}</p>
                    {aiSuggestion.alternative && (
                      <p className={`text-sm mt-2 font-medium ${theme === 'light' ? 'text-red-800' : 'text-red-300'}`}>
                        Alternative: <span className={`${theme === 'light' ? 'text-black' : 'text-white'}`}>{aiSuggestion.alternative}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {[
                  { id: 'flight', icon: Plane, label: 'Flight', desc: 'Fastest' },
                  { id: 'train', icon: Train, label: 'Train', desc: 'Scenic' },
                  { id: 'bus', icon: Bus, label: 'Bus', desc: 'Cheapest' },
                  { id: 'car', icon: Car, label: 'Car', desc: 'Flexible' },
                  { id: 'rv', icon: Truck, label: 'RV', desc: 'Roadtrip' },
                  { id: 'ship', icon: Ship, label: 'Ship', desc: 'Nautical' },
                  { id: 'bike', icon: Bike, label: 'Bike', desc: 'Eco' },
                  { id: 'walk', icon: Footprints, label: 'Walk', desc: 'Intense' },
                  { id: 'subway', icon: TramFront, label: 'Subway', desc: 'Local' }
                ].map(mode => (
                  <div
                    key={mode.id}
                    onClick={() => handleTransportSelect(mode.id)}
                    className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 text-center ${tripData.transport === mode.id
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/20 scale-105'
                        : theme === 'light'
                          ? 'border-black/10 bg-black/5 hover:border-black/20 hover:bg-black/10'
                          : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <mode.icon size={24} className={tripData.transport === mode.id ? 'text-indigo-400' : (theme === 'light' ? 'text-black/60' : 'opacity-60')} />
                    <div className={theme === 'light' && tripData.transport !== mode.id ? 'text-black/80' : ''}>
                      <h3 className="text-xs font-bold">{mode.label}</h3>
                      <p className="text-[10px] opacity-50 uppercase tracking-wider">{mode.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {isSuggesting ? (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-4 min-h-[100px]">
                  <Loader2 className="text-indigo-400 animate-spin" size={24} />
                  <p className="text-sm opacity-80 font-medium">
                    AI is analyzing the best transport routes...
                  </p>
                </div>
              ) : aiSuggestion && aiSuggestion.isPossible !== false ? (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-4">
                  <Sparkles className="text-indigo-400 mt-1" size={20} />
                  <div className="text-sm opacity-80 leading-relaxed">
                    <strong className="text-indigo-400">AI Suggestion:</strong> {aiSuggestion.reason}
                    <div className="mt-2 flex gap-4 text-xs opacity-60">
                      {aiSuggestion.timeSaved && <span><strong>Time Saved:</strong> {aiSuggestion.timeSaved}</span>}
                      {aiSuggestion.alternative && <span><strong>Alternative:</strong> {aiSuggestion.alternative}</span>}
                    </div>
                    {aiSuggestion.tips && aiSuggestion.tips.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-xs opacity-70 space-y-1">
                        {aiSuggestion.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">Tailor your experience</h2>
                <p className="opacity-60">Tell us what you like and we'll handle the rest.</p>
              </div>

              {isSuggestingPref ? (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center gap-4 min-h-[100px]">
                  <Loader2 className="text-indigo-400 animate-spin" size={24} />
                  <p className="text-sm opacity-80 font-medium">
                    AI is analyzing travel duration and styles to suggest preferences...
                  </p>
                </div>
              ) : aiPreference ? (
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-4">
                  <Sparkles className="text-indigo-400 mt-1" size={20} />
                  <div className="text-sm opacity-80 leading-relaxed">
                    <strong className="text-indigo-400">AI Suggested Preferences:</strong> We've pre-filled your preferences below.
                    <p className="mt-1 opacity-70 italic">"{aiPreference.reason}"</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className={`text-sm font-bold opacity-60 ml-2 ${theme === 'light' ? 'text-black' : ''}`}>Budget Scale</label>
                    <span className="font-black text-indigo-400">
                      {tripData.budget < 33 ? 'Budget' : tripData.budget < 66 ? 'Standard' : 'Luxury'}
                    </span>
                  </div>
                  <input
                    type="range" min="1" max="100"
                    value={tripData.budget} onChange={e => updateData('budget', e.target.value)}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500 ${theme === 'light' ? 'bg-black/10' : 'bg-white/10'}`}
                  />
                  <div className={`flex justify-between text-xs opacity-40 font-bold px-2 ${theme === 'light' ? 'text-black' : ''}`}>
                    <span>Backpacker</span>
                    <span>Comfortable</span>
                    <span>5-Star</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold opacity-60 ml-2">Trip Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Adventure', 'Relaxation', 'Cultural', 'Nightlife', 'Nature', 'Family', 'Romantic', 'Business', 'Luxury'].map(type => (
                      <button key={type} onClick={() => handleTripTypeChange(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${tripData.tripType === type.toLowerCase() ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : theme === 'light' ? 'bg-black/5 border-black/5 text-black/60 hover:bg-black/10' : 'bg-white/5 border-white/5 opacity-70 hover:bg-white/10'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isFetchingActivities ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="text-indigo-400 animate-spin" size={24} />
                      <p className="text-xs font-bold opacity-60">Scouting best {tripData.tripType} spots...</p>
                    </motion.div>
                  ) : aiActivities && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <div className="flex items-center gap-2 ml-2">
                        <Sparkles size={16} className="text-indigo-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">AI Local Highlights</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiActivities.highlights.map((item, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            className={`p-4 rounded-[2rem] border transition-all ${theme === 'light' ? 'bg-white border-black/5 shadow-sm' : 'bg-white/5 border-white/10'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black px-2 py-1 bg-indigo-500 text-white rounded-lg uppercase tracking-tighter">
                                {item.type}
                              </span>
                              <span className="text-[10px] opacity-40 font-bold">{item.location}</span>
                            </div>
                            <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                            <p className="text-xs opacity-60 leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                            <div className="pt-3 border-t border-white/5">
                              <p className="text-[10px] italic opacity-40">"Matches {tripData.tripType} vibe: {item.whyMatch}"</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold opacity-60 ml-2">Food Scene</label>
                    <div className="space-y-2">
                      {['Street Food', 'Fine Dining', 'Vegan/Healthy', 'Traditional', 'Cafes', 'Luxury Tasting'].map(food => (
                        <div key={food} onClick={() => updateData('foodPreferences', food.toLowerCase())} className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${tripData.foodPreferences === food.toLowerCase() ? 'border-indigo-500 bg-indigo-500/10' : theme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-white/5'}`}>
                          <Utensils size={14} className={tripData.foodPreferences === food.toLowerCase() ? 'text-indigo-400' : 'opacity-40'} />
                          <span className={`text-xs font-medium ${theme === 'light' && tripData.foodPreferences !== food.toLowerCase() ? 'text-black/70' : ''}`}>{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold opacity-60 ml-2">Stay Preference</label>
                    <div className="space-y-2">
                      {['Hotel/Resort', 'Airbnb/Apt', 'Hostel', 'Boutique', 'Luxury Villa', 'Glamping'].map(stay => (
                        <div key={stay} onClick={() => updateData('stayType', stay.toLowerCase())} className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${tripData.stayType === stay.toLowerCase() ? 'border-indigo-500 bg-indigo-500/10' : theme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-white/5'}`}>
                          <Home size={14} className={tripData.stayType === stay.toLowerCase() ? 'text-indigo-400' : 'opacity-40'} />
                          <span className={`text-xs font-medium ${theme === 'light' && tripData.stayType !== stay.toLowerCase() ? 'text-black/70' : ''}`}>{stay}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Packing */}
          {currentStep === 4 && (
            <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-2">Smart Packing</h2>
                <p className="opacity-60">AI generated comprehensive checklist based on all your trip parameters.</p>
              </div>

              {isSuggestingPacking ? (
                <div className="p-8 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                  <Loader2 className="text-indigo-400 animate-spin" size={32} />
                  <p className="text-sm font-bold opacity-80 text-center">
                    Analyzing weather, transport limits, and activities for {tripData.destination}...
                  </p>
                </div>
              ) : aiPacking && aiPacking.categories ? (
                <div className={`rounded-[2rem] p-6 border ${theme === 'light' ? 'bg-white border-black/5 shadow-sm' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-indigo-500/20">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Sparkles size={18} />
                      <span>AI Master Checklist</span>
                    </div>
                    <button onClick={handleRegeneratePacking} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-white/10 hover:bg-white/20'}`}>
                      Regenerate
                    </button>
                  </div>

                  <div className="space-y-6">
                    {aiPacking.categories.map((category, catIdx) => (
                      <div key={catIdx} className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-60 ml-2">{category.name}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.items.map((item, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${theme === 'light' ? 'bg-black/5 hover:bg-black/10' : 'bg-white/5 hover:bg-white/10'}`}>
                              <div className="flex items-center gap-3">
                                <Package size={14} className="opacity-40" />
                                <span className={`text-sm font-medium ${theme === 'light' ? 'text-black/80' : ''}`}>{item}</span>
                              </div>
                              <button onClick={() => togglePackingItem(catIdx, idx)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1">
                                <CheckSquare size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className={`flex items-center gap-2 p-2 rounded-xl border border-dashed ${theme === 'light' ? 'border-black/20 bg-transparent' : 'border-white/20'}`}>
                          <Plus size={14} className="opacity-40 ml-2" />
                          <input
                            type="text"
                            placeholder={`Add to ${category.name} (Press Enter)`}
                            value={newPackingItem}
                            onChange={(e) => setNewPackingItem(e.target.value)}
                            onKeyDown={(e) => handleAddPackingItem(e, catIdx)}
                            className={`w-full bg-transparent border-none focus:outline-none text-sm font-medium ${theme === 'light' ? 'text-black/80 placeholder-black/30' : 'placeholder-white/30'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 opacity-60">
                  <p>Failed to load packing suggestions. Please try again.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Generation */}
          {currentStep === 5 && (
            <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center h-full min-h-[400px] text-center max-w-md mx-auto">
              {!isGenerating ? (
                <>
                  <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/50">
                    <Sparkles size={40} className="text-white" />
                  </div>
                  <h2 className="text-4xl font-black mb-4 tracking-tighter">Ready to magic?</h2>
                  <p className="opacity-60 mb-8 leading-relaxed">
                    Our AI will analyze weather patterns, local events, traffic, and your preferences to build the ultimate itinerary.
                  </p>
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-white text-black hover:bg-gray-100 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Generate My Trip Plan
                  </button>
                  <button
                    onClick={handlePrev}
                    className="mt-6 opacity-50 hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft size={16} /> Go Back to Packing
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mb-8"
                  />
                  <h3 className="text-2xl font-bold animate-pulse mb-2">Analyzing destinations...</h3>
                  <p className="opacity-50 text-sm">Finding the best local spots and optimizing routes.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 6: Review / Results */}
          {currentStep === 6 && aiTripPlan && (
            <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 border-white/10">
                <div>
                  <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {tripData.destination || 'Your Destination'} Itinerary
                  </h2>
                  <p className="opacity-80 flex items-center gap-2 text-sm font-medium">
                    <Calendar size={14} /> {(tripData.startDate && tripData.endDate) ? `${tripData.startDate} to ${tripData.endDate}` : 'Dates'} • {tripData.travelers} Traveler(s) • {aiTripPlan.summary}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(5)} className="glass px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Edit3 size={16} /> Edit
                  </button>
                  <button onClick={handleSaveTrip} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    {isSaving ? 'Saving...' : 'Save Trip'}
                  </button>
                </div>
              </div>

              {/* Overview Cards Panel (Budget, Stays, Tips) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Budget */}
                <div className={`p-6 rounded-[2rem] border transition-transform hover:scale-[1.02] ${theme === 'light' ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100' : 'bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/20'}`}>
                  <h4 className="font-black text-lg flex items-center gap-2 mb-4 text-emerald-500">
                    <DollarSign size={20} /> Budget Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm"><span className="opacity-70 font-medium">Transport</span><span className="font-bold">{aiTripPlan.budget?.transport}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="opacity-70 font-medium">Stay</span><span className="font-bold">{aiTripPlan.budget?.stay}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="opacity-70 font-medium">Food</span><span className="font-bold">{aiTripPlan.budget?.food}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="opacity-70 font-medium">Activities</span><span className="font-bold">{aiTripPlan.budget?.activities}</span></div>
                    <div className="pt-4 mt-2 border-t border-emerald-500/20 flex justify-between items-center">
                      <span className="font-black text-emerald-600 dark:text-emerald-400">Total Est.</span>
                      <span className="font-black text-2xl text-emerald-600 dark:text-emerald-400">{aiTripPlan.budget?.total}</span>
                    </div>
                  </div>
                </div>

                {/* Stay Suggestions */}
                <div className={`p-6 rounded-[2rem] border transition-transform hover:scale-[1.02] ${theme === 'light' ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100' : 'bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/20'}`}>
                  <h4 className="font-black text-lg flex items-center gap-2 mb-4 text-orange-500">
                    <Home size={20} /> Stay Suggestions
                  </h4>
                  <div className="space-y-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                    {aiTripPlan.staySuggestions?.map((stay, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-orange-100 shadow-sm' : 'bg-black/20 border-orange-500/20'}`}>
                        <p className="font-bold text-sm text-orange-600 dark:text-orange-400">{stay.type}</p>
                        <div className="flex justify-between items-center mt-1 opacity-80 text-xs">
                          <span className="font-medium truncate pr-2">{stay.area}</span>
                          <span className="font-black shrink-0">{stay.priceRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Tips */}
                <div className={`p-6 rounded-[2rem] border transition-transform hover:scale-[1.02] ${theme === 'light' ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100' : 'bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border-indigo-500/20'}`}>
                  <h4 className="font-black text-lg flex items-center gap-2 mb-4 text-indigo-500">
                    <Heart size={20} /> AI Tips & Alerts
                  </h4>
                  <ul className="space-y-3 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                    {aiTripPlan.tips?.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-medium opacity-80 leading-relaxed">
                        <Sparkles size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Main Split Layout: Timeline + Map */}
              <div className="flex flex-col xl:flex-row gap-6 xl:h-[700px]">

                {/* LEFT: Scrollable Timeline (65%) */}
                <div className={`xl:w-[65%] flex flex-col rounded-[2.5rem] border shadow-sm overflow-hidden ${theme === 'light' ? 'bg-white/50 border-black/5' : 'bg-white/5 border-white/10'}`}>
                  <div className={`p-6 border-b z-10 sticky top-0 backdrop-blur-xl ${theme === 'light' ? 'border-black/5 bg-white/50' : 'border-white/5 bg-black/20'}`}>
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <Footprints className="text-indigo-500" size={24} /> 
                      Day-wise Itinerary
                      <span className="ml-auto text-xs font-bold px-3 py-1 bg-indigo-500 text-white rounded-full">
                        {aiTripPlan.itinerary?.length || 0} Days
                      </span>
                    </h3>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {aiTripPlan.itinerary?.map((dayObj, idx) => (
                      <div key={idx} className={`rounded-[2rem] border transition-all ${theme === 'light' ? 'bg-white border-black/5 shadow-sm' : 'bg-black/20 border-white/5'} overflow-hidden group`}>
                        {/* Day Header */}
                        <div className={`p-5 flex items-center gap-4 border-b ${theme === 'light' ? 'border-black/5 bg-black/5' : 'border-white/5 bg-white/5'}`}>
                          <div className="flex flex-col items-center justify-center bg-indigo-500 text-white w-12 h-12 rounded-2xl shadow-lg shadow-indigo-500/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none">Day</span>
                            <span className="text-xl font-black leading-none mt-0.5">{dayObj.day}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{dayObj.title}</h4>
                          </div>
                        </div>
                        {/* Day Activities */}
                        <div className="p-5 space-y-4">
                          {dayObj.activities?.map((act, i) => (
                            <div key={i} className="flex gap-4 group/item">
                              <div className="flex flex-col items-center mt-1">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                {i !== dayObj.activities.length - 1 && <div className="w-0.5 h-full bg-indigo-500/20 mt-2 rounded-full"></div>}
                              </div>
                              <div className={`flex-1 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-black/5 border-black/5 hover:bg-black/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-bold text-sm">{act.activity}</h5>
                                  <span className="text-[10px] font-black px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg uppercase tracking-wider shrink-0">
                                    {act.time}
                                  </span>
                                </div>
                                <p className="text-[11px] font-bold opacity-60 flex items-center gap-1 mb-2 text-indigo-500">
                                  <MapPin size={10} /> {act.location}
                                </p>
                                <p className="text-xs opacity-80 leading-relaxed">"{act.notes}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Optimized Trip Map Component */}
                <div className="xl:w-[35%] h-[400px] xl:h-full relative">
                  <TripMap 
                    aiTripPlan={aiTripPlan}
                    transportMode={tripData.transport}
                    theme={theme}
                    isLoaded={isLoaded}
                  />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Navigation (Hidden on Generate and Review steps) */}
      {currentStep < 5 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrev}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'glass hover:bg-white/5'}`}
          >
            <ArrowLeft size={18} /> Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-white text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/20 hover:-translate-y-0.5"
          >
            Next <ArrowRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PlanTrip;
