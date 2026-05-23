import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, AlertCircle, Calendar,
  Search, Filter, ArrowRight, Loader2,
  Trash2, RefreshCw, ChevronRight, Info,
  CheckCircle2, AlertTriangle, X, Zap
} from 'lucide-react';
import { getUserLostItems, markItemAsRecovered } from '../../services/tripService';
import { getRecoverySteps } from '../../services/aiService';

const ItemTracker = ({ theme }) => {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  const [recoverySteps, setRecoverySteps] = useState(null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchLostItems = async () => {
    setLoading(true);
    try {
      const data = await getUserLostItems();
      setLostItems(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching lost items:", err);
      setError(err.message || "Failed to load lost items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
  }, []);

  const handleShowSteps = async (item) => {
    setSelectedItem(item);
    setShowStepsModal(true);
    setStepsLoading(true);
    try {
      const steps = await getRecoverySteps(item.itemName, item.predictedLocation, item.reason);
      setRecoverySteps(steps);
    } catch (err) {
      console.error("Error fetching recovery steps:", err);
    } finally {
      setStepsLoading(false);
    }
  };

  const closeStepsModal = () => {
    setShowStepsModal(false);
    setRecoverySteps(null);
    setSelectedItem(null);
  };

  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [recoveringItem, setRecoveringItem] = useState(null);
  const [recoveredFromInput, setRecoveredFromInput] = useState('');
  const [submittingRecovery, setSubmittingRecovery] = useState(false);

  const handleMarkRecoveredClick = (item) => {
    setRecoveringItem(item);
    setRecoveredFromInput('');
    setShowRecoverModal(true);
  };

  const handleMarkRecoveredSubmit = async () => {
    if (!recoveringItem) return;
    setSubmittingRecovery(true);
    try {
      await markItemAsRecovered(recoveringItem.id, recoveredFromInput);
      setLostItems(prev => prev.map(item => item.id === recoveringItem.id ? { ...item, isRecovered: true, recoveredFrom: recoveredFromInput } : item));
      setShowRecoverModal(false);
      setRecoveringItem(null);
      setRecoveredFromInput('');
    } catch (err) {
      console.error("Error marking item as recovered:", err);
    } finally {
      setSubmittingRecovery(false);
    }
  };

  const closeRecoverModal = () => {
    setShowRecoverModal(false);
    setRecoveringItem(null);
    setRecoveredFromInput('');
  };

  const filteredItems = lostItems.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tripDestination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 pb-20"
      >
        {/* 🌟 Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/20">
                <Package size={28} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--text-main)]">Item Tracker</h1>
            </div>
            <p className="text-slate-400 font-medium">Keep track of items marked as potentially left behind by our AI system.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLostItems}
              className="p-4 glass rounded-2xl hover:bg-white/5 border border-white/10 transition-all text-slate-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search items or trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-4 glass rounded-2xl border border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none w-full md:w-[300px] transition-all"
              />
            </div>
          </div>
        </div>

        {/* 📊 Content Section */}
        <div className="px-4">
          {loading ? (
            <div className="h-[400px] glass rounded-[3rem] border border-white/5 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={48} className="animate-spin text-indigo-500" />
              <p className="text-slate-400 font-black animate-pulse uppercase tracking-widest text-xs">Retrieving Data...</p>
            </div>
          ) : error ? (
            <div className="h-[400px] glass rounded-[3rem] border border-white/5 flex flex-col items-center justify-center space-y-6 p-8 text-center">
              <div className="p-6 bg-rose-500/10 rounded-full">
                <AlertCircle size={64} className="text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[var(--text-main)]">System Error</h3>
                <p className="text-slate-400 max-w-md">{error}</p>
              </div>
              <button
                onClick={fetchLostItems}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-[400px] glass rounded-[3rem] border border-white/5 flex flex-col items-center justify-center space-y-6 p-8 text-center">
              <div className="p-6 bg-indigo-500/10 rounded-full">
                <Package size={64} className="text-indigo-500 opacity-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[var(--text-main)]">Everything is Secure</h3>
                <p className="text-slate-400 max-w-md">No lost items detected. Your AI assistant will notify you if anything is left behind during your trips.</p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[var(--text-main)]/5">
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60">Item Details</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60">Trip Destination</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60">AI Prediction</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60">Found Date</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60">Reasoning</th>
                      <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-[var(--text-main)]/60 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence>
                      {filteredItems.map((item, idx) => (
                        <motion.tr
                          key={item.id}
                          variants={itemVariants}
                          whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                          className="group transition-colors"
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <Package size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-[var(--text-main)]">{item.itemName}</h4>
                                <p className="text-[10px] font-bold opacity-40 text-[var(--text-main)]">ID: #{item.id}</p>
                                {item.isRecovered && item.recoveredFrom && (
                                  <p className="text-[10px] font-extrabold text-emerald-500 mt-1 flex items-center gap-1">
                                    <MapPin size={10} /> Found: {item.recoveredFrom}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <MapPin size={14} className="text-amber-400" />
                              </div>
                              <span className="font-bold text-[var(--text-main)]">{item.tripDestination || 'Unknown Trip'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-violet-500/10 rounded-lg">
                                <AlertCircle size={14} className="text-violet-400" />
                              </div>
                              <span className="font-bold text-violet-300">{item.predictedLocation}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar size={14} />
                              <span className="text-sm font-medium">
                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 max-w-[300px]">
                            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                              <Info size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                              <p className="text-xs font-medium text-slate-400 leading-relaxed italic line-clamp-2">
                                "{item.reason}"
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {item.isRecovered ? (
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                                  <CheckCircle2 size={14} /> Recovered
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarkRecoveredClick(item)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95"
                                  title="Mark as Recovered"
                                >
                                  <CheckCircle2 size={14} /> Mark Found
                                </button>
                              )}
                              {!item.isRecovered && (
                                <button
                                  onClick={() => handleShowSteps(item)}
                                  className="p-2.5 rounded-xl glass hover:bg-indigo-600 hover:text-white text-slate-400 transition-all group/btn"
                                  title="View Recovery Steps"
                                >
                                  <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 🤖 AI Recovery Steps Modal */}
      <AnimatePresence>
        {showStepsModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeStepsModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                    <Zap size={24} className="fill-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-main)]">AI Recovery Blueprint</h2>
                    <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Intelligent Retrieval System</p>
                  </div>
                </div>
                <button
                  onClick={closeStepsModal}
                  className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto no-scrollbar space-y-8">
                {stepsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="animate-spin text-indigo-500" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Consulting Intelligence Database...</p>
                  </div>
                ) : recoverySteps ? (
                  <>
                    {/* Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Target Item</p>
                        <h3 className="text-xl font-black text-indigo-100">{recoverySteps.itemName}</h3>
                      </div>
                      <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs font-bold text-amber-400 uppercase mb-1">Retrieval Location</p>
                        <h3 className="text-xl font-black text-amber-100">{recoverySteps.predictedLocation}</h3>
                      </div>
                    </div>

                    {/* Steps List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Actionable Steps</h4>
                      <div className="space-y-4">
                        {recoverySteps.steps?.map((s, idx) => (
                          <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-2xl bg-indigo-600/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-600/30 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              {idx + 1}
                            </div>
                            <div className="space-y-1">
                              <h5 className="font-black text-[var(--text-main)] group-hover:text-indigo-300 transition-colors">{s.title}</h5>
                              <p className="text-sm text-slate-400 leading-relaxed">{s.instruction}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tip & Probability */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-400 uppercase">Success Probability</p>
                          <h4 className="text-2xl font-black text-emerald-100">{recoverySteps.successProbability}</h4>
                        </div>
                      </div>
                      <div className="flex-[1.5] p-6 rounded-[2rem] bg-violet-500/5 border border-violet-500/10 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                          <Info size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-violet-400 uppercase mb-1">Intelligence Tip</p>
                          <p className="text-sm text-slate-400 italic">"{recoverySteps.recoveryTip}"</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <AlertTriangle size={48} className="text-amber-500" />
                    <p className="text-slate-400 font-bold">Failed to generate recovery plan</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
                <button
                  onClick={closeStepsModal}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📍 Enter Recovery Location Modal */}
      <AnimatePresence>
        {showRecoverModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRecoverModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-[#121420]/95 backdrop-blur-md rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-600 rounded-xl text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white">Mark as Recovered</h2>
                    <p className="text-emerald-500 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Confirm Retrieval</p>
                  </div>
                </div>
                <button
                  onClick={closeRecoverModal}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Awesome! Please let us know where you found your <strong className="text-slate-900 dark:text-white">"{recoveringItem?.itemName}"</strong> to help improve future recovery predictions.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">
                    Recovery Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hotel lobby, airport lounge, taxi backseat..."
                    value={recoveredFromInput}
                    onChange={(e) => setRecoveredFromInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-white/10 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
                <button
                  onClick={closeRecoverModal}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkRecoveredSubmit}
                  disabled={submittingRecovery || !recoveredFromInput.trim()}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
                >
                  {submittingRecovery ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Confirm Found'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemTracker;
