import express from 'express';
import jwt from 'jsonwebtoken';
import odooService from '../services/odooService.js';
import config from '../config/config.js';

const router = express.Router();

// Helper para obtener rol y datos del usuario
const getUserDetails = async (uid, password) => {
    try {
        // Buscar en cada modelo de rol y obtener datos específicos
        const [
            profesorData,
            alumnoData,
            tutorData,
            administrativoData
        ] = await Promise.all([
            odooService.executeKw(uid, password, 'colegio.profesor', 'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['especialidad', 'asignacion_ids'] }
            ),
            odooService.executeKw(uid, password, 'colegio.alumno', 'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['edad', 'grado', 'tutor_id'] }
            ),
            odooService.executeKw(uid, password, 'colegio.tutor', 'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['parentesco', 'alumno_ids'] }
            ),
            odooService.executeKw(uid, password, 'colegio.administrativo', 'search_read',
                [[['user_id', '=', uid]]],
                { fields: ['cargo'] }
            )
        ]);

        // Obtener datos del usuario de res.users
        const userData = await odooService.executeKw(uid, password, 'res.users', 'read',
            [uid],
            { fields: ['name', 'email', 'login'] }
        );

        let role = 'user';
        let extraData = {};

        if (profesorData.length > 0) {
            role = 'profesor';
            extraData = profesorData[0];
        } else if (alumnoData.length > 0) {
            role = 'alumno';
            extraData = alumnoData[0];
        } else if (tutorData.length > 0) {
            role = 'tutor';
            extraData = tutorData[0];
        } else if (administrativoData.length > 0) {
            role = 'administrativo';
            extraData = administrativoData[0];
        }

        return {
            ...userData[0],
            role,
            ...extraData
        };
    } catch (error) {
        throw error;
    }
};

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const uid = await odooService.authenticate(username, password);
        
        // Obtener detalles completos del usuario
        const userDetails = await getUserDetails(uid, password);
        
        const token = jwt.sign(
            { 
                uid,
                username,
                password,
                role: userDetails.role
            },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({ 
            token,
            uid,
            user: userDetails
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ 
            message: 'Authentication failed',
            error: error.message 
        });
    }
});

export default router;