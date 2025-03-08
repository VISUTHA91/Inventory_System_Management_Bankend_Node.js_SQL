
// //only work on income details only 

const db = require("../config/Database");

class ReportModel {
    static getIncomeReport(interval) {
        return new Promise((resolve, reject) => {
            let dateCondition = "";
            let startDate = new Date();
            let endDate = new Date();
            endDate.setHours(23, 59, 59, 999); // End of day
    
            switch (interval.toUpperCase()) {
                case "DAILY":
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case "MONTHLY":
                    startDate.setDate(startDate.getDate() - 30);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case "6MONTH":
                    startDate.setMonth(startDate.getMonth() - 6);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case "YEARLY":
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                default:
                    return reject(new Error("Invalid interval format. Use 'DAILY', 'MONTHLY', '6MONTH', or 'YEARLY'."));
            }
    
            const formatDateTime = (date) => {
                return date.toISOString().split('T')[0] + " " + date.toTimeString().split(' ')[0];
            };
    
            const startDateLocal = formatDateTime(startDate);
            const endDateLocal = formatDateTime(endDate);
    
            console.log(`Fetching Report from: ${startDateLocal} to ${endDateLocal}`);
    
            dateCondition = `i.invoice_created_at BETWEEN '${startDateLocal}' AND '${endDateLocal}'`;

            const sqlQuery = `
                SELECT 
                    i.id AS invoice_id,
                    i.product_id,
                    i.quantity,
                    i.final_price,
                    p.supplier_price
                FROM invoice_table i
                LEFT JOIN product_table p ON JSON_UNQUOTE(JSON_EXTRACT(i.product_id, '$[0]')) = p.id
                WHERE ${dateCondition};
            `;

            // ✅ Use .promise() on db before query
            db.promise().query(sqlQuery)
                .then(([results]) => resolve(results))
                .catch((err) => {
                    console.error("Error fetching income report data:", err);
                    reject(err);
                });
        });
    }

    // ✅ Fix for getSupplierPriceByProductId
    static async getSupplierPriceByProductId(productId) {
        try {
            const sql = 'SELECT supplier_price FROM product_table WHERE id = ?';

            // ✅ Use .promise().query()
            const [rows] = await db.promise().query(sql, [productId]);

            return rows.length > 0 ? rows[0].supplier_price : undefined;
        } catch (error) {
            console.error("Error fetching supplier price:", error);
            return undefined;
        }
    }
}




module.exports = ReportModel;


