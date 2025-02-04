
// const db = require('../config/Database');  // Import the db connection

// // Helper function to wrap callback-based queries in a Promise
// function queryAsync(sql, params) {
//   return new Promise((resolve, reject) => {
//     db.query(sql, params, (err, results) => {
//       if (err) {
//         reject(err);  // Reject the promise if there is an error
//       } else {
//         resolve(results);  // Resolve the promise with the query results
//       }
//     });
//   });
// }

// class Category {
//     static async getAll() {
//         const rows = await queryAsync('SELECT * FROM product_category', []);
//         return rows;
//     }

//     static async getById(id) {
//         const rows = await queryAsync('SELECT * FROM product_category WHERE id = ?', [id]);
//         return rows[0];
//     }

//     static async create(data) {
//         const { category_name, description } = data;
//         const result = await queryAsync('INSERT INTO product_category (category_name, description) VALUES (?, ?)', [category_name, description]);
//         return result.insertId;  // Return the insert ID
//     }

//     static async update(id, data) {
//         const { category_name, description } = data;
//         await queryAsync('UPDATE product_category SET category_name = ?, description = ? WHERE id = ?', [category_name, description, id]);
//     }

//     static async delete(id) {
//         await queryAsync('DELETE FROM product_category WHERE id = ?', [id]);
//     }
// }

// module.exports = Category;



const db = require('../config/Database'); // Import the database connection

// Helper function to execute queries using Promises
function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err); // Reject the promise on error
      } else {
        resolve(results); // Resolve the promise with results
      }
    });
  });
}

class Category {


// Updated create method in the Category model

  static async create(data) {
    const { category_name, description } = data;

    // Step 1: Insert category without `cat_auto_gen_id`
    const result = await queryAsync(
      'INSERT INTO product_category (category_name, description) VALUES (?, ?)',
      [category_name, description]
    );

    const categoryId = result.insertId; // Get the ID of the newly inserted category

    // Step 2: Generate `cat_auto_gen_id` with static prefix "CAT" and categoryId
    const catAutoGenId = `CAT${categoryId}`; // Format: CAT + categoryId

    // Step 3: Update the category with `cat_auto_gen_id`
    await queryAsync(
      'UPDATE product_category SET cat_auto_gen_id = ? WHERE id = ?',
      [catAutoGenId, categoryId]
    );

    return categoryId; // Return the ID of the newly created category
  }


 //fillter category and product


static async filterCategoriesAndProducts({ cat_auto_gen_id, product_name, product_id,category_name }) {
  try {
    let sql = `
      SELECT 
        pc.cat_auto_gen_id,
        pc.category_name,
        pc.description,
        p.id AS product_id,           -- Correct column name to 'id' from 'product_id'
        p.product_name,
        p.product_description,
        p.product_price,
        p.product_quantity,
        p.stock_status,
        p.generic_name,
        p.product_batch_no,
        p.expiry_date,
        p.product_discount,
        p.supplier_price,
        p.supplier,
        p.brand_name,
        p.selling_price,
        p.GST,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        p.is_deleted
      FROM 
        product_category pc
      LEFT JOIN 
        product_table p ON pc.id = p.product_category  -- Corrected the join condition
      WHERE 1=1
    `;

    const params = [];

    // Add conditions dynamically
    if (cat_auto_gen_id) {
      sql += ' AND pc.cat_auto_gen_id = ?';
      params.push(cat_auto_gen_id);
    }

    if (product_name) {
      sql += ' AND p.product_name LIKE ?';
      params.push(`%${product_name}%`);
    }

    if (product_id) {
      sql += ' AND p.id = ?';    // Correct column name to 'id' from 'product_id'
      params.push(product_id);
    }
  if (category_name) {
      sql += ' AND pc.category_name LIKE ?';
      params.push(`%${category_name}%`);
    }

    // Execute the query
    const results = await queryAsync(sql, params);

    if (results.length === 0) {
      return { message: 'No matching categories or products found.' };
    }

    return { data: results };
  } catch (error) {
    return { message: 'Error filtering categories and products.', error: error.message };
  }
}




  static async getAll() {
    const rows = await queryAsync('SELECT * FROM product_category', []);
    return rows;
  }

  static async getById(id) {
    const rows = await queryAsync('SELECT * FROM product_category WHERE id = ?', [id]);
    return rows[0];
  }

  // static async create(data) {
  //   const { category_name, description } = data;

  //   // Step 1: Insert category without `cat_auto_gen_id`
  //   const result = await queryAsync(
  //     'INSERT INTO product_category (category_name, description) VALUES (?, ?)',
  //     [category_name, description]
  //   );

  //   const categoryId = result.insertId; // Get the ID of the newly inserted category

  //   // Step 2: Generate `cat_auto_gen_id` (Format: 2 letters + 2 numbers + ID)
  //   const randomLetters = String.fromCharCode(
  //     65 + Math.floor(Math.random() * 26), // Random uppercase letter
  //     65 + Math.floor(Math.random() * 26)
  //   );
  //   const randomNumbers = Math.floor(Math.random() * 90 + 10); // Random 2-digit number
  //   const catAutoGenId = `${randomLetters}${randomNumbers}${categoryId}`;

  //   // Step 3: Update the category with `cat_auto_gen_id`
  //   await queryAsync(
  //     'UPDATE product_category SET cat_auto_gen_id = ? WHERE id = ?',
  //     [catAutoGenId, categoryId]
  //   );

  //   return categoryId; // Return the ID of the newly created category
  // }


  static async update(id, data) {
    const { category_name, description } = data;
    await queryAsync(
      'UPDATE product_category SET category_name = ?, description = ? WHERE id = ?',
      [category_name, description, id]
    );
  }

  static async delete(id) {
    await queryAsync('DELETE FROM product_category WHERE id = ?', [id]);
  }
}

module.exports = Category;
