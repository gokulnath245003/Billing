import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import { DB_NAMES } from '../utils/constants';

PouchDB.plugin(PouchFind);

// Initialize DBs
const inventoryDB = new PouchDB(DB_NAMES.INVENTORY);
const invoicesDB = new PouchDB(DB_NAMES.INVOICES);
const usersDB = new PouchDB(DB_NAMES.USERS);
const auditDB = new PouchDB(DB_NAMES.AUDIT);

// Temporary: seed an owner if not exists
const seedOwner = async () => {
    try {
        const ownerId = 'user_owner';
        try {
            await usersDB.get(ownerId);
        } catch (err) {
            if (err.name === 'not_found') {
                await usersDB.put({
                    _id: ownerId,
                    username: 'owner',
                    pin: '1234', // Simple PIN for demo
                    role: 'owner',
                    name: 'Store Owner'
                });
                console.log('Seeded owner user');
            }
        }
    } catch (e) {
        console.error('Error seeding owner', e);
    }
};

seedOwner();

export const db = {
    inventory: inventoryDB,
    invoices: invoicesDB,
    users: usersDB,
    audit: auditDB,
};

// Generic Sync Function
export const syncDB = (localDB, remoteURL) => {
    if (!remoteURL) return null;
    return localDB.sync(remoteURL, {
        live: true,
        retry: true
    }).on('change', (info) => {
        console.log('Sync change', info);
    }).on('error', (err) => {
        console.log('Sync error', err);
    });
};
