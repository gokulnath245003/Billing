import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Search, Calculator, Printer, CreditCard } from 'lucide-react';
import { useInvoice } from '../../hooks/useInvoice';
import { useInventory } from '../../hooks/useInventory';
import { printerService } from '../../services/printer';
import LineItem from './LineItem';

const InvoiceForm = () => {
    const {
        customer, setCustomer,
        items, addItem, updateLineItem, removeLineItem, reorderItems,
        totals, billNo, saveInvoice, clearCart
    } = useInvoice();

    const { items: inventoryItems } = useInventory();
    const [searchTerm, setSearchTerm] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter inventory for autocomplete
    const searchResults = searchTerm && inventoryItems.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.code?.includes(searchTerm)
    ).slice(0, 5); // Limit 5

    const handleAddItem = (product) => {
        addItem(product);
        setSearchTerm(''); // Clear search
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        reorderItems(result.source.index, result.destination.index);
    };

    const handleCheckout = async (method) => {
        setIsProcessing(true);
        try {
            const invoice = await saveInvoice(method);
            await printerService.print(invoice);
            alert(`Invoice ${invoice.billNo} Saved & Printed!`);
            clearCart();
            setShowPaymentModal(false);
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4">
            {/* LEFT COLUMN: Cart */}
            <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden h-full">
                {/* Header */}
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <div className="text-xl font-bold text-gray-800">{billNo}</div>
                        <div className="text-xs text-gray-500">{new Date().toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700">
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b">
                    <input
                        placeholder="Customer Name"
                        className="p-2 border rounded-md text-sm"
                        value={customer.name}
                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                    />
                    <input
                        placeholder="Phone"
                        className="p-2 border rounded-md text-sm"
                        value={customer.phone}
                        onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    />
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b relative z-20">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            autoFocus
                            className="w-full pl-9 p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Scan barcode or search item..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Autocomplete Dropdown */}
                    {searchResults && searchResults.length > 0 && (
                        <div className="absolute left-4 right-4 mt-1 bg-white border rounded-md shadow-lg z-30">
                            {searchResults.map(prod => (
                                <div
                                    key={prod._id}
                                    onClick={() => handleAddItem(prod)}
                                    className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between border-b last:border-0"
                                >
                                    <span className="font-medium">{prod.name}</span>
                                    <div className="text-sm">
                                        <span className="text-gray-500 mr-2">Stock: {prod.stock}</span>
                                        <span className="font-bold text-blue-600">₹{prod.price}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Line Items (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="cart">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="min-h-[100px]"
                                >
                                    {items.length === 0 && (
                                        <div className="text-center text-gray-400 mt-10">
                                            Cart is empty. Search items to add.
                                        </div>
                                    )}
                                    {items.map((item, index) => (
                                        <LineItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            onUpdate={updateLineItem}
                                            onRemove={removeLineItem}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Totals Footer */}
                <div className="p-4 bg-white border-t space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items: {totals.qty}</span>
                        <span className="font-medium">Subtotal: ₹{totals.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                        <div className="text-2xl font-bold">₹{totals.amount.toFixed(2)}</div>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            disabled={items.length === 0}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CreditCard className="h-5 w-5" />
                            Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN (Desktop only? Or helper?) 
          For mobile optimization, maybe hide this or put quick buttons.
          Let's verify responsive. On mobile, this will stack.
          We can add Quick Add buttons for top items if needed.
      */}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-blue-600" />
                            Select Payment
                        </h3>

                        <div className="text-center mb-6">
                            <div className="text-gray-500">Amount to Pay</div>
                            <div className="text-4xl font-bold text-gray-800">₹{totals.amount.toFixed(2)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {['Cash', 'UPI', 'Card', 'Credit'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => handleCheckout(method)}
                                    disabled={isProcessing}
                                    className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 font-medium transition text-center"
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full p-3 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceForm;
