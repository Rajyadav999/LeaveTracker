import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
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
  FileText
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
      const response = await axios.get('http://localhost:5000/api/leaves/history', {
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

  const getStatusBadge = (status) => {
    const configs = {
      pending: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50',
      approved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50',
      rejected: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/50'
    };
    return (
      <span className={`px-2.5 py-1 text-[10px] font-semibold tracking-wide border rounded-full capitalize ${configs[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Leave History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review and filter your past leave requests and approval remarks.</p>
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

        {/* Filters */}
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-1/2 sm:w-40 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-1/2 sm:w-40 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="p-5 flex items-center justify-between">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                </div>
                <div className="h-4 w-12 skeleton rounded" />
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4">
              <FolderOpen className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">No Records Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No leave history matches your active filters or search terms. Try modifying them or applying for a new leave.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('leave_type')}>
                    <div className="flex items-center gap-1.5">
                      Leave Type
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('start_date')}>
                    <div className="flex items-center gap-1.5">
                      Dates
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('duration')}>
                    <div className="flex items-center gap-1.5">
                      Duration
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 cursor-pointer hover:text-slate-600" onClick={() => handleSort('status')}>
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
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors inline-flex items-center gap-1.5 text-[10px] font-semibold"
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
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Remarks Overlay Drawer */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-xl z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <FileText className="w-4 h-4 text-accent-500" />
                  Leave Request Details
                </h3>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Status</h4>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Leave Type</h4>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.leave_type}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Duration</h4>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.duration} Days</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Start Date</h4>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.start_date}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">End Date</h4>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.end_date}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Reason for Leave</h4>
                  <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedRequest.reason}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-2">Manager Review Remarks</h4>
                  {selectedRequest.remarks ? (
                    <div className="p-4 bg-accent-50/30 dark:bg-slate-950/80 border border-accent-100/50 dark:border-slate-850 rounded-xl leading-relaxed">
                      <p className="text-slate-700 dark:text-slate-300">{selectedRequest.remarks}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">Reviewed by: <span className="font-semibold">{selectedRequest.manager_name}</span></span>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No manager review comments provided.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
