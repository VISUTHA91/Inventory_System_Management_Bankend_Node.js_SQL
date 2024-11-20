const db = require('../config/Database'); 

const User = {
  create: (username, email, hashedPassword, role, callback) => {
    const query = 'INSERT INTO users (username, email, encrypted_password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, role], callback);
  },

  findByEmail: (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?'; // Use parameterized query to avoid SQL injection
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err); // Log any database error
      }
      callback(err, results); // Pass the results back to the callback
    });
  },
  

  findById: (id, callback) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  update: (id, username, email, role, callback) => {
    const query = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';
    db.query(query, [username, email, role, id], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [id], callback);
  },

  setResetToken: (email, token, expiry, callback) => {
    const query = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
    db.query(query, [token, expiry, email], callback);
  },

  updatePassword: (email, hashedPassword, callback) => {
    const query = 'UPDATE users SET password = ? WHERE email = ?';
    db.query(query, [hashedPassword, email], callback);
  },

  clearResetToken: (email, callback) => {
    const query = 'UPDATE users SET reset_token = NULL, reset_token_expiry = NULL WHERE email = ?';
    db.query(query, [email], callback);
  }
};

module.exports = User;
