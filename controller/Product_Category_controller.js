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
  // static async createCategory(req, res) {
  //   try {
  //     const { category_name, description } = req.body;

  //     if (!category_name) {
  //       return res.status(400).json({ message: 'Category name is required.' });
  //     }

  //     const categoryId = await Category.create({ category_name, description });
  //     res.status(201).json({ message: 'Category created successfully!', categoryId });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error creating category.', error: error.message });
  //   }
  // }

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
        product_id,
      });

      if (results.length === 0) {
        return res.status(404).json({ message: 'No matching categories or products found.' });
      }

      res.status(200).json({ data: results });
    } catch (error) {
      res.status(500).json({ message: 'Error filtering categories and products.', error: error.message });
    }
  }





  static async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories.', error: error.message });
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
