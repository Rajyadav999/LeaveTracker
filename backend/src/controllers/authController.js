const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../utils/mailer');
require('dotenv').config();

exports.register = async (req, res) => {
  const { name, email, password, role, department, otp } = req.body;

  if (!name || !email || !password || !role || !department || !otp) {
    return res.status(400).json({ message: 'All fields including OTP code are required.' });
  }

  if (role !== 'employee' && role !== 'manager') {
    return res.status(400).json({ message: 'Role must be either employee or manager.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verify OTP
    const [otpRecord] = await connection.query(
      'SELECT id FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRecord.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid or expired OTP verification code.' });
    }

    // Delete verified OTP so it cannot be reused
    await connection.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Check if user already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, department]
    );

    const userId = userResult.insertId;

    // If the registered user is an employee, insert default leave balances
    if (role === 'employee') {
      const defaultBalances = [
        { type: 'Casual Leave', allocated: 15 },
        { type: 'Sick Leave', allocated: 12 },
        { type: 'Paid Leave', allocated: 18 }
      ];

      for (const balance of defaultBalances) {
        await connection.query(
          'INSERT INTO leave_balances (user_id, leave_type, allocated, used, pending) VALUES (?, ?, ?, 0, 0)',
          [userId, balance.type, balance.allocated]
        );
      }

      // Log activity
      await connection.query(
        'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
        [userId, 'Account created and default leave balances allocated']
      );
    } else {
      // Log activity for manager
      await connection.query(
        'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
        [userId, 'Manager account created']
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET || 'supersecretkey_leave_tracker_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create activity log
    await db.query('INSERT INTO activity_logs (user_id, action) VALUES (?, ?)', [user.id, 'Logged in to the portal']);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, department, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  const { name, department } = req.body;

  if (!name || !department) {
    return res.status(400).json({ message: 'Name and department are required.' });
  }

  try {
    await db.query(
      'UPDATE users SET name = ?, department = ? WHERE id = ?',
      [name, department, req.user.id]
    );

    // Log activity
    await db.query('INSERT INTO activity_logs (user_id, action) VALUES (?, ?)', [
      req.user.id,
      'Updated profile information'
    ]);

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: req.user.id,
        name,
        department
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error updating profile.' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old password and new password are required.' });
  }

  try {
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    // Validate old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, req.user.id]);

    // Log activity
    await db.query('INSERT INTO activity_logs (user_id, action) VALUES (?, ?)', [
      req.user.id,
      'Changed password'
    ]);

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error changing password.' });
  }
};

// Send OTP for new User Registration
exports.sendRegisterOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    // Check if email already registered
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Delete any old OTPs for this email
    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB, expires in 10 minutes
    await db.query(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, otp]
    );

    // Send the email
    await mailer.sendOtpEmail(email, otp);

    res.status(200).json({ message: 'Verification OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending registration OTP:', error);
    res.status(500).json({ message: 'Failed to send verification OTP.' });
  }
};

// Send OTP for Forgot/Reset Password
exports.sendResetPasswordOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Delete any old OTPs for this email
    await db.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    await db.query(
      'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, otp]
    );

    // Send email
    await mailer.sendOtpEmail(email, otp);

    res.status(200).json({ message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    res.status(500).json({ message: 'Failed to send password reset OTP.' });
  }
};

// Reset password using OTP verification
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Verify OTP
    const [otpRecord] = await connection.query(
      'SELECT id FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, otp]
    );

    if (otpRecord.length === 0) {
      connection.release();
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    // Delete verified OTP
    await connection.query('DELETE FROM otp_verifications WHERE email = ?', [email]);

    // Get user id to log activity
    const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found.' });
    }
    const userId = users[0].id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPasswordHash, userId]);

    // Log Activity
    await connection.query('INSERT INTO activity_logs (user_id, action) VALUES (?, ?)', [
      userId,
      'Reset password using email OTP verification'
    ]);

    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error resetting password.' });
  }
};
