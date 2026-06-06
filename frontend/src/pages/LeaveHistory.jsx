import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  Eye,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Inbox,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';

export const LeaveHistory = () => {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchLeaveHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/history`, {
        params: {
          search,
          status: statusFilter,
          leaveType: typeFilter,
          page,
          limit: 10
        }
      });
      setRequests(response.data.requests);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching leave history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, [search, statusFilter, typeFilter, page]);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);

    // Sort requests locally
    const sorted = [...requests].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];
      
      if (field === 'start_date' || field === 'end_date' || field === 'created_at') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      
      if (valA < valB) return sortOrder === 'asc' ? 1 : -1;
      if (valA > valB) return sortOrder === 'asc' ? -1 : 1;
      return 0;
    });
    setRequests(sorted);
  };

  const handleExportExcel = () => {
    if (requests.length === 0) return;

    const exportData = requests.map(r => ({
      'Leave Type': r.leave_type,
      'Start Date': r.start_date,
      'End Date': r.end_date,
      'Duration (Days)': r.duration,
      'Reason': r.reason,
      'Status': r.status,
      'Manager Remarks': r.remarks || 'None',
      'Processed By': r.manager_name || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Leave History');
    worksheet['!cols'] = Object.keys(exportData[0] || {}).map(k => ({ wch: Math.max(k.length + 2, 12) }));
    XLSX.writeFile(workbook, 'my_leave_history.xlsx');
  };

  const getStatusBadge = (status) => {
    const dotClass = "dot";
    if (status === 'approved') {
      return (
        <span className="badge-status badge-approved">
          <span className={dotClass} />
          Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="badge-status badge-rejected">
          <span className={dotClass} />
          Rejected
        </span>
      );
    }
    return (
      <span className="badge-status badge-pending">
        <span className={dotClass} />
        Pending
      </span>
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Leave History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review and filter your past leave requests and approval remarks.</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reasons or leave types..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 dark:text-white"
          />
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-40 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-40 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={requests.length === 0 || loading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {[1, 2, 3, 4].map((n) => (
                  <tr key={n}>
                    <td className="px-6 py-4.5"><div className="h-3.5 w-24 skeleton rounded" /></td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-16 skeleton rounded" />
                        <div className="h-2 w-16 skeleton rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4.5"><div className="h-3 w-12 skeleton rounded" /></td>
                    <td className="px-6 py-4.5"><div className="h-3 w-40 skeleton rounded" /></td>
                    <td className="px-6 py-4.5"><div className="h-5 w-20 skeleton rounded-full" /></td>
                    <td className="px-6 py-4.5 text-right"><div className="inline-block h-8 w-24 skeleton rounded-lg" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">No Records Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No leave history matches your active filters or search terms. Try modifying them or applying for a new leave.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350" onClick={() => handleSort('leave_type')}>
                    <div className="flex items-center gap-1.5">
                      Leave Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350" onClick={() => handleSort('start_date')}>
                    <div className="flex items-center gap-1.5">
                      Dates
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350" onClick={() => handleSort('duration')}>
                    <div className="flex items-center gap-1.5">
                      Duration
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-350" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                {requests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-800 dark:text-slate-200">
                      {request.leave_type}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{request.start_date}</span>
                        <span className="text-[10px] text-slate-400">to {request.end_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-semibold">
                      {request.duration} {request.duration === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="px-6 py-4.5 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4.5">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors inline-flex items-center gap-1.5 text-[10px] font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Remarks
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Showing page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Overlay Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6">
                <div className="flex items-start justify-between pb-5 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 px-3 py-1 text-[11px] font-bold mb-3">
                      <FileText className="w-3.5 h-3.5" />
                      Leave Request Details
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      Your {selectedRequest.leave_type}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Review your submitted request details and manager feedback.
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close details"
                    className="p-2 -mt-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 text-xs pb-1">
                  {/* Left Column */}
                  <div className="space-y-5">
                    {/* Header Info Banner */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {selectedRequest.leave_type.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{selectedRequest.leave_type}</h4>
                        <p className="text-[10px] text-slate-400 truncate">Applied on {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
                    </div>

                    {/* Applied Details Card */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <Inbox className="w-4 h-4 text-accent-500" />
                        Leave Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                          <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Leave Type</h4>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.leave_type}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                          <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Duration</h4>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.duration} {selectedRequest.duration === 1 ? 'Day' : 'Days'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                          <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Start Date</h4>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.start_date}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                          <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">End Date</h4>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.end_date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reason for Leave */}
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-accent-500" />
                        Reason for Leave
                      </h4>
                      <p className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl leading-relaxed text-sm text-slate-700 dark:text-slate-300 min-h-24">
                        {selectedRequest.reason}
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Decision / Remarks */}
                  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-accent-500" />
                        Manager Decision
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Official feedback recorded for this application.
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col justify-start">
                      {selectedRequest.status === 'pending' ? (
                        <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 flex flex-col items-center justify-center text-center py-10 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Awaiting Review</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                              This request is currently pending manager approval. You will receive a notification once processed.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                            selectedRequest.status === 'approved' 
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400' 
                              : 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/30 text-rose-800 dark:text-rose-400'
                          }`}>
                            {selectedRequest.status === 'approved' ? (
                              <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-[13px] capitalize">Leave {selectedRequest.status}</p>
                              <p className="text-[10px] opacity-80">This status is finalized and logged in your profile.</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-2">Manager Remarks</h4>
                            {selectedRequest.remarks ? (
                              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl leading-relaxed">
                                <p className="text-slate-700 dark:text-slate-300 text-sm">{selectedRequest.remarks}</p>
                                <span className="text-[10px] text-slate-400 mt-3 block flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-850 pt-2.5">
                                  <UserCheck className="w-3.5 h-3.5 text-accent-500" />
                                  Processed by: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRequest.manager_name || 'System Admin'}</span>
                                </span>
                              </div>
                            ) : (
                              <p className="text-slate-400 italic">No remarks were added during review.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
