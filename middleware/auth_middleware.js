const db = require("../config/Database");
const jwt = require("jsonwebtoken"); 


const authMiddleware = (req, res, next) => {
  let token = req.headers["authorization"] ? req.headers["authorization"] : "";

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Token not provided" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
    (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ status: false, statusCode: 700, message: "Token expired" });
        } else {
          return res
            .status(401)
            .json({ status: false, message: "Invalid token" });
        }
      }

      req.user = decoded;
      next();
    }
  );
};

// Middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ status: false, message: 'Access denied. Admins only.' });
  }
  next();
};


// Middleware to restrict access to staff only
const staffOnly = (req, res, next) => {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ status: false, message: 'Access denied. Staff only.' });
  }
  next();
};

// Middleware to allow both admins and staff to access
const adminOrStaff = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ status: false, message: 'Access denied. Admins and Staff only.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly ,staffOnly,adminOrStaff};


