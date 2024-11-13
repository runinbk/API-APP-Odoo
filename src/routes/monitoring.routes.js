import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import cacheService from '../services/cacheService.js';

const router = express.Router();

router.get('/cache/stats', authMiddleware, async (req, res) => {
    try {
        const stats = cacheService.getStats();
        const size = cacheService.getSize();
        const keys = cacheService.getKeys();

        res.json({
            stats,
            size,
            keys,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas de caché:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de caché',
            error: error.message
        });
    }
});

router.post('/cache/clear', authMiddleware, async (req, res) => {
    try {
        const statsBefore = cacheService.getStats();
        cacheService.clear();
        const statsAfter = cacheService.getStats();

        res.json({
            message: 'Caché limpiada exitosamente',
            statsBefore,
            statsAfter,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error limpiando caché:', error);
        res.status(500).json({
            message: 'Error al limpiar caché',
            error: error.message
        });
    }
});

export default router;