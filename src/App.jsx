import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import { ROLES } from './utils/constants';

// Pages
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import SalesHistory from './pages/SalesHistory';
import CloseShift from './pages/CloseShift';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            {/* Shared Routes */}
                            <Route path="/" element={<Billing />} />
                            <Route path="/sales" element={<SalesHistory />} />
                            <Route path="/close-shift" element={<CloseShift />} />

                            {/* Owner/Worker Shared (with internal checks if needed, but nav hides it for now) */}
                            <Route path="/inventory" element={<Inventory />} />

                            {/* Owner Only Routes */}
                            <Route element={<ProtectedRoute allowedRoles={[ROLES.OWNER]} />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
