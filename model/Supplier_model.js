const db = require('../config/Database'); // Import the database pool

//this is my correct code.
// class Supplier {
//     static query(sql, params) {
//         return new Promise((resolve, reject) => {
//             db.query(sql, params, (err, results) => {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(results);
//                 }
//             });
//         });
//     }

//     static async create(data) {
//         const { company_name, phone_number, supplier_gst_number,email, address, city, state, postal_code, country, status, credit, debit, balance } = data;

//         // Validate debit and balance
//         if (debit < 0) {
//             throw new Error('Debit cannot be a negative value');
//         }

//         const calculatedBalance = parseFloat(credit) - parseFloat(debit);
//         if (calculatedBalance < 0) {
//             throw new Error('Balance cannot be negative');
//         }

//         const result = await Supplier.query(
//             'INSERT INTO supplier (company_name, phone_number, email, supplier_gst_number,address, city, state, postal_code, country, status, credit, debit, balance) VALUES (?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [company_name, phone_number, supplier_gst_number,email, address, city, state, postal_code, country, status, credit, debit, calculatedBalance]
//         );
//         return result.insertId;
//     }

//     static async getAll() {
//         return await Supplier.query('SELECT * FROM supplier');
//     }

//     static async getById(id) {
//         const rows = await Supplier.query('SELECT * FROM supplier WHERE supplier_id = ?', [id]);
//         return rows[0];
//     }

//     static async update(id, data) {
//         const { company_name, phone_number, email, supplier_gst_number,address, city, state, postal_code, country, status, credit, debit, balance } = data;

//         if (debit < 0) {
//             throw new Error('Debit cannot be a negative value');
//         }

//         const calculatedBalance = parseFloat(credit) - parseFloat(debit);
//         if (calculatedBalance < 0) {
//             throw new Error('Balance cannot be negative');
//         }

//         await Supplier.query(
//             `UPDATE supplier 
//              SET company_name = ?, phone_number = ?, email = ?, supplier_gst_number = ? ,address = ?, city = ?, 
//                  state = ?, postal_code = ?, country = ?, status = ?, credit = ?, debit = ?, balance = ? 
//              WHERE supplier_id = ?`,
//             [company_name, phone_number, email, supplier_gst_number,address, city, state, postal_code, country, status, credit, debit, calculatedBalance, id]
//         );
//     }

//     static async delete(id) {
//         await Supplier.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
//     }
// }

// module.exports = Supplier;




class Supplier {
    static query(sql, params) {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    static async create(data) {
        const { company_name, phone_number, supplier_gst_number, email, address, city, state, postal_code, country, status, credit, debit, balance } = data;

        // Validate supplier_gst_number (cannot be empty)
        if (!supplier_gst_number || supplier_gst_number.trim() === '') {
            throw new Error('Supplier GST number is required');
        }

        // Validate debit and balance
        if (debit < 0) {
            throw new Error('Debit cannot be a negative value');
        }

        const calculatedBalance = parseFloat(credit) - parseFloat(debit);
        if (calculatedBalance < 0) {
            throw new Error('Balance cannot be negative');
        }

        const result = await Supplier.query(
            'INSERT INTO supplier (company_name, phone_number, supplier_gst_number,email, address, city, state, postal_code, country, status, credit, debit, balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company_name, phone_number, supplier_gst_number, email, address, city, state, postal_code, country, status, credit, debit, calculatedBalance]
        );
        return result.insertId;
    }

    static async getAll() {
        return await Supplier.query('SELECT * FROM supplier');
    }

    static async getById(id) {
        const rows = await Supplier.query('SELECT * FROM supplier WHERE supplier_id = ?', [id]);
        return rows[0];
    }

    static async update(id, data) {
        const { company_name, phone_number, email, supplier_gst_number, address, city, state, postal_code, country, status, credit, debit, balance } = data;

        // Validate supplier_gst_number (cannot be empty)
        if (!supplier_gst_number || supplier_gst_number.trim() === '') {
            throw new Error('Supplier GST number is required');
        }

        // Validate debit and balance
        if (debit < 0) {
            throw new Error('Debit cannot be a negative value');
        }

        const calculatedBalance = parseFloat(credit) - parseFloat(debit);
        if (calculatedBalance < 0) {
            throw new Error('Balance cannot be negative');
        }

        await Supplier.query(
            `UPDATE supplier 
             SET company_name = ?, phone_number = ?, email = ?, supplier_gst_number = ?, address = ?, city = ?, 
                 state = ?, postal_code = ?, country = ?, status = ?, credit = ?, debit = ?, balance = ? 
             WHERE supplier_id = ?`,
            [company_name, phone_number, email, supplier_gst_number, address, city, state, postal_code, country, status, credit, debit, calculatedBalance, id]
        );
    }

    static async delete(id) {
        await Supplier.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
    }
}

module.exports = Supplier;
