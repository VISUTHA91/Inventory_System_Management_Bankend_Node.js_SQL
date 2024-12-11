const Expensedetails = require('../model/Expense_model');

// Helper function to format dates (if not already defined)
const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Create Expense
exports.createExpense = async (req, res) => {
    try {
        const { category, amount, description } = req.body;
        if (!category || !amount) {
            return res.status(400).json({ success: false, message: 'Category and amount are required' });
        }

        await Expensedetails.create({ category, amount, description });
        res.status(201).json({ success: true, message: 'Expense created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// Get All Expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const [expenses] = await Expensedetails.getAll();
        res.status(200).json({ success: true, data: expenses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// Get Expense By ID
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const [expense] = await Expensedetails.getById(id);
        if (!expense.length) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.status(200).json({ success: true, data: expense[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// Update Expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, description } = req.body;

        await Expensedetails.update(id, { category, amount, description });
        res.status(200).json({ success: true, message: 'Expense updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await Expensedetails.delete(id);
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};






//EXpense report details



exports.getDailyExpenseReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Both startDate and endDate are required"
            });
        }

        // Convert to UTC and ensure the format is correct
        let reportStartDate = new Date(`${startDate}T00:00:00Z`); // UTC start
        let reportEndDate = new Date(`${endDate}T23:59:59Z`); // UTC end

        // Log the dates for debugging
        console.log('Report Start Date:', reportStartDate);
        console.log('Report End Date:', reportEndDate);

        // Call the method to calculate expense
        const data = await Expensedetails.calculateExpense(reportStartDate.toISOString(), reportEndDate.toISOString());
console.log(data)
        if (data && data.length > 0 && data[0].totalExpense !== null) {
            res.status(200).json({
                success: true,
                message: `Daily expense report (${startDate} to ${endDate})`,
                data: data[0]
            });
        } else {
            res.status(200).json({
                success: true,
                message: `No expenses found for (${startDate} to ${endDate})`,
                data: { totalExpense: 0 }
            });
        }
    } catch (err) {
        console.error('Error in daily expense report:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};






exports.getMonthlyExpenseReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate the presence of startDate and endDate
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }

        const data = await Expensedetails.calculateExpense(startDate, endDate);

        res.status(200).json({
            success: true,
            message: `Monthly expense report (${startDate} to ${endDate})`,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// Get Yearly Expense Report
exports.getYearlyExpenseReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = formatDate(new Date(currentDate.getFullYear(), 0, 1));  // First day of the current year
        const endDate = formatDate(new Date(currentDate.getFullYear(), 11, 31)); // Last day of the current year

        const data = await Expensedetails.calculateExpense(startDate, endDate);

        res.status(200).json({
            success: true,
            message: `Yearly expense report (${startDate} to ${endDate})`,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
