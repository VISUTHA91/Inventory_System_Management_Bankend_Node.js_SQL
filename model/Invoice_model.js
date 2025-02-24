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


    // static async checkCustomerExists(customerId) {
    //     // Use 'customer_id' in the query, not 'id'
    //     const query = 'SELECT customer_id FROM customer_table WHERE customer_id = ?';
    //     const [results] = await db.promise().query(query, [phone]);
    //     return results.length > 0; // returns true if the customer exists
    // };
    static async checkCustomerExists(phone) {
        try {
            const [rows] = await db.promise().query(
                "SELECT customer_id FROM customer_table WHERE phone = ? ORDER BY customer_id DESC LIMIT 1",
                [phone]
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
        payment_status
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
        discount, final_price, payment_status
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ? )
`;

    const [result] = await db.promise().query(query, [
        invoice_number,
        customer_id,
        JSON.stringify(product_id), // Convert array to JSON string
        JSON.stringify(quantity), // Convert array to JSON string
        total_price,
        JSON.stringify(discount), // Store discount as a JSON array
        final_price,       
        payment_status
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
        const { customer_id, products, payment_status } = data;

        // Calculate the discount for each product
        let totalPrice = 0;
        let totalGST = 0;
        const productDiscounts = [];

        // Validate products and calculate totals
        for (const item of products) {
            const productDetails = await Invoice.checkProductExists(item.product_id);
            if (!productDetails) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }

            if (productDetails.product_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product with ID ${item.product_id}`);
            }

            // Calculate the price and GST for this product
            const productTotal = productDetails.selling_price * item.quantity;
            const productGST = (productTotal * productDetails.GST) / 100;
            const productDiscount = (productTotal * productDetails.product_discount) / 100;

            // Add to totals
            totalPrice += productTotal;
            totalGST = parseFloat((totalGST + productGST).toFixed(2));

            // Store individual product discount
            productDiscounts.push(parseFloat(productDiscount.toFixed(2))); // Rounded to 2 decimals
        }

        // Calculate total discount
        const totalDiscount = productDiscounts.reduce((sum, discount) => sum + discount, 0);

        // Calculate final price after adding GST and subtracting total discount
        const finalPrice = parseFloat((totalPrice + totalGST - totalDiscount).toFixed(2));

        // Prepare query to update the invoice
        const query = `
            UPDATE invoice_table 
            SET customer_id = ?, 
                product_id = ?, 
                quantity = ?, 
                total_price = ?, 
                discount = ?, 
                final_price = ?, 
                payment_status = ?, 
                invoice_updated_at = NOW()
            WHERE id = ?
        `;

        const [result] = await db.promise().query(query, [
            customer_id,
            JSON.stringify(products.map((p) => p.product_id)), // Convert product IDs to JSON string
            JSON.stringify(products.map((p) => p.quantity)), // Convert quantities to JSON string
            totalPrice,
            JSON.stringify(productDiscounts), // Convert product discounts to JSON string
            finalPrice,
            payment_status,
            invoiceId,
        ]);

        return result.affectedRows > 0; // Return true if the update was successful
    }



    // static getInvoiceDetails(invoice_number) {
    //     return new Promise((resolve, reject) => {
    //         const query = `
    //             SELECT i.*, c.*, p.product_name 
    //             FROM invoice_table i 
    //             JOIN customer_table c ON i.customer_id = c.customer_id
    //             JOIN product_table p ON i.product_id = p.id
    //             WHERE i.invoice_number = ?
    //         `;

    //         console.log("Executing query:", query, "with invoice_number:", invoice_number);

    //         db.promise().query(query, [invoice_number])
    //             .then(([results]) => {
    //                 console.log("Query results:", results);
    //                 resolve(results); // Resolve with the results (invoice details)
    //             })
    //             .catch((err) => {
    //                 console.error('Database error during getting invoice details:', err);
    //                 reject(err); // Reject with error
    //             });
    //     });
    // }




   //getbyid   i.quantity AS invoice_quantity, 

    static getInvoiceById(id) {
        return new Promise((resolve, reject) => {
            const invoiceQuery = `
                SELECT 
                    i.id AS invoice_id,
                    i.invoice_number,
                    i.customer_id,                   
                    REPLACE(REPLACE(i.quantity, '[', ''), ']', '') AS invoice_quantity,
                    i.total_price,
                    REPLACE(REPLACE(i.discount, '[', ''), ']', '') AS discount,
                    i.final_price,
                    i.invoice_created_at,
                    i.invoice_updated_at,
                    c.customer_name,
                    c.phone,
                    c.email,
                    c.address,
                    CONCAT('[', GROUP_CONCAT(
                        CONCAT(
                            '{"product_id":', p.id,
                            ',"product_name":', JSON_QUOTE(p.product_name),
                            ',"product_batch_no":', JSON_QUOTE(p.product_batch_no),
                            ',"selling_price":', p.selling_price,
                            ',"product_quantity":', p.product_quantity,
                            ',"product_gst":', p.GST,
                            ',"product_price":',p.product_price,
                            '}'
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
            db.query(invoiceQuery, [id], (err, invoiceResults) => {
                if (err) {
                    return reject({ message: 'Error fetching invoice details.', error: err });
                }

                if (invoiceResults.length === 0) {
                    return reject({ message: `Invoice with ID ${id} not found.` });
                }

                const invoice = invoiceResults[0];
                invoice.products = JSON.parse(invoice.products || '[]');

                // Fetch shop details
                db.query(shopQuery, [id], (err, shopResults) => {
                    if (err) {
                        return reject({ message: 'Error fetching shop details.', error: err });
                    }

                    if (shopResults.length === 0) {
                        return reject({ message: `Shop details for Invoice ID ${id} not found.` });
                    }

                    const shop = shopResults[0];
                    resolve({ ...invoice, shop });
                });
            });
        });
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


    
        // 🔹 Fetch Detailed Invoice Data (Promise-Based)
        static getInvoiceList(startDate, endDate, interval, productName, categoryName) {
            return new Promise((resolve, reject) => {
                let query = `
                    SELECT i.*, c.customer_name
                    FROM invoice_table i
                    JOIN customer_table c ON i.customer_id = c.customer_id
                    WHERE 1=1
                `;
    
                let values = [];
    
                if (startDate && endDate) {
                    query += ` AND invoice_created_at BETWEEN ? AND ?`;
                    values.push(startDate, endDate);
                }
                if (interval) {
                    query += ` AND invoice_created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`;
                    values.push(interval);
                }
                if (productName) {
                    query += ` AND product_name LIKE ?`;
                    values.push(`%${productName}%`);
                }
                if (categoryName) {
                    query += ` AND category_name LIKE ?`;
                    values.push(`%${categoryName}%`);
                }
    
                db.query(query, values, (err, rows) => {
                    if (err) {
                        console.error("Error fetching invoice list:", err);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        }
    
        // 🔹 Fetch Total Sales Summary (Promise-Based)
        static getTotalSales() {
            return new Promise((resolve, reject) => {
                const query = `SELECT SUM(final_price) AS total_sales, COUNT(invoice_id) AS total_invoices FROM invoice_table`;
    
                db.query(query, (err, rows) => {
                    if (err) {
                        console.error("Error fetching total sales:", err);
                        return reject(err);
                    }
                    resolve(rows[0]); // Return first object
                });
            });
        }
    
    
  


    


//correcct code without pagination
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
            total_quantity_sold DESC;
        `;

        db.query(query, (err, results) => {
            console.log("Most sold medicines query results:", results);
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
                    message: `Most sold medicines in the last ${interval}`,
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
    
//under performance product
    
    static getLeastSoldMedicines(interval) {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
               SELECT 
    p.product_name, 
    p.product_price, 
    COALESCE(SUM(CAST(JSON_VALUE(i.quantity, CONCAT('$[', idx_values.idx, ']')) AS UNSIGNED)), 0) AS total_quantity_sold, 
    ROUND(
        ( COALESCE(SUM(CAST(JSON_VALUE(i.quantity, CONCAT('$[', idx_values.idx, ']')) AS UNSIGNED)), 0) /
            (SELECT COALESCE(SUM(CAST(JSON_VALUE(i2.quantity, CONCAT('$[', idx_values.idx, ']')) AS UNSIGNED)), 1) 
             FROM invoice_table i2 
             CROSS JOIN (SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) idx_values
             WHERE i2.invoice_created_at >= NOW() - INTERVAL 7 DAY )
        ) * 100, 2
    ) AS percentage_of_total_sales, 
    (COALESCE(SUM(CAST(JSON_VALUE(i.quantity, CONCAT('$[', idx_values.idx, ']')) AS UNSIGNED)), 0) * p.product_price) AS total_sales_amount 
FROM product_table p 
LEFT JOIN (
    SELECT i.*, idx_values.idx
    FROM invoice_table i  
    CROSS JOIN (SELECT 0 AS idx UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) idx_values
) AS i ON JSON_VALUE(i.product_id, CONCAT('$[', i.idx, ']')) = p.id
WHERE (i.invoice_created_at >= NOW() - INTERVAL 7 DAY OR i.invoice_created_at IS NULL)
GROUP BY p.product_name, p.product_price
ORDER BY total_quantity_sold DESC 
LIMIT 25;

            `;
    
            db.query(query, (err, results) => {
                console.log("Least sold medicines query results:", results);
                if (err) {
                    console.error("Database error during fetching least sold medicines:", err);
                    return reject(err);
                }
    
                if (results.length === 0) {
                    resolve({
                        message: `No sales data found in the last ${interval}`,
                        data: [],
                    });
                } else {
                    resolve({
                        message: `Least sold medicines in the last ${interval}`,
                        data: results,
                    });
                }
            });
        });
    }
    





}







module.exports = Invoice;











