const Category = require('../model/Product_Category_model');

class CategoryController {


     // Create a new category
     static async createCategory(req, res) {
        try {
            const categoryId = await Category.create(req.body);
            res.status(201).json({ message: 'Category created', categoryId });
        } catch (error) {
            res.status(500).json({ error: 'Failed to create category' });
        }
    }
    

    // Get all categories
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.getAll();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    // Get a category by ID
    static async getCategoryById(req, res) {
        try {
            const category = await Category.getById(req.params.id);
            if (category) {
                res.json(category);
            } else {
                res.status(404).json({ error: 'Category not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch category' });
        }
    }

   
    // Update an existing category
    static async updateCategory(req, res) {
        try {
            await Category.update(req.params.id, req.body);
            res.json({ message: 'Category updated' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update category' });
        }
    }

    // Delete a category
    static async deleteCategory(req, res) {
        try {
            await Category.delete(req.params.id);
            res.json({ message: 'Category deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete category' });
        }
    }
}

module.exports = CategoryController;
