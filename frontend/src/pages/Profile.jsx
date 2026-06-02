import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Key, CheckCircle, AlertTriangle, Briefcase, Mail } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfileState } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileError('');
    setProfileSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await axios.put('http://localhost:5000/api/auth/profile', profileData);
      updateProfileState(response.data.user);
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Validate your old password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Account Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your basic profile information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-sm mb-5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-accent-500" />
              General Details
            </h2>

            <AnimatePresence mode="wait">
              {profileError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-[11px]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{profileError}</span>
                </motion.div>
              )}
              {profileSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-[11px]"
                >
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 dark:text-slate-100 text-sm">{user?.name}</h3>
                  <p className="text-[10px] text-slate-400 capitalize">{user?.role} • {user?.department}</p>
                </div>
              </div>

              {/* Readonly info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-1">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-1">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>Role Authorization: <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{user?.role}</span></span>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800/80 my-4" />

              <div className="floating-input-group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder=" "
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="floating-input"
                />
                <label htmlFor="name" className="floating-label">Full Name</label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1">Department</label>
                <select
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileChange}
                  className="block w-full px-4 py-3 text-sm text-slate-800 bg-white border border-slate-200 dark:border-slate-850 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent dark:text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {profileLoading ? 'Saving...' : 'Update Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Card */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-sm mb-5 text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-accent-500" />
              Update Password
            </h2>

            <AnimatePresence mode="wait">
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 p-3 rounded-xl flex items-center gap-2 text-[11px]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </motion.div>
              )}
              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-[11px]"
                >
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="floating-input-group">
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  required
                  placeholder=" "
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="floating-input"
                />
                <label htmlFor="oldPassword" className="floating-label">Current Password</label>
              </div>

              <div className="floating-input-group">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  placeholder=" "
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="floating-input"
                />
                <label htmlFor="newPassword" className="floating-label">New Password</label>
              </div>

              <div className="floating-input-group">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder=" "
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="floating-input"
                />
                <label htmlFor="confirmPassword" className="floating-label">Confirm New Password</label>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
              >
                {passwordLoading ? 'Processing...' : 'Save Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
