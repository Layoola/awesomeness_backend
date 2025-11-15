import { Router } from 'express';
import * as eventTypeController from '../controllers/eventTypeController';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Admin routes - protected
router.post('/', adminAuth, eventTypeController.createEventType);

// Public routes
router.get('/', eventTypeController.listEventTypes);
router.get('/:id', eventTypeController.getEventType);

export default router;
