const express = require('express');
const router = express.Router();
const customerController = require('../controller/Customer_controller');

// Create a new customer
router.post('/custinsert', customerController.createCustomer);



// Get all customers
router.get('/custall', customerController.getAllCustomers);

// Get customer by ID
router.get('/custbyid/:id', customerController.getCustomerById);

// Update customer
router.put('/custup/:id', customerController.updateCustomer);

// Delete customer
router.delete('/custdel/:id', customerController.deleteCustomer);

module.exports = router;
