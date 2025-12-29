import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CloseShift = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        calculateShiftTotals();
    }, []);

    const calculateShiftTotals = async () => {
        // In a real app, filtering by "Shift Start Time" would be needed.
        // Here we just summarize "Today's" sales for this user.
        try {
            const allInvoices = await db.invoices.allDocs({ include_docs: true });
            const today = new Date().toLocaleDateString();

            const userInvoices = allInvoices.rows
                .map(r => r.doc)
                .filter(d =>
                    new Date(d.createdAt).toLocaleDateString() === today &&
                    d.status !== 'voided'
                    // && d.userId === user.id // If we tracked userId on invoices
                );

            const totalAmount = userInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
            const cash = userInvoices.filter(i => i.paymentMethod === 'Cash').reduce((s, i) => s + i.grandTotal, 0);
            const online = totalAmount - cash;

            setSummary({
                totalAmount,
                count: userInvoices.length,
                cash,
                online
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleConfirmClose = async () => {
        if (window.confirm("Confirm closing shift? This will log you out.")) {
            // Log shift close event
            await db.audit.post({
                action: 'SHIFT_CLOSE',
                userId: user.id,
                summary,
                timestamp: new Date().toISOString()
            });
            await logout();
            navigate('/login');
        }
    };

    if (!summary) return <div className="p-8 text-center">Loading summary...</div>;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Close Shift</h2>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-bold text-blue-700">₹{summary.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                    <span className="text-gray-500">Invoices Generated</span>
                    <span className="font-medium">{summary.count}</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                    <span className="text-gray-500">Cash Collected</span>
                    <span className="font-medium text-green-600">₹{summary.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 border-b">
                    <span className="text-gray-500">Online/Other</span>
                    <span className="font-medium text-purple-600">₹{summary.online.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={handleConfirmClose}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold shadow hover:bg-red-700 transition"
            >
                Close Shift & Logout
            </button>
        </div>
    );
};

export default CloseShift;
