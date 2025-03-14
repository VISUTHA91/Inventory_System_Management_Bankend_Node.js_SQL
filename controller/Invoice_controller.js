const Invoice = require('../model/Invoice_model');
const Customer = require('../model/Customer_model');
const Product = require('../model/Product_model');
const db = require('../config/Database'); 
const { generateCSV, generatePDF ,generateInvoicePDF} = require("../Helper/export_helper");
const fs = require('fs');


// Generate Invoice Number
exports.generateInvoiceNumber = async (req, res) => {
    try {
        const invoiceNumber = await Invoice.generateInvoiceNumber();
        res.status(200).json({ invoiceNumber });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



exports.createInvoice = async (req, res) => {
    try {
        const { customer_name, phone, products, payment_status, payment_method } = req.body;

        console.log(req.body);
        console.log('Products:', products);

        if (!phone || typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. It must contain only digits and be 10-15 characters long.' });
        }

        // let customer_id;
        // const existingCustomer = await Customer.checkCustomerExists(phone);
        // if (existingCustomer) {
        //     customer_id = existingCustomer.customer_id;
        // } else {
        //     const newCustomer = await Customer.create({ customer_name, phone });
        //     customer_id = newCustomer.customer_id; // ✅ Ensure correct ID is used
        //     console.log("New customer created with ID:", customer_id);
        // }

        let customer_id;
        const existingCustomer = await Customer.checkCustomerExists(phone);
        if (existingCustomer) {
        customer_id = existingCustomer.customer_id;
        } else {
        const newCustomer = await Customer.create({ customer_name, phone });
        customer_id = newCustomer.customer_id;  // ✅ Now this correctly retrieves customer_id
        console.log("New customer created with ID:", customer_id);
}

        let totalPrice = 0;
        let totalDiscount = 0;
        let lowStockAlerts = [];
        let detailedProducts = [];

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Invalid products data. It must be a non-empty array.' });
        }

        for (const item of products) {
            if (!item.product_id || isNaN(item.product_id) || !item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ message: 'Invalid product details. Product ID and quantity must be valid numbers greater than 0.' });
            }

            const productDetails = await Invoice.checkProductExists(item.product_id);
            if (!productDetails) {
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
            }
            if (productDetails.product_quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product with ID ${item.product_id}` });
            }

            if (productDetails.product_quantity < 30) {
                lowStockAlerts.push(`⚠️ Low stock alert: ${productDetails.product_name} (Remaining: ${productDetails.product_quantity})`);
            }

            // ✅ Fetch required values
            const sellingPrice = parseFloat(productDetails.selling_price); // Before GST
            const gstPercentage = parseFloat(productDetails.GST); // GST percentage
            const productDiscountPercentage = parseFloat(productDetails.product_discount); // Discount percentage

            if (isNaN(sellingPrice) || isNaN(gstPercentage) || isNaN(productDiscountPercentage)) {
                return res.status(500).json({ message: `Error: Invalid price, GST, or discount for product ${item.product_id}` });
            }

            // ✅ GST Calculation
            const gstAmount = (gstPercentage / 100) * sellingPrice; // GST per unit
            const unitPriceWithGST = sellingPrice + gstAmount; // Price after GST

            // ✅ Discount Calculation
            const discountAmount = (productDiscountPercentage / 100) * (unitPriceWithGST * item.quantity);

            // ✅ Subtotal Calculation (After GST, Before Discount)
            const subtotal = unitPriceWithGST * item.quantity;

            // ✅ Update total price and discount
            totalPrice += subtotal;
            totalDiscount += discountAmount;

            detailedProducts.push({
                product_id: item.product_id,
                product_name: productDetails.product_name,
                unit_price: sellingPrice.toFixed(2),  // Original selling price (Before GST)
                gst_percentage: gstPercentage.toFixed(2) + "%",  // GST percentage
                gst_amount: gstAmount.toFixed(2),  // GST amount per unit
                unit_price_display: unitPriceWithGST.toFixed(2),  // Price after GST
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2),
                discount_percentage: productDiscountPercentage.toFixed(2) + "%", // Discount %
                discount_amount: discountAmount.toFixed(2),  // Discount total
            });
        }

        // ✅ Final price calculation
        const finalPrice = parseFloat((totalPrice - totalDiscount).toFixed(2));

        if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalDiscount)) {
            return res.status(400).json({ message: 'Error in calculating prices or discount' });
        }

        // ✅ Generate unique invoice number
        const invoiceNumber = await Invoice.generateInvoiceNumber();

        try {
            // ✅ Update stock for all products in the order
            for (const item of products) {
                await Invoice.updateStock(item.product_id, item.quantity);
            }

            // ✅ Create invoice data object
            const invoiceData = {
                invoice_number: invoiceNumber,
                customer_id,
                product_id: products.map((p) => p.product_id),
                quantity: products.map((p) => p.quantity),
                total_price: totalPrice.toFixed(2),
                total_discount: totalDiscount.toFixed(2),
                final_price: finalPrice.toFixed(2),
                discount: totalDiscount.toFixed(2),
                payment_status,
                payment_method
            };

            console.log("Invoice Data:", invoiceData);

            // ✅ Save invoice to the database
            const invoice = await Invoice.createInvoice(invoiceData);

            res.status(201).json({
                message: 'Invoice created successfully',
                low_stock_alerts: lowStockAlerts,
                invoice_details: {
                    invoice_id: invoice.invoice_id,
                    invoice_number: invoice.invoice_number,
                    customer_id: invoice.customer_id,
                    payment_status: invoice.payment_status,
                    payment_method: invoice.payment_method,
                    products: detailedProducts,
                    summary: {
                        total_price: totalPrice.toFixed(2),
                        // total_discount: totalDiscount.toFixed(2),
                        // final_price: finalPrice.toFixed(2)
                    },
                },
            });
        } catch (error) {
            console.error('Error creating invoice:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



exports.getTotalInvoiceAmount = async (req, res) => {
    try {
        // Get total final_price from the database
        const totalFinalPrice = await Invoice.getTotalInvoiceAmount();

        res.status(200).json({
            success: true,
            message: 'Total invoice amount fetched successfully',
            totalFinalPrice
        });
    } catch (error) {
        console.error('Error fetching total invoice amount:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch total invoice amount',
            error: error.message
        });
    }
};

//purchased peron count only show (invoice list based on customer id)
    // Get total unique customer count from invoices
    // exports. getTotalCustomers=async(req, res) => {
    //     Invoice.fetchTotalCustomers()
    //         .then(total => {
    //             res.status(200).json({
    //                 message: 'Total unique customer count fetched successfully',
    //                 total_customers: total
    //             });
    //         })
    //         .catch(err => {
    //             console.error('Error fetching total customers:', err);
    //             res.status(500).json({
    //                 message: 'Error fetching total customers',
    //                 error: err.message
    //             });
    //         });
    // }





    
   exports.getInvoiceDetails = async (req, res) => {
        try {
            const invoice_number = req.params.invoice_number;
            const result = await Invoice.getInvoiceDetails(invoice_number);
    
            console.log("Controller Response:", result);  // ✅ Debugging step
    
            if (result.error) {
                return res.status(result.status).json({ message: result.error });
            }
    
            res.status(200).json(result);
        } catch (error) {
            console.error("Controller Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
    
    
//get all invoices

//my correct code

exports.getAllInvoices = async (req, res) => {
    try {
        // Call the model method to fetch invoices
        const invoices = await Invoice.getAllInvoices();

        // Send a successful response with the fetched data
        res.status(200).json({
            success: true,
            message: 'Invoices fetched successfully',
            data: invoices,
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);

        // Send an error response if something goes wrong
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message,
        });
    }
};

exports.getAllInvoicespage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10 invoices per page

        const { invoices, totalInvoices, totalPages } = await Invoice.getAllInvoicespage(page, limit);

        if (invoices.length === 0) {
            return res.status(404).json({ success: false, message: 'No invoices found' });
        }

        res.status(200).json({
            success: true,
            message: 'Invoices fetched successfully',
            total_invoice: totalInvoices,
            total_page: totalPages,
            page: page,
            limit: limit,
            data: invoices,
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message,
        });
    }
};



//update the invoice
//update function not worked

exports.updateInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const { customer_id, products, payment_status, payment_method } = req.body;

        // Validate request body
        if (!customer_id || !Array.isArray(products) || products.length === 0 || !payment_status || !payment_method) {
            return res.status(400).json({ message: "Invalid request. Ensure all required fields are provided." });
        }

        // ✅ Check if invoice exists
        const existingInvoice = await Invoice.getInvoiceById(invoiceId);
        if (!existingInvoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // ✅ Check if customer exists
        const customerExists = await Invoice.checkCustomerExists(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: "Customer not found" });
        }

        let totalPrice = 0;
        let totalDiscount = 0;
        let lowStockAlerts = [];
        let detailedProducts = [];

        // ✅ Iterate through products and recalculate prices
        for (const item of products) {
            if (!item.product_id || isNaN(item.product_id) || !item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ message: "Invalid product details. Product ID and quantity must be valid numbers greater than 0." });
            }

            const productDetails = await Invoice.checkProductExists(item.product_id);
            if (!productDetails) {
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
            }

            if (productDetails.product_quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product with ID ${item.product_id}` });
            }

            if (productDetails.product_quantity < 30) {
                lowStockAlerts.push(`⚠️ Low stock alert: ${productDetails.product_name} (Remaining: ${productDetails.product_quantity})`);
            }

            // ✅ Fetch required values
            const sellingPrice = parseFloat(productDetails.selling_price);
            const gstPercentage = parseFloat(productDetails.GST);
            const productDiscountPercentage = parseFloat(productDetails.product_discount);

            if (isNaN(sellingPrice) || isNaN(gstPercentage) || isNaN(productDiscountPercentage)) {
                return res.status(500).json({ message: `Error: Invalid price, GST, or discount for product ${item.product_id}` });
            }

            // ✅ GST Calculation
            const gstAmount = (gstPercentage / 100) * sellingPrice;
            const unitPriceWithGST = sellingPrice + gstAmount;

            // ✅ Discount Calculation
            const discountAmount = (productDiscountPercentage / 100) * (unitPriceWithGST * item.quantity);

            // ✅ Subtotal Calculation (After GST, Before Discount)
            const subtotal = unitPriceWithGST * item.quantity;

            // ✅ Update total price and discount
            totalPrice += subtotal;
            totalDiscount += discountAmount;

            detailedProducts.push({
                product_id: item.product_id,
                product_name: productDetails.product_name,
                unit_price: sellingPrice.toFixed(2),
                gst_percentage: gstPercentage.toFixed(2) + "%",
                gst_amount: gstAmount.toFixed(2),
                unit_price_display: unitPriceWithGST.toFixed(2),
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2),
                discount_percentage: productDiscountPercentage.toFixed(2) + "%",
                discount_amount: discountAmount.toFixed(2),
            });
        }

        // ✅ Final Price Calculation (Total Price - Total Discount)
        const finalPrice = parseFloat((totalPrice - totalDiscount).toFixed(2));

        if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalDiscount)) {
            return res.status(400).json({ message: "Error in calculating prices or discount" });
        }

        try {
            // ✅ Update stock for all products in the order
            for (const item of products) {
                await Invoice.updateStock(item.product_id, item.quantity);
            }

            // ✅ Update invoice in database
            const updatedInvoice = await Invoice.updateInvoice(invoiceId, {
                customer_id,
                products, // Ensure the correct products array is passed
                total_price: totalPrice,
                total_discount: totalDiscount,
                final_price: finalPrice,
                payment_status,
                payment_method,
            });

            if (!updatedInvoice) {
                return res.status(500).json({ message: "Failed to update invoice" });
            }

            res.status(200).json({
                message: "Invoice updated successfully",
                low_stock_alerts: lowStockAlerts,
                invoice_details: {
                    invoice_id: invoiceId,
                    customer_id,
                    payment_status,
                    payment_method,
                    products: detailedProducts,
                    summary: {
                        total_price: totalPrice.toFixed(2),
                        total_discount: totalDiscount.toFixed(2),
                        final_price: finalPrice.toFixed(2),
                    },
                },
            });
        } catch (error) {
            console.error("Error updating invoice:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};




// invoice number to use the details

exports.getInvoiceDetails = async (req, res) => {
    try {
        const { invoice_number } = req.params;
        console.log(req.params);

        const results = await Invoice.getInvoiceDetails(invoice_number); // No need to destructure it
        if (results.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ data: results[0] }); // Return the first result
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




const PDFDocument = require('pdfkit');


exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);
        console.log(invoice);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ data: invoice });
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





//correctly worked calculation 13/03/25

exports.downloadInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        const { size } = req.query;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const pageSizes = {
            A4: { width: 595.28, height: 841.89 },
            A5: { width: 419.53, height: 595.28 }
        };

        const selectedSize = pageSizes[size?.toUpperCase()] || pageSizes.A4;

        const doc = new PDFDocument({ size: [selectedSize.width, selectedSize.height], margin: 30 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoice_number}.pdf`);

        doc.pipe(res);

        const fontSizeTitle = selectedSize.width === pageSizes.A5.width ? 14 : 18;
        const fontSizeText = selectedSize.width === pageSizes.A5.width ? 9 : 12;
        const fontSizeTable = selectedSize.width === pageSizes.A5.width ? 8 : 10;

        doc.fontSize(fontSizeTitle).text(invoice.shop.pharmacy_name, { align: 'center', underline: true });
        doc.fontSize(fontSizeText).text(`Address: ${invoice.shop.pharmacy_address}`, { align: 'center' });
        doc.text(`GST: ${invoice.shop.owner_GST_number}`, { align: 'center' });
        doc.text(`Pincode: ${invoice.shop.pincode}`, { align: 'center' });
        doc.moveDown();

        doc.fontSize(fontSizeText).text(`Invoice Number: ${invoice.invoice_number}`, { align: 'center', underline: true });
        doc.moveDown();

        // Customer Details
        doc.text(`Customer Name: ${invoice.customer_name || "-"}`);
        doc.text(`Phone: ${invoice.phone || "-"}`);
        doc.text(`Email: ${invoice.email || "-"}`);
        doc.text(`Address: ${invoice.address || "-"}`);
        doc.moveDown();

        doc.fontSize(fontSizeText).text('Products:', { underline: true });
        doc.moveDown();

        const startX = 30;
        let cursorY = doc.y;

        // Updated column widths for better alignment
        const columnWidths = selectedSize.width === pageSizes.A5.width
            ? [10, 60, 40, 50, 40, 40, 50, 20, 32, 60]
            : [10, 130, 70, 60, 50, 50, 60, 30, 30, 70];

        const headers = ['#', 'Product Name', 'Batch', 'Expiry',  'Unit Price', 'GST%', 'GST Amount','Qty', 'Amount','Net Amount'];

        // Draw table headers
        doc.fontSize(fontSizeTable).fillColor('black').font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), cursorY, {
                width: columnWidths[i], align: 'center'
            });
        });

        cursorY += 15;
        doc.moveTo(startX, cursorY).lineTo(selectedSize.width - 30, cursorY).stroke();
        doc.font('Helvetica');

        // Draw table data
        invoice.products.forEach((product, index) => {
            cursorY += 15;
   
            const rowData = [
                index + 1,
                product.product_name,
                product.product_batch_no,
                product.expiry_date,    
                parseFloat(product.unit_price).toFixed(2), 
                parseFloat(product.gst_percentage).toFixed(2) + '%', 
                parseFloat(product.gst_amount).toFixed(2),         
                String(product.product_quantity || "0"),
                parseFloat(product.unit_price_display).toFixed(2), // Displayed as "Amount"        
                parseFloat(product.total_product_price).toFixed(2)
            ];
            console.log("expiry",product.expiry_date);

            console.log("Total price",product.total_product_price);

            rowData.forEach((text, i) => {
                doc.text(String(text), startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), cursorY, {
                    width: columnWidths[i], align: 'center'
                });
            });
        });

        cursorY += 15;
        doc.moveTo(startX, cursorY).lineTo(selectedSize.width - 30, cursorY).stroke();
        cursorY += 10;

        // Final summary section
        doc.moveDown();
        doc.fontSize(fontSizeText);
        
        const finalTotal = isNaN(invoice.total_price) ? "0.00" : parseFloat(invoice.total_price).toFixed(2);
        console.log("total price",finalTotal);

        // // Show Final Total Price
        // doc.fontSize(fontSizeTitle).fillColor('black').font('Helvetica-Bold');
        // doc.text(`Total Price: ₹ ${finalTotal}`, selectedSize.width - 130, cursorY + 30, { align: 'right' });
        // Fix encoding issues and ensure proper font rendering
doc.font('Helvetica').fontSize(fontSizeTitle).fillColor('black').font('Helvetica-Bold');

// Fix `₹` issue by using 'Rs.' or checking encoding
doc.text(`Total Price: Rs. ${finalTotal}`, selectedSize.width - 130, cursorY + 30, { align: 'right' });



        doc.moveDown();
        
        doc.fontSize(fontSizeText).fillColor('red')
            .text("Sales Return against Bill and less than 30 days only", selectedSize.width - 300, doc.y + 20, { align: 'center', width: 270 });

        doc.end();
    } catch (error) {
        console.error("Error downloading invoice PDF:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





exports.generateInvoicePDF= async(req, res)=> {
    try {
        const { id } = req.params;
        const invoice = await Invoice.getInvoiceById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const pdfBuffer = await generateInvoicePDF(invoice);

        // res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoice_number}.pdf`);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.send(pdfBuffer);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');
        res.end(pdfBuffer);
        

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}





exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params; 
        console.log(req.params);// Get the invoice ID from the URL params

        // Call the model's deleteInvoice method
        const result = await Invoice.deleteInvoice(id); // Ensure this returns the result of the deletion

        // Check if any rows were affected (i.e., the invoice was deleted)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Respond with success if the invoice was deleted
        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};






//correct code of pdf and csv

exports.generateCSVReport = async (req, res) => {
    try {
        const data = await Invoice.getSalesReport();
        const filePath = await generateCSV(data);
        res.download(filePath);
    } catch (error) {
        res.status(500).json({ message: 'Error generating CSV report', error });
    }
};

// 📌 PDF Report Controller
exports.generatePDFReport = async (req, res) => {
    try {
        const data = await Invoice.getSalesReport();
        const filePath = await generatePDF(data);
        res.download(filePath);
    } catch (error) {
        console.error("PDF Generation Error:", error); // ✅ Log the full error
        res.status(500).json({ message: "Error generating PDF report", error });
    }
};


// exports.generatePDFReport = async (req, res) => {
//     try {
//         console.log("📄 Generating PDF Report...");
        
//         const data = await Invoice.getSalesReport();
//         console.log("✅ Sales data retrieved:", data);

//         const filePath = await generatePDF(data);
//         console.log("📂 PDF file generated at:", filePath);

//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", 'attachment; filename="sales-report.pdf"');
        
//         return res.download(filePath, (err) => {
//             if (err) {
//                 console.error("❌ Error while sending file:", err);
//                 res.status(500).json({ message: "Error sending PDF report", error: err });
//             }
//         });
//     } catch (error) {
//         console.error("❌ PDF Generation Error:", error);
//         res.status(500).json({ message: "Error generating PDF report", error });
//     }
// };




//🔹 Total Sales Controller
exports.getTotalSalesController = async (req, res) => {
    try {
        const totalSales = await Invoice.getTotalSales();
        res.status(200).json(totalSales);
    } catch (error) {
        console.error("Error fetching total sales:", error);
        res.status(500).json({ message: "Error fetching total sales", error: error.message });
    }
};

//top 5 most selling products for the given period

exports.getMostSoldMedicinesController = (req, res) => { 
    const { period } = req.query; // Get the time period from the query parameters
    let interval;

    // Set interval based on input
    if (period === "1week") {
        interval = "7 DAY";
    } else if (period === "2week") {
        interval = "14 DAY";
    } else if (period === "1month") {
        interval = "30 DAY";
    } else {
        return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
    }

    Invoice.getMostSoldMedicines(interval)
        .then(response => {
            return res.status(200).json(response);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching most sold medicines",
                error: error.message,
            });
        });
};




//now correctly work and without pagition
exports.getAllSoldProductsController = (req, res) => {
    const { startDate, endDate, period, productName, categoryName } = req.query;
    let interval = null;

    // Set interval if provided
    if (period === "1week") {
        interval = "7";
    } else if (period === "2week") {
        interval = "14";
    } else if (period === "1month") {
        interval = "30";
    } else if (period) {
        return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
    }

    Invoice.getAllSoldProductsWithInvoices(startDate, endDate, interval, productName, categoryName)
        .then(response => res.status(200).json(response))
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching all sold products",
                error: error.message,
            });
        });
};

//pagination code
exports.getAllSoldProductsControllerpage = (req, res) => {
    const { startDate, endDate, period, productName, categoryName, page = 1, limit = 10 } = req.query;
    let interval = null;

    // Convert page & limit to integers
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    // Validate period
    if (period === "1week") {
        interval = "7";
    } else if (period === "2week") {
        interval = "14";
    } else if (period === "1month") {
        interval = "30";
    } else if (period) {
        return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
    }

    Invoice.getAllSoldProductsWithInvoicespage(startDate, endDate, interval, productName, categoryName, limitNumber, offset)
        .then(response => res.status(200).json(response))
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching sold products",
                error: error.message,
            });
        });
};




//correct code of below

// exports.getAllSoldProductsController = (req, res) => { 
//     const { startDate, endDate, period } = req.query;
//     let interval = null;

//     // Set interval if provided
//     if (period === "1week") {
//         interval = "7 DAY";
//     } else if (period === "2week") {
//         interval = "14 DAY";
//     } else if (period === "1month") {
//         interval = "30 DAY";
//     } else if (period) {
//         return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });
//     }

//     Invoice.getAllSoldProductsWithInvoices(startDate, endDate, interval)
//         .then(response => {
//             return res.status(200).json(response);
//         })
//         .catch(error => {
//             console.error(error);
//             return res.status(500).json({
//                 message: "Error fetching all sold products",
//                 error: error.message,
//             });
//         });
// };
