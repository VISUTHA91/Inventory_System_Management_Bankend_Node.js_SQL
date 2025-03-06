
// const ReportModel = require("../model/Report_model");

// const moment = require("moment-timezone");

// const getIncomeReport = async (req, res) => {
//     const { type } = req.params;
//     let startDate, endDate, prevStartDate, prevEndDate;
//     const today = moment().tz("Asia/Kolkata"); // Set time to IST

//     try {
//         if (type === "daily") {
//             startDate = today.clone().startOf("day");
//             endDate = today.clone().endOf("day");
            
//             prevStartDate = today.clone().subtract(1, "day").startOf("day");
//             prevEndDate = today.clone().subtract(1, "day").endOf("day");
//         } 
//         else if (type === "monthly") {
//             startDate = today.clone().startOf("month");
//             endDate = today.clone().endOf("month");

//             prevStartDate = today.clone().subtract(1, "month").startOf("month");
//             prevEndDate = today.clone().subtract(1, "month").endOf("month");
//         } 
//         else if (type === "yearly") {
//             startDate = today.clone().startOf("year");
//             endDate = today.clone().endOf("year");

//             prevStartDate = today.clone().subtract(1, "year").startOf("year");
//             prevEndDate = today.clone().subtract(1, "year").endOf("year");
//         } 
//         else if (type === "six-month") {
//             startDate = today.clone().subtract(5, "months").startOf("month");
//             endDate = today.clone().endOf("month");

//             prevStartDate = today.clone().subtract(11, "months").startOf("month");
//             prevEndDate = today.clone().subtract(6, "months").endOf("month");
//         } 
//         else {
//             return res.status(400).json({ message: "Invalid report type" });
//         }

//         // Convert to UTC for database queries
//         const startUTC = startDate.toDate();
//         const endUTC = endDate.toDate();
//         const prevStartUTC = prevStartDate.toDate();
//         const prevEndUTC = prevEndDate.toDate();

//         console.log("Start Date (IST):", startDate.format());
//         console.log("End Date (IST):", endDate.format());
//         console.log("Previous Start Date (IST):", prevStartDate.format());
//         console.log("Previous End Date (IST):", prevEndDate.format());

//         // Fetch data
//         const incomeData = await ReportModel.getIncomeAndCostFromDB(startUTC, endUTC) || {};
//         console.log("Data from DB:", incomeData);
//         console.log("Type of total_income:", typeof incomeData.total_income);


//         const total_income = Number(incomeData.total_income) || 0;
//         const total_cost = Number(incomeData.total_cost) || 0;
//         let totalProfit = total_income - total_cost;

//         const previousIncome = Number(await ReportModel.getPreviousPeriodIncome(prevStartUTC, prevEndUTC)) || 0;

//         let profitPercentage = total_cost > 0 ? ((totalProfit / total_cost) * 100).toFixed(2) : "0.00";
//         let growthPercentage = previousIncome > 0 ? (((total_income - previousIncome) / previousIncome) * 100).toFixed(2) : "0.00";

//         res.status(200).json({
//             total_income: Number(total_income.toFixed(2)),
//             total_cost: Number(total_cost.toFixed(2)),
//             total_profit: Number(totalProfit.toFixed(2)),
//             profit_percentage: Number(profitPercentage),
//             growth_percentage: Number(growthPercentage),
//         });

//     } catch (error) {
//         console.error("Error fetching income report:", error);
//         res.status(500).json({ message: "Error fetching income report", error: error.message });
//     }
// };




//already work correck
const ReportModel = require("../model/Report_model");

// const getIncomeReport = async (req, res) => {
//     try {
//         console.log("Report Generated At:", new Date().toLocaleString());
        
//         const { interval } = req.query;
//         if (!interval) {
//             return res.status(400).json({ success: false, message: "Interval is required" });
//         }

//         const reportData = await ReportModel.getIncomeReport(interval);

//         let total_income = 0;
//         let total_cost = 0;

//         reportData.forEach((invoice) => {
//             const productIds = JSON.parse(invoice.product_id || "[]"); // Ensure it's an array
//             const quantities = JSON.parse(invoice.quantity || "[]"); // Ensure it's an array

//             console.log("Product IDs:", productIds);
//             console.log("Quantities:", quantities);

//             total_income += parseFloat(invoice.final_price || 0);

//             // Initialize total cost for this invoice
//             let invoice_cost = 0;

//             // Loop through product IDs and fetch the supplier price for each from product_table
//             productIds.forEach((productId, index) => {
//                 const quantity = quantities[index] || 0;
                

//                 // Fetch the supplier price for the current product from the product_table
//                 // Assuming you already have the supplier_price in the result set
//                 const supplier_price = invoice.supplier_price|| 0; // Get supplier price (from product_table)

//                 console.log(`Product ID: ${productId}, Supplier Price: ${supplier_price}`);

//                 if (supplier_price === undefined) {
//                     console.error(`Supplier price not found for product ID: ${productId}`);
//                 }

//                 // Add the cost for this product to the invoice cost
//                 invoice_cost += supplier_price * quantity;
//             });

//             total_cost += invoice_cost; // Add the invoice cost to the total cost
//         });

//         const total_profit = total_income - total_cost;

//         res.status(200).json({
//             success: true,
//             data: {
//                 total_income: total_income.toFixed(2),
//                 total_cost: total_cost.toFixed(2),
//                 total_profit: total_profit.toFixed(2),
//             },
//         });
//     } catch (error) {
//         console.error("Error retrieving report:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error retrieving report",
//             error: error.message,
//         });
//     }

// };


const getIncomeReport = async (req, res) => {
    try {
        console.log("Report Generated At:", new Date().toLocaleString());

        const { interval } = req.query;
        if (!interval) {
            return res.status(400).json({ success: false, message: "Interval is required" });
        }

        const reportData = await ReportModel.getIncomeReport(interval);

        let total_income = 0;
        let total_cost = 0;

        // Loop through the invoices
        for (const invoice of reportData) {
            const productIds = JSON.parse(invoice.product_id || "[]"); // Ensure it's an array
            const quantities = JSON.parse(invoice.quantity || "[]"); // Ensure it's an array

            console.log("Product IDs:", productIds);
            console.log("Quantities:", quantities);

            total_income += parseFloat(invoice.final_price || 0);

            // Initialize total cost for this invoice
            let invoice_cost = 0;

            // Loop through product IDs and fetch the supplier price for each from product_table
            for (let i = 0; i < productIds.length; i++) {
                const productId = productIds[i];
                const quantity = quantities[i] || 0;

                // Fetch the supplier price for the current product from the product_table
                const supplier_price = await ReportModel.SupplierPriceByProductId(productId);

                if (supplier_price === undefined) {
                    console.error(`Supplier price not found for product ID: ${productId}`);
                    continue;  // Skip this product if the supplier price is not found
                }

                console.log(`Product ID: ${productId}, Supplier Price: ${supplier_price}`);

                // Add the cost for this product to the invoice cost
                invoice_cost += supplier_price * quantity;
            }

            // After processing all products, add the invoice cost to the total cost
            total_cost += invoice_cost;
        }

        const total_profit = total_income - total_cost;

        res.status(200).json({
            success: true,
            data: {
                total_income: total_income.toFixed(2),
                total_cost: total_cost.toFixed(2),
                total_profit: total_profit.toFixed(2),
            },
        });
    } catch (error) {
        console.error("Error retrieving report:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving report",
            error: error.message,
        });
    }
};








module.exports = { getIncomeReport };






