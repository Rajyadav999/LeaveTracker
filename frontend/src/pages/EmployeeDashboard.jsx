import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award,
  CalendarDays,
  UserCheck
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/leaves/stats');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 skeleton rounded-2xl lg:col-span-2" />
          <div className="h-80 skeleton rounded-2xl" />
        </div>
      </div>
    );
  }

  const { summary, trend, activities } = data || {};
  const balances = summary?.balances || [];
  
  // Calculate aggregate counts
  const totalAllocated = balances.reduce((acc, b) => acc + b.allocated, 0);
  const totalUsed = balances.reduce((acc, b) => acc + b.used, 0);
  const totalPending = balances.reduce((acc, b) => acc + b.pending, 0);
  const totalRemaining = balances.reduce((acc, b) => acc + b.remaining, 0);

  // Recharts colors
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const statsCards = [
    { 
      title: 'Remaining Leaves', 
      value: totalRemaining, 
      sub: `${totalAllocated} Days Allocated`,
      color: 'from-accent-500 to-indigo-600', 
      textColor: 'text-accent-600 dark:text-accent-400',
      icon: Award 
    },
    { 
      title: 'Leaves Approved', 
      value: summary?.approved || 0, 
      sub: `${totalUsed} Days Deducted`,
      color: 'from-emerald-500 to-teal-600', 
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle 
    },
    { 
      title: 'Pending Requests', 
      value: summary?.pending || 0, 
      sub: `${totalPending} Days Awaiting`,
      color: 'from-amber-500 to-orange-600', 
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: Clock 
    },
    { 
      title: 'Rejected Leaves', 
      value: summary?.rejected || 0, 
      sub: 'Status Denied',
      color: 'from-rose-500 to-red-600', 
      textColor: 'text-rose-600 dark:text-rose-400',
      icon: XCircle 
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Welcome Back, {user?.name}</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Here is a quick overview of your leave records and status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-card flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1.5">{card.value}</h3>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Subtext */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{card.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Leave Balance Detail Breakdown */}
      <motion.div variants={itemVariants} className="glass-card">
        <h3 className="font-semibold text-sm mb-5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-accent-500" />
          Leave Allocation Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {balances.map((balance, index) => {
            const percentageUsed = Math.min(100, Math.round((balance.used / balance.allocated) * 100));
            return (
              <div key={index} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{balance.leave_type}</h4>
                  <span className="text-[11px] font-semibold text-accent-600 dark:text-accent-400">{balance.remaining} remaining</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-accent-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>Used: {balance.used} / {balance.allocated} days</span>
                  <span>Pending approval: {balance.pending} days</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Charts & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-500" />
              Monthly Leave Trends
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Approved leave days taken over the last 6 months.</p>
          </div>
          <div className="h-64 w-full">
            {trend?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                No leave approvals recorded in the last 6 months.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/80" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#0f172a',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1'
                    }} 
                  />
                  <Bar dataKey="days" fill="url(#colorDays)" radius={[6, 6, 0, 0]} barSize={40}>
                    {trend?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Activity Timeline Column */}
        <motion.div variants={itemVariants} className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent-500" />
              Activity Log
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Recent activity logs from your account.</p>
          </div>
          <div className="flex-1 space-y-4">
            {activities?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity logs available
              </div>
            ) : (
              <div className="relative border-l border-slate-100 dark:border-slate-800 ml-2 space-y-5">
                {activities?.map((activity, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent-600 border-2 border-white dark:border-slate-900" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{activity.action}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      {new Date(activity.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
