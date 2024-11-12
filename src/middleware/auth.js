// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Obtener el header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    // Verificar que el formato sea "Bearer token"
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid authorization format' });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;

    // Para debug
    console.log('Token decodificado:', decoded);
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};