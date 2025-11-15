import { Router } from 'express';
import healthRouter from './health';
import eventTypesRouter from './eventTypes';
import eventsRouter from './events';
import imagesRouter from './images';
import bookingsRouter from './bookings';
import adminRouter from './admin';

const router = Router();

router.use('/health', healthRouter);
router.use('/admin', adminRouter);
router.use('/event-types', eventTypesRouter);
router.use('/events', eventsRouter);
router.use('/images', imagesRouter);
router.use('/bookings', bookingsRouter);

export default router;
