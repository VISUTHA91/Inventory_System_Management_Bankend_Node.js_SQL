const express = require('express');
const router = express.Router();
const shopController = require('../controller/pharmacy_details_controllerr');
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");

// Create a shop
router.post('/insert', shopController.createShop);

// Get a shop by ID
router.get('/getbyid/:shopId', shopController.getShopById);

// Get all shops
router.get('/getAll', shopController.getAllShops);

// Update a shop
router.put('/update/:shopId', shopController.updateShop);

// Delete a shop
router.delete('/del/:shopId', shopController.deleteShop);

module.exports = router;
