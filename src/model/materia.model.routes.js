import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todas las materias
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const materias = await odooService.executeKw(
            uid,
            password,
            'colegio.materia',
            'search_read',
            [[]],
            {
                fields: ['nombre', 'descripcion', 'asignacion_ids']
            }
        );
        
        // Obtener asignaciones para cada materia
        const materiasCompletas = await Promise.all(materias.map(async (materia) => {
            if (materia.asignacion_ids && materia.asignacion_ids.length > 0) {
                const asignaciones = await odooService.executeKw(
                    uid,
                    password,
                    'colegio.asignacion',
                    'search_read',
                    [[['id', 'in', materia.asignacion_ids]]],
                    { fields: ['profesor_id', 'curso_id'] }
                );
                return { ...materia, asignaciones };
            }
            return { ...materia, asignaciones: [] };
        }));
        
        res.json(materiasCompletas);
    } catch (error) {
        console.error('Error fetching materias:', error);
        res.status(500).json({ 
            message: 'Error al obtener materias',
            error: error.message 
        });
    }
});

// POST - Crear una nueva materia
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { nombre, descripcion } = req.body;
        
        if (!nombre || !descripcion) {
            return res.status(400).json({ 
                message: 'Nombre y descripción son requeridos' 
            });
        }
        
        const materiaId = await odooService.executeKw(
            uid,
            password,
            'colegio.materia',
            'create',
            [{
                nombre,
                descripcion
            }]
        );
        
        res.status(201).json({ 
            message: 'Materia creada exitosamente',
            id: materiaId 
        });
    } catch (error) {
        console.error('Error creating materia:', error);
        res.status(500).json({ 
            message: 'Error al crear materia',
            error: error.message 
        });
    }
});

// Resto de endpoints similares...
export default router;