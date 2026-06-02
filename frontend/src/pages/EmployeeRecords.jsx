import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FolderOpen,
  Mail,
  UserCheck,
  Calendar
} from 'lucide-react';

export const EmployeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/leaves/manager/employees', {
        params: { search }
      });
      setRecords(response.data);
    } catch (err) {
      console.error('Failed to load employee records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search]);

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Employee Leave Records</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review leave allocations, deductions, and balances for all registered employees.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 dark:text-white"
          />
        </div>
      </div>

      {/* Main Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3].map(n => (
              <div key={n} className="p-5 flex items-center justify-between">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                </div>
                <div className="h-4 w-24 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4">
              <FolderOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">No Records Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No registered employees match your current search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Total Allocated</th>
                  <th className="px-6 py-4">Total Used</th>
                  <th className="px-6 py-4">Total Pending</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                {records.map((record) => (
                  <React.Fragment key={record.id}>
                    {/* Basic Row */}
                    <tr 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors cursor-pointer ${
                        expandedId === record.id ? 'bg-slate-50/40 dark:bg-slate-800/5' : ''
                      }`}
                      onClick={() => toggleExpand(record.id)}
                    >
                      <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {record.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span>{record.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{record.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400">
                        {record.department}
                      </td>
                      <td className="px-6 py-4.5 font-semibold">
                        {record.total_allocated || 0} Days
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        {record.total_used || 0} Days
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-amber-500">
                        {record.total_pending || 0} Days
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                          {expandedId === record.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Balances Row */}
                    <AnimatePresence>
                      {expandedId === record.id && (
                        <tr>
                          <td colSpan="6" className="bg-slate-50/50 dark:bg-slate-950/40 px-6 py-4 border-b border-slate-100 dark:border-slate-850">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-3">
                                {record.balances && record.balances.length > 0 ? (
                                  record.balances.map((balance, bIndex) => {
                                    const percentageUsed = Math.min(100, Math.round((balance.used / balance.allocated) * 100));
                                    return (
                                      <div key={bIndex} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 rounded-xl shadow-sm">
                                        <div className="flex justify-between items-center mb-1.5">
                                          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">{balance.leave_type}</h4>
                                          <span className="text-[10px] font-semibold text-accent-600 dark:text-accent-400">{balance.remaining} remaining</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-gradient-to-r from-accent-500 to-indigo-500 h-full rounded-full" 
                                            style={{ width: `${percentageUsed}%` }}
                                          />
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2">
                                          <span>Allocated: {balance.allocated}d</span>
                                          <span>Used: {balance.used}d • Pending: {balance.pending}d</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="col-span-3 text-center text-xs text-slate-400 py-2">
                                    No detailed leave balances allocated.
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
