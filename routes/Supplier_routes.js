// routes/supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controller/Supplier_controller');
const { authMiddleware, adminOnly,adminOrStaff }  = require("../middleware/auth_middleware");

// Route for creating a supplier
router.post('/sup_insert', authMiddleware,adminOnly, supplierController.createSupplier);

// Route to get all supplier names
router.get('/supplier-names', authMiddleware,adminOnly,supplierController.getAllSupplierNames);

// Route for getting all suppliers
router.get('/sup_all', authMiddleware,adminOrStaff,supplierController.getAllSuppliers);

// Route for getting all suppliers
router.get('/sup_all_pagination', authMiddleware,adminOrStaff,supplierController.getAllSupplierspagination);


// Route for getting a supplier by ID
router.get('/sup_id/:id', authMiddleware,adminOnly,supplierController.getSupplierById);

// Route for updating a supplier
router.put('/sup_update/:id',authMiddleware,adminOnly,supplierController.updateSupplier);

// Route for updating a supplier
router.put('/sup_update/:id',authMiddleware,adminOnly,supplierController.updateSupplier);

// Route for deleting a supplier
router.delete('/sup_del/:id',authMiddleware,adminOnly, supplierController.deleteSupplier);



module.exports = router;
