const ProductReturn = require('../model/cus_return_model');


class ProductReturnController {
    
  
    
    static async returnProduct(req, res) {
        try {
            const { invoice_id, returnedProducts } = req.body;
    
            for (const item of returnedProducts) {
                const { product_id, quantity, return_reason } = item;
    
                // Step 1: Check the purchased quantity for the product
                const purchasedQuantity = await ProductReturn.checkPurchasedQuantity(invoice_id, product_id);
    
                console.log(`Purchased Quantity: ${purchasedQuantity}, Return Quantity: ${quantity}`);
    
                // Step 2: Validate the return quantity (should not exceed purchased quantity)
                if (quantity > purchasedQuantity) {
                    return res.status(400).json({
                        message: `Return quantity exceeds the purchased quantity. Purchased: ${purchasedQuantity}, Return: ${quantity}`,
                    });
                }
    
                // Step 3: Log the return in the product_return_table
                await ProductReturn.createReturn(invoice_id, product_id, quantity, return_reason);
    
                // Step 4: Update the product quantity in the product table (add returned quantity)
                await ProductReturn.updateProductQuantity(product_id, quantity);
            }
    
            res.status(200).json({ message: 'Product return processed successfully' });
        } catch (error) {
            console.error('Error processing product return:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    //pagination return
    static async getAllReturns(req, res) {
        try {
            const page = parseInt(req.query.page) || 1; // Get page from query params, default to 1
            const limit = 10; // Fixed limit per page

            const returns = await ProductReturn.getAllReturns(page, limit);
            res.status(200).json(returns);
        } catch (error) {
            console.error('Error retrieving returns:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    
    
    static async getReturns(req, res) {
        try {
            const { invoice_id } = req.params;

            // Call the new method
            const returns = await ProductReturn.getReturnsByInvoice(invoice_id);

            res.status(200).json(returns);
        } catch (error) {
            console.error('Error retrieving product returns:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

   // Fetch Rejected Invoices from DB
   static async getRejectedInvoices(req, res) {
    try {
        console.log("Fetching rejected invoices...");
        const rejectedInvoices = await ProductReturn.getAllRejectedInvoices();

        // Check if no records are found
        if (!rejectedInvoices || rejectedInvoices.length === 0) {
            return res.status(404).json({ message: "No rejected invoices found" });
        }

        res.status(200).json(rejectedInvoices);
    } catch (error) {
        console.error("Error retrieving rejected invoices:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

    // Delete a product return
    static async deleteReturn(req, res) {
        try {
            const { return_id } = req.params;
            await ProductReturn.deleteReturn(return_id);

            res.status(200).json({ message: 'Product return entry deleted successfully' });
        } catch (error) {
            console.error('Error deleting product return:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }


    static async processReturn (req, res) {
        try {
            const { invoice_id, returnedProducts } = req.body;
            if (!invoice_id || !returnedProducts || returnedProducts.length === 0) {
                return res.status(400).json({ error: "Invalid request data" });
            }
    
            const result = await ReturnModel.returnProduct(invoice_id, returnedProducts);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}

module.exports = ProductReturnController;










