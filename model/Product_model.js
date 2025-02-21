const db = require("../config/Database");

// models/productModel.js
class Product {


   

    static fetchAllpro() {
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
                p.MFD,
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
                p.is_deleted = 0
            ORDER BY 
                p.expiry_date ASC;`; // Order by expiry_date ascending (soonest expiry first)
    
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
    


    // static fetchAll(page = 1, limit = 10) {
    //     return new Promise((resolve, reject) => {
    //         const offset = (page - 1) * limit; // Calculate offset for pagination
    
    //         // Query to fetch paginated products
    //         const query = `
    //         SELECT 
    //             p.id, p.product_name, c.category_name AS product_category, p.product_quantity, 
    //             p.product_price, p.product_description, p.generic_name, 
    //             p.product_batch_no, p.expiry_date, p.product_discount, p.supplier_price, 
    //             s.company_name AS supplier, p.brand_name, p.selling_price, p.GST, 
    //             p.stock_status, p.MFD, p.created_at, p.updated_at, p.deleted_at, p.is_deleted
    //         FROM 
    //             product_table p
    //         JOIN 
    //             product_category c ON p.product_category = c.id
    //         JOIN 
    //             supplier s ON p.supplier = s.supplier_id
    //         WHERE 
    //             p.is_deleted = 0
    //         LIMIT ? OFFSET ?`; // Limit and Offset for Pagination
    
    //         // Query to get total product count
    //         const countQuery = `SELECT COUNT(*) AS total_products FROM product_table WHERE is_deleted = 0`;
    
    //         db.query(countQuery, [], (countErr, countResult) => {
    //             if (countErr) {
    //                 console.error('Database error (count):', countErr);
    //                 return reject(new Error('Error fetching total product count'));
    //             }
    
    //             const totalProducts = countResult[0].total_products; // Extract total count
    
    //             db.query(query, [limit, offset], (err, result) => {
    //                 if (err) {
    //                     console.error('Database error (products):', err);
    //                     return reject(new Error('Error fetching products from the database'));
    //                 }
    
    //                 if (!result || result.length === 0) {
    //                     return resolve({ products: [], totalProducts });
    //                 }
    
    //                 // Update stock_status based on product_quantity
    //                 const updatedProducts = result.map(product => {
    //                     let stockStatus = 'Available';
    //                     if (product.product_quantity === 0) {
    //                         stockStatus = 'Out of Stock';
    //                     } else if (product.product_quantity < 20) {
    //                         stockStatus = 'Low Stock';
    //                     }
    //                     return { ...product, stock_status: stockStatus };
    //                 });
    
    //                 resolve({ products: updatedProducts, totalProducts }); // Return updated product data and count
    //             });
    //         });
    //     });
    // }


    static fetchAll(page = 1, limit = 10) {
        return new Promise((resolve, reject) => {
            const offset = (page - 1) * limit; // Calculate offset for pagination
    
            // Query to fetch paginated products sorted by expiry_date
            const query = `
            SELECT 
                p.id, p.product_name, c.category_name AS product_category, p.product_quantity, 
                p.product_price, p.product_description, p.generic_name, 
                p.product_batch_no, p.expiry_date, p.product_discount, p.supplier_price, 
                s.company_name AS supplier, p.brand_name, p.selling_price, p.GST, 
                p.stock_status, p.MFD, p.created_at, p.updated_at, p.deleted_at, p.is_deleted
            FROM 
                product_table p
            JOIN 
                product_category c ON p.product_category = c.id
            JOIN 
                supplier s ON p.supplier = s.supplier_id
            WHERE 
                p.is_deleted = 0
            ORDER BY 
                p.expiry_date ASC  -- Sorting products by expiry date (soonest first)
            LIMIT ? OFFSET ?`; // Limit and Offset for Pagination
    
            // Query to get total product count
            const countQuery = `SELECT COUNT(*) AS total_products FROM product_table WHERE is_deleted = 0`;
    
            db.query(countQuery, [], (countErr, countResult) => {
                if (countErr) {
                    console.error('Database error (count):', countErr);
                    return reject(new Error('Error fetching total product count'));
                }
    
                const totalProducts = countResult[0].total_products; // Extract total count
    
                db.query(query, [limit, offset], (err, result) => {
                    if (err) {
                        console.error('Database error (products):', err);
                        return reject(new Error('Error fetching products from the database'));
                    }
    
                    if (!result || result.length === 0) {
                        return resolve({ products: [], totalProducts });
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
    
                    resolve({ products: updatedProducts, totalProducts }); // Return updated product data and count
                });
            });
        });
    }
    
    
    





    static findById(id) {
        console.log('Product ID:', id);
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
                    p.MFD,
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



// Helper functions for selling price calculation and stock status
static calculateSellingPrice(productPrice, productDiscount) {
    const price = parseFloat(productPrice || 0);
    const discount = (price * parseFloat(productDiscount || 0)) / 100;
    return (price - discount).toFixed(2); // Round to 2 decimal places
}

static calculateFinalSellingPrice(sellingPrice, gst) {
    console.log(sellingPrice, gst)
    const gstAmount = (parseFloat(sellingPrice || 0) * parseFloat(gst || 0)) / 100;
    return (parseFloat(sellingPrice) + gstAmount).toFixed(2); // Round to 2 decimal places
}

static determineStockStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 20) return 'Low Stock';
    return 'Available';
}


    static findByAttributes(product_name, product_batch_no, expiry_date, product_price) {
        const query = `
            SELECT * FROM product_table 
            WHERE LOWER(product_name) = LOWER(?) 
              AND LOWER(product_batch_no) = LOWER(?) 
              AND DATE(expiry_date) = DATE(?) 
              AND product_price = ?
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [
                product_name.trim(),  // Ensure it's a string and trimmed
                product_batch_no.trim(),  // Ensure it's a string and trimmed
                expiry_date,  // Date field, assumed to be valid
                product_price,  // Numeric field
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
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
                console.log('Updated product quantity:', result);
            });
        });
    }



//my correct code   
    static create(productData) {
        return new Promise((resolve, reject) => {
            const query = `
                            INSERT INTO product_table 
                            (product_name, product_category, product_quantity, product_price, product_description,
                            generic_name, product_batch_no, MFD,expiry_date, product_discount, supplier_price, supplier,
                            brand_name, selling_price, GST, stock_status, created_at, updated_at, deleted_at, is_deleted)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NULL, 0)
                        `;
            db.query(query, [
                productData.product_name,
                productData.product_category,
                productData.product_quantity,
                productData.product_price,
                productData.product_description,
                productData.generic_name,
                productData.product_batch_no,
                productData.MFD,
                productData.expiry_date,
                productData.product_discount,
                productData.supplier_price,
                productData.supplier,
                productData.brand_name,
                productData.selling_price,
                productData.GST,
                productData.stock_status,
                // productData.hsn_code 
            ], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }




    static async bulkCreate(productData) {
        try {
            const query = `
            INSERT INTO product_table (
                product_name, product_category, product_quantity, product_price,product_description,
                generic_name, product_batch_no, expiry_date, product_discount, supplier_price, supplier,
                brand_name, selling_price, GST, stock_status,MFD
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



    // static getSoftDeletedProducts() {
    //     return new Promise((resolve, reject) => {
    //         const query = `
    //             SELECT 
    //                 p.*, 
    //                 c.category_name AS product_category, -- Fetch product category name
    //                 s.company_name AS supplier_name -- Fetch supplier's company name
    //             FROM 
    //                 product_table p
    //             JOIN 
    //                 product_category c ON p.product_category = c.id -- Join with product_category table
    //             JOIN 
    //                 supplier s ON p.supplier = s.supplier_id -- Join with supplier table
    //             WHERE 
    //                 p.is_deleted = 1
    //         `;
            
    //         db.query(query, (err, results) => {
    //             if (err) {
    //                 return reject(err);
    //             }
    //             resolve(results);
    //         });
    //     });
    // }
    

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
// Find product by ID and check if it's soft-deleted
static async findSoftDeletedById(id) {
    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM product_table WHERE id = ? AND is_deleted = 1',
            [id]
        );
        return rows.length > 0 ? rows[0] : null; // Return product if found, else null
    } catch (err) {
        console.error('Error finding product by ID:', err); // Log the error
        throw new Error('Error finding product by ID');
    }
}

// Permanently delete product
static async moveToPermanentDelete(id) {
    try {
        const [result] = await db.promise().query(
            'DELETE FROM product_table WHERE id = ? AND is_deleted = 1',
            [id]
        );
        return result; // Return result (affected rows count)
    } catch (err) {
        console.error('Error during permanent delete:', err); // Log the error
        throw new Error('Error during permanent delete');
    }
}

  
   
       // Fetch all soft-deleted products with category and supplier name (with pagination)
       static getSoftDeletedProducts(limit, offset) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.*, 
                    c.category_name AS product_category, 
                    s.company_name AS supplier_name
                FROM 
                    product_table p
                JOIN 
                    product_category c ON p.product_category = c.id 
                JOIN 
                    supplier s ON p.supplier = s.supplier_id 
                WHERE 
                    p.is_deleted = 1
                LIMIT ? OFFSET ?;
            `;

            db.query(query, [limit, offset], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Get total count of soft-deleted products
    static getSoftDeletedProductsCount() {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) AS total FROM product_table WHERE is_deleted = 1`;

            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results[0].total);
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



    static fetchFilteredProducts(searchTerm) {
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
                    p.MFD,
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
                    p.is_deleted = 0
                    AND (
                        p.product_name LIKE ? 
                        OR c.category_name LIKE ? 
                        OR s.company_name LIKE ? 
                        OR p.generic_name LIKE ?
                    )
                ORDER BY 
                    p.expiry_date ASC;`;
    
            const searchPattern = `%${searchTerm}%`;
    
            db.query(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, result) => {
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
    
}

module.exports = Product;



















