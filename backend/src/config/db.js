const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD === undefined ? '' : process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'leave_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true // Return date types as strings rather than JS Date objects (prevents timezone shifts in date fields)
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to the MySQL Database.');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

module.exports = pool;
