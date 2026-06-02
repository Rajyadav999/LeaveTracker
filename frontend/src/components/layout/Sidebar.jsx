import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  History, 
  Inbox, 
  Users, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Palmtree,
  Menu,
  X
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getLinks = () => {
    if (user?.role === 'manager') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/leave-requests', label: 'Leave Requests', icon: Inbox },
        { path: '/employee-records', label: 'Employee Records', icon: Users },
        { path: '/profile', label: 'Profile Settings', icon: User },
      ];
    } else {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/apply-leave', label: 'Apply Leave', icon: CalendarPlus },
        { path: '/leave-history', label: 'Leave History', icon: History },
        { path: '/profile', label: 'Profile Settings', icon: User },
      ];
    }
  };

  const links = getLinks();

  const sidebarVariants = {
    expanded: { width: '260px' },
    collapsed: { width: '88px' }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen sticky top-0 left-0 overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 z-30"
      >
        {/* Header */}
        <div className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          <div className={`flex items-center overflow-hidden ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-xl bg-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-600/30 flex-shrink-0">
              <Palmtree className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-bold text-lg bg-gradient-to-r from-accent-600 to-indigo-600 bg-clip-text text-transparent truncate"
              >
                AntigravityHR
              </motion.span>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${isCollapsed ? 'absolute left-[58px] top-5 p-1 bg-white dark:bg-slate-900 shadow-sm' : 'p-1.5'}`}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Quick Info */}
        {!isCollapsed && (
          <div className="p-4 mx-3 my-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{user?.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user?.role} • {user?.department}</p>
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center my-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Links */}
        <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-4' : 'px-3'}`}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.label : undefined}
                className={({ isActive }) => 
                  `flex items-center rounded-xl transition-all duration-200 group text-sm font-medium ${
                    isCollapsed ? 'justify-center px-0 py-3.5' : 'gap-3 px-4 py-3'
                  } ${
                    isActive 
                      ? 'bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex items-center w-full text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors duration-150 ${
              isCollapsed ? 'justify-center px-0 py-3.5' : 'gap-3 px-4 py-3'
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-50 p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-600 flex items-center justify-center text-white shadow-lg">
                    <Palmtree className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-accent-600 to-indigo-600 bg-clip-text text-transparent">
                    AntigravityHR
                  </span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user?.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} • {user?.department}</p>
                </div>
              </div>

              <nav className="flex-grow space-y-1">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                          isActive 
                            ? 'bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl mt-auto"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
