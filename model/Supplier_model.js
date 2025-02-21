const db = require('../config/Database'); // Import the database pool

class Supplier {
 
   
        static query(sql, params) {
            return new Promise((resolve, reject) => {
                // console.log('Executing SQL:', sql, 'with params:', params);
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
            const {
                company_name,
                phone_number,
                supplier_gst_number,
                email,
                address,
                city,
                state,
                postal_code,
                country,
                status,
            } = data;
    
            if (!supplier_gst_number || supplier_gst_number.trim() === '') {
                throw new Error('Supplier GST number is required');
            }
    
            const result = await Supplier.query(
                'INSERT INTO supplier (company_name, phone_number, supplier_gst_number, email, address, city, state, postal_code, country, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    company_name,
                    phone_number,
                    supplier_gst_number,
                    email,
                    address,
                    city,
                    state,
                    postal_code,
                    country,
                    status,
                ]
            );
            return result.insertId;
        }
    
    
//already corrected code

    // static async getAll() {
    //     return await Supplier.query('SELECT * FROM supplier');
    // }

    static async getAll(page, limit) { 
        const offset = (page - 1) * limit; // Calculate offset
    
        // Use this.query to call the query method inside the same class
        const rows = await this.query(
            'SELECT * FROM supplier LIMIT ? OFFSET ?',
            [limit, offset]
        );
    
        // Query to get total count of suppliers
        const totalRows = await this.query('SELECT COUNT(*) AS total FROM supplier', []);
        const totalSuppliers = totalRows[0].total;
    
        return { suppliers: rows, totalSuppliers };
    }
    
    static async getAllSupplierNames() {
        const rows = await this.query('SELECT company_name FROM supplier', []);
        return rows;
    }
    
    

    static async getById(id) {
        const rows = await Supplier.query('SELECT * FROM supplier WHERE supplier_id = ?', [id]);
        return rows[0];
    }

    static async update(id, data) {
        const { company_name, phone_number, email, supplier_gst_number, address, city, state, postal_code, country, status } = data;

        // Validate supplier_gst_number (cannot be empty)
        if (!supplier_gst_number || supplier_gst_number.trim() === '') {
            throw new Error('Supplier GST number is required');
        }

        // // Validate debit and balance
        // if (debit < 0) {
        //     throw new Error('Debit cannot be a negative value');
        // }

        // const calculatedBalance = parseFloat(credit) - parseFloat(debit);
        // if (calculatedBalance < 0) {
        //     throw new Error('Balance cannot be negative');
        // }

        await Supplier.query(
            `UPDATE supplier 
             SET company_name = ?, phone_number = ?, email = ?, supplier_gst_number = ?, address = ?, city = ?, 
                 state = ?, postal_code = ?, country = ?, status = ?
             WHERE supplier_id = ?`,
            [company_name, phone_number, email, supplier_gst_number, address, city, state, postal_code, country, status, id]
        );
    }

    static async delete(id) {
        await Supplier.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
    }
}

module.exports = Supplier;
