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


      // Find a customer by phone
      static async findByPhone(phone, customer_name) {
        const result = await Customer.query(
            `SELECT * FROM customer_table WHERE phone = ? OR customer_name = ? LIMIT 1`, 
            [phone]
        );
        return result.length ? result[0] : null; // Return customer if found, else null
    }


    // // Create a customer
    // static async create(data) {
    //     const {
    //         customer_name,
    //         phone,
    //         email,
    //         address,
    //         purchased_item,
    //         purchased_quantity,
    //         amount,
    //         status,
    //         customer_gst_number,
    //     } = data;

    //     const result = await Customer.query(
    //         `INSERT INTO customer_table 
    //         (customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status, customer_gst_number) 
    //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //         [
    //             customer_name,
    //             phone,
    //             email,
    //             address,
    //             purchased_item,
    //             purchased_quantity,
    //             amount,
    //             status,
    //             customer_gst_number,
    //         ]
    //     );
    //     return result.insertId; // Return the newly created customer ID
    // }


    static async checkCustomerExists(phone) {
        try {
            const [rows] = await db.promise().query(
                "SELECT customer_id FROM customer_table WHERE phone = ? LIMIT 1",
                [phone]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in checkCustomerExists:", error);
            return null;
        }
    }

    static async create({ customer_name, phone }) {
        try {
            const [result] = await db.promise().query(
                "INSERT INTO customer_table (customer_name, phone) VALUES (?, ?)",
                [customer_name, phone]
            );
            return result.insertId;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    }
    

    // Get all customers
    // static async getAll() {
    //     const customers = await Customer.query('SELECT * FROM customer_table');
    //     return customers;
    // }

    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit; // Calculate offset for pagination
        const query = `SELECT * FROM customer_table LIMIT ? OFFSET ?`; // Use LIMIT and OFFSET
    
        try {
            const customers = await Customer.query(query, [limit, offset]);
            return customers;
        } catch (err) {
            console.error('Database error:', err);
            throw new Error('Error fetching customers from the database');
        }
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

        //details

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

// Fetch total customers from the customer_table
static fetchTotalCustomers() {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS total_customers FROM customer_table;`;

        db.query(query, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return reject(new Error('Error fetching total customers from the database'));
            }
            resolve(result[0].total_customers);
        });
    });
}

    
}

module.exports = Customer;
