import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Check, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle,
  Inbox,
  UserCheck
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const LeaveRequests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'pending';

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(initialStatus === 'pending' ? 'pending' : 'processed');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Processing Form state
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab === 'pending' ? 'pending' : '';
      const response = await axios.get('http://localhost:5000/api/leaves/manager/requests', {
        params: {
          search,
          status: statusParam, // if blank, returns all (which manager can filter or see processed items)
          page,
          limit: 10
        }
      });

      if (activeTab === 'processed') {
        // Filter out pending requests on frontend since backend API returns all if status is blank
        const processedItems = response.data.requests.filter(r => r.status !== 'pending');
        setRequests(processedItems);
        setPagination({
          ...response.data.pagination,
          total: processedItems.length,
          totalPages: Math.ceil(processedItems.length / 10)
        });
      } else {
        setRequests(response.data.requests);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching manager requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [search, activeTab, page]);

  // Sync tabs when search params change
  useEffect(() => {
    const statusVal = searchParams.get('status');
    if (statusVal === 'approved' || statusVal === 'rejected') {
      setActiveTab('processed');
    } else {
      setActiveTab('pending');
    }
  }, [searchParams]);

  const handleProcessRequest = async (requestId, decision) => {
    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`http://localhost:5000/api/leaves/manager/requests/${requestId}`, {
        status: decision,
        remarks
      });

      setSuccess(`Request successfully ${decision}!`);
      setRemarks('');
      
      // Close drawer after short delay
      setTimeout(() => {
        setSelectedRequest(null);
        setSuccess('');
      }, 1000);

      // Refresh list
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setProcessing(false);
    }
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Leave Requests</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review, approve, or reject incoming employee leave requests.</p>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-850 flex gap-6 text-sm">
        <button
          onClick={() => { setActiveTab('pending'); setPage(1); }}
          className={`pb-3 font-semibold relative ${
            activeTab === 'pending' 
              ? 'text-accent-600 dark:text-accent-400' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Pending Review
          {activeTab === 'pending' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-600 dark:bg-accent-400" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab('processed'); setPage(1); }}
          className={`pb-3 font-semibold relative ${
            activeTab === 'processed' 
              ? 'text-accent-600 dark:text-accent-400' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Processed Records
          {activeTab === 'processed' && (
            <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-600 dark:bg-accent-400" />
          )}
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, leave type, department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 dark:text-white"
          />
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
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">No Requests Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">No leave applications currently match this tab. You're all caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Start / End Date</th>
                  <th className="px-6 py-4">Status</th>
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
                      {request.employee_name}
                    </td>
                    <td className="px-6 py-4.5 font-medium text-slate-500 dark:text-slate-400">
                      {request.department}
                    </td>
                    <td className="px-6 py-4.5 font-bold">
                      {request.leave_type}
                    </td>
                    <td className="px-6 py-4.5 font-semibold">
                      {request.duration} {request.duration === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400">
                      <span>{request.start_date}</span>
                      <span className="block text-[10px] text-slate-400">to {request.end_date}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {request.status === 'pending' ? (
                        <button
                          onClick={() => { setSelectedRequest(request); setRemarks(''); }}
                          className="px-3 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-semibold flex items-center gap-1.5 transition-colors text-[10px] ml-auto"
                        >
                          <Inbox className="w-3.5 h-3.5" />
                          Review Request
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedRequest(request); setRemarks(''); }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-semibold inline-flex items-center gap-1 text-[10px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Review
                        </button>
                      )}
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

      {/* Review Request Modal */}
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
                    Manager Review
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {selectedRequest.employee_name}'s {selectedRequest.leave_type}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review the request context before approving or rejecting.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  aria-label="Close review"
                  className="p-2 -mt-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 p-3 flex items-center gap-2 text-[11px] rounded-xl"
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
                    className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 p-3 flex items-center gap-2 text-[11px] rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 text-xs pb-1">
                <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {selectedRequest.employee_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{selectedRequest.employee_name}</h4>
                    <p className="text-[10px] text-slate-400 capitalize truncate">{selectedRequest.department} - {selectedRequest.employee_email}</p>
                  </div>
                  <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-accent-500" />
                    Leave Applied Details
                  </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Leave Type</h4>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.leave_type}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wide text-[9px] mb-1">Duration</h4>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRequest.duration} Days</p>
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

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-accent-500" />
                      Manager Decision
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Add a clear note for the employee record.
                    </p>
                  </div>
                  {selectedRequest.status === 'pending' ? (
                    <div className="space-y-4 flex flex-col flex-1">
                      <textarea
                        rows="8"
                        placeholder="Add optional reviewer remarks or feedback..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="block w-full px-4 py-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white resize-none"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                        <button
                          onClick={() => handleProcessRequest(selectedRequest.id, 'rejected')}
                          disabled={processing}
                          className="py-3 px-4 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleProcessRequest(selectedRequest.id, 'approved')}
                          disabled={processing}
                          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {selectedRequest.remarks ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl leading-relaxed">
                          <p className="text-slate-700 dark:text-slate-300">{selectedRequest.remarks}</p>
                          <span className="text-[10px] text-slate-400 mt-2 block flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-accent-500" />
                            Processed by: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRequest.manager_name}</span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No remarks were added during review.</p>
                      )}
                    </div>
                  )}
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
