/**
 * Storage utilities for managing products in localStorage
 */

const STORAGE_KEY = 'it_inventory_products';

/**
 * Get all products from localStorage
 * @returns {Array} Array of product objects
 */
function getAllProducts() {
    const products = localStorage.getItem(STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

/**
 * Save all products to localStorage
 * @param {Array} products - Array of product objects
 */
function saveAllProducts(products) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        return true;
    } catch (error) {
        console.error('Error saving products:', error);
        return false;
    }
}

/**
 * Add a new product to storage
 * @param {Object} product - Product object to add
 * @returns {boolean} Success status
 */
function saveProduct(product) {
    const products = getAllProducts();
    products.push(product);
    return saveAllProducts(products);
}

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Object|null} Product object or null if not found
 */
function getProductById(id) {
    const products = getAllProducts();
    return products.find(p => p.id === id) || null;
}

/**
 * Delete a product by ID
 * @param {number} id - Product ID
 * @returns {boolean} Success status
 */
function deleteProduct(id) {
    const products = getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    return saveAllProducts(filtered);
}

/**
 * Get total count of products
 * @returns {number} Total number of unique products
 */
function getTotalProductCount() {
    return getAllProducts().length;
}

/**
 * Get total number of users
 * @returns {number} Count of unique users
 */
function getTotalItemCount() {
    const products = getAllProducts();
    const users = new Set();
    products.forEach(product => {
        if (product.user) {
            users.add(product.user);
        }
    });
    return users.size;
}

