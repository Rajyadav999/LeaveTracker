import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Building,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  Inbox
} from 'lucide-react';
import API_BASE_URL from '../config/api';

export const LeaveRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Decision Form state
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch manager requests with high limit to find this specific ID locally
      const response = await axios.get(`${API_BASE_URL}/api/leaves/manager/requests`, {
        params: {
          page: 1,
          limit: 200
        }
      });
      
      const found = response.data.requests.find(r => r.id.toString() === id.toString());
      if (found) {
        setRequest(found);
        setRemarks(found.remarks || '');
      } else {
        setError('Leave request record not found in system logs.');
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError(err.response?.data?.message || 'Failed to fetch leave request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleDecision = async (decision) => {
    setProcessing(true);
    setActionError('');
    setActionSuccess('');

    try {
      await axios.put(`${API_BASE_URL}/api/leaves/manager/requests/${id}`, {
        status: decision,
        remarks
      });

      setActionSuccess(`Request successfully ${decision}! Redirecting back to queue...`);
      
      // Sync local state status
      setRequest(prev => ({
        ...prev,
        status: decision,
        remarks: remarks || null
      }));

      // Redirect after 1.2s
      setTimeout(() => {
        navigate('/leave-requests');
      }, 1200);

    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to process decision: ${decision}.`);
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded skeleton" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg skeleton" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-6 skeleton" />
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl p-6 skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Link to="/leave-requests" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Leave Requests
        </Link>
        <div className="glass-card flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Error Loading Details</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
          </div>
          <Link to="/leave-requests" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors">
            Return to Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link to="/leave-requests" className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-accent-600 dark:hover:text-accent-400 flex items-center gap-1.5 transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Leave Requests
      </Link>

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Request ID: #{request.id}</span>
          <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            Leave Request for {request.employee_name}
          </h1>
        </div>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      {/* Alerts */}
      <AnimatePresence mode="wait">
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center gap-3 text-xs"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{actionError}</span>
          </motion.div>
        )}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-xs"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card">
            <h2 className="font-semibold text-sm mb-5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-accent-500" />
              Employee Profile
            </h2>

            {/* Profile Row */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {request.employee_name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-850 dark:text-slate-100 truncate">{request.employee_name}</h4>
                <p className="text-[10px] text-slate-400 capitalize truncate">{request.department || 'General'}</p>
              </div>
            </div>

            {/* Profile Info fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-850/80 rounded-xl">
                <Mail className="w-4.5 h-4.5 text-slate-400" />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Email Address</span>
                  <p className="font-semibold text-slate-850 dark:text-slate-300 truncate text-xs">{request.employee_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-850/80 rounded-xl">
                <Building className="w-4.5 h-4.5 text-slate-400" />
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Department</span>
                  <p className="font-semibold text-slate-850 dark:text-slate-300 truncate text-xs">{request.department}</p>
                </div>
              </div>
            </div>

            <h2 className="font-semibold text-sm mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Inbox className="w-4.5 h-4.5 text-accent-500" />
              Applied Duration & Category
            </h2>

            {/* Quota details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Leave Type</span>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{request.leave_type}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Duration</span>
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{request.duration} {request.duration === 1 ? 'Day' : 'Days'}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Start Date</span>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">{request.start_date}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">End Date</span>
                <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5">{request.end_date}</p>
              </div>
            </div>
          </div>

          {/* Reason for leave */}
          <div className="glass-card">
            <h2 className="font-semibold text-sm mb-3.5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-accent-500" />
              Employee Reason
            </h2>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150/40 dark:border-slate-850 rounded-xl">
              <p className="text-slate-700 dark:text-slate-350 leading-relaxed text-xs whitespace-pre-line">{request.reason}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Decision Board */}
        <div>
          <div className="glass-card sticky top-6">
            <h2 className="font-semibold text-sm mb-1.5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-accent-500" />
              Review Actions
            </h2>
            <p className="text-[10px] text-slate-400 mb-5">Provide notes and decide on this leave request.</p>

            {request.status === 'pending' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Remarks (Optional)</label>
                  <textarea
                    rows="6"
                    placeholder="Enter review remarks or instructions for the employee..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="block w-full px-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleDecision('rejected')}
                    disabled={processing}
                    className="py-3 px-4 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/15 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision('approved')}
                    disabled={processing}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Processed Badge Banner */}
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${
                  request.status === 'approved' 
                    ? 'bg-emerald-50/20 border-emerald-100/30 text-emerald-800 dark:text-emerald-400' 
                    : 'bg-rose-50/20 border-rose-100/30 text-rose-800 dark:text-rose-400'
                }`}>
                  {request.status === 'approved' ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold capitalize">Leave {request.status}</p>
                    <p className="text-[10px] opacity-75">Review processed & finalized.</p>
                  </div>
                </div>

                {/* Remarks Display */}
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Manager Remarks</span>
                  <div className="mt-2 p-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl text-xs leading-relaxed text-slate-700 dark:text-slate-350 min-h-16">
                    {request.remarks || <span className="italic text-slate-400">No remarks were recorded.</span>}
                  </div>
                </div>

                {/* Processed Details */}
                <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between py-1">
                    <span>Processed By:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{request.manager_name || 'System Administrator'}</span>
                  </div>
                </div>

                <Link
                  to="/leave-requests"
                  className="w-full mt-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Requests Queue
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
