const db = require('../config/Database'); // Ensure you have the DB connection set up

// Create a shop
const createShop = async (shopData) => {
    const query = `
    INSERT INTO shop_table (
        pharmacy_name,
        pharmacy_address,
        pincode,
        owner_GST_number,
        allow_registration,
        description
    ) VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.promise().query(query, [
        shopData.pharmacy_name,
        shopData.pharmacy_address,
        shopData.pincode,
        shopData.owner_GST_number,
        shopData.allow_registration,
        shopData.description
    ]);

    return result.insertId; // Return the inserted shop ID
};

// Get a shop by ID
const getShopById = async (shopId) => {
    const query = `SELECT * FROM shop_table WHERE shop_id = ?`;
    const [result] = await db.promise().query(query, [shopId]);
    return result[0]; // Return the shop data or null if not found
};

// Get all shops
const getAllShops = async () => {
    const query = `SELECT * FROM shop_table`;
    const [result] = await db.promise().query(query);
    return result; // Return all shops
};

// Update a shop
const updateShop = async (shopId, shopData) => {
    const query = `
    UPDATE shop_table
    SET
        pharmacy_name = ?,
        pharmacy_address = ?,
        pincode = ?,
        owner_GST_number = ?,
        allow_registration = ?,
        description = ?
    WHERE shop_id = ?`;

    const [result] = await db.promise().query(query, [
        shopData.pharmacy_name,
        shopData.pharmacy_address,
        shopData.pincode,
        shopData.owner_GST_number,
        shopData.allow_registration,
        shopData.description,
        shopId
    ]);

    return result.affectedRows > 0; // Return true if update was successful
};

// Delete a shop
const deleteShop = async (shopId) => {
    const query = `DELETE FROM shop_table WHERE shop_id = ?`;
    const [result] = await db.promise().query(query, [shopId]);
    return result.affectedRows > 0; // Return true if deletion was successful
};

module.exports = {
    createShop,
    getShopById,
    getAllShops,
    updateShop,
    deleteShop
};
