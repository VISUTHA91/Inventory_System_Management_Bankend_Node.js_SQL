const Customer = require('../model/Customer_model');

// Create a new customer
exports.createCustomer = async (req, res) => {
    try {
        const { customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status } = req.body;
        
        console.log("Request body:", req.body);  // Log request body

        if (!customer_name || !phone || !email || !address || !purchased_item || !purchased_quantity || !amount || !status) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const customerId = await Customer.create({ customer_name, phone, email, address, purchased_item, purchased_quantity, amount, status });

        res.status(201).json({ message: 'Customer created successfully', customerId });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};



// Get all customers
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.getAll();
        res.status(200).json(customers);
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
