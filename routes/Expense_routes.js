const express = require('express');
const expenseController = require('../controller/Expense_controller');
const router = express.Router();

// Create a new expense
router.post('/expensesinsert', expenseController.createExpense);

// Get all expenses
router.get('/expensesall', expenseController.getAllExpenses);

// Get a single expense by ID
router.get('/expenses/:id', expenseController.getExpenseById);

// Update an expense
router.put('/expensesedit/:id', expenseController.updateExpense);

// Delete an expense
router.delete('/expensesdel/:id', expenseController.deleteExpense);

//expense details

router.get('/daily/expense', expenseController.getDailyExpenseReport);


router.get('/monthly/expense', expenseController.getMonthlyExpenseReport); 

 // New route for monthly expense
router.get('/yearly/expense', expenseController.getYearlyExpenseReport); 


module.exports = router;
