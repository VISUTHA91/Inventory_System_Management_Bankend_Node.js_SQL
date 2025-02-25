// const express = require('express');
// const ReportController = require('../controller/Report_controller');
// const router = express.Router();

// // Individual APIs for daily, weekly, monthly, and yearly reports
// router.get('/daily', ReportController.getDailyReport);
// router.get('/weekly', ReportController.getWeeklyReport);
// router.get('/monthly', ReportController.getMonthlyReport);
// router.get('/yearly', ReportController.getYearlyReport);


// // Route for calculating supplier payments and income
// router.get('/supplier-payments', ReportController.getSupplierPayments);

// module.exports = router;





// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
// const salesController = require('../controller/Report_controller');
const { getIncomeReport } = require("../controller/Report_controller");

// // Daily sales report
// router.get('/sales-report/daily', salesController.getDailySales);

// // Weekly sales report
// router.get('/sales-report/weekly', salesController.getWeeklySales);

// // Monthly sales report
// router.get('/sales-report/monthly', salesController.getMonthlySales);

// // Yearly sales report
// router.get('/sales-report/yearly', salesController.getYearlySales);

// Individual routes for automatic reports
router.get("/income-report/:type", getIncomeReport);

module.exports = router;
