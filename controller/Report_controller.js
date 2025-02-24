// const Invoice = require('../model/Invoice_model');  // Assuming you have an Invoice model


// // Helper function to format date as YYYY-MM-DD
// const formatDate = (date) => date.toISOString().split('T')[0];

// exports.getDailyReport = async (req, res) => {
//     try {
//         const { startDate, endDate } = req.query;
//         const currentDate = new Date();
//         const reportStartDate = startDate || formatDate(new Date(currentDate.setHours(0, 0, 0, 0)));
//         const reportEndDate = endDate || formatDate(new Date(currentDate.setHours(23, 59, 59, 999)));

//         const data = await Invoice.calculateIncome(reportStartDate, reportEndDate);

//         res.status(200).json({
//             success: true,
//             message: `Daily income  report (${reportStartDate} to ${reportEndDate})`,
//             data
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

// exports.getWeeklyReport = async (req, res) => {
//     try {
//         const currentDate = new Date();
//         const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + 1; // Monday
//         const startDate = formatDate(new Date(currentDate.setDate(firstDayOfWeek)));
//         const endDate = formatDate(new Date(currentDate.setDate(firstDayOfWeek + 6)));

//         const data = await Invoice.calculateIncome(startDate, endDate);

//         res.status(200).json({
//             success: true,
//             message: `Weekly income and expense report (${startDate} to ${endDate})`,
//             data
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

// exports.getMonthlyReport = async (req, res) => {
//     try {
//         const currentDate = new Date();
//         const startDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
//         const endDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));

//         const data = await Invoice.calculateIncome(startDate, endDate);

//         res.status(200).json({
//             success: true,
//             message: `Monthly income and expense report (${startDate} to ${endDate})`,
//             data
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

// exports.getYearlyReport = async (req, res) => {
//     try {
//         const currentDate = new Date();
//         const startDate = formatDate(new Date(currentDate.getFullYear(), 0, 1));
//         const endDate = formatDate(new Date(currentDate.getFullYear(), 11, 31));

//         const data = await Invoice.calculateIncome(startDate, endDate);

//         res.status(200).json({
//             success: true,
//             message: `Yearly income and expense report (${startDate} to ${endDate})`,
//             data
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// };

// // Controller to handle supplier payments and income request
// exports.getSupplierPayments = async (req, res) => {
//     const { start_date, end_date } = req.query;

//     try {
//         const supplierPayments = await Invoice.calculateIncome(start_date, end_date);
//         res.status(200).json(supplierPayments);
//         console.log(supplierPayments);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };





// controllers/salesController.js


//my correct code 1st

// const getDailySales = async (req, res) => {
//     const { startDate, endDate } = req.query;
  
//     // Ensure both startDate and endDate are provided
//     if (!startDate || !endDate) {
//       return res.status(400).json({ message: 'Please provide startDate and endDate.' });
//     }
  
//     try {
//       // Get the daily sales report from the model
//       const report = await salesModel.getDailySalesReport(startDate, endDate);
  
//       // Check if the report is empty
//       if (report.length === 0) {
//         return res.status(404).json({ message: 'No sales data found for the given date range.' });
//       }
  
//       // Return the report in the response
//       res.status(200).json({ report });
//     } catch (error) {
//       // Handle any errors during the process
//       res.status(500).json({ message: 'Error fetching daily sales report.', error: error.message });
//     }
//   };

  
const salesModel = require('../model/Report_model.js');


const getDailySales = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate.' });
  }

  try {
      // Call the model with the correct function name
      const report = await salesModel.getDailySales(startDate, endDate);
      
      if (report.length === 0) {
          return res.status(404).json({ message: 'No sales data found for the given date range.' });
      }

      res.status(200).json({ report });
  } catch (error) {
      console.error('Error fetching daily sales report:', error);
      res.status(500).json({ message: 'Error fetching daily sales report.', error: error.message });
  }
};

  


const getWeeklySales = async (req, res) => {
  // Destructure startDate and endDate from query parameters
  const { startDate, endDate } = req.query;

  // Validate if both startDate and endDate are provided
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Please provide both startDate and endDate.' });
  }

  try {
    // Call the model function to fetch the weekly sales report
    const report = await salesModel.getWeeklySales(startDate, endDate);

    // Check if report is empty
    if (report.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the given date range.' });
    }

    // Return the report with a 200 status
    res.status(200).json({ report });
  } catch (error) {
    // Handle any errors that occur during query execution
    res.status(500).json({ message: 'Error fetching weekly sales report.', error: error.message });
  }
};




const getMonthlySales = async (req, res) => { 
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate.' });
    }
    try {
      // Get the report from the model
      const report = await salesModel.getMonthlySales(startDate, endDate);
      
      // If no data is found, return a message
      if (report.length === 0) {
        return res.status(404).json({ message: 'No sales data found for the given date range.' });
      }
  
      // Return the report data as JSON
      res.status(200).json({ report });
    } catch (error) {
      // Handle errors properly
      res.status(500).json({ message: 'Error fetching monthly sales report.', error: error.message });
    }
  };
  

  const getYearlySales = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // Ensure both startDate and endDate are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide startDate and endDate.' });
    }
  
    try {
      // Get the yearly sales report from the model
      const report = await salesModel.getYearlySales(startDate, endDate);
  
      // Check if the report is empty
      if (report.length === 0) {
        return res.status(404).json({ message: 'No sales data found for the given date range.' });
      }
  
      // Return the report in the response
      res.status(200).json({ report });
    } catch (error) {
      // Handle any errors during the process
      res.status(500).json({ message: 'Error fetching yearly sales report.', error: error.message });
    }
  };
  

module.exports = {
getDailySales,
  getWeeklySales,
  getMonthlySales,
  getYearlySales,
};
