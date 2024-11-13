import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Importar rutas principales
import authRoutes from './routes/auth.routes.js';
import tutorRoutes from './model/tutor.model.routes.js';
import administrativoRoutes from './model/administrativo.model.routes.js';
import cursoRoutes from './model/curso.model.routes.js';
import materiaRoutes from './model/materia.model.routes.js';
import asignacionRoutes from './model/asignacion.model.routes.js';
import notificacionRoutes from './model/notificacion.model.routes.js';
import profesorRoutes from './model/profesor.model.routes.js';
import gestionRoutes from './model/gestion.model.routes.js';
import estudianteRoutes from './model/student.model.routes.js';

// Importar rutas para consumo del movil, IA y sincronización
import notifEnhancedRoutes from './routes/notification.enhanced.routes.js';
import teachEnhancedRoutes from './routes/teacher.enhanced.routes.js';
import teacherAIRoutes from './routes/teacher.ai.routes.js';
import syncRoutes from './routes/sync.routes.js';

// Importar servicios y middlewares
import { syncMiddleware } from './middleware/syncMiddleware.js';
import cacheService from './services/cacheService.js';
import config from './config/config.js';

// Configuración de la aplicación
const app = express();
dotenv.config();

// Middleware básico
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de carpeta de uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware global para caché y sincronización
app.use(syncMiddleware);

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/administrativos', administrativoRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/asignaciones', asignacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/profesor', profesorRoutes);
app.use('/api/gestion', gestionRoutes);
app.use('/api/estudiante', estudianteRoutes);

// Rutas de IA
app.use('/api/teacher-ai', teacherAIRoutes);

// Rutas de sincronización
app.use('/api/sync', syncRoutes);
app.use('/api/sync', syncRoutes);

// Rutas de consumo directo para el movil
app.use('/api/enhanced-notifications', notifEnhancedRoutes);
app.use('/api/teacher', teachEnhancedRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Algo salió mal!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Limpieza periódica de caché
setInterval(() => {
    cacheService.clearExpired();
}, 1800000); // Cada 30 minutos

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Entorno:', process.env.NODE_ENV);
    console.log('URL de Odoo:', config.odooConfig.baseUrl);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    // Limpiar recursos
    cacheService.clear();
    process.exit(0);
});

export default app;