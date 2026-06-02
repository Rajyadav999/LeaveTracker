const db = require('../config/db');

// Helper to calculate duration in days (inclusive)
const calculateDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Apply for Leave (Employee)
exports.applyLeave = async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const userId = req.user.id;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return res.status(400).json({ message: 'Start date cannot be in the past.' });
  }

  if (end < start) {
    return res.status(400).json({ message: 'End date must be after or equal to start date.' });
  }

  const duration = calculateDays(startDate, endDate);

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check balance
    const [balances] = await connection.query(
      'SELECT * FROM leave_balances WHERE user_id = ? AND leave_type = ?',
      [userId, leaveType]
    );

    if (balances.length === 0) {
      connection.release();
      return res.status(404).json({ message: `No leave balance record found for type: ${leaveType}` });
    }

    const balance = balances[0];
    const remaining = balance.allocated - balance.used;

    // Check if adding this leave exceeds the remaining balance (taking into account already pending requests)
    if (balance.pending + duration > remaining) {
      connection.release();
      return res.status(400).json({
        message: `Insufficient leave balance. Remaining: ${remaining} days, Pending: ${balance.pending} days, Requested: ${duration} days.`
      });
    }

    // Insert leave request
    const [requestResult] = await connection.query(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, duration, reason, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, leaveType, startDate, endDate, duration, reason]
    );

    // Update pending balance
    await connection.query(
      'UPDATE leave_balances SET pending = pending + ? WHERE user_id = ? AND leave_type = ?',
      [duration, userId, leaveType]
    );

    // Log Activity
    await connection.query(
      'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
      [userId, `Applied for ${leaveType} (${duration} days) from ${startDate} to ${endDate}`]
    );

    // Notify Managers
    const [managers] = await connection.query("SELECT id FROM users WHERE role = 'manager'");
    for (const manager of managers) {
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          manager.id,
          'New Leave Request',
          `${req.user.name} submitted a new ${leaveType} request for ${duration} days.`
        ]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Leave application submitted successfully.',
      requestId: requestResult.insertId,
      duration
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Internal server error processing leave application.' });
  }
};

// Get Leave History (Employee)
exports.getLeaveHistory = async (req, res) => {
  const userId = req.user.id;
  const { status, leaveType, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT r.*, m.name as manager_name 
      FROM leave_requests r 
      LEFT JOIN users m ON r.manager_id = m.id 
      WHERE r.user_id = ?
    `;
    const queryParams = [userId];

    if (status) {
      query += ' AND r.status = ?';
      queryParams.push(status);
    }

    if (leaveType) {
      query += ' AND r.leave_type = ?';
      queryParams.push(leaveType);
    }

    if (search) {
      query += ' AND (r.reason LIKE ? OR r.leave_type LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [requests] = await db.query(query, queryParams);

    // Count total records for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM leave_requests r WHERE r.user_id = ?';
    const countParams = [userId];

    if (status) {
      countQuery += ' AND r.status = ?';
      countParams.push(status);
    }
    if (leaveType) {
      countQuery += ' AND r.leave_type = ?';
      countParams.push(leaveType);
    }
    if (search) {
      countQuery += ' AND (r.reason LIKE ? OR r.leave_type LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ message: 'Internal server error fetching leave history.' });
  }
};

// Get Leave Balances (Employee)
exports.getLeaveBalances = async (req, res) => {
  const userId = req.user.id;

  try {
    const [balances] = await db.query(
      'SELECT leave_type, allocated, used, pending, (allocated - used) as remaining FROM leave_balances WHERE user_id = ?',
      [userId]
    );

    res.status(200).json(balances);
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ message: 'Internal server error fetching leave balances.' });
  }
};

// Get All Employee Requests (Manager)
exports.getManagerRequests = async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT r.*, u.name as employee_name, u.email as employee_email, u.department, m.name as manager_name 
      FROM leave_requests r 
      JOIN users u ON r.user_id = u.id 
      LEFT JOIN users m ON r.manager_id = m.id 
      WHERE 1=1
    `;
    const queryParams = [];

    if (status) {
      query += ' AND r.status = ?';
      queryParams.push(status);
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR r.leave_type LIKE ? OR r.reason LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [requests] = await db.query(query, queryParams);

    // Count query
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM leave_requests r 
      JOIN users u ON r.user_id = u.id 
      WHERE 1=1
    `;
    const countParams = [];

    if (status) {
      countQuery += ' AND r.status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (u.name LIKE ? OR r.leave_type LIKE ? OR r.reason LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching manager requests:', error);
    res.status(500).json({ message: 'Internal server error fetching requests.' });
  }
};

// Process Leave Request: Approve or Reject (Manager)
exports.processRequest = async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const managerId = req.user.id;

  if (!status || (status !== 'approved' && status !== 'rejected')) {
    return res.status(400).json({ message: 'Valid status (approved or rejected) is required.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Fetch the request
    const [requests] = await connection.query('SELECT * FROM leave_requests WHERE id = ? FOR UPDATE', [id]);
    if (requests.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Leave request not found.' });
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      connection.release();
      return res.status(400).json({ message: 'This request has already been processed.' });
    }

    const { user_id, leave_type, duration } = request;

    // Fetch employee name
    const [employees] = await connection.query('SELECT name FROM users WHERE id = ?', [user_id]);
    const employeeName = employees[0]?.name || 'Employee';

    if (status === 'approved') {
      // Deduct from pending, add to used
      await connection.query(
        `UPDATE leave_balances 
         SET pending = pending - ?, used = used + ? 
         WHERE user_id = ? AND leave_type = ?`,
        [duration, duration, user_id, leave_type]
      );

      // Update request
      await connection.query(
        'UPDATE leave_requests SET status = ?, remarks = ?, manager_id = ? WHERE id = ?',
        ['approved', remarks || null, managerId, id]
      );

      // Log Activity
      await connection.query(
        'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
        [managerId, `Approved ${leave_type} request for ${employeeName} (${duration} days)`]
      );

      // Notify Employee
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          user_id,
          'Leave Approved',
          `Your ${leave_type} request for ${request.start_date} to ${request.end_date} has been approved.`
        ]
      );
    } else {
      // Rejections: Deduct from pending only
      await connection.query(
        `UPDATE leave_balances 
         SET pending = pending - ? 
         WHERE user_id = ? AND leave_type = ?`,
        [duration, user_id, leave_type]
      );

      // Update request
      await connection.query(
        'UPDATE leave_requests SET status = ?, remarks = ?, manager_id = ? WHERE id = ?',
        ['rejected', remarks || null, managerId, id]
      );

      // Log Activity
      await connection.query(
        'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
        [managerId, `Rejected ${leave_type} request for ${employeeName} (${duration} days)`]
      );

      // Notify Employee
      await connection.query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [
          user_id,
          'Leave Rejected',
          `Your ${leave_type} request for ${request.start_date} to ${request.end_date} has been rejected. Remarks: ${remarks || 'None'}`
        ]
      );
    }

    await connection.commit();
    connection.release();

    res.status(200).json({ message: `Leave request has been successfully ${status}.` });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error('Error processing leave request:', error);
    res.status(500).json({ message: 'Internal server error processing leave request.' });
  }
};

// Get Employee Leave Records (Manager view of all employees)
exports.getEmployeeRecords = async (req, res) => {
  const { search } = req.query;

  try {
    let query = `
      SELECT u.id, u.name, u.email, u.department, 
             SUM(b.allocated) as total_allocated, 
             SUM(b.used) as total_used, 
             SUM(b.pending) as total_pending 
      FROM users u 
      LEFT JOIN leave_balances b ON u.id = b.user_id 
      WHERE u.role = 'employee'
    `;
    const params = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id';

    const [records] = await db.query(query, params);

    // Fetch individual balances for each user to expand detailed breakdown in front end
    for (const record of records) {
      const [balances] = await db.query(
        'SELECT leave_type, allocated, used, pending, (allocated - used) as remaining FROM leave_balances WHERE user_id = ?',
        [record.id]
      );
      record.balances = balances;
    }

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching employee records:', error);
    res.status(500).json({ message: 'Internal server error fetching employee records.' });
  }
};

// Get Dashboard Analytics/Stats
exports.getDashboardStats = async (req, res) => {
  const { id, role } = req.user;

  try {
    if (role === 'employee') {
      // 1. Leave counts
      const [counts] = await db.query(
        `SELECT 
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
           COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
         FROM leave_requests WHERE user_id = ?`,
        [id]
      );

      // 2. Leave balances
      const [balances] = await db.query(
        'SELECT leave_type, allocated, used, pending, (allocated - used) as remaining FROM leave_balances WHERE user_id = ?',
        [id]
      );

      // 3. Monthly leave trend (last 6 months)
      // Grouping by Month Name and summing approved durations
      const [trend] = await db.query(
        `SELECT DATE_FORMAT(start_date, '%b %Y') as month, SUM(duration) as days 
         FROM leave_requests 
         WHERE user_id = ? AND status = 'approved' 
           AND start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(start_date, '%Y-%m'), DATE_FORMAT(start_date, '%b %Y')
         ORDER BY DATE_FORMAT(start_date, '%Y-%m') ASC`,
        [id]
      );

      // 4. Activity Logs (last 5)
      const [activities] = await db.query(
        'SELECT action, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
        [id]
      );

      res.status(200).json({
        summary: {
          pending: counts[0].pending || 0,
          approved: counts[0].approved || 0,
          rejected: counts[0].rejected || 0,
          balances
        },
        trend,
        activities
      });
    } else {
      // Manager Dashboards
      // 1. Global totals
      const [userCount] = await db.query("SELECT COUNT(*) as total FROM users WHERE role = 'employee'");
      const [counts] = await db.query(
        `SELECT 
           COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
           COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
           COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
         FROM leave_requests`
      );

      // 2. Leave type distribution (Approved days per leave type)
      const [distribution] = await db.query(
        `SELECT leave_type as name, SUM(duration) as value 
         FROM leave_requests 
         WHERE status = 'approved' 
         GROUP BY leave_type`
      );

      // 3. Monthly trend (last 6 months)
      const [trend] = await db.query(
        `SELECT DATE_FORMAT(start_date, '%b %Y') as month, SUM(duration) as days 
         FROM leave_requests 
         WHERE status = 'approved' 
           AND start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY DATE_FORMAT(start_date, '%Y-%m'), DATE_FORMAT(start_date, '%b %Y')
         ORDER BY DATE_FORMAT(start_date, '%Y-%m') ASC`
      );

      // 4. Department breakdown (Days approved per department)
      const [departmentStats] = await db.query(
        `SELECT u.department, SUM(r.duration) as days 
         FROM leave_requests r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.status = 'approved' 
         GROUP BY u.department`
      );

      // 5. Recent Activity Logs (last 10 across all users)
      const [activities] = await db.query(
        `SELECT a.action, a.created_at, u.name as user_name, u.role as user_role 
         FROM activity_logs a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC LIMIT 10`
      );

      res.status(200).json({
        summary: {
          totalEmployees: userCount[0].total || 0,
          pending: counts[0].pending || 0,
          approved: counts[0].approved || 0,
          rejected: counts[0].rejected || 0
        },
        distribution,
        trend,
        departmentStats,
        activities
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ message: 'Internal server error fetching dashboard statistics.' });
  }
};
