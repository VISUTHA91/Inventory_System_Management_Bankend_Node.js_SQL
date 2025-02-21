
// controllers/supplierController.js
const Supplier = require('../model/Supplier_model');


exports.createSupplier = async (req, res) => {
    try {
        // Validate that supplier_gst_number is provided in the request body
        if (!req.body.supplier_gst_number || req.body.supplier_gst_number.trim() === '') {
            return res.status(400).json({ error: 'Supplier GST number is required' });
        }

        const supplierId = await Supplier.create(req.body);
        
        
        res.status(201).json({ message: 'Supplier created successfully', supplierId });
        console.log(supplierId);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Failed to create supplier' });
    }
};

//my already corrected code
// exports.getAllSuppliers = async (req, res) => {
//     try {
//         const suppliers = await Supplier.getAll();
//         res.status(200).json(suppliers);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Failed to fetch suppliers' });
//     }
// };



exports.getAllSuppliers = async (req, res) => { 
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page

        const { suppliers, totalSuppliers } = await Supplier.getAll(page, limit);

        res.status(200).json({
            success: true,
            message: "Suppliers fetched successfully",
            page: page,
            limit: limit,
            totalSuppliers: totalSuppliers,
            totalPages: Math.ceil(totalSuppliers / limit),
            data: suppliers
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
};

exports.getAllSupplierNames = async (req, res) => {
    try {
        const supplierNames = await Supplier.getAllSupplierNames();

        res.status(200).json({
            success: true,
            message: "Supplier names fetched successfully",
            data: supplierNames.map(supplier => supplier.company_name)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch supplier names' });
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
        // Validate that supplier_gst_number is provided in the request body
        if (!req.body.supplier_gst_number || req.body.supplier_gst_number.trim() === '') {
            return res.status(400).json({ error: 'Supplier GST number is required' });
        }

        await Supplier.update(req.params.id, req.body);
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
