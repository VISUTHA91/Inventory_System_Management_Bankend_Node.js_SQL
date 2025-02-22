const path = require("path");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
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
exports.generatePDF = async (data, res, filename = "invoice_report.pdf") => {
    try {
        if (!data.length) {
            return res.status(404).json({ message: "No data available for PDF export." });
        }

        return new Promise((resolve, reject) => {
            const filePath = path.join(publicDir, filename);
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // 🔹 PDF Title
            doc.fontSize(18).text("Sales Report", { align: "center" }).moveDown(2);

            // 🔹 Table Data
            data.forEach((item, index) => {
                doc.fontSize(14).text(`Entry #${index + 1}`, { underline: true }).moveDown(0.5);
                for (let key in item) {
                    doc.fontSize(12).text(`${key}: ${item[key]}`);
                }
                doc.moveDown();
            });

            doc.end();

            stream.on("finish", () => {
                res.download(filePath, filename, (err) => {
                    if (!err) {
                        fs.unlinkSync(filePath); // Delete file after download
                    }
                });
                resolve();
            });

            stream.on("error", (err) => {
                console.error("PDF generation error:", err);
                reject(err);
            });
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({ message: "Error generating PDF file" });
    }
};
