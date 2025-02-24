const Invoice = require('../model/Invoice_model');
const Customer = require('../model/Customer_model');
const db = require('../config/Database'); 


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

//************my old correct invoice generate only

// //insert invoice details

// // ********my correct code of invoice
// exports.createInvoice = async (req, res) => {
//     try {
//         const { customer_id, products, payment_status} = req.body;
//         console.log('Products:', products);

//         // Validate customer existence
//         const customerExists = await Invoice.checkCustomerExists(customer_id);
//         if (!customerExists) {
//             return res.status(404).json({ message: 'Customer not found' });
//         }

//         // Initialize totals and product details array
//         let totalPrice = 0;
//         let totalGST = 0;
//         let totalDiscount = 0;
//         const detailedProducts = []; // To store detailed product information

//         // Validate products and calculate totals
//         for (const item of products) {
//             const productDetails = await Invoice.checkProductExists(item.product_id);
//             console.log("Product Details:", productDetails);

//             if (!productDetails) {
//                 return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
//             }
//             if (productDetails.product_quantity < item.quantity) {
//                 return res.status(400).json({
//                     message: `Insufficient stock for product with ID ${item.product_id}`,
//                 });
//             }

//             // Calculate the price, GST, and discount for this product
//             const unitPrice = parseFloat(productDetails.product_price);
//             const subtotal = unitPrice * item.quantity;

//             // Calculate GST and Discount for this product
//             const gstAmount = parseFloat(((subtotal * productDetails.GST) / 100).toFixed(2));
//             const discountAmount = parseFloat(((subtotal * productDetails.product_discount) / 100).toFixed(2));

//             // Update totals
//             totalPrice += subtotal;
//             totalGST += gstAmount;
//             totalDiscount += discountAmount;

//             // Add to detailed products list
//             detailedProducts.push({
//                 product_id: item.product_id,
//                 product_name: productDetails.product_name,
//                 unit_price: unitPrice.toFixed(2),
//                 quantity: item.quantity,
//                 subtotal: subtotal.toFixed(2),
//                 discount: discountAmount.toFixed(2),
//                 gst: gstAmount.toFixed(2),
//                 final_price: (subtotal + gstAmount - discountAmount).toFixed(2),
//             });
//         }

//         // Calculate the final price for the invoice
//         const finalPrice = parseFloat((totalPrice + totalGST - totalDiscount).toFixed(2));

//         // Check for calculation errors
//         if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalGST) || isNaN(totalDiscount)) {
//             return res.status(400).json({ message: 'Error in calculating prices' });
//         }

//         // Generate an invoice number
//         const invoiceNumber = await Invoice.generateInvoiceNumber();

//         try {
//             // Update stock for all products
//             for (const item of products) {
//                 await Invoice.updateStock(item.product_id, item.quantity);
//             }

//             // Prepare invoice data for saving
//             const invoiceData = {
//                 invoice_number: invoiceNumber,
//                 customer_id,
//                 product_id: products.map((p) => p.product_id),
//                 quantity: products.map((p) => p.quantity),
//                 discount: totalDiscount.toFixed(2),
//                 total_price: totalPrice.toFixed(2),
//                 final_price: finalPrice.toFixed(2),
//                 payment_status
//             };

//             // Create the invoice in the database
//             const invoice = await Invoice.createInvoice(invoiceData);

//             // Send the response with the invoice details
//             res.status(201).json({
//                 message: 'Invoice created successfully',
//                 invoice_details: {
//                     invoice_id: invoice.invoice_id,
//                     invoice_number: invoice.invoice_number,
//                     customer_id: invoice.customer_id,
//                     payment_status: invoice.payment_status,
                 
//                     products: detailedProducts,
//                     summary: {
//                         total_price: totalPrice.toFixed(2),
//                         total_discount: totalDiscount.toFixed(2),
//                         total_gst: totalGST.toFixed(2),
//                         final_price: finalPrice.toFixed(2),
//                     },
//                 },
//             });
//         } catch (error) {
//             console.error('Error creating invoice:', error);
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
//     } catch (error) {
//         console.error('Error creating invoice:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

//****************visutha provide code

// exports.createInvoice = async (req, res) => {
//     try {
//         // Fix: Map invoiceDetails to products
//         const { customer_name, phone, invoiceDetails, payment_status } = req.body;
//         const products = invoiceDetails;

//         console.log("Received Body:", req.body);
//         console.log("Products:", products);

//         if (!Array.isArray(products) || products.length === 0) {
//             return res.status(400).json({ message: 'Invalid or missing product data' });
//         }

//         let customer_id;
//         const existingCustomer = await Customer.checkCustomerExists(phone);
//         if (existingCustomer) {
//             customer_id = existingCustomer.customer_id;
//         } else {
//             customer_id = await Customer.create({ customer_name, phone });
//             console.log("New customer created with ID:", customer_id);
//         }

//         let totalPrice = 0;
//         let totalGST = 0;
//         let totalDiscount = 0;
//         const detailedProducts = [];

//         for (const item of products) {
//             const productDetails = await Invoice.checkProductExists(item.id); // Fix: Match product ID field
//             if (!productDetails) {
//                 return res.status(404).json({ message: `Product with ID ${item.id} not found `});
//             }
//             if (productDetails.product_quantity < item.product_quantity) {
//                 return res.status(400).json({ message: `Insufficient stock for product with ID ${item.id} `});
//             }

//             const unitPrice = parseFloat(item.sellingPrice);
//             const subtotal = unitPrice * item.product_quantity;
//             const gstAmount = parseFloat(((subtotal * parseFloat(item.gst)) / 100).toFixed(2));
//             const discountAmount = 0; // You might need to handle discounts properly

//             totalPrice += subtotal;
//             totalGST += gstAmount;
//             totalDiscount += discountAmount;

//             detailedProducts.push({
//                 product_id: item.id,
//                 product_name: item.product_name,
//                 unit_price: unitPrice.toFixed(2),
//                 quantity: item.product_quantity,
//                 subtotal: subtotal.toFixed(2),
//                 discount: discountAmount.toFixed(2),
//                 gst: gstAmount.toFixed(2),
//                 final_price: (subtotal + gstAmount - discountAmount).toFixed(2),
//             });
//         }
//         const finalPrice = parseFloat((totalPrice + totalGST - totalDiscount).toFixed(2));

//         if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalGST) || isNaN(totalDiscount)) {
//             return res.status(400).json({ message: 'Error in calculating prices' });
//         }
//         const invoiceNumber = await Invoice.generateInvoiceNumber();
//         try {
//             for (const item of products) {
//                 await Invoice.updateStock(item.id, item.product_quantity);
//             }
//             const invoiceData = {
//                 invoice_number: invoiceNumber,
//                 customer_id,
//                 product_id: products.map((p) => p.id),
//                 quantity: products.map((p) => p.product_quantity),
//                 discount: totalDiscount.toFixed(2),
//                 total_price: totalPrice.toFixed(2),
//                 final_price: finalPrice.toFixed(2),
//                 payment_status
//             };
//             const invoice = await Invoice.createInvoice(invoiceData);
//             res.status(201).json({
//                 message: 'Invoice created successfully',
//                 invoice_details: {
//                     invoice_id: invoice.invoice_id,
//                     invoice_number: invoice.invoice_number,
//                     customer_id: invoice.customer_id,
//                     payment_status: invoice.payment_status,
//                     products: detailedProducts,
//                     summary: {
//                         total_price: totalPrice.toFixed(2),
//                         total_discount: totalDiscount.toFixed(2),
//                         total_gst: totalGST.toFixed(2),
//                         final_price: finalPrice.toFixed(2),
//                     },
//                 },
//             });
//         } catch (error) {
//             console.error('Error creating invoice:', error);
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
//     } catch (error) {
//         console.error('Error creating invoice:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

//****************auto generate customer with invoice

exports.createInvoice = async (req, res) => {
    try {

        const { customer_name, phone, products, payment_status } = req.body;

        console.log(req.body);
        console.log('Products:', products);

        let customer_id;

        // Check if the customer exists
        const existingCustomer = await Customer.checkCustomerExists(phone);
        if (existingCustomer) {
            customer_id = existingCustomer.customer_id; // Fetch customer ID if exists
        } else {
            // Create a new customer if not found
            customer_id = await Customer.create({ customer_name, phone });
            console.log("New customer created with ID:", customer_id);
        }

        let totalPrice = 0;
        let totalGST = 0;
        let totalDiscount = 0;
        const detailedProducts = [];

        // Validate products and calculate totals
        for (const item of products) {
            const productDetails = await Invoice.checkProductExists(item.product_id);
            if (!productDetails) {
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
            }
            if (productDetails.product_quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product with ID ${item.product_id}`,
                });
            }

            const unitPrice = parseFloat(productDetails.product_price);
            const subtotal = unitPrice * item.quantity;
            const gstAmount = parseFloat(((subtotal * productDetails.GST) / 100).toFixed(2));
            const discountAmount = parseFloat(((subtotal * productDetails.product_discount) / 100).toFixed(2));

            totalPrice += subtotal;
            totalGST += gstAmount;
            totalDiscount += discountAmount;

            detailedProducts.push({
                product_id: item.product_id,
                product_name: productDetails.product_name,
                unit_price: unitPrice.toFixed(2),
                quantity: item.quantity,
                subtotal: subtotal.toFixed(2),
                discount: discountAmount.toFixed(2),
                gst: gstAmount.toFixed(2),
                final_price: (subtotal + gstAmount - discountAmount).toFixed(2),
            });
        }

        const finalPrice = parseFloat((totalPrice + totalGST - totalDiscount).toFixed(2));

        if (isNaN(finalPrice) || isNaN(totalPrice) || isNaN(totalGST) || isNaN(totalDiscount)) {
            return res.status(400).json({ message: 'Error in calculating prices' });
        }

        const invoiceNumber = await Invoice.generateInvoiceNumber();

        try {
            for (const item of products) {
                await Invoice.updateStock(item.product_id, item.quantity);
            }

            const invoiceData = {
                invoice_number: invoiceNumber,
                customer_id,
                product_id: products.map((p) => p.product_id),
                quantity: products.map((p) => p.quantity),
                discount: totalDiscount.toFixed(2),
                total_price: totalPrice.toFixed(2),
                final_price: finalPrice.toFixed(2),
                payment_status
            };

            const invoice = await Invoice.createInvoice(invoiceData);

            res.status(201).json({
                message: 'Invoice created successfully',
                invoice_details: {
                    invoice_id: invoice.invoice_id,
                    invoice_number: invoice.invoice_number,
                    customer_id: invoice.customer_id,
                    payment_status: invoice.payment_status,
                    products: detailedProducts,
                    summary: {
                        total_price: totalPrice.toFixed(2),
                        total_discount: totalDiscount.toFixed(2),
                        total_gst: totalGST.toFixed(2),
                        final_price: finalPrice.toFixed(2),
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
exports.updateInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id; // Get the invoice ID from the URL
        const { invoice_number, customer_id, products, payment_status } = req.body;

        // Check if customer exists before updating the invoice
        const customerExists = await Invoice.checkCustomerExists(customer_id);
        if (!customerExists) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update invoice data
        const updatedInvoiceData = {
            invoice_number,
            customer_id,
            products,
            payment_status,
            invoice_updated_at : new Date(),
        };

        // Call the model method to update the invoice
        const updatedInvoice = await Invoice.updateInvoice(invoiceId, updatedInvoiceData);

        res.status(200).json({
            message: 'Invoice updated successfully',
            invoice: updatedInvoice,
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


//invoice number to use the details

// exports.getInvoiceDetails = async (req, res) => {
//     try {
//         const { invoice_number } = req.params;
//         console.log(req.params);

//         const results = await Invoice.getInvoiceDetails(invoice_number); // No need to destructure it
//         if (results.length === 0) {
//             return res.status(404).json({ message: "Invoice not found" });
//         }

//         res.status(200).json({ data: results[0] }); // Return the first result
//     } catch (error) {
//         console.error("Error fetching invoice:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };




const PDFDocument = require('pdfkit');

exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ data: invoice });
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};





exports.downloadInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: "Invalid invoice ID" });
        }

        const invoice = await Invoice.getInvoiceById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        const doc = new PDFDocument();

        // Attach the PDF response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${invoice.invoice_number}.pdf`);

        // Stream the PDF to the response
        doc.pipe(res);

        // Add shop details
        doc.fontSize(20).text(invoice.shop.pharmacy_name, { align: 'center', underline: true });
        doc.fontSize(12).text(`Address: ${invoice.shop.pharmacy_address}`, { align: 'center' });
        doc.text(`GST: ${invoice.shop.owner_GST_number}`, { align: 'center' });
        doc.text(`Pincode: ${invoice.shop.pincode}`, { align: 'center' });
        doc.moveDown();

        // Add customer details
        doc.fontSize(16).text(`Invoice Number#${invoice.invoice_number}`, { align: 'center', underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Customer Name: ${invoice.customer_name}`);
        doc.text(`Phone: ${invoice.phone}`);
        doc.text(`Email: ${invoice.email}`);
        doc.text(`Address: ${invoice.address}`);
        doc.moveDown();

        // Add table header for products
        doc.fontSize(14).text('Products:', { underline: true });
        doc.moveDown();

        doc.fontSize(12);
        const tableHeader = ['#', 'Product Name', 'Batch No', 'Qty', 'MRP', 'Selling Price', 'GST'];
        const tableColumnWidths = [30, 150, 80, 40, 60, 80, 40];

        // Draw table header
        let cursorY = doc.y; // Capture current Y position
        doc.text(tableHeader[0], 50, cursorY, { width: tableColumnWidths[0], align: 'center' });
        doc.text(tableHeader[1], 80, cursorY, { width: tableColumnWidths[1] });
        doc.text(tableHeader[2], 230, cursorY, { width: tableColumnWidths[2], align: 'center' });
        doc.text(tableHeader[3], 310, cursorY, { width: tableColumnWidths[3], align: 'center' });
        doc.text(tableHeader[4], 360, cursorY, { width: tableColumnWidths[4], align: 'center' });
        doc.text(tableHeader[5], 420, cursorY, { width: tableColumnWidths[5], align: 'center' });
        doc.text(tableHeader[6], 500, cursorY, { width: tableColumnWidths[6], align: 'center' });

        // Draw a line below the header
        doc.moveTo(50, cursorY + 15).lineTo(550, cursorY + 15).stroke();

        // Add product rows
        invoice.products.forEach((product, index) => {
            cursorY += 20;
            doc.text(index + 1, 50, cursorY, { width: tableColumnWidths[0], align: 'center' });
            doc.text(product.product_name, 80, cursorY, { width: tableColumnWidths[1] });
            doc.text(product.product_batch_no, 230, cursorY, { width: tableColumnWidths[2], align: 'center' });
            doc.text(invoice.invoice_quantity, 310, cursorY, { width: tableColumnWidths[3], align: 'center' });
            doc.text(parseFloat(product.product_price).toFixed(2), 360, cursorY, { width: tableColumnWidths[4], align: 'center' });
            doc.text(parseFloat(product.selling_price).toFixed(2), 420, cursorY, { width: tableColumnWidths[5], align: 'center' });
            doc.text(parseFloat(product.product_gst).toFixed(2) + '%', 500, cursorY, { width: tableColumnWidths[6], align: 'center' });
        });

        // Add a line below the last product
        doc.moveTo(50, cursorY + 15).lineTo(550, cursorY + 15).stroke();

        // Add invoice summary
        doc.moveDown(2);
        doc.fontSize(12).text(`Subtotal: ${parseFloat(invoice.total_price).toFixed(2)}`, { align: 'right' });
        doc.text(`Discount: ${parseFloat(invoice.discount).toFixed(2)}`, { align: 'right' });
        doc.text(`Final Price: ${parseFloat(invoice.final_price).toFixed(2)}`, { align: 'right' });

        // End the document
        doc.end();
    } catch (error) {
        console.error("Error downloading invoice PDF:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};






// Delete Invoice


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





const { generateCSV, generatePDF } = require("../Helper/export_helper");

exports.getInvoiceListController = async (req, res) => {
    try {
        const { startDate, endDate, period, productName, categoryName, format } = req.query;
        let interval = null;

        if (period === "1week") interval = 7;
        else if (period === "2week") interval = 14;
        else if (period === "1month") interval = 30;
        else if (period) return res.status(400).json({ message: "Invalid period. Use 1week, 2week, or 1month." });

        const response = await Invoice.getInvoiceList(startDate, endDate, interval, productName, categoryName);

        if (!response || response.length === 0) {
            return res.status(404).json({ message: "No invoices found" });
        }

        // Return JSON if no format is specified
        if (!format) return res.status(200).json(response);

        // Handle CSV Export
        if (format === "csv") return await generateCSV(response, res, "invoice_report.csv");

        // Handle PDF Export
        if (format === "pdf") return await generatePDF(response, res, "invoice_report.pdf");

        return res.status(400).json({ message: "Invalid format. Use csv or pdf." });
    } catch (error) {
        console.error("Error in invoice controller:", error);
        res.status(500).json({ message: "Error fetching invoice data", error: error.message });
    }
};




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

//underforming least slaes products

exports.getLeastSoldMedicinesController = (req, res) => {
    const { period } = req.query; 
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

    Invoice.getLeastSoldMedicines(interval)
        .then(response => {
            return res.status(200).json(response);
        })
        .catch(error => {
            console.error(error);
            return res.status(500).json({
                message: "Error fetching least sold medicines",
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
