import express from 'express';
import jwt from 'jsonwebtoken';
import odooService from '../services/odooService.js';
import config from '../config/config.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: 'Usuario y contraseña son requeridos'
            });
        }

        // Autenticar con Odoo
        const authResult = await odooService.authenticate(username, password);

        // Generar token JWT
        const token = jwt.sign(
            {
                uid: authResult.uid,
                username: authResult.login,
                name: authResult.name,
                email: authResult.email
            },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        // Devolver respuesta
        res.json({
            token,
            user: {
                uid: authResult.uid,
                username: authResult.login,
                name: authResult.name,
                email: authResult.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(401).json({
            message: 'Error de autenticación',
            error: error.message
        });
    }
});

// Endpoint para verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        res.json({
            valid: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            valid: false,
            message: 'Token inválido'
        });
    }
});

export default router;