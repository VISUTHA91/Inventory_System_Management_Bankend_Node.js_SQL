//my old correct code

const Product = require('../model/Product_model');
const ExcelJS = require('exceljs');
const unzipper = require('unzipper');

const CHUNK_SIZE = 100; // Set a reasonable batch size for bulk inserts

// Validate each row of the Excel sheet
function validateProductRow(row, rowNumber) {
    const errors = [];

    // Validate product_name
    if (!row.getCell(1).value || String(row.getCell(1).value).trim() === '') {
        errors.push('Product name is required');
    }

    // Validate product_category
    if (!row.getCell(2).value || String(row.getCell(2).value).trim() === '') {
        errors.push('Product category is required');
    }

    // Validate product_quantity
    const productQuantity = Number(row.getCell(3).value);
    if (isNaN(productQuantity) || productQuantity <= 0) {
        errors.push('Product quantity must be a positive number');
    }

    // Validate product_price
    const productPrice = Number(row.getCell(4).value);
    if (isNaN(productPrice) || productPrice <= 0) {
        errors.push('Product price must be a positive number');
    }

    // Validate expiry_date
    const expiryDate = new Date(row.getCell(8).value);
    if (isNaN(expiryDate.getTime())) {
        errors.push('Expiry date is invalid or missing');
    }

    // Validate GST
    const gstValue = Number(String(row.getCell(13).value).trim());
    if (isNaN(gstValue) || gstValue < 0 || gstValue > 100) {
        errors.push(`GST must be between 0 and 100 (found: "${row.getCell(13).value}")`);
    }
    console.log(gstValue);

    return { rowNumber, errors };
}

// Unzip the file and extract its contents
async function unzipFile(fileBuffer) {
    try {
        const directory = await unzipper.Open.buffer(fileBuffer);
        const extractedFile = directory.files[0];
        if (extractedFile) {
            return await extractedFile.buffer();
        } else {
            throw new Error('No file found in the ZIP archive');
        }
    } catch (error) {
        console.error("Error unzipping file:", error);
        throw error;
    }
}

// Import products to the database from Excel
async function importProductsToExcel(fileBuffer, isZip = false) {
    const errors = [];
    let productsBatch = [];
    const errorRows = [];  // Array to store rows with validation errors

    try {
        if (!fileBuffer) throw new Error("File buffer is undefined.");

        // If the file is a ZIP, unzip it
        let fileData = fileBuffer;
        if (isZip) fileData = await unzipFile(fileBuffer);

        // Load Excel data
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileData);
        const worksheet = workbook.getWorksheet(1); // Read the first sheet

        // Iterate through rows
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const { errors: rowErrors } = validateProductRow(row, rowNumber);

            // If validation errors are found, add to errorRows
            if (rowErrors.length > 0) {
                errorRows.push({ rowNumber, errors: rowErrors });
                continue;
            }

            // Extract product data
            const productData = {
                product_name: row.getCell(1).value,
                product_category: row.getCell(2).value,
                product_quantity: row.getCell(3).value,
                product_price: row.getCell(4).value,
                product_description: row.getCell(5).value,
                generic_name: row.getCell(6).value,
                product_batch_no: row.getCell(7).value,
                expiry_date: row.getCell(8).value,
                product_discount: row.getCell(9).value,
                supplier_price: row.getCell(10).value,
                supplier: row.getCell(11).value,
                brand_name: row.getCell(12).value,
                selling_price: row.getCell(13).value,
                GST: row.getCell(14).value,
                stock_status: row.getCell(15).value,
            };

            productsBatch.push(productData);

            // If batch size is reached, perform bulk insert
            if (productsBatch.length >= CHUNK_SIZE) {
                try {
                    await Product.bulkCreate(productsBatch);
                } catch (err) {
                    console.error(`Error inserting batch at row ${rowNumber}:`, err);
                    errors.push({ rowNumber, errors: [`Batch insert error: ${err.message}`] });
                }
                productsBatch = [];
            }
        }

        // Insert remaining batch if exists
        if (productsBatch.length > 0) {
            try {
                await Product.bulkCreate(productsBatch);
            } catch (err) {
                console.error("Error inserting final batch:", err);
                errors.push({ rowNumber: worksheet.rowCount, errors: [`Batch insert error: ${err.message}`] });
            }
        }

        // Log or return errors for further processing
        if (errorRows.length > 0) {
            console.log("Validation errors found:", errorRows);
        } else {
            console.log("No validation errors. Ready to process!");
        }

        return {
            success: true,
            message: errors.length > 0 ? "Products imported with some errors." : "Products imported successfully!",
            errors: errorRows,
        };
    } catch (error) {
        console.error("Error importing products:", error);
        return {
            success: false,
            message: "Error importing products.",
            error: error.message || String(error),
        };
    }
}

module.exports = {
    importProductsToExcel,
};
















