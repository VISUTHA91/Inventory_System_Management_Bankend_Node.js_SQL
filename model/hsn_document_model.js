// models/HSNModel.js
const db = require('../config/Database');

class HSNModel {
    // Method to insert HSN document into the database
    static async insertHSNDocument(filename, filePath) {
        const sql = `INSERT INTO hsn_documents (file_name, file_path) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.query(sql, [filename, filePath], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Method to insert HSN details into the database
    static async insertHSNDetails(hsnCode, category, gstRate, documentId) {
        const sql = `INSERT INTO hsn_details (hsn_code, category, gst_rate, document_id) VALUES (?, ?, ?, ?)`;
        return new Promise((resolve, reject) => {
            db.query(sql, [hsnCode, category, gstRate, documentId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }

    // Method to search for HSN code and GST rate by category
    static async searchHSNByCategory(category) {
        const sql = `SELECT hsn_code, gst_rate FROM hsn_details WHERE category LIKE ? LIMIT 1`;
        return new Promise((resolve, reject) => {
            db.query(sql, [`%${category}%`], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}

module.exports = HSNModel;
