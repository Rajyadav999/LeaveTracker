import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config/api';

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
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  PieChartIcon, 
  Activity,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/leaves/stats`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching manager dashboard statistics:', error);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map(n => (
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

  const { summary, distribution, trend, departmentStats, activities } = data || {};

  // Recharts color maps
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

  const statsCards = [
    { 
      title: 'Total Employees', 
      value: summary?.totalEmployees || 0, 
      sub: 'Managed Accounts',
      color: 'from-accent-500 to-indigo-600', 
      icon: Users,
      link: '/employee-records'
    },
    { 
      title: 'Pending Requests', 
      value: summary?.pending || 0, 
      sub: 'Requires Action',
      color: 'from-amber-500 to-orange-600', 
      icon: Clock,
      link: '/leave-requests'
    },
    { 
      title: 'Approved Requests', 
      value: summary?.approved || 0, 
      sub: 'Total Deductions',
      color: 'from-emerald-500 to-teal-600', 
      icon: CheckCircle,
      link: '/leave-requests?status=approved'
    },
    { 
      title: 'Rejected Requests', 
      value: summary?.rejected || 0, 
      sub: 'Requests Denied',
      color: 'from-rose-500 to-red-600', 
      icon: XCircle,
      link: '/leave-requests?status=rejected'
    },
    { 
      title: 'Most Active Month', 
      value: summary?.mostActiveMonth?.month || 'None', 
      sub: `${summary?.mostActiveMonth?.days || 0} approved days`,
      color: 'from-purple-500 to-pink-600', 
      icon: TrendingUp,
      link: '/leave-requests'
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">HR Analytics Portal</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Management insights, statistics, and pending actions.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {statsCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-card flex flex-col justify-between overflow-hidden relative group cursor-pointer"
            >
              <Link to={card.link} className="absolute inset-0 z-10" />
              {/* Top Row */}
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{card.title}</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1.5 truncate">{card.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Subtext */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{card.sub}</span>
                <span className="text-[9px] text-accent-600 dark:text-accent-400 font-semibold group-hover:underline flex-shrink-0">View →</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-500" />
              Monthly Leave Trends
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Total approved leave days across all employees.</p>
          </div>
          <div className="h-64 w-full">
            {trend?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No approved leaves recorded in the last 6 months.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
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
                  <Bar dataKey="days" fill="url(#trendGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Leave Type Distribution Pie Chart */}
        <motion.div variants={itemVariants} className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-accent-500" />
              Leave Type Distribution
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Percentage breakdown of approved leave days.</p>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            {distribution?.length === 0 ? (
              <div className="text-xs text-slate-400">
                No leave distribution data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#0f172a',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Grid: Department Stats & Global Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Stats */}
        <motion.div variants={itemVariants} className="glass-card lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Home className="w-4 h-4 text-accent-500" />
              Department Leave Breakdown
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Approved leave days taken per department.</p>
          </div>
          <div className="h-56 w-full">
            {departmentStats?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department leave data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="deptGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.95}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.55}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800/80" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={90} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#0f172a',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1'
                    }} 
                  />
                  <Bar dataKey="days" fill="url(#deptGradient)" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Global Timeline */}
        <motion.div variants={itemVariants} className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-500" />
              Corporate Activity Feed
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-6">Recent system and approval logs.</p>
          </div>
          <div className="flex-1 space-y-4 max-h-56 overflow-y-auto pr-1">
            {activities?.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No recent activity.
              </div>
            ) : (
              <div className="relative border-l border-slate-100 dark:border-slate-800 ml-2 space-y-4">
                {activities?.map((activity, index) => (
                  <div key={index} className="relative pl-5">
                    <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-accent-600 border-2 border-white dark:border-slate-900" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal font-medium">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{activity.user_name}</span> ({activity.user_role}): {activity.action}
                    </p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
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
