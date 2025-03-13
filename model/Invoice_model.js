// const connection = require('../config/Database');
const db = require('../config/Database');


class Invoice {
    // Generate Invoice Number
    static generateInvoiceNumber() {
        return new Promise((resolve, reject) => {
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Format: YYYYMMDD
            const prefix = "INV";

            const query = `
        SELECT invoice_number
        FROM invoice_table
        WHERE invoice_number LIKE ?
        ORDER BY id DESC LIMIT 1
      `;

            db.query(query, [`${prefix}-${datePart}-%`], (err, results) => {
                if (err) {
                    console.error('Database error during invoice number generation:', err);
                    return reject(err); // Reject promise with the error
                }

                if (results.length > 0) {
                    const lastInvoiceNumber = results[0].invoice_number;
                    const sequence = parseInt(lastInvoiceNumber.split('-')[2]) + 1;
                    const newInvoiceNumber = `${prefix}-${datePart}-${sequence.toString().padStart(3, '0')}`;
                    resolve(newInvoiceNumber); // Resolve promise with the new invoice number
                } else {
                    resolve(`${prefix}-${datePart}-001`); // If no invoice exists, start with the first invoice number
                }
            });
        });
    }

    static async getInvoiceDetails(invoice_number) {
        try {
            const [rows] = await db.promise().query(
                `SELECT                 
        i.id AS invoice_id, 
        i.invoice_number, 
        i.invoice_created_at AS invoice_date, 
        c.customer_id, 
        COALESCE(c.customer_name, 'Unknown') AS customer_name, 
        c.phone, 
        p.id AS product_id, 
        p.product_name, 
        p.product_price,
        jp.product_id AS product_id_extracted, 
        COALESCE(jq.quantity, '-') AS quantity_extracted,
        pr.return_id, 
        COALESCE(pr.quantity, '-') AS returned_quantity, 
        COALESCE(pr.return_reason, '-') AS return_reason
    FROM invoice_table i
    LEFT JOIN customer_table c ON i.customer_id = c.customer_id
    LEFT JOIN (
        SELECT id AS invoice_id, 
               JSON_UNQUOTE(JSON_EXTRACT(product_id, CONCAT('$[', n.n, ']'))) AS product_id, 
               n.n AS json_index
        FROM invoice_table
        JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
              UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) n
        ON JSON_UNQUOTE(JSON_EXTRACT(product_id, CONCAT('$[', n.n, ']'))) IS NOT NULL
    ) jp ON i.id = jp.invoice_id
    LEFT JOIN (
        SELECT id AS invoice_id, 
               JSON_UNQUOTE(JSON_EXTRACT(quantity, CONCAT('$[', n.n, ']'))) AS quantity, 
               n.n AS json_index
        FROM invoice_table
        JOIN (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
              UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) n
        ON JSON_UNQUOTE(JSON_EXTRACT(quantity, CONCAT('$[', n.n, ']'))) IS NOT NULL
    ) jq ON i.id = jq.invoice_id AND jp.json_index = jq.json_index
    LEFT JOIN product_table p ON jp.product_id = p.id
    LEFT JOIN product_return_table pr 
        ON i.id = pr.invoice_id 
        AND jp.product_id = pr.product_id
    WHERE i.invoice_number = ?;
`,
                [invoice_number]
            );
    
            console.log("Invoice Query Result:", rows);
    
            if (!rows || rows.length === 0) {
                return { error: "Invoice not found", status: 404 };
            }
    
            return {
                invoice_id: rows[0].invoice_id,
                invoice_number: rows[0].invoice_number,
                invoice_date: rows[0].invoice_date,
                customer_id: rows[0].customer_id,
                customer_name: rows[0].customer_name,
                phone: rows[0].phone,
                products: rows.map(row => ({
                    product_id: row.product_id_extracted,  
                    product_name: row.product_name,
                    product_price: row.product_price,
                    quantity: row.quantity_extracted !== null ? row.quantity_extracted : '-',
                    return_id: row.return_id,
                    returned_quantity: row.returned_quantity !== null ? row.returned_quantity : '-',
                    return_reason: row.return_reason !== null ? row.return_reason : '-'
                }))
            };
        } catch (error) {
            console.error("Error fetching invoice details:", error);
            return { error: "Database error", status: 500 };
        }
    }
    
  
    static async getCustomerById(customer_id) {
        try {
            const query = "SELECT customer_name, phone FROM customer_table WHERE customer_id = ?";
            const [rows] = await db.promise().query(query, [customer_id]);
            return rows.length ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }
    

    static async getInvoiceProducts(invoice_number) {
        const query = `
            SELECT p.id, p.product_name, ip.quantity, p.product_price 
            FROM invoice_table ip
            JOIN product_table p ON ip.id = p.id
            WHERE ip.invoice_number = ?`;
        return db.promise().query(query, [invoice_number]).then(([rows]) => rows);
    }

    static async getReturnedProducts(invoice_id) {
        const query = ` SELECT             
            pr.return_id, 
            p.product_name, 
            pr.quantity, 
            pr.return_reason, 
            pr.return_date 
        FROM product_return_table pr
        JOIN product_table p ON pr.product_id = p.id  -- ✅ Use Correct Column Name
        WHERE pr.invoice_id = ?`;
        return db.promise().query(query, [invoice_id]).then(([rows]) => rows);
    }
    
 




    static getTotalInvoiceAmount() {
        return new Promise((resolve, reject) => {
            const query = `SELECT COALESCE(SUM(total_price), 0) AS totalFinalPrice FROM invoice_table`;
    
            db.query(query, (err, results) => {
                if (err) return reject(err);
    
                // Ensure totalFinalPrice is always a number
                const totalFinalPrice = results[0]?.totalFinalPrice || 0;
    
                resolve(Number(totalFinalPrice).toFixed(2));
            });
        });
    }
    
     // Fetch total unique customers who made purchases
    //  static fetchTotalCustomers() {
    //     return new Promise((resolve, reject) => {
    //         const query = `SELECT COUNT(DISTINCT customer_id) AS total_customers FROM invoice_table;`;

    //         db.query(query, (err, result) => {
    //             if (err) {
    //                 console.error('Database error:', err);
    //                 return reject(new Error('Error fetching total customers from the database'));
    //             }
    //             resolve(result[0].total_customers);
    //         });
    //     });
    // }
    


  
    // static async checkCustomerExists(phone) {
    //     try {
    //         const [rows] = await db.promise().query(
    //             "SELECT customer_id FROM customer_table WHERE phone = ? ORDER BY customer_id DESC LIMIT 1",
    //             [phone]
    //         );
    //         console.log("Customer Exists Query Result:", rows);
    //         return rows.length > 0 ? rows[0] : null;
    //     } catch (error) {
    //         console.error("Error in checkCustomerExists:", error);
    //         return null;
    //     }
    // }
    

    static async checkCustomerExists(customer_id) {
        try {
            const [rows] = await db.promise().query(
                "SELECT customer_id FROM customer_table WHERE customer_id = ?",
                [customer_id]
            );
            console.log("Customer Exists Query Result:", rows);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in checkCustomerExists:", error);
            return null;
        }
    }
    
    
    
    


    // Check if product exists and fetch details
    static async checkProductExists(productId) {
        const query = 'SELECT id,product_name, product_price,selling_price, product_quantity ,GST,product_discount FROM product_table WHERE id = ?';
        const [results] = await db.promise().query(query, [productId]);
        return results.length > 0 ? results[0] : null;
    }

    // Update stock for a product
    static async updateStock(productId, quantity) {
        const query = `
                UPDATE product_table 
                SET product_quantity = product_quantity - ?, 
                    stock_status = CASE 
                        WHEN product_quantity - ? <= 0 THEN 'Out of Stock'
                        WHEN product_quantity - ? <= 20 THEN 'Low Stock'
                        ELSE 'Available'
                    END, 
                    updated_at = NOW()
                WHERE id = ? AND product_quantity >= ?`;
        await db.promise().query(query, [quantity, quantity, quantity, productId, quantity]);
    }




// // Create a new product

 // Invoice creation logic
 static async createInvoice(data) {
    const {
        invoice_number,
        customer_id,
        product_id,
        quantity,
        total_price,
        discount,
        final_price,                 
        payment_status,
        payment_method
    } = data;

    // console.log(discount);

    // console.log(data);

    // Ensure prices and discounts are valid (no NaN values)
    if (isNaN(total_price) || isNaN(final_price)) {
        throw new Error('Error in calculating prices');
    }

    const query = `
    INSERT INTO invoice_table (
        invoice_number, customer_id, product_id, quantity, total_price, 
        discount, final_price, payment_status,payment_method
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ? ,?)
`;

    const [result] = await db.promise().query(query, [
        invoice_number,
        customer_id,
        JSON.stringify(product_id), // Convert array to JSON string
        JSON.stringify(quantity), // Convert array to JSON string
        total_price,
        JSON.stringify(discount), // Store discount as a JSON array
        final_price,       
        payment_status,
        payment_method
    ]);

    // Return inserted details
    return {
        invoice_number,
        customer_id,
        product_id,
        quantity,
        total_price,
        discount,
        final_price,        
        payment_status,
        payment_method,
        invoice_id: result.insertId // Add the generated invoice ID
    };
}




    //get All invoice my correct code
    static getAllInvoices() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT i.*, c.customer_name
                FROM invoice_table i
                JOIN customer_table c ON i.customer_id = c.customer_id
            `;
    
            db.query(query, async (err, results) => {
                if (err) return reject(err);
    
                try {
                    const invoices = await Promise.all(results.map(async (invoice) => {
                        let productIDs, quantities;
    
                        try {
                            productIDs = JSON.parse(invoice.product_id || '[]');
                            quantities = JSON.parse(invoice.quantity || '[]');
                        } catch (parseError) {
                            console.error("Error parsing product IDs or quantities:", parseError);
                            return { ...invoice, products: [], totalGST: "0.00", finalPriceWithGST: invoice.final_price };
                        }
    
                        if (productIDs.length === 0 || quantities.length === 0 || productIDs.length !== quantities.length) {
                            return { ...invoice, products: [], totalGST: "0.00", finalPriceWithGST: invoice.final_price };
                        }
    
                        const productQuery = `
                            SELECT id AS product_id, product_name, selling_price, GST 
                            FROM product_table 
                            WHERE id IN (?)
                        `;
    
                        const products = await new Promise((resolve, reject) => {
                            db.query(productQuery, [productIDs], (err, productResults) => {
                                if (err) return reject(err);
                                resolve(productResults);
                            });
                        });
    
                        const productsWithDetails = products.map((product, index) => {
                            const quantity = quantities[index] || 0;
                            const unitPrice = parseFloat(product.selling_price || 0);
                            const gstPercentage = parseFloat(product.GST || 0);
                            const gstAmount = parseFloat(((unitPrice * gstPercentage) / 100).toFixed(2));
    
                            return {
                                ...product,
                                quantity,
                                gst_amount: gstAmount,
                                selling_price: unitPrice.toFixed(2),
                            };
                        });
    
                        const totalGST = productsWithDetails.reduce((sum, p) => sum + p.gst_amount, 0).toFixed(2);
                        const finalPriceWithGST = (parseFloat(invoice.final_price || 0) + parseFloat(totalGST)).toFixed(2);
    
                        return { ...invoice, products: productsWithDetails, totalGST, finalPriceWithGST };
                    }));
    
                    resolve(invoices);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }




    


    static getAllInvoicespage(page = 1, limit = 10) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit; // Calculate pagination offset
    
            // Query to count total invoices
            const countQuery = `SELECT COUNT(*) AS total FROM invoice_table`;
    
            db.query(countQuery, (err, countResult) => {
                if (err) return reject(err);
    
                const totalInvoices = countResult[0].total;
                const totalPages = Math.ceil(totalInvoices / limit);
    
                // Query to fetch paginated invoices
                const query = `
                    SELECT i.*, c.customer_name
                    FROM invoice_table i
                    JOIN customer_table c ON i.customer_id = c.customer_id
                    LIMIT ? OFFSET ?`; // Apply LIMIT and OFFSET
    
                db.query(query, [limit, offset], async (err, results) => {
                    if (err) return reject(err);
    
                    const invoices = await Promise.all(results.map(async (invoice) => {
                        const productIDs = JSON.parse(invoice.product_id || '[]');
                        const quantities = JSON.parse(invoice.quantity || '[]');
    
                        if (!productIDs.length || !quantities.length) {
                            return { ...invoice, products: [], totalGST: "0.00", finalPriceWithGST: invoice.final_price };
                        }
    
                        const productQuery = `
                            SELECT id AS product_id, product_name, selling_price, GST 
                            FROM product_table 
                            WHERE id IN (?)
                        `;
    
                        try {
                            const products = await new Promise((resolve, reject) => {
                                db.query(productQuery, [productIDs], (err, productResults) => {
                                    if (err) return reject(err);
                                    resolve(productResults);
                                });
                            });
    
                            const productsWithDetails = products.map((product, index) => {
                                const quantity = quantities[index] || 0;
                                const gstAmount = parseFloat(((product.selling_price * product.GST) / 100).toFixed(2));
                                return {
                                    ...product,
                                    quantity,
                                    gst_amount: gstAmount,
                                    selling_price: parseFloat(product.selling_price).toFixed(2),
                                };
                            });
    
                            const totalGST = productsWithDetails.reduce((sum, p) => sum + p.gst_amount, 0).toFixed(2);
                            const finalPriceWithGST = (parseFloat(invoice.final_price) + parseFloat(totalGST)).toFixed(2);
    
                            return { ...invoice, products: productsWithDetails, totalGST, finalPriceWithGST };
    
                        } catch (err) {
                            return reject(err);
                        }
                    }));
    
                    resolve({ invoices, totalInvoices, totalPages });
                });
            });
        });
    }
    
    


    static async updateInvoice(invoiceId, data) {
        const { customer_id, products, total_price, total_discount, final_price, payment_status, payment_method } = data;
    
        // SQL query to update invoice
        const query = `
            UPDATE invoice_table 
            SET customer_id = ?, 
                product_id = ?, 
                quantity = ?, 
                total_price = ?, 
                discount = ?, 
                final_price = ?, 
                payment_status = ?, 
                payment_method = ?, 
                invoice_updated_at = NOW()
            WHERE id = ?
        `;
    
        const [result] = await db.promise().query(query, [
            customer_id,
            JSON.stringify(products.map((p) => p.product_id)), // Convert product IDs to JSON
            JSON.stringify(products.map((p) => p.quantity)),  // Convert quantities to JSON
            total_price,
            JSON.stringify(products.map((p) => p.discount_amount)),  // Convert product discounts to JSON
            final_price,
            payment_status,
            payment_method,
            invoiceId,
        ]);
    
        return result.affectedRows > 0; // Return true if the update was successful
    }
    




static async getInvoiceById(id) { 
    try {
        const invoiceQuery = `
           SELECT 
    i.id AS invoice_id,
    i.invoice_number,
    i.customer_id,
    REPLACE(REPLACE(i.quantity, '[', ''), ']', '') AS invoice_quantity,
    i.total_price,
    CAST(JSON_UNQUOTE(i.discount) AS DECIMAL(10,2)) AS discount,
    i.final_price,
    i.invoice_created_at,
    i.invoice_updated_at,
    c.customer_name,
    c.phone,
    c.email,
    c.address,
    CONCAT('[', GROUP_CONCAT(
        JSON_OBJECT(
            'product_id', p.id,
            'product_name', p.product_name,
            'product_batch_no', p.product_batch_no,
            'unit_price', p.selling_price,
            'expiry_date', p.expiry_date,
            'MFD', p.MFD,
            'gst_percentage', p.GST,
            'gst_amount', ROUND((p.GST / 100) * p.selling_price, 2),
            'unit_price_display', ROUND(p.selling_price + ((p.GST / 100) * p.selling_price), 2),
            'product_quantity', 
            JSON_UNQUOTE(JSON_EXTRACT(i.quantity, CONCAT('$[', FIND_IN_SET(p.id, REPLACE(REPLACE(i.product_id, '[', ''), ']', '')) - 1, ']'))),
            'total_product_price', 
            JSON_UNQUOTE(JSON_EXTRACT(i.quantity, CONCAT('$[', FIND_IN_SET(p.id, REPLACE(REPLACE(i.product_id, '[', ''), ']', '')) - 1, ']'))) 
            * (p.selling_price + ((p.GST / 100) * p.selling_price))
        )
    ), ']') AS products
FROM invoice_table i
JOIN customer_table c ON i.customer_id = c.customer_id
JOIN product_table p ON FIND_IN_SET(p.id, REPLACE(REPLACE(i.product_id, '[', ''), ']', ''))
WHERE i.id = ?
GROUP BY i.id;

        `;

        const shopQuery = `
            SELECT 
                shop_id,
                pharmacy_name,
                pharmacy_address,
                pincode,
                owner_GST_number,
                allow_registration,
                description AS shop_description
            FROM shop_table
            WHERE shop_id = (SELECT shop_id FROM invoice_table WHERE id = ?);
        `;

        // Fetch invoice details
        const [invoiceResults] = await db.promise().query(invoiceQuery, [id]);
        if (invoiceResults.length === 0) {
            throw new Error(`Invoice with ID ${id} not found.`);
        }

        const invoice = invoiceResults[0];
        invoice.products = JSON.parse(invoice.products || '[]');  // Safe parsing

        // Fetch shop details
        const [shopResults] = await db.promise().query(shopQuery, [id]);
        const shop = shopResults.length > 0 ? shopResults[0] : null;

        return { ...invoice, shop };
    } catch (error) {
        throw new Error(error.message || 'Error fetching invoice details.');
    }
}










    static deleteInvoice(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM invoice_table WHERE id = ?`;
            // Log the query for debugging
            console.log("Executing query:", query, "with id:", id);

            // Run the query to delete the invoice by ID
            db.query(query, [id], (err, result) => {
                if (err) {
                    console.error('Database error during invoice deletion:', err);
                    return reject(err); // Reject with error if query fails
                }
                resolve(result); // Resolve with the result of the delete query
            });
        });
    }

//correct code of pdf/csv
    
        // // 🔹 Fetch Detailed Invoice Data (Promise-Based)
        // static getInvoiceList(startDate, endDate, interval, productName, categoryName) {
        //     return new Promise((resolve, reject) => {
        //         let query = `
        //             SELECT i.*, c.customer_name
        //             FROM invoice_table i
        //             JOIN customer_table c ON i.customer_id = c.customer_id
        //             WHERE 1=1
        //         `;
    
        //         let values = [];
    
        //         if (startDate && endDate) {
        //             query += ` AND invoice_created_at BETWEEN ? AND ?`;
        //             values.push(startDate, endDate);
        //         }
        //         if (interval) {
        //             query += ` AND invoice_created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
        //             values.push(interval);
        //         }
        //         if (productName) {
        //             query += ` AND product_name LIKE ?`;
        //             values.push(`%${productName}%`);
        //         }
        //         if (categoryName) {
        //             query += ` AND category_name LIKE ?`;
        //             values.push(`%${categoryName}%`);
        //         }
    
        //         db.query(query, values, (err, rows) => {
        //             if (err) {
        //                 console.error("Error fetching invoice list:", err);
        //                 return reject(err);
        //             }
        //             resolve(rows);
        //         });
        //     });
        // }
    
        // // 🔹 Fetch Total Sales Summary (Promise-Based)
        // static getTotalSales() {
        //     return new Promise((resolve, reject) => {
        //         const query = `SELECT SUM(final_price) AS total_sales, COUNT(invoice_id) AS total_invoices FROM invoice_table`;
    
        //         db.query(query, (err, rows) => {
        //             if (err) {
        //                 console.error("Error fetching total sales:", err);
        //                 return reject(err);
        //             }
        //             resolve(rows[0]); // Return first object
        //         });
        //     });
        // }
    
    

//correct code on proper work csv
        
static getSalesReport = () => {
    const query = `WITH RECURSIVE split_invoice AS (
    -- Base Case: Extract the first product and its quantity
    SELECT 
        id, 
        invoice_number, 
        customer_id,
        JSON_UNQUOTE(JSON_EXTRACT(product_id, '$[0]')) AS product_id,
        JSON_UNQUOTE(JSON_EXTRACT(quantity, '$[0]')) AS quantity,
        JSON_REMOVE(product_id, '$[0]') AS remaining_products,
        JSON_REMOVE(quantity, '$[0]') AS remaining_quantities,
        1 AS level
    FROM invoice_table

    UNION ALL

    -- Recursive Step: Extract remaining products and quantities
    SELECT 
        id, 
        invoice_number, 
        customer_id,
        JSON_UNQUOTE(JSON_EXTRACT(remaining_products, '$[0]')),
        JSON_UNQUOTE(JSON_EXTRACT(remaining_quantities, '$[0]')),
        JSON_REMOVE(remaining_products, '$[0]'),
        JSON_REMOVE(remaining_quantities, '$[0]'),
        level + 1
    FROM split_invoice
    WHERE JSON_LENGTH(remaining_products) > 0
)

-- Generate the Sales Report
SELECT 
    p.product_name,
    SUM(s.quantity) AS total_quantity_sold,
    p.product_price,
    SUM(s.quantity * p.product_price) AS total_sales_amount
FROM split_invoice s
JOIN product_table p ON p.id = s.product_id
GROUP BY p.product_name, p.product_price
ORDER BY p.product_name;

    `;

    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Get Total Sales Summary
static getTotalSalesSummary(startDate, endDate) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                SUM(s.total_price) AS final_sales_value 
            FROM sales_table s
            WHERE s.sale_date BETWEEN ? AND ?
        `;

        db.query(query, [startDate, endDate], (err, rows) => {
            if (err) {
                console.error("Error fetching total sales summary:", err);
                return reject(err);
            }
            resolve(rows[0]); // Return the first row containing total sales
        });
    });
}

//changes3
//top 5 most selling products for the given period
    
static getMostSoldMedicines(interval) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
            p.product_name,
            p.product_price,
            SUM(JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']'))) AS total_quantity_sold,
            ROUND(
                (
                    SUM(JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']'))) / 
                    (
                        SELECT SUM(JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']')))
                        FROM invoice_table i
                        CROSS JOIN (
                            SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                        ) idx
                        WHERE i.invoice_created_at >= NOW() - INTERVAL ${interval}
                    )
                ) * 100, 
                2
            ) AS percentage_of_total_sales,
            (SUM(JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']'))) * p.product_price) AS total_sales_amount
        FROM 
            invoice_table i
        CROSS JOIN (
            SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
        ) idx
        JOIN 
            product_table p
            ON JSON_VALUE(i.product_id, CONCAT('$[', idx.idx, ']')) = p.id
        WHERE 
            i.invoice_created_at >= NOW() - INTERVAL ${interval}
        GROUP BY 
            p.product_name, p.product_price
        ORDER BY 
            total_quantity_sold DESC
        LIMIT 5;  -- Fetch only the top 5 products
        `;

        db.query(query, (err, results) => {
            console.log("Top 5 most sold medicines query results:", results);
            if (err) {
                console.error("Database error during fetching most sold medicines:", err);
                return reject(err);
            }

            if (results.length === 0) {
                resolve({
                    message: `No sales data found in the last ${interval}`,
                    data: [],
                });
            } else {
                resolve({
                    message: `Top 5 most sold medicines in the last ${interval}`,
                    data: results,
                });
            }
        });
    });
}




    static getAllSoldProductsWithInvoices(startDate, endDate, interval, productName, categoryName) {
            return new Promise((resolve, reject) => {
                let whereClause = "WHERE i.payment_status = 'Paid'";
                let params = [];
        
                if (startDate && endDate) {
                    whereClause += " AND DATE(i.invoice_created_at) BETWEEN ? AND ?";
                    params.push(startDate, endDate);
                } else if (interval) {
                    whereClause += " AND DATE(i.invoice_created_at) >= DATE(NOW() - INTERVAL ? DAY)";
                    params.push(interval);
                }
        
                if (productName) {
                    whereClause += " AND p.product_name LIKE ?";
                    params.push(`%${productName}%`);
                }
        
                // Correct the category filter (use category_name instead of product_category ID)
                if (categoryName) {
                    whereClause += " AND pc.category_name LIKE ?";
                    params.push(`%${categoryName}%`);
                }
        
                const query = `
                    SELECT 
                        i.id AS invoice_id, 
                        i.invoice_number,
                        i.customer_id,
                        i.invoice_created_at,
                        JSON_VALUE(i.product_id, CONCAT('$[', idx.idx, ']')) AS product_id,
                        JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']')) AS quantity_sold,
                        JSON_VALUE(i.total_price, CONCAT('$[', idx.idx, ']')) AS total_price,
                        JSON_VALUE(i.discount, CONCAT('$[', idx.idx, ']')) AS discount,
                        JSON_VALUE(i.final_price, CONCAT('$[', idx.idx, ']')) AS final_price,
                        i.payment_status,
                        p.product_name,
                        pc.category_name -- Fetch actual category name from product_category table
                    FROM 
                        invoice_table i
                    CROSS JOIN (
                        SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                    ) idx
                    JOIN 
                        product_table p ON JSON_VALUE(i.product_id, CONCAT('$[', idx.idx, ']')) = p.id
                    JOIN 
                        product_category pc ON p.product_category = pc.id -- Correct join with category table
                    ${whereClause}
                    ORDER BY 
                        i.invoice_created_at DESC, i.id;
                `;
        
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error("Database error during fetching all sold products:", err);
                        return reject(err);
                    }
        
                    resolve({
                        message: results.length ? "All sold products with invoice details for the given filters" : "No sales data found for the given filters",
                        data: results,
                    });
                });
            });
        }
    
    //correct code with pagination
    static getAllSoldProductsWithInvoicespage(startDate, endDate, interval, productName, categoryName, limit = 10, offset = 0) {
        return new Promise((resolve, reject) => {
            let whereClause = "WHERE i.payment_status = 'Paid'";
            let params = [];
    
            if (startDate && endDate) {
                whereClause += " AND DATE(i.invoice_created_at) BETWEEN ? AND ?";
                params.push(startDate, endDate);
            } else if (interval) {
                whereClause += " AND DATE(i.invoice_created_at) >= DATE(NOW() - INTERVAL ? DAY)";
                params.push(interval);
            }
    
            if (productName) {
                whereClause += " AND p.product_name LIKE ?";
                params.push(`%${productName}%`);
            }
    
            if (categoryName) {
                whereClause += " AND pc.category_name LIKE ?";
                params.push(`%${categoryName}%`);
            }
    
            // ✅ Total count query (before pagination)
            const totalCountQuery = `
                SELECT COUNT(*) AS totalCount
                FROM invoice_table i
                JOIN product_table p ON JSON_VALUE(i.product_id, '$[0]') = p.id
                JOIN product_category pc ON p.product_category = pc.id
                ${whereClause}
            `;
    
            // ✅ Main query with pagination & descending order
            const query = `
                SELECT 
                    i.id AS invoice_id, 
                    i.invoice_number,
                    i.customer_id,
                    i.invoice_created_at,
                    JSON_VALUE(i.product_id, CONCAT('$[', idx.idx, ']')) AS product_id,
                    JSON_VALUE(i.quantity, CONCAT('$[', idx.idx, ']')) AS quantity_sold,
                    JSON_VALUE(i.total_price, CONCAT('$[', idx.idx, ']')) AS total_price,
                    JSON_VALUE(i.discount, CONCAT('$[', idx.idx, ']')) AS discount,
                    JSON_VALUE(i.final_price, CONCAT('$[', idx.idx, ']')) AS final_price,
                    i.payment_status,
                    p.product_name,
                    pc.category_name
                FROM 
                    invoice_table i
                CROSS JOIN (
                    SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
                ) idx
                JOIN 
                    product_table p ON JSON_VALUE(i.product_id, CONCAT('$[', idx.idx, ']')) = p.id
                JOIN 
                    product_category pc ON p.product_category = pc.id
                ${whereClause}
                ORDER BY 
                    i.invoice_created_at DESC, i.id DESC
                LIMIT ? OFFSET ?
            `;
    
            // ✅ Add limit & offset to parameters
            params.push(parseInt(limit), parseInt(offset));
    
            db.query(totalCountQuery, params.slice(0, -2), (err, countResult) => {
                if (err) {
                    console.error("Database error while counting invoices:", err);
                    return reject(err);
                }
    
                const totalCount = countResult[0]?.totalCount || 0;
    
                db.query(query, params, (err, results) => {
                    if (err) {
                        console.error("Database error while fetching invoices:", err);
                        return reject(err);
                    }
    
                    resolve({
                        message: results.length ? "Fetched sales invoices with pagination" : "No sales data found",
                        totalCount: totalCount,
                        totalPages: Math.ceil(totalCount / limit),
                        currentPage: Math.floor(offset / limit) + 1,
                        data: results
                    });
                });
            });
        });
    }
    


    





}







module.exports = Invoice;











