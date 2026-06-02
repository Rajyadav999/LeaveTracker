# Leave_Tracker — Employee Leave Management System

A premium, secure, and production-ready enterprise HRMS dashboard designed for managing employee leaves, tracking real-time allocations, and handling manager review workflows. Built with a modern, high-fidelity user interface matching state-of-the-art SaaS designs like Linear, Notion, and Workday.

---

## 🌟 Key Features

### 👤 Employee Portal
*   **Intuitive Dashboard**: At-a-glance cards showing remaining, used, pending, and rejected leave days.
*   **Live Balance Monitor**: Visually track the projected impact of your leave request before submitting it.
*   **Leave Application Form**: Auto-calculated durations with real-time balance checks and date validators.
*   **Leave History Ledger**: Fully searchable, sortable, filterable list of all previous applications with custom managers' feedback.
*   **Profile Settings**: Manage personal details and change account passwords.

### 💼 Manager Portal
*   **Corporate Analytics Dashboard**: Monitor aggregate employee statistics, monthly leave trends via interactive charts, and department breakdowns.
*   **Interactive Charts**: Powered by Recharts, showing leave type distributions and resource usage trends.
*   **Review Workflows**: Quick side-drawer review tool to approve/reject pending leaves and append manager remarks.
*   **Employee Leave Records**: Expandable list of all company employees displaying detailed balance sheets (CL, SL, PL).

### 🔒 Non-Functional & Security
*   **JWT Authentication**: Secure user session persistence.
*   **Role-Based Access Control (RBAC)**: Route-level protection blocking unauthorized employee or manager requests.
*   **Audit Trails & Activity Logs**: Record all user actions (logins, submissions, approvals).
*   **Real-time Notifications**: Alerts for approvals, rejections, and new requests.
*   **Premium Aesthetics**: Modern, responsive layout with light/dark theme toggles, glassmorphism panel styles, and smooth Framer Motion page transitions.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), React Router v6, Context API, Axios, Tailwind CSS v4, Framer Motion, Recharts, Lucide React.
*   **Backend**: Node.js, Express.js, MySQL Connection Pool (`mysql2/promise`), JWT, bcryptjs.
*   **Database**: MySQL.

---

## 📂 Project Structure

```text
c:/Project/leavetracker/
├── backend/                  # Node.js + Express API Server
│   ├── src/
│   │   ├── config/           # DB connection pooling
│   │   ├── controllers/      # Business logic controllers
│   │   ├── middleware/       # Auth validation (JWT & Roles)
│   │   ├── routes/           # API endpoints routing
│   │   ├── app.js            # Express application configurations
│   │   └── server.js         # Entry server file
│   ├── .env.example          # Environment template
│   └── package.json
├── frontend/                 # Vite React Application
│   ├── src/
│   │   ├── components/       # Layouts (Sidebar, Navbar)
│   │   ├── context/          # React Auth, Theme, & Notifications Providers
│   │   ├── pages/            # Frontend routes components
│   │   ├── App.jsx           # Main router & page structure
│   │   ├── index.css         # Styling directives and custom utilities
│   │   └── main.jsx          # App entry point
│   ├── index.html            # Core HTML template with SEO tags
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── schema.sql                # MySQL DB schema definition
├── seed.sql                  # Initial database mock seed records
└── README.md                 # Complete documentation (This file)
```

---

## 🚀 Setup & Execution Instructions

Follow these steps to run the application locally on your machine:

### 1. Database Configuration (MySQL)
1.  Open your MySQL client or terminal.
2.  Import and execute the database structure:
    ```bash
    mysql -u root -p < schema.sql
    ```
3.  Load the initial seed data:
    ```bash
    mysql -u root -p < seed.sql
    ```
    *Note: This creates mock records, including standard employee and manager accounts.*

### 2. Configure Backend Server
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create your `.env` configuration file. Copy the example template:
    ```bash
    cp .env.example .env
    ```
4.  Open `.env` and fill in your MySQL server details:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=leave_tracker
    JWT_SECRET=supersecretkey_leave_tracker_2026
    JWT_EXPIRES_IN=7d
    NODE_ENV=development
    ```
5.  Start the Express API server:
    ```bash
    npm run dev
    ```
    *The server will boot on [http://localhost:5000](http://localhost:5000).*

### 3. Start Frontend Client
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install client dependencies:
    ```bash
    npm install
    ```
3.  Launch the Vite developer server:
    ```bash
    npm run dev
    ```
    *The client app will launch locally, usually at [http://localhost:5173](http://localhost:5173).*

---

## 🔑 Demo Access Credentials

To test the system immediately without creating new accounts, use the following logins loaded by `seed.sql` (Default password is **`password123`**):

| Role | Username (Email) | Password |
| :--- | :--- | :--- |
| **Manager** | `manager@company.com` | `password123` |
| **Employee** | `employee@company.com` | `password123` |
| **Employee** | `employee2@company.com` | `password123` |

---

## 📡 API Endpoints Documentation

All routes expect header: `Authorization: Bearer <JWT_TOKEN>` (unless marked public).

### Authentication
*   `POST /api/auth/register` (Public) - Register new Employee/Manager accounts (Auto-creates leave balances for employees).
*   `POST /api/auth/login` (Public) - Verifies credentials, logs logins to audit trail, and returns JWT.
*   `GET /api/auth/profile` - Fetches authenticated user profile metadata.
*   `PUT /api/auth/profile` - Updates name and department details.
*   `PUT /api/auth/change-password` - Changes password after validating current credential hashes.

### Leave Operations
*   `POST /api/leaves/apply` (Employee only) - Validates dates and checks balances before submitting pending requests.
*   `GET /api/leaves/history` (Employee only) - Fetch user's historical requests (Supports search, filter, and pagination).
*   `GET /api/leaves/balances` (Employee only) - Get remaining and pending allocations.
*   `GET /api/leaves/stats` - Custom Recharts stats aggregates. Returns employee-specific or manager-wide chart payloads.
*   `GET /api/leaves/manager/requests` (Manager only) - Review all requests.
*   `PUT /api/leaves/manager/requests/:id` (Manager only) - Approve or reject leave request, adding reviewer remarks.
*   `GET /api/leaves/manager/employees` (Manager only) - Employee ledger with expandable detailed balance sheets.

### Notifications
*   `GET /api/notifications` - Fetches unread and historical notifications.
*   `PUT /api/notifications/:id/read` - Marks alert as read.
*   `PUT /api/notifications/read-all` - Marks all alerts as read.
