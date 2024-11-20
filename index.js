const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const productRoutes = require("./routes/Product_rotues");
const adminRoutes = require('./routes/Admin_routes');
const staffRoutes = require("./routes/Staff_routes");
const categoryRoutes = require("./routes/Product_Category_routes");
const supplierRoutes = require("./routes/Supplier_routes");
const  customerRoutes = require("./routes/Customer_routes");


const multer = require('multer');

// const cleanup = require("./controller/Product_controller");
// Correct import for the cleanup job
const { runCleanupJob } = require('./Deleted_job/Cleanup_product'); // Adjust path if necessary

const app = express();
const port = 5000;
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "/dist")));

// Start the cleanup job
runCleanupJob();

// Set up multer for file upload
// const upload = multer({ dest: 'uploads/' }); // Temporary file storage location

//product routes
app.use('/products', productRoutes);
//admin routes
app.use('/admin', adminRoutes);
//staff routes
app.use('/staff', staffRoutes);
//category routes
app.use('/pro_category', categoryRoutes);
//supplier routes
app.use('/supplier', supplierRoutes);
// Customer routes
app.use('/customer', customerRoutes);


app.listen(port, () => {
  console.log(`Server running successfully on port ${port}`);
});
