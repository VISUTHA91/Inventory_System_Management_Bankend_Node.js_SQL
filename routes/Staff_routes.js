// routes/userRoutes.js
const express = require('express');
const StaffController = require('../controller/Staff_controller');

const {authMiddleware,adminOnly, adminOrStaff, limiter} = require('../middleware/auth_middleware');

const router = express.Router();



// Route for staff registration

router.post('/register', authMiddleware,adminOnly,StaffController.register);

// Route for staff login
router.post('/login', limiter,StaffController.login);

// Route to request password reset
router.post('/request-password-reset', StaffController.requestPasswordReset);

// Route to reset password
router.post('/reset-password', StaffController.resetPassword);

//getAll staffs

// Route to get all users (for admin)
router.get('/getstaff',authMiddleware,adminOnly, StaffController.getAllStaffUsers);

// Route to get all users (staff and admin)
router.get('/users',authMiddleware,adminOnly, StaffController.getAllUsers);

// Route to delete a user by ID (for admin)
router.delete('/user/:id',authMiddleware,adminOnly, StaffController.deleteUser);

// Route to update a user's profile
router.put('/user/:id', authMiddleware,adminOnly,StaffController.updateUser);


// Route to update a user's profile
router.put('/user/:id', authMiddleware,adminOnly,StaffController.updateUser);

module.exports = router;

