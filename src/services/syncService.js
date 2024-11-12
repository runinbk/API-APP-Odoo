import odooService from './odooService.js';
import cacheService from './cacheService.js';

class SyncService {
    constructor() {
        this.syncableEntities = [
            'notifications',
            'courses',
            'students',
            'activities'
        ];
    }

    async getChanges(uid, password, lastSyncTimestamp) {
        const changes = {};

        for (const entity of this.syncableEntities) {
            const entityChanges = await this.getEntityChanges(
                uid, 
                password, 
                entity, 
                lastSyncTimestamp
            );
            
            if (entityChanges.length > 0) {
                changes[entity] = entityChanges;
            }
        }

        return changes;
    }

    async getEntityChanges(uid, password, entity, lastSyncTimestamp) {
        const modelMapping = {
            notifications: 'colegio.notificacion',
            courses: 'colegio.curso',
            students: 'colegio.alumno',
            activities: 'colegio.actividad'
        };

        try {
            const changes = await odooService.executeKw(
                uid,
                password,
                modelMapping[entity],
                'search_read',
                [[['write_date', '>', lastSyncTimestamp]]],
                { fields: ['id', 'write_date'] }
            );

            return changes;
        } catch (error) {
            console.error(`Error getting changes for ${entity}:`, error);
            return [];
        }
    }

    // Generar versión para sincronización offline
    generateOfflineVersion(data) {
        return {
            data,
            version: Date.now(),
            offlineCapable: true
        };
    }
}

export default new SyncService();