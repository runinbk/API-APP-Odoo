// src/routes/teacher.enhanced.routes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configuración de multer para archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Obtener todos los cursos donde el profesor dicta materias
router.get('/my-courses', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        console.log('1. Buscando profesor con user_id:', uid);
        
        // 1. Obtener el profesor
        const profesores = await odooService.execute(
            uid, password,
            'colegio.profesor',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['id', 'especialidad', 'user_id'] }
        );

        if (!profesores.length) {
            return res.status(404).json({ 
                message: 'Profesor no encontrado',
                user_id: uid 
            });
        }

        console.log('2. Profesor encontrado:', profesores[0]);

        // 2. Obtener asignaciones con datos relacionados en una sola consulta
        const asignaciones = await odooService.execute(
            uid, password,
            'colegio.asignacion',
            'search_read',
            [[['profesor_id', '=', profesores[0].id]]],
            { 
                fields: [
                    'id',
                    'curso_id',      // Relación Many2one
                    'materia_id',    // Relación Many2one
                    'gestion_id'     // Relación Many2one
                ] 
            }
        );

        console.log('3. Asignaciones encontradas:', asignaciones.length);

        // 3. Construir respuesta con los datos disponibles
        const asignacionesFormateadas = asignaciones.map(asignacion => ({
            id: asignacion.id,
            curso: {
                id: asignacion.curso_id[0],
                nombre: asignacion.curso_id[1]
            },
            materia: {
                id: asignacion.materia_id[0],
                nombre: asignacion.materia_id[1]
            },
            gestion: {
                id: asignacion.gestion_id[0],
                nombre: asignacion.gestion_id[1]
            }
        }));

        // 4. Enviar respuesta estructurada
        res.json({
            profesor: {
                id: profesores[0].id,
                user_id: profesores[0].user_id[0],
                nombre: profesores[0].user_id[1],
                especialidad: profesores[0].especialidad
            },
            total_asignaciones: asignacionesFormateadas.length,
            asignaciones: asignacionesFormateadas
        });

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({
            message: 'Error al obtener cursos',
            error: error.message
        });
    }
});

// Obtener alumnos de un curso específico
router.get('/course/:courseId/students', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const courseId = parseInt(req.params.courseId);

        console.log('1. Verificando acceso del profesor al curso:', courseId);

        // 1. Verificar que el profesor tenga asignación en este curso
        const profesor = await odooService.execute(
            uid, password,
            'colegio.profesor',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['id'] }
        );

        if (!profesor.length) {
            return res.status(404).json({ 
                message: 'Profesor no encontrado' 
            });
        }

        // 2. Verificar y obtener información de la asignación
        const asignacion = await odooService.execute(
            uid, password,
            'colegio.asignacion',
            'search_read',
            [[
                ['profesor_id', '=', profesor[0].id],
                ['curso_id', '=', courseId]
            ]],
            { 
                fields: [
                    'curso_id',
                    'materia_id',
                    'gestion_id'
                ] 
            }
        );

        if (!asignacion.length) {
            return res.status(403).json({ 
                message: 'No tiene acceso a este curso' 
            });
        }

        // 3. Devolver información disponible
        res.json({
            curso: {
                id: asignacion[0].curso_id[0],
                nombre: asignacion[0].curso_id[1]
            },
            materia: {
                id: asignacion[0].materia_id[0],
                nombre: asignacion[0].materia_id[1]
            },
            gestion: {
                id: asignacion[0].gestion_id[0],
                nombre: asignacion[0].gestion_id[1]
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al obtener información del curso',
            error: error.message
        });
    }
});

// Obtener actividades pendientes de un alumno
router.get('/student/:studentId/pending-activities', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const studentId = parseInt(req.params.studentId);

        const profesor = await odooService.executeKw(
            uid, password,
            'colegio.profesor',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['id'] }
        );

        // Obtener notificaciones (actividades) creadas por el profesor para este alumno
        const notificaciones = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'search_read',
            [[
                ['creado_por', '=', uid],
                ['tipo', '=', 'actividad'],
                ['user_ids', 'in', [studentId]]
            ]],
            {
                fields: [
                    'titulo', 'mensaje', 'fecha', 'hora',
                    'fecha_cierre', 'attachment_ids'
                ]
            }
        );

        res.json(notificaciones);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al obtener actividades',
            error: error.message
        });
    }
});

// Crear actividad
router.post('/create-activity', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const {
            titulo,
            mensaje,
            fecha,
            hora,
            fecha_cierre,
            tipo_destinatario,
            curso_id
        } = req.body;

        // Convertir hora (HH:mm) a float (HH.mm)
        const horaFloat = hora.split(':').reduce((acc, time) => {
            return parseFloat(acc) + parseFloat(time) / 60;
        });

        console.log('1. Datos de la actividad:', {
            titulo,
            curso_id,
            tipo_destinatario,
            horaFloat
        });

        // ... resto de verificaciones ...

        // Crear la notificación con la hora en formato correcto
        const notificacion = await odooService.execute(
            uid,
            password,
            'colegio.notificacion',
            'create',
            [{
                titulo,
                mensaje,
                fecha,
                hora: horaFloat,  // Aquí usamos el float convertido
                fecha_cierre,
                tipo: 'actividad',
                tipo_destinatario,
                curso_id: parseInt(curso_id),
                creado_por: uid
            }]
        );

        res.status(201).json({
            message: 'Actividad creada exitosamente',
            notificacion_id: notificacion,
            data: {
                titulo,
                mensaje,
                fecha,
                hora,
                hora_float: horaFloat,
                fecha_cierre,
                tipo_destinatario,
                curso_id
            }
        });

    } catch (error) {
        console.error('Error al crear actividad:', error);
        res.status(500).json({
            message: 'Error al crear la actividad',
            error: error.message
        });
    }
});

export default router;