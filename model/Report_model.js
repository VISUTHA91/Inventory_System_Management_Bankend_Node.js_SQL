// models/salesModel.js
const db = require('../config/Database'); // Database connection



// In the salesModel.getdailysales method

// const getDailySalesReport = (startDate, endDate) => {
//     const query = `
//       SELECT DATE(invoice_created_at) AS sales_date, SUM(final_price) AS total_sales
//       FROM invoice_table
//       WHERE invoice_created_at BETWEEN ? AND ?
//       GROUP BY DATE(invoice_created_at)
//       ORDER BY sales_date;
//     `;
//     return executeQuery(query, [startDate, endDate]);
//   };

const getDailySales = (startDate, endDate) => {
    // Adjust the end date to include the last second of the day
    const endOfDay = `${endDate} 23:59:59`; // Adjusting endDate to the last second of the day
    const query = `
      SELECT DATE(invoice_created_at) AS sales_date, SUM(final_price) AS total_sales
      FROM invoice_table
      WHERE invoice_created_at BETWEEN ? AND ?
      GROUP BY DATE(invoice_created_at)
      ORDER BY sales_date;
    `;
    return executeQuery(query, [startDate, endOfDay]); // Use the adjusted endOfDay
  };
  
  
 



const getWeeklySales = (startDate, endDate) => {
    const query = `
      SELECT YEARWEEK(invoice_created_at, 1) AS sales_week, 
             SUM(final_price) AS total_sales 
      FROM invoice_table 
      WHERE invoice_created_at BETWEEN ? AND ? 
      GROUP BY YEARWEEK(invoice_created_at, 1)
      ORDER BY sales_week;
    `;
    return executeQuery(query, [startDate, endDate]);  // Executes the query with the provided dates
  };
  



const getMonthlySales = (startDate, endDate) => {
    const query = `
      SELECT DATE_FORMAT(invoice_created_at, '%Y-%m') AS sales_month, SUM(final_price) AS total_sales 
      FROM invoice_table 
      WHERE invoice_created_at BETWEEN ? AND ? 
      GROUP BY DATE_FORMAT(invoice_created_at, '%Y-%m')
      ORDER BY sales_month;
    `;
    return executeQuery(query, [startDate, endDate]);
  };
  

  const getYearlySales = (startDate, endDate) => {
    const query = `
      SELECT YEAR(invoice_created_at) AS sales_year, SUM(final_price) AS total_sales 
      FROM invoice_table 
      WHERE invoice_created_at BETWEEN ? AND ? 
      GROUP BY YEAR(invoice_created_at)
      ORDER BY sales_year;
    `;
    return executeQuery(query, [startDate, endDate]);
  };
  
// Helper function to execute queries
const executeQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = {
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getYearlySales,
};
