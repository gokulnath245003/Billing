import { useState, useCallback, useEffect } from 'react';
import { db } from '../services/db';

export const useInvoice = () => {
    const [customer, setCustomer] = useState({ name: '', phone: '' });
    const [items, setItems] = useState([]);
    const [billNo, setBillNo] = useState('');

    // Generate a temporary bill number on mount or new
    useEffect(() => {
        setBillNo(`BILL-${Date.now().toString().slice(-6)}`);
    }, []);

    const addItem = (product) => {
        setItems(prev => {
            // Check if exists
            const existing = prev.find(i => i.product_id === product._id);
            if (existing) {
                return prev.map(i => i.product_id === product._id ? {
                    ...i,
                    qty: i.qty + 1,
                    total: (i.qty + 1) * i.price
                } : i);
            }
            return [...prev, {
                id: `line_${Date.now()}`, // for DND
                product_id: product._id,
                name: product.name,
                price: parseFloat(product.price),
                qty: 1,
                total: parseFloat(product.price)
            }];
        });
    };

    const updateLineItem = (id, changes) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, ...changes };
                // Recalc total
                updated.total = updated.qty * updated.price;
                return updated;
            }
            return item;
        }));
    };

    const removeLineItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const reorderItems = (startIndex, endIndex) => {
        const result = Array.from(items);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setItems(result);
    };

    const totals = items.reduce((acc, item) => ({
        qty: acc.qty + item.qty,
        amount: acc.amount + item.total
    }), { qty: 0, amount: 0 });

    const saveInvoice = async (paymentMethod) => {
        if (items.length === 0) throw new Error("No items in cart");

        const invoice = {
            _id: `inv_${Date.now()}`,
            billNo,
            customer,
            items,
            grandTotal: totals.amount,
            paymentMethod,
            createdAt: new Date().toISOString(),
            status: 'paid', // or 'printed'
            syncStatus: 'pending' // for sync logic
        };

        // 1. Save Invoice
        await db.invoices.put(invoice);

        // 2. Update Inventory Stock
        // Note: In a real app this should be transactional or handled via conflict resolution
        // For prototype, we iterate.
        for (const item of items) {
            try {
                const product = await db.inventory.get(item.product_id);
                product.stock -= item.qty;
                await db.inventory.put(product);
            } catch (err) {
                console.error(`Failed to update stock for ${item.name}`, err);
                // Continue anyway? Or fail? Best effort here.
            }
        }

        return invoice;
    };

    const clearCart = () => {
        setItems([]);
        setCustomer({ name: '', phone: '' });
        setBillNo(`BILL-${Date.now().toString().slice(-6)}`);
    };

    return {
        customer, setCustomer,
        items, addItem, updateLineItem, removeLineItem, reorderItems,
        totals,
        billNo,
        saveInvoice,
        clearCart
    };
};
