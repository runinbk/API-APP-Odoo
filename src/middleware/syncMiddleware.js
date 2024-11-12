import cacheService from '../services/cacheService.js';

export const syncMiddleware = async (req, res, next) => {
    const { lastSyncTimestamp } = req.headers;
    
    // Agregar información de sincronización a la respuesta
    res.locals.sync = {
        timestamp: Date.now(),
        hasChanges: false
    };

    if (lastSyncTimestamp) {
        // Verificar si hay cambios desde la última sincronización
        const cacheKey = `SYNC_${req.baseUrl}_${lastSyncTimestamp}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
            res.locals.sync.hasChanges = true;
            res.locals.sync.changes = cachedData;
        }
    }

    next();
};

// Middleware para marcar cambios para sincronización
export const trackChanges = (type) => async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        // Guardar cambios en caché para sincronización
        const changeKey = `CHANGE_${type}_${Date.now()}`;
        cacheService.set(changeKey, {
            type,
            data,
            timestamp: Date.now()
        });

        return originalJson.call(this, {
            ...data,
            sync: res.locals.sync
        });
    };

    next();
};