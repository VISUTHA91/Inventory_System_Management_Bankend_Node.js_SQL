const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// // Create a MySQL connection
// const connection = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "inventory_system",  
//   waitForConnections: true,
//   connectionLimit: 100, // Increased connection limit (adjust this as needed)
//   queueLimit: 0,
//   connectTimeout: 60000 // 60 seconds
// });


// Create a MySQL connection pool using environment variables
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10, // Default 10 if not set
  queueLimit: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 60000, // Default 60 sec if not set
});


// Connect to the database
connection.getConnection((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL and Medical shop');
  
});

// Export the MySQL connection
module.exports = connection;

