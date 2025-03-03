const db = require('../config/Database'); // Database connection (e.g., MySQL)

class ProductReturn {
    // Create a product return
    static createReturn(invoice_id, product_id, quantity, return_reason) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO product_return_table SET ?';
            const values = { invoice_id, product_id, quantity, return_reason };

            db.query(query, values, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }


   // Get all product returns
// static getAllReturns() {
//     return new Promise((resolve, reject) => {
//         const query = `
//             SELECT pr.*, COALESCE(i.invoice_number, 'N/A') AS invoice_number, COALESCE(p.product_name, 'Unknown') AS product_name
//             FROM product_return_table pr
//             LEFT JOIN invoice_table i ON pr.invoice_id = i.id
//             LEFT JOIN product_table p ON pr.product_id = p.id
//         `;

//         db.query(query, (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(result);
//         });
//     });
// }

// Get paginated product returns
static getAllReturns(page = 1, limit = 5) {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit; // Calculate offset for pagination

        // Query to count total records
        const countQuery = `SELECT COUNT(*) AS totalRecords FROM product_return_table`;

        // Query to fetch paginated results
        const dataQuery = `
            SELECT pr.*, 
                   COALESCE(i.invoice_number, 'N/A') AS invoice_number, 
                   COALESCE(p.product_name, 'Unknown') AS product_name
            FROM product_return_table pr
            LEFT JOIN invoice_table i ON pr.invoice_id = i.id
            LEFT JOIN product_table p ON pr.product_id = p.id
            ORDER BY pr.return_date DESC
            LIMIT ? OFFSET ?
        `;

        // Execute count query first
        db.query(countQuery, (countErr, countResult) => {
            if (countErr) {
                return reject(countErr);
            }

            const totalRecords = countResult[0].totalRecords;
            const totalPages = Math.ceil(totalRecords / limit);

            // Execute data query
            db.query(dataQuery, [limit, offset], (dataErr, dataResult) => {
                if (dataErr) {
                    return reject(dataErr);
                }

                resolve({
                    success: true,
                    currentPage: page,
                    limit,
                    totalPages,
                    totalRecords,
                    data: dataResult,
                });
            });
        });
    });
}




static checkPurchasedQuantity(invoice_id, product_id) {
    return new Promise((resolve, reject) => {
        // Query to get the product and quantity details from the invoice
        const query = 'SELECT product_id, quantity FROM invoice_table WHERE id = ?';

        db.query(query, [invoice_id], (err, result) => {
            if (err) {
                return reject(err);
            }

            if (result.length === 0) {
                return reject(new Error('Invoice not found'));
            }

            // Parse the product_id and quantity fields
            const productIds = JSON.parse(result[0].product_id);
            const quantities = JSON.parse(result[0].quantity);

            // Find the index of the product_id in the product list
            const productIndex = productIds.indexOf(product_id);

            if (productIndex === -1) {
                return reject(new Error('Product not found in the invoice'));
            }

            // Resolve with the purchased quantity for the given product
            resolve(quantities[productIndex]);
        });
    });
}



static getReturnsByInvoice(invoice_id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT pr.*, 
                              p.product_name, 
                              c.customer_name, 
                              c.email AS customer_email,
                              c.purchased_item, 
                              c.amount, 
                              c.purchased_quantity,
                              c.created_at AS purchased_time
                       FROM product_return_table pr
                       JOIN product_table p ON pr.product_id = p.id
                       JOIN invoice_table i ON pr.invoice_id = i.id
                       JOIN customer_table c ON i.customer_id = c.customer_id
                       WHERE pr.invoice_id = ?`;

        db.query(query, [invoice_id], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}



    // Update product quantity in the product table
    static updateProductQuantity(product_id, quantity) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE product_table SET product_quantity = product_quantity + ? WHERE id = ?';

            db.query(query, [quantity, product_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }

    

  // Fetch Rejected Invoices from DB
  static getAllRejectedInvoices() {
    return new Promise((resolve, reject) => {
        const query = `SELECT i.*, c.customer_name 
                       FROM invoice_table i
                       JOIN customer_table c ON i.customer_id = c.id
                       WHERE i.status = 'rejected'`;

        db.query(query, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

// API Route Handler for Rejected Invoices
static async getRejectedInvoices(req, res) {
    try {
        const rejectedInvoices = await ProductReturn.getAllRejectedInvoices();
        res.status(200).json(rejectedInvoices);
    } catch (error) {
        console.error('Error retrieving rejected invoices:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


    // Delete a product return entry by return_id
    static deleteReturn(return_id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM product_return_table WHERE return_id = ?';

            db.query(query, [return_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    }




    static async getReturnedProducts(invoice_id) {
        try {
            const [rows] = await db.promise().query(
                `SELECT pr.return_id, pr.invoice_id, p.product_name, pr.quantity, pr.return_reason, pr.return_date 
                  FROM product_return_table pr
                  JOIN product_table p ON pr.product_id = p.id
                       WHERE pr.invoice_id = ?;
                                                `,
                [invoice_id]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }


  
    static async returnProduct(invoice_id, returnedProducts) {
        const connection = await db.promise().getConnection();
        try {
            await connection.beginTransaction();

            for (const product of returnedProducts) {
                const { product_id, quantity, return_reason } = product;

                // Check if product exists in invoice
                const [invoiceProduct] = await connection.query(
                    `SELECT quantity FROM invoice_products WHERE invoice_id = ? AND product_id = ?`,
                    [invoice_id, product_id]
                );

                if (invoiceProduct.length === 0) {
                    throw new Error(`Product ID ${product_id} not found in invoice.`);
                }

                // Insert return record
                await connection.query(
                    `INSERT INTO product_return_table (invoice_id, product_id, quantity, return_reason, return_date) 
                     VALUES (?, ?, ?, ?, NOW())`,
                    [invoice_id, product_id, quantity, return_reason]
                );

                // Update product stock
                await connection.query(
                    `UPDATE product_table 
                     SET product_quantity = product_quantity + ? 
                     WHERE id = ?`,
                    [quantity, product_id]
                );
            }

            await connection.commit();
            return { message: "Return processed successfully" };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }


    
}

module.exports = ProductReturn;













