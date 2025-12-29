import { useState, useEffect } from 'react';
import { db } from '../services/db';

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch users
    const fetchUsers = async () => {
        try {
            const result = await db.users.allDocs({ include_docs: true });
            const userList = result.rows.map(row => row.doc);
            setUsers(userList);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    // Add user
    const addUser = async (userData) => {
        try {
            if (!userData.username || !userData.pin || !userData.role || !userData.name) {
                throw new Error('All fields are required');
            }

            // Check if username exists
            const existing = await db.users.find({
                selector: { username: userData.username }
            });
            if (existing.docs.length > 0) {
                throw new Error('Username already exists');
            }

            const newUser = {
                _id: `user_${Date.now()}`,
                ...userData,
                createdAt: new Date().toISOString()
            };

            await db.users.put(newUser);
            await fetchUsers(); // Refresh list
            return newUser;
        } catch (err) {
            console.error('Error adding user:', err);
            throw err;
        }
    };

    // Delete user
    const deleteUser = async (user) => {
        try {
            if (user.username === 'owner') {
                throw new Error('Cannot delete the default owner');
            }
            await db.users.remove(user);
            await fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            throw err;
        }
    };

    // Subscribe to changes
    useEffect(() => {
        fetchUsers();
        const changes = db.users.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on('change', fetchUsers);

        return () => changes.cancel();
    }, []);

    return {
        users,
        loading,
        error,
        addUser,
        deleteUser
    };
};
