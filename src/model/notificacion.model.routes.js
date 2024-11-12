import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todas las notificaciones
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const notificaciones = await odooService.executeKw(
            uid,
            password,
            'colegio.notificacion',
            'search_read',
            [[]],
            {
                fields: [
                    'titulo', 'mensaje', 'fecha', 'hora', 'tipo',
                    'lugar', 'fecha_cierre', 'user_ids', 'attachment_ids',
                    'creado_por', 'tipo_destinatario', 'curso_id'
                ]
            }
        );
        
        // Obtener lecturas para cada notificación
        const notificacionesCompletas = await Promise.all(notificaciones.map(async (notificacion) => {
            const lecturas = await odooService.executeKw(
                uid,
                password,
                'colegio.lectura',
                'search_read',
                [[['notificacion_id', '=', notificacion.id]]],
                { fields: ['user_id', 'estado'] }
            );
            
            return {
                ...notificacion,
                lecturas
            };
        }));
        
        res.json(notificacionesCompletas);
    } catch (error) {
        console.error('Error fetching notificaciones:', error);
        res.status(500).json({ 
            message: 'Error al obtener notificaciones',
            error: error.message 
        });
    }
});

// GET - Obtener notificaciones para un usuario específico
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const lecturas = await odooService.executeKw(
            uid,
            password,
            'colegio.lectura',
            'search_read',
            [[['user_id', '=', uid]]],
            { fields: ['notificacion_id', 'estado'] }
        );
        
        // Obtener detalles de las notificaciones
        const notificaciones = await Promise.all(lecturas.map(async (lectura) => {
            const notificacion = await odooService.executeKw(
                uid,
                password,
                'colegio.notificacion',
                'read',
                [[lectura.notificacion_id[0]]],
                {
                    fields: [
                        'titulo', 'mensaje', 'fecha', 'hora',
                        'tipo', 'lugar', 'fecha_cierre'
                    ]
                }
            );
            
            return {
                ...notificacion[0],
                estado_lectura: lectura.estado
            };
        }));
        
        res.json(notificaciones);
    } catch (error) {
        console.error('Error fetching user notifications:', error);
        res.status(500).json({ 
            message: 'Error al obtener notificaciones del usuario',
            error: error.message 
        });
    }
});

// POST - Crear nueva notificación
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const {
            titulo,
            mensaje,
            fecha,
            hora,
            tipo,
            lugar,
            fecha_cierre,
            tipo_destinatario,
            curso_id,
            user_ids
        } = req.body;
        
        if (!titulo || !tipo_destinatario) {
            return res.status(400).json({ 
                message: 'Título y tipo de destinatario son requeridos' 
            });
        }
        
        // Validar destinatarios según el tipo
        if (tipo_destinatario === 'curso' && !curso_id) {
            return res.status(400).json({ 
                message: 'Curso es requerido para notificaciones de tipo curso' 
            });
        }
        
        if (tipo_destinatario === 'especifico' && (!user_ids || !user_ids.length)) {
            return res.status(400).json({ 
                message: 'Usuarios son requeridos para notificaciones específicas' 
            });
        }
        
        const notificacionId = await odooService.executeKw(
            uid,
            password,
            'colegio.notificacion',
            'create',
            [{
                titulo,
                mensaje,
                fecha,
                hora,
                tipo,
                lugar,
                fecha_cierre,
                tipo_destinatario,
                curso_id,
                user_ids: user_ids ? [[6, 0, user_ids]] : false,
                creado_por: uid
            }]
        );
        
        res.status(201).json({ 
            message: 'Notificación creada exitosamente',
            id: notificacionId 
        });
    } catch (error) {
        console.error('Error creating notificacion:', error);
        res.status(500).json({ 
            message: 'Error al crear notificación',
            error: error.message 
        });
    }
});

// PUT - Marcar notificación como leída
router.put('/read/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const notificacionId = parseInt(req.params.id);
        
        // Buscar la lectura correspondiente
        const lecturas = await odooService.executeKw(
            uid,
            password,
            'colegio.lectura',
            'search_read',
            [[
                ['notificacion_id', '=', notificacionId],
                ['user_id', '=', uid]
            ]]
        );
        
        if (!lecturas.length) {
            return res.status(404).json({ 
                message: 'Notificación no encontrada' 
            });
        }
        
        // Actualizar estado de lectura
        await odooService.executeKw(
            uid,
            password,
            'colegio.lectura',
            'write',
            [[lecturas[0].id], {
                estado: 'Leído'
            }]
        );
        
        res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            message: 'Error al marcar notificación como leída',
            error: error.message 
        });
    }
});

// DELETE y otros endpoints similares...
export default router;