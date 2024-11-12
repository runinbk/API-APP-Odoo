# Documentación API Odoo Mobile Gateway

## Índice
1. [Autenticación](#1-autenticación)
2. [Alumnos](#2-alumnos)
3. [Tutores](#3-tutores)
4. [Cursos](#4-cursos)
5. [Gestiones](#5-gestiones)
6. [Materias](#6-materias)
7. [Profesores](#7-profesores)
8. [Asignaciones](#8-asignaciones)
9. [Administrativos](#9-administrativos)
10. [Notificaciones](#10-notificaciones)
11. [Notificaciones Mejoradas](#11-notificaciones-mejoradas)

## 1. Autenticación

### Login
- **Ruta**: `POST /api/auth/login`
- **Descripción**: Inicia sesión y obtiene token de autenticación
- **Body**:
```json
{
    "username": "string",
    "password": "string"
}
```
- **Respuesta exitosa**:
```json
{
    "token": "string",
    "uid": number
}
```

## 2. Alumnos

### Obtener todos los alumnos
- **Ruta**: `GET /api/alumnos`
- **Auth**: Requiere token
- **Respuesta**: Lista de alumnos con sus datos

### Obtener alumno específico
- **Ruta**: `GET /api/alumnos/:id`
- **Auth**: Requiere token
- **Parámetros**: id en URL

### Crear alumno
- **Ruta**: `POST /api/alumnos`
- **Auth**: Requiere token
- **Body**:
```json
{
    "user_id": number,     // ID del usuario en res.users
    "edad": number,        // Edad del alumno
    "tutor_id": number,    // ID del tutor
    "grado": number        // ID del curso/grado
}
```

### Actualizar alumno
- **Ruta**: `PUT /api/alumnos/:id`
- **Auth**: Requiere token
- **Body**: Mismos campos que en crear (todos opcionales)

### Eliminar alumno
- **Ruta**: `DELETE /api/alumnos/:id`
- **Auth**: Requiere token

## 3. Tutores

### Obtener todos los tutores
- **Ruta**: `GET /api/tutores`
- **Auth**: Requiere token
- **Respuesta**: Lista de tutores con sus alumnos asociados

### Obtener tutor específico
- **Ruta**: `GET /api/tutores/:id`
- **Auth**: Requiere token

### Crear tutor
- **Ruta**: `POST /api/tutores`
- **Auth**: Requiere token
- **Body**:
```json
{
    "parentesco": "string",    // Ejemplo: "Padre", "Madre"
    "user_id": number         // ID del usuario en res.users
}
```

### Actualizar tutor
- **Ruta**: `PUT /api/tutores/:id`
- **Auth**: Requiere token
- **Body**: Mismos campos que en crear (opcionales)

### Eliminar tutor
- **Ruta**: `DELETE /api/tutores/:id`
- **Auth**: Requiere token

## 4. Cursos

### Obtener todos los cursos
- **Ruta**: `GET /api/cursos`
- **Auth**: Requiere token
- **Respuesta**: Lista de cursos con alumnos y asignaciones

### Crear curso
- **Ruta**: `POST /api/cursos`
- **Auth**: Requiere token
- **Body**:
```json
{
    "nombre": "string",    // Ejemplo: "Primero A"
    "nivel": "string"      // Ejemplo: "Primaria"
}
```

## 5. Gestiones

### Obtener todas las gestiones
- **Ruta**: `GET /api/gestiones`
- **Auth**: Requiere token

### Crear gestión
- **Ruta**: `POST /api/gestiones`
- **Auth**: Requiere token
- **Body**:
```json
{
    "nombre": "string",          // Ejemplo: "Gestión 2024"
    "fecha_inicio": "YYYY-MM-DD",
    "fecha_fin": "YYYY-MM-DD"
}
```

## 6. Materias

### Obtener todas las materias
- **Ruta**: `GET /api/materias`
- **Auth**: Requiere token

### Crear materia
- **Ruta**: `POST /api/materias`
- **Auth**: Requiere token
- **Body**:
```json
{
    "nombre": "string",       // Ejemplo: "Matemáticas"
    "descripcion": "string"   // Ejemplo: "Matemáticas básicas"
}
```

## 7. Profesores

### Obtener todos los profesores
- **Ruta**: `GET /api/profesores`
- **Auth**: Requiere token

### Crear profesor
- **Ruta**: `POST /api/profesores`
- **Auth**: Requiere token
- **Body**:
```json
{
    "especialidad": "string",   // Ejemplo: "Matemáticas"
    "user_id": number          // ID del usuario en res.users
}
```

## 8. Asignaciones

### Obtener todas las asignaciones
- **Ruta**: `GET /api/asignaciones`
- **Auth**: Requiere token

### Crear asignación
- **Ruta**: `POST /api/asignaciones`
- **Auth**: Requiere token
- **Body**:
```json
{
    "curso_id": number,     // ID del curso
    "materia_id": number,   // ID de la materia
    "profesor_id": number,  // ID del profesor
    "gestion_id": number    // ID de la gestión
}
```

## 9. Administrativos

### Obtener todos los administrativos
- **Ruta**: `GET /api/administrativos`
- **Auth**: Requiere token

### Crear administrativo
- **Ruta**: `POST /api/administrativos`
- **Auth**: Requiere token
- **Body**:
```json
{
    "cargo": "string",     // Ejemplo: "Director"
    "user_id": number     // ID del usuario en res.users
}
```

## 10. Notificaciones

### Obtener todas las notificaciones
- **Ruta**: `GET /api/notificaciones`
- **Auth**: Requiere token

### Crear notificación
- **Ruta**: `POST /api/notificaciones`
- **Auth**: Requiere token
- **Body**:
```json
{
    "titulo": "string",
    "mensaje": "string",
    "fecha": "YYYY-MM-DD",
    "hora": number,              // Formato 24h, ejemplo: 14.30
    "tipo": "string",           // Ejemplo: "comunicado"
    "lugar": "string",
    "fecha_cierre": "YYYY-MM-DD",
    "tipo_destinatario": "string", // "todos", "profesores", "curso", "especifico"
    "curso_id": number,           // Requerido si tipo_destinatario es "curso"
    "user_ids": number[]          // Requerido si tipo_destinatario es "especifico"
}
```

### Marcar notificación como leída
- **Ruta**: `PUT /api/notificaciones/read/:id`
- **Auth**: Requiere token

## 11. Notificaciones Mejoradas

### Obtener mis notificaciones
- **Ruta**: `GET /api/enhanced-notifications/my-notifications`
- **Auth**: Requiere token
- **Query Params**:
  - `fromToday`: boolean (opcional) - Si es true, muestra solo desde hoy
- **Descripción**: Retorna notificaciones según el rol del usuario (tutor o alumno)

### Marcar notificación (leída/recibida)
- **Ruta**: `POST /api/enhanced-notifications/mark-notification`
- **Auth**: Requiere token
- **Body**:
```json
{
    "notificationId": number,
    "action": "string"     // "read" o "received"
}
```

## Notas Importantes

1. **Autenticación**:
   - Todas las rutas (excepto login) requieren el header:
   ```
   Authorization: Bearer <token>
   ```

2. **Respuestas de Error**:
   - Código 400: Error de validación
   - Código 401: No autorizado
   - Código 404: No encontrado
   - Código 500: Error del servidor

3. **Fechas**:
   - Todas las fechas deben enviarse en formato "YYYY-MM-DD"
   - Las horas se envían en formato decimal (14.30 = 14:30)

4. **IDs**:
   - Todos los IDs son números enteros positivos
   - Al crear relaciones, asegurarse que los IDs existan

5. **Roles**:
   - Las rutas mejoradas de notificaciones detectan automáticamente el rol del usuario
   - Los permisos se manejan según el grupo asignado al usuario en Odoo

   ## Características implementadas [(Notificaciones Mejoradas)](#11-notificaciones-mejoradas):

1. Notificaciones para Tutores:

  - Obtiene notificaciones de todos sus hijos
  - Incluye información del hijo y curso en cada notificación
  - Ordenadas por fecha
  - Opción para filtrar desde hoy

2. Notificaciones para Alumnos:

  - Obtiene notificaciones de su curso
  - Ordenadas por fecha
  - Opción para filtrar desde hoy

3. Sistema de Lectura/Recepción:

  - Marca notificaciones como leídas o recibidas
  - Almacena el estado en la tabla de lecturas
  - Notifica al profesor cuando un estudiante lee una notificación

4. Ordenamiento y Filtrado:

  - Todas las notificaciones están ordenadas de más antigua a más reciente
  - Opción para mostrar solo desde la fecha actual