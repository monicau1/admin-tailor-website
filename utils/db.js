// utils/db.js

const mysql = require("mysql2");
require("dotenv").config();

// Create a connection pool (store your DB credentials in .env)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool.promise(); // Promise-based pool for async/await support
