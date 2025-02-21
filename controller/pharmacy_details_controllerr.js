// const Shop = require('../model/pharmachy_details_model');

// // Create a shop
// const createShop = async (req, res) => {
//     try {
//         const shopData = req.body;

//         const shopId = await Shop.createShop(shopData);
//         res.status(201).json({ message: 'Shop created successfully', shop_id: shopId });
//     } catch (error) {
//         console.error('Error creating shop:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// // Get a shop by ID
// const getShopById = async (req, res) => {
//     try {
//         const { shopId } = req.params;
//         const shop = await Shop.getShopById(shopId);

//         if (!shop) {
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         res.status(200).json({ shop });
//     } catch (error) {
//         console.error('Error getting shop:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// // Get all shops
// const getAllShops = async (req, res) => {
//     try {
//         const shops = await Shop.getAllShops();
//         res.status(200).json({ shops });
//     } catch (error) {
//         console.error('Error fetching all shops:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// // Update a shop
// const updateShop = async (req, res) => {
//     try {
//         const { shopId } = req.params;
//         const shopData = req.body;

//         const updated = await Shop.updateShop(shopId, shopData);

//         if (!updated) {
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         res.status(200).json({ message: 'Shop updated successfully' });
//     } catch (error) {
//         console.error('Error updating shop:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// // Delete a shop
// const deleteShop = async (req, res) => {
//     try {
//         const { shopId } = req.params;

//         const deleted = await Shop.deleteShop(shopId);

//         if (!deleted) {
//             return res.status(404).json({ message: 'Shop not found' });
//         }

//         res.status(200).json({ message: 'Shop deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting shop:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

// module.exports = {
//     createShop,
//     getShopById,
//     getAllShops,
//     updateShop,
//     deleteShop
// };



const Shop = require('../model/pharmachy_details_model');

// Create a shop
const createShop = (req, res) => {
    const shopData = req.body;

    Shop.createShop(shopData)
    .then(shopId => res.status(201).json({ message: 'Shop created successfully', shop_id: shopId }))
    .catch(error => {
        console.error('Error creating shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Get a shop by ID
const getShopById = (req, res) => {
    const { shopId } = req.params;

    Shop.getShopById(shopId)
    .then(shop => {
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ shop });
    })
    .catch(error => {
        console.error('Error getting shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Get all shops
const getAllShops = (req, res) => {
    Shop.getAllShops()
    .then(shops => res.status(200).json({ shops }))
    .catch(error => {
        console.error('Error fetching all shops:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Update a shop
const updateShop = (req, res) => {
    const { shopId } = req.params;
    const shopData = req.body;

    Shop.updateShop(shopId, shopData)
    .then(updated => {
        if (!updated) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ message: 'Shop updated successfully' });
    })
    .catch(error => {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

// Delete a shop
const deleteShop = (req, res) => {
    const { shopId } = req.params;

    Shop.deleteShop(shopId)
    .then(deleted => {
        if (!deleted) return res.status(404).json({ message: 'Shop not found' });
        res.status(200).json({ message: 'Shop deleted successfully' });
    })
    .catch(error => {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    });
};

module.exports = {
    createShop,
    getShopById,
    getAllShops,
    updateShop,
    deleteShop
};
