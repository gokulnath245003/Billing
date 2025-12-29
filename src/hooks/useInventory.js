import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';

export const useInventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const result = await db.inventory.allDocs({
                include_docs: true,
                descending: true
            });
            setItems(result.rows.map(row => row.doc));
            setError(null);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();

        // Subscribe to changes
        const changes = db.inventory.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on('change', (change) => {
            setItems(prev => {
                if (change.deleted) {
                    return prev.filter(i => i._id !== change.id);
                }
                // Update or add
                const index = prev.findIndex(i => i._id === change.id);
                if (index > -1) {
                    const newItems = [...prev];
                    newItems[index] = change.doc;
                    return newItems;
                } else {
                    return [change.doc, ...prev]; // Add to top
                }
            });
        }).on('error', (err) => {
            console.error('Inventory Sync Error', err);
        });

        return () => changes.cancel();
    }, [fetchItems]);

    const addItem = async (itemData) => {
        try {
            // Auto-generate ID if not provided (timestamp based)
            const newItem = {
                _id: itemData._id || `item_${Date.now()}`,
                ...itemData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: true
            };
            await db.inventory.put(newItem);

            // Log action
            // (Assuming we pass userId for audit, or handle globally. For now simple put)
            return newItem;
        } catch (err) {
            console.error('Error adding item', err);
            throw err;
        }
    };

    const updateItem = async (item) => {
        try {
            const updatedItem = {
                ...item,
                updatedAt: new Date().toISOString()
            };
            await db.inventory.put(updatedItem);
            return updatedItem;
        } catch (err) {
            console.error('Error updating item', err);
            throw err;
        }
    };

    const deleteItem = async (item) => {
        try {
            // Soft delete? PouchDB remove does hard delete but keeps tombstone.
            // Often better to set active: false for business logic preservation.
            // But user requested "delete" (Owner). Let's do PouchDB remove.
            await db.inventory.remove(item);
        } catch (err) {
            console.error('Error deleting item', err);
            throw err;
        }
    };

    return { items, loading, error, addItem, updateItem, deleteItem };
};
