const Expensedetails = require('../model/Expense_model');

// Helper function to format dates (if not already defined)
const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// // Create Expense

exports.createExpense = async (req, res) => {
    try {
        const { category, amount, date, description } = req.body;

        if (!category || !amount || !date) {
            return res.status(400).json({ success: false, message: 'Category, amount, and expence_date are required' });
        }

        // Format the date before inserting into DB
        const formattedDate = formatDate(date);

        await Expensedetails.create({ category, amount, date: formattedDate, description });
        res.status(201).json({ success: true, message: 'Expense created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

//expense details
exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expensedetails.getAll();

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return res.status(404).json({ success: false, message: "No expenses found" });
        }

        res.status(200).json({ success: true, data: expenses });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
};


// Get all expenses with pagination
// exports.getAllExpensespage = async (req, res) => {
//     try {
//         // Get page and limit from query params, set defaults
//         let { page, limit } = req.query;
//         page = parseInt(page) || 1;
//         limit = parseInt(limit) || 10;

//         const { expenses, totalPages, totalRecords } = await Expensedetails.getAllpage(page, limit);

//         if (!Array.isArray(expenses) || expenses.length === 0) {
//             return res.status(404).json({ success: false, message: "No expenses found" });
//         }

//         res.status(200).json({
//             success: true,
//             currentPage: page,
//             totalPages,
//             totalRecords,
//             data: expenses,
//         });

//     } catch (err) {
//         console.error("Database Error:", err);
//         res.status(500).json({ success: false, message: "Server error", error: err.message });
//     }
// };
exports.getAllExpensespage = async (req, res) => {
    try {
        // Get page and limit from query params, set defaults
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const { expenses, totalPages, totalRecords } = await Expensedetails.getAllpage(page, limit);

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return res.status(404).json({ success: false, message: "No expenses found" });
        }

        res.status(200).json({
            success: true,
            currentPage: page,
            limit, // Include the limit in response
            totalPages,
            totalRecords,
            data: expenses,
        });

    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
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
        const { category, amount, date, description } = req.body;

        await Expensedetails.update(id, { category, amount, date, description });
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

// // Get Yearly Expense Report
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




//i have to use this below API call for daily monthly yearly it has dynamically work
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
        let reportStartDate = new Date(`${startDate}T00:00:00Z`).toISOString(); // Start of the day
        let reportEndDate = new Date(`${endDate}T23:59:59Z`).toISOString(); // End of the day

        // Log for debugging
        console.log('Report Start Date:', reportStartDate);
        console.log('Report End Date:', reportEndDate);

        // Call the modified calculateExpense function with dynamic date range
        const data = await Expensedetails.calculateExpense(reportStartDate, reportEndDate);

        // Extract the correct totalExpense value
        const totalExpense = data[0]?.totalExpense ?? 0; // Handle null values properly

        return res.status(200).json({
            success: true,
            message: `Daily expense report (${startDate} to ${endDate})`,
            data: { totalExpense }
        });

    } catch (err) {
        console.error('Error in daily expense report:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};


