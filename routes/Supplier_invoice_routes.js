// const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

// const express = require('express');
// const router = express.Router();
// const supplierController = require('../controller/Supplier_invoice_controller');

// // Get all invoices with payment details
// router.get('/getall_sup_invoices', supplierController.getInvoices);

// // Add a new invoice
// router.post('/invoices', supplierController.addInvoice);

// // Add a payment
// router.post('/payments', supplierController.addPayment);

// module.exports = router;


const express = require('express');
const router = express.Router();
const supplierController = require('../controller/Supplier_invoice_controller');

router.post('/invoices', supplierController.createInvoice);
router.post('/payments', supplierController.addPayment);
router.get('/invoices', supplierController.listInvoicesWithPayments);
router.get('/invoices/:invoiceId', supplierController.getInvoice);
router.get("/:supplierId/invoices", supplierController.get_supplier_Invoices );

module.exports = router;
