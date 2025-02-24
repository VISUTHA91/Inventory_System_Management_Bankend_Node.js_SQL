const express = require('express');
const ProductReturnController = require('../controller/cus_return_controller');
const router = express.Router();


// Route for creating a product return
router.post('/return_product', ProductReturnController.returnProduct);

// Route for getting product returns by invoice ID
router.get('/returns/:invoice_id', ProductReturnController.getReturns);

// Get a list of all rejected invoices
router.get('/rejected_invoices', ProductReturnController.getRejectedInvoices);

// Delete a specific product return entry
router.delete('/delete/:return_id', ProductReturnController.deleteReturn);

module.exports = router;







