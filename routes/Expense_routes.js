const express = require('express');
const expenseController = require('../controller/Expense_controller');
const router = express.Router();
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");

// Create a new expense
router.post('/expensesinsert', adminOnly,expenseController.createExpense);

// Get all expenses
router.get('/expensesall', adminOnly,expenseController.getAllExpenses);

router.get('/pagination_expence', adminOnly,expenseController.getAllExpensespage);

// Get a single expense by ID
router.get('/expenses/:id', adminOnly,expenseController.getExpenseById);

// Update an expense
router.put('/expensesedit/:id',adminOnly, expenseController.updateExpense);

// Delete an expense
router.delete('/expensesdel/:id',adminOnly, expenseController.deleteExpense);

//expense details

router.get('/daily/expense', adminOnly,expenseController.getDailyExpenseReport);


router.get('/monthly/expense', adminOnly,expenseController.getMonthlyExpenseReport); 

 // New route for monthly expense
router.get('/yearly/expense', adminOnly,expenseController.getYearlyExpenseReport); 


module.exports = router;
