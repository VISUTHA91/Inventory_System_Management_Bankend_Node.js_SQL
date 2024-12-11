// const db = require('../config/Database'); // Import your database connection

// // Fetch all invoices with total paid and remaining balance
// const getInvoicesWithPayments = (callback) => {
//     const query = `
//         SELECT 
//             i.invoice_id, 
//             i.supplier_id, 
//             i.supplier_bill_no,
//             i.total_amount, 
//             i.invoice_date, 
//             i.due_date, 
//             i.status, 
//             i.created_at, 
//             COALESCE(SUM(p.payment_amount), 0) AS total_paid,
//             (i.total_amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
//         FROM 
//             supplier_invoices i
//         LEFT JOIN 
//             supplier_payments p 
//         ON 
//             i.invoice_id = p.invoice_id
//         GROUP BY 
//             i.invoice_id;
//     `;

//     db.query(query, callback);
// };

// // Update invoice status
// const updateInvoiceStatus = async (invoiceId, status) => {
//     const query = `UPDATE supplier_invoices SET status = ? WHERE invoice_id = ?`;
//     const [result] = await db.promise().query(query, [status, invoiceId]);
//     return result;
// };


// // Insert a new invoice
// const insertInvoice = (supplierId,supplier_bill_no, description,totalAmount, invoiceDate, dueDate, callback) => {
//     const query = `INSERT INTO supplier_invoices (supplier_id, supplier_bill_no,description,total_amount, invoice_date, due_date) VALUES (?, ?, ?, ?,?,?)`;
//     db.query(query, [supplierId, supplier_bill_no,description,totalAmount, invoiceDate, dueDate], callback);
// };

// // Insert a payment
// const insertPayment = (invoiceId, paymentAmount, paymentDate, callback) => {
//     const query = `INSERT INTO supplier_payments (invoice_id, payment_amount, payment_date) VALUES (?, ?, ?)`;
//     db.query(query, [invoiceId, paymentAmount, paymentDate], callback);
// };

// module.exports = {
//     getInvoicesWithPayments,
//     insertInvoice,
//     insertPayment,
// };











const db = require('../config/Database');

// Fetch all invoices with total paid and remaining balance
// const getInvoicesWithPayments = () => {
//     const query = `
//         SELECT 
//             i.invoice_id, 
//             s.company_name, 
//             i.supplier_bill_no,
//             i.description,
//             i.total_amount, 
//             i.invoice_date, 
//             i.due_date, 
//             i.status, 
//             i.created_at, 
//             COALESCE(SUM(p.payment_amount), 0) AS total_paid,
//             (i.total_amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
//         FROM 
//             supplier_invoices i
//         LEFT JOIN 
//             supplier_payments p 
//         ON 
//             i.invoice_id = p.invoice_id
//         GROUP BY 
//             i.invoice_id;
//     `;
//     return db.promise().query(query);
// };


// Fetch all invoices with total paid, remaining balance, and supplier company name
const getInvoicesWithPayments = () => {
    const query = `
        SELECT 
            i.invoice_id, 
            i.supplier_id, 
            s.company_name,   -- Fetch the company name from the supplier table
            i.supplier_bill_no,
            i.description,
            i.total_amount, 
            i.invoice_date, 
            i.due_date, 
            i.status, 
            i.created_at, 
            COALESCE(SUM(p.payment_amount), 0) AS total_paid,
            (i.total_amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
        FROM 
            supplier_invoices i
        LEFT JOIN 
            supplier_payments p 
        ON 
            i.invoice_id = p.invoice_id
        LEFT JOIN
            supplier s   -- Join with the supplier table to fetch the company name
        ON
            i.supplier_id = s.supplier_id  -- Assuming supplier_id is the foreign key
        GROUP BY 
            i.invoice_id;
    `;
    return db.promise().query(query);
};




// Fetch invoice details by ID
const getInvoiceDetails = (invoiceId) => {
    const query = `
        SELECT 
            i.total_amount,
            COALESCE(SUM(p.payment_amount), 0) AS total_paid
        FROM 
            supplier_invoices i
        LEFT JOIN 
            supplier_payments p 
        ON 
            i.invoice_id = p.invoice_id
        WHERE 
            i.invoice_id = ?
        GROUP BY 
            i.invoice_id;
    `;
    return db.promise().query(query, [invoiceId]);
};

// Update invoice status
const updateInvoiceStatus = (invoiceId, status) => {
    const query = `UPDATE supplier_invoices SET status = ? WHERE invoice_id = ?`;
    return db.promise().query(query, [status, invoiceId]);
};

// Insert a new invoice
const insertInvoice = (supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate) => {
    const query = `
        INSERT INTO supplier_invoices 
        (supplier_id, supplier_bill_no, description, total_amount, invoice_date, due_date) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    return db.promise().query(query, [supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate]);
};

// Insert a payment
const insertPayment = (invoiceId, paymentAmount, paymentDate) => {
    const query = `INSERT INTO supplier_payments (invoice_id, payment_amount, payment_date) VALUES (?, ?, ?)`;
    return db.promise().query(query, [invoiceId, paymentAmount, paymentDate]);
};

module.exports = {
    getInvoicesWithPayments,
    getInvoiceDetails,
    updateInvoiceStatus,
    insertInvoice,
    insertPayment,
};
