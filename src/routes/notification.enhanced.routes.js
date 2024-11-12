import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// Función helper para ordenar notificaciones por fecha
const sortNotifications = (notifications, fromToday = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredNotifications = notifications;
    if (fromToday) {
        filteredNotifications = notifications.filter(notif => {
            const notifDate = new Date(notif.fecha);
            return notifDate >= today;
        });
    }

    return filteredNotifications.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        return dateA - dateB;
    });
};

// Obtener el rol del usuario
const getUserRole = async (uid, password) => {
    try {
        // Buscar en cada modelo de rol
        const [isStudent, isTutor] = await Promise.all([
            odooService.executeKw(
                uid, password,
                'colegio.alumno',
                'search_count',
                [[['user_id', '=', uid]]]
            ),
            odooService.executeKw(
                uid, password,
                'colegio.tutor',
                'search_count',
                [[['user_id', '=', uid]]]
            )
        ]);

        if (isStudent) return 'student';
        if (isTutor) return 'tutor';
        return null;
    } catch (error) {
        console.error('Error getting user role:', error);
        throw error;
    }
};

// Endpoint para obtener notificaciones según rol
router.get('/my-notifications', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { fromToday } = req.query;
        const shouldFilterFromToday = fromToday === 'true';

        const userRole = await getUserRole(uid, password);

        let notifications = [];
        
        if (userRole === 'tutor') {
            // Obtener los hijos del tutor
            const tutor = await odooService.executeKw(
                uid, password,
                'colegio.tutor',
                'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['alumno_ids'] }
            );

            if (tutor.length && tutor[0].alumno_ids.length) {
                // Obtener notificaciones para cada hijo
                const childrenNotifications = await Promise.all(
                    tutor[0].alumno_ids.map(async (childId) => {
                        // Obtener datos del hijo
                        const child = await odooService.executeKw(
                            uid, password,
                            'colegio.alumno',
                            'read',
                            [childId],
                            { fields: ['user_id', 'grado'] }
                        );

                        // Obtener notificaciones del curso del hijo
                        const courseNotifications = await odooService.executeKw(
                            uid, password,
                            'colegio.notificacion',
                            'search_read',
                            [[['curso_id', '=', child[0].grado[0]]]],
                            {
                                fields: [
                                    'titulo', 'mensaje', 'fecha', 'hora',
                                    'tipo', 'lugar', 'fecha_cierre'
                                ]
                            }
                        );

                        // Agregar información del hijo a cada notificación
                        return courseNotifications.map(notif => ({
                            ...notif,
                            child_name: child[0].user_id[1],
                            course_name: child[0].grado[1]
                        }));
                    })
                );

                notifications = [].concat(...childrenNotifications);
            }
        } else if (userRole === 'student') {
            // Obtener el curso del alumno
            const student = await odooService.executeKw(
                uid, password,
                'colegio.alumno',
                'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['grado'] }
            );

            if (student.length) {
                notifications = await odooService.executeKw(
                    uid, password,
                    'colegio.notificacion',
                    'search_read',
                    [[['curso_id', '=', student[0].grado[0]]]],
                    {
                        fields: [
                            'titulo', 'mensaje', 'fecha', 'hora',
                            'tipo', 'lugar', 'fecha_cierre'
                        ]
                    }
                );
            }
        }

        // Ordenar y filtrar notificaciones
        const sortedNotifications = sortNotifications(notifications, shouldFilterFromToday);

        res.json(sortedNotifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
});

// Endpoint para marcar notificación como leída/recibida
router.post('/mark-notification', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { notificationId, action } = req.body; // action puede ser 'read' o 'received'

        if (!notificationId || !action) {
            return res.status(400).json({
                message: 'Se requiere ID de notificación y tipo de acción'
            });
        }

        // Verificar si ya existe una lectura para este usuario y notificación
        const existingReading = await odooService.executeKw(
            uid, password,
            'colegio.lectura',
            'search_read',
            [[
                ['notificacion_id', '=', notificationId],
                ['user_id', '=', uid]
            ]]
        );

        if (existingReading.length) {
            // Actualizar lectura existente
            await odooService.executeKw(
                uid, password,
                'colegio.lectura',
                'write',
                [[existingReading[0].id], {
                    estado: action === 'read' ? 'Leído' : 'Recibido'
                }]
            );
        } else {
            // Crear nueva lectura
            await odooService.executeKw(
                uid, password,
                'colegio.lectura',
                'create',
                [{
                    notificacion_id: notificationId,
                    user_id: uid,
                    estado: action === 'read' ? 'Leído' : 'Recibido'
                }]
            );
        }

        // Notificar al profesor si es un estudiante marcando como leído
        const userRole = await getUserRole(uid, password);
        if (userRole === 'student' && action === 'read') {
            const notification = await odooService.executeKw(
                uid, password,
                'colegio.notificacion',
                'read',
                [notificationId],
                { fields: ['creado_por'] }
            );

            if (notification[0].creado_por) {
                // Aquí podrías implementar una notificación al profesor
                // Por ejemplo, crear un registro en una tabla de notificaciones para profesores
            }
        }

        res.json({
            message: `Notificación marcada como ${action === 'read' ? 'leída' : 'recibida'}`
        });
    } catch (error) {
        console.error('Error marking notification:', error);
        res.status(500).json({
            message: 'Error al marcar notificación',
            error: error.message
        });
    }
});

export default router;