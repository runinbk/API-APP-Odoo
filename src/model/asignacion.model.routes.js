import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todas las asignaciones
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const asignaciones = await odooService.executeKw(
            uid,
            password,
            'colegio.asignacion',
            'search_read',
            [[]],
            {
                fields: ['curso_id', 'materia_id', 'profesor_id', 'gestion_id']
            }
        );
        
        // Expandir la información de las relaciones
        const asignacionesCompletas = await Promise.all(asignaciones.map(async (asignacion) => {
            const [curso, materia, profesor, gestion] = await Promise.all([
                odooService.executeKw(
                    uid, password, 'colegio.curso', 'read',
                    [[asignacion.curso_id[0]]],
                    { fields: ['nombre', 'nivel'] }
                ),
                odooService.executeKw(
                    uid, password, 'colegio.materia', 'read',
                    [[asignacion.materia_id[0]]],
                    { fields: ['nombre'] }
                ),
                odooService.executeKw(
                    uid, password, 'colegio.profesor', 'read',
                    [[asignacion.profesor_id[0]]],
                    { fields: ['especialidad', 'user_id'] }
                ),
                asignacion.gestion_id ? odooService.executeKw(
                    uid, password, 'colegio.gestion', 'read',
                    [[asignacion.gestion_id[0]]],
                    { fields: ['nombre', 'fecha_inicio', 'fecha_fin'] }
                ) : null
            ]);

            return {
                ...asignacion,
                curso_detalle: curso[0],
                materia_detalle: materia[0],
                profesor_detalle: profesor[0],
                gestion_detalle: gestion ? gestion[0] : null
            };
        }));
        
        res.json(asignacionesCompletas);
    } catch (error) {
        console.error('Error fetching asignaciones:', error);
        res.status(500).json({ 
            message: 'Error al obtener asignaciones',
            error: error.message 
        });
    }
});

// POST - Crear nueva asignación
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { curso_id, materia_id, profesor_id, gestion_id } = req.body;
        
        if (!curso_id || !materia_id || !profesor_id) {
            return res.status(400).json({ 
                message: 'Curso, materia y profesor son requeridos' 
            });
        }
        
        const asignacionId = await odooService.executeKw(
            uid,
            password,
            'colegio.asignacion',
            'create',
            [{
                curso_id,
                materia_id,
                profesor_id,
                gestion_id
            }]
        );
        
        res.status(201).json({ 
            message: 'Asignación creada exitosamente',
            id: asignacionId 
        });
    } catch (error) {
        console.error('Error creating asignacion:', error);
        res.status(500).json({ 
            message: 'Error al crear asignación',
            error: error.message 
        });
    }
});

// Endpoints GET /:id, PUT, DELETE similares...
export default router;