import { db } from './db';
import { DB_NAMES } from '../utils/constants';

// Helper to get all docs from a specific DB
const getAllDocs = async (database) => {
    try {
        const result = await database.allDocs({ include_docs: true });
        return result.rows.map(row => row.doc).filter(doc => !doc._id.startsWith('_design/'));
    } catch (error) {
        console.error('Error fetching docs:', error);
        return [];
    }
};

// Export all data to JSON
export const exportData = async () => {
    try {
        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            inventory: await getAllDocs(db.inventory),
            invoices: await getAllDocs(db.invoices),
            users: await getAllDocs(db.users),
            audit: await getAllDocs(db.audit),
            settings: await getAllDocs(db.settings),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `billing_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    } catch (error) {
        console.error('Export failed:', error);
        throw new Error('Failed to export data');
    }
};

// Import data from JSON
export const importData = async (jsonContent) => {
    try {
        const data = JSON.parse(jsonContent);

        // Simple validation
        if (!data.version || !data.inventory || !data.invoices) {
            throw new Error('Invalid backup file format');
        }

        // Helper to clear and bulk insert
        const restoreDB = async (database, docs) => {
            if (!docs || docs.length === 0) return;

            // We don't strictly clear DB to avoid breaking existing sync/revs too badly,
            // but for a pure restore, we might want to update existing items.
            // PouchDB requires _rev for updates. If the backup has _revs matching local, it works.
            // If local has newer _rev, conflict.
            // Strategy: We will treat this as an "Overwrite/Merge".
            // For simplicity in this offline app: We try to put. If conflict, we force update.

            // Actually, safest for "Restore" is often to destroy and recreate, but that kills the DB instance references.
            // Let's use bulkDocs with new_edits: false typically used for replication, but for manual restore:
            // We will just process them one by one or bulk.

            // Robust Approach:
            // 1. Fetch all current docs to get their latest _revs
            // 2. Map backup docs: if ID exists locally, attach current _rev (to overwrite).

            const currentDocs = await database.allDocs();
            const revMap = {};
            currentDocs.rows.forEach(r => revMap[r.id] = r.value.rev);

            const docsToPut = docs.map(doc => {
                const newDoc = { ...doc };
                // If it exists locally, update the rev so we overwrite it
                if (revMap[doc._id]) {
                    newDoc._rev = revMap[doc._id];
                } else {
                    // New doc, remove _rev from backup if it causes issues, usually PouchDB handles new docs fine without _rev
                    // but if we are "restoring" a specific state, we might strip _rev to treat as new insert
                    // OR keep it if we want to preserve history (advanced).
                    // STRATEGY: Strip _rev for new inserts to avoid "missing stub" errors.
                    delete newDoc._rev;
                }
                return newDoc;
            });

            await database.bulkDocs(docsToPut);
        };

        await restoreDB(db.inventory, data.inventory);
        await restoreDB(db.invoices, data.invoices);
        await restoreDB(db.users, data.users);
        // We usually don't restore audit logs or maybe we do. Let's do it.
        await restoreDB(db.audit, data.audit);
        if (data.settings) await restoreDB(db.settings, data.settings);

        return true;
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
};
