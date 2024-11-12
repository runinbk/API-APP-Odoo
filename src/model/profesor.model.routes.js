import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todos los profesores
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const profesores = await odooService.executeKw(
            uid,
            password,
            'colegio.profesor',
            'search_read',
            [[]],
            {
                fields: ['especialidad', 'user_id', 'asignacion_ids']
            }
        );
        
        // Obtener información detallada de las asignaciones
        const profesoresCompletos = await Promise.all(profesores.map(async (profesor) => {
            if (profesor.asignacion_ids && profesor.asignacion_ids.length > 0) {
                const asignaciones = await odooService.executeKw(
                    uid,
                    password,
                    'colegio.asignacion',
                    'search_read',
                    [[['id', 'in', profesor.asignacion_ids]]],
                    { fields: ['materia_id', 'curso_id', 'gestion_id'] }
                );
                return { ...profesor, asignaciones };
            }
            return { ...profesor, asignaciones: [] };
        }));
        
        res.json(profesoresCompletos);
    } catch (error) {
        console.error('Error fetching profesores:', error);
        res.status(500).json({ 
            message: 'Error al obtener profesores',
            error: error.message 
        });
    }
});

// POST - Crear un nuevo profesor
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { especialidad, user_id } = req.body;
        
        if (!especialidad || !user_id) {
            return res.status(400).json({ 
                message: 'Especialidad y usuario son requeridos' 
            });
        }
        
        const profesorId = await odooService.executeKw(
            uid,
            password,
            'colegio.profesor',
            'create',
            [{
                especialidad,
                user_id
            }]
        );
        
        res.status(201).json({ 
            message: 'Profesor creado exitosamente',
            id: profesorId 
        });
    } catch (error) {
        console.error('Error creating profesor:', error);
        res.status(500).json({ 
            message: 'Error al crear profesor',
            error: error.message 
        });
    }
});

// Resto de endpoints similares...
export default router;