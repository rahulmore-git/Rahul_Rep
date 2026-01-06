# IT Inventory Web App - MVP Plan

## Overview
A simple web application for storing and managing IT product inventory with minimal features.

## Core Features (MVP)
1. **Landing Page** - Welcome page with navigation
2. **Add Product** - Form to add new IT products with essential fields
3. **View Inventory** - Display list of all products
4. **Data Persistence** - Store data in browser localStorage (simple, no backend needed)

## Product Fields (Minimal)
- Product Name (required)
- Category (e.g., Laptop, Monitor, Keyboard, etc.)
- User (required)
- Description (optional)
- Date Added (auto-generated)

## User Flow
1. User lands on home page
2. User clicks "Add Product" or "View Inventory"
3. **Adding Product:**
   - Fill out the form
   - Submit to save
   - Redirect to inventory view or show success message
4. **Viewing Inventory:**
   - See all products in a clean table/list
   - Basic filtering/search (optional for MVP)

## Tech Stack Recommendation
- **Frontend:** HTML, CSS, JavaScript (vanilla or a lightweight framework)
- **Storage:** Browser localStorage (no backend needed for MVP)
- **Styling:** Modern CSS with a clean, responsive design

## Project Structure
```
/
├── index.html          # Landing page
├── add-product.html    # Add product form
├── inventory.html      # View all products
├── css/
│   └── style.css       # Main styles
├── js/
│   ├── app.js          # Main app logic
│   └── storage.js      # localStorage utilities
└── README.md           # Setup instructions
```

## Future Enhancements (Post-MVP)
- Edit/Delete products
- Search and filter
- Categories management
- Export to CSV/Excel
- Backend integration (database)
- User authentication
- Product images
- Low stock alerts

