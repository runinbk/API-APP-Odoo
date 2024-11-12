import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { syncMiddleware, trackChanges } from '../middleware/syncMiddleware.js';
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

            const changes = await syncService.getChanges(
                uid,
                password,
                lastSyncTimestamp || new Date(0).toISOString()
            );

            res.json({
                changes,
                timestamp: Date.now(),
                nextSync: Date.now() + (30 * 60 * 1000) // 30 minutos
            });
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
                } catch (error) {
                    syncResults.failed.push({
                        id: change.id,
                        error: error.message
                    });
                }
            }

            res.json({
                syncResults,
                timestamp: Date.now()
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

export default router;