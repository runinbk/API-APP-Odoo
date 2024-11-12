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
        
        // Primero obtener el ID del profesor
        const profesor = await odooService.executeKw(
            uid, password,
            'colegio.profesor',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['id'] }
        );

        if (!profesor.length) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }

        // Obtener todas las asignaciones del profesor
        const asignaciones = await odooService.executeKw(
            uid, password,
            'colegio.asignacion',
            'search_read',
            [[['profesor_id', '=', profesor[0].id]]],
            { fields: ['curso_id', 'materia_id'] }
        );

        // Obtener detalles de cada curso y materia
        const cursosConMaterias = await Promise.all(
            asignaciones.map(async (asignacion) => {
                const [curso, materia] = await Promise.all([
                    odooService.executeKw(
                        uid, password,
                        'colegio.curso',
                        'read',
                        [asignacion.curso_id[0]],
                        { fields: ['nombre', 'nivel'] }
                    ),
                    odooService.executeKw(
                        uid, password,
                        'colegio.materia',
                        'read',
                        [asignacion.materia_id[0]],
                        { fields: ['nombre', 'descripcion'] }
                    )
                ]);

                return {
                    curso: curso[0],
                    materia: materia[0]
                };
            })
        );

        res.json(cursosConMaterias);
    } catch (error) {
        console.error('Error:', error);
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

        // Verificar que el profesor tenga asignación en este curso
        const profesor = await odooService.executeKw(
            uid, password,
            'colegio.profesor',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['id'] }
        );

        const tieneAsignacion = await odooService.executeKw(
            uid, password,
            'colegio.asignacion',
            'search_count',
            [[
                ['profesor_id', '=', profesor[0].id],
                ['curso_id', '=', courseId]
            ]]
        );

        if (!tieneAsignacion) {
            return res.status(403).json({ 
                message: 'No tiene acceso a este curso' 
            });
        }

        // Obtener alumnos del curso
        const alumnos = await odooService.executeKw(
            uid, password,
            'colegio.alumno',
            'search_read',
            [[['grado', '=', courseId]]],
            { fields: ['user_id', 'edad'] }
        );

        res.json(alumnos);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al obtener alumnos',
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
router.post('/create-activity', authMiddleware, upload.array('files'), async (req, res) => {
    try {
        const { uid, password } = req.user;
        const {
            titulo,
            mensaje,
            fecha,
            hora,
            fecha_cierre,
            tipo_destinatario,  // 'alumno', 'varios_alumnos', 'curso'
            curso_id,
            student_ids
        } = req.body;

        // Crear attachments en Odoo para los archivos subidos
        const attachmentIds = await Promise.all(
            (req.files || []).map(async (file) => {
                const attachmentData = {
                    name: file.originalname,
                    datas: Buffer.from(file.buffer).toString('base64'),
                    res_model: 'colegio.notificacion',
                    type: 'binary',
                    mimetype: file.mimetype
                };

                return await odooService.executeKw(
                    uid, password,
                    'ir.attachment',
                    'create',
                    [attachmentData]
                );
            })
        );

        // Determinar los destinatarios
        let user_ids = [];
        if (tipo_destinatario === 'curso' && curso_id) {
            const alumnos = await odooService.executeKw(
                uid, password,
                'colegio.alumno',
                'search_read',
                [[['grado', '=', parseInt(curso_id)]]],
                { fields: ['user_id'] }
            );
            user_ids = alumnos.map(alumno => alumno.user_id[0]);
        } else if (tipo_destinatario === 'varios_alumnos' && student_ids) {
            user_ids = JSON.parse(student_ids);
        } else if (tipo_destinatario === 'alumno' && student_ids) {
            user_ids = [parseInt(student_ids)];
        }

        // Crear la notificación
        const notificacionId = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'create',
            [{
                titulo,
                mensaje,
                fecha,
                hora,
                fecha_cierre,
                tipo: 'actividad',
                user_ids: [[6, 0, user_ids]],
                attachment_ids: [[6, 0, attachmentIds]],
                creado_por: uid
            }]
        );

        res.status(201).json({
            message: 'Actividad creada exitosamente',
            id: notificacionId
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error al crear actividad',
            error: error.message
        });
    }
});

export default router;