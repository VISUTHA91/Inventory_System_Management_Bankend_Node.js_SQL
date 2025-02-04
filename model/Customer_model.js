    const db = require('../config/Database'); // Make sure this imports your database pool

// class Customer {
//     // Query wrapper
//     static query(sql, params) {
//         return new Promise((resolve, reject) => {
//             db.query(sql, params, (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results);
//             });
//         });
//     }

//     // Create a customer
//     static async create(data) {
//         const { customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status } = data;
//         const result = await Customer.query(
//             'INSERT INTO customer_table (customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
//             [customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status]
//         );
//         return result.insertId; // Return the newly created customer ID
//     }

//     // Get all customers
//     static async getAll() {
//         const customers = await Customer.query('SELECT * FROM customer_table');
//         return customers;
//     }

//     // Get customer by ID
//     static async getById(id) {
//         const customer = await Customer.query('SELECT * FROM customer_table WHERE customer_id = ?', [id]);
//         return customer[0]; // Return first customer in array
//     }

//     // Update a customer
//     static async update(id, data) {
//         const { customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status } = data;
//         await Customer.query(
//             'UPDATE customer_table SET customer_name = ?, phone = ?, email = ?, address = ?, purchased_item = ?, purchased_quantity = ?, amount = ?, status = ? WHERE customer_id = ?',
//             [customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status, id]
//         );
//     }

//     // Delete a customer
//     static async delete(id) {
//         await Customer.query('DELETE FROM customer_table WHERE customer_id = ?', [id]);
//     }
// }

// module.exports = Customer;





class Customer {
    // Query wrapper
    static query(sql, params) {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }

    // Create a customer
    static async create(data) {
        const {
            customer_name,
            phone,
            email,
            address,
            purchased_item,
            purchased_quantity,
            amount,
            status,
            customer_gst_number,
        } = data;

        const result = await Customer.query(
            `INSERT INTO customer_table 
            (customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status, customer_gst_number) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_name,
                phone,
                email,
                address,
                purchased_item,
                purchased_quantity,
                amount,
                status,
                customer_gst_number,
            ]
        );
        return result.insertId; // Return the newly created customer ID
    }

    // Get all customers
    static async getAll() {
        const customers = await Customer.query('SELECT * FROM customer_table');
        return customers;
    }

    // Get customer by ID
    static async getById(id) {
        const customer = await Customer.query('SELECT * FROM customer_table WHERE customer_id = ?', [id]);
        return customer[0]; // Return first customer in array
    }

    // Update a customer
    static async update(id, data) {
        const {
            customer_name,
            phone,
            email,
            address,
            purchased_item,
            purchased_quantity,
            amount,
            status,
            customer_gst_number,
        } = data;

        await Customer.query(
            `UPDATE customer_table 
            SET customer_name = ?, phone = ?, email = ?, address = ?, purchased_item = ?, purchased_quantity = ?, 
                amount = ?, status = ?, customer_gst_number = ? 
            WHERE customer_id = ?`,
            [
                customer_name,
                phone,
                email,
                address,
                purchased_item,
                purchased_quantity,
                amount,
                status,
                customer_gst_number,
                id,
            ]
        );
    }

    // Delete a customer
    static async delete(id) {
        await Customer.query('DELETE FROM customer_table WHERE customer_id = ?', [id]);
    }
}

module.exports = Customer;
