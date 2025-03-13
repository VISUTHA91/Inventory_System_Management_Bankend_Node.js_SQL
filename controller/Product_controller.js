
const Product = require('../model/Product_model');
const db = require("../config/Database");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { Parser } = require('json2csv');
const puppeteer = require('puppeteer');
const path = require('path');


class ProductController {


//stock report and filtering products
// static getAllProducts_stock_search(req, res) {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const status = req.query.status || null;
//     const search = req.query.search || null;
//     const startDate = req.query.start_date || null;
//     const endDate = req.query.end_date || null;
//     const batchNo = req.query.batch_no || null;

//     // Fetch products with all filters
//     Product.stockfetchAllpro(status, search, startDate, endDate, batchNo)
//         .then(products => {
//             if (products.length === 0) {
//                 return res.status(404).json({ message: 'No products found' });
//             }

//             // Apply pagination
//             const totalProducts = products.length;
//             const totalPages = Math.ceil(totalProducts / limit);
//             const startIndex = (page - 1) * limit;
//             const paginatedProducts = products.slice(startIndex, startIndex + limit);

//             res.status(200).json({
//                 message: 'Products fetched successfully',
//                 page: page,
//                 limit: limit,
//                 totalProducts: totalProducts,
//                 totalPages: totalPages,
//                 data: paginatedProducts
//             });
//         })
//         .catch(err => {
//             console.error('Error fetching products:', err);
//             res.status(500).json({
//                 message: 'Error fetching products',
//                 error: err.message
//             });
//         });
// }


//stock report and filtering products correctly work

// static downloadStockPDF = async (req, res) => {
//     try {
//         const { status, start_date, end_date } = req.query;

//         // Fetch filtered stock data
//         const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

//         if (products.length === 0) {
//             return res.status(404).json({ message: 'No products found' });
//         }

//         // Convert product data into an HTML table
//         let tableRows = '';
//         products.forEach((product) => {
//             tableRows += `
//                 <tr>
//                     <td>${product.product_name}</td>
//                     <td>${product.product_category}</td>
//                     <td>${product.stock_status}</td>
//                     <td>${product.product_batch_no}</td>
//                     <td>${product.supplier}</td>
//                    <td>${product.MFD && !isNaN(new Date(product.MFD)) ? new Date(product.MFD).toLocaleDateString() : 'N/A'}</td>
//                     <td>${product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : 'N/A'}</td>
//                     <td>${product.product_quantity}</td>
//                 </tr>
//             `;

//             // console.log("MFD Value:", product.MFD);

//         });

//         // Define HTML structure with CSS for styling
//         const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <title>Stock Report</title>
//             <style>
//                 body { font-family: Arial, sans-serif; padding: 20px; }
//                 h2 { text-align: center; }
//                 table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//                 th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
//                 th { background-color: #f4f4f4; }
//             </style>
//         </head>
//         <body>
//             <h2>Stock Report</h2>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Product Name</th>
//                         <th>Category</th>
//                         <th>Stock Status</th>
//                         <th>Batch No</th>
//                         <th>Supplier</th>
//                         <th>MFD</th>
//                         <th>Expiry Date</th>
//                         <th>Quantity</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${tableRows}
//                 </tbody>
//             </table>
//         </body>
//         </html>
//         `;

//         // Generate PDF using Puppeteer
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

//         // Define PDF file path
//         const filePath = path.join(__dirname, `../../stock_report_${Date.now()}.pdf`);

//         await page.pdf({
//             path: filePath,
//             format: 'A4',
//             printBackground: true,
//             margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
//         });

//         await browser.close();

//         // Send file to client
//         res.download(filePath, 'Stock_Report.pdf', (err) => {
//             if (err) console.error('Error sending file:', err);
//             fs.unlinkSync(filePath); // Delete the file after download
//         });

//     } catch (err) {
//         console.error('Error generating PDF:', err);
//         res.status(500).json({ message: 'Error generating PDF' });
//     }
// };






// //corrrectly work good wel
// static async downloadStockCSV(req, res) {
//     try {
//         const { status, start_date, end_date } = req.query;
//         const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

//         if (products.length === 0) {
//             return res.status(404).json({ message: 'No products found' });
//         }

//         // Define CSV Fields
//         const fields = ['product_name', 'product_category', 'stock_status', 'product_batch_no', 'supplier', 'product_quantity', 'expiry_date'];
//         const parser = new Parser({ fields });
//         const csvData = parser.parse(products);

//         const filePath = `./stock_report_${Date.now()}.csv`;
//         fs.writeFileSync(filePath, csvData);

//         res.download(filePath, 'Stock_Report.csv', (err) => {
//             if (err) console.error('Error sending file:', err);
//             fs.unlinkSync(filePath);
//         });

//     } catch (err) {
//         console.error('Error generating CSV:', err);
//         res.status(500).json({ message: 'Error generating CSV' });
//     }
// }



static async getAllProducts_stock_search(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || null;
        const search = req.query.search || null;
        const startDate = req.query.start_date || null;
        const endDate = req.query.end_date || null;
        const batchNo = req.query.batch_no || null;

        const products = await Product.stockfetchAllpro(status, search, startDate, endDate, batchNo);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const startIndex = (page - 1) * limit;
        const paginatedProducts = products.slice(startIndex, startIndex + limit);

        res.status(200).json({
            message: 'Products fetched successfully',
            page,
            limit,
            totalProducts,
            totalPages,
            data: paginatedProducts
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
}

static async downloadStockPDF(req, res) {
    try {
        const { status, start_date, end_date } = req.query;
        console.log("date",start_date,end_date);
        const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        let tableRows = '';
        products.forEach(product => {
            tableRows += `
                <tr>
                    <td>${product.product_name}</td>
                    <td>${product.product_category}</td>
                    <td>${product.stock_status}</td>
                    <td>${product.product_batch_no}</td>
                    <td>${product.supplier}</td>
                    <td>${product.MFD || 'N/A'}</td>
                    <td>${product.expiry_date || 'N/A'}</td>
                    <td>${product.product_quantity}</td>
                  <td> ${Math.round(product.GST)}%</td>
                </tr>
            `;
        });

          // **Generate Current Date & Time for Report**
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
          const formattedTime = currentDate.toLocaleTimeString(); // Format: HH:MM:SS AM/PM

        const htmlContent = `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Report</title>
     
    <style>
        table {
            border-collapse: collapse; /* Fixes double border issue */
            width: 100%;
        }
        th, td {
            border: 1px solid black; /* Adds a single border */
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2; /* Light grey background for headers */
        }

         .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .report-date {
                    font-size: 14px;
                    font-weight: bold;
                }
    </style>
</head>
<body>
  <div class="header">
                <h2>Stock Report</h2>
                <div class="report-date">Generated on: ${formattedDate} ${formattedTime}</div>
   </div>
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
                <th>GST%</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows} <!-- This should be dynamically replaced in your template engine -->
        </tbody>
    </table>
</body>
</html>

        `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const filePath = path.join(__dirname, `../../stock_report_${Date.now()}.pdf`);

        await page.pdf({ path: filePath, format: 'A4', printBackground: true });
        await browser.close();

        res.download(filePath, 'Stock_Report.pdf', (err) => {
            if (err) console.error('Error sending file:', err);
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ message: 'Error generating PDF' });
    }
}

static async downloadStockCSV(req, res) {
    try {
        const { status, start_date, end_date } = req.query;
        
        const products = await Product.stockfetchAllpro(status, null, start_date, end_date, null);

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        const fields = ['product_name', 'product_category', 'stock_status', 'product_batch_no', 'supplier', 'product_quantity', 'expiry_date','GST'];
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

    console.log("Product data received:", req.body);

    if (!productData.product_name || !productData.supplier_price || !productData.product_quantity || !productData.product_price || !productData.selling_price) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

     // Convert MFD & expiry_date to Date objects
     const MFD = new Date(productData.MFD);
     const expiryDate = new Date(productData.expiry_date);
 
     // ✅ Validate that MFD is before expiry date
     if (MFD >= expiryDate) {
         return res.status(400).json({ message: "Manufacturing Date (MFD) must be before Expiry Date." });
     }
 

    try {
        const supplierPrice = parseFloat(productData.supplier_price);
        const productPrice = parseFloat(productData.product_price);
        const sellingPrice = parseFloat(productData.selling_price);

        // Ensure selling price is valid
        if (sellingPrice > productPrice) {
            return res.status(400).json({ message: 'Selling price cannot be higher than product price (MRP).' });
        }
        if (sellingPrice < supplierPrice) {
            return res.status(400).json({ message: 'Selling price cannot be lower than supplier price.' });
        }

        // Calculate discount in rupees (MRP - Selling Price)
        productData.product_discount = (productPrice - sellingPrice).toFixed(2);

        // Check if the product already exists
        const existingProduct = await Product.findByAttributes(
            productData.product_name,
            productData.product_batch_no,
            productData.expiry_date,
            productData.supplier_price,
            productData.selling_price
        );

        if (existingProduct && existingProduct.length > 0) {
            const product = existingProduct[0];
            const updatedQuantity = product.product_quantity + productData.product_quantity;
            const stockStatus = Product.determineStockStatus(updatedQuantity);

            await Product.updateQuantity(product.id, updatedQuantity, stockStatus);
            return res.status(200).json({ message: 'Product updated successfully.' });
        } else {
            // Determine stock status for new product
            productData.stock_status = Product.determineStockStatus(productData.product_quantity);

            // Insert the new product into the database
            await Product.create(productData);
            return res.status(201).json({ message: 'Product created successfully.' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Error processing product.', error: error.message });
    }
}












// static async updateProduct(req, res) {
//     try {
//         const productId = req.params.id;
//         const updatedData = req.body;

//         console.log('Incoming Update Request Data:', updatedData);

//         // Validate required fields
//         if (!updatedData.product_name || !updatedData.product_category || !updatedData.product_quantity) {
//             return res.status(400).json({
//                 message: 'Missing required fields (product_name, product_category, product_quantity).',
//             });
//         }

//         // Fetch existing product data for comparison
//         const existingProduct = await Product.findById(productId);

//         if (!existingProduct) {
//             return res.status(404).json({ message: 'Product not found.' });
//         }

//         // Calculate selling price if product_price or product_discount is provided
//         let sellingPrice = existingProduct.selling_price; // Default to existing value
//         if (updatedData.product_price || updatedData.product_discount) {
//             sellingPrice = Product.calculateSellingPrice(
//                 updatedData.product_price || existingProduct.product_price,
//                 updatedData.product_discount || existingProduct.product_discount
//             );
//         }

//         // Calculate final selling price with GST
//         const finalSellingPrice = Product.calculateFinalSellingPrice(
//             sellingPrice,
//             updatedData.GST || existingProduct.GST
//         );

//         // Assign calculated selling price to updatedData
//         updatedData.selling_price = finalSellingPrice;

//         // Determine stock status based on product_quantity
//         const stockStatus = Product.determineStockStatus(updatedData.product_quantity);
//         updatedData.stock_status = stockStatus;

//         console.log('Updated Data for Query:', updatedData);

//         // Update product in the database
//         const result = await Product.update(productId, updatedData);

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'Product not found or already deleted.' });
//         }

//         return res.status(200).json({ message: 'Product updated successfully.' });
//     } catch (err) {
//         console.error('Error updating product:', err);
//         return res.status(500).json({ message: 'Error updating product.', error: err.message });
//     }
// }

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

        // Fetch existing product data for validation
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Determine stock status based on product_quantity
        updatedData.stock_status = Product.determineStockStatus(updatedData.product_quantity);

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










