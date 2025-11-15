import { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Admin routes - protected
router.post('/', adminAuth, eventController.createEvent);
router.put('/:id', adminAuth, eventController.updateEvent);

// Public routes
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);

export default router;
