import React, { useState, useCallback, useMemo, FC, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import {
    Permission, Currency, Tax, Role, Staff, POSCenter, Printer, PropertyDetails, Category, Supplier,
    PurchaseOrder, CustomizationOption, CustomizationTemplate, MenuItem,
    SelectedCustomization, OrderItem, Order, KOT, Table
} from './data';
import { formatCurrency, usePermissions } from './data';


// --- REACT COMPONENTS ---

// Access Denied Component
export const AccessDenied: FC = () => (
    <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
    </div>
);


// Sidebar Component
export const Sidebar: FC<{ 
    currentView: string; 
    setView: (view: string) => void; 
    currentUser: Staff; 
    roles: Role[]; 
    onLogout: () => void;
    isOnline: boolean;
    syncStatus: { time: number; onSync: () => void; };
}> = ({ currentView, setView, currentUser, roles, onLogout, isOnline, syncStatus }) => {
    const { hasPermission } = usePermissions(currentUser, roles);
    const currentUserRole = roles.find(r => r.id === currentUser.roleId)?.name || 'N/A';
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', permission: 'view_dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg> },
        { id: 'tables', label: 'Tables', permission: 'view_tables', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h.008M9.75 5.25h.008v.008H9.75V5.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V9.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
        { id: 'pos', label: 'POS', permission: 'access_pos', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg> },
        { id: 'kitchen', label: 'Kitchen', permission: 'view_kitchen_display', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177.177a2.25 2.25 0 0 0-.976 2.126c.512 1.441.512 2.943 0 4.384L12 21M12.75 3.031v9.864M12.75 3.031h.008v.008h-.008v-.008Zm0 0c.002.002.002.002 0 0Z" /></svg> },
        { id: 'billing', label: 'Billing', permission: 'view_billing', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-3-3.75l-3 1.5m3-1.5l3 1.5m-3-1.5V15m3 2.25v-2.25m5.25-10.5a7.5 7.5 0 0 0-15 0v4.5A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25v-4.5a7.5 7.5 0 0 0-15 0Z" /></svg> },
        { id: 'orders', label: 'Order History', permission: 'view_orders', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 6.45 3.75H18a2.25 2.25 0 0 1 2.25 2.25v.381c0 .635-.25.1227-.56.1707L9.92 18.45A2.25 2.25 0 0 1 7.955 21H4.5a2.25 2.25 0 0 1-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 0 1 1.123-.08" /></svg> },
        { id: 'inventory', label: 'Inventory', permission: 'view_inventory', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18a2.25 2.25 0 0 1-2.25-2.25V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18V4.867c0-.621-.504-1.125-1.125-1.125H6.75c-.621 0-1.125.504-1.125 1.125v13.266c0 .621.504 1.125 1.125 1.125h9Z" /></svg> },
        { id: 'reports', label: 'Reports', permission: 'view_sales_reports', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
        { id: 'staff', label: 'Staff', permission: 'manage_staff', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.253M15 19.128v-3.86a2.25 2.25 0 0 1 3-1.656l2.254 1.127a2.25 2.25 0 0 1 1.245 2.118v.75M15 19.128a9.38 9.38 0 0 0-2.625.372 9.337 9.337 0 0 0-4.121-2.253m-2.253.938A9.37 9.37 0 0 1 6 19.499m1.5-4.5a.75.75 0 0 0-1.493.166l.002.167.002.166a.75.75 0 0 0 1.493-.166l-.002-.167-.002-.166Zm-1.014-4.874a2.25 2.25 0 0 0-3.443-2.162l-2.254 1.127a2.25 2.25 0 0 0-1.245 2.118v.75M5.25 6.375a2.25 2.25 0 0 1 3-1.656l2.254 1.127a2.25 2.25 0 0 1 1.245 2.118v.75m-8.25 0a2.25 2.25 0 0 1 3-1.656l2.254 1.127a2.25 2.25 0 0 1 1.245 2.118v.75M9 11.25a.75.75 0 0 0-1.493.166l.002.167.002.166a.75.75 0 0 0 1.493-.166l-.002-.167-.002-.166Z" /></svg> },
        { id: 'settings', label: 'Settings', permission: 'manage_settings', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.905c.008.379.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-1.905c-.007-.379-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg> },
    ].filter(item => hasPermission(item.permission as Permission));
    
    return (
        <aside className="sidebar">
            <div>
                <div className="sidebar-header">POS System</div>
                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a href="#" className={currentView === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="sidebar-footer">
                <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>{isOnline ? 'Online' : 'Offline'}</div>
                 <div className="sync-status">
                    Last sync: {new Date(syncStatus.time).toLocaleTimeString()}
                    {isOnline && <button onClick={syncStatus.onSync}>Sync Data</button>}
                </div>
                <div className="user-profile">
                    <div>
                        <div className="user-profile-name">{currentUser.name}</div>
                        <div className="user-profile-role">{currentUserRole}</div>
                    </div>
                </div>
                <button className="btn btn-secondary btn-full" onClick={onLogout}>Logout</button>
            </div>
        </aside>
    );
};

// Menu Item Card Component (for POS)
const MenuItemCard: FC<{ item: MenuItem; categoryName: string; onAdd: (item: MenuItem) => void; currency: Currency; }> = ({ item, categoryName, onAdd, currency }) => {
    const isOutOfStock = item.stock <= 0;
    const isLowStock = item.stock > 0 && item.stock <= item.lowStockThreshold;
    
    return (
        <div className={`menu-item-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {isOutOfStock && <span className="stock-badge out-of-stock">Out of Stock</span>}
            {isLowStock && <span className="stock-badge low-stock">Low Stock ({item.stock})</span>}
            <img src={item.imageUrl} alt={item.name} className="menu-item-image" />
            <div className="menu-item-content">
                <div className="menu-item-header">
                    <h3>{item.name}</h3>
                    <span className="menu-item-price">{formatCurrency(item.price, currency)}</span>
                </div>
                <span className="menu-item-category">{categoryName}</span>
                <p className="menu-item-stock">Stock: {item.stock} {item.unitOfMeasurement}</p>
            </div>
            <div className="menu-item-actions">
                <button className="btn btn-primary btn-full" onClick={() => onAdd(item)} disabled={isOutOfStock}>Add to Order</button>
            </div>
        </div>
    );
};


// Customization Modal
export const CustomizationModal: FC<{ item: MenuItem; orderItemToEdit?: OrderItem | null; onClose: () => void; onSave: (orderItem: OrderItem) => void; currency: Currency; }> = ({ item, orderItemToEdit, onClose, onSave: onAddToOrder, currency }) => {
    const menuItem = orderItemToEdit?.menuItem || item;

    const [selectedOptions, setSelectedOptions] = useState(() => {
        const initialSelections: Record<string, any> = {};
        const sourceCustomizations = orderItemToEdit?.selectedCustomizations;

        if (sourceCustomizations) {
            menuItem.customizationTemplate?.forEach(template => {
                if (template.type === 'size') {
                    const selected = sourceCustomizations.find(c => c.label === template.label);
                    const option = template.options?.find(o => o.name === selected?.value) || template.options?.[0];
                    if (option) initialSelections[template.label] = option;
                } else if (template.type === 'toppings') {
                    const selectedValues = sourceCustomizations.filter(c => c.label === template.label).map(c => c.value);
                    initialSelections[template.label] = template.options?.filter(o => selectedValues.includes(o.name)) || [];
                }
            });
        } else {
             menuItem.customizationTemplate?.forEach(template => {
                if (template.type === 'size' && template.options) {
                    const defaultOption = template.options.find(o => o.price === 0) || template.options[0];
                    if (defaultOption) initialSelections[template.label] = defaultOption;
                }
            });
        }
        return initialSelections;
    });
    
    const [notes, setNotes] = useState(() => orderItemToEdit?.selectedCustomizations.find(c => c.label === 'Notes')?.value || '');
    const notesTemplate = menuItem.customizationTemplate?.find(t => t.type === 'notes');

    const calculatedPrice = useMemo(() => {
        let total = menuItem.price;
        for (const key in selectedOptions) {
            const template = menuItem.customizationTemplate?.find(t => t.label === key);
            if (template?.type === 'size') {
                total += selectedOptions[key]?.price || 0;
            } else if (template?.type === 'toppings') {
                (selectedOptions[key] as CustomizationOption[])?.forEach(opt => total += opt.price);
            }
        }
        return total;
    }, [selectedOptions, menuItem.price, menuItem.customizationTemplate]);

    const handleOptionChange = (template: CustomizationTemplate, option: CustomizationOption, checked: boolean) => {
        const currentSelection = selectedOptions[template.label] || [];
        let newSelection;
        if (checked) {
            if (template.maxSelections && currentSelection.length >= template.maxSelections) return;
            newSelection = [...currentSelection, option];
        } else {
            newSelection = currentSelection.filter((o: CustomizationOption) => o.name !== option.name);
        }
        setSelectedOptions(prev => ({ ...prev, [template.label]: newSelection }));
    };
    
    const handleSizeChange = (option: CustomizationOption) => {
         const template = menuItem.customizationTemplate!.find(t=>t.type==='size')!;
         setSelectedOptions(prev => ({ ...prev, [template.label]: option }));
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const selectedCustomizations: SelectedCustomization[] = [];
        for (const key in selectedOptions) {
            const template = menuItem.customizationTemplate?.find(t => t.label === key);
            if (template?.type === 'size' && selectedOptions[key]) {
                selectedCustomizations.push({ label: key, value: selectedOptions[key].name, price: selectedOptions[key].price });
            } else if (template?.type === 'toppings') {
                (selectedOptions[key] as CustomizationOption[])?.forEach(opt => {
                    selectedCustomizations.push({ label: key, value: opt.name, price: opt.price });
                });
            }
        }
        if (notes) {
            selectedCustomizations.push({ label: 'Notes', value: notes, price: 0 });
        }

        const newOrderItem: OrderItem = {
            orderItemId: orderItemToEdit?.orderItemId || Date.now(),
            menuItem: menuItem,
            selectedCustomizations,
            finalPrice: calculatedPrice,
            quantity: orderItemToEdit?.quantity || 1,
            sentToKitchen: orderItemToEdit?.sentToKitchen || false,
        };
        onAddToOrder(newOrderItem);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Customize {menuItem.name}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form id="customization-form" onSubmit={handleSubmit}>
                    {menuItem.customizationTemplate?.map((template, index) => {
                         if (template.type === 'notes') return null;
                         return (
                            <fieldset key={index} className="customization-group">
                                <legend>{template.label}</legend>
                                {template.type === 'size' && template.options && (
                                    <div className="customization-options-grid">
                                        {template.options.map(opt => (
                                            <div key={opt.name} className="customization-option">
                                                <input type="radio" id={opt.name} name={template.label} value={opt.name} onChange={() => handleSizeChange(opt)} checked={selectedOptions[template.label]?.name === opt.name} />
                                                <label htmlFor={opt.name}>
                                                    <span>{opt.name}</span>
                                                    <span className="customization-price">{opt.price > 0 ? `+${formatCurrency(opt.price, currency)}` : 'Free'}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {template.type === 'toppings' && template.options && (
                                    <div className="customization-options-grid">
                                        {template.options.map(opt => (
                                            <div key={opt.name} className="customization-option">
                                                <input type="checkbox" id={opt.name} name={opt.name} onChange={(e) => handleOptionChange(template, opt, e.target.checked)} checked={!!selectedOptions[template.label]?.find((o: CustomizationOption) => o.name === opt.name)} />
                                                <label htmlFor={opt.name}>
                                                    <span>{opt.name}</span>
                                                    <span className="customization-price">{`+${formatCurrency(opt.price, currency)}`}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </fieldset>
                         );
                    })}
                    
                    <fieldset className="customization-group">
                        <legend>{notesTemplate?.label || 'Special Instructions'}</legend>
                        <div className="form-group" style={{marginBottom: 0}}>
                            <textarea id="notes" rows={3} placeholder="Add a note..." value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                    </fieldset>
                    
                    <div className="modal-actions">
                        <span className="modal-footer-summary">Total: {formatCurrency(calculatedPrice, currency)}</span>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">{orderItemToEdit ? 'Update Item' : 'Add to Order'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Current Order Sidebar
const CurrentOrderSidebar: FC<{ 
    order: Order | null; 
    onRemove: (orderItemId: number) => void; 
    onClear: () => void; 
    onQuantityChange: (orderItemId: number, delta: number) => void; 
    onEditItem: (orderItem: OrderItem) => void;
    onSendToKitchen: (order: Order) => void;
    onGenerateBill: (order: Order) => void;
    onTakePayment: (order: Order) => void;
    headerText: string; 
    permissions: { canSendToKitchen: boolean; canGenerateBill: boolean; canProcessPayment: boolean; };
    currency: Currency;
}> = ({ order, onRemove, onClear, onQuantityChange, onEditItem, onSendToKitchen, onGenerateBill, onTakePayment, headerText, permissions, currency }) => {
    
    const isDraft = order?.status === 'Draft';
    const isPending = order?.status === 'Pending';
    const isBilled = order?.status === 'Billed';
    
    const unsentItemsCount = useMemo(() => order?.items.filter(item => !item.sentToKitchen).length || 0, [order?.items]);
    const canSendToKitchen = (isDraft || isPending) && unsentItemsCount > 0;

    return (
        <aside className="current-order-sidebar">
            <h2>{headerText}</h2>
            <div className="order-items-list">
                {!order || order.items.length === 0 ? (
                    <p className="empty-order-message">No items in order.</p>
                ) : (
                    <ul>
                        {order.items.map(item => {
                            const regularCustomizations = item.selectedCustomizations.filter(c => c.label !== 'Notes');
                            const note = item.selectedCustomizations.find(c => c.label === 'Notes');
                            const canEditItem = !item.sentToKitchen;

                            return (
                                <li key={item.orderItemId} className={`order-item ${item.sentToKitchen ? 'sent-to-kitchen' : ''}`}>
                                    <div className="order-item-details">
                                        <div className="order-item-name-header">
                                            <span className="order-item-name">{item.menuItem.name}</span>
                                            {canEditItem && (
                                                <button className="edit-item-btn" onClick={() => onEditItem(item)} aria-label={`Edit ${item.menuItem.name}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: 16, height: 16}}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        {regularCustomizations.length > 0 && (
                                            <ul className="order-item-customizations">
                                                {regularCustomizations.map((cust, i) => (
                                                    <li key={i}>{cust.value}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {note && (
                                            <p className="order-item-note"><strong>Note:</strong> {note.value}</p>
                                        )}
                                    </div>
                                    <div className="order-item-controls">
                                        {canEditItem ? (
                                             <div className="quantity-control">
                                                <button className="quantity-btn" onClick={() => onQuantityChange(item.orderItemId, -1)} aria-label="Decrease quantity">-</button>
                                                <span>{item.quantity}</span>
                                                <button className="quantity-btn" onClick={() => onQuantityChange(item.orderItemId, 1)} aria-label="Increase quantity">+</button>
                                            </div>
                                        ) : (
                                            <div className="quantity-control" style={{padding: '2px 8px'}}><span>Qty: {item.quantity}</span></div>
                                        )}
                                       
                                        <span className="order-item-total-price">{formatCurrency(item.finalPrice * item.quantity, currency)}</span>
                                         {canEditItem && (
                                            <button onClick={() => onRemove(item.orderItemId)} className="remove-item-btn" aria-label={`Remove ${item.menuItem.name}`}>&times;</button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            {order && order.items.length > 0 && (
                <>
                    <div className="order-summary">
                        <div className="summary-line">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal, currency)}</span>
                        </div>
                        <div className="summary-line">
                            <span>{order.taxDetails?.name || 'Tax'} ({order.taxDetails?.rate || 0}%)</span>
                            <span>{formatCurrency(order.taxDetails?.amount || 0, currency)}</span>
                        </div>
                        <div className="summary-total">
                            <span>Total</span>
                            <span>{formatCurrency(order.total, currency)}</span>
                        </div>
                    </div>
                    <div className="order-actions">
                         {isDraft && <button className="btn btn-secondary" onClick={onClear}>Clear Order</button>}
                         {canSendToKitchen && <button className="btn btn-primary" onClick={() => onSendToKitchen(order!)} disabled={!permissions.canSendToKitchen}>Send to Kitchen ({unsentItemsCount})</button>}
                         {(isPending && unsentItemsCount === 0) && <button className="btn btn-primary" onClick={() => onGenerateBill(order!)} disabled={!permissions.canGenerateBill}>Generate Bill</button>}
                         {isBilled && <button className="btn btn-success" onClick={() => onTakePayment(order!)} disabled={!permissions.canProcessPayment}>Take Payment</button>}
                    </div>
                </>
            )}
        </aside>
    );
};

// Order History View
export const OrderHistoryView: FC<{ orders: Order[]; currency: Currency; }> = ({ orders, currency }) => {
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const toggleOrderDetails = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };
    
    const completedOrders = useMemo(() => orders.filter(o => o.status === 'Completed').sort((a, b) => (b.completedDate || '').localeCompare(a.completedDate || '')), [orders]);

    return (
        <div>
            <div className="content-header">
                <h1>Order History</h1>
            </div>
            <div className="order-list">
                {completedOrders.map(order => (
                    <div key={order.id} className={`order-card ${expandedOrderId === order.id ? 'expanded' : ''}`} onClick={() => toggleOrderDetails(order.id)}>
                        <div className="order-detail">
                            <span className="order-detail-label">Order ID</span>
                            <span className="order-detail-value">{order.id}</span>
                        </div>
                        <div className="order-detail">
                            <span className="order-detail-label">Date</span>
                            <span className="order-detail-value">{order.completedDate}</span>
                        </div>
                        <div className="order-detail">
                            <span className="order-detail-label">Total</span>
                            <span className="order-detail-value">{formatCurrency(order.total, currency)}</span>
                        </div>
                        <div className="order-card-status">
                            <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                        </div>
                         {expandedOrderId === order.id && (
                            <div className="order-details-expanded">
                                <h4>Order Items</h4>
                                <ul>
                                    {order.items.map(item => (
                                        <li key={item.orderItemId}>
                                            <div className="expanded-item-header">
                                                <span>{item.menuItem.name} (x{item.quantity})</span>
                                                <span>{formatCurrency(item.finalPrice * item.quantity, currency)}</span>
                                            </div>
                                            {item.selectedCustomizations.length > 0 && (
                                                <ul className="expanded-item-customizations">
                                                    {item.selectedCustomizations.map((cust, i) => (
                                                        <li key={i}>{cust.label}: {cust.value}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- INVENTORY MANAGEMENT COMPONENTS ---
const ItemManagementView: FC<{ items: MenuItem[]; categories: Category[]; hasManagePermission: boolean; currency: Currency; }> = ({ items, categories, hasManagePermission, currency }) => {
    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>UOM</th>
                        {hasManagePermission && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{getCategoryName(item.categoryId)}</td>
                            <td>{formatCurrency(item.price, currency)}</td>
                            <td>{item.stock}</td>
                            <td>{item.unitOfMeasurement}</td>
                            {hasManagePermission && (
                                <td className="table-actions">
                                    <button className="btn btn-secondary btn-sm">Edit</button>
                                    <button className="btn btn-danger btn-sm">Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PurchaseOrderManagementView: FC<{ purchases: PurchaseOrder[], suppliers: Supplier[], onReceive: (poId: string) => void, hasReceivePermission: boolean; currency: Currency; }> = ({ purchases, suppliers, onReceive, hasReceivePermission, currency }) => {
    const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>PO ID</th>
                        <th>Supplier</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        {hasReceivePermission && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {purchases.map(po => (
                        <tr key={po.id}>
                            <td>{po.id}</td>
                            <td>{getSupplierName(po.supplierId)}</td>
                            <td>{po.date}</td>
                            <td>{formatCurrency(po.totalCost, currency)}</td>
                            <td><span className={`status-badge status-${po.status.toLowerCase()}`}>{po.status}</span></td>
                            {hasReceivePermission && (
                                <td className="table-actions">
                                    {po.status === 'Pending' && (
                                        <button className="btn btn-primary btn-sm" onClick={() => onReceive(po.id)}>Receive Stock</button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export const InventoryView: FC<{ 
    menuItems: MenuItem[], 
    categories: Category[], 
    purchases: PurchaseOrder[], 
    suppliers: Supplier[],
    onReceivePO: (poId: string) => void;
    currentUser: Staff;
    roles: Role[];
    currency: Currency;
}> = ({ menuItems, categories, purchases, suppliers, onReceivePO, currentUser, roles, currency }) => {
    const [activeTab, setActiveTab] = useState('items');
    const { hasPermission } = usePermissions(currentUser, roles);
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'items':
                return <ItemManagementView items={menuItems} categories={categories} hasManagePermission={hasPermission('manage_items')} currency={currency} />;
            case 'purchases':
                 return <PurchaseOrderManagementView purchases={purchases} suppliers={suppliers} onReceive={onReceivePO} hasReceivePermission={hasPermission('receive_purchases')} currency={currency} />;
            case 'categories':
                return <p>Category Management Coming Soon</p>;
            case 'suppliers':
                return <p>Supplier Management Coming Soon</p>;
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="content-header">
                <h1>Inventory Management</h1>
                 {hasPermission('manage_items') && <button className="btn btn-primary">Add New Item</button>}
            </div>
            <div className="tabs">
                <span className={`tab-item ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Items</span>
                <span className={`tab-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>Purchases</span>
                <span className={`tab-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</span>
                 <span className={`tab-item ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>Suppliers</span>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

// --- STAFF MANAGEMENT COMPONENTS ---
export const StaffManagementView: FC<{staff: Staff[], roles: Role[]}> = ({ staff, roles }) => {
    const [activeTab, setActiveTab] = useState('staff');
    const getRoleName = (roleId: number) => roles.find(r => r.id === roleId)?.name || 'N/A';
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'staff':
                return (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr><th>Name</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {staff.map(member => (
                                    <tr key={member.id}>
                                        <td>{member.name}</td>
                                        <td>{getRoleName(member.roleId)}</td>
                                        <td>{member.status}</td>
                                        <td className="table-actions">
                                            <button className="btn btn-secondary btn-sm">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'roles':
                 return (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr><th>Role Name</th><th>Permissions</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td>{role.name}</td>
                                        <td>{role.permissions.length} assigned</td>
                                        <td className="table-actions">
                                            <button className="btn btn-secondary btn-sm">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 );
            default:
                return null;
        }
    };
    
    return (
        <div>
            <div className="content-header">
                <h1>Staff Management</h1>
                 <button className="btn btn-primary">Add New Staff</button>
            </div>
            <div className="tabs">
                <span className={`tab-item ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>Staff Members</span>
                <span className={`tab-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles & Permissions</span>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

// Dashboard View
export const DashboardView: FC<{ orders: Order[]; menuItems: MenuItem[]; currency: Currency; }> = ({ orders, menuItems, currency }) => {
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = completedOrders.length;
    const lowStockItems = menuItems.filter(item => item.stock > 0 && item.stock <= item.lowStockThreshold).length;

    return (
        <div>
            <div className="content-header">
                <h1>Dashboard</h1>
            </div>
            <div className="dashboard-grid">
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Total Revenue</span>
                    <span className="stat-card-value">{formatCurrency(totalRevenue, currency)}</span>
                </div>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Total Orders</span>
                    <span className="stat-card-value">{totalOrders}</span>
                </div>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Pending Orders</span>
                    <span className="stat-card-value">{orders.filter(o => o.status === 'Pending').length}</span>
                </div>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Low Stock Items</span>
                    <span className="stat-card-value">{lowStockItems}</span>
                </div>
            </div>
        </div>
    );
};

// --- REPORTS COMPONENTS ---
const SalesReportView: FC<{ orders: Order[]; currency: Currency; }> = ({ orders, currency }) => {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    
    const completedOrders = useMemo(() => orders.filter(o => o.status === 'Completed'), [orders]);

    const reportData = useMemo(() => {
        const now = new Date();
        let filteredOrders: Order[] = [];

        if (period === 'daily') {
            const todayString = now.toISOString().split('T')[0];
            filteredOrders = completedOrders.filter(o => o.completedDate === todayString);
        } else if (period === 'weekly') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay()); // Assuming Sunday is the start of the week
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            filteredOrders = completedOrders.filter(o => {
                if (!o.completedDate) return false;
                const orderDate = new Date(o.completedDate);
                return orderDate >= startOfWeek && orderDate <= endOfWeek;
            });
        } else if (period === 'monthly') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            filteredOrders = completedOrders.filter(o => {
                if (!o.completedDate) return false;
                const orderDate = new Date(o.completedDate);
                return orderDate >= startOfMonth && orderDate <= endOfMonth;
            });
        }

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filteredOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            orders: filteredOrders.sort((a,b) => (b.completedDate || '').localeCompare(a.completedDate || '')),
            totalRevenue,
            totalOrders,
            averageOrderValue
        };
    }, [completedOrders, period]);

    return (
        <>
            <div className="report-period-filter" style={{justifyContent: 'center', marginBottom: '2rem'}}>
                <button className={period === 'daily' ? 'active' : ''} onClick={() => setPeriod('daily')}>Daily</button>
                <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>Weekly</button>
                <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
            </div>
            <div className="dashboard-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '2rem'}}>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Total Revenue</span>
                    <span className="stat-card-value">{formatCurrency(reportData.totalRevenue, currency)}</span>
                </div>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Total Orders</span>
                    <span className="stat-card-value">{reportData.totalOrders}</span>
                </div>
                <div className="dashboard-card stat-card">
                    <span className="stat-card-label">Average Order Value</span>
                    <span className="stat-card-value">{formatCurrency(reportData.averageOrderValue, currency)}</span>
                </div>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.orders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{order.completedDate}</td>
                                <td>{formatCurrency(order.total, currency)}</td>
                                <td>{order.paymentMethod}</td>
                            </tr>
                        ))}
                         {reportData.orders.length === 0 && (
                            <tr><td colSpan={4} style={{textAlign: 'center'}}>No sales data for this period.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const StockReportView: FC<{ items: MenuItem[]; categories: Category[]; }> = ({ items, categories }) => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
    const getStockStatus = (item: MenuItem) => {
        if (item.stock <= 0) return 'Out of Stock';
        if (item.stock <= item.lowStockThreshold) return 'Low Stock';
        return 'In Stock';
    };

    const filteredItems = useMemo(() => {
        return items
            .filter(item => statusFilter === 'all' || getStockStatus(item).replace(' ', '-').toLowerCase() === statusFilter)
            .filter(item => categoryFilter === 'all' || item.categoryId === parseInt(categoryFilter))
            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => a.name.localeCompare(b.name));
    }, [items, statusFilter, categoryFilter, searchTerm]);
    
    return (
        <>
            <div className="report-filters">
                <fieldset>
                    <legend>Filters</legend>
                    <div className="form-group">
                        <label htmlFor="search">Search Item</label>
                        <input type="text" id="search" placeholder="Enter item name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryFilter">Category</label>
                        <select id="categoryFilter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                     <div className="form-group">
                        <label htmlFor="statusFilter">Stock Status</label>
                        <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="in-stock">In Stock</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </fieldset>
            </div>
             <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Item Name</th><th>Category</th><th>Current Stock</th><th>UOM</th><th>Status</th></tr></thead>
                    <tbody>
                        {filteredItems.map(item => {
                            const status = getStockStatus(item);
                            const statusClass = `status-${status.replace(' ', '-').toLowerCase()}`;
                            return (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{getCategoryName(item.categoryId)}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.unitOfMeasurement}</td>
                                    <td><span className={`status-badge ${statusClass}`}>{status}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const PurchaseReportView: FC<{ purchases: PurchaseOrder[]; suppliers: Supplier[]; currency: Currency; }> = ({ purchases, suppliers, currency }) => {
     const getSupplierName = (id: number) => suppliers.find(s => s.id === id)?.name || 'N/A';
    return (
        <div className="table-container">
            <table className="data-table">
                <thead><tr><th>PO ID</th><th>Supplier</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                    {purchases.map(po => (
                        <tr key={po.id}>
                            <td>{po.id}</td>
                            <td>{getSupplierName(po.supplierId)}</td>
                            <td>{po.date}</td>
                            <td>{formatCurrency(po.totalCost, currency)}</td>
                            <td><span className={`status-badge status-${po.status.toLowerCase()}`}>{po.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SupplierReportView: FC<{ purchases: PurchaseOrder[]; suppliers: Supplier[]; currency: Currency; }> = ({ purchases, suppliers, currency }) => {
    const supplierData = useMemo(() => {
        return suppliers.map(supplier => {
            const supplierPurchases = purchases.filter(p => p.supplierId === supplier.id);
            const totalSpent = supplierPurchases.reduce((sum, p) => sum + p.totalCost, 0);
            return {
                ...supplier,
                totalPOs: supplierPurchases.length,
                totalSpent
            }
        }).sort((a,b) => b.totalSpent - a.totalSpent);
    }, [purchases, suppliers]);

    return (
        <div className="table-container">
            <table className="data-table">
                <thead><tr><th>Supplier Name</th><th>Total POs</th><th>Total Amount Spent</th></tr></thead>
                <tbody>
                    {supplierData.map(s => (
                        <tr key={s.id}>
                            <td>{s.name}</td>
                            <td>{s.totalPOs}</td>
                            <td>{formatCurrency(s.totalSpent, currency)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ForecastReportView: FC<{ orders: Order[]; currency: Currency; }> = ({ orders, currency }) => {
    type ForecastData = { date: string; predictedRevenue: number; };
    
    const [period, setPeriod] = useState(7);
    const [forecast, setForecast] = useState<ForecastData[] | null>(null);
    const [loading, setLoading] = useState(false);

    const generateForecast = async (days: number): Promise<ForecastData[]> => {
        setLoading(true);
        // Simulate API call to a backend powered by NVIDIA AI
        await new Promise(resolve => setTimeout(resolve, 1500));

        const historicalOrders = orders.filter(o => o.status === 'Completed' && o.completedDate);
        if (historicalOrders.length === 0) {
            setLoading(false);
            return [];
        }

        const dailyTotals: Record<string, number> = {};
        historicalOrders.forEach(o => {
            dailyTotals[o.completedDate!] = (dailyTotals[o.completedDate!] || 0) + o.total;
        });

        const revenueValues = Object.values(dailyTotals);
        const avgDailyRevenue = revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length;
        
        const results: ForecastData[] = [];
        const today = new Date();

        for (let i = 1; i <= days; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);

            const dayOfWeek = futureDate.getDay(); // 0=Sun, 6=Sat
            let seasonalityFactor = 1.0;
            if (dayOfWeek === 5 || dayOfWeek === 6) seasonalityFactor = 1.3; // Fri, Sat
            if (dayOfWeek === 1) seasonalityFactor = 0.8; // Mon

            const randomFactor = 0.8 + Math.random() * 0.4; // +/- 20% variance
            const predictedRevenue = avgDailyRevenue * seasonalityFactor * randomFactor;
            
            results.push({
                date: futureDate.toISOString().split('T')[0],
                predictedRevenue,
            });
        }
        
        setLoading(false);
        return results;
    };

    const handleGenerate = async () => {
        const data = await generateForecast(period);
        setForecast(data);
    };
    
    const forecastSummary = useMemo(() => {
        if (!forecast) return null;
        const total = forecast.reduce((sum, day) => sum + day.predictedRevenue, 0);
        const busiestDay = forecast.reduce((max, day) => day.predictedRevenue > max.predictedRevenue ? day : max, forecast[0]);
        return {
            total: total,
            average: total / forecast.length,
            busiestDay: busiestDay
        }
    }, [forecast]);

    return (
        <div className="forecast-container">
            <div className="forecast-controls">
                <div className="form-group" style={{marginBottom: 0}}>
                    <label htmlFor="period">Forecast Period</label>
                    <select id="period" value={period} onChange={e => setPeriod(parseInt(e.target.value))}>
                        <option value={7}>Next 7 Days</option>
                        <option value={30}>Next 30 Days</option>
                    </select>
                </div>
                <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>Generate Forecast</button>
            </div>
            
            {forecastSummary && !loading && (
                 <>
                    <div className="dashboard-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                        <div className="dashboard-card stat-card">
                            <span className="stat-card-label">Predicted Total Revenue</span>
                            <span className="stat-card-value">{formatCurrency(forecastSummary.total, currency)}</span>
                        </div>
                        <div className="dashboard-card stat-card">
                            <span className="stat-card-label">Predicted Avg. Daily Revenue</span>
                            <span className="stat-card-value">{formatCurrency(forecastSummary.average, currency)}</span>
                        </div>
                        <div className="dashboard-card stat-card">
                            <span className="stat-card-label">Predicted Busiest Day</span>
                            <span className="stat-card-value">{new Date(forecastSummary.busiestDay.date).toLocaleDateString(undefined, {weekday: 'long'})}</span>
                            <span style={{fontSize: '1rem', fontWeight: 500}}>{formatCurrency(forecastSummary.busiestDay.predictedRevenue, currency)}</span>
                        </div>
                    </div>
                </>
            )}

            <div className="forecast-chart-container">
                {loading && <div className="loading-overlay">Analyzing data with NVIDIA AI...</div>}
                {!loading && forecast && <ForecastLineChart data={forecast} currency={currency} />}
                {!loading && !forecast && <div className="loading-overlay">Generate a forecast to see predicted sales.</div>}
            </div>
             <div className="powered-by-nvidia">
                <svg viewBox="0 0 1011 1024" xmlns="http://www.w3.org/2000/svg"><path d="M436 913V111h140v802h99V111h140v802h196V111h-71V0H219v111H0v802h197V111h140v802h99z"/></svg>
                <span>AI Forecasting Powered by NVIDIA</span>
            </div>
        </div>
    );
};
const ForecastLineChart: FC<{ data: { date: string, predictedRevenue: number }[], currency: Currency }> = ({ data, currency }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (svgRef.current) {
            setWidth(svgRef.current.clientWidth);
            setHeight(svgRef.current.clientHeight);
        }
    }, []);

    if (width === 0 || height === 0 || data.length === 0) return <svg ref={svgRef} width="100%" height="100%"></svg>;
    
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxRevenue = Math.max(...data.map(d => d.predictedRevenue));
    
    const xScale = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
    const yScale = (value: number) => padding.top + chartHeight - (value / maxRevenue) * chartHeight;

    const pathData = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)} ${yScale(d.predictedRevenue)}`).join(' ');
    
    const yAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = (maxRevenue / 4) * i;
        return { value: value, y: yScale(value) };
    });
    
    const xAxisLabels = data.filter((_, i) => data.length <= 10 || i % Math.floor(data.length / 10) === 0);

    return (
        <svg ref={svgRef} width="100%" height="100%">
            {/* Y Axis Grid Lines */}
            {yAxisLabels.map(label => (
                <line key={label.value} x1={padding.left} y1={label.y} x2={width - padding.right} y2={label.y} stroke="#e0e0e0" strokeDasharray="3,3" />
            ))}
            {/* Y Axis Labels */}
            {yAxisLabels.map(label => (
                <text key={label.value} x={padding.left - 10} y={label.y + 4} textAnchor="end" fill="#666" fontSize="12">{formatCurrency(label.value, currency)}</text>
            ))}
            {/* X Axis Labels */}
            {xAxisLabels.map((d, i) => {
                 const originalIndex = data.findIndex(item => item.date === d.date);
                 return (
                    <text key={d.date} x={xScale(originalIndex)} y={height - padding.bottom + 20} textAnchor="middle" fill="#666" fontSize="12">
                        {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                    </text>
                 );
            })}
             {/* Line */}
            <path d={pathData} fill="none" stroke="var(--primary-color)" strokeWidth="2" />
             {/* Points */}
            {data.map((d, i) => (
                <circle key={d.date} cx={xScale(i)} cy={yScale(d.predictedRevenue)} r="4" fill="var(--primary-color)" />
            ))}
        </svg>
    );
};


export const ReportsView: FC<{ 
    orders: Order[]; 
    currency: Currency;
    menuItems: MenuItem[];
    categories: Category[];
    purchaseOrders: PurchaseOrder[];
    suppliers: Supplier[];
}> = (props) => {
    const [activeTab, setActiveTab] = useState('sales');
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales': return <SalesReportView orders={props.orders} currency={props.currency} />;
            case 'stock': return <StockReportView items={props.menuItems} categories={props.categories} />;
            case 'purchases': return <PurchaseReportView purchases={props.purchaseOrders} suppliers={props.suppliers} currency={props.currency}/>;
            case 'suppliers': return <SupplierReportView purchases={props.purchaseOrders} suppliers={props.suppliers} currency={props.currency}/>;
            case 'forecast': return <ForecastReportView orders={props.orders} currency={props.currency} />;
            default: return null;
        }
    };
    
    return (
        <div>
            <div className="content-header">
                <h1>Reports</h1>
            </div>
            <div className="tabs">
                <span className={`tab-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>Sales</span>
                <span className={`tab-item ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>Stock</span>
                <span className={`tab-item ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>Purchases</span>
                <span className={`tab-item ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>Suppliers</span>
                <span className={`tab-item ${activeTab === 'forecast' ? 'active' : ''}`} onClick={() => setActiveTab('forecast')}>Forecast</span>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};


// POS View Container
export const POSView: FC<{
    menuItems: MenuItem[];
    categories: Category[];
    activeTable: Table | null;
    activeOrder: Order | null;
    posCenters: POSCenter[];
    onAddItemToOrder: (item: MenuItem) => void;
    onRemoveFromOrder: (orderItemId: number) => void;
    onClearOrder: () => void;
    onQuantityChange: (orderItemId: number, delta: number) => void;
    onEditOrderItem: (orderItem: OrderItem) => void;
    onSendToKitchen: (order: Order) => void;
    onGenerateBill: (order: Order) => void;
    onTakePayment: (order: Order) => void;
    onBackToTables: () => void;
    currentUser: Staff;
    roles: Role[];
    currency: Currency;
}> = ({ menuItems, categories, activeTable, activeOrder, posCenters, onAddItemToOrder, onRemoveFromOrder, onClearOrder, onQuantityChange, onEditOrderItem, onSendToKitchen, onGenerateBill, onTakePayment, onBackToTables, currentUser, roles, currency }) => {
    
    const [category, setCategory] = useState(0); // 0 for 'All'
    const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
    const { hasPermission } = usePermissions(currentUser, roles);

    const posCenterName = posCenters.find(pc => pc.id === activeTable?.posCenterId)?.name;
    const orderHeaderText = activeTable
        ? `Order for ${activeTable.name}${posCenterName ? ` (${posCenterName})` : ''}`
        : 'Current Order';
        
    const filteredItems = useMemo(() => {
        const items = category === 0 ? menuItems : menuItems.filter(item => item.categoryId === category);
        return items.sort((a,b) => a.name.localeCompare(b.name));
    }, [menuItems, category]);

    return (
        <div className="pos-view">
            <section className="pos-menu-section">
                <div className="content-header">
                    <h1>Point of Sale</h1>
                    <button className="btn btn-secondary" onClick={onBackToTables}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: 20, height: 20}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                        Back to Tables
                    </button>
                </div>
                {/* Add category filters here */}
                <div className="menu-grid">
                    {filteredItems.map(item => (
                        <MenuItemCard 
                            key={item.id} 
                            item={item} 
                            onAdd={onAddItemToOrder}
                            categoryName={getCategoryName(item.categoryId)}
                            currency={currency}
                        />
                    ))}
                </div>
            </section>
            <CurrentOrderSidebar 
                order={activeOrder}
                headerText={orderHeaderText}
                onRemove={onRemoveFromOrder}
                onClear={onClearOrder}
                onQuantityChange={onQuantityChange}
                onEditItem={onEditOrderItem}
                onSendToKitchen={onSendToKitchen}
                onGenerateBill={onGenerateBill}
                onTakePayment={onTakePayment}
                permissions={{
                    canSendToKitchen: hasPermission('send_orders_to_kitchen'),
                    canGenerateBill: hasPermission('generate_bills'),
                    canProcessPayment: hasPermission('process_payments')
                }}
                currency={currency}
            />
        </div>
    );
};

// --- TABLE & FLOOR PLAN COMPONENTS ---
export const TableEditorModal: FC<{ table: Partial<Table> | null; posCenters: POSCenter[]; onSave: (table: Omit<Table, 'id' | 'x' | 'y' | 'orderId'> & { id?: string }) => void; onClose: () => void; }> = ({ table, posCenters, onSave, onClose }) => {
    const [name, setName] = useState(table?.name || '');
    const [capacity, setCapacity] = useState(table?.capacity || 2);
    const [shape, setShape] = useState<'square' | 'circle'>(table?.shape || 'square');
    const [posCenterId, setPosCenterId] = useState<number>(table?.posCenterId || posCenters[0]?.id || 0);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!posCenterId) {
            alert("Please select a POS Center.");
            return;
        }
        onSave({ id: table?.id, name, capacity, shape, posCenterId });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{table?.id ? 'Edit Table' : 'Add Table'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="tableName">Table Name</label>
                        <input id="tableName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="posCenter">POS Center</label>
                        <select id="posCenter" value={posCenterId} onChange={e => setPosCenterId(parseInt(e.target.value, 10))} required>
                            <option value="" disabled>Select a center</option>
                            {posCenters.filter(pc => pc.status === 'Enabled').map(pc => (
                                <option key={pc.id} value={pc.id}>{pc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="tableCapacity">Capacity</label>
                            <input id="tableCapacity" type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value, 10))} min="1" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tableShape">Shape</label>
                            <select id="tableShape" value={shape} onChange={e => setShape(e.target.value as any)}>
                                <option value="square">Square</option>
                                <option value="circle">Circle</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Table</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const TablesView: FC<{ tables: Table[]; orders: Order[], posCenters: POSCenter[]; kots: KOT[], onTableClick: (tableId: string) => void; onUpdateTables: (tables: Table[]) => void; currentUser: Staff, roles: Role[] }> = ({ tables, orders, posCenters, kots, onTableClick, onUpdateTables, currentUser, roles }) => {
    const [isEditMode, setEditMode] = useState(false);
    const [tableToEdit, setTableToEdit] = useState<Partial<Table> | null>(null);
    const [draggingTable, setDraggingTable] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { hasPermission } = usePermissions(currentUser, roles);

    const [activeCenterId, setActiveCenterId] = useState<number | null>(posCenters.find(pc => pc.status === 'Enabled')?.id || null);
    const filteredTables = useMemo(() => tables.filter(t => t.posCenterId === activeCenterId), [tables, activeCenterId]);

    const handleSaveTable = (tableData: Omit<Table, 'id' | 'x' | 'y' | 'orderId'> & { id?: string }) => {
        if (tableData.id) { // Edit existing
            onUpdateTables(tables.map(t => t.id === tableData.id ? { ...t, ...tableData } : t));
        } else { // Add new
            const newTable: Table = {
                id: `t${Date.now()}`,
                name: tableData.name,
                capacity: tableData.capacity,
                shape: tableData.shape,
                posCenterId: tableData.posCenterId,
                x: 20,
                y: 20,
                orderId: null,
            };
            onUpdateTables([...tables, newTable]);
        }
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
        if (!isEditMode) return;
        const tableElement = e.currentTarget;
        const rect = tableElement.getBoundingClientRect();
        setDraggingTable({
            id,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!draggingTable || !canvasRef.current) return;
        const canvasRect = canvasRef.current.getBoundingClientRect();
        let x = e.clientX - canvasRect.left - draggingTable.offsetX;
        let y = e.clientY - canvasRect.top - draggingTable.offsetY;

        x = Math.max(0, Math.min(x, canvasRect.width - 80)); // 80 is table width
        y = Math.max(0, Math.min(y, canvasRect.height - 80)); // 80 is table height

        onUpdateTables(tables.map(t => t.id === draggingTable.id ? { ...t, x, y } : t));
    };

    const handleMouseUp = () => {
        setDraggingTable(null);
    };
    
    const enabledPOSCenters = posCenters.filter(pc => pc.status === 'Enabled');

    const getTableStatus = (table: Table) => {
        if (!table.orderId) return 'available';
        const order = orders.find(o => o.id === table.orderId);
        if (kots.some(k => k.orderId === table.orderId && k.status === 'Ready')) return 'ready';
        if (order?.status === 'Billed') return 'billed';
        if (order?.status === 'Pending') return 'preparing';
        if (order?.status === 'Draft') return 'occupied';
        return 'available';
    }

    return (
        <div className="floor-plan-container">
            <div className="content-header">
                <h1>Table View</h1>
            </div>
            <div className="floor-plan-toolbar">
                {enabledPOSCenters.length > 0 && (
                     <div className="pos-center-filter">
                        {enabledPOSCenters.map(pc => (
                            <button key={pc.id} className={activeCenterId === pc.id ? 'active' : ''} onClick={() => setActiveCenterId(pc.id)}>
                                {pc.name}
                            </button>
                        ))}
                    </div>
                )}
               
                {hasPermission('edit_floor_plan') && (
                    <div className="floor-plan-controls">
                        <button className="btn btn-primary" onClick={() => setTableToEdit({ posCenterId: activeCenterId || undefined })} disabled={!isEditMode || !activeCenterId}>Add Table</button>
                        <div className="edit-mode-toggle">
                            <label htmlFor="editMode">Edit Floor Plan</label>
                            <input type="checkbox" id="editMode" checked={isEditMode} onChange={() => setEditMode(p => !p)} />
                        </div>
                    </div>
                )}
            </div>
            <div 
                className="floor-plan-canvas" 
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {filteredTables.map(table => (
                    <div
                        key={table.id}
                        className={`table-object ${table.shape} ${getTableStatus(table)} ${isEditMode && hasPermission('edit_floor_plan') ? 'edit-mode' : ''} ${draggingTable?.id === table.id ? 'dragging' : ''}`}
                        style={{ left: table.x, top: table.y }}
                        onClick={() => !isEditMode && onTableClick(table.id)}
                        onMouseDown={(e) => hasPermission('edit_floor_plan') && handleMouseDown(e, table.id)}
                    >
                        <span className="table-name">{table.name}</span>
                        <span className="table-capacity">{table.capacity} seats</span>
                    </div>
                ))}
            </div>
             {tableToEdit && (
                <TableEditorModal
                    table={tableToEdit}
                    posCenters={posCenters}
                    onSave={handleSaveTable}
                    onClose={() => setTableToEdit(null)}
                />
            )}
        </div>
    );
};

export const PinLoginModal: FC<{ onLogin: (pin: string) => void; error: string; }> = ({ onLogin, error }) => {
    const [pin, setPin] = useState('');

    const handleKeyPress = (key: string) => {
        if (pin.length < 4) setPin(p => p + key);
    };
    const handleBackspace = () => setPin(p => p.slice(0, -1));
    const handleClear = () => setPin('');
    
    useEffect(() => {
        if (pin.length === 4) {
            onLogin(pin);
        }
    }, [pin, onLogin]);
    
    return (
        <div className="modal-overlay pin-login-modal">
            <div className="modal-content">
                <h2>Enter PIN</h2>
                <div className="pin-display">{'\u2B24'.repeat(pin.length).padEnd(4, '\u25E6')}</div>
                <div className="pin-error">{error}</div>
                <div className="pin-keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => <button key={k} className="keypad-btn" onClick={() => handleKeyPress(k.toString())}>{k}</button>)}
                    <button className="keypad-btn action-btn" onClick={handleClear}>Clear</button>
                    <button className="keypad-btn" onClick={() => handleKeyPress('0')}>0</button>
                    <button className="keypad-btn action-btn" onClick={handleBackspace}>&larr;</button>
                </div>
            </div>
        </div>
    );
};

// --- SETTINGS COMPONENTS ---
export const CurrencyModal: FC<{
    currentCurrency: Currency;
    availableCurrencies: Currency[];
    onSave: (currency: Currency) => void;
    onClose: () => void;
}> = ({ currentCurrency, availableCurrencies, onSave, onClose }) => {
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(currentCurrency.code);
    const [isCustom, setIsCustom] = useState(!availableCurrencies.some(c => c.code === currentCurrency.code));
    const [customCurrency, setCustomCurrency] = useState<Currency>(currentCurrency);

    useEffect(() => {
        if (selectedCurrencyCode !== 'custom') {
            setIsCustom(false);
        } else {
            setIsCustom(true);
        }
    }, [selectedCurrencyCode]);

    const handleCustomChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomCurrency(prev => ({ ...prev, [name]: value } as Currency));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isCustom) {
            onSave(customCurrency);
        } else {
            const selected = availableCurrencies.find(c => c.code === selectedCurrencyCode)!;
            onSave(selected);
        }
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Currency Settings</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currencySelect">Select Currency</label>
                        <select id="currencySelect" value={isCustom ? 'custom' : selectedCurrencyCode} onChange={e => setSelectedCurrencyCode(e.target.value)}>
                            {availableCurrencies.map(c => (
                                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                            ))}
                            <option value="custom">Custom Currency</option>
                        </select>
                    </div>

                    {isCustom && (
                        <div className="custom-currency-form">
                             <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="customCode">Code (e.g., USD)</label>
                                    <input id="customCode" name="code" type="text" value={customCurrency.code} onChange={handleCustomChange} required maxLength={3} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="customSymbol">Symbol (e.g., $)</label>
                                    <input id="customSymbol" name="symbol" type="text" value={customCurrency.symbol} onChange={handleCustomChange} required maxLength={2}/>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="customName">Name (e.g., US Dollar)</label>
                                <input id="customName" name="name" type="text" value={customCurrency.name} onChange={handleCustomChange} required />
                            </div>
                            <div className="form-group">
                                <label>Symbol Placement</label>
                                <div className="radio-group">
                                    <label>
                                        <input type="radio" name="placement" value="before" checked={customCurrency.placement === 'before'} onChange={handleCustomChange} />
                                        Before amount (e.g., $10.00)
                                    </label>
                                    <label>
                                        <input type="radio" name="placement" value="after" checked={customCurrency.placement === 'after'} onChange={handleCustomChange} />
                                        After amount (e.g., 10.00 €)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const POSCenterManagementView: FC<{
    posCenters: POSCenter[];
    tables: Table[];
    setPosCenters: (data: POSCenter[]) => void;
}> = ({ posCenters, tables, setPosCenters }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState<POSCenter | null>(null);
    const [name, setName] = useState('');

    const openModal = (center: POSCenter | null) => {
        setEditingCenter(center);
        setName(center?.name || '');
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (editingCenter) {
            // Edit
            setPosCenters(posCenters.map(pc => pc.id === editingCenter.id ? { ...pc, name } : pc));
        } else {
            // Add
            const newCenter: POSCenter = {
                id: Date.now(),
                name,
                status: 'Enabled'
            };
            setPosCenters([...posCenters, newCenter]);
        }
        closeModal();
    };
    
    const handleToggleStatus = (id: number) => {
        setPosCenters(posCenters.map(pc => pc.id === id ? { ...pc, status: pc.status === 'Enabled' ? 'Disabled' : 'Enabled' } : pc));
    };
    
    const handleDelete = (id: number) => {
        if(confirm('Are you sure you want to delete this POS Center? This cannot be undone.')) {
            setPosCenters(posCenters.filter(pc => pc.id !== id));
        }
    };

    return (
        <div className="settings-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3>POS Centers</h3>
                <button className="btn btn-primary" onClick={() => openModal(null)}>Add Center</button>
            </div>
            <p>Manage the different points of sale, like a bar, terrace, or main dining room.</p>
            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {posCenters.map(center => {
                            const isDeletable = !tables.some(t => t.posCenterId === center.id);
                            return (
                                <tr key={center.id}>
                                    <td>{center.name}</td>
                                    <td>
                                        <span className={`status-badge status-${center.status.toLowerCase()}`}>{center.status}</span>
                                    </td>
                                    <td className="table-actions">
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={center.status === 'Enabled'} onChange={() => handleToggleStatus(center.id)} />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(center)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(center.id)} disabled={!isDeletable} title={!isDeletable ? 'Cannot delete: Tables are assigned to this center.' : ''}>Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingCenter ? 'Edit' : 'Add'} POS Center</h2>
                            <button onClick={closeModal} className="modal-close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label htmlFor="centerName">Center Name</label>
                                <input id="centerName" type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const PrinterManagementView: FC<{
    printers: Printer[];
    setPrinters: (data: Printer[]) => void;
}> = ({ printers, setPrinters }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
    const [formState, setFormState] = useState({ name: '', type: 'Receipt' as Printer['type'], ipAddress: '' });

    const openModal = (printer: Printer | null) => {
        setEditingPrinter(printer);
        setFormState({
            name: printer?.name || '',
            type: printer?.type || 'Receipt',
            ipAddress: printer?.ipAddress || ''
        });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (editingPrinter) {
            setPrinters(printers.map(p => p.id === editingPrinter.id ? { ...p, ...formState } : p));
        } else {
            const newPrinter: Printer = {
                id: Date.now(),
                ...formState,
                status: 'Disconnected' // New printers are disconnected by default
            };
            setPrinters([...printers, newPrinter]);
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if(confirm('Are you sure you want to delete this printer?')) {
            setPrinters(printers.filter(p => p.id !== id));
        }
    };

    const handleTestPrint = (printer: Printer) => {
        alert(`Sending test print to ${printer.name} at ${printer.ipAddress}...`);
    };
    
    const getStatusClass = (status: Printer['status']) => {
        return status === 'Connected' ? 'status-completed' : 'status-disabled';
    };

    return (
        <div className="settings-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3>Printer Configuration</h3>
                <button className="btn btn-primary" onClick={() => openModal(null)}>Add Printer</button>
            </div>
            <p>Manage printers for receipts and kitchen order tickets.</p>
            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Type</th><th>IP Address</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {printers.map(printer => (
                            <tr key={printer.id}>
                                <td>{printer.name}</td>
                                <td>{printer.type}</td>
                                <td>{printer.ipAddress}</td>
                                <td><span className={`status-badge ${getStatusClass(printer.status)}`}>{printer.status}</span></td>
                                <td className="table-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => handleTestPrint(printer)}>Test</button>
                                    <button className="btn btn-secondary btn-sm" onClick={() => openModal(printer)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(printer.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingPrinter ? 'Edit' : 'Add'} Printer</h2>
                            <button onClick={closeModal} className="modal-close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label htmlFor="name">Printer Name</label>
                                <input id="name" name="name" type="text" value={formState.name} onChange={handleFormChange} required />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="type">Printer Type</label>
                                    <select id="type" name="type" value={formState.type} onChange={handleFormChange}>
                                        <option value="Receipt">Receipt</option>
                                        <option value="KOT">KOT</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="ipAddress">IP Address</label>
                                    <input id="ipAddress" name="ipAddress" type="text" value={formState.ipAddress} onChange={handleFormChange} required pattern="\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}" title="Enter a valid IP address"/>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const PropertyDetailsView: FC<{
    details: PropertyDetails;
    setDetails: (data: PropertyDetails) => void;
}> = ({ details, setDetails }) => {
    const [formState, setFormState] = useState(details);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setDetails(formState);
        alert('Property details updated successfully!');
    };

    return (
        <div className="settings-card">
            <h3>Property Details</h3>
            <p>Update your business's general information.</p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Business Name</label>
                    <input id="name" name="name" type="text" value={formState.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input id="address" name="address" type="text" value={formState.address} onChange={handleChange} />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input id="phone" name="phone" type="tel" value={formState.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" name="email" type="email" value={formState.email} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" type="url" value={formState.website} onChange={handleChange} />
                </div>
                <div className="setting-actions">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    );
};

const TaxManagementView: FC<{
    taxes: Tax[];
    setTaxes: (data: Tax[]) => void;
}> = ({ taxes, setTaxes }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTax, setEditingTax] = useState<Tax | null>(null);
    const [formState, setFormState] = useState({ name: '', rate: 0 });

    const openModal = (tax: Tax | null) => {
        setEditingTax(tax);
        setFormState({ name: tax?.name || '', rate: tax?.rate || 0 });
        setModalOpen(true);
    };
    const closeModal = () => setModalOpen(false);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (editingTax) {
            setTaxes(taxes.map(t => t.id === editingTax.id ? { ...t, ...formState } : t));
        } else {
            const newTax: Tax = { id: Date.now(), ...formState, isDefault: false };
            setTaxes([...taxes, newTax]);
        }
        closeModal();
    };
    
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this tax?')) {
            setTaxes(taxes.filter(t => t.id !== id));
        }
    };
    
    const handleSetDefault = (id: number) => {
        setTaxes(taxes.map(t => ({ ...t, isDefault: t.id === id })));
    };

    return (
        <div className="settings-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3>Tax Management</h3>
                <button className="btn btn-primary" onClick={() => openModal(null)}>Add Tax</button>
            </div>
            <p>Manage tax rates. The default tax will be applied to all orders.</p>
            <div className="table-container">
                <table className="data-table">
                    <thead><tr><th>Name</th><th>Rate (%)</th><th style={{textAlign:'center'}}>Default</th><th>Actions</th></tr></thead>
                    <tbody>
                        {taxes.map(tax => (
                            <tr key={tax.id}>
                                <td>{tax.name}</td>
                                <td>{tax.rate.toFixed(2)}%</td>
                                <td className="center-align"><input type="radio" name="default-tax" checked={tax.isDefault} onChange={() => handleSetDefault(tax.id)} /></td>
                                <td className="table-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => openModal(tax)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tax.id)} disabled={tax.isDefault}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                 <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '450px'}}>
                        <div className="modal-header">
                            <h2>{editingTax ? 'Edit' : 'Add'} Tax</h2>
                            <button onClick={closeModal} className="modal-close-btn">&times;</button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label htmlFor="name">Tax Name</label>
                                <input id="name" type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="rate">Rate (%)</label>
                                <input id="rate" type="number" step="0.01" min="0" value={formState.rate} onChange={e => setFormState({...formState, rate: parseFloat(e.target.value)})} required />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export const SettingsView: FC<{
    currency: Currency;
    posCenters: POSCenter[];
    tables: Table[];
    printers: Printer[];
    propertyDetails: PropertyDetails;
    taxes: Tax[];
    onEditCurrency: () => void;
    setPosCenters: (data: POSCenter[]) => void;
    setPrinters: (data: Printer[]) => void;
    setPropertyDetails: (data: PropertyDetails) => void;
    setTaxes: (data: Tax[]) => void;
    currentUser: Staff;
    roles: Role[];
}> = (props) => {
    const [activeTab, setActiveTab] = useState('general');
    const { hasPermission } = usePermissions(props.currentUser, props.roles);

    return (
        <div>
            <div className="content-header">
                <h1>Settings</h1>
            </div>
            <div className="tabs">
                <span className={`tab-item ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</span>
                <span className={`tab-item ${activeTab === 'property' ? 'active' : ''}`} onClick={() => setActiveTab('property')}>Property</span>
                 {hasPermission('manage_pos_centers') && (
                    <span className={`tab-item ${activeTab === 'pos_centers' ? 'active' : ''}`} onClick={() => setActiveTab('pos_centers')}>POS Centers</span>
                )}
                <span className={`tab-item ${activeTab === 'printers' ? 'active' : ''}`} onClick={() => setActiveTab('printers')}>Printers</span>
                <span className={`tab-item ${activeTab === 'taxes' ? 'active' : ''}`} onClick={() => setActiveTab('taxes')}>Taxes</span>
            </div>
            <div className="tab-content">
                {activeTab === 'general' && (
                    <div className="settings-card">
                        <h3>Currency</h3>
                        <p>Manage the currency used throughout the application.</p>
                        <div className="setting-detail">
                            <span>Current Currency:</span>
                            <strong>{props.currency.name} ({props.currency.symbol})</strong>
                        </div>
                        <div className="setting-actions">
                            <button className="btn btn-primary" onClick={props.onEditCurrency}>Change Currency</button>
                        </div>
                    </div>
                )}
                {activeTab === 'property' && (
                    <PropertyDetailsView details={props.propertyDetails} setDetails={props.setPropertyDetails} />
                )}
                {activeTab === 'pos_centers' && hasPermission('manage_pos_centers') && (
                    <POSCenterManagementView posCenters={props.posCenters} tables={props.tables} setPosCenters={props.setPosCenters} />
                )}
                {activeTab === 'printers' && (
                    <PrinterManagementView printers={props.printers} setPrinters={props.setPrinters} />
                )}
                 {activeTab === 'taxes' && (
                    <TaxManagementView taxes={props.taxes} setTaxes={props.setTaxes} />
                )}
            </div>
        </div>
    );
};

// --- BILLING & INVOICE COMPONENTS ---
export const BillPreviewModal: FC<{
    order: Order;
    currency: Currency;
    onClose: () => void;
    onConfirm: (order: Order) => void;
}> = ({ order, currency, onClose, onConfirm }) => {

    return (
        <div className="modal-overlay">
            <div className="modal-content bill-modal-content">
                <div className="bill-header">
                    <h3>Customer Bill</h3>
                    <p>Thank you for dining with us!</p>
                </div>
                <div className="bill-body">
                    <div className="bill-info">
                        <span>Order ID: {order.id}</span>
                        <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <table className="bill-items-table">
                        <thead>
                            <tr>
                                <th className="item-name-cell">Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th className="item-total-cell">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.orderItemId}>
                                    <td className="item-name-cell">{item.menuItem.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.finalPrice, currency)}</td>
                                    <td className="item-total-cell">{formatCurrency(item.finalPrice * item.quantity, currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="bill-totals">
                        <div className="summary-line"><span>Subtotal</span><span>{formatCurrency(order.subtotal, currency)}</span></div>
                        {order.taxDetails && (
                             <div className="summary-line"><span>{order.taxDetails.name} ({order.taxDetails.rate}%)</span><span>{formatCurrency(order.taxDetails.amount, currency)}</span></div>
                        )}
                        <div className="summary-total"><span>Total</span><span>{formatCurrency(order.total, currency)}</span></div>
                    </div>
                </div>
                 <div className="modal-actions" style={{padding: '1.5rem', borderTop: '2px dashed var(--border-color)'}}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={() => onConfirm(order)}>Confirm & Bill</button>
                </div>
            </div>
        </div>
    );
};

export const PaymentModal: FC<{
    order: Order;
    currency: Currency;
    onClose: () => void;
    onConfirm: (order: Order, paymentMethod: Order['paymentMethod']) => void;
}> = ({ order, currency, onClose, onConfirm }) => {
    const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Card');
    const [isPaid, setIsPaid] = useState(false);

    const handleConfirm = () => {
        onConfirm(order, paymentMethod);
        setIsPaid(true);
    };

    if (isPaid) {
        return (
             <div className="modal-overlay">
                <div className="modal-content" style={{maxWidth: '420px', textAlign: 'center'}}>
                    <div className="invoice-success">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h3>Payment Successful</h3>
                        <p>Order {order.id} has been completed.</p>
                    </div>
                    <div className="modal-actions" style={{justifyContent: 'center'}}>
                        <button type="button" className="btn btn-primary" onClick={() => { /* logic to print invoice */ alert('Printing invoice...'); onClose(); }}>Print Invoice</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '420px'}}>
                <div className="modal-header">
                    <h2>Process Payment</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <div className="bill-totals" style={{borderTop: 'none', paddingTop: 0}}>
                    <p style={{marginBottom: '1rem'}}>Total amount to be paid for Order ID: {order.id}</p>
                    <div className="summary-total" style={{fontSize: '2rem'}}>
                        <span>TOTAL</span>
                        <span>{formatCurrency(order.total, currency)}</span>
                    </div>
                </div>
                <div className="payment-method-selection">
                    <label>Payment Method</label>
                    <div className="radio-group">
                         <label><input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} /> Card</label>
                         <label><input type="radio" name="payment" value="Cash" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} /> Cash</label>
                         <label><input type="radio" name="payment" value="Other" checked={paymentMethod === 'Other'} onChange={() => setPaymentMethod('Other')} /> Other</label>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn btn-success" onClick={handleConfirm}>Confirm Payment</button>
                </div>
            </div>
        </div>
    );
};

export const BillingView: FC<{
    orders: Order[];
    tables: Table[];
    currency: Currency;
    onTakePayment: (order: Order) => void;
}> = ({ orders, tables, currency, onTakePayment }) => {
    const billedOrders = useMemo(() => orders.filter(o => o.status === 'Billed').sort((a,b) => (b.billedDate || '').localeCompare(a.billedDate || '')), [orders]);
    const getTableName = (tableId: string | null) => tables.find(t => t.id === tableId)?.name || 'N/A';
    
    return (
        <div>
            <div className="content-header">
                <h1>Pending Bills</h1>
            </div>
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Table</th>
                            <th>Billed Date</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {billedOrders.map(order => (
                            <tr key={order.id}>
                                <td>{order.id}</td>
                                <td>{getTableName(order.tableId)}</td>
                                <td>{order.billedDate}</td>
                                <td>{formatCurrency(order.total, currency)}</td>
                                <td className="table-actions">
                                    <button className="btn btn-success btn-sm" onClick={() => onTakePayment(order)}>Take Payment</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {billedOrders.length === 0 && <p style={{textAlign: 'center', padding: '2rem'}}>No pending bills.</p>}
            </div>
        </div>
    );
};

// --- KITCHEN VIEW (KDS) ---
export const KitchenView: FC<{
    kots: KOT[];
    onUpdateKotStatus: (kotId: string, status: KOT['status']) => void;
}> = ({ kots, onUpdateKotStatus }) => {
    
    const filterKotsByStatus = (status: KOT['status']) => kots.filter(k => k.status === status).sort((a,b) => a.createdAt - b.createdAt);
    
    const TimeElapsed: FC<{ startTime: number }> = ({ startTime }) => {
        const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000));
        useEffect(() => {
            const interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(interval);
        }, [startTime]);
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        return <>{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</>;
    };
    
    return (
        <div className="kitchen-view">
             <div className="content-header">
                <h1>Kitchen Display</h1>
            </div>
            <div className="kitchen-display">
                {(['New', 'Preparing', 'Ready'] as KOT['status'][]).map(status => (
                    <div className="kot-column" key={status}>
                        <h2>{status} ({filterKotsByStatus(status).length})</h2>
                        <div className="kot-cards-container">
                            {filterKotsByStatus(status).map(kot => (
                                <div className="kot-card" key={kot.id}>
                                    <div className="kot-card-header">
                                        <span className="kot-card-table">{kot.tableName} ({kot.posCenterName})</span>
                                        <span className="kot-card-time"><TimeElapsed startTime={kot.createdAt} /></span>
                                    </div>
                                    <ul className="kot-card-items">
                                        {kot.items.map(item => (
                                            <li key={item.orderItemId} className="kot-card-item">
                                                <div className="kot-card-item-main">
                                                    <span className="kot-card-item-qty">{item.quantity}x</span>
                                                    <span className="kot-card-item-name">{item.name}</span>
                                                </div>
                                                {item.customizations.length > 0 && (
                                                    <ul className="kot-card-item-customizations">
                                                        {item.customizations.map((cust, i) => (
                                                            <li key={i}>{cust.value}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="kot-card-actions">
                                        {status === 'New' && <button className="btn btn-primary btn-full" onClick={() => onUpdateKotStatus(kot.id, 'Preparing')}>Start Preparing</button>}
                                        {status === 'Preparing' && <button className="btn btn-success btn-full" onClick={() => onUpdateKotStatus(kot.id, 'Ready')}>Mark as Ready</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
