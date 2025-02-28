const db = require("../config/Database.js");

class Expense {
  
//date mean expence_date
static async create(data) {
    const query = "INSERT INTO expense_table (category, amount, date, description) VALUES (?, ?, ?, ?)";
    try {
        const [result] = await db.promise().execute(query, [data.category, data.amount, data.date, data.description]);
        console.log("DB Insert Result:", result); // Debugging log
        return result;
    } catch (error) {
        console.error("Database Insert Error:", error);
        throw error;
    }
}



   
    static getAll() {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM expense_table", (err, results) => {
                if (err) {
                    console.error("Database Query Error:", err);
                    return reject(err);
                }
                resolve(results);
            });
        });
    }


    // static getAllpage(page = 1, limit = 10) {
    //     return new Promise((resolve, reject) => {
    //         const offset = (page - 1) * limit;
    
    //         // Query to get paginated data
    //         const query = `SELECT * FROM expense_table ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
    //         // Query to get total records
    //         const countQuery = `SELECT COUNT(*) AS total FROM expense_table`;
    
    //         db.query(countQuery, (countErr, countResults) => {
    //             if (countErr) {
    //                 console.error("Database Count Query Error:", countErr);
    //                 return reject(countErr);
    //             }
    
    //             const totalRecords = countResults[0].total;
    //             const totalPages = Math.ceil(totalRecords / limit);
    
    //             db.query(query, [limit, offset], (err, results) => {
    //                 if (err) {
    //                     console.error("Database Query Error:", err);
    //                     return reject(err);
    //                 }
    
    //                 resolve({ expenses: results, totalPages, totalRecords });
    //             });
    //         });
    //     });
    // }
    
    static async getAllpage(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
    
            // Query to get paginated data
            const query = `SELECT * FROM expense_table ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    
            // Query to get total records
            const countQuery = `SELECT COUNT(*) AS total FROM expense_table`;
    
            // Get total records
            const [[{ total: totalRecords }]] = await db.promise().query(countQuery);
            const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0;
    
            // Get paginated data
            const [expenses] = await db.promise().query(query, [limit, offset]);
    
            return { expenses, totalPages, totalRecords };
        } catch (error) {
            console.error("Database Query Error:", error);
            throw error;
        }
    }
    
    

    static getById(id) {
        const query = "SELECT * FROM expense_table WHERE id = ?";
        return db.execute(query, [id]);
    }

    static update(id, data) {
        const query = `
            UPDATE expense_table
            SET category = ?, amount = ?, date = ? , description = ?, updated_at = NOW()
            WHERE id = ?
        `;
        return db.execute(query, [data.category, data.amount, data.date , data.description, id]);
    }

    static delete(id) {
        const query = "DELETE FROM expense_table WHERE id = ?";
        return db.execute(query, [id]);
    }

    

    // static async calculateExpense() {
    //     // Hardcoded date range for the query
    //     const query = `SELECT SUM(amount) AS totalExpense FROM expense_table WHERE created_at BETWEEN '2024-12-09T00:00:00.000Z' AND '2024-12-09T23:59:59.000Z'`;
    
    //     // Log the query for debugging
    //     console.log('Query:', query);
    
    //     // Correctly using db.execute() to return a promise
    //     try {
    //         const rows = await db.promise().query(query); // Execute the query
    //         console.log('Query Result:', rows); // Log the result to debug
    //         return rows; // Return the result rows
    //     } catch (err) {
    //         console.error('Error executing query:', err);
    //         throw err; // Throw the error to be handled in the controller
    //     }
    // }
    




    
//i have to use this below API call for daily monthly yearly it has dynamically work

    static async calculateExpense(startDate, endDate) {
        // Construct the SQL query dynamically with user-provided date range
        const query = `SELECT SUM(amount) AS totalExpense FROM expense_table WHERE created_at BETWEEN ? AND ?`;
    
        // Log the query for debugging
        console.log('Executing Query:', query, 'With Values:', startDate, endDate);
    
        try {
            // Execute the query with parameters to prevent SQL injection
            const [rows] = await db.promise().query(query, [startDate, endDate]);
    
            console.log('Query Result:', rows); // Log the result to debug
            return rows; // Return the result rows
        } catch (err) {
            console.error('Error executing query:', err);
            throw err; // Throw the error to be handled in the controller
        }
    }
    
    
    
    
    
    
}

module.exports = Expense;
