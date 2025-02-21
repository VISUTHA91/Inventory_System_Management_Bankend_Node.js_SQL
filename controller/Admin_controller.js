const User = require('../model/User_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/Database'); 


const AdminController = {
  // Admin Registration
  register: (req, res) => {
    const { username, email, password, role = 'admin' } = req.body;

    // Hash the password before saving
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password', error: err });
      }

      // Save the admin to the database
      User.create(username, email, hashedPassword, role, (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error registering admin', error: err });
        }
        res.status(201).json({ message: 'Admin registered successfully' });
      });
    });
  },

//  Adminlogin

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      

      console.log(req.body);  
  
      // Use pool.query instead of connection.query
      pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
          if (err) {
            return res.status(500).json({
              status: false,
              message: "Database query error",
              error: err,
            });
          }
  
          if (results.length === 0) {
            return res.status(404).json({ status: false, message: "User not found" });
          }
  
          const user = results[0];
  
          // Compare the password with the hashed password
          const passwordMatch = await bcrypt.compare(password, user.encrypted_password);
  
          if (!passwordMatch) {
            return res.status(401).json({ status: false, message: "Invalid password" });
          }
  
          // Generate a JWT token
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "Evvi_Solutions_Private_Limited",
            { expiresIn: "5h" }
          );
  
          // Respond with the token and user info
          return res.status(200).json({
            status: true,
            message: "Login successful",
            token,
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (error) {
      return res.status(500).json({ status: false, message: "Internal server error", error });
    }
  },  
 
  

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

  // Get all users

// getAllUsers: (req, res) => {
//   // Use the pool for the query
//   pool.query("SELECT * FROM users", (err, results) => {
//     if (err) {
//       // If there's an error with the query, send a 500 error response
//       return res.status(500).json({
//         status: false,
//         message: "Database query error",
//         error: err,
//       });
//     }
//     // Return the users in the response
//     return res.status(200).json({
//       status: true,
//       message: "Users retrieved successfully",
//       users: results,
//     });
//   });
// },

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
    const { id } = req.params;
    const { username, email, role } = req.body;

    User.update(id, username, email, role, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating user', error: err });
      }
      res.status(200).json({ message: 'User updated successfully' });
    });
  }
};

module.exports = AdminController;
