const express = require('express');
const router = express.Router();
const invoiceController = require('../controller/Invoice_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

// Create Invoice
router.post('/invoicesin', authMiddleware,adminOrStaff,invoiceController.createInvoice);

// Get All Invoices
router.get('/invoiceall_pagination', authMiddleware,adminOrStaff,invoiceController.getAllInvoicespage);
// Get All Invoices
router.get('/invoiceall', authMiddleware,adminOrStaff,invoiceController.getAllInvoices);

// Get Invoice by Invoice Number
// router.get('/invoicenum/:invoice_number', invoiceController.getInvoiceDetails);

// Get Invoice by ID
router.get('/invoicebyid/:id', authMiddleware,adminOrStaff,invoiceController.getInvoiceById);
// size=A4 / Size=A5 - correctly worked - pdf
router.get('/invoicebyid/pdfdownload/:id', authMiddleware,adminOnly,invoiceController.downloadInvoicePdf); 

//html&css working
router.get('/invoice/:id/pdf', invoiceController.generateInvoicePDF);
router.get('/invoice/:invoice_number',invoiceController.getInvoiceDetails);


// New route to get total invoice amount
router.get('/invoice_total_amount', invoiceController.getTotalInvoiceAmount);

// Route to fetch total unique customer count
router.get('/customers/count', invoiceController.getTotalCustomers);


// Update Invoice
router.put('/invoiceup/:id', authMiddleware,adminOnly,invoiceController.updateInvoice);

// Delete Invoice
router.delete('/invoicedel/:id', authMiddleware,adminOnly,invoiceController.deleteInvoice);

// Route to get most sold medicines in the last 1w,2w,30 days
router.get('/most_sold_medicines',authMiddleware,adminOnly,invoiceController.getMostSoldMedicinesController);


// router.get('/most_sold',invoiceController.getMostSoldMedicinesControllerwith);(search)
router.get('/most_sold_details',authMiddleware,adminOnly,invoiceController.getAllSoldProductsController);


router.get('/pagination_sales',authMiddleware,adminOnly,invoiceController.getAllSoldProductsControllerpage);



//changes

router.get('/sales-report/csv', invoiceController.generateCSVReport);
router.get('/sales-report/pdf',invoiceController.generatePDFReport);


// // Route to get income and expense details for a specific time range
// router.post('/income-expense', invoiceController.getIncomeExpense);


module.exports = router;
