const express = require('express');
const ReportController = require('../controller/Report_controller');
const router = express.Router();

// Individual APIs for daily, weekly, monthly, and yearly reports
router.get('/daily', ReportController.getDailyReport);
router.get('/weekly', ReportController.getWeeklyReport);
router.get('/monthly', ReportController.getMonthlyReport);
router.get('/yearly', ReportController.getYearlyReport);


// Route for calculating supplier payments and income
router.get('/supplier-payments', ReportController.getSupplierPayments);

module.exports = router;

