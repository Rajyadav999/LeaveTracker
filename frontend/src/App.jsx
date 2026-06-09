import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { ApplyLeave } from './pages/ApplyLeave';
import { LeaveHistory } from './pages/LeaveHistory';
import { LeaveRequests } from './pages/LeaveRequests';
import { EmployeeRecords } from './pages/EmployeeRecords';
import { Profile } from './pages/Profile';
import { LeaveCalendar } from './pages/LeaveCalendar';
import { LeaveBalance } from './pages/LeaveBalance';
import { LeaveRequestDetails } from './pages/LeaveRequestDetails';

import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Layout wrapper for pages requiring Sidebar and Top Navbar
const LayoutWrapper = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-grow flex flex-col min-w-0">
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Component to decide dashboard view based on user role
const DashboardDispatcher = () => {
  const { user } = useContext(AuthContext);
  return user?.role === 'manager' ? <ManagerDashboard /> : <EmployeeDashboard />;
};

function AppRoutes() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <DashboardDispatcher />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Employee Specific Routes */}
      <Route 
        path="/apply-leave" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <LayoutWrapper>
              <ApplyLeave />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/leave-history" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <LayoutWrapper>
              <LeaveHistory />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/leave-balance" 
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <LayoutWrapper>
              <LeaveBalance />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Manager Specific Routes */}
      <Route 
        path="/leave-requests" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <LayoutWrapper>
              <LeaveRequests />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/leave-requests/:id" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <LayoutWrapper>
              <LeaveRequestDetails />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/employee-records" 
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <LayoutWrapper>
              <EmployeeRecords />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Shared Protected Routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <Profile />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/calendar" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <LeaveCalendar />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <AppRoutes />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
