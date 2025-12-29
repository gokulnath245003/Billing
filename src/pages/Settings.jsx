import React, { useState } from 'react';
import { exportData, importData } from '../services/backup';
import { Download, Upload, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

const Settings = () => {
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            await exportData();
            setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Export failed: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!window.confirm('WARNING: Restoring data will overwrite/merge with your current data. Are you sure?')) {
            event.target.value = ''; // Reset input
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                setLoading(true);
                const content = e.target.result;
                await importData(content);
                setMessage({ type: 'success', text: 'Data restored successfully! Please refresh the page.' });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                setMessage({ type: 'error', text: 'Restore failed: ' + error.message });
            } finally {
                setLoading(false);
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

            {/* Message Alert */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Data Management Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="text-blue-600" size={24} />
                        Data Management
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your local data. Since this is an offline app, your data lives in this browser.
                        Backup regularly to avoid data loss.
                    </p>
                </div>

                <div className="p-6 grid md:grid-cols-2 gap-6">
                    {/* Backup */}
                    <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Download size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Backup Data</h3>
                                <p className="text-xs text-gray-500">Download a copy of all your data.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Download Backup'}
                        </button>
                    </div>

                    {/* Restore */}
                    <div className="space-y-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Upload size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Restore Data</h3>
                                <p className="text-xs text-gray-500">Import data from a backup file.</p>
                            </div>
                        </div>
                        <label className="block w-full cursor-pointer">
                            <span className="flex justify-center items-center w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium shadow-sm hover:shadow-md">
                                {loading ? 'Processing...' : 'Select File to Restore'}
                            </span>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                disabled={loading}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>

            {/* Info Section about JWT/Security */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Security Note</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>This application runs 100% in your browser (Offline-First).</li>
                    <li>There is no central server storing your passwords or data.</li>
                    <li>Your "Login" effectively unlocks the local database.</li>
                    <li><strong>JWTs (JSON Web Tokens)</strong> inherently require a backend server to sign and verify tokens. Since we don't have a backend (to keep this free and offline), we use a secure local session method instead.</li>
                    <li>To protect your data, prevent unauthorized physical access to this device.</li>
                </ul>
            </div>
        </div>
    );
};

export default Settings;
