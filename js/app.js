/**
 * Main application logic
 */

/**
 * Display all products in the inventory list
 * @param {string} searchQuery - Optional search query to filter products
 */
function displayInventory(searchQuery = '') {
    const container = document.getElementById('inventory-list');
    const emptyState = document.getElementById('empty-state');

    if (!container) return;

    // Get filtered products based on search query
    const filteredProducts = getFilteredProducts(searchQuery);

    if (filteredProducts.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = searchQuery && searchQuery.trim() !== '' 
                ? '<p>🔍 No products found matching your search.</p><button onclick="clearSearch()" class="btn btn-primary">Clear Search</button>'
                : '<p>📦 No products in inventory yet.</p><a href="add-product.html" class="btn btn-primary">Add Your First Product</a>';
            container.style.display = 'none';
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.style.display = 'block';

    // Group by category
    const grouped = filteredProducts.reduce((acc, product) => {
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
    
    // Show search results count if searching
    if (searchQuery && searchQuery.trim() !== '') {
        html += `<div class="search-results-info">Found ${filteredProducts.length} product(s) matching "${escapeHtml(searchQuery)}"</div>`;
    }
    
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
 * Get filtered products based on search query
 * @param {string} searchQuery - Search query string
 * @returns {Array} Filtered products
 */
function getFilteredProducts(searchQuery = '') {
    const products = getAllProducts();
    
    if (!searchQuery || searchQuery.trim() === '') {
        return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(product => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const user = (product.user || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        
        return name.includes(query) || 
               category.includes(query) || 
               user.includes(query) || 
               description.includes(query);
    });
}

/**
 * Handle search input
 */
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    const query = searchInput.value;

    if (query && query.trim() !== '') {
        clearBtn.style.display = 'inline-block';
        displayInventory(query);
    } else {
        clearBtn.style.display = 'none';
        displayInventory('');
    }
}

/**
 * Clear search and show all products
 */
function clearSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    
    searchInput.value = '';
    clearBtn.style.display = 'none';
    displayInventory('');
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

/**
 * Export inventory data to Excel (CSV format)
 * Exports filtered results if search is active, otherwise exports all products
 */
function exportToExcel() {
    // Check if there's an active search query
    const searchInput = document.getElementById('search-input');
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    
    // Get filtered products based on search
    const products = getFilteredProducts(searchQuery);
    
    if (products.length === 0) {
        const message = searchQuery 
            ? 'No products found matching your search to export' 
            : 'No products to export';
        showMessage(message, 'error');
        return;
    }

    // Create CSV content
    const headers = ['ID', 'Product Name', 'Category', 'User', 'Description', 'Date Added'];
    const csvRows = [headers.join(',')];

    products.forEach(product => {
        const row = [
            product.id || '',
            escapeCsvField(product.name || ''),
            escapeCsvField(product.category || ''),
            escapeCsvField(product.user || ''),
            escapeCsvField(product.description || ''),
            product.dateAdded || ''
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    
    // Add BOM for UTF-8 (helps Excel recognize encoding)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with current date and search query if applicable
    const date = new Date().toISOString().split('T')[0];
    let filename = 'inventory_export_';
    
    if (searchQuery) {
        // Clean search query for filename (remove special characters)
        const cleanQuery = searchQuery.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        filename += `search_${cleanQuery}_${date}.csv`;
    } else {
        filename += `${date}.csv`;
    }
    
    link.setAttribute('download', filename);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const exportMessage = searchQuery 
        ? `Exported ${products.length} filtered product(s) successfully!` 
        : `Exported ${products.length} product(s) successfully!`;
    showMessage(exportMessage, 'success');
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 * @param {string} field - Field value to escape
 * @returns {string} Escaped field value
 */
function escapeCsvField(field) {
    if (field === null || field === undefined) {
        return '';
    }
    
    const stringField = String(field);
    
    // If field contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return '"' + stringField.replace(/"/g, '""') + '"';
    }
    
    return stringField;
}

/**
 * Parse CSV content into array of objects
 * @param {string} csvContent - CSV file content
 * @returns {Array} Array of parsed objects
 */
function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
        return [];
    }

    // Remove BOM if present
    lines[0] = lines[0].replace(/^\uFEFF/, '');
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    
    // Expected headers (case-insensitive)
    const expectedHeaders = ['id', 'product name', 'category', 'user', 'description', 'date added'];
    const headerMap = {};
    
    headers.forEach((header, index) => {
        const normalizedHeader = header.trim().toLowerCase();
        const expectedIndex = expectedHeaders.indexOf(normalizedHeader);
        if (expectedIndex !== -1) {
            headerMap[expectedHeaders[expectedIndex]] = index;
        }
    });

    // Parse data rows
    const products = [];
    const existingProducts = getAllProducts();
    const existingIds = new Set(existingProducts.map(p => parseInt(p.id) || 0));
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || values.every(v => !v.trim())) continue;
        
        // Get ID from CSV if available, otherwise generate new one
        let productId;
        if (headerMap['id'] !== undefined) {
            const csvId = parseInt(values[headerMap['id']]);
            // Only use CSV ID if it's valid and unique
            if (csvId && csvId >= 100 && !existingIds.has(csvId)) {
                productId = csvId;
                existingIds.add(csvId); // Track to avoid duplicates in same import
            } else {
                productId = generateUniqueId();
                existingIds.add(productId); // Track to avoid duplicates in same import
            }
        } else {
            productId = generateUniqueId();
            existingIds.add(productId); // Track to avoid duplicates in same import
        }
        
        const product = {
            id: productId,
            name: headerMap['product name'] !== undefined ? values[headerMap['product name']].trim() : '',
            category: headerMap['category'] !== undefined ? values[headerMap['category']].trim() : '',
            user: headerMap['user'] !== undefined ? values[headerMap['user']].trim() : '',
            description: headerMap['description'] !== undefined ? values[headerMap['description']].trim() : '',
            dateAdded: headerMap['date added'] !== undefined ? values[headerMap['date added']].trim() : new Date().toISOString().split('T')[0]
        };

        // Validate required fields
        if (!product.name || !product.category || !product.user) {
            continue; // Skip invalid rows
        }

        products.push(product);
    }

    return products;
}

/**
 * Parse a single CSV line handling quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
function parseCSVLine(line) {
    const fields = [];
    let currentField = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // Field separator
            fields.push(currentField);
            currentField = '';
        } else {
            currentField += char;
        }
    }
    
    // Add last field
    fields.push(currentField);
    
    return fields;
}

/**
 * Import data from Excel/CSV file
 * @param {Event} event - File input change event
 */
function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
        showMessage('Please select a CSV or Excel file (.csv, .xls, .xlsx)', 'error');
        event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            const products = parseCSV(csvContent);

            if (products.length === 0) {
                showMessage('No valid products found in the file. Please check the format.', 'error');
                event.target.value = ''; // Reset file input
                return;
            }

            // Ask for confirmation
            const importMode = confirm(
                `Found ${products.length} product(s) to import.\n\n` +
                `Choose:\n` +
                `OK - Append to existing inventory\n` +
                `Cancel - Replace existing inventory`
            );

            let successCount = 0;
            let errorCount = 0;

            if (importMode) {
                // Append mode - add new products
                products.forEach(product => {
                    // Check if product with same ID exists
                    const existing = getProductById(product.id);
                    if (existing) {
                        // Generate new unique ID for duplicate
                        product.id = generateUniqueId();
                    }
                    
                    if (saveProduct(product)) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                });
            } else {
                // Replace mode - clear and add new products
                const allProducts = getAllProducts();
                if (allProducts.length > 0) {
                    if (!confirm('This will delete all existing inventory. Are you sure?')) {
                        event.target.value = ''; // Reset file input
                        return;
                    }
                }

                // Clear existing products
                saveAllProducts([]);

                // Add imported products
                products.forEach(product => {
                    if (saveProduct(product)) {
                        successCount++;
                    } else {
                        errorCount++;
                    }
                });
            }

            // Refresh display
            displayInventory();
            
            // Update stats if on index page
            if (typeof updateStats === 'function') {
                updateStats();
            }

            // Show result message
            if (errorCount > 0) {
                showMessage(`Import completed: ${successCount} added, ${errorCount} failed`, 'error');
            } else {
                showMessage(`Successfully imported ${successCount} product(s)!`, 'success');
            }

        } catch (error) {
            console.error('Import error:', error);
            showMessage('Error importing file: ' + error.message, 'error');
        }

        // Reset file input
        event.target.value = '';
    };

    reader.onerror = function() {
        showMessage('Error reading file. Please try again.', 'error');
        event.target.value = ''; // Reset file input
    };

    // Read file as text (CSV) or binary (for Excel - would need a library for .xls/.xlsx)
    if (fileName.endsWith('.csv')) {
        reader.readAsText(file, 'UTF-8');
    } else {
        // For .xls/.xlsx files, we'll read as text and hope it's CSV format
        // For proper Excel support, would need a library like SheetJS
        showMessage('Please save your Excel file as CSV format for import, or use a CSV file directly.', 'error');
        event.target.value = ''; // Reset file input
        return;
    }
}

// Make functions globally available
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.confirmDelete = confirmDelete;
window.handleEditSubmit = handleEditSubmit;
window.exportToExcel = exportToExcel;
window.importFromExcel = importFromExcel;
window.handleSearch = handleSearch;
window.clearSearch = clearSearch;

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

