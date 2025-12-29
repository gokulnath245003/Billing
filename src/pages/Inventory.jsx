import React, { useState, useMemo } from 'react';
import { useInventory } from '../hooks/useInventory';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const Inventory = () => {
    const { items, loading, addItem, updateItem, deleteItem } = useInventory();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Filtered items
    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lower = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(lower) ||
            item.code?.toLowerCase().includes(lower)
        );
    }, [items, searchTerm]);

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
            await deleteItem(item);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Item
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                    type="text"
                    placeholder="Search by name or code..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading inventory...</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name/Code</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr key={item._id} className={item.stock < 5 ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                            ₹{item.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {item.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            {user?.role === ROLES.OWNER && (
                                                <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No items found. Add some items to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal would go here, separating to another file for cleanliness */}
            {isModalOpen && (
                <ItemModal
                    item={editingItem}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data) => {
                        if (editingItem) {
                            await updateItem({ ...editingItem, ...data });
                        } else {
                            await addItem(data);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// Simple inline modal for now, or move to component
const ItemModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        code: item?.code || '',
        price: item?.price || '',
        stock: item?.stock || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium mb-4">{item ? 'Edit Item' : 'Add New Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Code/Barcode</label>
                        <input
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock</label>
                            <input
                                required
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inventory;
