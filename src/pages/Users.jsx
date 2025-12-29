import React, { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import { ROLES } from '../utils/constants';

const Users = () => {
    const { users, addUser, deleteUser, loading } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        pin: '',
        role: ROLES.WORKER // Default to worker
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await addUser(formData);
            setIsModalOpen(false);
            setFormData({ name: '', username: '', pin: '', role: ROLES.WORKER });
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="p-6">Loading users...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    User Management
                </h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <UserPlus size={20} />
                    Add User
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">PIN</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${user.role === ROLES.OWNER
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role === ROLES.OWNER ? <Shield size={12} /> : <User size={12} />}
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500">****</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {user.username !== 'owner' && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this user?')) deleteUser(user);
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4 digits)</label>
                                    <input
                                        type="number"
                                        required
                                        maxLength={4}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
                                        value={formData.pin}
                                        onChange={e => setFormData({ ...formData, pin: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`
                                        flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.role === ROLES.WORKER ? 'border-black bg-black text-white' : 'border-gray-200 hover:bg-gray-50'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="role"
                                            className="hidden"
                                            checked={formData.role === ROLES.WORKER}
                                            onChange={() => setFormData({ ...formData, role: ROLES.WORKER })}
                                        />
                                        <User size={18} />
                                        <span>Worker</span>
                                    </label>
                                    <label className={`
                                        flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                                        ${formData.role === ROLES.OWNER ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200 hover:bg-gray-50'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="role"
                                            className="hidden"
                                            checked={formData.role === ROLES.OWNER}
                                            onChange={() => setFormData({ ...formData, role: ROLES.OWNER })}
                                        />
                                        <Shield size={18} />
                                        <span>Owner</span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {formData.role === ROLES.WORKER
                                        ? "Workers can only bill and view inventory."
                                        : "Owners have full access including settings and reports."}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
