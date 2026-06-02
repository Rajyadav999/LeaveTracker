const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Apply for leave (Employee only)
router.post('/apply', verifyToken, requireRole('employee'), leaveController.applyLeave);

// Get leave history (Employee only)
router.get('/history', verifyToken, requireRole('employee'), leaveController.getLeaveHistory);

// Get leave balances (Employee only)
router.get('/balances', verifyToken, requireRole('employee'), leaveController.getLeaveBalances);

// Get pending/processed leave requests (Manager only)
router.get('/manager/requests', verifyToken, requireRole('manager'), leaveController.getManagerRequests);

// Process leave request (Manager only)
router.put('/manager/requests/:id', verifyToken, requireRole('manager'), leaveController.processRequest);

// Get all employee leave summary records (Manager only)
router.get('/manager/employees', verifyToken, requireRole('manager'), leaveController.getEmployeeRecords);

// Get dashboard statistics (Employee and Manager)
router.get('/stats', verifyToken, leaveController.getDashboardStats);

module.exports = router;
