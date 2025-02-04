

// const supplierModel = require('../model/Supplier_invoice_model');

// // Get all invoices with payment details
// const getInvoices = (req, res) => {
//     supplierModel.getInvoicesWithPayments((err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(200).json(results);
//     });
// };

// // Add a new invoice
// const addInvoice = (req, res) => {
//     const { supplierId, supplier_bill_no,description,totalAmount, invoiceDate, dueDate } = req.body;

//     supplierModel.insertInvoice(supplierId, supplier_bill_no,description,totalAmount, invoiceDate, dueDate, (err, results) => {
//         if (err) {
//             return res.status(500).json({ error: err.message });
//         }
//         res.status(201).json({ message: 'Invoice added successfully', invoiceId: results.insertId });
//     });
// };

// //Add payment details

// const addPayment = async (req, res) => {
//     const { invoiceId, paymentAmount, paymentDate } = req.body;

//     try {
//         // Insert payment into the database
//         const paymentResult = await supplierModel.insertPayment(invoiceId, paymentAmount, paymentDate);

//         // Fetch the updated invoice details to calculate remaining balance
//         const invoiceDetails = await supplierModel.getInvoiceDetails(invoiceId);
//         const totalPaid = invoiceDetails.total_paid + parseFloat(paymentAmount);
//         const remainingBalance = parseFloat(invoiceDetails.total_amount) - totalPaid;

//         // Update the status if fully paid
//         if (remainingBalance <= 0) {
//             await supplierModel.updateInvoiceStatus(invoiceId, 'Paid');
//         }

//         res.status(201).json({ message: 'Payment added successfully', paymentId: paymentResult.insertId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };



// module.exports = {
//     getInvoices,
//     addInvoice,
//     addPayment,
// };







// my full correct module is below



// const supplierModel = require('../model/Supplier_invoice_model');

// // Get all invoices with payment details
// const getInvoices = async (req, res) => {
//     try {
//         const [results] = await supplierModel.getInvoicesWithPayments();
//         res.status(200).json(results);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Add a new invoice
// const addInvoice = async (req, res) => {
//     const { supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate } = req.body;

//     try {
//         const [result] = await supplierModel.insertInvoice(
//             supplierId, 
//             supplierBillNo, 
//             description, 
//             totalAmount, 
//             invoiceDate, 
//             dueDate
//         );
//         res.status(201).json({ message: 'Invoice added successfully', invoiceId: result.insertId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Add payment details
// const addPayment = async (req, res) => {
//     const { invoiceId, paymentAmount, paymentDate } = req.body;

//     //paymentAmount is mean on how much admin have to paid in supplier

//     try {
//         // Insert payment into the database
//         const [paymentResult] = await supplierModel.insertPayment(invoiceId, paymentAmount, paymentDate);

//         // Fetch the updated invoice details to calculate remaining balance
//         const [invoiceDetails] = await supplierModel.getInvoiceDetails(invoiceId);
//         const totalPaid = parseFloat(invoiceDetails[0].total_paid) + parseFloat(paymentAmount);
//         const remainingBalance = parseFloat(invoiceDetails[0].total_amount) - totalPaid;

//         // Update the status if fully paid
//         if (remainingBalance <= 0) {

//             await supplierModel.updateInvoiceStatus(invoiceId, 'Paid');

//         }

//         res.status(201).json({ message: 'Payment added successfully', paymentId: paymentResult.insertId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     getInvoices,
//     addInvoice,
//     addPayment,
// };



const supplierModel = require('../model/Supplier_invoice_model');

// Insert a new invoice
const createInvoice = async (req, res) => {
    const { supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate } = req.body;
    try {
        const [result] = await supplierModel.insertInvoice(supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate);
        res.status(201).json({ success: true, message: 'Invoice created successfully', invoiceId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating invoice', error });
    }
};

// Insert a payment
const addPayment = async (req, res) => {
    const { invoiceId, paymentAmount, paymentDate } = req.body;
    try {
        await supplierModel.insertPayment(invoiceId, paymentAmount, paymentDate);
        res.status(201).json({ success: true, message: 'Payment added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding payment', error });
    }
};

// Fetch all invoices with payments
const listInvoicesWithPayments = async (req, res) => {
    try {
        const [rows] = await supplierModel.getInvoicesWithPayments();
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching invoices', error });
    }
};

// Fetch invoice details by ID
const getInvoice = async (req, res) => {
    const { invoiceId } = req.params;
    try {
        const [rows] = await supplierModel.getInvoiceDetails(invoiceId);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching invoice details', error });
    }
};

module.exports = {
    createInvoice,
    addPayment,
    listInvoicesWithPayments,
    getInvoice,
};
