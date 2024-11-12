import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import tutorRoutes from './routes/tutor.routes.js';
import config from './config/config.js';
import studentModelRoutes from './model/student.model.routes.js'; 
import tutorModelRoutes from './model/tutor.model.routes.js';
import cursoModelRoutes from './routes/curso.model.routes.js';
import gestionModelRoutes from './routes/gestion.model.routes.js';
import materiaModelRoutes from './routes/materia.model.routes.js';
import profesorModelRoutes from './routes/profesor.model.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutors', tutorRoutes);

// Models Routes
app.use('/api/alumnos', studentModelRoutes);
app.use('/api/tutores', tutorModelRoutes);
app.use('/api/cursos', cursoModelRoutes);
app.use('/api/gestiones', gestionModelRoutes);
app.use('/api/materias', materiaModelRoutes);
app.use('/api/profesores', profesorModelRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});