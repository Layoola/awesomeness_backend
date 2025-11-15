import { Router } from 'express';
import * as imageController from '../controllers/imageController';
import { adminAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Admin routes - protected
router.post('/', adminAuth, upload.array('images', 10), imageController.uploadImages);

// Public routes
router.get('/event/:eventId', imageController.listImagesByEvent);
router.get('/:id', imageController.getImage);

export default router;
