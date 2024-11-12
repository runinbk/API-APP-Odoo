import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

// GET - Obtener todo el personal administrativo
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        
        const administrativos = await odooService.executeKw(
            uid,
            password,
            'colegio.administrativo',
            'search_read',
            [[]],
            {
                fields: ['cargo', 'user_id']
            }
        );
        
        res.json(administrativos);
    } catch (error) {
        console.error('Error fetching administrativos:', error);
        res.status(500).json({ 
            message: 'Error al obtener personal administrativo',
            error: error.message 
        });
    }
});

// POST - Crear nuevo personal administrativo
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { uid, password } = req.user;
        const { cargo, user_id } = req.body;
        
        if (!cargo || !user_id) {
            return res.status(400).json({ 
                message: 'Cargo y usuario son requeridos' 
            });
        }
        
        const administrativoId = await odooService.executeKw(
            uid,
            password,
            'colegio.administrativo',
            'create',
            [{
                cargo,
                user_id
            }]
        );
        
        res.status(201).json({ 
            message: 'Personal administrativo creado exitosamente',
            id: administrativoId 
        });
    } catch (error) {
        console.error('Error creating administrativo:', error);
        res.status(500).json({ 
            message: 'Error al crear personal administrativo',
            error: error.message 
        });
    }
});

// Endpoints GET /:id, PUT, DELETE similares a los anteriores...
export default router;