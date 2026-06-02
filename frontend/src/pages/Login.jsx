import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Palmtree, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft, Mail, Lock, Key } from 'lucide-react';

export const Login = () => {
  const { login, registerUser, sendOtp, forgotPassword, resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [showRegisterOtp, setShowRegisterOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

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
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };

    if (name === 'role') {
      if (value === 'manager') {
        updatedData.department = 'Management';
      } else {
        updatedData.department = 'Engineering';
      }
    }

    setFormData(updatedData);
    setError('');
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const email = isForgotPassword ? forgotEmail : formData.email;
    const res = isForgotPassword ? await forgotPassword(email) : await sendOtp(email);
    if (res.success) {
      setSuccess('Verification OTP code resent successfully!');
      setOtpCountdown(60);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isForgotPassword) {
      if (!showResetPassword) {
        const res = await forgotPassword(forgotEmail);
        if (res.success) {
          setSuccess('A password reset OTP code has been sent to your email.');
          setShowResetPassword(true);
          setOtpCountdown(60);
        } else {
          setError(res.message);
        }
      } else {
        const res = await resetPassword(forgotEmail, resetOtpCode, newPassword);
        if (res.success) {
          setSuccess('Password reset successfully! You can now log in.');
          setIsForgotPassword(false);
          setShowResetPassword(false);
          setForgotEmail('');
          setResetOtpCode('');
          setNewPassword('');
        } else {
          setError(res.message);
        }
      }
    } else if (isRegister) {
      if (!showRegisterOtp) {
        const res = await sendOtp(formData.email);
        if (res.success) {
          setSuccess('A verification OTP has been sent to your email address.');
          setShowRegisterOtp(true);
          setOtpCountdown(60);
        } else {
          setError(res.message);
        }
      } else {
        const res = await registerUser(
          formData.name,
          formData.email,
          formData.password,
          formData.role,
          formData.department,
          otpCode
        );
        if (res.success) {
          setSuccess('Registration successful! You can now log in.');
          setIsRegister(false);
          setShowRegisterOtp(false);
          setOtpCode('');
          setFormData(prev => ({ ...prev, password: '' }));
        } else {
          setError(res.message);
        }
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

  const toggleForgotPassword = () => {
    setIsForgotPassword(!isForgotPassword);
    setShowResetPassword(false);
    setForgotEmail('');
    setResetOtpCode('');
    setNewPassword('');
    setError('');
    setSuccess('');
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
        {/* Logo & Headers */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent-600 flex items-center justify-center text-white shadow-xl shadow-accent-600/30 mb-3">
            <Palmtree className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            {isForgotPassword 
              ? (showResetPassword ? 'Set New Password' : 'Reset Password')
              : (isRegister 
                  ? (showRegisterOtp ? 'Email Verification' : 'Create an Account') 
                  : 'Welcome Back'
                )
            }
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center px-4">
            {isForgotPassword 
              ? (showResetPassword 
                  ? 'Enter the code sent to your email and your new password.' 
                  : 'Enter your registered email address to receive an OTP verification code.'
                )
              : (isRegister 
                  ? (showRegisterOtp 
                      ? 'Enter the 6-digit verification code sent to your email.' 
                      : 'Register to start tracking your leaves'
                    )
                  : 'Enter your credentials to access your dashboard'
                )
            }
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

        {/* FORMS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* FORGOT PASSWORD FLOW */}
          {isForgotPassword && (
            <>
              {!showResetPassword ? (
                // Step 1: Input Email
                <div className="floating-input-group">
                  <input
                    type="email"
                    id="forgotEmail"
                    required
                    placeholder=" "
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="floating-input"
                  />
                  <label htmlFor="forgotEmail" className="floating-label">Email Address</label>
                </div>
              ) : (
                // Step 2: Input OTP + New Password
                <>
                  <div className="floating-input-group">
                    <input
                      type="text"
                      id="resetOtpCode"
                      required
                      maxLength={6}
                      placeholder=" "
                      value={resetOtpCode}
                      onChange={(e) => setResetOtpCode(e.target.value)}
                      className="floating-input text-center font-bold tracking-widest"
                    />
                    <label htmlFor="resetOtpCode" className="floating-label w-full text-center left-0">6-Digit OTP Code</label>
                  </div>
                  <div className="floating-input-group">
                    <input
                      type="password"
                      id="newPassword"
                      required
                      placeholder=" "
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="floating-input"
                    />
                    <label htmlFor="newPassword" className="floating-label">New Password</label>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2 px-1">
                    <span className="text-slate-400">Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={loading || otpCountdown > 0}
                      onClick={handleResendOtp}
                      className="font-semibold text-accent-600 dark:text-accent-400 disabled:opacity-50 hover:underline"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent-600/25 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : (showResetPassword ? 'Reset Password' : 'Send Verification Code')}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleForgotPassword}
                className="w-full mt-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </button>
            </>
          )}

          {/* NORMAL LOGIN / REGISTRATION FLOW */}
          {!isForgotPassword && (
            <>
              {/* REGISTRATION OTP STAGE */}
              {isRegister && showRegisterOtp ? (
                <>
                  <div className="floating-input-group">
                    <input
                      type="text"
                      id="otpCode"
                      required
                      maxLength={6}
                      placeholder=" "
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="floating-input text-center font-bold tracking-widest"
                    />
                    <label htmlFor="otpCode" className="floating-label w-full text-center left-0">6-Digit OTP Code</label>
                  </div>

                  <div className="flex justify-between items-center text-xs mt-2 px-1">
                    <span className="text-slate-400">Didn't receive code?</span>
                    <button
                      type="button"
                      disabled={loading || otpCountdown > 0}
                      onClick={handleResendOtp}
                      className="font-semibold text-accent-600 dark:text-accent-400 disabled:opacity-50 hover:underline"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent-600/25 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Verify & Sign Up'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRegisterOtp(false)}
                    className="w-full mt-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-3 px-4 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change Email / Edit Details
                  </button>
                </>
              ) : (
                // DETAILS ENTRY STAGE (LOGIN / REGISTER DETAILS)
                <>
                  {isRegister && (
                    <div className="floating-input-group animate-slideDown">
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
                    <div className="grid grid-cols-2 gap-4 animate-slideDown">
                      <div className={formData.role === 'manager' ? "col-span-2" : ""}>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1">Role</label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="block w-full px-3 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-transparent dark:text-white"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                        </select>
                      </div>

                      {formData.role !== 'manager' && (
                        <div className="animate-slideDown">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 px-1">Department</label>
                          <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="block w-full px-3 py-2.5 text-xs text-slate-800 bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-transparent dark:text-white"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Finance">Finance</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {!isRegister && (
                    <div className="flex justify-end px-1">
                      <button
                        type="button"
                        onClick={toggleForgotPassword}
                        className="text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent-600/25 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (isRegister ? 'Send Verification OTP' : 'Sign In')}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </>
              )}
            </>
          )}
        </form>

        {/* Bottom Toggle Link */}
        {!showRegisterOtp && !isForgotPassword && (
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
        )}

        {/* Demo Quick login details for Evaluators */}
        {!isRegister && !isForgotPassword && (
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

