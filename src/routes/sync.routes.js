import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { syncMiddleware } from '../middleware/syncMiddleware.js';
import syncService from '../services/syncService.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

// Obtener cambios desde última sincronización
router.get('/changes', 
    authMiddleware, 
    syncMiddleware,
    async (req, res) => {
        try {
            const { uid, password } = req.user;
            const { lastSyncTimestamp } = req.headers;

            // Intentar obtener desde caché primero
            const cacheKey = `sync_changes_${uid}_${lastSyncTimestamp}`;
            const cachedResponse = cacheService.get(cacheKey);

            if (cachedResponse) {
                return res.json(cachedResponse);
            }

            const changes = await syncService.getChanges(
                uid,
                password,
                lastSyncTimestamp || new Date(0).toISOString()
            );

            const response = {
                changes,
                timestamp: Date.now(),
                nextSync: Date.now() + (30 * 60 * 1000) // 30 minutos
            };

            // Cachear respuesta por 5 minutos
            cacheService.set(cacheKey, response, 300);

            res.json(response);
        } catch (error) {
            console.error('Sync error:', error);
            res.status(500).json({
                message: 'Error during synchronization',
                error: error.message
            });
        }
    }
);

// Obtener datos para modo offline
router.get('/offline-data',
    authMiddleware,
    syncMiddleware,
    async (req, res) => {
        try {
            const { uid, password } = req.user;
            const { role } = req.user;

            // Verificar caché primero
            const cacheKey = `offline_data_${uid}_${role}`;
            const cachedData = cacheService.get(cacheKey);

            if (cachedData) {
                return res.json(cachedData);
            }

            // Determinar qué datos necesita el usuario según su rol
            const offlineData = {
                timestamp: Date.now(),
                notifications: [],
                courses: [],
                profile: {}
            };

            // Obtener datos según rol
            if (role === 'student') {
                offlineData.notifications = await syncService.getEntityChanges(
                    uid, password, 'notifications', new Date(0).toISOString()
                );
            } else if (role === 'teacher') {
                offlineData.courses = await syncService.getEntityChanges(
                    uid, password, 'courses', new Date(0).toISOString()
                );
                offlineData.students = await syncService.getEntityChanges(
                    uid, password, 'students', new Date(0).toISOString()
                );
            }

            // Generar versión offline
            const offlineVersion = syncService.generateOfflineVersion(offlineData);

            // Cachear por 1 hora
            cacheService.set(cacheKey, offlineVersion, 3600);

            res.json(offlineVersion);
        } catch (error) {
            console.error('Offline data error:', error);
            res.status(500).json({
                message: 'Error getting offline data',
                error: error.message
            });
        }
    }
);

// Sincronizar cambios locales
router.post('/sync-local-changes',
    authMiddleware,
    async (req, res) => {
        try {
            const { uid, password } = req.user;
            const { changes } = req.body;

            const syncResults = {
                successful: [],
                failed: []
            };

            // Procesar cada cambio
            for (const change of changes) {
                try {
                    // Aplicar cambio en Odoo
                    await odooService.executeKw(
                        uid,
                        password,
                        change.model,
                        change.operation,
                        [change.data]
                    );

                    syncResults.successful.push(change.id);

                    // Invalidar caché relacionada
                    syncService.invalidateCache(change.model, uid);
                } catch (error) {
                    syncResults.failed.push({
                        id: change.id,
                        error: error.message
                    });
                }
            }

            // Actualizar caché de último sync
            const syncTimestamp = Date.now();
            cacheService.set(`last_sync_${uid}`, syncTimestamp, 3600);

            res.json({
                syncResults,
                timestamp: syncTimestamp
            });
        } catch (error) {
            console.error('Local sync error:', error);
            res.status(500).json({
                message: 'Error synchronizing local changes',
                error: error.message
            });
        }
    }
);

// Nuevo endpoint para precachear datos
router.post('/precache',
    authMiddleware,
    async (req, res) => {
        try {
            const { uid, password } = req.user;
            
            await syncService.precacheCommonData(uid, password);
            
            res.json({
                message: 'Data precached successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Precache error:', error);
            res.status(500).json({
                message: 'Error precaching data',
                error: error.message
            });
        }
    }
);

export default router;