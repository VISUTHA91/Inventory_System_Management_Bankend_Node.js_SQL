const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

const express = require('express');
const router = express.Router();
const supplierController = require('../controller/supplier_invoice_controller');

// Get all invoices with payment details
router.get('/invoices', supplierController.getInvoices);

// Add a new invoice
router.post('/invoices', supplierController.addInvoice);

// Add a payment
router.post('/payments', supplierController.addPayment);

module.exports = router;


