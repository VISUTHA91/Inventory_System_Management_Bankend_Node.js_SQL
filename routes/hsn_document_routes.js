// routes/hsnRoute.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const HSNController = require('../controller/hsn_document_controller');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File filter (Allow only specific formats)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Upload middleware
const upload = multer({ storage, fileFilter });

// Routes
router.post('/uploadhsn_document', upload.single('file'), HSNController.uploadDocument);  // Directly using upload middleware here
router.get('/search', HSNController.searchHSNByCategory);

module.exports = router;
