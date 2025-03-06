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
const { getIncomeReport  } = require("../controller/Report_controller");
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");


// Individual routes for automatic reports
// Route to get income report based on type (daily, weekly, monthly, etc.)
// router.get("/income-report/:type", getIncomeReport);


router.get("/income-report",getIncomeReport );

module.exports = router;
