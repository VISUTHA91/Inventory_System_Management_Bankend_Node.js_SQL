
// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
// const salesController = require('../controller/Report_controller');
const { getIncomeReport  } = require("../controller/Report_controller");
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");


// Individual routes for automatic reports
// Route to get income report based on type (daily, weekly, monthly, etc.)
// router.get("/income-report/:type", getIncomeReport);


router.get("/income-report",authMiddleware,adminOnly,getIncomeReport );

module.exports = router;
