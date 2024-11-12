import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todos los cursos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const cursos = await odooService.executeKw(
            uid,
            password,
            'colegio.curso',
            'search_read',
            [[]],
            {
                fields: ['nombre', 'nivel', 'alumno_ids', 'asignacion_ids', '_grado_name']
            }
        );
        
        // Obtener información detallada de alumnos y asignaciones
        const cursosCompletos = await Promise.all(cursos.map(async (curso) => {
            const [alumnos, asignaciones] = await Promise.all([
                // Obtener alumnos
                odooService.executeKw(
                    uid,
                    password,
                    'colegio.alumno',
                    'search_read',
                    [[['id', 'in', curso.alumno_ids || []]]],
                    { fields: ['user_id', 'edad'] }
                ),
                // Obtener asignaciones
                odooService.executeKw(
                    uid,
                    password,
                    'colegio.asignacion',
                    'search_read',
                    [[['id', 'in', curso.asignacion_ids || []]]],
                    { fields: ['profesor_id', 'materia_id'] }
                )
            ]);
            
            return {
                ...curso,
                alumnos,
                asignaciones
            };
        }));
        
        res.json(cursosCompletos);
    } catch (error) {
        console.error('Error fetching cursos:', error);
        res.status(500).json({ 
            message: 'Error al obtener cursos',
            error: error.message 
        });
    }
});

// POST - Crear un nuevo curso
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { nombre, nivel } = req.body;
        
        if (!nombre || !nivel) {
            return res.status(400).json({ 
                message: 'Nombre y nivel son requeridos' 
            });
        }
        
        const cursoId = await odooService.executeKw(
            uid,
            password,
            'colegio.curso',
            'create',
            [{
                nombre,
                nivel
            }]
        );
        
        res.status(201).json({ 
            message: 'Curso creado exitosamente',
            id: cursoId 
        });
    } catch (error) {
        console.error('Error creating curso:', error);
        res.status(500).json({ 
            message: 'Error al crear curso',
            error: error.message 
        });
    }
});

// Resto de endpoints (GET /:id, PUT, DELETE) similar a los anteriores...
export default router;