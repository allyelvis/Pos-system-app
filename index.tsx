import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

// Import data, types, and services
import {
    dbService,
    initialMenuItems, initialCategories, initialSuppliers, initialPurchaseOrders,
    initialOrders, initialKOTs, initialTables, initialStaff, initialRoles,
    initialCurrencies, initialPOSCenters, initialPrinters, initialPropertyDetails,
    initialTaxes, initialAppSettings,
    calculateOrderTotals,
    areCustomizationsEqual,
    usePermissions,
    type Staff, type Role, type MenuItem, type Category, type Supplier, type PurchaseOrder,
    type Order, type KOT, type Table, type POSCenter, type Printer, type PropertyDetails,
    type Tax, type AppSettings, type Currency, type OrderItem
} from './data';

// Import all components
import {
    Sidebar, AccessDenied, POSView, CustomizationModal, BillPreviewModal, PaymentModal,
    TablesView, PinLoginModal, DashboardView, OrderHistoryView, InventoryView,
    StaffManagementView, ReportsView, SettingsView, CurrencyModal, BillingView, KitchenView
} from './components';

// Main App Component
const App = () => {
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState<Staff | null>(null);
    const [loginError, setLoginError] = useState('');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    const [view, setView] = useState('tables');
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [kots, setKots] = useState<KOT[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [posCenters, setPosCenters] = useState<POSCenter[]>([]);
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>(initialPropertyDetails);
    const [taxes, setTaxes] = useState<Tax[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettings);
    
    // State setters wrapped with DB persistence
    const stateSetters = {
        setMenuItems: (data: MenuItem[]) => { setMenuItems(data); dbService.saveData('menuItems', data); },
        setCategories: (data: Category[]) => { setCategories(data); dbService.saveData('categories', data); },
        setSuppliers: (data: Supplier[]) => { setSuppliers(data); dbService.saveData('suppliers', data); },
        setPurchaseOrders: (data: PurchaseOrder[]) => { setPurchaseOrders(data); dbService.saveData('purchaseOrders', data); },
        setOrders: (data: Order[]) => { setOrders(data); dbService.saveData('orders', data); },
        setKots: (data: KOT[]) => { setKots(data); dbService.saveData('kots', data); },
        setTables: (data: Table[]) => { setTables(data); dbService.saveData('tables', data); },
        setStaff: (data: Staff[]) => { setStaff(data); dbService.saveData('staff', data); },
        setRoles: (data: Role[]) => { setRoles(data); dbService.saveData('roles', data); },
        setCurrencies: (data: Currency[]) => { setCurrencies(data); dbService.saveData('currencies', data); },
        setPosCenters: (data: POSCenter[]) => { setPosCenters(data); dbService.saveData('posCenters', data); },
        setPrinters: (data: Printer[]) => { setPrinters(data); dbService.saveData('printers', data); },
        setPropertyDetails: (data: PropertyDetails) => { setPropertyDetails(data); dbService.saveData('propertyDetails', data); },
        setTaxes: (data: Tax[]) => { setTaxes(data); dbService.saveData('taxes', data); },
        setAppSettings: (data: AppSettings) => { setAppSettings(data); dbService.saveData('appSettings', data); },
    };

    // --- Data Loading and Syncing ---
    useEffect(() => {
        const loadData = async () => {
            const storedMenuItems = await dbService.loadData<MenuItem>('menuItems');
            if (storedMenuItems.length > 0) {
                // Load all data from IndexedDB
                setMenuItems(storedMenuItems);
                setCategories(await dbService.loadData<Category>('categories'));
                setSuppliers(await dbService.loadData<Supplier>('suppliers'));
                setPurchaseOrders(await dbService.loadData<PurchaseOrder>('purchaseOrders'));
                setOrders(await dbService.loadData<Order>('orders'));
                setKots(await dbService.loadData<KOT>('kots'));
                setTables(await dbService.loadData<Table>('tables'));
                setStaff(await dbService.loadData<Staff>('staff'));
                setRoles(await dbService.loadData<Role>('roles'));
                setCurrencies(await dbService.loadData<Currency>('currencies'));
                setPosCenters(await dbService.loadData<POSCenter>('posCenters'));
                setPrinters(await dbService.loadData<Printer>('printers'));
                const [pd] = await dbService.loadData<PropertyDetails>('propertyDetails');
                if (pd) setPropertyDetails(pd);
                setTaxes(await dbService.loadData<Tax>('taxes'));
                const [as] = await dbService.loadData<AppSettings>('appSettings');
                if (as) setAppSettings(as);
            } else {
                // First time load, populate DB with initial data
                stateSetters.setMenuItems(initialMenuItems);
                stateSetters.setCategories(initialCategories);
                stateSetters.setSuppliers(initialSuppliers);
                stateSetters.setPurchaseOrders(initialPurchaseOrders);
                stateSetters.setOrders(initialOrders);
                stateSetters.setKots(initialKOTs);
                stateSetters.setTables(initialTables);
                stateSetters.setStaff(initialStaff);
                stateSetters.setRoles(initialRoles);
                stateSetters.setCurrencies(initialCurrencies);
                stateSetters.setPosCenters(initialPOSCenters);
                stateSetters.setPrinters(initialPrinters);
                stateSetters.setPropertyDetails(initialPropertyDetails);
                stateSetters.setTaxes(initialTaxes);
                stateSetters.setAppSettings(initialAppSettings);
            }
            setIsDataLoaded(true);
        };
        loadData();
        
        // Online/Offline detection
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleSync = () => {
        // In a real app, this would push queued local changes to the server
        // and pull fresh data. Here, we just update the sync time.
        stateSetters.setAppSettings({ ...appSettings, lastSync: Date.now() });
        alert('Data synced successfully!');
    };

    const [activeTableId, setActiveTableId] = useState<string | null>(null);
    const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);
    const [itemToEdit, setItemToEdit] = useState<OrderItem | null>(null);
    const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false);
    
    const [orderToBill, setOrderToBill] = useState<Order | null>(null);
    const [orderToPay, setOrderToPay] = useState<Order | null>(null);

    const { hasPermission } = usePermissions(currentUser, roles);
    const defaultTax = useMemo(() => taxes.find(t => t.isDefault) || null, [taxes]);

    const activeTable = useMemo(() => tables.find(t => t.id === activeTableId), [tables, activeTableId]);
    const activeOrder = useMemo(() => orders.find(o => o.id === activeTable?.orderId), [orders, activeTable]);
    
    const handleLogin = (pin: string) => {
        const user = staff.find(s => s.pin === pin && s.status === 'Active');
        if (user) {
            setCurrentUser(user);
            setLoginError('');
            const userRole = roles.find(r => r.id === user.roleId);
            if (userRole?.permissions.includes('view_kitchen_display')) setView('kitchen');
            else if (userRole?.permissions.includes('view_dashboard')) setView('dashboard');
            else if (userRole?.permissions.includes('view_tables')) setView('tables');
            else if (userRole?.permissions.includes('view_inventory')) setView('inventory');
            else setView('pos'); // Fallback
        } else {
            setLoginError('Invalid PIN');
            setTimeout(() => setLoginError(''), 2000);
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setActiveTableId(null);
    };
    
    const updateOrder = (orderId: string, updatedOrderItems: OrderItem[]) => {
        const totals = calculateOrderTotals(updatedOrderItems, defaultTax);
        
        const updatedOrders = orders.map(o => o.id === orderId ? {
            ...o,
            items: updatedOrderItems,
            ...totals,
        } : o);
        stateSetters.setOrders(updatedOrders);
    }
    
    const handleTableClick = (tableId: string) => {
        if (!hasPermission('access_pos')) return;
        setActiveTableId(tableId);
        setView('pos');
    };
    
    const handleAddItemToOrder = (item: MenuItem) => {
        if (!activeTable) return;
        
        const currentOrder = orders.find(o => o.id === activeTable.orderId);
        if (currentOrder && currentOrder.status !== 'Draft' && currentOrder.status !== 'Pending') return;
        
        if (item.customizationTemplate && item.customizationTemplate.length > 0) {
            setItemToCustomize(item);
        } else {
            const newItem: OrderItem = {
                orderItemId: Date.now(),
                menuItem: item, selectedCustomizations: [],
                finalPrice: item.price, quantity: 1,
                sentToKitchen: false,
            };
            handleSaveItemToOrder(newItem);
        }
    };
    
    const handleEditOrderItem = (item: OrderItem) => { setItemToEdit(item); };
    const handleModalClose = () => { setItemToCustomize(null); setItemToEdit(null); };

    const handleSaveItemToOrder = (itemFromModal: OrderItem) => {
        if (!activeTableId) return;

        let table = tables.find(t => t.id === activeTableId)!;
        let orderForTable = orders.find(o => o.id === table.orderId);

        if (!orderForTable) { // Create a new order
            const newOrderId = `ORD-${Date.now()}`;
            const totals = calculateOrderTotals([itemFromModal], defaultTax);
            const newOrder: Order = {
                id: newOrderId,
                createdDate: new Date().toISOString().split('T')[0],
                items: [itemFromModal],
                status: 'Draft',
                tableId: activeTableId,
                posCenterId: table.posCenterId,
                ...totals
            };
            stateSetters.setOrders([...orders, newOrder]);
            stateSetters.setTables(tables.map(t => t.id === activeTableId ? {...t, orderId: newOrderId} : t));
        } else { // Update existing order
             if (orderForTable.status === 'Billed' || orderForTable.status === 'Completed') {
                alert("Cannot modify an order that has been billed or completed.");
                return;
            }
            let newItems: OrderItem[];
            if (itemToEdit) { // Editing existing item in order
                 newItems = orderForTable.items.map(item =>
                    item.orderItemId === itemToEdit.orderItemId
                        ? { ...item, selectedCustomizations: itemFromModal.selectedCustomizations, finalPrice: itemFromModal.finalPrice }
                        : item
                );
            } else { // Adding new item to order
                const existingItem = orderForTable.items.find(item =>
                    item.menuItem.id === itemFromModal.menuItem.id &&
                    !item.sentToKitchen &&
                    areCustomizationsEqual(item.selectedCustomizations, itemFromModal.selectedCustomizations)
                );
                if (existingItem) {
                    newItems = orderForTable.items.map(item =>
                        item.orderItemId === existingItem.orderItemId ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    newItems = [...orderForTable.items, itemFromModal];
                }
            }
            updateOrder(orderForTable.id, newItems);
        }
        handleModalClose();
    };

    const handleQuantityChange = (orderItemId: number, delta: number) => {
        if (!activeOrder) return;
        const newItems = activeOrder.items
            .map(item => item.orderItemId === orderItemId ? { ...item, quantity: item.quantity + delta } : item)
            .filter(item => item.quantity > 0);
        updateOrder(activeOrder.id, newItems);
    };

    const handleRemoveFromOrder = (orderItemId: number) => {
        if (!activeOrder) return;
        const newItems = activeOrder.items.filter(item => item.orderItemId !== orderItemId);
        updateOrder(activeOrder.id, newItems);
    };
    
    const handleClearOrder = () => {
        if (!activeOrder) return;
        updateOrder(activeOrder.id, []);
    };
    
    const handleSendToKitchen = (order: Order) => {
        const itemsToSend = order.items.filter(item => !item.sentToKitchen);
        if (itemsToSend.length === 0) return;

        const table = tables.find(t => t.id === order.tableId)!;
        const posCenter = posCenters.find(pc => pc.id === table.posCenterId)!;

        const newKot: KOT = {
            id: `KOT-${Date.now()}`,
            orderId: order.id,
            tableId: table.id,
            tableName: table.name,
            posCenterName: posCenter.name,
            createdAt: Date.now(),
            status: 'New',
            items: itemsToSend.map(item => ({
                orderItemId: item.orderItemId,
                name: item.menuItem.name,
                quantity: item.quantity,
                customizations: item.selectedCustomizations,
            }))
        };
        stateSetters.setKots([...kots, newKot]);
        
        stateSetters.setOrders(orders.map(o => o.id === order.id ? {
            ...o,
            status: 'Pending',
            items: o.items.map(item => !item.sentToKitchen ? {...item, sentToKitchen: true} : item)
        } : o));
    };

    const handleUpdateKotStatus = (kotId: string, status: KOT['status']) => {
        stateSetters.setKots(kots.map(k => k.id === kotId ? {...k, status} : k));
    };
    
    const handleGenerateBill = (orderToProcess: Order) => {
        stateSetters.setOrders(orders.map(o => o.id === orderToProcess.id ? { ...o, status: 'Billed', billedDate: new Date().toISOString().split('T')[0] } : o));
        setOrderToBill(null);
    };

    const handleProcessPayment = (orderToProcess: Order, paymentMethod: Order['paymentMethod']) => {
        // Decrement stock
        const newMenuItems = [...menuItems];
        orderToProcess.items.forEach(orderItem => {
            const itemIndex = newMenuItems.findIndex(mi => mi.id === orderItem.menuItem.id);
            if (itemIndex > -1) newMenuItems[itemIndex].stock -= orderItem.quantity;
        });
        stateSetters.setMenuItems(newMenuItems);

        // Update order status & untie from table
        stateSetters.setOrders(orders.map(o => o.id === orderToProcess.id ? {
            ...o, 
            status: 'Completed',
            paymentMethod: paymentMethod,
            completedDate: new Date().toISOString().split('T')[0]
        } : o));
        
        stateSetters.setTables(tables.map(t => t.id === orderToProcess.tableId ? {...t, orderId: null} : t));

        if (activeTableId === orderToProcess.tableId) {
            setView('tables');
            setActiveTableId(null);
        }
    };

    const handleSaveCurrency = (newCurrency: Currency) => {
        stateSetters.setAppSettings({ ...appSettings, currency: newCurrency });
        // If it's a new custom currency, add it to the list for future selection
        if (!currencies.some(c => c.code === newCurrency.code)) {
            stateSetters.setCurrencies([...currencies, newCurrency]);
        }
    };
    
    if (!isDataLoaded) {
        return <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh'}}>Loading application data...</div>;
    }

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return hasPermission('view_dashboard') ? <DashboardView orders={orders} menuItems={menuItems} currency={appSettings.currency} /> : <AccessDenied />;
            case 'tables':
                return hasPermission('view_tables') ? <TablesView tables={tables} orders={orders} posCenters={posCenters} kots={kots} onTableClick={handleTableClick} onUpdateTables={stateSetters.setTables} currentUser={currentUser!} roles={roles} /> : <AccessDenied />;
            case 'pos':
                return hasPermission('access_pos') ? <POSView
                    menuItems={menuItems}
                    categories={categories}
                    activeTable={activeTable || null}
                    activeOrder={activeOrder || null}
                    posCenters={posCenters}
                    onAddItemToOrder={handleAddItemToOrder}
                    onRemoveFromOrder={handleRemoveFromOrder}
                    onClearOrder={handleClearOrder}
                    onQuantityChange={handleQuantityChange}
                    onEditOrderItem={handleEditOrderItem}
                    onSendToKitchen={handleSendToKitchen}
                    onGenerateBill={(order) => setOrderToBill(order)}
                    onTakePayment={(order) => setOrderToPay(order)}
                    onBackToTables={() => { setView('tables'); setActiveTableId(null); }}
                    currentUser={currentUser!}
                    roles={roles}
                    currency={appSettings.currency}
                /> : <AccessDenied />;
             case 'kitchen':
                return hasPermission('view_kitchen_display') ? <KitchenView kots={kots} onUpdateKotStatus={handleUpdateKotStatus} /> : <AccessDenied />;
             case 'billing':
                return hasPermission('view_billing') ? <BillingView orders={orders} tables={tables} currency={appSettings.currency} onTakePayment={(order) => setOrderToPay(order)} /> : <AccessDenied />;
            case 'orders':
                return hasPermission('view_orders') ? <OrderHistoryView orders={orders} currency={appSettings.currency} /> : <AccessDenied />;
            case 'inventory':
                 return hasPermission('view_inventory') ? <InventoryView 
                    menuItems={menuItems} 
                    categories={categories}
                    purchases={purchaseOrders}
                    suppliers={suppliers}
                    onReceivePO={(poId) => stateSetters.setPurchaseOrders(purchaseOrders.map(p => p.id === poId ? {...p, status: 'Received'} : p))}
                    currentUser={currentUser!}
                    roles={roles}
                    currency={appSettings.currency}
                /> : <AccessDenied />;
            case 'reports':
                return hasPermission('view_sales_reports') ? <ReportsView 
                    orders={orders} 
                    currency={appSettings.currency} 
                    menuItems={menuItems}
                    categories={categories}
                    purchaseOrders={purchaseOrders}
                    suppliers={suppliers}
                /> : <AccessDenied />;
            case 'staff':
                return hasPermission('manage_staff') ? <StaffManagementView staff={staff} roles={roles} /> : <AccessDenied />;
            case 'settings':
                return hasPermission('manage_settings') ? <SettingsView 
                    currency={appSettings.currency}
                    posCenters={posCenters}
                    tables={tables}
                    printers={printers}
                    propertyDetails={propertyDetails}
                    taxes={taxes}
                    onEditCurrency={() => setCurrencyModalOpen(true)}
                    setPosCenters={stateSetters.setPosCenters}
                    setPrinters={stateSetters.setPrinters}
                    setPropertyDetails={stateSetters.setPropertyDetails}
                    setTaxes={stateSetters.setTaxes}
                    currentUser={currentUser!}
                    roles={roles}
                /> : <AccessDenied />;
            default:
                return hasPermission('view_dashboard') ? <DashboardView orders={orders} menuItems={menuItems} currency={appSettings.currency} /> : <AccessDenied />;
        }
    };
    
    if (!currentUser) {
        return <PinLoginModal onLogin={handleLogin} error={loginError} />;
    }

    return (
        <>
            <Sidebar currentView={view} setView={setView} currentUser={currentUser} roles={roles} onLogout={handleLogout} isOnline={isOnline} syncStatus={{time: appSettings.lastSync, onSync: handleSync}}/>
            <main className="main-content">
                {renderView()}
            </main>
            {(itemToCustomize || itemToEdit) && (
                <CustomizationModal
                    item={itemToCustomize || itemToEdit!.menuItem}
                    orderItemToEdit={itemToEdit}
                    onClose={handleModalClose}
                    onSave={handleSaveItemToOrder}
                    currency={appSettings.currency}
                />
            )}
            {isCurrencyModalOpen && (
                <CurrencyModal 
                    currentCurrency={appSettings.currency}
                    availableCurrencies={currencies}
                    onSave={handleSaveCurrency}
                    onClose={() => setCurrencyModalOpen(false)}
                />
            )}
            {orderToBill && (
                <BillPreviewModal
                    order={orderToBill}
                    currency={appSettings.currency}
                    onClose={() => setOrderToBill(null)}
                    onConfirm={handleGenerateBill}
                />
            )}
            {orderToPay && (
                <PaymentModal
                    order={orderToPay}
                    currency={appSettings.currency}
                    onClose={() => setOrderToPay(null)}
                    onConfirm={handleProcessPayment}
                />
            )}
        </>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
