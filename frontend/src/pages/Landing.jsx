import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palmtree, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  TrendingUp, 
  CalendarRange, 
  ChevronDown, 
  UserCheck, 
  LayoutDashboard, 
  Users, 
  PieChart as PieChartIcon, 
  Zap, 
  Layers, 
  Sparkles,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

export const Landing = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [activeFaq, setActiveFaq] = useState(null);

  // Auto scroll to sections
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const faqData = [
    {
      q: "How do leave approvals work?",
      a: "When an employee submits a leave request, managers receive real-time dashboard notifications. They can review detailed reasons, check team calendars, add remarks, and approve or reject the request instantly."
    },
    {
      q: "Can managers add remarks?",
      a: "Yes! The system encourages managers to provide context by adding reviewer remarks. These comments are visible to employees in their Leave History ledger."
    },
    {
      q: "Is leave balance updated automatically?",
      a: "Absolutely. Once a manager approves a request, the system instantly deducts the approved days from the employee's pending balance and adds them to used days, updating remaining counts in real-time."
    },
    {
      q: "Is the system secure?",
      a: "Yes. AntigravityHR utilizes industry-standard JWT (JSON Web Tokens) for session authorization and hashes user passwords using bcryptjs, enforcing role-based endpoint access control."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden selection:bg-accent-500 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-600/30">
            <Palmtree className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-accent-600 to-indigo-600 bg-clip-text text-transparent">
            AntigravityHR
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('workflow')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Workflow</button>
          <button onClick={() => scrollToSection('showcase')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Showcase</button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="bg-accent-600 hover:bg-accent-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-accent-600/10"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-accent-600 hover:bg-accent-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition-all shadow-md shadow-accent-600/15"
              >
                Get Started
                <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-500/10 dark:bg-accent-500/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-3xl space-y-6"
        >
          {/* Tagline */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 border border-accent-500/20 bg-accent-50/50 dark:bg-accent-950/20 text-accent-700 dark:text-accent-400 rounded-full text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Modern Workspaces
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
          >
            Manage Employee Leaves <span className="bg-gradient-to-r from-accent-500 to-indigo-500 bg-clip-text text-transparent">Effortlessly</span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Streamline leave requests, manager approvals, and team balances with a high-performance HR platform designed for remote-first and hybrid enterprises.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Link
              to="/login"
              className="bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white font-bold py-3.5 px-7 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-accent-600/20 active:scale-[0.98] flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-3.5 px-7 border border-slate-200 dark:border-slate-800 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
            >
              View Sandbox Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup Grid Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, type: 'spring' }}
          className="w-full max-w-5xl mt-16 relative"
        >
          {/* Glassmorphic Mockup Panel */}
          <div className="glass-panel p-3.5 rounded-3xl border border-slate-200/60 dark:border-slate-850/80 shadow-2xl relative z-10">
            <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-950 aspect-[16/10] flex flex-col">
              {/* Mock browser header */}
              <div className="h-10 bg-slate-950 px-4 flex items-center justify-between border-b border-slate-850/50">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="bg-slate-900 px-12 py-1 rounded-md text-[10px] text-slate-500 font-medium">
                  antigravityhr.company.com/dashboard
                </div>
                <div className="w-10" />
              </div>

              {/* Mock body */}
              <div className="flex-1 flex text-[10px] text-slate-400 bg-slate-900">
                {/* Mock sidebar */}
                <div className="w-1/5 bg-slate-950 border-r border-slate-850/50 p-4 space-y-4 hidden sm:block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-accent-600 flex items-center justify-center text-white font-bold text-[10px]">A</span>
                    <span className="font-bold text-white text-[11px] truncate">AntigravityHR</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { l: 'Dashboard', active: true },
                      { l: 'Apply Leave' },
                      { l: 'Leave History' },
                      { l: 'Profile Settings' }
                    ].map((item, index) => (
                      <div key={index} className={`px-2 py-1.5 rounded-md flex items-center gap-2 ${item.active ? 'bg-accent-600/10 text-accent-400 font-medium' : ''}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-accent-500' : 'bg-slate-700'}`} />
                        <span className="truncate">{item.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock content */}
                <div className="flex-1 p-5 space-y-5 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-xs">Employee Dashboard</h4>
                      <p className="text-[9px] text-slate-500 mt-0.5">Quick summary of leave requests</p>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { t: 'Remaining Balance', v: '27 Days', c: 'border-accent-500/30' },
                      { t: 'Approved Leaves', v: '8 Days', c: 'border-emerald-500/20' },
                      { t: 'Pending Requests', v: '3 Days', c: 'border-amber-500/20' }
                    ].map((card, i) => (
                      <div key={i} className={`p-3 bg-slate-950/60 rounded-xl border border-slate-850/60 ${card.c}`}>
                        <p className="text-[8px] text-slate-500 font-semibold tracking-wide uppercase">{card.t}</p>
                        <p className="text-sm font-extrabold text-white mt-1">{card.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart and Activity rows */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Mock chart area */}
                    <div className="col-span-2 p-3.5 bg-slate-950/60 border border-slate-850/50 rounded-xl space-y-3 flex flex-col justify-between">
                      <p className="font-semibold text-white text-[9px]">Monthly Activity Trend</p>
                      <div className="h-28 flex items-end justify-between px-2 pt-2 gap-1.5">
                        {[15, 45, 25, 75, 55, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-slate-800 rounded-t-md relative group flex flex-col justify-end" style={{ height: '100%' }}>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.9 + i * 0.1, duration: 0.5 }}
                              className="w-full bg-gradient-to-t from-accent-600 to-indigo-500 rounded-t-md hover:from-accent-500 hover:to-indigo-400 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mock Activity Feed */}
                    <div className="p-3 bg-slate-950/60 border border-slate-850/50 rounded-xl space-y-3 flex flex-col justify-between">
                      <p className="font-semibold text-white text-[9px]">Recent Actions</p>
                      <div className="space-y-2 flex-grow">
                        {[
                          'Logged in to portal',
                          'Submitted CL request',
                          'Sick Leave Approved'
                        ].map((act, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1 flex-shrink-0" />
                            <p className="text-[8px] text-slate-400 leading-normal truncate">{act}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI Elements */}
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="absolute -top-6 -right-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xl p-3.5 rounded-2xl flex items-center gap-3 z-20 max-w-[210px] text-left hidden sm:flex"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100">Leave Approved</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Jane Doe approved your sick leave</p>
            </div>
          </motion.div>

          <motion.div
            variants={floatVariants}
            animate="animate"
            className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-xl p-3.5 rounded-2xl flex items-center gap-3 z-20 max-w-[210px] text-left hidden sm:flex"
            style={{ animationDelay: '2s' }}
          >
            <div className="w-8 h-8 rounded-lg bg-accent-500/10 text-accent-600 flex items-center justify-center">
              <CalendarRange className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100">Balance Calculated</p>
              <p className="text-[9px] text-slate-400 mt-0.5">No balance overlap detected</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. TRUSTED BY / SOCIAL PROOF */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200/40 dark:border-slate-850/40 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center md:text-left">
              Trusted by high performance teams
            </p>
            {/* Fake SVG logos */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-5 opacity-40 grayscale select-none">
              <span className="font-bold text-base tracking-tight text-slate-700 dark:text-slate-300">STRIPE</span>
              <span className="font-bold text-base tracking-tight text-slate-700 dark:text-slate-300">LINEAR</span>
              <span className="font-bold text-base tracking-tight text-slate-700 dark:text-slate-300">VERCEL</span>
              <span className="font-bold text-base tracking-tight text-slate-700 dark:text-slate-300">SLACK</span>
            </div>
          </div>

          {/* Stats metrics */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-8 md:pt-0 md:pl-12">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">45k+</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Active Users</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">99.8%</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Approval Accuracy</p>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">600+</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Organizations</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Collaborative Teams
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Everything your HR department and workforce need to request, process, and track leaves smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              t: 'Leave Applications', 
              d: 'Submit time-off in seconds with floating calendar views and auto-calculated date durations.', 
              i: CalendarRange,
              color: 'text-accent-500 bg-accent-50 dark:bg-accent-950/30'
            },
            { 
              t: 'Approval Workflows', 
              d: 'Managers process leaves with one-click actions and write custom review remarks.', 
              i: UserCheck,
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
            },
            { 
              t: 'Leave Tracking Ledger', 
              d: 'Search, sort, and filter complete histories of leave requests with status badges.', 
              i: TrendingUp,
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
            },
            { 
              t: 'Balance Management', 
              d: 'Prevent overdrafts. Live balance impact metrics show changes in real-time.', 
              i: Layers,
              color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30'
            },
            { 
              t: 'Analytics Dashboard', 
              d: 'View department leave structures, monthly statistics, and leave trends via interactive charts.', 
              i: PieChartIcon,
              color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30'
            },
            { 
              t: 'Role-Based Access', 
              d: 'Enforce security. Safe route redirections and authentication with encrypted JWT.', 
              i: ShieldCheck,
              color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30'
            },
            { 
              t: 'Employee Ledger', 
              d: 'Expandable manager rows providing breakdowns of leave balances for all members.', 
              i: Users,
              color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30'
            },
            { 
              t: 'Fast Integrations', 
              d: 'Designed to fit cleanly into existing corporate infrastructure. Light/dark modes.', 
              i: Zap,
              color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30'
            }
          ].map((feature, idx) => {
            const Icon = feature.i;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.015 }}
                className="p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl transition-all shadow-sm duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color} mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">{feature.t}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{feature.d}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE WORKFLOW SECTION */}
      <section id="workflow" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200/30 dark:border-slate-850/40 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Visual Approval Lifecycle
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              How requests seamlessly process from employee application to ledger updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800/80 -translate-y-1/2 -z-10 hidden md:block" />

            {[
              {
                step: "01",
                t: "Apply for Leave",
                d: "Employee enters dates and reason. System validates remaining balance.",
                c: "border-accent-500/20"
              },
              {
                step: "02",
                t: "Review Request",
                d: "Manager receives real-time alert, checks schedules, and adds notes.",
                c: "border-indigo-500/20"
              },
              {
                step: "03",
                t: "Approve or Reject",
                d: "Action is logged. Audit trail records decision timestamps.",
                c: "border-rose-500/20"
              },
              {
                step: "04",
                t: "Sync Automatically",
                d: "Deductions sync in background and push to analytics trends.",
                c: "border-emerald-500/20"
              }
            ].map((node, index) => (
              <div 
                key={index}
                className="bg-slate-50 dark:bg-slate-950 p-6 border border-slate-200/50 dark:border-slate-850 rounded-2xl flex flex-col justify-between h-48 relative shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-xs text-accent-500 bg-accent-50 dark:bg-accent-950/40 px-2 py-0.5 rounded-md">
                    {node.step}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">{node.t}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{node.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. DASHBOARD PREVIEW SHOWCASE */}
      <section id="showcase" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            High Fidelity Analytics Showcase
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Beautiful analytics interfaces loaded with operational HR insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Showcase Panel */}
          <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">Approved Leave Trends</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Mock dashboard tracking monthly totals</p>
              </div>
              <span className="text-[10px] font-bold text-accent-600 dark:text-accent-400">Aggregated View</span>
            </div>

            {/* Custom Interactive Mock Chart */}
            <div className="h-60 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-3 pt-6 px-4">
              {[
                { m: 'Jan', val: 40, c: 'bg-accent-500' },
                { m: 'Feb', val: 65, c: 'bg-indigo-500' },
                { m: 'Mar', val: 35, c: 'bg-emerald-500' },
                { m: 'Apr', val: 80, c: 'bg-amber-500' },
                { m: 'May', val: 55, c: 'bg-rose-500' },
                { m: 'Jun', val: 90, c: 'bg-violet-500' }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${bar.val}%` }}
                    viewport={{ once: true }}
                    className={`w-full ${bar.c} rounded-t-lg transition-all duration-300 relative group cursor-pointer shadow-sm`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                      {Math.round(bar.val / 5)} Days
                    </div>
                  </motion.div>
                  <span className="text-[9px] font-semibold text-slate-400 mt-2.5">{bar.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Distribution Panel */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="font-bold text-slate-800 dark:text-white text-xs">Leave Distribution</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Approved allocations by type</p>
            </div>

            {/* Mock Pie Distribution Chart */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <div className="relative w-36 h-36 rounded-full border-[10px] border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[10px] border-accent-500 border-t-transparent border-r-transparent animate-spin-slow" />
                <div className="text-center">
                  <p className="text-xl font-extrabold text-slate-800 dark:text-white">CL</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">55% Share</p>
                </div>
              </div>
            </div>

            {/* Legend info */}
            <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-accent-500" />
                <span>CL</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>SL</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>PL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BENEFITS SECTION */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200/30 dark:border-slate-850/40 px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Empower HR and Workforce Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Why fast-growing companies trust AntigravityHR to manage operational scheduling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                t: "Saves Valuable Time",
                d: "Say goodbye to scattered emails and manual spreadsheet checkups. Autocomplete workflows cut review cycles by 80%."
              },
              {
                t: "Transparent Metrics",
                d: "Employees monitor live available balances before applying, preventing overruns and reducing HR policy questions."
              },
              {
                t: "Productive Scheduling",
                d: "Managers leverage department stats and leave activity logs to plan sprint capacity and cover key dependencies."
              }
            ].map((benefit, i) => (
              <div key={i} className="space-y-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">{benefit.t}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{benefit.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-24 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by Employees and HR
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Real feedback from team leaders and individual contributors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: "AntigravityHR transformed our leave workflow. Reviewing and comments take seconds instead of dragging through spreadsheets.",
              author: "Sarah Chen",
              role: "Head of HR, LinearTech",
              avatar: "SC"
            },
            {
              quote: "The live balance impact calculations are awesome. I see exactly how my time off plans look before submitting the request.",
              author: "Marcus Vance",
              role: "Senior Software Engineer",
              avatar: "MV"
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-8 flex flex-col justify-between space-y-6">
              <p className="text-xs italic leading-relaxed text-slate-600 dark:text-slate-300">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-[11px] text-slate-800 dark:text-white">{item.author}</h4>
                  <p className="text-[9px] text-slate-400">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200/30 dark:border-slate-850/40 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear answers to the common questions about our platform operation.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-slate-950/20"
                      >
                        <p className="px-6 pb-5 pt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-900">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION SECTION */}
      <section className="py-24 px-6 max-w-5xl mx-auto relative overflow-hidden">
        {/* Curved grid background effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-600/10 to-indigo-600/10 rounded-3xl -z-10" />

        <div className="text-center p-12 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Simplify Leave Management?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Create your account today. Log in as an employee to request time off, or as a manager to handle operations.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              to="/login"
              className="bg-accent-600 hover:bg-accent-700 text-white font-bold py-3.5 px-8 rounded-xl text-xs shadow-md shadow-accent-600/20 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-3.5 px-8 border border-slate-200 dark:border-slate-800 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
            >
              Request Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-200/50 dark:border-slate-850/60 bg-white dark:bg-slate-950 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white font-bold">
                <Palmtree className="w-4.5 h-4.5" />
              </div>
              <span className="font-extrabold text-slate-800 dark:text-white text-sm">AntigravityHR</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
              Providing modern, enterprise-grade leave management and HR coordination tools for high-velocity teams.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4">Features</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-slate-850 dark:hover:text-white">Request Tracker</button></li>
              <li><button onClick={() => scrollToSection('workflow')} className="hover:text-slate-850 dark:hover:text-white">Approvals Timeline</button></li>
              <li><button onClick={() => scrollToSection('showcase')} className="hover:text-slate-850 dark:hover:text-white">Insights Analytics</button></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest mb-4">Integrations</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              <li><Link to="/login" className="hover:text-slate-850 dark:hover:text-white">API access</Link></li>
              <li><Link to="/login" className="hover:text-slate-850 dark:hover:text-white">Authentication</Link></li>
              <li><Link to="/login" className="hover:text-slate-850 dark:hover:text-white">Database Schema</Link></li>
            </ul>
          </div>

          {/* Mock Socials */}
          <div className="space-y-4">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Connect</h4>
            <div className="flex gap-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-white flex items-center justify-center border border-slate-200/50 dark:border-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-white flex items-center justify-center border border-slate-200/50 dark:border-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
            <p className="text-[9px] text-slate-400">© 2026 AntigravityHR. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
