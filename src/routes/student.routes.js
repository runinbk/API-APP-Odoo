import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const { uid, password } = req.user;
    
    const tasks = await odooService.executeKw(
      uid,
      password,
      'school.task',
      'search_read',
      [[['student_ids', 'in', [uid]]]]
    );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;