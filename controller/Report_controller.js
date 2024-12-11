const Invoice = require('../model/Invoice_model');  // Assuming you have an Invoice model


// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

exports.getDailyReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const currentDate = new Date();
        const reportStartDate = startDate || formatDate(new Date(currentDate.setHours(0, 0, 0, 0)));
        const reportEndDate = endDate || formatDate(new Date(currentDate.setHours(23, 59, 59, 999)));

        const data = await Invoice.calculateIncome(reportStartDate, reportEndDate);

        res.status(200).json({
            success: true,
            message: `Daily income  report (${reportStartDate} to ${reportEndDate})`,
            data
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getWeeklyReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + 1; // Monday
        const startDate = formatDate(new Date(currentDate.setDate(firstDayOfWeek)));
        const endDate = formatDate(new Date(currentDate.setDate(firstDayOfWeek + 6)));

        const data = await Invoice.calculateIncome(startDate, endDate);

        res.status(200).json({
            success: true,
            message: `Weekly income and expense report (${startDate} to ${endDate})`,
            data
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
        const endDate = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0));

        const data = await Invoice.calculateIncome(startDate, endDate);

        res.status(200).json({
            success: true,
            message: `Monthly income and expense report (${startDate} to ${endDate})`,
            data
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getYearlyReport = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = formatDate(new Date(currentDate.getFullYear(), 0, 1));
        const endDate = formatDate(new Date(currentDate.getFullYear(), 11, 31));

        const data = await Invoice.calculateIncome(startDate, endDate);

        res.status(200).json({
            success: true,
            message: `Yearly income and expense report (${startDate} to ${endDate})`,
            data
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Controller to handle supplier payments and income request
exports.getSupplierPayments = async (req, res) => {
    const { start_date, end_date } = req.query;

    try {
        const supplierPayments = await Invoice.calculateIncome(start_date, end_date);
        res.status(200).json(supplierPayments);
        console.log(supplierPayments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
