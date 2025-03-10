
const Product = require('../model/Product_model');
const db = require("../config/Database");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Parser } = require('json2csv');
const puppeteer = require('puppeteer');
const path = require('path');


class ProductController {


//stock report and filtering products
static getAllProducts_stock_search(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const search = req.query.search || null;
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const batchNo = req.query.batch_no || null;

    // Fetch products with all filters
    Product.stockfetchAllpro(status, search, startDate, endDate, batchNo)
        .then(products => {
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found' });
            }

            // Apply pagination
            const totalProducts = products.length;
            const totalPages = Math.ceil(totalProducts / limit);
            const startIndex = (page - 1) * limit;
            const paginatedProducts = products.slice(startIndex, startIndex + limit);

            res.status(200).json({
                message: 'Products fetched successfully',
                page: page,
                limit: limit,
                totalProducts: totalProducts,
                totalPages: totalPages,
                data: paginatedProducts
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


//stock report and filtering products correctly work
// static async downloadStockPDF(req, res) { 
//     try {
//         const { status, start_date, end_date } = req.query;
//         const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

//         if (products.length === 0) {
//             return res.status(404).json({ message: 'No products found' });
//         }

//         // Create PDF
//         const doc = new PDFDocument({ margin: 30 });
//         const filePath = `./stock_report_${Date.now()}.pdf`;
//         const stream = fs.createWriteStream(filePath);
//         doc.pipe(stream);

//         // ** Title - Centered Properly **
//         doc.fontSize(20).text('Stock Report', { align: 'center' });
//         doc.moveDown(2);

//         // ** Define Proper Column Positions **
//         const startX = 50;
//         const colWidths = [150, 150, 120, 120, 120, 80]; // Adjusted column spacing
//         const headers = ['Product Name', 'Category', 'Stock Status', 'Batch No', 'Supplier', 'Quantity'];

//         // ** Print Table Headers (Properly Aligned) **
//         let currentX = startX;
//         doc.font('Helvetica-Bold').fontSize(12);
//         headers.forEach((header, index) => {
//             doc.text(header, currentX, doc.y, { width: colWidths[index], align: 'center' });
//             currentX += colWidths[index];
//         });

//         doc.moveDown(0.5);
        
//         // ** Draw a Line Under Headers **
//         doc.moveTo(startX, doc.y).lineTo(700, doc.y).stroke();
//         doc.moveDown();

//         // ** Print Product Data (Aligned Properly) **
//         doc.font('Helvetica').fontSize(10);
//         products.forEach((product) => {
//             let yPos = doc.y;  // Capture current Y position
//             currentX = startX;

//             doc.text(product.product_name, currentX, yPos, { width: colWidths[0], align: 'center' });
//             currentX += colWidths[0];

//             doc.text(product.product_category, currentX, yPos, { width: colWidths[1], align: 'center' });
//             currentX += colWidths[1];

//             doc.text(product.stock_status, currentX, yPos, { width: colWidths[2], align: 'center' });
//             currentX += colWidths[2];

//             doc.text(product.product_batch_no, currentX, yPos, { width: colWidths[3], align: 'center' });
//             currentX += colWidths[3];

//             doc.text(product.supplier, currentX, yPos, { width: colWidths[4], align: 'center' });
//             currentX += colWidths[4];

//             doc.text(product.product_quantity.toString(), currentX, yPos, { width: colWidths[5], align: 'center' });

//             doc.moveDown(); // Move to the next line
//         });

//         doc.end();

//         stream.on('finish', () => {
//             res.download(filePath, 'Stock_Report.pdf', (err) => {
//                 if (err) console.error('Error sending file:', err);
//                 fs.unlinkSync(filePath);
//             });
//         });

//     } catch (err) {
//         console.error('Error generating PDF:', err);
//         res.status(500).json({ message: 'Error generating PDF' });
//     }
// }
static downloadStockPDF = async (req, res) => {
    try {
        const { status, start_date, end_date } = req.query;

        // Fetch filtered stock data
        const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Convert product data into an HTML table
        let tableRows = '';
        products.forEach((product) => {
            tableRows += `
                <tr>
                    <td>${product.product_name}</td>
                    <td>${product.product_category}</td>
                    <td>${product.stock_status}</td>
                    <td>${product.product_batch_no}</td>
                    <td>${product.supplier}</td>
                   <td>${product.MFD && !isNaN(new Date(product.MFD)) ? new Date(product.MFD).toLocaleDateString() : 'N/A'}</td>
                    <td>${product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'N/A'}</td>
                    <td>${product.product_quantity}</td>
                </tr>
            `;

            // console.log("MFD Value:", product.MFD);

        });

        // Define HTML structure with CSS for styling
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stock Report</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background-color: #f4f4f4; }
            </style>
        </head>
        <body>
            <h2>Stock Report</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Stock Status</th>
                        <th>Batch No</th>
                        <th>Supplier</th>
                        <th>MFD</th>
                        <th>Expiry Date</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
        `;

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Define PDF file path
        const filePath = path.join(__dirname, `../../stock_report_${Date.now()}.pdf`);

        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        // Send file to client
        res.download(filePath, 'Stock_Report.pdf', (err) => {
            if (err) console.error('Error sending file:', err);
            fs.unlinkSync(filePath); // Delete the file after download
        });

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ message: 'Error generating PDF' });
    }
};






//corrrectly work good wel
static async downloadStockCSV(req, res) {
    try {
        const { status, start_date, end_date } = req.query;
        const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        // Define CSV Fields
        const fields = ['product_name', 'product_category', 'stock_status', 'product_batch_no', 'supplier', 'product_quantity', 'expiry_date'];
        const parser = new Parser({ fields });
        const csvData = parser.parse(products);

        const filePath = `./stock_report_${Date.now()}.csv`;
        fs.writeFileSync(filePath, csvData);

        res.download(filePath, 'Stock_Report.csv', (err) => {
            if (err) console.error('Error sending file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error('Error generating CSV:', err);
        res.status(500).json({ message: 'Error generating CSV' });
    }
}












static getSupplierCategories = async (req, res) => {
    console.log("Fetching categories for supplierId:", req.params.supplier_id); // Debugging

    try {
        const supplierId = req.params.supplier_id;
        if (!supplierId) {
            return res.status(400).json({ success: false, message: "Supplier ID is required" });
        }

        const categories = await Product.fetchCategoriesBySupplier(supplierId);
        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: "No categories found for this supplier" });
        }

        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
// static getsupplier_cat_pro = async (req, res) => {
//     console.log("Route hit with supplierId:", req.params); // Debugging

//     try {
//         const supplierId = req.params.supplier_id; // Ensure this matches the route
//         if (!supplierId) {
//             return res.status(400).json({ success: false, message: "Supplier ID is required" });
//         }

//         const products = await Product.fetchBySupplier_pro_cat(supplierId);
//         if (products.length === 0) {
//             return res.status(404).json({ success: false, message: "No products found for this supplier" });
//         }

//         res.status(200).json({ success: true, data: products });
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };


    

//list only products without pagination
static getAllPro(req, res) {
    Product.fetchAllpro()
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


// Get total product count
static getProductCount(req, res) {
    Product.fetchProductCount()
        .then(total => {
            res.status(200).json({
                message: 'Total product count fetched successfully',
                total_products: total
            });
        })
        .catch(err => {
            console.error('Error fetching product count:', err);
            res.status(500).json({
                message: 'Error fetching product count',
                error: err.message
            });
        });
}



//pagination products
    // Get product by ID
   
    static getAllProducts(req, res) {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    
        Product.fetchAll(page, limit)
            .then(({ products, totalProducts }) => {
                if (products.length === 0) {
                    return res.status(404).json({ message: 'No products found' });
                }
    
                // Calculate total pages
                const totalPages = Math.ceil(totalProducts / limit);
    
                // Respond with paginated products, total count, and total pages
                res.status(200).json({
                    message: 'Products fetched successfully',
                    page: page,
                    limit: limit,
                    totalProducts: totalProducts,
                    totalPages: totalPages,
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

    console.log("product data", req.body);

    if (!productData.product_name || !productData.product_price || !productData.product_quantity ) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Calculate the selling price and final selling price
        const sellingPrice = Product.calculateSellingPrice(
            productData.product_price,
            productData.product_discount
        );

        const finalSellingPrice = Product.calculateFinalSellingPrice(
            sellingPrice,
            productData.GST
        );

        // Assign the final selling price to product data
        productData.selling_price = finalSellingPrice;

        // Check if the product already exists based on product_name, product_batch_no, expiry_date, and product_price
        const existingProduct = await Product.findByAttributes(
            productData.product_name,
            productData.product_batch_no,
            productData.expiry_date,
            productData.product_price
        );

        if (existingProduct && existingProduct.length > 0) {
            // If the product exists, update the quantity and other relevant fields
            const product = existingProduct[0];
            const updatedQuantity = product.product_quantity + productData.product_quantity;
            const stockStatus = Product.determineStockStatus(updatedQuantity);

            // Update the existing product with the new data
            await Product.updateQuantity(product.id, updatedQuantity, stockStatus);
            return res.status(200).json({ message: 'Product updated successfully.' });
        } else {
            // If the product does not exist, determine stock status for the new product
            const stockStatus = Product.determineStockStatus(productData.product_quantity);
            productData.stock_status = stockStatus;

            // Insert the new product into the database
            await Product.create(productData);
            return res.status(201).json({ message: 'Product created successfully.' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error processing product.', error: error.message });
    }
}

     
   










static async updateProduct(req, res) {
    try {
        const productId = req.params.id;
        const updatedData = req.body;

        console.log('Incoming Update Request Data:', updatedData);

        // Validate required fields
        if (!updatedData.product_name || !updatedData.product_category || !updatedData.product_quantity) {
            return res.status(400).json({
                message: 'Missing required fields (product_name, product_category, product_quantity).',
            });
        }

        // Fetch existing product data for comparison
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Calculate selling price if product_price or product_discount is provided
        let sellingPrice = existingProduct.selling_price; // Default to existing value
        if (updatedData.product_price || updatedData.product_discount) {
            sellingPrice = Product.calculateSellingPrice(
                updatedData.product_price || existingProduct.product_price,
                updatedData.product_discount || existingProduct.product_discount
            );
        }

        // Calculate final selling price with GST
        const finalSellingPrice = Product.calculateFinalSellingPrice(
            sellingPrice,
            updatedData.GST || existingProduct.GST
        );

        // Assign calculated selling price to updatedData
        updatedData.selling_price = finalSellingPrice;

        // Determine stock status based on product_quantity
        const stockStatus = Product.determineStockStatus(updatedData.product_quantity);
        updatedData.stock_status = stockStatus;

        console.log('Updated Data for Query:', updatedData);

        // Update product in the database
        const result = await Product.update(productId, updatedData);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found or already deleted.' });
        }

        return res.status(200).json({ message: 'Product updated successfully.' });
    } catch (err) {
        console.error('Error updating product:', err);
        return res.status(500).json({ message: 'Error updating product.', error: err.message });
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


   
    static async permanentDeleteProduct(req, res) {
        try {
            const productId = req.params.id;

            // First, check if the product exists and is soft-deleted (is_deleted = 1)
            const product = await Product.findSoftDeletedById(productId);

            if (!product) {
                return res.status(404).json({ message: 'Product not found or not soft-deleted' });
            }

            // Permanently delete the product
            const result = await Product.moveToPermanentDelete(productId);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found or already permanently deleted' });
            }

            // Send success response
            res.status(200).json({ message: 'Product permanently deleted' });
        } catch (err) {
            console.error(err);  // Log error for debugging
            res.status(500).json({ message: 'Error permanently deleting product', error: err.message });
        }
    }
    

    // // List all soft-deleted products
    // static async getSoftDeletedProducts(req, res) {
    //     try {
    //         const products = await Product.getSoftDeletedProducts();
    //         if (products.length === 0) {
    //             return res.status(404).json({ message: 'No soft-deleted products found' });
    //         }
    //         res.status(200).json({
    //             message: 'Soft-deleted products fetched successfully',
    //             data: products
    //         });
    //     } catch (err) {
    //         res.status(500).json({ message: 'Error fetching soft-deleted products', error: err.message });
    //     }
    // }

      // List all soft-deleted products with pagination
      
      static async getSoftDeletedProducts(req, res) {
        try {
            let page = parseInt(req.query.page) || 1; // Default page = 1
            let limit = parseInt(req.query.limit) || 5; // Default limit = 5
            let offset = (page - 1) * limit;

            // Fetch products
            const products = await Product.getSoftDeletedProducts(limit, offset);
            // Fetch total count
            const total = await Product.getSoftDeletedProductsCount();

            if (products.length === 0) {
                return res.status(404).json({ message: 'No soft-deleted products found' });
            }

            res.status(200).json({
                message: 'Soft-deleted products fetched successfully',
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
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


    static searchProducts(req, res) {
        const { search } = req.query;
    
        if (!search || search.trim() === "") {
            return res.status(400).json({ message: "Search term is required." });
        }
    
        Product.fetchFilteredProducts(search)
            .then(products => {
                if (products.length === 0) {
                    return res.status(404).json({ message: "No matching products found." });
                }
                res.status(200).json({
                    message: "Products fetched successfully",
                    data: products
                });
            })
            .catch(err => {
                console.error("Error fetching filtered products:", err);
                res.status(500).json({
                    message: "Error fetching filtered products",
                    error: err.message
                });
            });
    }
    



}




module.exports = ProductController;










