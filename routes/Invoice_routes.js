const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/Invoice_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

// Create Invoice
router.post('/invoicesin', authMiddleware,adminOrStaff,invoiceController.createInvoice);

// Get All Invoices
router.get('/invoiceall', authMiddleware,adminOrStaff,invoiceController.getAllInvoices);

// Get Invoice by Invoice Number
// router.get('/invoicenum/:invoice_number', invoiceController.getInvoiceDetails);

// Get Invoice by ID
router.get('/invoicebyid/:id', authMiddleware,adminOrStaff,invoiceController.getInvoiceById);

router.get('/invoicebyid/pdfdownload/:id', authMiddleware,adminOnly,invoiceController.downloadInvoicePdf);

// Update Invoice
router.put('/invoiceup/:id', authMiddleware,adminOnly,invoiceController.updateInvoice);

// Delete Invoice
router.delete('/invoicedel/:id', authMiddleware,adminOnly,invoiceController.deleteInvoice);

// Route to get most sold medicines in the last 1w,2w,30 days
router.get('/most_sold_medicines',authMiddleware,adminOrStaff,invoiceController.getMostSoldMedicinesController);

// router.get('/most_sold',invoiceController.getMostSoldMedicinesControllerwith);
router.get('/most_sold_details',authMiddleware,adminOrStaff,invoiceController.getAllSoldProductsController);





// // Route to get income and expense details for a specific time range
// router.post('/income-expense', invoiceController.getIncomeExpense);


module.exports = router;
