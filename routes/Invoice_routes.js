const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/Invoice_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

// Create Invoice
router.post('/invoicesin', invoiceController.createInvoice);

// Get All Invoices
router.get('/invoiceall', invoiceController.getAllInvoices);

// Get Invoice by Invoice Number
// router.get('/invoicenum/:invoice_number', invoiceController.getInvoiceDetails);

// Get Invoice by ID
router.get('/invoicebyid/:id', invoiceController.getInvoiceById);

router.get('/invoicebyid/pdfdownload/:id', invoiceController.downloadInvoicePdf);

// Update Invoice
router.put('/invoiceup/:id', invoiceController.updateInvoice);

// Delete Invoice
router.delete('/invoicedel/:id', invoiceController.deleteInvoice);



// // Route to get income and expense details for a specific time range
// router.post('/income-expense', invoiceController.getIncomeExpense);


module.exports = router;
