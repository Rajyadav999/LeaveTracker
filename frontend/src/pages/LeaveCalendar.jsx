import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config/api';
import {
  Search,
  Filter,
  Calendar,
  X,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const LeaveCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Selected event details modal
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchCalendarLeaves = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leaves/calendar`);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching calendar leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarLeaves();
  }, []);

  // Safe end date adjustment since FullCalendar has exclusive end dates
  const addOneDay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get unique departments for filtering
  const departments = [...new Set(events.map(e => e.department).filter(Boolean))].sort();

  // Filter events locally
  const filteredLeaves = events.filter(leave => {
    const matchesSearch = 
      (leave.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (leave.employee_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (leave.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (leave.reason || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || leave.status === statusFilter;
    const matchesType = !typeFilter || leave.leave_type === typeFilter;
    const matchesDept = !deptFilter || leave.department === deptFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDept;
  });

  // Map to FullCalendar event objects
  const calendarEvents = filteredLeaves.map(leave => {
    let colorClass = '';
    if (leave.status === 'approved') {
      colorClass = 'event-approved';
    } else if (leave.status === 'rejected') {
      colorClass = 'event-rejected';
    } else {
      colorClass = 'event-pending';
    }

    return {
      id: leave.id.toString(),
      title: leave.employee_name,
      start: leave.start_date,
      end: addOneDay(leave.end_date),
      allDay: true,
      className: colorClass,
      extendedProps: {
        ...leave
      }
    };
  });

  const handleEventClick = (info) => {
    setSelectedRequest(info.event.extendedProps);
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

  // Render event content beautifully on the grid
  const renderEventContent = (eventInfo) => {
    const { leave_type, status } = eventInfo.event.extendedProps;
    
    let textClass = 'text-amber-800 dark:text-amber-200';
    let bgClass = 'bg-amber-100/80 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-900/30';
    
    if (status === 'approved') {
      textClass = 'text-emerald-800 dark:text-emerald-200';
      bgClass = 'bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-900/30';
    } else if (status === 'rejected') {
      textClass = 'text-rose-800 dark:text-rose-200';
      bgClass = 'bg-rose-100/80 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-900/30';
    }

    return (
      <div className={`w-full px-2 py-1 rounded-lg border text-[11px] font-medium truncate flex items-center gap-1 transition-all hover:scale-[1.01] ${bgClass} ${textClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
        <span className="font-bold truncate">{eventInfo.event.title}</span>
        <span className="opacity-75 truncate">({leave_type})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Leave Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive calendar view for tracking pending, approved, and team leaves.</p>
        </div>
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Premium custom calendar styles */
        .fc {
          font-family: 'Inter', sans-serif;
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: rgba(226, 232, 240, 0.4) !important;
        }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th {
          border-color: rgba(30, 41, 59, 0.4) !important;
        }
        .fc-col-header-cell {
          background-color: rgba(248, 250, 252, 0.6);
          padding: 12px 0 !important;
          border-bottom: 2px solid rgba(226, 232, 240, 0.8) !important;
        }
        .dark .fc-col-header-cell {
          background-color: rgba(15, 23, 42, 0.4);
          border-bottom: 2px solid rgba(30, 41, 59, 0.8) !important;
        }
        .fc-col-header-cell-cushion {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          text-decoration: none !important;
        }
        .dark .fc-col-header-cell-cushion {
          color: #94a3b8;
        }
        .fc-daygrid-day-frame {
          display: flex !important;
          flex-direction: column !important;
          min-height: 100% !important;
        }
        .fc-daygrid-day-top {
          display: flex !important;
          flex-direction: row-reverse !important;
          align-items: center !important;
          margin-bottom: 2px !important;
          height: 24px !important;
        }
        .fc-daygrid-day-number {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          padding: 4px 8px !important;
          text-decoration: none !important;
        }
        .dark .fc-daygrid-day-number {
          color: #cbd5e1;
        }
        .fc-day-today {
          background-color: rgba(124, 58, 237, 0.03) !important;
        }
        .dark .fc-day-today {
          background-color: rgba(124, 58, 237, 0.06) !important;
        }
        .fc-day-today .fc-daygrid-day-number {
          color: #7c3aed !important;
          font-weight: 800;
        }
        .dark .fc-day-today .fc-daygrid-day-number {
          color: #a78bfa !important;
        }
        .fc-event {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 1.5px 4px !important;
          cursor: pointer;
        }
        .fc-h-event {
          background: transparent !important;
          border: none !important;
        }
        .fc-daygrid-event-harness {
          margin: 1px 0 !important;
        }
        /* Toolbar styling */
        .fc-toolbar {
          margin-bottom: 1.5rem !important;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .fc-toolbar-title {
          font-size: 1.15rem !important;
          font-weight: 750 !important;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .dark .fc-toolbar-title {
          color: #f8fafc;
        }
        .fc-button {
          background-color: #ffffff !important;
          border: 1px solid rgba(226, 232, 240, 0.8) !important;
          color: #475569 !important;
          font-size: 0.72rem !important;
          font-weight: 600 !important;
          padding: 6px 12px !important;
          border-radius: 0.6rem !important;
          text-transform: capitalize !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03) !important;
          transition: all 0.15s !important;
        }
        .dark .fc-button {
          background-color: #0f172a !important;
          border-color: rgba(30, 41, 59, 0.8) !important;
          color: #cbd5e1 !important;
        }
        .fc-button:hover {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          border-color: rgba(196, 181, 253, 0.4) !important;
        }
        .dark .fc-button:hover {
          background-color: #1e293b !important;
          color: #ffffff !important;
        }
        .fc-button-active {
          background-color: #7c3aed !important;
          border-color: #7c3aed !important;
          color: #ffffff !important;
        }
        .dark .fc-button-active {
          background-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
          color: #ffffff !important;
        }
        .fc-button:focus, .fc-button:active {
          box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2) !important;
          outline: none !important;
        }
        .fc-today-button {
          opacity: 1 !important;
        }
        .fc-today-button:disabled {
          opacity: 0.4 !important;
          cursor: not-allowed;
        }
      `}} />

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Leave Calendar</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Interactive calendar view for tracking pending, approved, and team leaves.</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 dark:text-white"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Department Filter (Visible if departments exist) */}
          {departments.length > 0 && (
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 min-w-[120px]"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {/* Leave Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 min-w-[120px]"
          >
            <option value="">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Paid Leave">Paid Leave</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/85 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 min-w-[120px]"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm p-6 overflow-hidden">
        {calendarEvents.length === 0 && events.length > 0 && (
          <div className="mb-4 p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 animate-fadeIn">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>No leaves match your active filter criteria. Showing empty grid.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              height="auto"
              fixedWeekCount={false}
            />
          </div>
        </div>
      </div>

      {/* Detail view glassmorphic modal */}
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
              <div className="w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 px-3 py-1 text-[10px] font-bold mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Leave Details
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
                      {selectedRequest.employee_name}'s Leave
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close details"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="space-y-4 text-xs">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {selectedRequest.employee_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedRequest.employee_name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{selectedRequest.department || 'No Dept'} • Employee</p>
                      </div>
                    </div>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>

                  {/* Employee Details Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Email</p>
                        <p className="font-medium text-slate-700 dark:text-slate-350 truncate">{selectedRequest.employee_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                      <Building className="w-4 h-4 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Department</p>
                        <p className="font-medium text-slate-700 dark:text-slate-350 truncate">{selectedRequest.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Leave Details Grid */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-850 p-4 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Leave Type</p>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedRequest.leave_type}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Duration</p>
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{selectedRequest.duration} {selectedRequest.duration === 1 ? 'Day' : 'Days'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">Start Date</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{selectedRequest.start_date}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1">End Date</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{selectedRequest.end_date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Leave Reason */}
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-850 p-4">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-accent-500" />
                      Employee Reason
                    </p>
                    <p className="bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 p-3 rounded-lg text-slate-750 dark:text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
                      {selectedRequest.reason}
                    </p>
                  </div>

                  {/* Manager Remarks */}
                  {selectedRequest.status === 'pending' ? (
                    <div className="p-3 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-xl flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 animate-pulse" />
                      <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-snug">
                        This request is currently pending review. Manager approval/remarks will be shown here once processed.
                      </p>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border ${
                      selectedRequest.status === 'approved' 
                        ? 'bg-emerald-50/20 border-emerald-100/40' 
                        : 'bg-rose-50/20 border-rose-100/40'
                    }`}>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle className={`w-3.5 h-3.5 ${selectedRequest.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`} />
                        Manager Remarks
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2.5">
                        {selectedRequest.remarks || <span className="italic text-slate-400">No remarks were recorded.</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100/80 dark:border-slate-800/85">
                        Processed by: <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedRequest.manager_name || 'System Manager'}</span>
                      </p>
                    </div>
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

// Skeleton Component
const CalendarSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm">
        <div className="h-10 w-full md:w-72 bg-slate-100 dark:bg-slate-800 rounded-xl skeleton" />
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl skeleton" />
          <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl skeleton" />
          <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl skeleton" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-44 bg-slate-100 dark:bg-slate-800 rounded-lg skeleton" />
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg skeleton" />
            <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg skeleton" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850 skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-850 p-2 space-y-2 skeleton">
              <div className="h-3.5 w-6 bg-slate-100 dark:bg-slate-850 rounded ml-auto" />
              {i === 8 && <div className="h-5 w-full bg-accent-100/50 dark:bg-accent-950/20 rounded border border-accent-200/30" />}
              {i === 15 && <div className="h-5 w-full bg-emerald-100/50 dark:bg-emerald-950/20 rounded border border-emerald-200/30" />}
              {i === 22 && <div className="h-5 w-full bg-amber-100/50 dark:bg-amber-950/20 rounded border border-amber-200/30" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
