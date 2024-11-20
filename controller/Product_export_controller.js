const ExcelJS = require('exceljs');
const Product = require('../model/Product_model');  // Assuming this file contains the logic for fetching products

// Export all products to Excel
async function exportProductsToExcel(req, res) {
    try {
        // Fetch all products from the database
        const products = await Product.fetchAll();

        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found for export.' });
        }

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');

        // Set up the worksheet headers
        worksheet.columns = [
            { header: 'Product ID', key: 'id', width: 10 },
            { header: 'Product Name', key: 'product_name', width: 30 },
            { header: 'Product Category', key: 'product_category', width: 20 },
            { header: 'Product Quantity', key: 'product_quantity', width: 15 },
            { header: 'Product Price', key: 'product_price', width: 15 },
            { header: 'Expiry Date', key: 'expiry_date', width: 20 },
            { header: 'GST', key: 'GST', width: 10 },
            { header: 'Selling Price', key: 'selling_price', width: 15 },
            // Add other necessary columns here
        ];

        // Add product data rows
        products.forEach(product => {
            worksheet.addRow(product);
        });

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

        // Send the file as a response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting products to Excel:", error);
        res.status(500).json({ message: 'Error exporting products.', error: error.message });
    }
}

module.exports = {
    exportProductsToExcel,
};
