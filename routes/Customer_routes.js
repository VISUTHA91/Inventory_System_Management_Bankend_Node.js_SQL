const express = require('express');
const router = express.Router();
const customerController = require('../controller/Customer_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

// Create a new customer
router.post('/custinsert',  authMiddleware,adminOrStaff,customerController.createCustomer);



// Get all customers
router.get('/custall',  authMiddleware,adminOrStaff,customerController.getAllCustomers);

// Get customer by ID
router.get('/custbyid/:id',  authMiddleware,adminOrStaff,customerController.getCustomerById);

// Update customer
router.put('/custup/:id',  authMiddleware,adminOrStaff,customerController.updateCustomer);

// Delete customer
router.delete('/custdel/:id', authMiddleware,adminOnly,customerController.deleteCustomer);

module.exports = router;
