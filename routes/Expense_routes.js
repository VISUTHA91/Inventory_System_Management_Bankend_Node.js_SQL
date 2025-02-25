const express = require('express');
const expenseController = require('../controller/Expense_controller');
const router = express.Router();
const { authMiddleware, adminOnly, limiter, adminOrStaff } = require("../middleware/auth_middleware");

// Create a new expense
router.post('/expensesinsert',authMiddleware, adminOnly,expenseController.createExpense);

// Get all expenses
router.get('/expensesall', authMiddleware,adminOnly,expenseController.getAllExpenses);

router.get('/pagination_expence', authMiddleware,adminOnly,expenseController.getAllExpensespage);

// Get a single expense by ID
router.get('/expenses/:id', authMiddleware,adminOnly,expenseController.getExpenseById);

// Update an expense
router.put('/expensesedit/:id',authMiddleware,adminOnly, expenseController.updateExpense);

// Delete an expense
router.delete('/expensesdel/:id',authMiddleware,adminOnly, expenseController.deleteExpense);

//expense details

router.get('/daily/expense',authMiddleware, adminOnly,expenseController.getDailyExpenseReport);


router.get('/monthly/expense', authMiddleware,adminOnly,expenseController.getMonthlyExpenseReport); 

 // New route for monthly expense
router.get('/yearly/expense', authMiddleware,adminOnly,expenseController.getYearlyExpenseReport); 


module.exports = router;
