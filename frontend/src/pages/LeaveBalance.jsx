import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Info, 
  CalendarDays, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Briefcase 
} from 'lucide-react';
import API_BASE_URL from '../config/api';

export const LeaveBalance = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBalances = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/balances`);
      setBalances(response.data);
    } catch (err) {
      console.error('Failed to load leave balances:', err);
      setError(err.response?.data?.message || 'Failed to fetch leave balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  // Calculate overall summary metrics
  const totalAllocated = balances.reduce((sum, b) => sum + b.allocated, 0);
  const totalRemaining = balances.reduce((sum, b) => sum + b.remaining, 0);
  const totalPending = balances.reduce((sum, b) => sum + b.pending, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);

  // Entrance animations structure
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110 } }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded skeleton" />
            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded skeleton" />
          </div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl skeleton" />
        </div>

        {/* Grid Summary Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-5 skeleton" />
          ))}
        </div>

        {/* Detailed Card Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-6 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-accent-500" />
            Leave Balance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View allocated, used, and remaining leave quotas for the current cycle.
          </p>
        </div>
        <button
          onClick={fetchBalances}
          className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-350 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-xs"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={cardVariants} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Allocated</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{totalAllocated} Days</p>
          <span className="text-[10px] text-slate-400 mt-1 block">Full yearly allowance</span>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Total Remaining</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-2">{totalRemaining} Days</p>
          <span className="text-[10px] text-emerald-500/80 dark:text-emerald-500/60 mt-1 block">Available to request</span>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100/50 dark:border-amber-900/20 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">{totalPending} Days</p>
          <span className="text-[10px] text-amber-500/80 dark:text-amber-500/60 mt-1 block">Submitted requests</span>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-indigo-50/20 dark:bg-indigo-950/5 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-500 uppercase tracking-wider">Days Used</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">{totalUsed} Days</p>
          <span className="text-[10px] text-indigo-500/80 dark:text-indigo-500/60 mt-1 block">Finalized approvals</span>
        </motion.div>
      </motion.div>

      {/* Detailed Cards Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Quota breakdown by category</h3>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {balances.map((balance) => {
            const usedPercent = balance.allocated > 0 ? (balance.used / balance.allocated) * 100 : 0;
            const pendingPercent = balance.allocated > 0 ? (balance.pending / balance.allocated) * 100 : 0;
            const remainingPercent = balance.allocated > 0 ? (balance.remaining / balance.allocated) * 100 : 0;
            const usageRate = balance.allocated > 0 ? Math.round((balance.used / balance.allocated) * 100) : 0;

            // Border color matches per category
            let borderClass = 'hover:border-accent-400/50';
            if (balance.leave_type === 'Sick Leave') borderClass = 'hover:border-rose-400/50';
            if (balance.leave_type === 'Paid Leave') borderClass = 'hover:border-emerald-400/50';

            return (
              <motion.div 
                key={balance.leave_type} 
                variants={cardVariants}
                className={`glass-card hover:-translate-y-1 transition-all duration-300 border border-slate-250/50 dark:border-slate-850/80 ${borderClass}`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-5">
                  <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">{balance.leave_type}</h4>
                  <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full">
                    {balance.remaining} days remaining
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Category usage rate</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{usageRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div style={{ width: `${usedPercent}%` }} className="bg-indigo-500 h-full flex-shrink-0" title={`Used: ${balance.used} days`} />
                    <div style={{ width: `${pendingPercent}%` }} className="bg-amber-400 h-full flex-shrink-0" title={`Pending: ${balance.pending} days`} />
                    <div style={{ width: `${remainingPercent}%` }} className="bg-emerald-500 h-full flex-shrink-0" title={`Remaining: ${balance.remaining} days`} />
                  </div>
                  
                  {/* Progress bar legend */}
                  <div className="flex gap-3 text-[9px] text-slate-400 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Used</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Remaining</span>
                    </div>
                  </div>
                </div>

                {/* Stat Grid 2x2 */}
                <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Allocated</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{balance.allocated} Days</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Used</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{balance.used} Days</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Pending</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{balance.pending} Days</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase tracking-wider">Remaining</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block mt-0.5">{balance.remaining} Days</span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Policy Box */}
      <div className="p-5 bg-gradient-to-br from-indigo-50/40 to-accent-50/40 dark:from-slate-900/60 dark:to-accent-950/15 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex gap-3 text-xs text-slate-600 dark:text-slate-400">
        <Info className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200">Leave Quota & Accrual Rules</h4>
          <p className="leading-relaxed">
            Your allowances are set at the start of each calendar year. Remaining balances do not carry over to the next cycle unless explicitly authorized by HR.
            Please ensure all leave applications are registered timely in accordance with your department guidelines.
          </p>
        </div>
      </div>

    </div>
  );
};
