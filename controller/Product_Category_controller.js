// const Category = require('../model/Product_Category_model');

// class CategoryController {


//      // Create a new category
//      static async createCategory(req, res) {
//         try {
//             const categoryId = await Category.create(req.body);
//             res.status(201).json({ message: 'Category created', categoryId });
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to create category' });
//         }
//     }
    

//     // Get all categories
//     static async getAllCategories(req, res) {
//         try {
//             const categories = await Category.getAll();
//             res.json(categories);
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to fetch categories' });
//         }
//     }

//     // Get a category by ID
//     static async getCategoryById(req, res) {
//         try {
//             const category = await Category.getById(req.params.id);
//             if (category) {
//                 res.json(category);
//             } else {
//                 res.status(404).json({ error: 'Category not found' });
//             }
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to fetch category' });
//         }
//     }

   
//     // Update an existing category
//     static async updateCategory(req, res) {
//         try {
//             await Category.update(req.params.id, req.body);
//             res.json({ message: 'Category updated' });
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to update category' });
//         }
//     }

//     // Delete a category
//     static async deleteCategory(req, res) {
//         try {
//             await Category.delete(req.params.id);
//             res.json({ message: 'Category deleted' });
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to delete category' });
//         }
//     }
// }

// module.exports = CategoryController;



const Category = require('../model/Product_Category_model');


class CategoryController {
 

  static async createCategory(req, res) {
    try {
      const { category_name, description } = req.body;

      if (!category_name) {
        return res.status(400).json({ message: 'Category name is required.' });
      }
      

      const categoryId = await Category.create({ category_name, description });
      res.status(201).json({
        message: 'Category created successfully!',
        categoryId,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error creating category.',
        
        error: error.message,
      });
    }
  }

//filterCategoriesAndProducts

  static async filterCategoriesAndProducts(req, res) {
    try {
      const { cat_auto_gen_id, product_name, product_id } = req.query;

      // Pass parameters to the model
      const results = await Category.filterCategoriesAndProducts({
        cat_auto_gen_id,
        product_name,
        product_id
      });

      if (results.length === 0) {
        return res.status(404).json({ message: 'No matching categories or products found.' });
      }

      res.status(200).json({ data: results });
    } catch (error) {
      res.status(500).json({ message: 'Error filtering categories and products.', error: error.message });
    }
  }

  static async getProductsByCategory(req, res) {
    try {
      const { id } = req.params; // Get category_id from URL params

      if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const products = await Category.getProductsByCategory(id);

      if (products.length === 0) {
        return res.status(404).json({ message: "No products found for this category." });
      }

      res.status(200).json({ data: products });
    } catch (error) {
      res.status(500).json({ message: "Error fetching products.", error: error.message });
    }
  }

//ishu already correct code 

  static async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories.', error: error.message });
    }
  }


  static async getAllCategories_pagination(req, res) { 
    try {
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page

        const { categories, totalCategories } = await Category.getAll_page(page, limit);

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            page: page,
            limit: limit,
            totalCategories: totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            data: categories
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories.', error: error.message });
    }
}

// static async getAllCategories_pagination(req, res) { 
//   try {
//       const page = parseInt(req.query.page) || 1;  // Default to page 1
//       const limit = parseInt(req.query.limit) || 10; // Default limit 10 per page

//       const categoriesWithProducts = await Category.getAll_page(page, limit);

//       // Group products under their respective categories
//       const categoriesMap = new Map();

//       categoriesWithProducts.forEach(row => {
//           if (!categoriesMap.has(row.category_id)) {
//               categoriesMap.set(row.category_id, {
//                   category_id: row.category_id,
//                   category_name: row.category_name,
//                   category_description: row.category_description,
//                   category_created_at: row.category_created_at,
//                   category_updated_at: row.category_updated_at,
//                   cat_auto_gen_id: row.cat_auto_gen_id,
//                   products: []
//               });
//           }
          
//           // If product details exist, push to the category
//           if (row.product_id) {
//               categoriesMap.get(row.category_id).products.push({
//                   product_id: row.product_id,
//                   product_name: row.product_name,
//                   product_description: row.product_description,
//                   product_price: row.product_price,
//                   product_quantity: row.product_quantity,
//                   stock_status: row.stock_status,
//                   generic_name: row.generic_name,
//                   product_batch_no: row.product_batch_no,
//                   expiry_date: row.expiry_date,
//                   product_discount: row.product_discount,
//                   supplier_price: row.supplier_price,
//                   supplier: row.supplier,
//                   brand_name: row.brand_name,
//                   selling_price: row.selling_price,
//                   GST: row.GST,
//                   product_created_at: row.product_created_at,
//                   product_updated_at: row.product_updated_at,
//                   deleted_at: row.deleted_at,
//                   is_deleted: row.is_deleted
//               });
//           }
//       });

//       res.status(200).json({
//           success: true,
//           message: "Categories with products fetched successfully",
//           page: page,
//           limit: limit,
//           totalCategories: categoriesMap.size,
//           totalPages: Math.ceil(categoriesMap.size / limit),
//           data: Array.from(categoriesMap.values())
//       });

//   } catch (error) {
//       res.status(500).json({ message: 'Error fetching categories and products.', error: error.message });
//   }
// }






static async getAllCategoryNamesHandler(req, res) {  
  try {
      const categoryNames = await Category.getAllCategoryNames();

      res.status(200).json({
          success: true,
          message: "Category names fetched successfully",
          data: categoryNames
      });

  } catch (error) {
      res.status(500).json({ message: 'Error fetching category names.', error: error.message });
  }
}



  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.getById(id);

      if (!category) {
        return res.status(404).json({ message: 'Category not found.' });
      }

      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category.', error: error.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { category_name, description } = req.body;

      await Category.update(id, { category_name, description });
      res.status(200).json({ message: 'Category updated successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating category.', error: error.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      await Category.delete(id);
      res.status(200).json({ message: 'Category deleted successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category.', error: error.message });
    }
  }
}

module.exports = CategoryController;
