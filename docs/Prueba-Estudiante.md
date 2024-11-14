# Pruebas en Postman para el rol de estudiante

Basándonos en la estructura que ya tenemos y recordando que el estudiante puede:
- Ver sus actividades/tareas asignadas
- Ver notificaciones dirigidas a él
- Ver notificaciones generales de su curso

Primero usaremos el estudiante Pedro Martínez que está en 1ro Secundaria A:

1. **Login Estudiante**:
```json
POST /api/auth/login
{
    "username": "pedro.martinez@colegio.com",
    "password": "1234"
}
```

2. **Obtener Mis Notificaciones**:
```json
GET /api/enhanced-notifications/my-notifications
Headers: {
    "Authorization": "Bearer {{token}}"
}
// Esto debería devolver:
// - Notificaciones específicas para el estudiante
// - Notificaciones de su curso (1ro Secundaria A)
// - Notificaciones generales para todos los estudiantes
```

3. **Marcar Notificación como Leída**:
```json
POST /api/enhanced-notifications/notifications/:id/read
Headers: {
    "Authorization": "Bearer {{token}}"
}
```

4. **Obtener Datos para Modo Offline**:
```json
GET /api/sync/offline-data
Headers: {
    "Authorization": "Bearer {{token}}"
}
```

5. **Obtener Cambios desde Última Sincronización**:
```json
GET /api/sync/changes
Headers: {
    "Authorization": "Bearer {{token}}",
    "lastSyncTimestamp": "2024-03-20T10:00:00Z"
}
```

Colección completa para Postman:
```json
{
    "info": {
        "name": "API Agenda - Rol Estudiante",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Autenticación",
            "item": [
                {
                    "name": "Login Estudiante",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n    \"username\": \"pedro.martinez@colegio.com\",\n    \"password\": \"1234\"\n}"
                        },
                        "url": "{{base_url}}/api/auth/login"
                    }
                }
            ]
        },
        {
            "name": "Notificaciones",
            "item": [
                {
                    "name": "Obtener Mis Notificaciones",
                    "request": {
                        "method": "GET",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "Bearer {{token}}"
                            }
                        ],
                        "url": "{{base_url}}/api/enhanced-notifications/my-notifications"
                    }
                },
                {
                    "name": "Marcar Notificación como Leída",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "Bearer {{token}}"
                            }
                        ],
                        "url": "{{base_url}}/api/enhanced-notifications/notifications/1/read"
                    }
                }
            ]
        },
        {
            "name": "Sincronización",
            "item": [
                {
                    "name": "Obtener Datos Offline",
                    "request": {
                        "method": "GET",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "Bearer {{token}}"
                            }
                        ],
                        "url": "{{base_url}}/api/sync/offline-data"
                    }
                },
                {
                    "name": "Obtener Cambios",
                    "request": {
                        "method": "GET",
                        "header": [
                            {
                                "key": "Authorization",
                                "value": "Bearer {{token}}"
                            },
                            {
                                "key": "lastSyncTimestamp",
                                "value": "2024-03-20T10:00:00Z"
                            }
                        ],
                        "url": "{{base_url}}/api/sync/changes"
                    }
                }
            ]
        }
    ]
}
```

Variables de Entorno:
```json
{
    "base_url": "http://localhost:3000",
    "token": "{{token_from_login}}"
}
```
