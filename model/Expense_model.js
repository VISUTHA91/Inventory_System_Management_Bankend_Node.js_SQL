const db = require("../config/Database.js");

class Expense {
    static create(data) {
        const query = "INSERT INTO expense_table (category, amount, description) VALUES (?, ?, ?)";
        return db.execute(query, [data.category, data.amount, data.description]);
    }

    static getAll() {
        const query = "SELECT * FROM expense_table";
        return db.execute(query);
    }

    static getById(id) {
        const query = "SELECT * FROM expense_table WHERE id = ?";
        return db.execute(query, [id]);
    }

    static update(id, data) {
        const query = `
            UPDATE expense_table
            SET category = ?, amount = ?, description = ?, updated_at = NOW()
            WHERE id = ?
        `;
        return db.execute(query, [data.category, data.amount, data.description, id]);
    }

    static delete(id) {
        const query = "DELETE FROM expense_table WHERE id = ?";
        return db.execute(query, [id]);
    }

    

    static async calculateExpense() {
        // Hardcoded date range for the query
        const query = `SELECT SUM(amount) AS totalExpense FROM expense_table WHERE created_at BETWEEN '2024-12-09T00:00:00.000Z' AND '2024-12-09T23:59:59.000Z'`;
    
        // Log the query for debugging
        console.log('Query:', query);
    
        // Correctly using db.execute() to return a promise
        try {
            const rows = await db.promise().query(query); // Execute the query
            console.log('Query Result:', rows); // Log the result to debug
            return rows; // Return the result rows
        } catch (err) {
            console.error('Error executing query:', err);
            throw err; // Throw the error to be handled in the controller
        }
    }
    
    
    
    
}

module.exports = Expense;
