import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { format } from 'date-fns'; // Would need to install, or use native
import { ROLES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { Eye, Printer, Ban } from 'lucide-react';
import { printerService } from '../services/printer';

const SalesHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const result = await db.invoices.allDocs({
                include_docs: true,
                descending: true // Newest first
            });
            setInvoices(result.rows.map(r => r.doc));
        } catch (err) {
            console.error(err);
        }
    };

    const handleVoid = async (invoice) => {
        if (!window.confirm('Are you sure you want to VOID this invoice? This cannot be undone.')) return;

        try {
            const updated = {
                ...invoice,
                status: 'voided',
                grandTotal: 0, // Accounting practice varies, usually keep total but mark void. Prompt said "sets amount to zero".
                voidedBy: user.id,
                voidedAt: new Date().toISOString()
            };
            await db.invoices.put(updated);
            loadInvoices();
        } catch (err) {
            alert('Error voiding invoice');
        }
    };

    const handleReprint = async (invoice) => {
        await printerService.print(invoice);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Sales History</h1>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((inv) => (
                                <tr key={inv._id} className={inv.status === 'voided' ? 'bg-gray-50 text-gray-400' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {inv.billNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {inv.customer?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                                        ₹{inv.status === 'voided' ? '0.00' : inv.grandTotal?.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 text-xs rounded-full ${inv.status === 'voided' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => handleReprint(inv)} className="text-blue-600 hover:text-blue-900 mx-2" title="Reprint">
                                            <Printer className="h-4 w-4" />
                                        </button>
                                        {user?.role === ROLES.OWNER && inv.status !== 'voided' && (
                                            <button onClick={() => handleVoid(inv)} className="text-red-600 hover:text-red-900 mx-2" title="Void">
                                                <Ban className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesHistory;
