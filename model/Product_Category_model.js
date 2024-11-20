
const db = require('../config/Database');  // Import the db connection

// Helper function to wrap callback-based queries in a Promise
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);  // Reject the promise if there is an error
      } else {
        resolve(results);  // Resolve the promise with the query results
      }
    });
  });
}

class Category {
    static async getAll() {
        const rows = await queryAsync('SELECT * FROM product_category', []);
        return rows;
    }

    static async getById(id) {
        const rows = await queryAsync('SELECT * FROM product_category WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { category_name, description } = data;
        const result = await queryAsync('INSERT INTO product_category (category_name, description) VALUES (?, ?)', [category_name, description]);
        return result.insertId;  // Return the insert ID
    }

    static async update(id, data) {
        const { category_name, description } = data;
        await queryAsync('UPDATE product_category SET category_name = ?, description = ? WHERE id = ?', [category_name, description, id]);
    }

    static async delete(id) {
        await queryAsync('DELETE FROM product_category WHERE id = ?', [id]);
    }
}

module.exports = Category;

