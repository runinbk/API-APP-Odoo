import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import config from './config/config.js';
import studentModelRoutes from './model/student.model.routes.js'; 
import tutorModelRoutes from './model/tutor.model.routes.js';
import cursoModelRoutes from './model/curso.model.routes.js';
import gestionModelRoutes from './model/gestion.model.routes.js';
import materiaModelRoutes from './model/materia.model.routes.js';
import profesorModelRoutes from './model/profesor.model.routes.js';
import administrativoModelRoutes from './model/administrativo.model.routes.js';
import asignacionModelRoutes from './model/asignacion.model.routes.js';
import notificacionModelRoutes from './model/notificacion.model.routes.js';
import notificationEnhancedRoutes from './routes/notification.enhanced.routes.js';
import teacherEnhancedRoutes from './routes/teacher.enhanced.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Models Routes
app.use('/api/alumnos', studentModelRoutes);
app.use('/api/tutores', tutorModelRoutes);
app.use('/api/cursos', cursoModelRoutes);
app.use('/api/gestiones', gestionModelRoutes);
app.use('/api/materias', materiaModelRoutes);
app.use('/api/profesores', profesorModelRoutes);
app.use('/api/administrativos', administrativoModelRoutes);
app.use('/api/asignaciones', asignacionModelRoutes);
app.use('/api/notificaciones', notificacionModelRoutes);

// Rutas para consumo de la App
app.use('/api/enhanced-notifications', notificationEnhancedRoutes);
app.use('/api/teacher', teacherEnhancedRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});