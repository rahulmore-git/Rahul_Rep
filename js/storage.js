/**
 * Storage utilities for managing products in localStorage
 */

const STORAGE_KEY = 'it_inventory_products';
const SELECTED_COMPANY_KEY = 'selected_company';
const SELECTED_BRANCH_KEY = 'selected_branch';
const STARTING_ID = 100;

// Remote DB (Supabase) configuration injected from HTML (set window.SUPABASE_URL/ANON_KEY)
const SUPABASE_URL = typeof window !== 'undefined' ? window.SUPABASE_URL || '' : '';
const SUPABASE_ANON_KEY = typeof window !== 'undefined' ? window.SUPABASE_ANON_KEY || '' : '';
const SUPABASE_TABLE = 'inventory_products';

let supabaseClient = null;

/**
 * Get the currently selected company
 * @returns {string|null} Selected company name or null
 */
function getSelectedCompany() {
    return sessionStorage.getItem(SELECTED_COMPANY_KEY);
}

/**
 * Set the selected company
 * @param {string} company - Company name to set
 */
function setSelectedCompany(company) {
    if (company) {
        sessionStorage.setItem(SELECTED_COMPANY_KEY, company);
    } else {
        sessionStorage.removeItem(SELECTED_COMPANY_KEY);
    }
}

/**
 * Get the currently selected branch
 * @returns {string|null} Selected branch or null
 */
function getSelectedBranch() {
    return sessionStorage.getItem(SELECTED_BRANCH_KEY);
}

/**
 * Set the selected branch
 * @param {string} branch - Branch name to set
 */
function setSelectedBranch(branch) {
    if (branch) {
        sessionStorage.setItem(SELECTED_BRANCH_KEY, branch);
    } else {
        sessionStorage.removeItem(SELECTED_BRANCH_KEY);
    }
}

/**
 * Generate the next unique ID starting from 100
 * @returns {number} Next available unique ID
 */
function generateUniqueId() {
    const products = getProductsByCompany(getSelectedCompany());
    
    if (products.length === 0) {
        return STARTING_ID;
    }
    
    // Find the highest existing ID
    const maxId = products.reduce((max, product) => {
        const id = parseInt(product.id) || 0;
        return id > max ? id : max;
    }, STARTING_ID - 1);
    
    // Return the next ID (maxId + 1)
    return maxId + 1;
}

/**
 * Get all products from localStorage
 * @returns {Array} Array of product objects
 */
function getAllProducts() {
    const products = localStorage.getItem(STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

/**
 * Get products filtered by company
 * @param {string} company - Company name to filter by
 * @returns {Array} Array of product objects for the specified company
 */
function getProductsByCompany(company) {
    if (!company) return [];
    const allProducts = getAllProducts();
    return allProducts.filter(product => product.company === company);
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
    const saved = saveAllProducts(products);
    if (saved) {
        syncProductToRemote(product);
    }
    return saved;
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
 * Check if a user already exists (case-insensitive) for the current company
 * @param {string} user - User name to check
 * @param {number} excludeId - Optional ID to exclude from check (for updates)
 * @returns {boolean} True if duplicate exists, false otherwise
 */
function isDuplicateUser(user, excludeId = null) {
    if (!user || !user.trim()) {
        return false;
    }
    
    const company = getSelectedCompany();
    if (!company) return false;
    
    const products = getProductsByCompany(company);
    const normalizedUser = user.trim().toLowerCase();
    
    return products.some(product => {
        const productUser = (product.user || '').trim().toLowerCase();
        const isDuplicate = productUser === normalizedUser;
        const isExcluded = excludeId !== null && product.id === excludeId;
        return isDuplicate && !isExcluded;
    });
}

/**
 * Update an existing product
 * @param {number} id - Product ID
 * @param {Object} updatedProduct - Updated product object
 * @returns {boolean} Success status
 */
function updateProduct(id, updatedProduct) {
    const products = getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    // Preserve the original ID and dateAdded, update other fields
    products[index] = {
        ...products[index],
        ...updatedProduct,
        id: id, // Ensure ID doesn't change
        dateAdded: products[index].dateAdded // Preserve original date
    };
    
    const saved = saveAllProducts(products);
    if (saved) {
        syncProductToRemote(products[index]);
    }
    return saved;
}

/**
 * Delete a product by ID
 * @param {number} id - Product ID
 * @returns {boolean} Success status
 */
function deleteProduct(id) {
    const products = getAllProducts();
    const product = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    const saved = saveAllProducts(filtered);
    if (saved && product) {
        deleteProductRemote(product);
    }
    return saved;
}

/**
 * Get total count of products for current company
 * @returns {number} Total number of unique products
 */
function getTotalProductCount() {
    const company = getSelectedCompany();
    if (!company) return 0;
    return getProductsByCompany(company).length;
}

/**
 * Get total number of users for current company
 * @returns {number} Count of unique users
 */
function getTotalItemCount() {
    const company = getSelectedCompany();
    if (!company) return 0;
    const products = getProductsByCompany(company);
    const users = new Set();
    products.forEach(product => {
        if (product.user) {
            users.add(product.user);
        }
    });
    return users.size;
}

/**
 * Initialize Supabase client if credentials are present
 * @returns {boolean} true if client initialized, false otherwise
 */
function initSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !window.supabase) {
        return false;
    }
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return !!supabaseClient;
}

/**
 * Sync local storage from remote DB (overwrites local)
 */
async function initializeRemoteData() {
    if (!initSupabase()) return;
    try {
        const { data, error } = await supabaseClient
            .from(SUPABASE_TABLE)
            .select('*')
            .order('id', { ascending: true });
        if (error) {
            console.warn('Remote sync skipped:', error.message);
            return;
        }
        if (Array.isArray(data) && data.length > 0) {
            saveAllProducts(data);
        }
    } catch (err) {
        console.warn('Remote sync failed:', err.message);
    }
}

/**
 * Upsert a product to remote DB
 */
async function syncProductToRemote(product) {
    if (!initSupabase() || !product) return;
    try {
        const payload = { ...product };
        await supabaseClient
            .from(SUPABASE_TABLE)
            .upsert(payload, { onConflict: 'id,company' });
    } catch (err) {
        console.warn('Remote upsert failed:', err.message);
    }
}

/**
 * Delete a product from remote DB
 */
async function deleteProductRemote(product) {
    if (!initSupabase() || !product) return;
    try {
        await supabaseClient
            .from(SUPABASE_TABLE)
            .delete()
            .eq('id', product.id)
            .eq('company', product.company || '');
    } catch (err) {
        console.warn('Remote delete failed:', err.message);
    }
}

// Make remote initializer available globally
if (typeof window !== 'undefined') {
    window.initializeRemoteData = initializeRemoteData;
}

