const db = require("../config/Database");

// models/productModel.js

class Product {
    

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
                p.is_deleted = 0;`; // Fetch only products not soft-deleted
    
            db.query(query, (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(new Error('Error fetching products from the database'));
                }
    
                if (!result || result.length === 0) {
                    return resolve([]); // Return an empty array if no products found
                }
    
                // Update stock_status based on product_quantity
                const updatedProducts = result.map(product => {
                    let stockStatus = 'Available';
                    if (product.product_quantity === 0) {
                        stockStatus = 'Out of Stock';
                    } else if (product.product_quantity < 20) {
                        stockStatus = 'Low Stock';
                    }
                    return { ...product, stock_status: stockStatus };
                });
    
                resolve(updatedProducts); // Return updated product data
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


                // static findByAttributes(productData) {
                //     console.log(productData.product_name,productData.product_batch_no,productData.expiry_date);
                //     return new Promise((resolve, reject) => {
                //         const query = `
                //             SELECT * FROM product_table 
                //             WHERE product_name = ? AND product_batch_no = ? AND expiry_date = ?
                //         `;
                //         db.query(query, [
                //             productData.product_name,
                //             productData.product_batch_no,
                //             productData.expiry_date
                //         ], (err, result) => {
                //             if (err) {console.log(err); return reject(err)};
                //             resolve(result.length > 0 ? result[0] : null);
                //         });
                //     });
                // }



                static findByAttributes(productData) {
                    // console.log('Input Data:', productData.product_name, productData.product_batch_no, productData.expiry_date);
                
                    return new Promise((resolve, reject) => {
                        const query = `
                            SELECT * FROM product_table 
                            WHERE LOWER(product_name) = LOWER(?) 
                              AND LOWER(product_batch_no) = LOWER(?) 
                              AND DATE(expiry_date) = DATE(?)
                        `;
                        db.query(query, [
                            productData.product_name.trim(),
                            productData.product_batch_no.trim(),
                            productData.expiry_date
                        ], (err, result) => {
                            if (err) {
                                console.error('Database Error:', err);
                                return reject(err);
                            }
                            resolve(result.length > 0 ? result[0] : null);
                        });
                    });
                }
                




            
                static updateQuantity(product_id, new_quantity, stock_status) {
                    return new Promise((resolve, reject) => {
                        const query = `
                            UPDATE product_table 
                            SET product_quantity = ?, stock_status = ?, updated_at = NOW()
                            WHERE id = ?
                        `;
                        db.query(query, [new_quantity, stock_status, product_id], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                }
            
                static create(productData) {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO product_table 
                            (product_name, product_category, product_quantity, product_price, product_description,
                            generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
                            brand_name, selling_price, GST, stock_status, created_at, updated_at, deleted_at, is_deleted)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0)
                        `;
                        db.query(query, [
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
                            productData.stock_status
                        ], (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                    });
                }
               
            
            
    
    


//my old correct code

    // static async bulkCreate(productsData) {
    //     console.log("Attempting to bulk insert products:", productsData);
    //     console.log('Request Body:', req.body)


    //     try {
    //         // Prepare an array to store processed product data
    //         const processedProducts = [];

    //         for (const product of productsData) {
    //             // Fetch category ID
    //             const [categoryResult] = await db.promise().query(
    //                 `SELECT id FROM product_category WHERE category_name = ? LIMIT 1`,
    //                 [product.product_category]
    //             );
    //             const categoryID = categoryResult.length ? categoryResult[0].id : null;

    //             // Fetch supplier ID
    //             const [supplierResult] = await db.promise().query(
    //                 `SELECT supplier_id FROM supplier WHERE company_name = ? LIMIT 1`,
    //                 [product.supplier]
    //             );
    //             const supplierID = supplierResult.length ? supplierResult[0].supplier_id : null;

    //             // Push processed product into array
    //             processedProducts.push([
    //                 product.product_name,
    //                 categoryID, // Use fetched category ID
    //                 product.product_quantity,
    //                 product.product_price,
    //                 product.product_description,
    //                 product.generic_name,
    //                 product.product_batch_no,
    //                 product.expiry_date,
    //                 product.product_discount,
    //                 product.supplier_price,
    //                 supplierID, // Use fetched supplier ID
    //                 product.brand_name,
    //                 product.selling_price,
    //                 product.GST,
    //                 product.stock_status,
    //             ]);
    //         }

    //         // Bulk insert processed products
    //         const query = `
    //         INSERT INTO product_table (
    //             product_name, product_category, product_quantity, product_price, product_description,
    //             generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
    //             brand_name, selling_price, GST, stock_status
    //         ) VALUES ?
    //     `;

    //         const [result] = await db.promise().query(query, [processedProducts]);

    //         console.log("Bulk insert successful:", result);
    //         return result;
    //     } catch (err) {
    //         console.error("Error during bulk insert:", err);
    //         throw err;
    //     }
    // }



 

  // Bulk insert products
  static async bulkCreate(productData) {
    try {
        const query = `
            INSERT INTO product_table (
                product_name, product_category, product_quantity, product_price, product_description,
                generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
                brand_name, selling_price, GST, stock_status
            ) VALUES ?
        `;

        
        const [result] = await db.promise().query(query, [productData]);
        // console.log(productsData);
        return result;
    } catch (err) {
        throw err;
    }
}










   


    static update(id, updatedData) {
        return new Promise((resolve, reject) => {
            // Ensure updatedData values are not undefined or null
            const productPrice = updatedData.product_price || null; // Use null as fallback
            const supplierPrice = updatedData.supplier_price || null;
            const productDiscount = updatedData.product_discount || null;
    
            const query = `
                UPDATE product_table 
                SET 
                    product_name = ?, 
                    product_category = ?, 
                    product_quantity = ?, 
                    product_price = CASE 
                        WHEN ? IS NULL THEN product_price 
                        ELSE ? 
                    END, 
                    product_description = ?, 
                    generic_name = ?, 
                    product_batch_no = ?, 
                    expiry_date = ?, 
                    product_discount = CASE 
                        WHEN ? IS NULL THEN product_discount 
                        ELSE ? 
                    END, 
                    supplier_price = CASE 
                        WHEN ? IS NULL THEN supplier_price 
                        ELSE ? 
                    END,
                    supplier = ?, 
                    brand_name = ?, 
                    selling_price = ?, 
                    GST = ?, 
                    stock_status = CASE 
                        WHEN ? = 0 THEN 'Out of Stock'
                        WHEN ? < 20 THEN 'Low Stock'
                        ELSE 'Available'
                    END,
                    updated_at = NOW()
                WHERE id = ? AND is_deleted = 0`;
    
            db.query(query, [
                updatedData.product_name,
                updatedData.product_category,
                updatedData.product_quantity,
                productPrice, productPrice, // Handle product_price
                updatedData.product_description,
                updatedData.generic_name,
                updatedData.product_batch_no,
                updatedData.expiry_date,
                productDiscount, productDiscount, // Handle product_discount
                supplierPrice, supplierPrice, // Handle supplier_price
                updatedData.supplier,
                updatedData.brand_name,
                updatedData.selling_price,
                updatedData.GST,
                updatedData.product_quantity,
                updatedData.product_quantity,
                id
            ], (err, result) => {
                if (err) {
                    console.error('Error in query:', err);
                    return reject(err);
                }
                resolve(result);
    
                // Log for debugging
                console.log('Updated Data:', {
                    productPrice,
                    supplierPrice,
                    productDiscount,
                });
            });
        });
    }
    
    
    
    
    
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



















