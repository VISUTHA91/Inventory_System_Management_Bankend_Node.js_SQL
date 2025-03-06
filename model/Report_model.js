
//only work on income details only 

const db = require("../config/Database");

class ReportModel {
    static getIncomeReport(interval) {
        return new Promise((resolve, reject) => {
            let dateCondition = "";
            let startDate = new Date();
            let endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // Set end of day
    
            // Handling different intervals (DAILY, MONTHLY, etc.)
            switch (interval.toUpperCase()) {
                case "DAILY":
                    startDate.setHours(0, 0, 0, 0); // Start of today
                    break;
                case "MONTHLY":
                    startDate.setDate(startDate.getDate() - 30); // Last 30 days
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case "6MONTH":
                    startDate.setMonth(startDate.getMonth() - 6); // Last 6 months
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case "YEARLY":
                    startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year
                    startDate.setHours(0, 0, 0, 0);
                    break;
                default:
                    return reject(new Error("Invalid interval format. Use 'DAILY', 'MONTHLY', '6MONTH', or 'YEARLY'."));
            }
    
            const formatDateTime = (date) => {
                return date.toISOString().split('T')[0] + " " + date.toTimeString().split(' ')[0]; // Date format: YYYY-MM-DD HH:MM:SS
            };
    
            const startDateLocal = formatDateTime(startDate);
            const endDateLocal = formatDateTime(endDate);
    
            console.log(`Fetching Report from: ${startDateLocal} to ${endDateLocal}`);
    
            dateCondition = `i.invoice_created_at BETWEEN '${startDateLocal}' AND '${endDateLocal}'`;
    
            // SQL Query to get product_id, quantity, final_price, and supplier_price for each product
            const sqlQuery = `
                SELECT 
                    i.product_id,
                    i.quantity,
                    i.final_price,
                    p.supplier_price
                FROM invoice_table i
                LEFT JOIN product_table p ON JSON_UNQUOTE(JSON_EXTRACT(i.product_id, '$[0]')) = p.id
                WHERE ${dateCondition};
            `;
    
            db.query(sqlQuery, (err, results) => {
                if (err) {
                    console.error("Error fetching raw income report data:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }
    

 
}

//the helper function not use in the code for above 
// Helper function to get supplier price for a specific product ID
async function getSupplierPriceByProductId(productId) {
    try {
        // Query the product_table to get the supplier price
        const [rows] = await db.query('SELECT supplier_price FROM product_table WHERE id = ?', [productId]);

        if (rows.length > 0) {
            return rows[0].supplier_price; // Return the supplier price
        } else {
            return undefined; // Return undefined if the product is not found
        }
    } catch (error) {
        console.error("Error fetching supplier price:", error);
        return undefined;
    }
}


module.exports = ReportModel;







