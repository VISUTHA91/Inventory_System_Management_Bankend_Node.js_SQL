// const path = require("path");
// const { Parser } = require("json2csv");
// // const PDFDocument = require("pdfkit");
// const PDFDocument = require("pdfkit-table");

// const fs = require("fs");

// // 🔹 Public Folder Ensure
// const publicDir = path.join(__dirname, "../public");
// if (!fs.existsSync(publicDir)) {
//     fs.mkdirSync(publicDir, { recursive: true });
// }

// // 🔹 CSV Export Function
// exports.generateCSV = async (data, res, filename = "report.csv") => {
//     try {
//         if (!data.length) {
//             return res.status(404).json({ message: "No data available for CSV export." });
//         }

//         // Data Cleaning Function
//         const cleanData = (value) => {
//             if (typeof value === "string") {
//                 return value.replace(/^\[+"?|"?\]+$/g, ""); // Remove brackets & extra quotes
//             }
//             return value;
//         };

//         // Clean all values in data
//         const cleanedData = data.map((row) => {
//             const cleanedRow = {};
//             for (let key in row) {
//                 cleanedRow[key] = cleanData(row[key]);
//             }
//             return cleanedRow;
//         });

//         const fields = Object.keys(cleanedData[0]);
//         const json2csvParser = new Parser({ fields });
//         const csv = json2csvParser.parse(cleanedData);

//         res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
//         res.setHeader("Content-Type", "text/csv");
//         return res.status(200).send(csv);
//     } catch (error) {
//         console.error("Error generating CSV:", error);
//         return res.status(500).json({ message: "Error generating CSV file" });
//     }
// };





// exports.generatePDF = async (data, res, filename = "invoice_report.pdf") => {
//     try {
//         if (!Array.isArray(data) || data.length === 0) {
//             return res.status(404).json({ message: "No data available for PDF export." });
//         }

//         return new Promise((resolve, reject) => {
//             const filePath = path.join(__dirname, filename);
//             const doc = new PDFDocument({ margin: 30 });

//             const stream = fs.createWriteStream(filePath);
//             doc.pipe(stream);

//             // 🔹 PDF Title
//             doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(2);
            
//             console.log("✅ Data passed to pdfkit-table:", data);

//             // 🔹 Table Headers & Rows
//             // 🔹 Convert rows correctly
//             const table = {
//                 headers: [
//                     { label: "Invoice Number", property: "invoice_number", width: 120 },
//                     { label: "Customer Name", property: "customer_name", width: 120 }, // Changed from Customer ID
//                     { label: "Product Name", property: "product_name", width: 120 },  // Changed from Product ID
//                     { label: "Quantity", property: "quantity", width: 70 },
//                     { label: "Total Price", property: "total_price", width: 80 },
//                     { label: "Discount", property: "discount", width: 80 },
//                     { label: "Final Price", property: "final_price", width: 90 },
//                     { label: "Payment Status", property: "payment_status", width: 100 },
//                     { label: "Invoice Created", property: "invoice_created_at", width: 140 },
//                     { label: "Invoice Updated", property: "invoice_updated_at", width: 140 }
//                 ],
            
//                 rows: data.map(item => [
//                     item.invoice_number,
//                     item.customer_name,   // Using Customer Name instead of Customer ID
//                     item.product_name,    // Using Product Name instead of Product ID
//                     Array.isArray(item.quantity) ? item.quantity.join(", ") : item.quantity,
//                     Number(item.total_price).toFixed(2),
//                     Number(item.discount || 0).toFixed(2),
//                     Number(item.final_price).toFixed(2),
//                     item.payment_status,
//                     item.invoice_created_at,
//                     item.invoice_updated_at
//                 ])
//             };
            


//             // 🔹 Draw the Table
//             doc.table(table, {
//                 prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
//                 prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
//                     doc.font("Helvetica").fontSize(10);
//                 }
//             });

//             doc.end();

//             stream.on("finish", () => {
//                 res.download(filePath, filename, (err) => {
//                     if (err) {
//                         console.error("❌ Error in res.download:", err);
//                         return res.status(500).json({ message: "Failed to download PDF" });
//                     }
//                     fs.unlinkSync(filePath); // Delete file after download
//                     resolve();
//                 });
//             });

//             stream.on("error", (err) => {
//                 console.error("❌ PDF generation error:", err);
//                 reject(err);
//             });
//         });
//     } catch (error) {
//         console.error("❌ Error generating PDF:", error);
//         return res.status(500).json({ message: "Error generating PDF file" });
//     }
// };



const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// 📌 Generate CSV File
const generateCSV = async (data) => {
    const reportsDir = path.join(__dirname, '../reports');
    
    // 📌 Check if the 'reports' directory exists, if not, create it
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 📌 Define CSV file path
    const filePath = path.join(reportsDir, 'sales_report.csv');

    // 📌 Convert JSON to CSV
    const fields = ['product_name', 'total_quantity_sold', 'product_price', 'total_sales_amount'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    // 📌 Write CSV file
    fs.writeFileSync(filePath, csv);

    return filePath;
};



// 📌 Generate PDF File
// const generatePDF = async (data) => {
//     const reportsDir = path.join(__dirname, '../reports');
//     const filePath = path.join(reportsDir, 'sales_report.pdf');

//     // 📌 Ensure the 'reports' directory exists
//     if (!fs.existsSync(reportsDir)) {
//         fs.mkdirSync(reportsDir, { recursive: true });  // ✅ Create the directory if missing
//     }

//     const doc = new PDFDocument();
//     doc.pipe(fs.createWriteStream(filePath));

//     // 📌 Title
//     doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();
//     doc.fontSize(12);

//     // 📌 Table Headers
//     doc.text('Product Name', 50, 100);
//     doc.text('Quantity Sold', 200, 100);
//     doc.text('Price', 350, 100);
//     doc.text('Total Sales', 450, 100);
//     doc.moveDown();

//     // 📌 Table Data
//     let y = 120;
//     data.forEach((item) => {
//         doc.text(item.product_name, 50, y);
//         doc.text(item.total_quantity_sold.toString(), 200, y);
//         doc.text(`₹${item.product_price}`, 350, y);
//         doc.text(`₹${item.total_sales_amount}`, 450, y);
//         y += 20;
//     });

//     doc.end();
//     return filePath;
// };

const generatePDF = async (data) => {
    const reportsDir = path.join(__dirname, '../reports');
    const filePath = path.join(reportsDir, 'sales_report.pdf');

    // Ensure the 'reports' directory exists
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 30 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown(1.5);

    // Table Headers
    const startX = 50;
    let startY = 100;
    doc.fontSize(12).font('Helvetica-Bold');

    doc.text('Product Name', startX, startY);
    doc.text('Quantity Sold', startX + 180, startY);
    doc.text('Price', startX + 300, startY);
    doc.text('Total Sales', startX + 400, startY);

    // Draw a single line under the header
    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();

    startY += 25;
    doc.fontSize(12).font('Helvetica'); // Reset font to normal for data rows

    // Table Data
    data.forEach((item) => {
        doc.text(item.product_name, startX, startY);
        doc.text(item.total_quantity_sold.toString(), startX + 180, startY);
        doc.text(`₹${Number(item.product_price).toFixed(2)}`, startX + 300, startY);
        doc.text(`₹${Number(item.total_sales_amount).toFixed(2)}`, startX + 400, startY);

        startY += 20; // Adjust row spacing
    });

    doc.end();
    
    return new Promise((resolve) => {
        stream.on('finish', () => {
            resolve(filePath);
        });
    });
};



module.exports = { generateCSV, generatePDF };
