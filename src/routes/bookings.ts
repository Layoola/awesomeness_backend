import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { adminAuth } from '../middleware/auth';

const router = Router();

// Public route - anyone can create bookings
router.post('/', bookingController.createBooking);

// Admin route - view all bookings
router.get('/', adminAuth, bookingController.listBookings);

export default router;
