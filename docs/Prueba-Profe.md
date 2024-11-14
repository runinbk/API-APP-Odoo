# Pruebas en Postman para el rol de profesor

Usaremos al profesor Carlos Rodríguez que sabemos que:
- Email: carlos.rodriguez@colegio.com
- Enseña Matemáticas en 1ro Secundaria A y Física en 2do Secundaria A

Primero necesitamos autenticarnos:

1. **Login Profesor**:
```json
POST /api/auth/login
{
    "username": "carlos.rodriguez@colegio.com",
    "password": "1234"
}
```

2. **Obtener Mis Cursos Asignados**:
```json
GET /api/teacher/my-courses
Headers: {
    "Authorization": "Bearer {{token}}"
}
```

3. **Obtener Alumnos de 1ro Secundaria A**:
```json
GET /api/teacher/course/1/students
Headers: {
    "Authorization": "Bearer {{token}}"
}
// Debería devolver a Pedro Martínez y Carla Paz
```

4. **Crear Actividad para Clase de Matemáticas**:
```json
POST /api/teacher/create-activity
Headers: {
    "Authorization": "Bearer {{token}}"
    "Content-Type": "multipart/form-data"
}
Form Data: {
    "titulo": "Ejercicios de Álgebra - Ecuaciones de Primer Grado",
    "mensaje": "Resolver los siguientes ejercicios de ecuaciones:\n1. 2x + 3 = 7\n2. -x + 5 = 2\n3. 3x - 1 = 8",
    "fecha": "2024-03-20",
    "hora": "14:30",
    "fecha_cierre": "2024-03-22",
    "tipo_destinatario": "curso",
    "curso_id": "1", // ID de 1ro Secundaria A
    "files": [archivo_pdf_ejercicios.pdf] // Opcional
}
```

5. **Crear Actividad para un Alumno Específico**:
```json
POST /api/teacher/create-activity
Headers: {
    "Authorization": "Bearer {{token}}"
}
Body: {
    "titulo": "Ejercicios de Refuerzo - Matemáticas",
    "mensaje": "Ejercicios adicionales para mejorar comprensión de ecuaciones",
    "fecha": "2024-03-20",
    "hora": "15:00",
    "fecha_cierre": "2024-03-23",
    "tipo_destinatario": "alumno",
    "student_ids": "1", // ID de Pedro Martínez
    "files": [archivo_ejercicios_refuerzo.pdf]
}
```

6. **Procesar Audio de Clase**:
```json
POST /api/teacher-ai/process-class
Headers: {
    "Authorization": "Bearer {{token}}"
    "Content-Type": "multipart/form-data"
}
Form Data: {
    "audio": [archivo_clase.mp3],
    "courseId": "1" // ID de 1ro Secundaria A
}
```

7. **Generar Actividades basadas en Transcripción**:
```json
POST /api/teacher-ai/generate-activities
Headers: {
    "Authorization": "Bearer {{token}}"
}
Body: {
    "transcriptionId": "{{transcriptionId}}", // ID obtenido de la transcripción anterior
    "courseId": "1"
}
```

8. **Generar Cuestionario basado en Transcripción**:
```json
POST /api/teacher-ai/generate-quiz
Headers: {
    "Authorization": "Bearer {{token}}"
}
Body: {
    "transcriptionId": "{{transcriptionId}}",
    "courseId": "1"
}
```

9. **Enviar Comunicado a Tutores**:
```json
POST /api/enhanced-notifications/create
Headers: {
    "Authorization": "Bearer {{token}}"
}
Body: {
    "titulo": "Reunión de Padres - Matemáticas",
    "mensaje": "Estimados padres, se convoca a reunión para discutir el avance del primer bimestre",
    "fecha": "2024-03-25",
    "hora": "17:00",
    "tipo_destinatario": "tutores",
    "curso_id": "1"
}
```

10. **Ver Actividades Pendientes de un Alumno**:
```json
GET /api/teacher/student/1/pending-activities
Headers: {
    "Authorization": "Bearer {{token}}"
}
```

11. **Enviar Contenido Generado a Alumnos**:
```json
POST /api/teacher-ai/send-content
Headers: {
    "Authorization": "Bearer {{token}}"
}
Body: {
    "contentId": "{{quizId}}", // ID del cuestionario o actividad generada
    "courseId": "1",
    "contentType": "quiz",
    "studentIds": ["1", "2"] // IDs de Pedro y Carla, opcional si es para todo el curso
}
```

Notas importantes para las pruebas:
1. Reemplazar los IDs (1, 2, etc.) con los IDs reales generados en tu sistema
2. El token JWT se obtiene de la respuesta del login
3. Para archivos, usar archivos reales de prueba
4. Los timestamps deben ser fechas futuras válidas

¿Te gustaría que agregue más casos de prueba o que detalle alguno en particular?