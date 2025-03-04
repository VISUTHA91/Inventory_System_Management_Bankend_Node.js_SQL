
const ReportModel = require("../model/Report_model");
const getIncomeReport = async (req, res) => {
    const { type } = req.params;
    let startDate, endDate, prevStartDate, prevEndDate;
    const today = new Date();

    try {
        if (type === "daily") {
            startDate = new Date(today.setHours(0, 0, 0, 0));
            endDate = new Date(today.setHours(23, 59, 59, 999));
            prevStartDate = new Date(today.setDate(today.getDate() - 1));
            prevEndDate = new Date(prevStartDate.setHours(23, 59, 59, 999));
        } else if (type === "weekly") {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(today.setHours(23, 59, 59, 999));

            prevStartDate = new Date();
            prevStartDate.setDate(today.getDate() - 14);
            prevStartDate.setHours(0, 0, 0, 0);
            prevEndDate = new Date();
            prevEndDate.setDate(today.getDate() - 7);
            prevEndDate.setHours(23, 59, 59, 999);
        } else if (type === "monthly") {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            prevStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            prevEndDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        } else if (type === "six-month") {
            startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            prevStartDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
            prevEndDate = new Date(today.getFullYear(), today.getMonth() - 5, 0, 23, 59, 59, 999);
        } else if (type === "yearly") {
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

            prevStartDate = new Date(today.getFullYear() - 1, 0, 1);
            prevEndDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        } else {
            return res.status(400).json({ message: "Invalid report type" });
        }

        // Fetch income and cost from the database
        const incomeData = await ReportModel.getIncomeAndCostFromDB(startDate, endDate) || {};
        console.log("Income Data from DB:", incomeData); // Debugging line

        const total_income = Number(incomeData.total_income) || 0;
        const total_cost = Number(incomeData.total_cost) || 0;
        let totalProfit = total_income - total_cost;

        // Get previous period income for growth calculation
        const previousIncome = Number(await ReportModel.getPreviousPeriodIncome(prevStartDate, prevEndDate)) || 0;

        // Calculate profit percentage
        let profitPercentage = total_cost > 0 ? ((totalProfit / total_cost) * 100).toFixed(2) : "N/A";

        // Calculate growth percentage
        let growthPercentage = previousIncome > 0 ? (((total_income - previousIncome) / previousIncome) * 100).toFixed(2) : "N/A";

        res.status(200).json({
            total_income: total_income.toFixed(2),
            total_cost: total_cost.toFixed(2),
            total_profit: totalProfit.toFixed(2),
            profit_percentage: profitPercentage,
            growth_percentage: growthPercentage,
        });

    } catch (error) {
        console.error("Error fetching income report:", error);
        res.status(500).json({ message: "Error fetching income report", error: error.message });
    }
};






module.exports = { getIncomeReport };
