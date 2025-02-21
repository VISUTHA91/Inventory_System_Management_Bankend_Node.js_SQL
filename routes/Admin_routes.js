// routes/adminRoutes.js
const express = require('express');
const AdminController = require('../controller/Admin_controller');
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");


const router = express.Router();

// router.post('/register', AdminController.register); // Admin registration route
router.post("/login", AdminController.login); // Admin login route      
router.post("/login", AdminController.login); // Admin login route    

// Admin-specific routes
router.get('/getallusers',authMiddleware,adminOnly,AdminController.getAllUsers);
router.delete('/users/:id',authMiddleware,adminOnly,AdminController.deleteUser);
router.put('/users/:id',authMiddleware,adminOnly,AdminController.updateUser);

module.exports = router;

