const Product = require('../model/Product_model');
const ExcelJS = require('exceljs');
const unzipper = require('unzipper');
const db = require('../config/Database'); // Update with your DB config file

// Fetch category ID by name
async function getCategoryIdByName(categoryName) {
    const query = `SELECT id FROM product_category WHERE category_name = ?`;
    const [rows] = await db.promise().query(query, [categoryName]);
    return rows.length > 0 ? rows[0].id : null;
}

async function getSupplierIdByName(supplierName) {
    const query = "SELECT supplier_id FROM supplier WHERE company_name = ?";
    const [rows] = await db.promise().query(query, [supplierName]);

    if (rows.length > 0) {
        return rows[0].supplier_id;
    } else {
        const insertQuery = "INSERT INTO suppliers (company_name) VALUES (?)";
        const [result] = await db.promise().query(insertQuery, [supplierName]);
        return result.insertId;
    }
}


// Function to validate product row
function validateProductRow(row) {
    const errors = [];

    // Check if product name is valid
    if (!row.getCell(1).value || typeof row.getCell(1).value !== 'string' || row.getCell(1).value.trim() === '') {
        errors.push('Product Name is required');
    }

    // Check if category is valid
    if (!row.getCell(2).value || typeof row.getCell(2).value !== 'string' || row.getCell(2).value.trim() === '') {
        errors.push('Product Category is required');
    }

    // Check if product quantity is a valid number
    const productQuantity = row.getCell(3).value;
    if (isNaN(productQuantity) || productQuantity <= 0) {
        errors.push('Valid Product Quantity is required');
    }

    // Check if product price is a valid number
    const productPrice = row.getCell(4).value;
    if (isNaN(productPrice) || productPrice <= 0) {
        errors.push('Valid Product Price is required');
    }

    // Check if product description is valid
    if (!row.getCell(5).value || typeof row.getCell(5).value !== 'string' || row.getCell(5).value.trim() === '') {
        errors.push('Product Description is required');
    }

    return { errors };
}



async function importProductsFromExcel(fileBuffer, isZip) {
    let productsBatch = [];
    const errors = [];
    const errorRows = [];

    

    try {
        let finalBuffer = fileBuffer;

        if (isZip) {
            const zip = await unzipper.Open.buffer(fileBuffer);
            const xlsxFile = zip.files.find(file => file.path.endsWith('.xlsx'));
            if (!xlsxFile) {
                throw new Error('No Excel file found in the ZIP archive.');
            }
            finalBuffer = await xlsxFile.buffer();
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(finalBuffer);
        const worksheet = workbook.getWorksheet(1);

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const { errors: rowErrors } = validateProductRow(row);

            if (rowErrors.length > 0) {
                errorRows.push({ rowNumber, errors: rowErrors });
                continue;
            }

            const expiry_date = row.getCell(8).value ? new Date(row.getCell(8).value).toISOString().split('T')[0] : null;

            const productQuantity = isNaN(row.getCell(3).value) || row.getCell(3).value <= 0 ? 0 : row.getCell(3).value;
            const productPrice = isNaN(row.getCell(4).value) || row.getCell(4).value <= 0 ? 0 : row.getCell(4).value;
            const sellingPrice = parseFloat(Product.calculateSellingPrice(
                productPrice,
                row.getCell(9).value
            ));
            const finalSellingPrice = isNaN(parseFloat(Product.calculateFinalSellingPrice(
                sellingPrice,
                row.getCell(13).value
            ))) ? 0 : parseFloat(Product.calculateFinalSellingPrice(
                sellingPrice,
                row.getCell(13).value
            ));

            const mfd = row.getCell(15).value ? new Date(row.getCell(15).value).toISOString().split('T')[0] : null;

            const productData = {
                product_name: (row.getCell(1).value || '').toString().trim(),
                product_category: await getCategoryIdByName(String(row.getCell(2).value).trim()),
                product_quantity: productQuantity,
                product_price: productPrice,
                product_description: row.getCell(5).value,
                generic_name: row.getCell(6).value,
                product_batch_no: (row.getCell(7).value || '').toString().trim(),
                expiry_date,
                product_discount: isNaN(row.getCell(9).value) ? 0 : row.getCell(9).value,
                supplier_price: isNaN(row.getCell(10).value) ? 0 : row.getCell(10).value,
                supplier: await getSupplierIdByName((row.getCell(11).value || '').toString().trim()),
                brand_name: row.getCell(12).value,
                selling_price: finalSellingPrice,
                GST: isNaN(row.getCell(13).value) ? 0 : row.getCell(13).value,
                // Added Manufacturing Date (MFD)
                stock_status: Product.determineStockStatus(productQuantity),
                MFD: mfd
            };

            if (productData.product_quantity <= 0 || isNaN(productData.product_quantity)) {
                productData.product_quantity = 0;
            }

            const existingProduct = await Product.findByAttributes(productData.product_name, productData.product_batch_no, productData.expiry_date, productData.product_price);

            if (existingProduct && existingProduct.length !== 0) {
                const updatedQuantity = existingProduct[0].product_quantity + productData.product_quantity;
                const stockStatus = Product.determineStockStatus(updatedQuantity);
                await Product.updateQuantity(existingProduct[0].id, updatedQuantity, stockStatus);
            } else {
                productsBatch.push(Object.values(productData));
            }

            if (productsBatch.length >= 100) {
                await Product.bulkCreate(productsBatch);
                productsBatch = [];
            }
        }

        if (productsBatch.length > 0) {
            await Product.bulkCreate(productsBatch);
        }

        return {
            success: true,
            message: errorRows.length > 0 ? 'Products imported with some errors.' : 'Products imported successfully!',
            errors: errorRows,
        };
    } catch (error) {
        console.error('Error importing products:', error);
        return { success: false, message: 'Error importing products', error: error.message };
    }
}

module.exports = { importProductsFromExcel };













