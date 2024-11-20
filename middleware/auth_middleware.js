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











// // const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const connection = require("../Model/DB_connection.js");

// const authMiddleware = (req, res, next) => {
//   let token = req.headers["authorization"] ? req.headers["authorization"] : "";

//   if (!token) {
//     return res
//       .status(401)
//       .json({ status: false, message: "Token not provided" });
//   }

//   jwt.verify(
//     token,
//     process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
//     (err, decoded) => {
//       if (err) {
//         if (err.name === "TokenExpiredError") {
//           return res
//             .status(401)
//             .json({ status: false, statusCode: 700, message: "Token expired" });
//         } else {
//           return res
//             .status(401)
//             .json({ status: false, message: "Invalid token" });
//         }
//       }

//       req.user = decoded;
//       next();
//     }
//   );
// };

// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     // console.log("Login successfull");
//     // Check if the user exists
//     // console.log(email,password);
//     connection.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email],
//       async (err, results) => {
//         if (err) {
//           return res.status(500).json({
//             status: false,
//             message: "Database query error",
//             error: err,
//           });
//         }

//         if (results.length === 0) {
//           return res
//             .status(404)
//             .json({ status: false, message: "User not found" });
//         }

//         const user = results[0];

//         // Compare the password with the hashed password
//         const passwordMatch = await bcrypt.compare(
//           password,
//           user.encrypted_password
//         );
//         if (!passwordMatch) {
//           return res
//             .status(401)
//             .json({ status: false, message: "Invalid password" });
//         }

//         // Generate a JWT token
//         const token = jwt.sign(
//           { id: user.id, email: user.email, role: user.role },
//           process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
//           {
//             expiresIn: "1h", // Token expiration time
//           }
//         );

//         // Respond with the token and user info
//         return res.status(200).json({
//           status: true,
//           message: "Login successful",
//           token,
//           user: {
//             id: user.id,
//             email: user.email,
//             role: user.role,
//           },
//         });
//       }
//     );
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ status: false, message: "Internal server error", error });
//   }
// };

// module.exports = { authMiddleware, adminLogin };