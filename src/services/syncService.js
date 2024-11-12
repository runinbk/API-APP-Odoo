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
        // Intentar obtener cambios desde caché
        const cacheKey = `changes_${uid}_${lastSyncTimestamp}`;
        const cachedChanges = cacheService.get(cacheKey);

        if (cachedChanges) {
            console.log('Returning changes from cache');
            return cachedChanges;
        }

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

        // Guardar en caché por 5 minutos
        cacheService.set(cacheKey, changes, 300);

        return changes;
    }

    async getEntityChanges(uid, password, entity, lastSyncTimestamp) {
        const modelMapping = {
            notifications: 'colegio.notificacion',
            courses: 'colegio.curso',
            students: 'colegio.alumno',
            activities: 'colegio.actividad'
        };

        const cacheKey = `entity_${entity}_${uid}_${lastSyncTimestamp}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
            console.log(`Returning ${entity} from cache`);
            return cachedData;
        }

        try {
            const changes = await odooService.executeKw(
                uid,
                password,
                modelMapping[entity],
                'search_read',
                [[['write_date', '>', lastSyncTimestamp]]],
                { fields: ['id', 'write_date'] }
            );

            // Cachear por 5 minutos
            cacheService.set(cacheKey, changes, 300);

            return changes;
        } catch (error) {
            console.error(`Error getting changes for ${entity}:`, error);
            return [];
        }
    }

    generateOfflineVersion(data) {
        const offlineData = {
            data,
            version: Date.now(),
            offlineCapable: true
        };

        // Cachear versión offline
        const cacheKey = `offline_${Date.now()}`;
        cacheService.set(cacheKey, offlineData, 3600); // 1 hora

        return offlineData;
    }

    // Método para invalidar caché cuando hay cambios
    invalidateCache(entity, uid) {
        const prefix = `entity_${entity}_${uid}`;
        cacheService.clearByPrefix(prefix);
        
        // También limpiar caché de cambios
        cacheService.clearByPrefix(`changes_${uid}`);
    }

    // Método para precachear datos comunes
    async precacheCommonData(uid, password) {
        try {
            for (const entity of this.syncableEntities) {
                const data = await this.getEntityChanges(
                    uid,
                    password,
                    entity,
                    new Date(0).toISOString()
                );

                const cacheKey = `common_${entity}_${uid}`;
                cacheService.set(cacheKey, data, 1800); // 30 minutos
            }
        } catch (error) {
            console.error('Error precaching data:', error);
        }
    }
}

export default new SyncService();