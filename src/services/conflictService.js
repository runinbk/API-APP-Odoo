class ConflictService {
    resolveConflicts(serverData, localData) {
        const resolved = {};
        const conflicts = [];

        for (const key in serverData) {
            if (localData[key]) {
                if (this.hasConflict(serverData[key], localData[key])) {
                    conflicts.push({
                        key,
                        server: serverData[key],
                        local: localData[key]
                    });
                } else {
                    resolved[key] = this.getMostRecentVersion(
                        serverData[key],
                        localData[key]
                    );
                }
            } else {
                resolved[key] = serverData[key];
            }
        }

        return { resolved, conflicts };
    }

    hasConflict(serverVersion, localVersion) {
        return serverVersion.lastModified > localVersion.baseVersion &&
               localVersion.lastModified > localVersion.baseVersion;
    }

    getMostRecentVersion(serverVersion, localVersion) {
        return serverVersion.lastModified > localVersion.lastModified
            ? serverVersion
            : localVersion;
    }

    // Resolver conflictos automáticamente según reglas predefinidas
    autoResolveConflicts(conflicts) {
        const resolved = {};

        for (const conflict of conflicts) {
            switch (conflict.key) {
                case 'notifications':
                    // Mantener ambas versiones para notificaciones
                    resolved[conflict.key] = this.mergeArrays(
                        conflict.server,
                        conflict.local,
                        'id'
                    );
                    break;

                case 'activities':
                    // Priorizar versión del servidor para actividades
                    resolved[conflict.key] = conflict.server;
                    break;

                default:
                    // Por defecto, mantener la versión más reciente
                    resolved[conflict.key] = this.getMostRecentVersion(
                        conflict.server,
                        conflict.local
                    );
            }
        }

        return resolved;
    }

    mergeArrays(arr1, arr2, idField) {
        const merged = [...arr1];
        const ids = new Set(arr1.map(item => item[idField]));

        for (const item of arr2) {
            if (!ids.has(item[idField])) {
                merged.push(item);
            }
        }

        return merged;
    }
}

export default new ConflictService();