const User = require('../model/User_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/Database');

const StaffController = {
 
 // Staff Registration

// register: (req, res) => {

  
//   if (req.user.role !== 'admin') {
//     return res.status(403).json({ message: 'Access denied: Admins only' });
//   }

//   const { username, email, password, confirm_password, role = 'staff', contact_number, address_details, user_id_proof } = req.body;

//   // 🔹 Ensure role is 'staff' (Admin CANNOT create another admin)
//   if (role.toLowerCase() === 'admin') {
//     return res.status(400).json({ message: 'Admin cannot create another admin. Only staff can be created.' });
//   }

//   // 🔹 Validate required fields
//   if (!username || !email || !password || !contact_number || !address_details || !user_id_proof) {
//     return res.status(400).json({ message: 'Please provide all required fields.' });
//   }

//   // 🔹 Validate Aadhar number format (12 digits only)
//   const aadharRegex = /^\d{12}$/;
//   if (!aadharRegex.test(user_id_proof)) {
//     return res.status(400).json({ message: 'Aadhar must be exactly 12 digits' });
//   }

//   // ✅ Check if email already exists
//   User.findByEmail(email, (err, existingUser) => {
//     if (err) return res.status(500).json({ message: 'Database error', error: err });

//     if (existingUser.length > 0) {
//       return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
//     }

//     // ✅ Check if Aadhar number already exists
//     User.findByAadhar(user_id_proof, (err, existingAadhar) => {
//       if (err) return res.status(500).json({ message: 'Database error', error: err });

//       if (existingAadhar.length > 0) {
//         return res.status(400).json({ message: 'Aadhar number already exists. Each Aadhar can belong to only one user.' });
//       }

//       // ✅ Hash password and create the user
//       bcrypt.hash(password, 10, (err, hashedPassword) => {
//         if (err) {
//           return res.status(500).json({ message: 'Error hashing password', error: err });
//         }

//         // ✅ Save staff user to database
//         User.create(username, email,confirm_password,hashedPassword, role, contact_number, address_details, user_id_proof, (err, result) => {
//           if (err) {
//             return res.status(500).json({ message: 'Error registering staff', error: err });
//           }
//           res.status(201).json({ message: 'Staff registered successfully' });
//         });
//       });
//     });
//   });
// },

register: (req, res) => {
  // 🔹 Ensure only admins can register users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  const { username, email, password, confirm_password, role = 'staff', contact_number, address_details, user_id_proof } = req.body;

  // 🔹 Ensure role is 'staff' (Admin CANNOT create another admin)
  if (role.toLowerCase() === 'admin') {
    return res.status(400).json({ message: 'Admin cannot create another admin. Only staff can be created.' });
  }

  // 🔹 Validate required fields
  if (!username || !email || !password || !confirm_password || !contact_number || !address_details || !user_id_proof) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // 🔹 Ensure password and confirm password match
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Password and Confirm Password do not match.' });
  }

  // 🔹 Validate Aadhar number format (12 digits only)
  const aadharRegex = /^\d{12}$/;
  if (!aadharRegex.test(user_id_proof)) {
    return res.status(400).json({ message: 'Aadhar must be exactly 12 digits.' });
  }

  // ✅ Check if email already exists
  User.findByEmail(email, (err, existingUser) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
    }

    // ✅ Check if Aadhar number already exists
    User.findByAadhar(user_id_proof, (err, existingAadhar) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });

      if (existingAadhar.length > 0) {
        return res.status(400).json({ message: 'Aadhar number already exists. Each Aadhar can belong to only one user.' });
      }

      // ✅ Hash password before saving
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing password', error: err });
        }

        // ✅ Save staff user to database
        User.create(username, email, hashedPassword, role, contact_number, address_details, user_id_proof, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error registering staff', error: err });
          }
          res.status(201).json({ message: 'Staff registered successfully' });
        });
      });
    });
  });
}
,

login: async (req, res) => {
  try {
    const { email, password } = req.body;

    // Use a promise-based approach for the query
    const query = `SELECT * FROM users WHERE email = ?`;
    const [results] = await pool.promise().query(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const user = results[0];

    // Check if the encrypted_password exists first
    if (!user.encrypted_password) {
      return res.status(500).json({ message: "Password not found for this user" });
    }

    // Compare the password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.encrypted_password);

    if (!passwordMatch) {
      return res.status(401).json({ status: false, message: "Invalid password" });
    }  

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
      { expiresIn: "1h" }
    );

    // Respond with the token and user info
    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error", error });
  }
},

  // login: async (req, res) => {
  //   try {
  //     const { email, password } = req.body;
  
  //     // Use a promise-based approach for the query
  //     const query = `SELECT * FROM users WHERE email = ?`;
  //     const [results] = await pool.promise().query(query, [email]);
  
  //     if (results.length === 0) {
  //       return res.status(404).json({ status: false, message: "User not found" });
  //     }
  
  //     const user = results[0];
  
  //     // Check if the encrypted_password exists first
  //     if (!user.encrypted_password) {
  //       return res.status(500).json({ message: "Password not found for this user" });
  //     }
  
  //     // Compare the password with the hashed password
  //     const passwordMatch = await bcrypt.compare(password, user.encrypted_password);
  
  //     if (!passwordMatch) {
  //       return res.status(401).json({ status: false, message: "Invalid password" });
  //     }  
  
  //     // Generate a JWT token
  //     const token = jwt.sign(
  //       { id: user.id, email: user.email, role: user.role },
  //       process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
  //       { expiresIn: "1h" }
  //     );
  
  //     // Respond with the token and user info
  //     return res.status(200).json({
  //       status: true,
  //       message: "Login successful",
  //       token
  //       user: {
  //         id: user.id,
  //         email: user.email,
  //         role: user.role,
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ status: false, message: "Internal server error", error });
  //   }
  // },
  

  
  
  
  
  // Request Password Reset (Generate Reset Token)
  requestPasswordReset: (req, res) => {
    const { email } = req.body;

    User.findByEmail(email, (err, users) => {
      if (err || users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = users[0];

      // Generate reset token and expiry time
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      User.updateResetToken(user.id, resetToken, resetTokenExpiry, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error updating reset token', error: err });
        }

        // In a real-world application, you'd send this token via email
        res.status(200).json({
          message: 'Password reset token generated. Please check your email.',
          resetToken, // Note: Only for testing, do not send the token in response in a real app
        });
      });
    });
  },

  // Reset Password (Verify Token and Update Password)
  resetPassword: (req, res) => {
    const { token, newPassword } = req.body;

    User.findByResetToken(token, (err, users) => {
      if (err || users.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const user = users[0];

      if (user.reset_token_expiry < new Date()) {
        return res.status(400).json({ message: 'Reset token has expired' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ message: 'Error hashing password', error: err });
        }

        // Update the password in the database
        User.updatePassword(user.id, hashedPassword, (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating password', error: err });
          }

          // Clear the reset token fields after successful reset
          User.clearResetToken(user.id, (err) => {
            if (err) {
              return res.status(500).json({ message: 'Error clearing reset token', error: err });
            }

            res.status(200).json({ message: 'Password reset successfully' });
          });
        });
      });
    });
  },


  // getAllStaffUsers: (req, res) => {

  //   if (req.user.role !== 'admin') {
  //     return res.status(403).json({ status: false, message: 'Access denied: Admins only' });
  //   }

  //   User.getAllStaff((err, results) => {
  //     if (err) {
  //       return res.status(500).json({ status: false, message: "Database query error", error: err });
  //     }

  //     return res.status(200).json({
  //       status: true,
  //       message: "Staff users retrieved successfully",
  //       users: results,
  //     });
  //   });
  // },

//   getAllStaffUsers: (req, res) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ status: false, message: 'Access denied: Admins only' });
//     }

//     const page = parseInt(req.query.page) || 1; // Default to page 1
//     const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page

//     User.getAllStaff(page, limit, (err, results) => {
//         if (err) {
//             return res.status(500).json({ status: false, message: "Database query error", error: err });
//         }

//         return res.status(200).json({
//             status: true,
//             message: "Staff users retrieved successfully",
//             page: page,
//             limit: limit,
//             users: results,
//         });
//     });
// }


getAllStaffUsers: (req, res) => { 
  if (req.user.role !== 'admin') {
      return res.status(403).json({ status: false, message: 'Access denied: Admins only' });
  }

  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page

  User.getAllStaff(page, limit, (err, result) => {
      if (err) {
          return res.status(500).json({ status: false, message: "Database query error", error: err });
      }

      return res.status(200).json({
          status: true,
          message: "Staff users retrieved successfully",
          currentPage: page,
          limit: limit,
          totalPages: result.totalPages,
          totalRecords: result.totalRecords,
          users: result.users,
      });
  });
},

 
 
 
  // Get all users (Admin can access this)
 
  getAllUsers: (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: false, message: 'Access denied: Admins only' });
    }

    User.getAll((err, results) => {
      if (err) {
        return res.status(500).json({ status: false, message: "Database query error", error: err });
      }

      return res.status(200).json({
        status: true,
        message: "Users retrieved successfully",
        users: results,
      });
    });
  },

  // Delete a user
  deleteUser: (req, res) => {
    const { id } = req.params;
    User.delete(id, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting user', error: err });
      }
      res.status(200).json({ message: `User with ID ${id} has been deleted.` });
    });
  },

  // Update a user
  


  updateUser: (req, res) => { 
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Only admins can update user details' });
    }

    const { id } = req.params;
    const { username, email, password, confirm_password, role, contact_number, address_details, user_id_proof } = req.body;

    // ✅ Prevent manually changing a user's role to admin
    if (role && role.toLowerCase() === 'admin') {
        return res.status(400).json({ message: 'Cannot change role to admin manually' });
    }

    // ✅ Ensure confirm_password matches password (only if password is provided)
    if (password && password !== confirm_password) {
        return res.status(400).json({ message: 'Password and Confirm Password do not match' });
    }

    // ✅ Check if email already exists (excluding the current user)
    User.findByEmail(email, (err, existingUser) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (existingUser.length > 0 && existingUser[0].id !== parseInt(id)) {
            return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
        }

        // ✅ Check if Aadhar already exists (excluding the current user)
        User.findByAadhar(user_id_proof, (err, existingAadhar) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (existingAadhar.length > 0 && existingAadhar[0].id !== parseInt(id)) {
                return res.status(400).json({ message: 'Aadhar number already exists. Each Aadhar can belong to only one user.' });
            }

            // ✅ If password is provided, hash it and update all fields including the password
            if (password) {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) return res.status(500).json({ message: 'Error hashing password', error: err });

                    User.update(id, username, email, hashedPassword, role, contact_number, address_details, user_id_proof, (err, result) => {
                        if (err) return res.status(500).json({ message: 'Error updating user', error: err });

                        res.status(200).json({ message: 'User updated successfully' });
                    });
                });
            } else {
                // ✅ If password is not provided, update all fields except the password
                User.updateWithoutPassword(id, username, email, role, contact_number, address_details, user_id_proof, (err, result) => {
                    if (err) return res.status(500).json({ message: 'Error updating user', error: err });

                    res.status(200).json({ message: 'User updated successfully' });
                });
            }
        });
    });
},

  

//   updateUser: (req, res) => {
//     if (req.user.role !== 'admin') {
//         return res.status(403).json({ message: 'Access denied: Only admins can update user details' });
//     }

//     const { id } = req.params;
//     const { username, email, password, confirm_password, role, contact_number, address_details, user_id_proof } = req.body;

//     // ✅ Prevent manually changing a user's role to admin
//     if (role && role.toLowerCase() === 'admin') {
//         return res.status(400).json({ message: 'Cannot change role to admin manually' });
//     }

//     // ✅ Ensure confirm_password matches password
//     if (password && password !== confirm_password) {
//         return res.status(400).json({ message: 'Password and Confirm Password do not match' });
//     }

//     // ✅ Check if email already exists (excluding the current user)
//     User.findByEmail(email, (err, existingUser) => {
//         if (err) return res.status(500).json({ message: 'Database error', error: err });

//         if (existingUser.length > 0 && existingUser[0].id !== parseInt(id)) {
//             return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
//         }

//         // ✅ Check if Aadhar already exists (excluding the current user)
//         User.findByAadhar(user_id_proof, (err, existingAadhar) => {
//             if (err) return res.status(500).json({ message: 'Database error', error: err });

//             if (existingAadhar.length > 0 && existingAadhar[0].id !== parseInt(id)) {
//                 return res.status(400).json({ message: 'Aadhar number already exists. Each Aadhar can belong to only one user.' });
//             }

//             // ✅ If password is provided, hash it before updating
//             if (password) {
//                 bcrypt.hash(password, 10, (err, hashedPassword) => {
//                     if (err) return res.status(500).json({ message: 'Error hashing password', error: err });

//                     // ✅ Call update function with new password
//                     User.update(id, username, email, hashedPassword, role, contact_number, address_details, user_id_proof, (err, result) => {
//                         if (err) return res.status(500).json({ message: 'Error updating user', error: err });

//                         res.status(200).json({ message: 'User updated successfully' });
//                     });
//                 });
//             } else {
//                 // ✅ Call update function without modifying the password
//                 User.updateWithoutPassword(id, username, email, role, contact_number, address_details, user_id_proof, (err, result) => {
//                     if (err) return res.status(500).json({ message: 'Error updating user', error: err });

//                     res.status(200).json({ message: 'User updated successfully' });
//                 });
//             }
//         });
//     });
// },

// // ✅ Update user details without modifying password
// updateWithoutPassword: (id, username, email, role, contact_number, address_details, user_id_proof, callback) => {
//     const query = `UPDATE users 
//                    SET username = ?, email = ?, role = ?, 
//                        contact_number = ?, address_details = ?, user_id_proof = ? 
//                    WHERE id = ?`;
//     db.query(query, [username, email, role, contact_number, address_details, user_id_proof, id], callback);
// },

  
};

module.exports = StaffController;

