const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controller/Product_controller');
const { authMiddleware, adminOnly, adminOrStaff } = require("../middleware/auth_middleware");

const productImportController = require('../controller/Product_import_controller');
const productExportController = require('../controller/Product_export_controller');


// Routes for Product Operations
router.post('/inproduct', authMiddleware, adminOnly, productController.createProduct);  // Create product

//product pagination 


router.get('/Allpro_pagination', authMiddleware, adminOrStaff, productController.getAllProducts);  // Get all products


//product list only

router.get('/Allpro_list', authMiddleware, adminOrStaff, productController.getAllPro);  // Get all products

router.get('/sup_cat_pro/:supplier_id', authMiddleware, adminOnly, productController.getSupplierCategories);//suppliers product and category list

router.get('/stock_list_product',  productController.getAllProducts_stock_search);
//(stock list)
router.get("/downloadStockPDF",authMiddleware, adminOnly, productController.downloadStockPDF);
router.get("/downloadStockCSV", authMiddleware, adminOnly,productController.downloadStockCSV);
//download the stock report 



router.get('/filter_pro', authMiddleware, adminOrStaff, productController.searchProducts);  // Get all products search


router.get('/proByid/:id', authMiddleware, adminOrStaff, productController.getProductById);  // Get product by ID

router.put('/productput/:id', authMiddleware, adminOnly, productController.updateProduct);  // Update product

router.delete('/soft-delete/:id', authMiddleware, adminOnly, productController.softDeleteProduct);  // Soft delete product

router.delete('/permanent-delete/:id', authMiddleware, adminOnly, productController.permanentDeleteProduct);  // Permanent delete product

router.get('/list-soft-deleted', authMiddleware, adminOnly, productController.getSoftDeletedProducts);  // List soft deleted products

// Restore a soft-deleted product
router.put('/restore/:id', productController.restoreProduct);

// Route to fetch total product count
router.get('/product_totalcount', productController.getProductCount);





// Restore a soft-deleted product
router.put('/restore/:id', authMiddleware, adminOnly, productController.restoreProduct); // Restore product



// Multer configuration for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/zip'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .xlsx or .zip allowed.'));
        }
    },
}).single('file');

// Import route path
router.post('/import', upload, async (req, res) => {
    const fileBuffer = req.file.buffer;
    console.log("file",req.file);
    const isZip = req.file.mimetype === 'application/zip';

    try {
        const result = await productImportController.importProductsFromExcel(fileBuffer, isZip);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error importing products', error: error.message });
    }
});


router.get('/export', productExportController.exportProductsToExcel);








module.exports = router;
