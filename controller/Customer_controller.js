const Customer = require('../model/Customer_model');

// // Create a new customer 
//my old corrected code
// exports.createCustomer = async (req, res) => {
//     try {
//         const { customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status } = req.body;
        
//         console.log("Request body:", req.body);  // Log request body

//         if (!customer_name || !phone || !email || !address || !purchased_item || !purchased_quantity || !amount || !status) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         const customerId = await Customer.create({ customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status });

//         res.status(201).json({ message: 'Customer created successfully', customerId });
//     } catch (err) {
//         console.error("Error:", err);
//         res.status(500).json({ error: 'Failed to create customer' });
//     }
// };


// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const {
            customer_name,
            phone,
            email,
            address,
            purchased_item,
            purchased_quantity,
            amount,
            status,
            customer_gst_number,
        } = req.body;

        console.log("Request body:", req.body); // Log request body

        // Validate required fields
        if (!customer_name || !phone || !email || !address || !purchased_item || !purchased_quantity || !amount || !status) {
            return res.status(400).json({ error: 'All fields except GST number are required' });
        }

        // Handle GST number
        const gstNumber = customer_gst_number && customer_gst_number.trim() !== '' ? customer_gst_number : '-';

        // Insert the customer
        const customerId = await Customer.create({
            customer_name,
            phone,
            email,
            address,
            purchased_item,
            purchased_quantity,
            amount,
            status,
            customer_gst_number: gstNumber,
        });

        res.status(201).json({ message: 'Customer created successfully', customerId });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};




// Get all customers
// exports.getAllCustomers = async (req, res) => {
//     try {
//         const customers = await Customer.getAll();
//         res.status(200).json(customers);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to fetch customers' });
//     }
// };


exports.getAllCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 customers per page

        const customers = await Customer.getAll(page, limit);

        // Handle empty customer list
        if (customers.length === 0) {
            return res.status(404).json({ message: 'No customers found' });
        }

        res.status(200).json({
            message: 'Customers fetched successfully',
            page: page,
            limit: limit,
            data: customers
            ////ghjkfghjkjgfghjk
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};


// Get a customer by ID
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.getById(req.params.id);
        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch customer' });
    }
};

// Update customer
exports.updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customerData = req.body;
        await Customer.update(customerId, customerData);
        res.status(200).json({ message: 'Customer updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update customer' });
    }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
    try {
        await Customer.delete(req.params.id);
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};
