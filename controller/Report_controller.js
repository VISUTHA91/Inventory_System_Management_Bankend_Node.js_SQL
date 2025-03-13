


// const ReportModel = require("../model/Report_model");


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

//         for (const invoice of reportData) {
//             let productIds = [];
//             let quantities = [];

//             try {
//                 // ✅ Ensure productIds is always an array
//                 productIds = JSON.parse(invoice.product_id || "[]");
//                 if (!Array.isArray(productIds)) {
//                     productIds = [productIds]; // Convert single value to an array
//                 }

//                 quantities = JSON.parse(invoice.quantity || "[]");
//                 if (!Array.isArray(quantities)) {
//                     quantities = [quantities]; // Convert single value to an array
//                 }
//             } catch (err) {
//                 console.error("Invalid JSON format for product_id or quantity:", err);
//                 continue;
//             }

//             total_income += parseFloat(invoice.total_price || 0);

//             // ✅ Fetch supplier prices safely
//             const supplierPrices = await Promise.all(
//                 productIds.map(async (productId) => {
//                     return await ReportModel.getSupplierPriceByProductId(productId);
//                 })
//             );

//             console.log("Product IDs:", productIds);
//             console.log("Supplier Prices:", supplierPrices);

//             let invoice_cost = 0;
//             for (let i = 0; i < productIds.length; i++) {
//                 const supplier_price = supplierPrices[i] || 0;
//                 const quantity = quantities[i] || 0;
//                 invoice_cost += supplier_price * quantity;
//             }

//             total_cost += invoice_cost;
//         }

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
//         });
//     }
// };

// module.exports = { getIncomeReport };





const ReportModel = require("../model/Report_model");

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

        for (const invoice of reportData) {
            let productIds = [];
            let quantities = [];

            try {
                // ✅ Ensure productIds is always an array
                productIds = JSON.parse(invoice.product_id || "[]");
                if (!Array.isArray(productIds)) {
                    productIds = [productIds]; // Convert single value to an array
                }

                quantities = JSON.parse(invoice.quantity || "[]");
                if (!Array.isArray(quantities)) {
                    quantities = [quantities]; // Convert single value to an array
                }
            } catch (err) {
                console.error("Invalid JSON format for product_id or quantity:", err);
                continue;
            }

            total_income += parseFloat(invoice.total_price || 0);

            // ✅ Fetch supplier prices safely
            const supplierPrices = await Promise.all(
                productIds.map(async (productId) => {
                    return await ReportModel.getSupplierPriceByProductId(productId);
                })
            );

            console.log("Product IDs:", productIds);
            console.log("Supplier Prices:", supplierPrices);

            let invoice_cost = 0;
            for (let i = 0; i < productIds.length; i++) {
                const supplier_price = supplierPrices[i] || 0;
                const quantity = quantities[i] || 0;
                invoice_cost += supplier_price * quantity;
            }

            total_cost += invoice_cost;
        }

        // ✅ Fetch total expense amount from the expense_table
        const total_expense = await ReportModel.getExpenseAmount(interval);

        const total_profit = total_income - total_cost - total_expense;

        res.status(200).json({
            success: true,
            data: {
                total_income: total_income.toFixed(2),
                total_cost: total_cost.toFixed(2),
                expense: total_expense.toFixed(2),
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



