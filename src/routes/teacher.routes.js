import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import odooService from '../services/odooService.js';
import openaiService from '../services/openaiService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/transcribe-audio', 
  authMiddleware, 
  upload.single('audio'),
  async (req, res) => {
    try {
      const transcript = await openaiService.transcribeAudio(req.file.buffer);
      const suggestedTask = await openaiService.generateTask(transcript);
      
      res.json({
        transcript,
        suggestedTask
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, studentIds, dueDate } = req.body;
    const { uid, password } = req.user;

    const taskId = await odooService.executeKw(
      uid,
      password,
      'school.task',
      'create',
      [{
        name: title,
        description: description,
        student_ids: [[6, 0, studentIds]],
        due_date: dueDate
      }]
    );

    res.json({ taskId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;