import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todos los alumnos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const alumnos = await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'search_read',
            [[]],  // Dominio vacío para traer todos
            {
                fields: ['user_id', 'edad', 'tutor_id', 'grado']
            }
        );
        
        res.json(alumnos);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            message: 'Error al obtener alumnos',
            error: error.message 
        });
    }
});

// GET - Obtener un alumno específico por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const alumnoId = parseInt(req.params.id);
        
        const alumno = await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'search_read',
            [[['id', '=', alumnoId]]],
            {
                fields: ['user_id', 'edad', 'tutor_id', 'grado']
            }
        );
        
        if (!alumno.length) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }
        
        res.json(alumno[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ 
            message: 'Error al obtener alumno',
            error: error.message 
        });
    }
});

// POST - Crear un nuevo alumno
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { user_id, edad, tutor_id, grado } = req.body;
        
        // Validar datos requeridos
        if (!user_id || !edad) {
            return res.status(400).json({ message: 'Usuario y edad son requeridos' });
        }
        
        const alumnoId = await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'create',
            [{
                user_id,
                edad,
                tutor_id,
                grado
            }]
        );
        
        res.status(201).json({ 
            message: 'Alumno creado exitosamente',
            id: alumnoId 
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ 
            message: 'Error al crear alumno',
            error: error.message 
        });
    }
});

// PUT - Actualizar un alumno existente
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const alumnoId = parseInt(req.params.id);
        const { user_id, edad, tutor_id, grado } = req.body;
        
        // Verificar si el alumno existe
        const alumnoExists = await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'search_count',
            [[['id', '=', alumnoId]]]
        );
        
        if (!alumnoExists) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }
        
        // Actualizar alumno
        await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'write',
            [[alumnoId], {
                user_id,
                edad,
                tutor_id,
                grado
            }]
        );
        
        res.json({ message: 'Alumno actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ 
            message: 'Error al actualizar alumno',
            error: error.message 
        });
    }
});

// DELETE - Eliminar un alumno
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const alumnoId = parseInt(req.params.id);
        
        // Verificar si el alumno existe
        const alumnoExists = await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'search_count',
            [[['id', '=', alumnoId]]]
        );
        
        if (!alumnoExists) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }
        
        // Eliminar alumno
        await odooService.executeKw(
            uid,
            password,
            'colegio.alumno',
            'unlink',
            [[alumnoId]]
        );
        
        res.json({ message: 'Alumno eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ 
            message: 'Error al eliminar alumno',
            error: error.message 
        });
    }
});

export default router;