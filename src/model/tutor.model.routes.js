import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todos los tutores
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const tutores = await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'search_read',
            [[]],
            {
                fields: ['parentesco', 'user_id', 'alumno_ids', '_tutor_rec']
            }
        );
        
        // Para cada tutor, obtener los detalles de sus alumnos
        const tutoresConAlumnos = await Promise.all(tutores.map(async (tutor) => {
            if (tutor.alumno_ids && tutor.alumno_ids.length > 0) {
                const alumnos = await odooService.executeKw(
                    uid,
                    password,
                    'colegio.alumno',
                    'search_read',
                    [[['id', 'in', tutor.alumno_ids]]],
                    {
                        fields: ['user_id', 'edad', 'grado']
                    }
                );
                return { ...tutor, alumnos };
            }
            return { ...tutor, alumnos: [] };
        }));
        
        res.json(tutoresConAlumnos);
    } catch (error) {
        console.error('Error fetching tutors:', error);
        res.status(500).json({ 
            message: 'Error al obtener tutores',
            error: error.message 
        });
    }
});

// GET - Obtener un tutor específico por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const tutorId = parseInt(req.params.id);
        
        const tutor = await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'search_read',
            [[['id', '=', tutorId]]],
            {
                fields: ['parentesco', 'user_id', 'alumno_ids', '_tutor_rec']
            }
        );
        
        if (!tutor.length) {
            return res.status(404).json({ message: 'Tutor no encontrado' });
        }
        
        // Obtener detalles de los alumnos asociados
        if (tutor[0].alumno_ids && tutor[0].alumno_ids.length > 0) {
            const alumnos = await odooService.executeKw(
                uid,
                password,
                'colegio.alumno',
                'search_read',
                [[['id', 'in', tutor[0].alumno_ids]]],
                {
                    fields: ['user_id', 'edad', 'grado']
                }
            );
            tutor[0].alumnos = alumnos;
        } else {
            tutor[0].alumnos = [];
        }
        
        res.json(tutor[0]);
    } catch (error) {
        console.error('Error fetching tutor:', error);
        res.status(500).json({ 
            message: 'Error al obtener tutor',
            error: error.message 
        });
    }
});

// POST - Crear un nuevo tutor
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { parentesco, user_id } = req.body;
        
        // Validar datos requeridos
        if (!parentesco || !user_id) {
            return res.status(400).json({ 
                message: 'Parentesco y usuario son requeridos' 
            });
        }
        
        const tutorId = await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'create',
            [{
                parentesco,
                user_id
            }]
        );
        
        res.status(201).json({ 
            message: 'Tutor creado exitosamente',
            id: tutorId 
        });
    } catch (error) {
        console.error('Error creating tutor:', error);
        res.status(500).json({ 
            message: 'Error al crear tutor',
            error: error.message 
        });
    }
});

// PUT - Actualizar un tutor existente
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const tutorId = parseInt(req.params.id);
        const { parentesco, user_id } = req.body;
        
        // Verificar si el tutor existe
        const tutorExists = await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'search_count',
            [[['id', '=', tutorId]]]
        );
        
        if (!tutorExists) {
            return res.status(404).json({ message: 'Tutor no encontrado' });
        }
        
        // Actualizar tutor
        await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'write',
            [[tutorId], {
                parentesco,
                user_id
            }]
        );
        
        res.json({ message: 'Tutor actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating tutor:', error);
        res.status(500).json({ 
            message: 'Error al actualizar tutor',
            error: error.message 
        });
    }
});

// DELETE - Eliminar un tutor
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const tutorId = parseInt(req.params.id);
        
        // Verificar si el tutor existe y no tiene alumnos asociados
        const tutor = await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'search_read',
            [[['id', '=', tutorId]]],
            {
                fields: ['alumno_ids']
            }
        );
        
        if (!tutor.length) {
            return res.status(404).json({ message: 'Tutor no encontrado' });
        }
        
        if (tutor[0].alumno_ids && tutor[0].alumno_ids.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el tutor porque tiene alumnos asociados' 
            });
        }
        
        // Eliminar tutor
        await odooService.executeKw(
            uid,
            password,
            'colegio.tutor',
            'unlink',
            [[tutorId]]
        );
        
        res.json({ message: 'Tutor eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting tutor:', error);
        res.status(500).json({ 
            message: 'Error al eliminar tutor',
            error: error.message 
        });
    }
});

export default router;