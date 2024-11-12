import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todas las gestiones
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const gestiones = await odooService.executeKw(
            uid,
            password,
            'colegio.gestion',
            'search_read',
            [[]],
            {
                fields: ['nombre', 'fecha_inicio', 'fecha_fin', 'asignacion_ids']
            }
        );
        
        // Obtener asignaciones para cada gestión
        const gestionesCompletas = await Promise.all(gestiones.map(async (gestion) => {
            const asignaciones = await odooService.executeKw(
                uid,
                password,
                'colegio.asignacion',
                'search_read',
                [[['id', 'in', gestion.asignacion_ids || []]]],
                { fields: ['profesor_id', 'materia_id', 'curso_id'] }
            );
            
            return {
                ...gestion,
                asignaciones
            };
        }));
        
        res.json(gestionesCompletas);
    } catch (error) {
        console.error('Error fetching gestiones:', error);
        res.status(500).json({ 
            message: 'Error al obtener gestiones',
            error: error.message 
        });
    }
});

// Resto de endpoints similares...
export default router;