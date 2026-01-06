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
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-header">
                <h4 class="product-name">${escapeHtml(product.name)}</h4>
                <div class="product-actions">
                    <button class="btn-icon btn-edit" onclick="openEditModal(${product.id})" title="Edit">
                        ✏️ Edit
                    </button>
                    <button class="btn-icon btn-delete" onclick="confirmDelete(${product.id})" title="Delete">
                        🗑️ Delete
                    </button>
                </div>
            </div>
            <div class="product-body">
                <div class="product-info">
                    <div class="info-item">
                        <span class="info-label">Category:</span>
                        <span class="info-value">${product.category || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">User:</span>
                        <span class="info-value">${product.user || 'N/A'}</span>
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
    // Event listeners are now attached via onclick in the HTML
}

/**
 * Open edit modal and populate with product data
 * @param {number} productId - Product ID to edit
 */
function openEditModal(productId) {
    const product = getProductById(productId);
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }

    // Populate form with product data
    document.getElementById('edit-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-category').value = product.category || '';
    document.getElementById('edit-user').value = product.user || '';
    document.getElementById('edit-description').value = product.description || '';

    // Show modal
    document.getElementById('edit-modal').style.display = 'flex';
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-form').reset();
}

/**
 * Handle edit form submission
 */
function handleEditSubmit(e) {
    e.preventDefault();

    const productId = parseInt(document.getElementById('edit-id').value);
    const updatedProduct = {
        name: document.getElementById('edit-name').value.trim(),
        category: document.getElementById('edit-category').value,
        user: document.getElementById('edit-user').value.trim(),
        description: document.getElementById('edit-description').value.trim()
    };

    if (updateProduct(productId, updatedProduct)) {
        showMessage('Product updated successfully!', 'success');
        closeEditModal();
        displayInventory(); // Refresh the inventory display
        
        // Update stats if on index page
        if (typeof updateStats === 'function') {
            updateStats();
        }
    } else {
        showMessage('Error updating product. Please try again.', 'error');
    }
}

/**
 * Confirm and delete a product
 * @param {number} productId - Product ID to delete
 */
function confirmDelete(productId) {
    const product = getProductById(productId);
    if (!product) {
        showMessage('Product not found', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
        if (deleteProduct(productId)) {
            showMessage('Product deleted successfully!', 'success');
            displayInventory(); // Refresh the inventory display
            
            // Update stats if on index page
            if (typeof updateStats === 'function') {
                updateStats();
            }
        } else {
            showMessage('Error deleting product. Please try again.', 'error');
        }
    }
}

// Make functions globally available
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.confirmDelete = confirmDelete;
window.handleEditSubmit = handleEditSubmit;

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

