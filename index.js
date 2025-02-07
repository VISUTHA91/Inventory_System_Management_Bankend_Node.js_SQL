// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const morgan = require("morgan");
// const productRoutes = require("./routes/Product_rotues");
// const adminRoutes = require('./routes/Admin_routes');
// const staffRoutes = require("./routes/Staff_routes");
// const categoryRoutes = require("./routes/Product_Category_routes");
// const supplierRoutes = require("./routes/Supplier_routes");
// const customerRoutes = require("./routes/Customer_routes");
// const invoiceRoutes = require("./routes/Invoice_routes");
// const shopRoutes = require("./routes/pharmachy_details_routes");
// const expenseRoutes = require("./routes/Expense_routes");
// const reportRoutes = require('./routes/Report_routes');
// const supplier_invoice_routes = require('./routes/Supplier_invoice_routes');

// const multer = require('multer');

// // const cleanup = require("./controller/Product_controller");
// // Correct import for the cleanup job
// const { runCleanupJob } = require('./Deleted_job/Cleanup_product'); // Adjust path if necessary

// const app = express();

// const port = 5000;
// app.use(
//   cors({
//     origin: "*",
//   })
// );
// app.use(express.json());

// // Middleware to parse URL-encoded bodies
// app.use(express.urlencoded({ extended: true }));
// app.use(cors("*"));
// app.use(morgan("dev"));
// app.use(express.static(path.join(__dirname, "/dist")));
// // Middleware to parse JSON bodies


// // Start the cleanup job
// runCleanupJob();

// // Set up multer for file upload
// // const upload = multer({ dest: 'uploads/' }); // Temporary file storage location

// //product routes
// app.use('/products', productRoutes);
// //admin routes
// app.use('/admin', adminRoutes);
// //staff routes
// app.use('/staff', staffRoutes);
// //category routes
// app.use('/pro_category', categoryRoutes);
// //supplier routes
// app.use('/supplier', supplierRoutes);
// // Customer routes
// app.use('/customer', customerRoutes);
// // Invoice routes
// app.use('/invoice', invoiceRoutes);
// // Use the shop routes
// app.use('/shop', shopRoutes);
// // Use expense routes
// app.use('/expense', expenseRoutes);
// //use report routes 
// app.use('/report', reportRoutes);
// // supplier invoice details Routes
// app.use('/supplier_invoice', supplier_invoice_routes);



// app.listen(port, () => {
//   console.log(`Server running successfully on port ${port}`);
// });



const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const productRoutes = require("./routes/Product_rotues");
const adminRoutes = require('./routes/Admin_routes');
const staffRoutes = require("./routes/Staff_routes");
const categoryRoutes = require("./routes/Product_Category_routes");
const supplierRoutes = require("./routes/Supplier_routes");
const customerRoutes = require("./routes/Customer_routes");
const invoiceRoutes = require("./routes/Invoice_routes");
const shopRoutes = require("./routes/pharmachy_details_routes");
const expenseRoutes = require("./routes/Expense_routes");
const reportRoutes = require('./routes/Report_routes');
const supplierInvoiceRoutes = require('./routes/Supplier_invoice_routes'); // Correct naming
const hsnRoute = require('./routes/hsn_document_routes'); // Correct naming

// Correct import for the cleanup job
const { runCleanupJob } = require('./Deleted_job/Cleanup_product'); // Adjust path if necessary

const app = express();
const port = 3001;

// Enable CORS
// app.use(cors({
//   origin: '*', // Replace with your frontend's origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   allowedHeaders: 'Content-Type, Authorization',
//   credentials: true
// }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Built-in body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(morgan("dev"));

// Serve static files
app.use(express.static(path.join(__dirname, "/dist")));

// Start the cleanup job
runCleanupJob();

// Routes
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/staff', staffRoutes);
app.use('/pro_category', categoryRoutes);
app.use('/supplier', supplierRoutes);
app.use('/customer', customerRoutes);
app.use('/invoice', invoiceRoutes);
app.use('/shop', shopRoutes);
app.use('/expense', expenseRoutes);
app.use('/report', reportRoutes);
app.use('/supplier_invoice', supplierInvoiceRoutes); // Consistent naming
app.use('/hsn', hsnRoute); // Consistent naming
 


app.get('/hello', (req, res ) => {
  console.log(
    'Hello from the backend'
  )
  return res.status(404).json({ message: 'backend running successfully' });
} );

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running successfully on port ${port}`);
});