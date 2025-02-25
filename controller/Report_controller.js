  
// const salesModel = require('../model/Report_model.js');



// // Function to calculate income and profit percentage
// const getIncomeWithProfit = async (intervalDays) => {
//     const currentReport = await salesModel.getIncomeReport(intervalDays);
//     const previousReport = await salesModel.getPreviousIncome(intervalDays);

//     const currentIncome = currentReport.reduce((sum, row) => sum + row.total_income, 0);
//     const previousIncome = previousReport[0]?.total_income || 0;

//     // Calculate profit percentage
//     let profitPercentage = 0;
//     if (previousIncome > 0) {
//         profitPercentage = ((currentIncome - previousIncome) / previousIncome) * 100;
//     }

//     return { total_income: currentIncome, profit_percentage: profitPercentage.toFixed(2), details: currentReport };
// };

// // Function to handle API requests
// const getIncomeReport = async (req, res) => {
//     const { type } = req.params;

//     let intervalDays;
//     if (type === 'daily') intervalDays = 1;
//     else if (type === 'weekly') intervalDays = 7;
//     else if (type === 'monthly') intervalDays = 30;
//     else if (type === 'six-month') intervalDays = 180;
//     else if (type === 'yearly') intervalDays = 365;
//     else return res.status(400).json({ message: "Invalid report type" });

//     try {
//         const report = await getIncomeWithProfit(intervalDays);
//         res.status(200).json(report);
//     } catch (error) {
//         console.error('Error fetching income report:', error);
//         res.status(500).json({ message: 'Error fetching income report.', error: error.message });
//     }
// };



// const getDailySales = async (req, res) => {
//   const { startDate, endDate } = req.query;
  
//   if (!startDate || !endDate) {
//       return res.status(400).json({ message: 'Please provide startDate and endDate.' });
//   }

//   try {
//       // Call the model with the correct function name
//       const report = await salesModel.getDailySales(startDate, endDate);
      
//       if (report.length === 0) {
//           return res.status(404).json({ message: 'No sales data found for the given date range.' });
//       }

//       res.status(200).json({ report });
//   } catch (error) {
//       console.error('Error fetching daily sales report:', error);
//       res.status(500).json({ message: 'Error fetching daily sales report.', error: error.message });
//   }
// };

  


// const getWeeklySales = async (req, res) => {
//   // Destructure startDate and endDate from query parameters
//   const { startDate, endDate } = req.query;

//   // Validate if both startDate and endDate are provided
//   if (!startDate || !endDate) {
//     return res.status(400).json({ message: 'Please provide both startDate and endDate.' });
//   }

//   try {
//     // Call the model function to fetch the weekly sales report
//     const report = await salesModel.getWeeklySales(startDate, endDate);

//     // Check if report is empty
//     if (report.length === 0) {
//       return res.status(404).json({ message: 'No sales data found for the given date range.' });
//     }

//     // Return the report with a 200 status
//     res.status(200).json({ report });
//   } catch (error) {
//     // Handle any errors that occur during query execution
//     res.status(500).json({ message: 'Error fetching weekly sales report.', error: error.message });
//   }
// };




// const getMonthlySales = async (req, res) => { 
//     const { startDate, endDate } = req.query;
//     if (!startDate || !endDate) {
//       return res.status(400).json({ message: 'Please provide startDate and endDate.' });
//     }
//     try {
//       // Get the report from the model
//       const report = await salesModel.getMonthlySales(startDate, endDate);
      
//       // If no data is found, return a message
//       if (report.length === 0) {
//         return res.status(404).json({ message: 'No sales data found for the given date range.' });
//       }
  
//       // Return the report data as JSON
//       res.status(200).json({ report });
//     } catch (error) {
//       // Handle errors properly
//       res.status(500).json({ message: 'Error fetching monthly sales report.', error: error.message });
//     }
//   };
  

//   const getYearlySales = async (req, res) => {
//     const { startDate, endDate } = req.query;
    
//     // Ensure both startDate and endDate are provided
//     if (!startDate || !endDate) {
//       return res.status(400).json({ message: 'Please provide startDate and endDate.' });
//     }
  
//     try {
//       // Get the yearly sales report from the model
//       const report = await salesModel.getYearlySales(startDate, endDate);
  
//       // Check if the report is empty
//       if (report.length === 0) {
//         return res.status(404).json({ message: 'No sales data found for the given date range.' });
//       }
  
//       // Return the report in the response
//       res.status(200).json({ report });
//     } catch (error) {
//       // Handle any errors during the process
//       res.status(500).json({ message: 'Error fetching yearly sales report.', error: error.message });
//     }
//   };
  

// module.exports = {
// getDailySales,
//   getWeeklySales,
//   getMonthlySales,
//   getYearlySales,
//   getIncomeWithProfit,
//   getIncomeReport
// };


const ReportModel = require("../model/Report_model");

const getIncomeReport = async (req, res) => {
    const { type } = req.params;
    let startDate, endDate;
    const today = new Date();

    try {
        if (type === "daily") {
            startDate = new Date(today.setHours(0, 0, 0, 0));
            endDate = new Date(today.setHours(23, 59, 59, 999));
        } else if (type === "weekly") {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.setHours(23, 59, 59, 999));
        } else if (type === "monthly") {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (type === "six-month") {
            startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (type === "yearly") {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else {
            return res.status(400).json({ message: "Invalid report type" });
        }

        const results = await ReportModel.getIncomeReportFromDB(startDate, endDate);

        let totalIncome = 0;
        let reportDetails = results.map(row => {
            let income = parseFloat(row.total_income) || 0;
            totalIncome += income;
            return {
                sales_date: row.sales_date,
                total_income: income.toFixed(2)
            };
        });

        let profitPercentage = (totalIncome / 10000) * 100; // Example profit calculation

        res.status(200).json({
            total_income: totalIncome.toFixed(2),
            profit_percentage: profitPercentage.toFixed(2),
            details: reportDetails
        });

    } catch (error) {
        console.error("Error fetching income report:", error);
        res.status(500).json({ message: "Error fetching income report", error: error.message });
    }
};


module.exports = { getIncomeReport };
