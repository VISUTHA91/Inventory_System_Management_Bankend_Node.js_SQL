const express = require('express');
const ProductReturnController = require('../controller/cus_return_controller');
const router = express.Router();
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");


// Route for creating a product return
router.post('/return_product', authMiddleware,adminOnly,ProductReturnController.returnProduct);
router.post('/return_products', authMiddleware,adminOnly,ProductReturnController.returnProduct)


// Route for getting product returns by invoice ID
router.get('/returns/:invoice_id', authMiddleware,adminOnly,ProductReturnController.getReturns);

// Get a list of all rejected invoices
router.get('/getAll_rejectedInvoices', authMiddleware,adminOnly,ProductReturnController.getAllReturns);
//correct code

// Delete a specific product return entry
router.delete('/delete/:return_id', authMiddleware,adminOnly,ProductReturnController.deleteReturn);

module.exports = router;







