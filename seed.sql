USE `leave_tracker`;

-- Clear existing data
DELETE FROM `activity_logs`;
DELETE FROM `notifications`;
DELETE FROM `leave_requests`;
DELETE FROM `leave_balances`;
DELETE FROM `users`;

-- Reset Auto Increment
ALTER TABLE `users` AUTO_INCREMENT = 1;
ALTER TABLE `leave_balances` AUTO_INCREMENT = 1;
ALTER TABLE `leave_requests` AUTO_INCREMENT = 1;
ALTER TABLE `notifications` AUTO_INCREMENT = 1;
ALTER TABLE `activity_logs` AUTO_INCREMENT = 1;

-- Insert Users (Password is 'password123' for all)
-- Hash: $2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`) VALUES
(1, 'Jane Doe', 'manager@company.com', '$2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G', 'manager', 'Human Resources'),
(2, 'Alex Smith', 'techmanager@company.com', '$2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G', 'manager', 'Engineering'),
(3, 'John Doe', 'employee@company.com', '$2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G', 'employee', 'Engineering'),
(4, 'Sarah Jenkins', 'employee2@company.com', '$2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G', 'employee', 'Engineering'),
(5, 'Robert Chen', 'employee3@company.com', '$2a$10$X7M299J3g4uUaA3XN8wM0uz.x94K/3q.v8gNlR9Z/713J1tY5gW9G', 'employee', 'Marketing');

-- Insert Leave Balances for Employees (CL: 15, SL: 12, PL: 18)
INSERT INTO `leave_balances` (`user_id`, `leave_type`, `allocated`, `used`, `pending`) VALUES
-- John Doe (user_id: 3)
(3, 'Casual Leave', 15, 2, 3),
(3, 'Sick Leave', 12, 1, 0),
(3, 'Paid Leave', 18, 0, 0),
-- Sarah Jenkins (user_id: 4)
(4, 'Casual Leave', 15, 0, 0),
(4, 'Sick Leave', 12, 3, 2),
(4, 'Paid Leave', 18, 5, 0),
-- Robert Chen (user_id: 5)
(5, 'Casual Leave', 15, 4, 0),
(5, 'Sick Leave', 12, 0, 0),
(5, 'Paid Leave', 18, 0, 0);

-- Insert Sample Leave Requests
INSERT INTO `leave_requests` (`id`, `user_id`, `leave_type`, `start_date`, `end_date`, `duration`, `reason`, `status`, `remarks`, `manager_id`, `created_at`) VALUES
-- John Doe Approved
(1, 3, 'Casual Leave', '2026-05-10', '2026-05-11', 2, 'Family function in hometown', 'approved', 'Approved. Enjoy your time off.', 2, '2026-05-01 10:00:00'),
-- John Doe Sick (Approved)
(2, 3, 'Sick Leave', '2026-05-18', '2026-05-18', 1, 'Dental checkup and recovery', 'approved', 'Approved.', 2, '2026-05-18 08:30:00'),
-- John Doe Pending
(3, 3, 'Casual Leave', '2026-06-15', '2026-06-17', 3, 'Short vacation with family', 'pending', NULL, NULL, '2026-06-01 09:00:00'),
-- Sarah Jenkins Approved Paid Leave
(4, 4, 'Paid Leave', '2026-04-12', '2026-04-16', 5, 'Annual vacation trip', 'approved', 'Have a great vacation!', 2, '2026-04-01 11:30:00'),
-- Sarah Jenkins Approved Sick Leave
(5, 4, 'Sick Leave', '2026-05-20', '2026-05-22', 3, 'Fever and cold recovery', 'approved', 'Get well soon.', 2, '2026-05-19 14:00:00'),
-- Sarah Jenkins Pending Sick Leave
(6, 4, 'Sick Leave', '2026-06-10', '2026-06-11', 2, 'Medical checkup appointment', 'pending', NULL, NULL, '2026-06-02 10:15:00'),
-- Robert Chen Rejected
(7, 5, 'Casual Leave', '2026-05-25', '2026-05-28', 4, 'Going to friend wedding', 'rejected', 'Critical release scheduled for marketing campaign during these dates.', 1, '2026-05-12 16:45:00'),
-- Robert Chen Approved
(8, 5, 'Casual Leave', '2026-05-05', '2026-05-08', 4, 'Moving to a new apartment', 'approved', 'Approved.', 1, '2026-04-28 09:20:00');

-- Insert Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(3, 'Leave Approved', 'Your Casual Leave request for 2026-05-10 to 2026-05-11 (2 days) has been approved by Alex Smith.', TRUE, '2026-05-02 09:00:00'),
(3, 'Leave Approved', 'Your Sick Leave request for 2026-05-18 to 2026-05-18 (1 day) has been approved by Alex Smith.', TRUE, '2026-05-18 09:00:00'),
(5, 'Leave Rejected', 'Your Casual Leave request for 2026-05-25 to 2026-05-28 (4 days) has been rejected by Jane Doe.', TRUE, '2026-05-13 10:00:00'),
(1, 'New Leave Request', 'Robert Chen has submitted a new Casual Leave request.', FALSE, '2026-04-28 09:20:00'),
(2, 'New Leave Request', 'John Doe has submitted a new Casual Leave request.', FALSE, '2026-06-01 09:00:00'),
(2, 'New Leave Request', 'Sarah Jenkins has submitted a new Sick Leave request.', FALSE, '2026-06-02 10:15:00');

-- Insert Activity Logs
INSERT INTO `activity_logs` (`user_id`, `action`, `created_at`) VALUES
(3, 'Logged in to the portal', '2026-06-02 09:00:00'),
(3, 'Submitted a leave request for Casual Leave (3 days)', '2026-06-01 09:00:00'),
(4, 'Submitted a leave request for Sick Leave (2 days)', '2026-06-02 10:15:00'),
(1, 'Rejected Casual Leave request for Robert Chen', '2026-05-13 10:00:00'),
(2, 'Approved Sick Leave request for John Doe', '2026-05-18 09:00:00');
