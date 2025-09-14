# POS & Restaurant Management System

A comprehensive, feature-rich Point of Sale (POS) and management system designed for restaurants, cafes, and bistros. It's built as a modern, offline-first web application to ensure uninterrupted operation even without a stable internet connection.

## Key Features

- **Offline-First Functionality:** Powered by IndexedDB, the application remains fully functional offline. All data is stored locally and can be synced when the connection is restored.
- **PIN-based Staff Authentication:** Secure login for staff members using 4-digit PINs.
- **Role-Based Access Control (RBAC):** Granular permissions system to control access to different features based on staff roles (e.g., Manager, Waiter, Kitchen Staff).
- **Interactive Table & Floor Plan Management:** A dynamic, drag-and-drop interface to design the restaurant layout and manage table statuses (Available, Occupied, Billed).
- **Full-Featured Point of Sale (POS) Interface:** An intuitive interface for taking orders, customizing items, and managing the current bill.
- **Menu Item Customization:** Support for complex item customizations, including sizes, toppings, and special notes.
- **Kitchen Display System (KDS):** A real-time display for the kitchen staff to track incoming orders (KOTs) and update their status (New, Preparing, Ready).
- **Billing & Payment Processing:** A streamlined workflow for generating bills and processing payments with multiple payment methods.
- **Comprehensive Inventory Management:**
  - **Item Management:** Track stock levels, set low-stock thresholds, and manage item details.
  - **Purchase Orders:** Create and manage purchase orders to suppliers.
  - **Supplier & Category Management:** Organize inventory and suppliers effectively.
- **In-Depth Reporting Module:**
  - **Sales Report:** Analyze revenue, total orders, and average order value by period.
  - **Stock Report:** Get a real-time overview of inventory levels with powerful filtering.
  - **Purchase & Supplier Reports:** Track purchasing history and analyze spending per supplier.
- **AI-Powered Sales Forecasting:** A "Powered by NVIDIA" simulation that analyzes historical data to predict future sales revenue.
- **Extensive Settings Configuration:** Easily configure application-wide settings, including currency, tax rates, POS centers, and printer setups.

## Tech Stack

- **Frontend:** React (with Hooks)
- **Language:** TypeScript
- **Offline Storage:** IndexedDB
- **Styling:** CSS-in-JS (within component styles)

## Database Schema

A detailed breakdown of the data model, including all tables, fields, and relationships, is available in [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

## Project Structure

The application has been refactored to separate concerns, making it more modular and maintainable:

- `index.html`: The main HTML entry point for the application.
- `index.tsx`: The main application component. It handles top-level state management and renders the appropriate views.
- `components.tsx`: Contains all of the application's React UI components, from small cards and modals to entire page views.
- `data.ts`: The data and logic layer. This file contains all TypeScript type definitions, initial mock data, the IndexedDB service, utility functions, and custom hooks.
- `DATABASE_SCHEMA.md`: Detailed documentation of the database structure.
- `README.md`: This file.
