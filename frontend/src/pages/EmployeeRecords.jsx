import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FolderOpen,
  Mail,
  UserCheck,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

export const EmployeeRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/manager/employees`, {
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

  const handleExportExcel = () => {
    if (records.length === 0) return;

    // Map records to a flat list for Excel sheet
    const exportData = records.map(record => {
      const cl = record.balances?.find(b => b.leave_type === 'Casual Leave') || {};
      const sl = record.balances?.find(b => b.leave_type === 'Sick Leave') || {};
      const pl = record.balances?.find(b => b.leave_type === 'Paid Leave') || {};

      return {
        'Employee Name': record.name,
        'Email Address': record.email,
        'Department': record.department,
        'Total Allocated Leaves': record.total_allocated || 0,
        'Total Used Leaves': record.total_used || 0,
        'Total Pending Leaves': record.total_pending || 0,
        'Casual Leave (Allocated)': cl.allocated || 0,
        'Casual Leave (Used)': cl.used || 0,
        'Casual Leave (Remaining)': cl.remaining || 0,
        'Sick Leave (Allocated)': sl.allocated || 0,
        'Sick Leave (Used)': sl.used || 0,
        'Sick Leave (Remaining)': sl.remaining || 0,
        'Paid Leave (Allocated)': pl.allocated || 0,
        'Paid Leave (Used)': pl.used || 0,
        'Paid Leave (Remaining)': pl.remaining || 0,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Records');
    
    // Auto-size columns to be neat
    const maxKeys = Object.keys(exportData[0] || {});
    worksheet['!cols'] = maxKeys.map(k => ({ wch: Math.max(k.length + 2, 12) }));

    XLSX.writeFile(workbook, 'employee_leave_records.xlsx');
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Employee Leave Records</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review leave allocations, deductions, and balances for all registered employees.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, department, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 dark:text-white"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportExcel}
          disabled={records.length === 0 || loading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Main Records List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {[1, 2, 3, 4].map((n) => (
                  <tr key={n}>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg skeleton" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-28 skeleton rounded" />
                          <div className="h-2 w-36 skeleton rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5"><div className="h-3 w-20 skeleton rounded" /></td>
                    <td className="px-6 py-4.5"><div className="h-3 w-12 skeleton rounded" /></td>
                    <td className="px-6 py-4.5"><div className="h-3 w-12 skeleton rounded" /></td>
                    <td className="px-6 py-4.5"><div className="h-3 w-12 skeleton rounded" /></td>
                    <td className="px-6 py-4.5 text-right"><div className="inline-block w-8 h-8 skeleton rounded-lg" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Records Found</h3>
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
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
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
