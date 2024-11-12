// src/routes/auth.routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/auth.js';  // Añade esta línea
import odooService from '../services/odooService.js';
import config from '../config/config.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const uid = await odooService.authenticate(username, password);
    
    const token = jwt.sign(
      { 
        uid, 
        username,
        password
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Token generado:', token);

    res.json({ 
      token,
      uid,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Token válido',
    user: req.user 
  });
});

export default router;