import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, AlertTriangle, CheckCircle, Info, CalendarDays } from 'lucide-react';
import API_BASE_URL from '../config/api';

export const ApplyLeave = () => {
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Real-time balance checker states
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [validationWarning, setValidationWarning] = useState('');

  // Fetch current balances on mount
  const fetchBalances = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/balances`);
      setBalances(response.data);
      // Select default Casual Leave balance
      const casualBal = response.data.find(b => b.leave_type === 'Casual Leave');
      setSelectedBalance(casualBal || null);
    } catch (err) {
      console.error('Failed to load leave balances', err);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  // Update selected balance details when leaveType changes
  useEffect(() => {
    if (balances.length > 0) {
      const bal = balances.find(b => b.leave_type === formData.leaveType);
      setSelectedBalance(bal || null);
    }
  }, [formData.leaveType, balances]);

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDuration(diffDays);
        setError('');
      } else {
        setDuration(0);
        setValidationWarning('');
      }
    } else {
      setDuration(0);
      setValidationWarning('');
    }
  }, [formData.startDate, formData.endDate]);

  // Perform balance validations
  useEffect(() => {
    if (selectedBalance && duration > 0) {
      const remaining = selectedBalance.remaining;
      const pending = selectedBalance.pending;
      
      if (pending + duration > remaining) {
        setValidationWarning(
          `Warning: This application exceeds your available balance. Remaining: ${remaining} days, Pending: ${pending} days, Requested: ${duration} days.`
        );
      } else {
        setValidationWarning('');
      }
    } else {
      setValidationWarning('');
    }
  }, [selectedBalance, duration]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Extra Date Validations
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0,0,0,0);

    if (start < today) {
      setError('Start date cannot be in the past.');
      setLoading(false);
      return;
    }

    if (end < start) {
      setError('End date must be after or equal to start date.');
      setLoading(false);
      return;
    }

    if (selectedBalance && (selectedBalance.pending + duration > selectedBalance.remaining)) {
      setError('Cannot submit request. Insufficient leave balance.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/leaves/apply`, {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });

      setSuccess('Leave request submitted successfully!');
      // Reset form
      setFormData({
        leaveType: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setDuration(0);
      
      // Refresh balances
      await fetchBalances();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Apply for Leave</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submit your time off request. Managers will review and approve.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2 glass-card">
          <h2 className="font-semibold text-sm mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-accent-500" />
            Request Details
          </h2>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl flex items-center gap-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-3 text-xs"
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            {validationWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 p-3.5 rounded-xl flex items-center gap-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{validationWarning}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Paid Leave">Paid/Earned Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white"
                />
              </div>
            </div>

            {duration > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs"
              >
                <span className="text-slate-500 font-medium">Calculated Leave Duration:</span>
                <span className="font-bold text-accent-600 dark:text-accent-400 text-sm bg-accent-50 dark:bg-accent-950/40 px-3 py-1 rounded-full">{duration} {duration === 1 ? 'Day' : 'Days'}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">Reason for Leave</label>
              <textarea
                name="reason"
                required
                rows="4"
                placeholder="Please state the reason for applying..."
                value={formData.reason}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 dark:border-slate-850 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!validationWarning || duration === 0}
              className="w-full bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent-600/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>

        {/* Live Balance Status Column */}
        <div className="space-y-6">
          {/* Active Balance Monitor Widget */}
          <div className="glass-card flex flex-col justify-between">
            <h2 className="font-semibold text-sm mb-5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <CalendarDays className="w-4.5 h-4.5 text-accent-500" />
              Live Balance Monitor
            </h2>

            {balanceLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-8 w-1/2 skeleton rounded" />
                <div className="h-2 w-full skeleton rounded" />
              </div>
            ) : selectedBalance ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Selected Leave Type</span>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{selectedBalance.leave_type}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <p className="text-[10px] text-slate-400">Available</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedBalance.remaining} days</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <p className="text-[10px] text-slate-400">Pending Approval</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedBalance.pending} days</p>
                  </div>
                </div>

                {/* Progress bar calculation */}
                {(() => {
                  const projectedUsed = selectedBalance.used + duration;
                  const remainingAfterRequest = Math.max(0, selectedBalance.remaining - selectedBalance.pending - duration);
                  const remainingPercent = Math.round((remainingAfterRequest / selectedBalance.allocated) * 100);
                  const requestedPercent = Math.round((duration / selectedBalance.allocated) * 100);
                  const pendingPercent = Math.round((selectedBalance.pending / selectedBalance.allocated) * 100);
                  const usedPercent = Math.round((selectedBalance.used / selectedBalance.allocated) * 100);

                  return (
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Projected Impact</span>
                      
                      {/* Stacked Progress Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full flex overflow-hidden">
                        {/* Used */}
                        <div className="bg-slate-400 dark:bg-slate-600 h-full" style={{ width: `${usedPercent}%` }} title={`Used: ${selectedBalance.used} days`} />
                        {/* Pending */}
                        <div className="bg-amber-400 dark:bg-amber-600 h-full" style={{ width: `${pendingPercent}%` }} title={`Pending: ${selectedBalance.pending} days`} />
                        {/* Requested (Now) */}
                        {duration > 0 && (
                          <div className="bg-accent-500 dark:bg-accent-500 h-full animate-pulse" style={{ width: `${requestedPercent}%` }} title={`Requested: ${duration} days`} />
                        )}
                      </div>

                      {/* Legend */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-600 rounded-full" />
                          <span>Used ({selectedBalance.used}d)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-400 dark:bg-amber-600 rounded-full" />
                          <span>Pending ({selectedBalance.pending}d)</span>
                        </div>
                        {duration > 0 && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <span className="w-2.5 h-2.5 bg-accent-500 rounded-full" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">This Request (+{duration}d)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-4 text-center">
                Could not load balance monitor.
              </div>
            )}
          </div>

          {/* Quick Policies Informational Box */}
          <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-accent-50/50 dark:from-slate-900/50 dark:to-accent-950/20 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl flex gap-3 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200">Company Leave Policies</h4>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li>Sick leaves require medical certificates if duration is greater than 3 days.</li>
                <li>Casual leaves should be submitted at least 3 days in advance.</li>
                <li>Paid/Earned leaves require planning and approval 2 weeks in advance.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
