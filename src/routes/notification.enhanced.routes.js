import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

router.get('/my-notifications', authMiddleware, async (req, res) => {
    try {
        const { uid, password, role } = req.user;
        
        console.log('Obteniendo notificaciones para usuario:', {
            uid,
            role
        });

        let domain = [];
        let notifications = [];
        
        try {
            // Primero intentamos obtener todas las notificaciones dirigidas al usuario
            notifications = await odooService.execute(
                uid,
                password,
                'colegio.notificacion',
                'search_read',
                [[['user_ids', 'in', [uid]]]],
                {
                    fields: [
                        'titulo',
                        'mensaje',
                        'fecha',
                        'hora',
                        'tipo',
                        'lugar',
                        'fecha_cierre',
                        'creado_por',
                        'curso_id',
                        'tipo_destinatario'
                    ],
                    order: 'fecha desc, hora desc'
                }
            );
            
            // También obtenemos las notificaciones generales según el rol
            let roleDomain = [];
            switch (role) {
                case 'student':
                    roleDomain = [['tipo_destinatario', 'in', ['todos', 'estudiantes']]];
                    break;
                case 'teacher':
                    roleDomain = [['tipo_destinatario', 'in', ['todos', 'profesores']]];
                    break;
                case 'tutor':
                    roleDomain = [['tipo_destinatario', 'in', ['todos', 'tutores']]];
                    break;
                case 'admin':
                    roleDomain = []; // Ver todas
                    break;
                default:
                    roleDomain = [['tipo_destinatario', '=', 'todos']];
            }

            if (roleDomain.length > 0) {
                const roleNotifications = await odooService.execute(
                    uid,
                    password,
                    'colegio.notificacion',
                    'search_read',
                    [roleDomain],
                    {
                        fields: [
                            'titulo',
                            'mensaje',
                            'fecha',
                            'hora',
                            'tipo',
                            'lugar',
                            'fecha_cierre',
                            'creado_por',
                            'curso_id',
                            'tipo_destinatario'
                        ],
                        order: 'fecha desc, hora desc'
                    }
                );
                notifications = [...notifications, ...roleNotifications];
            }

        } catch (error) {
            console.error('Error al obtener notificaciones específicas:', error);
            // Continuamos con las notificaciones generales
        }

        // Eliminar duplicados si los hay
        notifications = Array.from(new Set(notifications.map(n => n.id)))
            .map(id => notifications.find(n => n.id === id));

        // Ordenar por fecha y hora
        notifications.sort((a, b) => {
            const dateA = new Date(a.fecha + ' ' + (a.hora || '00:00'));
            const dateB = new Date(b.fecha + ' ' + (b.hora || '00:00'));
            return dateB - dateA;
        });

        // Obtener estado de lectura para cada notificación
        const notificationsWithReadStatus = await Promise.all(
            notifications.map(async (notif) => {
                try {
                    const lecturas = await odooService.execute(
                        uid,
                        password,
                        'colegio.lectura',
                        'search_read',
                        [[
                            ['notificacion_id', '=', notif.id],
                            ['user_id', '=', uid]
                        ]],
                        { fields: ['estado'] }
                    );

                    return {
                        ...notif,
                        estado: lecturas.length > 0 ? lecturas[0].estado : 'No leído'
                    };
                } catch (error) {
                    return {
                        ...notif,
                        estado: 'No leído'
                    };
                }
            })
        );

        res.json({
            role,
            total: notificationsWithReadStatus.length,
            notifications: notificationsWithReadStatus
        });

    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            message: 'Error al obtener notificaciones',
            error: error.message
        });
    }
});

// Marcar notificación como leída
router.post('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const notificationId = parseInt(req.params.id);

        // Verificar si ya existe una lectura
        const lecturas = await odooService.execute(
            uid,
            password,
            'colegio.lectura',
            'search_read',
            [[
                ['notificacion_id', '=', notificationId],
                ['user_id', '=', uid]
            ]]
        );

        if (lecturas.length > 0) {
            // Actualizar lectura existente
            await odooService.execute(
                uid,
                password,
                'colegio.lectura',
                'write',
                [[lecturas[0].id], { estado: 'Leído' }]
            );
        } else {
            // Crear nueva lectura
            await odooService.execute(
                uid,
                password,
                'colegio.lectura',
                'create',
                [{
                    notificacion_id: notificationId,
                    user_id: uid,
                    estado: 'Leído'
                }]
            );
        }

        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({
            message: 'Error al marcar notificación',
            error: error.message
        });
    }
});

export default router;