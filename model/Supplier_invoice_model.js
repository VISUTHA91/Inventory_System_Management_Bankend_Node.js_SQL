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











// const db = require('../config/Database');

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
// const getInvoicesWithPayments = () => {
//     const query = `
//         SELECT 
//             i.invoice_id, 
//             i.supplier_id, 
//             s.company_name,   -- Fetch the company name from the supplier table
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
//         LEFT JOIN
//             supplier s   -- Join with the supplier table to fetch the company name
//         ON
//             i.supplier_id = s.supplier_id  -- Assuming supplier_id is the foreign key
//         GROUP BY 
//             i.invoice_id;
//     `;
//     return db.promise().query(query);
// };









// bleow is my correct code

// const getInvoicesWithPayments = () => {
//     const query = `
//         SELECT 
//             i.invoice_id, 
//             i.supplier_id, 
//             s.company_name,   -- Fetch the company name from the supplier table
//             i.supplier_bill_no,
//             i.description,
//             i.bill_amount, 
//             i.invoice_bill_date, 
//             i.due_date, 
//             CASE 
//                 WHEN (i.bill_amount - COALESCE(SUM(p.payment_amount), 0)) = 0 THEN 'Paid'
//                 ELSE 'Pending'
//             END AS status,    -- Dynamically compute the status
//             i.created_at, 
//             COALESCE(SUM(p.payment_amount), 0) AS total_paid,
//             (i.total_amount - COALESCE(SUM(p.payment_amount), 0)) AS remaining_balance
//         FROM 
//             supplier_invoices i
//         LEFT JOIN 
//             supplier_payments p 
//         ON 
//             i.invoice_id = p.invoice_id
//         LEFT JOIN
//             supplier s   -- Join with the supplier table to fetch the company name
//         ON
//             i.supplier_id = s.supplier_id  -- Assuming supplier_id is the foreign key
//         GROUP BY 
//             i.invoice_id;
//     `;
//     return db.promise().query(query);
// };






// // Fetch invoice details by ID
// const getInvoiceDetails = (invoiceId) => {
//     const query = `
//         SELECT 
//             i.bill_amount,
//             COALESCE(SUM(p.payment_amount), 0) AS total_paid
//         FROM 
//             supplier_invoices i
//         LEFT JOIN 
//             supplier_payments p 
//         ON 
//             i.invoice_id = p.invoice_id
//         WHERE 
//             i.invoice_id = ?
//         GROUP BY 
//             i.invoice_id;
//     `;
//     return db.promise().query(query, [invoiceId]);
// };

// // Update invoice status
// const updateInvoiceStatus = (invoiceId, status) => {
//     const query = `UPDATE supplier_invoices SET status = ? WHERE invoice_id = ?`;
//     return db.promise().query(query, [status, invoiceId]);
// };

// // Insert a new invoice
// const insertInvoice = (supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate) => {
//     const query = `
//         INSERT INTO supplier_invoices 
//         (supplier_id, supplier_bill_no, description, bill_amount, invoice_bill_date, due_date) 
//         VALUES (?, ?, ?, ?, ?, ?)
//     `;
//     return db.promise().query(query, [supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate]);
// };

// // Insert a payment
// const insertPayment = (invoiceId, paymentAmount, paymentDate) => {
//     const query = `INSERT INTO supplier_payments (invoice_id, payment_amount, payment_date) VALUES (?, ?, ?)`;
//     return db.promise().query(query, [invoiceId, paymentAmount, paymentDate]);
// };

// module.exports = {
//     getInvoicesWithPayments,
//     getInvoiceDetails,
//     updateInvoiceStatus,
//     insertInvoice,
//     insertPayment,
// };




const db = require('../config/Database');

// Insert a new invoice
const insertInvoice = (supplierId, supplierBillNo, description, totalAmount, invoiceDate, dueDate) => {
    const query = `
        INSERT INTO supplier_invoices 
        (supplier_id, supplier_bill_no, description, bill_amount, balance_bill_amount, invoice_bill_date, due_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return db.promise().query(query, [
        supplierId,
        supplierBillNo,
        description,
        totalAmount,
        totalAmount, // Initial balance is equal to the bill amount
        invoiceDate,
        dueDate,
    ]);
};


// Get all invoices for a supplier
const getInvoicesBySupplier = async (supplierId) => {
  try {
    const query = `
      SELECT 
          si.invoice_id, 
          si.supplier_id, 
          s.company_name,
          si.supplier_bill_no, 
          si.description, 
          si.bill_amount, 
          si.balance_bill_amount, 
          si.invoice_bill_date, 
          si.due_date, 
          si.status, 
          si.created_at,
          (si.bill_amount - si.balance_bill_amount) AS total_paid
      FROM supplier_invoices si
      JOIN supplier s ON si.supplier_id = s.supplier_id
      WHERE si.supplier_id = ?`;

    const [rows] = await db.promise().query(query, [supplierId]);
    return rows;
  } catch (error) {
    console.error("Error fetching supplier invoices:", error);
    throw error;
  }
};

// Insert a payment


const insertPayment = async (invoiceId, paymentAmount, paymentDate) => {
    const connection = await db.promise().getConnection(); // Get a connection for transaction

    try {
        // Start a transaction
        await connection.beginTransaction();

        // Get the current balance and bill amount for validation
        const fetchInvoiceQuery = `
            SELECT bill_amount, 
                   COALESCE((SELECT SUM(payment_amount) FROM supplier_payments WHERE invoice_id = ?), 0) AS total_paid
            FROM supplier_invoices
            WHERE invoice_id = ?
        `;
        const [invoiceData] = await connection.query(fetchInvoiceQuery, [invoiceId, invoiceId]);

        if (!invoiceData.length) {
            throw new Error('Invoice not found.');
        }

        const { bill_amount: billAmount, total_paid: totalPaid } = invoiceData[0];

        // Ensure the values are numeric
        const paymentAmountNumeric = parseFloat(paymentAmount);
        const billAmountNumeric = parseFloat(billAmount);
        const totalPaidNumeric = parseFloat(totalPaid);

        // Validate if payment exceeds the bill amount
        const newTotalPaid = totalPaidNumeric + paymentAmountNumeric;

        if (newTotalPaid > billAmountNumeric) {
            const excessAmount = newTotalPaid - billAmountNumeric;
            throw new Error(`Payment exceeds the total bill amount. You are overpaying by ${excessAmount.toFixed(2)}.`);
        }

        // Insert the payment
        const paymentQuery = `
            INSERT INTO supplier_payments (invoice_id, payment_amount, payment_date) 
            VALUES (?, ?, ?)
        `;
        await connection.query(paymentQuery, [invoiceId, paymentAmountNumeric, paymentDate]);

        // Update the status
        const updateStatusQuery = `
            UPDATE supplier_invoices
            SET status = CASE
                            WHEN (bill_amount - COALESCE((SELECT SUM(payment_amount) 
                                                          FROM supplier_payments 
                                                          WHERE invoice_id = ?), 0)) = 0 THEN 'Paid'
                            ELSE 'Pending'
                         END
            WHERE invoice_id = ?
        `;
        await connection.query(updateStatusQuery, [invoiceId, invoiceId]);

        // Update balance_bill_amount dynamically
        const updateBalanceQuery = `
            UPDATE supplier_invoices
            SET balance_bill_amount = bill_amount - COALESCE((SELECT SUM(payment_amount) 
                                                              FROM supplier_payments 
                                                              WHERE invoice_id = ?), 0)
            WHERE invoice_id = ?
        `;
        await connection.query(updateBalanceQuery, [invoiceId, invoiceId]);

        // Commit the transaction
        await connection.commit();
        return { message: 'Payment inserted and balance updated successfully.' };
    } catch (error) {
        // Rollback in cas
        //    // Log the error details for debugging
       
          console.error("Payment insertion error:", error);
        await connection.rollback();
        throw new Error(error.message);
    } finally {
        // Release the connection
        connection.release();
    }
};





// Fetch all invoices with payments
const getInvoicesWithPayments = () => {
    const query = `
        SELECT 
            i.invoice_id, 
            i.supplier_id, 
            s.company_name, 
            i.supplier_bill_no,
            i.description,
            i.bill_amount, 
            i.balance_bill_amount, 
            i.invoice_bill_date, 
            i.due_date, 
            CASE 
                WHEN i.balance_bill_amount = 0 THEN 'Paid'
                ELSE 'Pending'
            END AS status, 
            i.created_at, 
            COALESCE(SUM(p.payment_amount), 0) AS total_paid
        FROM 
            supplier_invoices i
        LEFT JOIN 
            supplier_payments p 
        ON 
            i.invoice_id = p.invoice_id
        LEFT JOIN
            supplier s
        ON
            i.supplier_id = s.supplier_id
        GROUP BY 
            i.invoice_id;
    `;
    return db.promise().query(query);
};

// Fetch invoice details by ID
const getInvoiceDetails = (invoiceId) => {
    const query = `
        SELECT 
            i.invoice_id,
            i.supplier_id,
            i.bill_amount,
            i.balance_bill_amount,
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

module.exports = {
    insertInvoice,
    insertPayment,
    getInvoicesWithPayments,
    getInvoiceDetails,
    getInvoicesBySupplier
    
};
