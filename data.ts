import { useMemo, useCallback } from 'react';

// --- OFFLINE DATA PERSISTENCE (INDEXEDDB) ---
export class DBService {
    private db: IDBDatabase | null = null;
    private dbName = 'posSystemDB';
    private dbVersion = 1;

    private storeNames = [
        'menuItems', 'categories', 'suppliers', 'purchaseOrders', 'orders', 
        'kots', 'tables', 'staff', 'roles', 'currencies', 'posCenters', 
        'printers', 'propertyDetails', 'taxes', 'appSettings'
    ];

    public async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject("Error opening DB");
            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                this.storeNames.forEach(name => {
                    if (!db.objectStoreNames.contains(name)) {
                        let keyPath: string;
                        if (name === 'appSettings' || name === 'propertyDetails') {
                            keyPath = 'key';
                        } else if (name === 'currencies') {
                            keyPath = 'code';
                        } else {
                            keyPath = 'id';
                        }
                        db.createObjectStore(name, { keyPath });
                    }
                });
            };
        });
    }

    public async saveData<T>(storeName: string, data: T[] | T): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            store.clear(); 
            
            const items = Array.isArray(data) ? data : [data];
            items.forEach(item => store.put(item));

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(`Error saving data to ${storeName}`);
        });
    }

    public async loadData<T>(storeName: string): Promise<T[]> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result as T[]);
            request.onerror = () => reject(`Error loading data from ${storeName}`);
        });
    }
}
export const dbService = new DBService();


// --- TYPE DEFINITIONS ---
export type Permission = 'view_dashboard' | 'access_pos' | 'view_tables' | 'edit_floor_plan' | 'view_orders' | 'view_inventory' | 'manage_items' | 'receive_purchases' | 'manage_staff' | 'manage_settings' | 'manage_pos_centers' | 'view_sales_reports' | 'generate_bills' | 'process_payments' | 'view_billing' | 'view_kitchen_display' | 'send_orders_to_kitchen';

export interface Currency {
    code: string; 
    symbol: string; 
    name: string; 
    placement: 'before' | 'after';
}
export interface Tax {
    id: number;
    name: string;
    rate: number; 
    isDefault: boolean;
}
export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}
export interface Staff {
    id: number;
    name: string;
    pin: string; 
    roleId: number;
    status: 'Active' | 'Inactive';
}
export interface POSCenter {
    id: number;
    name: string;
    status: 'Enabled' | 'Disabled';
}
export interface Printer {
    id: number;
    name: string;
    type: 'Receipt' | 'KOT';
    ipAddress: string;
    status: 'Connected' | 'Disconnected';
}
export interface PropertyDetails {
    key: string; 
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}
export interface Category {
    id: number;
    name: string;
}
export interface Supplier {
    id: number;
    name: string;
}
export interface PurchaseOrderItem {
    menuItemId: number;
    quantity: number;
    cost: number;
}
export interface PurchaseOrder {
    id: string;
    supplierId: number;
    date: string;
    items: PurchaseOrderItem[];
    totalCost: number;
    status: 'Pending' | 'Received';
}
export interface CustomizationOption {
    name: string;
    price: number;
}
export interface CustomizationTemplate {
    type: 'size' | 'toppings' | 'notes';
    label: string;
    options?: CustomizationOption[];
    maxSelections?: number;
}
export interface MenuItem {
    id: number;
    name: string;
    categoryId: number;
    price: number;
    stock: number;
    lowStockThreshold: number;
    unitOfMeasurement: 'pcs' | 'kg' | 'ltr' | 'item';
    imageUrl: string;
    customizationTemplate?: CustomizationTemplate[];
}
export interface SelectedCustomization {
    label: string;
    value: string;
    price: number;
}
export interface OrderItem {
    orderItemId: number; 
    menuItem: MenuItem;
    selectedCustomizations: SelectedCustomization[];
    finalPrice: number;
    quantity: number;
    sentToKitchen: boolean;
}

export interface Order {
    id: string;
    createdDate: string;
    billedDate?: string;
    completedDate?: string;
    items: OrderItem[];
    subtotal: number;
    taxDetails: {
        name: string;
        rate: number;
        amount: number;
    } | null;
    total: number;
    status: 'Completed' | 'Pending' | 'Billed' | 'Draft';
    tableId: string | null;
    posCenterId: number | null;
    paymentMethod?: 'Cash' | 'Card' | 'Other';
}

export interface KOTItem {
    orderItemId: number;
    name: string;
    quantity: number;
    customizations: SelectedCustomization[];
}
export interface KOT {
    id: string;
    orderId: string;
    tableId: string;
    tableName: string;
    posCenterName: string;
    items: KOTItem[];
    status: 'New' | 'Preparing' | 'Ready';
    createdAt: number; 
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: 'square' | 'circle';
  x: number;
  y: number;
  orderId: string | null;
  posCenterId: number;
}
export interface AppSettings {
    key: string;
    currency: Currency;
    lastSync: number;
}

// --- MOCK DATA ---
export const ALL_PERMISSIONS: Permission[] = ['view_dashboard', 'access_pos', 'view_tables', 'edit_floor_plan', 'process_payments', 'view_orders', 'view_inventory', 'manage_items', 'receive_purchases', 'manage_staff', 'manage_settings', 'manage_pos_centers', 'view_sales_reports', 'generate_bills', 'view_billing', 'view_kitchen_display', 'send_orders_to_kitchen'];
export const initialRoles: Role[] = [
    { id: 1, name: 'Manager', permissions: ALL_PERMISSIONS },
    { id: 2, name: 'Waiter', permissions: ['access_pos', 'view_tables', 'view_orders', 'generate_bills', 'send_orders_to_kitchen'] },
    { id: 3, name: 'Cashier', permissions: ['access_pos', 'process_payments', 'view_dashboard', 'view_orders', 'view_billing'] },
    { id: 4, name: 'Inventory Manager', permissions: ['view_inventory', 'manage_items', 'receive_purchases', 'view_sales_reports'] },
    { id: 5, name: 'Kitchen Staff', permissions: ['view_kitchen_display'] },
    { id: 6, name: 'Bartender', permissions: ['access_pos', 'view_tables', 'view_orders', 'send_orders_to_kitchen']},
    { id: 7, name: 'Host', permissions: ['view_tables', 'edit_floor_plan']},
];
export const initialStaff: Staff[] = [
    { id: 1, name: 'Admin', pin: '1234', roleId: 1, status: 'Active' },
    { id: 2, name: 'John Doe', pin: '1111', roleId: 2, status: 'Active' },
    { id: 3, name: 'Jane Smith', pin: '2222', roleId: 3, status: 'Active' },
    { id: 4, name: 'Chef Mike', pin: '5555', roleId: 5, status: 'Active' },
    { id: 5, name: 'Sara Lee', pin: '6666', roleId: 6, status: 'Active' },
    { id: 6, name: 'Tom Allen', pin: '7777', roleId: 7, status: 'Active' },
    { id: 7, name: 'Emily White', pin: '8888', roleId: 2, status: 'Active' },
    { id: 8, name: 'Chris Green', pin: '9999', roleId: 2, status: 'Inactive' },
];

export const initialCategories: Category[] = [
    { id: 1, name: 'Appetizer' },
    { id: 2, name: 'Soups & Salads' },
    { id: 3, name: 'Pasta' },
    { id: 4, name: 'Steaks' },
    { id: 5, name: 'Seafood' },
    { id: 6, name: 'Pizza' },
    { id: 7, name: 'Burgers' },
    { id: 8, name: 'Side Dish' },
    { id: 9, name: 'Dessert' },
    { id: 10, name: 'Cocktails' },
    { id: 11, name: 'Wines' },
    { id: 12, name: 'Beverage' },
];
export const initialSuppliers: Supplier[] = [
    { id: 1, name: 'Fresh Produce Co.' },
    { id: 2, name: 'Artisan Breads & Co.' },
    { id: 3, name: 'Ocean Delights Seafood' },
    { id: 4, name: 'Prime Meats Inc.' },
];
export const initialPOSCenters: POSCenter[] = [
    { id: 1, name: 'Main Dining', status: 'Enabled' },
    { id: 2, name: 'Rooftop Bar', status: 'Enabled' },
    { id: 3, name: 'Patio', status: 'Enabled' },
    { id: 4, name: 'Private Room', status: 'Disabled' },
];
export const initialPrinters: Printer[] = [
    { id: 1, name: 'Cashier Printer', type: 'Receipt', ipAddress: '192.168.1.100', status: 'Connected' },
    { id: 2, name: 'Kitchen Printer', type: 'KOT', ipAddress: '192.168.1.101', status: 'Connected' },
    { id: 3, name: 'Bar Printer', type: 'KOT', ipAddress: '192.168.1.102', status: 'Disconnected' },
];
export const initialPropertyDetails: PropertyDetails = {
    key: 'propertyDetails',
    name: 'Gemini Bistro',
    address: '123 AI Avenue, Tech City, 10101',
    phone: '(555) 123-4567',
    email: 'contact@geminibistro.com',
    website: 'www.geminibistro.com',
};
export const initialTaxes: Tax[] = [
    { id: 1, name: 'VAT', rate: 10, isDefault: true },
    { id: 2, name: 'Service Charge', rate: 5, isDefault: false },
];

export const initialMenuItems: MenuItem[] = [
    // Appetizers
    { id: 1, name: 'Bruschetta', categoryId: 1, price: 9.50, stock: 50, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?q=80&w=2972&auto=format&fit=crop' },
    { id: 2, name: 'Calamari Fritti', categoryId: 1, price: 13.00, stock: 35, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1639722340228-59c4a5530514?q=80&w=2970&auto=format&fit=crop' },
    { id: 3, name: 'Grilled Octopus', categoryId: 1, price: 18.00, stock: 0, lowStockThreshold: 5, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1625944131295-0de35b23f8d2?q=80&w=2970&auto=format&fit=crop' },
    // Salads
    { id: 4, name: 'Caesar Salad', categoryId: 2, price: 10.50, stock: 40, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=3087&auto=format&fit=crop',
        customizationTemplate: [{ type: 'toppings', label: 'Add Protein', options: [{ name: 'Chicken', price: 4.00 }, { name: 'Shrimp', price: 6.00 }]}]
    },
    // Pasta
    { id: 5, name: 'Spaghetti Carbonara', categoryId: 3, price: 17.00, stock: 30, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1600803832117-7cd91a1f2458?q=80&w=2970&auto=format&fit=crop' },
    { id: 6, name: 'Build Your Own Pasta', categoryId: 3, price: 14.00, stock: 100, lowStockThreshold: 20, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e326b20f545a?q=80&w=2968&auto=format&fit=crop',
        customizationTemplate: [
            { type: 'size', label: 'Pasta', options: [{ name: 'Penne', price: 0 }, { name: 'Spaghetti', price: 0 }, { name: 'Fettuccine', price: 0 }] },
            { type: 'size', label: 'Sauce', options: [{ name: 'Marinara', price: 0 }, { name: 'Alfredo', price: 2.00 }, { name: 'Pesto', price: 2.50 }] },
            { type: 'toppings', label: 'Add-ons', maxSelections: 4, options: [{ name: 'Meatballs', price: 3.00 }, { name: 'Chicken', price: 4.00 }, { name: 'Mushrooms', price: 1.50 }, { name: 'Spinach', price: 1.00 }] }
        ]
    },
    // Steaks
    { id: 7, name: 'Ribeye Steak (12oz)', categoryId: 4, price: 38.00, stock: 15, lowStockThreshold: 5, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1629734164475-4c05f0371913?q=80&w=2970&auto=format&fit=crop',
        customizationTemplate: [
            { type: 'notes', label: 'Cooking Temperature' },
            { type: 'size', label: 'Side Dish', options: [{ name: 'Fries', price: 0 }, { name: 'Mashed Potatoes', price: 0 }, { name: 'Grilled Asparagus', price: 2.00 }] }
        ]
    },
    // Seafood
    { id: 8, name: 'Pan Seared Salmon', categoryId: 5, price: 26.00, stock: 25, lowStockThreshold: 8, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1559058789-672da06263d8?q=80&w=2970&auto=format&fit=crop' },
    // Pizza
    { id: 9, name: 'Margherita Pizza', categoryId: 6, price: 15.99, stock: 40, lowStockThreshold: 10, unitOfMeasurement: 'pcs', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=2969&auto=format&fit=crop',
        customizationTemplate: [
            { type: 'toppings', label: 'Add Toppings', maxSelections: 3, options: [{ name: 'Extra Cheese', price: 1.50 }, { name: 'Mushrooms', price: 0.75 }, { name: 'Pepperoni', price: 1.25 }] },
        ]
    },
    // Burgers
    { id: 10, name: 'Classic Burger', categoryId: 7, price: 16.00, stock: 20, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=3099&auto=format&fit=crop',
      customizationTemplate: [{ type: 'notes', label: 'Cooking Instructions (e.g., well-done)' }]
    },
    // Sides
    { id: 11, name: 'French Fries', categoryId: 8, price: 5.99, stock: 100, lowStockThreshold: 20, unitOfMeasurement: 'kg', imageUrl: 'https://images.unsplash.com/photo-1576107232684-c5e9360d7388?q=80&w=3087&auto=format&fit=crop' },
    { id: 12, name: 'Garlic Bread', categoryId: 8, price: 6.50, stock: 50, lowStockThreshold: 15, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1627907230485-67c21c7621a4?q=80&w=2970&auto=format&fit=crop' },
    // Desserts
    { id: 13, name: 'Chocolate Lava Cake', categoryId: 9, price: 8.99, stock: 30, lowStockThreshold: 8, unitOfMeasurement: 'pcs', imageUrl: 'https://images.unsplash.com/photo-1586985289936-241ae2a06183?q=80&w=3087&auto=format&fit=crop' },
    { id: 14, name: 'Tiramisu', categoryId: 9, price: 9.50, stock: 25, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1571677443834-9c2b4f48b049?q=80&w=3087&auto=format&fit=crop' },
    // Cocktails
    { id: 15, name: 'Old Fashioned', categoryId: 10, price: 14.00, stock: 100, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1566733925082-2ab723c3a0dc?q=80&w=3087&auto=format&fit=crop' },
    { id: 16, name: 'Mojito', categoryId: 10, price: 12.00, stock: 8, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2970&auto=format&fit=crop' },
    // Wines
    { id: 17, name: 'Cabernet Sauvignon (Glass)', categoryId: 11, price: 15.00, stock: 20, lowStockThreshold: 5, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1529125348995-17a47a10dd16?q=80&w=2970&auto=format&fit=crop' },
    // Beverages
    { id: 18, name: 'Iced Latte', categoryId: 12, price: 4.50, stock: 100, lowStockThreshold: 10, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1517701550927-4e4b75a1378d?q=80&w=3087&auto=format&fit=crop' },
    { id: 19, name: 'Sparkling Water', categoryId: 12, price: 3.00, stock: 200, lowStockThreshold: 50, unitOfMeasurement: 'item', imageUrl: 'https://images.unsplash.com/photo-1621112417534-1d1b54a7a8a1?q=80&w=2972&auto=format&fit=crop' },
];

export const initialTables: Table[] = [
  // Main Dining
  { id: 't1', name: 'T1', capacity: 4, shape: 'square', x: 50, y: 50, orderId: 'ORD-DRAFT-1', posCenterId: 1 },
  { id: 't2', name: 'T2', capacity: 2, shape: 'circle', x: 200, y: 80, orderId: null, posCenterId: 1 },
  { id: 't3', name: 'T3', capacity: 6, shape: 'square', x: 80, y: 200, orderId: 'ORD-BILLED-1', posCenterId: 1 },
  { id: 't4', name: 'T4', capacity: 4, shape: 'square', x: 250, y: 200, orderId: 'ORD-PENDING-2', posCenterId: 1 },
  { id: 't5', name: 'T5', capacity: 2, shape: 'circle', x: 400, y: 50, orderId: null, posCenterId: 1 },
  { id: 't6', name: 'T6', capacity: 8, shape: 'square', x: 450, y: 250, orderId: null, posCenterId: 1 },
  // Rooftop Bar
  { id: 'b1', name: 'Bar 1', capacity: 2, shape: 'circle', x: 50, y: 50, orderId: null, posCenterId: 2 },
  { id: 'b2', name: 'Bar 2', capacity: 2, shape: 'circle', x: 150, y: 50, orderId: 'ORD-PENDING-1', posCenterId: 2 },
  { id: 'b3', name: 'Lounge 1', capacity: 6, shape: 'square', x: 50, y: 150, orderId: null, posCenterId: 2 },
  // Patio
  { id: 'p1', name: 'P1', capacity: 4, shape: 'square', x: 50, y: 50, orderId: null, posCenterId: 3 },
  { id: 'p2', name: 'P2', capacity: 4, shape: 'square', x: 150, y: 50, orderId: null, posCenterId: 3 },
  { id: 'p3', name: 'P3', capacity: 2, shape: 'circle', x: 50, y: 150, orderId: null, posCenterId: 3 },
  { id: 'p4', name: 'P4', capacity: 2, shape: 'circle', x: 150, y: 150, orderId: null, posCenterId: 3 },
  { id: 'p5', name: 'P5', capacity: 6, shape: 'square', x: 250, y: 100, orderId: null, posCenterId: 3 },
  { id: 'p6', name: 'P6', capacity: 4, shape: 'square', x: 400, y: 100, orderId: null, posCenterId: 3 },
];

const getDateString = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const calculateOrderTotals = (items: OrderItem[], tax: Tax | null): Pick<Order, 'subtotal' | 'taxDetails' | 'total'> => {
    const subtotal = items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
    const taxDetails = tax ? {
        name: tax.name,
        rate: tax.rate,
        amount: subtotal * (tax.rate / 100),
    } : null;
    const total = subtotal + (taxDetails?.amount || 0);
    return { subtotal, taxDetails, total };
};

const defaultTax = initialTaxes.find(t => t.isDefault)!;
type RawOrder = Omit<Order, 'subtotal' | 'taxDetails' | 'total'>;
const rawOrders: RawOrder[] = [
    // --- ACTIVE ORDERS ---
    // Draft Order (On Table T1)
    { id: 'ORD-DRAFT-1', createdDate: getDateString(0), tableId: 't1', posCenterId: 1, status: 'Draft', items: [
        { orderItemId: 1, menuItem: initialMenuItems[9], selectedCustomizations: [], finalPrice: 16.00, quantity: 1, sentToKitchen: false },
        { orderItemId: 2, menuItem: initialMenuItems[10], selectedCustomizations: [], finalPrice: 5.99, quantity: 1, sentToKitchen: false },
    ]},
    // Pending Order (On Table B2) - KOT NEW
    { id: 'ORD-PENDING-1', createdDate: getDateString(0), tableId: 'b2', posCenterId: 2, status: 'Pending', items: [
        { orderItemId: 3, menuItem: initialMenuItems[14], selectedCustomizations: [], finalPrice: 14.00, quantity: 2, sentToKitchen: true },
        { orderItemId: 4, menuItem: initialMenuItems[15], selectedCustomizations: [], finalPrice: 12.00, quantity: 1, sentToKitchen: true },
    ]},
    // Pending Order (On Table T4) - KOT PREPARING
    { id: 'ORD-PENDING-2', createdDate: getDateString(0), tableId: 't4', posCenterId: 1, status: 'Pending', items: [
        { orderItemId: 5, menuItem: initialMenuItems[6], selectedCustomizations: [{label: 'Cooking Temperature', value: 'Medium Rare', price: 0}, {label: 'Side Dish', value: 'Mashed Potatoes', price: 0}], finalPrice: 38.00, quantity: 1, sentToKitchen: true },
    ]},
    // Billed Order (On Table T3)
    { id: 'ORD-BILLED-1', createdDate: getDateString(0), billedDate: getDateString(0), tableId: 't3', posCenterId: 1, status: 'Billed', items: [
        { orderItemId: 6, menuItem: initialMenuItems[0], selectedCustomizations: [], finalPrice: 9.50, quantity: 1, sentToKitchen: true },
        { orderItemId: 7, menuItem: initialMenuItems[3], selectedCustomizations: [], finalPrice: 10.50, quantity: 2, sentToKitchen: true },
        { orderItemId: 8, menuItem: initialMenuItems[17], selectedCustomizations: [], finalPrice: 4.50, quantity: 2, sentToKitchen: true },
    ]},

    // --- COMPLETED ORDERS (History) ---
    { id: 'ORD-001', createdDate: getDateString(1), completedDate: getDateString(1), tableId: null, posCenterId: 1, status: 'Completed', paymentMethod: 'Card', items: [
        { orderItemId: 9, menuItem: initialMenuItems[4], selectedCustomizations: [], finalPrice: 17.00, quantity: 2, sentToKitchen: true },
        { orderItemId: 10, menuItem: initialMenuItems[16], selectedCustomizations: [], finalPrice: 15.00, quantity: 2, sentToKitchen: true },
    ]},
    { id: 'ORD-002', createdDate: getDateString(2), completedDate: getDateString(2), tableId: null, posCenterId: 2, status: 'Completed', paymentMethod: 'Cash', items: [
        { orderItemId: 11, menuItem: initialMenuItems[14], selectedCustomizations: [], finalPrice: 14.00, quantity: 4, sentToKitchen: true },
    ]},
    { id: 'ORD-003', createdDate: getDateString(3), completedDate: getDateString(3), tableId: null, posCenterId: 3, status: 'Completed', paymentMethod: 'Card', items: [
        { orderItemId: 12, menuItem: initialMenuItems[8], selectedCustomizations: [{label: 'Add Toppings', value: 'Pepperoni', price: 1.25}], finalPrice: 17.24, quantity: 1, sentToKitchen: true },
        { orderItemId: 13, menuItem: initialMenuItems[18], selectedCustomizations: [], finalPrice: 3.00, quantity: 2, sentToKitchen: true },
    ]},
    { id: 'ORD-004', createdDate: getDateString(5), completedDate: getDateString(5), tableId: null, posCenterId: 1, status: 'Completed', paymentMethod: 'Other', items: [
        { orderItemId: 14, menuItem: initialMenuItems[7], selectedCustomizations: [], finalPrice: 26.00, quantity: 1, sentToKitchen: true },
    ]},
    { id: 'ORD-005', createdDate: getDateString(7), completedDate: getDateString(7), tableId: null, posCenterId: 1, status: 'Completed', paymentMethod: 'Card', items: [
        { orderItemId: 15, menuItem: initialMenuItems[13], selectedCustomizations: [], finalPrice: 9.50, quantity: 1, sentToKitchen: true },
        { orderItemId: 16, menuItem: initialMenuItems[12], selectedCustomizations: [], finalPrice: 8.99, quantity: 1, sentToKitchen: true },
    ]},
    { id: 'ORD-006', createdDate: getDateString(10), completedDate: getDateString(10), tableId: null, posCenterId: 3, status: 'Completed', paymentMethod: 'Cash', items: [
        { orderItemId: 17, menuItem: initialMenuItems[0], selectedCustomizations: [], finalPrice: 9.50, quantity: 1, sentToKitchen: true },
        { orderItemId: 18, menuItem: initialMenuItems[1], selectedCustomizations: [], finalPrice: 13.00, quantity: 1, sentToKitchen: true },
    ]},
];

export const initialOrders: Order[] = rawOrders.map(o => ({
    ...o,
    ...calculateOrderTotals(o.items, defaultTax)
}));

export const initialKOTs: KOT[] = [
    {
        id: 'KOT-1', orderId: 'ORD-PENDING-1', tableId: 'b2', tableName: 'Bar 2', posCenterName: 'Rooftop Bar', status: 'New', createdAt: Date.now() - 60000 * 2,
        items: initialOrders.find(o => o.id === 'ORD-PENDING-1')!.items.map(oi => ({...oi, name: oi.menuItem.name, customizations: oi.selectedCustomizations}))
    },
    {
        id: 'KOT-2', orderId: 'ORD-PENDING-2', tableId: 't4', tableName: 'T4', posCenterName: 'Main Dining', status: 'Preparing', createdAt: Date.now() - 60000 * 5,
        items: initialOrders.find(o => o.id === 'ORD-PENDING-2')!.items.map(oi => ({...oi, name: oi.menuItem.name, customizations: oi.selectedCustomizations}))
    },
     {
        id: 'KOT-3', orderId: 'ORD-BILLED-1', tableId: 't3', tableName: 'T3', posCenterName: 'Main Dining', status: 'Ready', createdAt: Date.now() - 60000 * 12,
        items: initialOrders.find(o => o.id === 'ORD-BILLED-1')!.items.map(oi => ({...oi, name: oi.menuItem.name, customizations: oi.selectedCustomizations}))
    }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplierId: 1, date: getDateString(10), items: [{ menuItemId: 4, quantity: 20, cost: 2.50 }, { menuItemId: 11, quantity: 50, cost: 1.00 }], totalCost: 100.00, status: 'Received' },
    { id: 'PO-002', supplierId: 4, date: getDateString(8), items: [{ menuItemId: 7, quantity: 10, cost: 15.00 }], totalCost: 150.00, status: 'Received' },
    { id: 'PO-003', supplierId: 3, date: getDateString(5), items: [{ menuItemId: 8, quantity: 15, cost: 9.50 }, { menuItemId: 2, quantity: 20, cost: 4.00 }], totalCost: 222.50, status: 'Received' },
    { id: 'PO-004', supplierId: 1, date: getDateString(1), items: [{ menuItemId: 1, quantity: 30, cost: 3.00 }], totalCost: 90.00, status: 'Pending' }
];

export const initialCurrencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', placement: 'before' },
    { code: 'EUR', name: 'Euro', symbol: '€', placement: 'after' },
    { code: 'GBP', name: 'British Pound', symbol: '£', placement: 'before' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', placement: 'before' },
];
export const initialAppSettings: AppSettings = {
    key: 'appSettings',
    currency: initialCurrencies[0],
    lastSync: Date.now(),
};


// --- UTILITY FUNCTIONS & HOOKS ---
export const formatCurrency = (amount: number, currency: Currency) => {
    if (!currency) return amount.toFixed(2);
    const formattedAmount = amount.toFixed(2);
    return currency.placement === 'before'
        ? `${currency.symbol}${formattedAmount}`
        : `${formattedAmount} ${currency.symbol}`;
};
export const areCustomizationsEqual = (c1: SelectedCustomization[], c2: SelectedCustomization[]): boolean => {
    if (c1.length !== c2.length) return false;
    const key = (c: SelectedCustomization) => `${c.label}:${c.value}`;
    const c1Sorted = [...c1].sort((a, b) => key(a).localeCompare(key(b)));
    const c2Sorted = [...c2].sort((a, b) => key(a).localeCompare(key(b)));
    return JSON.stringify(c1Sorted) === JSON.stringify(c2Sorted);
};

export const usePermissions = (currentUser: Staff | null, roles: Role[]) => {
    const userPermissions = useMemo(() => {
        if (!currentUser) return new Set<Permission>();
        const role = roles.find(r => r.id === currentUser.roleId);
        return new Set(role?.permissions || []);
    }, [currentUser, roles]);

    const hasPermission = useCallback((permission: Permission) => {
        return userPermissions.has(permission);
    }, [userPermissions]);
    
    return { hasPermission };
};