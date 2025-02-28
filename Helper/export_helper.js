
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

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




const generateInvoicePDF = async (invoice) => {
    let browser;
    try {
        const templatePath = path.join(__dirname, '../views', 'invoiceTemplate.ejs');

        // 🔹 Debugging: Check if template path is correct
        console.log("Loading EJS template from:", templatePath);

        // 🔹 Render HTML from EJS template
        const htmlContent = await ejs.renderFile(templatePath, { invoice });

        // 🔹 Launch Puppeteer in headless mode
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // 🔹 Set HTML content
        await page.setContent(htmlContent, { waitUntil: 'load' });

        // 🔹 Generate PDF
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

        // 🔹 Close Puppeteer
        await browser.close();

        return pdfBuffer;
    } catch (error) {
        console.error("Error generating PDF:", error);

        // 🔹 Ensure browser closes if error occurs
        if (browser) await browser.close();

        throw new Error("Failed to generate PDF.");
    }
};





module.exports = { generateCSV, generatePDF,generateInvoicePDF };
