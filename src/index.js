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
import monitoringRoutes from './routes/monitoring.routes.js';

// Importar servicios y middlewares
import { syncMiddleware } from './middleware/syncMiddleware.js';
import cacheService from './services/cacheService.js';
import config from './config/config.js';

// Configuración de la aplicación
const app = express();
dotenv.config();

// Constantes de configuración
const CACHE_CLEANUP_INTERVAL = 1800000; // 30 minutos

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

// Rutas de consumo directo para el movil
app.use('/api/enhanced-notifications', notifEnhancedRoutes);
app.use('/api/teacher', teachEnhancedRoutes);

// Ruta de monitoreo
app.use('/api/monitoring', monitoringRoutes);

// Función de limpieza de caché con manejo de errores
const cleanupCache = () => {
    try {
        const stats = cacheService.getStats();
        console.log('Estadísticas de caché antes de limpieza:', stats);
        
        cacheService.clearExpired();
        
        const newStats = cacheService.getStats();
        console.log('Estadísticas de caché después de limpieza:', newStats);
    } catch (error) {
        console.error('Error durante la limpieza de caché:', error);
    }
};

// Programar limpieza periódica de caché
const cacheCleanupInterval = setInterval(cleanupCache, CACHE_CLEANUP_INTERVAL);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Algo salió mal!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log('Entorno:', process.env.NODE_ENV);
    console.log('URL de Odoo:', config.odooConfig.baseUrl);
    console.log('Limpieza de caché programada cada:', CACHE_CLEANUP_INTERVAL / 60000, 'minutos');
});

// Manejo de señales de terminación
const gracefulShutdown = () => {
    console.log('Iniciando apagado graceful...');
    
    // Limpiar intervalo de caché
    clearInterval(cacheCleanupInterval);
    
    // Limpiar caché
    try {
        cacheService.clear();
        console.log('Caché limpiada exitosamente');
    } catch (error) {
        console.error('Error limpiando caché:', error);
    }
    
    // Cerrar servidor
    server.close(() => {
        console.log('Servidor HTTP cerrado.');
        process.exit(0);
    });
    
    // Si el servidor no cierra en 10 segundos, forzar cierre
    setTimeout(() => {
        console.error('No se pudo cerrar limpiamente, forzando cierre');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;