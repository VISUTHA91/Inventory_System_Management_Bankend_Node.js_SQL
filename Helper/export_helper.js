const path = require("path");
const { Parser } = require("json2csv");
// const PDFDocument = require("pdfkit");
const PDFDocument = require("pdfkit-table");

const fs = require("fs");

// 🔹 Public Folder Ensure
const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// 🔹 CSV Export Function
exports.generateCSV = async (data, res, filename = "report.csv") => {
    try {
        if (!data.length) {
            return res.status(404).json({ message: "No data available for CSV export." });
        }

        // Data Cleaning Function
        const cleanData = (value) => {
            if (typeof value === "string") {
                return value.replace(/^\[+"?|"?\]+$/g, ""); // Remove brackets & extra quotes
            }
            return value;
        };

        // Clean all values in data
        const cleanedData = data.map((row) => {
            const cleanedRow = {};
            for (let key in row) {
                cleanedRow[key] = cleanData(row[key]);
            }
            return cleanedRow;
        });

        const fields = Object.keys(cleanedData[0]);
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(cleanedData);

        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "text/csv");
        return res.status(200).send(csv);
    } catch (error) {
        console.error("Error generating CSV:", error);
        return res.status(500).json({ message: "Error generating CSV file" });
    }
};

// 🔹 PDF Export Function
// exports.generatePDF = async (data, res, filename = "invoice_report.pdf") => {
//     try {
//         if (!data.length) {
//             return res.status(404).json({ message: "No data available for PDF export." });
//         }

//         return new Promise((resolve, reject) => {
//             const filePath = path.join(publicDir, filename);
//             const doc = new PDFDocument();
//             const stream = fs.createWriteStream(filePath);
//             doc.pipe(stream);

//             // 🔹 PDF Title
//             doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(2);

//             // 🔹 Table Data
//             data.forEach((item, index) => {
//                 doc.fontSize(14).text(`Entry #${index + 1}`, { underline: true }).moveDown(0.5);
//                 for (let key in item) {
//                     doc.fontSize(12).text(`${key}: ${item[key]}`);
//                 }
//                 doc.moveDown();
//             });

//             doc.end();

//             stream.on("finish", () => {
//                 res.download(filePath, filename, (err) => {
//                     if (!err) {
//                         fs.unlinkSync(filePath); // Delete file after download
//                     }
//                 });
//                 resolve();
//             });

//             stream.on("error", (err) => {
//                 console.error("PDF generation error:", err);
//                 reject(err);
//             });
//         });
//     } catch (error) {
//         console.error("Error generating PDF:", error);
//         return res.status(500).json({ message: "Error generating PDF file" });
//     }
// };





exports.generatePDF = async (data, res, filename = "invoice_report.pdf") => {
    try {
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(404).json({ message: "No data available for PDF export." });
        }

        return new Promise((resolve, reject) => {
            const filePath = path.join(__dirname, filename);
            const doc = new PDFDocument({ margin: 30 });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // 🔹 PDF Title
            doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(2);
            
            console.log("✅ Data passed to pdfkit-table:", data);

            // 🔹 Table Headers & Rows
            // 🔹 Convert rows correctly
            const table = {
                headers: [
                    { label: "Invoice Number", property: "invoice_number", width: 120 },
                    { label: "Customer Name", property: "customer_name", width: 120 }, // Changed from Customer ID
                    { label: "Product Name", property: "product_name", width: 120 },  // Changed from Product ID
                    { label: "Quantity", property: "quantity", width: 70 },
                    { label: "Total Price", property: "total_price", width: 80 },
                    { label: "Discount", property: "discount", width: 80 },
                    { label: "Final Price", property: "final_price", width: 90 },
                    { label: "Payment Status", property: "payment_status", width: 100 },
                    { label: "Invoice Created", property: "invoice_created_at", width: 140 },
                    { label: "Invoice Updated", property: "invoice_updated_at", width: 140 }
                ],
            
                rows: data.map(item => [
                    item.invoice_number,
                    item.customer_name,   // Using Customer Name instead of Customer ID
                    item.product_name,    // Using Product Name instead of Product ID
                    Array.isArray(item.quantity) ? item.quantity.join(", ") : item.quantity,
                    Number(item.total_price).toFixed(2),
                    Number(item.discount || 0).toFixed(2),
                    Number(item.final_price).toFixed(2),
                    item.payment_status,
                    item.invoice_created_at,
                    item.invoice_updated_at
                ])
            };
            


            // 🔹 Draw the Table
            doc.table(table, {
                prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
                prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                    doc.font("Helvetica").fontSize(10);
                }
            });

            doc.end();

            stream.on("finish", () => {
                res.download(filePath, filename, (err) => {
                    if (err) {
                        console.error("❌ Error in res.download:", err);
                        return res.status(500).json({ message: "Failed to download PDF" });
                    }
                    fs.unlinkSync(filePath); // Delete file after download
                    resolve();
                });
            });

            stream.on("error", (err) => {
                console.error("❌ PDF generation error:", err);
                reject(err);
            });
        });
    } catch (error) {
        console.error("❌ Error generating PDF:", error);
        return res.status(500).json({ message: "Error generating PDF file" });
    }
};



// exports.generatePDF = async (data, res, filename = "invoice_report.pdf") => {
//     try {
//         if (!data.length) {
//             return res.status(404).json({ message: "No data available for PDF export." });
//         }

//         return new Promise((resolve, reject) => {
//             const filePath = path.join(publicDir, filename);
//             const doc = new PDFDocument({ margin: 30 });

//             // Stream the PDF to a file
//             const stream = fs.createWriteStream(filePath);
//             doc.pipe(stream);

//             // 🔹 PDF Title
//             doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(2);

//             // Define column widths
//             const columnWidths = [80, 120, 80, 100, 80, 100, 80, 80];

//             // Table Headers
//             doc.fontSize(12).font("Helvetica-Bold");
//             doc.text("Invoice No", 50, doc.y, { width: columnWidths[0], continued: true })
//                 .text("Customer Name", 140, doc.y, { width: columnWidths[1], continued: true })
//                 .text("Total Price", 260, doc.y, { width: columnWidths[2], continued: true })
//                 .text("Discount", 340, doc.y, { width: columnWidths[3], continued: true })
//                 .text("Final Price", 420, doc.y, { width: columnWidths[4], continued: true })
//                 .text("Payment Status", 500, doc.y, { width: columnWidths[5] });

//             doc.moveDown(0.5).font("Helvetica");

//             // Table Rows
//             data.forEach((item) => {
//                 console.log("total_price:", item.total_price, "Type:", typeof item.total_price);
//                 doc.text(item.invoice_number, 50, doc.y, { width: columnWidths[0], continued: true })
//                     .text(item.customer_name, 140, doc.y, { width: columnWidths[1], continued: true })                    
//                     .text(parseFloat(item.total_price).toFixed(2), 260, doc.y, { width: columnWidths[2], continued: true })
//                     .text(parseFloat(item.discount || 0).toFixed(2), 260, doc.y, { width: columnWidths[2], continued: true })
//                     .text(parseFloat(item.final_price || 0).toFixed(2), 260, doc.y, { width: columnWidths[2], continued: true })
//                     .text(item.payment_status, 500, doc.y, { width: columnWidths[5] });

                   

//                 doc.moveDown();
//             });

//             doc.end();

//             stream.on("finish", () => {
//                 res.download(filePath, filename, (err) => {
//                     if (!err) {
//                         fs.unlinkSync(filePath); // Delete file after download
//                     }
//                 });
//                 resolve();
//             });

//             stream.on("error", (err) => {
//                 console.error("PDF generation error:", err);
//                 reject(err);
//             });
//         });
//     } catch (error) {
//         console.error("Error generating PDF:", error);
//         return res.status(500).json({ message: "Error generating PDF file" });
//     }
// };


