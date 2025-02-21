// const db = require('../config/Database'); // Ensure you have the DB connection set up

// // Create a shop
// const createShop = async (shopData) => {
//     const query = `
//     INSERT INTO shop_table (
//         pharmacy_name,
//         pharmacy_address,
//         pincode,
//         owner_GST_number,
//         allow_registration,
//         description
//     ) VALUES (?, ?, ?, ?, ?, ?)`;

//     const [result] = await db.promise().query(query, [
//         shopData.pharmacy_name,
//         shopData.pharmacy_address,
//         shopData.pincode,
//         shopData.owner_GST_number,
//         shopData.allow_registration,
//         shopData.description
//     ]);

//     return result.insertId; // Return the inserted shop ID
// };

// // Get a shop by ID
// const getShopById = async (shopId) => {
//     const query = `SELECT * FROM shop_table WHERE shop_id = ?`;
//     const [result] = await db.promise().query(query, [shopId]);
//     return result[0]; // Return the shop data or null if not found
// };

// // Get all shops
// const getAllShops = async () => {
//     const query = `SELECT * FROM shop_table`;
//     const [result] = await db.promise().query(query);
//     return result; // Return all shops
// };

// // Update a shop
// const updateShop = async (shopId, shopData) => {
//     const query = `
//     UPDATE shop_table
//     SET
//         pharmacy_name = ?,
//         pharmacy_address = ?,
//         pincode = ?,
//         owner_GST_number = ?,
//         allow_registration = ?,
//         description = ?
//     WHERE shop_id = ?`;

//     const [result] = await db.promise().query(query, [
//         shopData.pharmacy_name,
//         shopData.pharmacy_address,
//         shopData.pincode,
//         shopData.owner_GST_number,
//         shopData.allow_registration,
//         shopData.description,
//         shopId
//     ]);

//     return result.affectedRows > 0; // Return true if update was successful
// };

// // Delete a shop
// const deleteShop = async (shopId) => {
//     const query = `DELETE FROM shop_table WHERE shop_id = ?`;
//     const [result] = await db.promise().query(query, [shopId]);
//     return result.affectedRows > 0; // Return true if deletion was successful
// };

// module.exports = {
//     createShop,
//     getShopById,
//     getAllShops,
//     updateShop,
//     deleteShop
// };




const db = require('../config/Database');

// Create a shop
const createShop = async (shopData) => {
    const query = `
        INSERT INTO shop_table (
            pharmacy_name, pharmacy_address, pincode, 
            owner_GST_number, allow_registration, description
        ) VALUES (?, ?, ?, ?, ?, ?)`;

    try {
        const [result] = await db.promise().query(query, [
            shopData.pharmacy_name,
            shopData.pharmacy_address,
            shopData.pincode,
            shopData.owner_GST_number,
            shopData.allow_registration,
            shopData.description
        ]);
        return result.insertId;
    } catch (error) {
        console.error('Error creating shop:', error);
        throw error;
    }
};

// Get a shop by ID
const getShopById = async (shopId) => {
    const query = `SELECT * FROM shop_table WHERE shop_id = ?`;

    try {
        const [result] = await db.promise().query(query, [shopId]);
        return result.length ? result[0] : null;
    } catch (error) {
        console.error('Error getting shop by ID:', error);
        throw error;
    }
};

// Get all shops
const getAllShops = async () => {
    const query = `SELECT * FROM shop_table`;

    try {
        const [result] = await db.promise().query(query);
        return result;
    } catch (error) {
        console.error('Error fetching all shops:', error);
        throw error;
    }
};

// Update a shop
const updateShop = async (shopId, shopData) => {
    const query = `
        UPDATE shop_table SET
            pharmacy_name = ?, pharmacy_address = ?, pincode = ?, 
            owner_GST_number = ?, allow_registration = ?, description = ?
        WHERE shop_id = ?`;

    try {
        const [result] = await db.promise().query(query, [
            shopData.pharmacy_name,
            shopData.pharmacy_address,
            shopData.pincode,
            shopData.owner_GST_number,
            shopData.allow_registration,
            shopData.description,
            shopId
        ]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating shop:', error);
        throw error;
    }
};

// Delete a shop
const deleteShop = async (shopId) => {
    const query = `DELETE FROM shop_table WHERE shop_id = ?`;

    try {
        const [result] = await db.promise().query(query, [shopId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting shop:', error);
        throw error;
    }
};

module.exports = {
    createShop,
    getShopById,
    getAllShops,
    updateShop,
    deleteShop
};
