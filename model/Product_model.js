const db = require('../config/Database');

// models/productModel.js

class Product {
    // Fetch all products (excluding soft-deleted products)

    static fetchAll() {
        return new Promise((resolve, reject) => {
            const query = `
            SELECT 
                p.id,
                p.product_name,
                c.category_name AS product_category,
                p.product_quantity,
                p.product_price,
                p.product_description,
                p.generic_name,
                p.product_batch_no,
                p.expiry_date,
                p.product_discount,
                p.supplier_price,
                s.company_name AS supplier,
                p.brand_name,
                p.selling_price,
                p.GST,
                p.stock_status,
                p.created_at,
                p.updated_at,
                p.deleted_at,
                p.is_deleted
            FROM 
                product_table p
            JOIN 
                product_category c ON p.product_category = c.id
            JOIN 
                supplier s ON p.supplier = s.supplier_id
            WHERE 
                p.is_deleted = 0;`; // Only fetch products that are not soft-deleted

            db.query(query, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject({ message: 'Error fetching products', error: err });
                }
                if (result.length === 0) {
                    return reject({ message: 'No products found' });
                }
                resolve(result); // Resolve with the fetched product data
            });
        });
    }





    static findById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.id,
                    p.product_name,
                    c.category_name AS product_category, -- Fetch category name
                    p.product_quantity,
                    p.product_price,
                    p.product_description,
                    p.generic_name,
                    p.product_batch_no,
                    p.expiry_date,
                    p.product_discount,
                    p.supplier_price,
                    s.company_name AS supplier_name, -- Fetch supplier's company name
                    p.brand_name,
                    p.selling_price,
                    p.GST,
                    p.stock_status,
                    p.created_at,
                    p.updated_at,
                    p.deleted_at,
                    p.is_deleted
                FROM 
                    product_table p
                JOIN 
                    product_category c ON p.product_category = c.id -- Join with product_category table
                JOIN 
                    supplier s ON p.supplier = s.supplier_id -- Join with supplier table
                WHERE 
                    p.id = ? AND p.is_deleted = 0; -- Filter by product ID and exclude soft-deleted products
            `;
            db.query(query, [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]); // Return the first result (single product)
                }
            });
        });
    }



    // Insert a single product into the database




    static create(productData) {
        return new Promise((resolve, reject) => {
            // Calculate the stock status before the query
            let stockStatus = 'Available'; // Default to Available
            if (productData.product_quantity === 0) {
                stockStatus = 'Out of Stock';
            } else if (productData.product_quantity <= 20) {
                stockStatus = 'Low Stock';
            }

            // Log the stock status for debugging
            console.log('Calculated stock_status:', stockStatus);

            // Step 1: Check if the supplier exists in the supplier table
            const checkSupplierQuery = `SELECT * FROM supplier WHERE supplier_id = ?`;

            db.query(checkSupplierQuery, [productData.supplier], (err, result) => {
                if (err) {
                    console.error('Database error during supplier check:', err);
                    return reject(err); // Reject the promise with the error
                }

                // If no supplier is found, reject with an error message
                if (result.length === 0) {
                    return reject({ message: "Supplier does not exist in the database" });
                }


                // Step 2: If supplier exists, proceed to insert the product into the product_table
                const insertProductQuery = `
                    INSERT INTO product_table 
                    (product_name, product_category, product_quantity, product_price, product_description, 
                    generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier, 
                    brand_name, selling_price, GST, stock_status, created_at, updated_at, deleted_at, is_deleted)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0)
                `;

                db.query(insertProductQuery, [
                    productData.product_name,
                    productData.product_category,
                    productData.product_quantity,
                    productData.product_price,
                    productData.product_description,
                    productData.generic_name,
                    productData.product_batch_no,
                    productData.expiry_date,
                    productData.product_discount,
                    productData.supplier_price,
                    productData.supplier,
                    productData.brand_name,
                    productData.selling_price,
                    productData.GST,
                    stockStatus  // Use the pre-calculated stock status
                ], (err, result) => {
                    if (err) {
                        console.error('Database error during product insertion:', err);
                        return reject(err); // Reject the promise with the error
                    }
                    resolve(result); // Resolve the promise with the result of the insert query
                });
            });
        });
    }





    // Bulk insert multiple products into the database   

    static async bulkCreate(productsData) {
        console.log("Attempting to bulk insert products:", productsData);

        try {
            // Prepare an array to store processed product data
            const processedProducts = [];

            for (const product of productsData) {
                // Fetch category ID
                const [categoryResult] = await db.promise().query(
                    `SELECT id FROM product_category WHERE category_name = ? LIMIT 1`,
                    [product.product_category]
                );
                const categoryID = categoryResult.length ? categoryResult[0].id : null;

                // Fetch supplier ID
                const [supplierResult] = await db.promise().query(
                    `SELECT supplier_id FROM supplier WHERE company_name = ? LIMIT 1`,
                    [product.supplier]
                );
                const supplierID = supplierResult.length ? supplierResult[0].supplier_id : null;

                // Push processed product into array
                processedProducts.push([
                    product.product_name,
                    categoryID, // Use fetched category ID
                    product.product_quantity,
                    product.product_price,
                    product.product_description,
                    product.generic_name,
                    product.product_batch_no,
                    product.expiry_date,
                    product.product_discount,
                    product.supplier_price,
                    supplierID, // Use fetched supplier ID
                    product.brand_name,
                    product.selling_price,
                    product.GST,
                    product.stock_status,
                ]);
            }

            // Bulk insert processed products
            const query = `
            INSERT INTO product_table (
                product_name, product_category, product_quantity, product_price, product_description,
                generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
                brand_name, selling_price, GST, stock_status
            ) VALUES ?
        `;

            const [result] = await db.promise().query(query, [processedProducts]);

            console.log("Bulk insert successful:", result);
            return result;
        } catch (err) {
            console.error("Error during bulk insert:", err);
            throw err;
        }
    }





    //it is correct code
    // static bulkCreate(productsData) {
    //     console.log("Attempting to bulk insert products:", productsData);

    //     return new Promise((resolve, reject) => {
    //         // Constructing values for bulk insert
    //         const values = productsData.map(product => [
    //             product.product_name,
    //             product.product_category,
    //             product.product_quantity,
    //             product.product_price,
    //             product.product_description,
    //             product.generic_name,
    //             product.product_batch_no,
    //             product.expiry_date,
    //             product.product_discount,
    //             product.supplier_price,
    //             product.supplier,
    //             product.brand_name,
    //             product.selling_price,
    //             product.GST,
    //             product.stock_status
    //         ]);

    //         // SQL query for bulk insert with JOINs (using SELECT for category and supplier)
    //         const query = `
    //             INSERT INTO product_table (
    //                 product_name, product_category, product_quantity, product_price, product_description,
    //                 generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
    //                 brand_name, selling_price, GST, stock_status
    //             )
    //             SELECT ?, 
    //                    (SELECT id FROM product_category WHERE category_name = ? LIMIT 1) AS product_category, 
    //                    ?, ?, ?, 
    //                    ?, ?, ?, ?, ?, 
    //                    (SELECT supplier_id FROM supplier WHERE company_name = ? LIMIT 1) AS supplier, 
    //                    ?, ?, ?, ?
    //         `;

    //         // Flatten the values array to pass them as individual query parameters
    //         const flatValues = values.flat();

    //         // Perform bulk insert for all products in the data array
    //         db.query(query, flatValues, (err, result) => {
    //             if (err) {
    //                 console.error("Database error during bulk insert:", err);
    //                 return reject(err);
    //             }
    //             console.log("Bulk insert successful:", result);
    //             resolve(result);
    //         });
    //     });
    // }























    // Update an existing product by ID


    static update(id, updatedData) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE product_table 
                SET 
                    product_name = ?, 
                    product_category = ?, 
                    product_quantity = ?, 
                    product_price = ?, 
                    product_description = ?, 
                    generic_name = ?, 
                    product_batch_no = ?, 
                    expiry_date = ?, 
                    product_discount = ?, 
                    supplier_price = ?,
                    supplier = ?, 
                    brand_name = ?, 
                    selling_price = ?, 
                    GST = ?, 
                    stock_status = CASE 
                        WHEN ? = 0 THEN 'Out of Stock'
                        WHEN ? <= 20 THEN 'Low Stock'
                        ELSE 'Available'
                    END
                WHERE id = ? AND is_deleted = 0`;

            db.query(query, [
                updatedData.product_name,
                updatedData.product_category,
                updatedData.product_quantity,
                updatedData.product_price,
                updatedData.product_description,
                updatedData.generic_name,
                updatedData.product_batch_no,
                updatedData.expiry_date,
                updatedData.product_discount,
                updatedData.supplier_price,
                updatedData.supplier,
                updatedData.brand_name,
                updatedData.selling_price,
                updatedData.GST,
                updatedData.product_quantity,
                updatedData.product_quantity,
                id
            ], (err, result) => {
                if (err) reject(err);

                resolve(result);
            });
        });
    }

    // Soft delete a product by setting the `is_deleted` flag
    static softDeleteProduct(id) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE product_table SET is_deleted = 1, deleted_at = NOW() WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    console.error('Error during soft delete:', err);
                    return reject({ message: 'Error soft deleting the product', error: err });
                }
                resolve(results);
            });
        });
    }

    // Permanently delete a product from the database
    static moveToPermanentDelete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM product_table WHERE id = ? AND is_deleted = 1';
            db.query(query, [id], (err, result) => {
                if (err) {
                    console.error('Error during permanent delete:', err);
                    return reject({ message: 'Error permanently deleting the product', error: err });
                }
                resolve(result);
            });
        });
    }


    // Fetch all soft-deleted products
    static getSoftDeletedProducts() {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM product_table WHERE is_deleted = 1';
            db.query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    }


    // Restore a soft-deleted product
    static restore(productId) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE product_table 
                SET is_deleted = 0, deleted_at = NULL 
                WHERE id = ? AND is_deleted = 1
            `;
            db.query(query, [productId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = Product;



















