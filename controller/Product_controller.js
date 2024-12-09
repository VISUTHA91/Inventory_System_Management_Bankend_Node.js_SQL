
const Product = require('../model/Product_model');
const db = require("../config/Database");


class ProductController {


static getAllProducts(req, res) {
    Product.fetchAll()
        .then(products => {
            // Handle the case where no products are found
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found' });
            }

            // Respond with fetched products
            res.status(200).json({
                message: 'Products fetched successfully',
                data: products
            });
        })
        .catch(err => {
            console.error('Error fetching products:', err);
            res.status(500).json({
                message: 'Error fetching products',
                error: err.message
            });
        });
}



    // Get product by ID
    static async getProductById(req, res) {
        try {
            // Fetch the product by ID
            const product = await Product.findById(req.params.id);

            console.log(product);

            // If no product is found, it will throw an error inside the `findById` method
            res.status(200).json({
                message: 'Product fetched successfully',
                data: product
            });
        } catch (err) {
            // If an error occurs (e.g., product not found), send a 404 response with the error message
            res.status(500).json({
                message: 'Error fetching product',
                error: err.message
            });
        }
    }



    static async createProduct(req, res) {
        const productData = req.body;

        // Validate input
        if (!productData.product_name || !productData.product_batch_no || !productData.expiry_date || !productData.product_quantity) {
            return res.status(400).json({ message: 'Missing required fields (product_name, product_batch_no, expiry_date, product_quantity).' });
        }

        if (productData.product_quantity <= 0) {
            return res.status(400).json({ message: 'Product quantity must be greater than 0.' });
        }

        try {
            // Check for existing product with the same batch number and expiry date
            const existingProduct = await Product.findByAttributes(productData);

            if (existingProduct) {
                if (existingProduct.product_name === productData.product_name) {
                    // Update existing product's quantity
                    const updatedQuantity = existingProduct.product_quantity + productData.product_quantity;

                    // Determine stock status
                    let stockStatus = 'Available';
                    if (updatedQuantity === 0) stockStatus = 'Out of Stock';
                    else if (updatedQuantity <= 20) stockStatus = 'Low Stock';

                    const result = await Product.updateQuantity(existingProduct.id, updatedQuantity, stockStatus);

                    return res.status(200).json({
                        message: 'Product quantity updated successfully.',
                        data: result
                    });
                } else {
                    // Product name differs, create a new row
                    const stockStatus = productData.product_quantity < 20 ? 'Low Stock' : 'Available';

                    const result = await Product.create({ ...productData, stock_status: stockStatus });

                    return res.status(201).json({
                        message: 'New product created with a different product name.',
                        data: result
                    });
                }
            } else {
                // Create a new product row
                const stockStatus = productData.product_quantity < 20 ? 'Low Stock' : 'Available';

                const result = await Product.create({ ...productData, stock_status: stockStatus });

                return res.status(201).json({
                    message: 'New product created successfully.',
                    data: result
                });
            }
        } catch (err) {
            res.status(500).json({
                message: 'Error processing product.',
                error: err.message
            });
        }
    }
    
    
    
    
    
    
   
   
   
   
    static async updateProduct(req, res) {
        try {
            const productId = req.params.id;
            const updatedData = req.body;
    
            console.log('Incoming Request Data:', updatedData);
    
            // Validate required fields
            if (!updatedData.product_name || !updatedData.product_category || !updatedData.product_quantity) {
                return res.status(400).json({ message: 'Missing required fields (product_name, product_category, product_quantity).' });
            }
    console.log(updatedData);
            // Update product in the database
            const result = await Product.update(productId, updatedData);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found or already deleted.' });
            }
    
            res.status(200).json({ message: 'Product updated successfully.' });
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ message: 'Error updating product.', error: err.message });
        }
    }
    
   
   
    static async softDeleteProduct(req, res) {
        const productId = req.params.id;

        try {
            // Fetch the product from the database
            const result = await Product.findById(productId);  // Assuming `findById` returns the product details

            // Check if the product exists
            if (!result) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Check if the product is already soft-deleted
            if (result.is_deleted === 1) {
                return res.status(400).json({ message: 'Product has already been soft-deleted' });
            }

            // Perform the soft delete by updating the is_deleted flag and deleted_at timestamp
            const updateResult = await Product.softDeleteProduct(productId); // Perform the soft delete logic

            // Check if the update was successful
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json({
                message: 'Product has been soft deleted successfully and will be automatically deleted after 30 days.'
            });

        } catch (err) {
            res.status(500).json({ message: 'Error soft deleting product', error: err.message });
        }
    }






    // Permanently delete a product that has been soft-deleted
    static async permanentDeleteProduct(req, res) {
        try {
            const productId = req.params.id;

            // First, check if the product exists and has been soft-deleted
            const product = await Product.findById(productId); // Corrected from fetchById to findById
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.is_deleted === 0) {
                return res.status(400).json({ message: 'Product has not been soft-deleted' });
            }

            // Permanently delete the product
            const result = await Product.moveToPermanentDelete(productId);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.status(200).json({ message: 'Product permanently deleted' });
        } catch (err) {
            res.status(500).json({ message: 'Error permanently deleting product', error: err.message });
        }
    }

    // List all soft-deleted products
    static async getSoftDeletedProducts(req, res) {
        try {
            const products = await Product.getSoftDeletedProducts();
            if (products.length === 0) {
                return res.status(404).json({ message: 'No soft-deleted products found' });
            }
            res.status(200).json({
                message: 'Soft-deleted products fetched successfully',
                data: products
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching soft-deleted products', error: err.message });
        }
    }




    // Restore a soft-deleted product by setting is_deleted back to 0

    static async restoreProduct(req, res) {
        const productId = req.params.id;

        try {
            // Attempt to restore the product
            const updateResult = await Product.restore(productId);

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found or not soft-deleted' });
            }

            res.status(200).json({
                message: 'Product has been successfully restored',
            });
        } catch (err) {
            res.status(500).json({ message: 'Error restoring product', error: err.message });
        }
    }



}




module.exports = ProductController;







