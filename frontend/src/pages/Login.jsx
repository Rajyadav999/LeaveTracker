import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Palmtree, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const { login, registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isRegister) {
      const res = await registerUser(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.department
      );
      if (res.success) {
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 px-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-accent-400 dark:bg-accent-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-8 right-20 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent-600 flex items-center justify-center text-white shadow-xl shadow-accent-600/30 mb-3">
            <Palmtree className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center">
            {isRegister 
              ? 'Register to start tracking your leaves' 
              : 'Enter your credentials to access your dashboard'}
          </p>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl flex items-center gap-3 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl flex items-center gap-3 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="floating-input-group">
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                className="floating-input"
              />
              <label htmlFor="name" className="floating-label">Full Name</label>
            </div>
          )}

          <div className="floating-input-group">
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder=" "
              value={formData.email}
              onChange={handleChange}
              className="floating-input"
            />
            <label htmlFor="email" className="floating-label">Email Address</label>
          </div>

          <div className="floating-input-group">
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              className="floating-input"
            />
            <label htmlFor="password" className="floating-label">Password</label>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-transparent"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent-600/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Demo Quick login details for Evaluators */}
        {!isRegister && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 rounded-2xl">
            <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Demo Credentials:</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-300">Employee:</p>
                <p>employee@company.com</p>
                <p>password123</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-300">Manager:</p>
                <p>manager@company.com</p>
                <p>password123</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
