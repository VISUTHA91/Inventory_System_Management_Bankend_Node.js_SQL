const express = require('express');
const CategoryController = require('../controller/Product_Category_controller');
const router = express.Router();
const { authMiddleware, adminOnly,adminOrStaff }  = require("../middleware/auth_middleware");


// Route to get all categories
router.get('/all_category', authMiddleware, adminOnly,CategoryController.getAllCategories);

// Route to get a single category by ID
router.get('/id_category/:id',authMiddleware, adminOnly, CategoryController.getCategoryById);

// Route to create a new category
router.post('/insert_category', authMiddleware, adminOnly,CategoryController.createCategory);

// Route to update an existing category by ID
router.put('/update_category/:id',authMiddleware, adminOnly, CategoryController.updateCategory);

// Route to delete a category by ID
router.delete('/del_category/:id', authMiddleware, adminOnly,CategoryController.deleteCategory);

module.exports = router;
