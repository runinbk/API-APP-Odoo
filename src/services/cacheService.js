import NodeCache from 'node-cache';

class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 3600, // 1 hora por defecto
            checkperiod: 120 // Checar expiración cada 2 minutos
        });

        // Prefijos para diferentes tipos de datos
        this.prefixes = {
            user: 'USER_',
            notifications: 'NOTIF_',
            course: 'COURSE_',
            student: 'STUDENT_',
            teacher: 'TEACHER_',
            activity: 'ACTIVITY_'
        };
    }

    // Generar key con prefijo
    generateKey(prefix, identifier) {
        return `${this.prefixes[prefix]}${identifier}`;
    }

    // Guardar en caché
    set(key, data, ttl = 3600) {
        return this.cache.set(key, data, ttl);
    }

    // Obtener de caché
    get(key) {
        return this.cache.get(key);
    }

    // Eliminar de caché
    delete(key) {
        return this.cache.del(key);
    }

    // Limpiar caché por prefijo
    clearByPrefix(prefix) {
        const keys = this.cache.keys();
        const prefixStr = this.prefixes[prefix];
        keys.forEach(key => {
            if (key.startsWith(prefixStr)) {
                this.cache.del(key);
            }
        });
    }

    // Verificar si existe en caché
    has(key) {
        return this.cache.has(key);
    }

    // Limpiar entradas expiradas
    clearExpired() {
        const keys = this.cache.keys();
        let expiredCount = 0;

        keys.forEach(key => {
            const ttl = this.cache.getTtl(key);
            if (ttl && ttl < Date.now()) {
                this.cache.del(key);
                expiredCount++;
            }
        });

        return expiredCount;
    }

    // Limpiar toda la caché
    clear() {
        return this.cache.flushAll();
    }

    // Obtener estadísticas
    getStats() {
        const keys = this.cache.keys();
        const stats = this.cache.getStats();
        
        return {
            ...stats,
            totalKeys: keys.length,
            keys: keys,
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
            timestamp: new Date().toISOString()
        };
    }

    // Obtener todas las claves
    getKeys() {
        return this.cache.keys();
    }

    // Obtener cantidad de elementos en caché
    getSize() {
        return this.cache.keys().length;
    }

    // Obtener detalles completos de la caché
    getDetails() {
        const keys = this.cache.keys();
        const details = {};

        keys.forEach(key => {
            const value = this.cache.get(key);
            const ttl = this.cache.getTtl(key);
            details[key] = {
                value,
                ttl,
                expiresAt: ttl ? new Date(ttl).toISOString() : 'never',
                size: JSON.stringify(value).length
            };
        });

        return details;
    }
}

export default new CacheService();