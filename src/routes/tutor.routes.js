import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';

const router = express.Router();

router.get('/children/:childId/tasks', authMiddleware, async (req, res) => {
  try {
    const { uid, password } = req.user;
    const { childId } = req.params;

    // Verificar que el niño pertenece al tutor
    const students = await odooService.executeKw(
      uid,
      password,
      'school.student',
      'search_read',
      [[
        ['id', '=', parseInt(childId)],
        ['parent_id', '=', uid]
      ]]
    );

    if (!students.length) {
      return res.status(404).json({ message: 'Child not found' });
    }

    const tasks = await odooService.executeKw(
      uid,
      password,
      'school.task',
      'search_read',
      [[['student_ids', 'in', [parseInt(childId)]]]]
    );

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;