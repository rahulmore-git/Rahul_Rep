# IT Inventory Manager

A simple web application for managing IT product inventory. This MVP (Minimum Viable Product) allows you to add and view IT products with basic information.

## Features

- **Landing Page** - Overview with statistics
- **Add Products** - Simple form to add new IT products
- **View Inventory** - Display all products organized by category
- **Local Storage** - All data is stored in your browser's localStorage

## Getting Started

1. Simply open `index.html` in a modern web browser
2. No installation or server required!

## Usage

1. **Add a Product:**
   - Click "Add New Product" from the home page
   - Fill in the product details (Name, Category, Quantity, Description)
   - Click "Save Product"

2. **View Inventory:**
   - Click "View Inventory" from the home page
   - See all products organized by category

## Product Fields

- **Product Name** (required) - Name of the IT product
- **Category** (required) - Type of product (Laptop, Monitor, Keyboard, etc.)
- **Quantity** (required) - Number of items in stock
- **Description** (optional) - Additional details about the product

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks)
- Uses browser localStorage for data persistence
- Responsive design that works on mobile and desktop
- Modern, clean UI with gradient styling

## Future Enhancements

- Edit and delete products
- Search and filter functionality
- Export to CSV/Excel
- Backend integration with database
- User authentication
- Product images
- Low stock alerts

## Browser Support

Works best in modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Data Storage

All data is stored locally in your browser's localStorage. Clearing your browser data will remove all inventory items. For production use, consider implementing a backend database.

