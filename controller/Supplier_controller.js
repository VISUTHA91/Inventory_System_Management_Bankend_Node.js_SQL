// controllers/supplierController.js
// const Supplier = require('../model/Supplier_model');

// // Create supplier
// exports.createSupplier = async (req, res) => {
//     try {
//         const { company_name, phone_number, email, address, city, state, postal_code, country, status, credit, debit, balance } = req.body;
//          // Ensure the `debit` value is valid
//          if (debit < 0) {
//             return res.status(400).json({ error: 'Debit cannot be negative' });
//         }

//         const supplierId = await Supplier.create({ company_name, phone_number, email, address, city, state, postal_code, country, status, credit, debit, balance });
//         res.status(201).json({ message: 'Supplier created successfully', supplierId });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to create supplier' });
//     }
// };

// // Get all suppliers
// exports.getAllSuppliers = async (req, res) => {
//     try {
//         const suppliers = await Supplier.getAll();
//         res.status(200).json(suppliers);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to fetch suppliers' });
//     }
// };

// // Get supplier by ID
// exports.getSupplierById = async (req, res) => {
//     try {
//         const supplier = await Supplier.getById(req.params.id);
//         if (supplier) {
//             res.status(200).json(supplier);
//         } else {
//             res.status(404).json({ error: 'Supplier not found' });
//         }
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to fetch supplier' });
//     }
// };

// // Update supplier
// exports.updateSupplier = async (req, res) => {
//     try {
//         await Supplier.update(req.params.id, req.body);
//         res.status(200).json({ message: 'Supplier updated successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to update supplier' });
//     }
// };




// // Delete supplier
// exports.deleteSupplier = async (req, res) => {
//     try {
//         await Supplier.delete(req.params.id);
//         res.status(200).json({ message: 'Supplier deleted successfully' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to delete supplier' });
//     }
// };











const Supplier = require('../model/Supplier_model');

exports.createSupplier = async (req, res) => {
    try {
        const supplierId = await Supplier.create(req.body);
        res.status(201).json({ message: 'Supplier created successfully', supplierId });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Failed to create supplier' });
    }
};

exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.getAll();
        res.status(200).json(suppliers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.getById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.status(200).json(supplier);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch supplier' });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        await Supplier.update(req.params.id, req.body);
        console.log(req.body);
        console.log(req.params.id);
        res.status(200).json({ message: 'Supplier updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Failed to update supplier' });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        await Supplier.delete(req.params.id);
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
};
