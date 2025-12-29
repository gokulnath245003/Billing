import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalBills: 0,
        lowStockCount: 0,
        topItems: []
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // 1. Fetch Invoices
            const invoices = await db.invoices.allDocs({ include_docs: true });
            const validInvoices = invoices.rows
                .map(r => r.doc)
                .filter(d => d.status !== 'voided');

            const totalSales = validInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
            const totalBills = validInvoices.length;

            // 2. Fetch Inventory
            const inventory = await db.inventory.allDocs({ include_docs: true });
            const items = inventory.rows.map(r => r.doc);
            const lowStockCount = items.filter(i => (i.stock || 0) < 5).length;

            setStats({
                totalSales,
                totalBills,
                lowStockCount,
                topItems: [] // Todo: aggregation logic
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Sales"
                    value={`₹${stats.totalSales.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Invoices"
                    value={stats.totalBills}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="bg-red-500"
                />
                <StatCard
                    title="Active Workers"
                    value="1"
                    icon={Users}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-gray-800 mb-4">Recent Sales</h3>
                    <div className="text-gray-500 text-sm">
                        Chart visualization would go here.
                        <div className="mt-4 h-40 bg-gray-50 rounded flex items-center justify-center">
                            Placeholder Chart
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
