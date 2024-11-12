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
}

export default new CacheService();