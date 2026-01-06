/**
 * Main application logic
 */

/**
 * Display all products in the inventory list
 */
function displayInventory() {
    const products = getAllProducts();
    const container = document.getElementById('inventory-list');
    const emptyState = document.getElementById('empty-state');

    if (!container) return;

    if (products.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            container.style.display = 'none';
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'block';

    // Group by category
    const grouped = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    // Sort categories
    const sortedCategories = Object.keys(grouped).sort();

    let html = '';
    
    sortedCategories.forEach(category => {
        html += `<div class="category-section">`;
        html += `<h3 class="category-title">${category}</h3>`;
        html += `<div class="products-grid">`;
        
        grouped[category].forEach(product => {
            html += createProductCard(product);
        });
        
        html += `</div></div>`;
    });

    container.innerHTML = html;

    // Attach delete event listeners
    attachDeleteListeners();
}

/**
 * Create HTML for a product card
 * @param {Object} product - Product object
 * @returns {string} HTML string
 */
function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-header">
                <h4 class="product-name">${escapeHtml(product.name)}</h4>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <div class="info-item">
                        <span class="info-label">Quantity:</span>
                        <span class="info-value">${product.quantity || 0}</span>
                    </div>
                    ${product.description ? `
                    <div class="info-item">
                        <span class="info-label">Description:</span>
                        <span class="info-value">${escapeHtml(product.description)}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">Date Added:</span>
                        <span class="info-value">${formatDate(product.dateAdded)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach delete event listeners to delete buttons
 */
function attachDeleteListeners() {
    // Note: Delete functionality can be added later
    // For now, keeping it minimal as per MVP requirements
}

/**
 * Update statistics on landing page
 */
function updateStats() {
    const totalProducts = document.getElementById('total-products');
    const totalItems = document.getElementById('total-items');

    if (totalProducts) {
        totalProducts.textContent = getTotalProductCount();
    }
    if (totalItems) {
        totalItems.textContent = getTotalItemCount();
    }
}

/**
 * Show a message to the user
 * @param {string} text - Message text
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(text, type = 'success') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.className = `message message-${type}`;
    messageEl.style.display = 'block';

    // Hide after 3 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

