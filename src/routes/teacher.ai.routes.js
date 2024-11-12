import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';
import openaiService from '../services/openaiService.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// Configuración de multer para archivos de audio
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/m4a'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no soportado'));
        }
    },
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB máximo
    }
});

// Procesar audio de clase y generar contenido
router.post('/process-class', authMiddleware, upload.single('audio'), async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { courseId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Se requiere archivo de audio' });
        }

        // 1. Transcribir y estructurar el audio
        const structuredContent = await openaiService.transcribeAudio(req.file.buffer);

        // 2. Guardar la transcripción en Odoo
        const transcriptionId = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'create',
            [{
                titulo: `Transcripción de clase - ${new Date().toLocaleDateString()}`,
                mensaje: structuredContent,
                tipo: 'transcripcion',
                curso_id: parseInt(courseId),
                creado_por: uid,
                fecha: new Date().toISOString().split('T')[0]
            }]
        );

        res.json({
            message: 'Audio procesado exitosamente',
            transcriptionId,
            content: structuredContent
        });
    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({
            message: 'Error al procesar el audio',
            error: error.message
        });
    }
});

// Generar actividades basadas en transcripción
router.post('/generate-activities', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { transcriptionId, courseId } = req.body;

        // 1. Obtener la transcripción
        const transcription = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'read',
            [transcriptionId],
            { fields: ['mensaje'] }
        );

        // 2. Generar actividades
        const activities = await openaiService.generateTasks(transcription[0].mensaje);

        // 3. Crear notificación con las actividades
        const activityId = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'create',
            [{
                titulo: 'Actividades generadas automáticamente',
                mensaje: activities,
                tipo: 'actividad',
                curso_id: parseInt(courseId),
                creado_por: uid,
                fecha: new Date().toISOString().split('T')[0]
            }]
        );

        res.json({
            message: 'Actividades generadas exitosamente',
            activityId,
            activities
        });
    } catch (error) {
        console.error('Error generating activities:', error);
        res.status(500).json({
            message: 'Error al generar actividades',
            error: error.message
        });
    }
});

// Generar cuestionario basado en transcripción
router.post('/generate-quiz', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { transcriptionId, courseId } = req.body;

        // 1. Obtener la transcripción
        const transcription = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'read',
            [transcriptionId],
            { fields: ['mensaje'] }
        );

        // 2. Generar cuestionario
        const quiz = await openaiService.generateQuiz(transcription[0].mensaje);

        // 3. Crear notificación con el cuestionario
        const quizId = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'create',
            [{
                titulo: 'Cuestionario de evaluación',
                mensaje: JSON.stringify(quiz),
                tipo: 'cuestionario',
                curso_id: parseInt(courseId),
                creado_por: uid,
                fecha: new Date().toISOString().split('T')[0]
            }]
        );

        res.json({
            message: 'Cuestionario generado exitosamente',
            quizId,
            quiz
        });
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({
            message: 'Error al generar cuestionario',
            error: error.message
        });
    }
});

// Enviar contenido generado a alumnos
router.post('/send-content', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const {
            contentId,
            courseId,
            contentType, // 'transcription', 'activities', 'quiz'
            studentIds // opcional, si se quiere enviar a estudiantes específicos
        } = req.body;

        // 1. Obtener el contenido original
        const content = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'read',
            [contentId],
            { fields: ['titulo', 'mensaje', 'tipo'] }
        );

        // 2. Determinar destinatarios
        let userIds = [];
        if (studentIds) {
            userIds = studentIds;
        } else {
            // Obtener todos los alumnos del curso
            const alumnos = await odooService.executeKw(
                uid, password,
                'colegio.alumno',
                'search_read',
                [[['grado', '=', parseInt(courseId)]]],
                { fields: ['user_id'] }
            );
            userIds = alumnos.map(alumno => alumno.user_id[0]);
        }

        // 3. Crear notificación para los alumnos
        const notificationId = await odooService.executeKw(
            uid, password,
            'colegio.notificacion',
            'create',
            [{
                titulo: `${contentType === 'transcription' ? 'Material de estudio' : 
                         contentType === 'activities' ? 'Actividades' : 'Cuestionario'} - ${content[0].titulo}`,
                mensaje: content[0].mensaje,
                tipo: contentType,
                curso_id: parseInt(courseId),
                user_ids: [[6, 0, userIds]],
                creado_por: uid,
                fecha: new Date().toISOString().split('T')[0]
            }]
        );

        res.json({
            message: 'Contenido enviado exitosamente',
            notificationId
        });
    } catch (error) {
        console.error('Error sending content:', error);
        res.status(500).json({
            message: 'Error al enviar contenido',
            error: error.message
        });
    }
});

export default router;