const pool = require("../config/Database");

class ReportModel {
    
        // Get income and cost price from database
    static getIncomeAndCostFromDB(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
        COALESCE(SUM(i.final_price), 0) AS total_income, 
        COALESCE(SUM(p.supplier_price), 0) AS total_cost
    FROM invoice_table i
    LEFT JOIN product_table p ON i.product_id = p.id
    WHERE i.invoice_created_at BETWEEN ? AND ?;
`;

            pool.query(query, [startDate, endDate], (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return reject(err);
                }
                resolve(results[0]); // Return single row
            });
        });
    }

    // Get previous period income (for growth calculation)
    static getPreviousPeriodIncome(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT SUM(final_price) AS previous_income
                FROM invoice_table
                WHERE invoice_created_at BETWEEN ? AND ?;
            `;

            pool.query(query, [startDate, endDate], (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return reject(err);
                }
                resolve(results[0]?.previous_income || 0);
            });
        });
    }
    }
    
    

   


module.exports = ReportModel;
