import { Router } from 'express';
import { adminAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as adminController from '../controllers/adminController';
import * as eventTypeController from '../controllers/eventTypeController';
import * as eventController from '../controllers/eventController';
import * as imageController from '../controllers/imageController';
import * as bookingController from '../controllers/bookingController';

const router = Router();

// ============================================
// AUTHENTICATION ROUTES (No auth required)
// ============================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 * @payload {
 *   "username": "admin",
 *   "password": "admin123"
 * }
 * @response {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "sessionToken": "uuid-token",
 *     "apiKey": "your-api-key",
 *     "username": "admin",
 *     "expiresIn": "24h"
 *   }
 * }
 */
router.post('/login', adminController.login);

// ============================================
// PROTECTED ADMIN ROUTES (Auth required)
// ============================================

// All routes below require authentication
router.use(adminAuth);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout
 * @access  Protected
 * @headers x-api-key: your-api-key
 * @response {
 *   "success": true,
 *   "message": "Logout successful"
 * }
 */
router.post('/logout', adminController.logout);

/**
 * @route   GET /api/admin/verify
 * @desc    Verify admin session
 * @access  Protected
 * @headers x-api-key: your-api-key
 * @response {
 *   "success": true,
 *   "message": "Session is valid",
 *   "data": {
 *     "authenticated": true,
 *     "timestamp": "2025-11-15T..."
 *   }
 * }
 */
router.get('/verify', adminController.verifySession);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get dashboard statistics
 * @access  Protected
 * @headers x-api-key: your-api-key
 * @response {
 *   "success": true,
 *   "data": {
 *     "totalEvents": 10,
 *     "totalEventTypes": 5,
 *     "totalImages": 150,
 *     "totalBookings": 25,
 *     "pendingBookings": 5,
 *     "confirmedBookings": 20
 *   }
 * }
 */
router.get('/dashboard', adminController.getDashboardStats);

// ============================================
// EVENT TYPES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/event-types
 * @desc    Get all event types
 * @access  Protected
 */
router.get('/event-types', eventTypeController.listEventTypes);

/**
 * @route   GET /api/admin/event-types/:id
 * @desc    Get event type by ID
 * @access  Protected
 */
router.get('/event-types/:id', eventTypeController.getEventType);

/**
 * @route   POST /api/admin/event-types
 * @desc    Create new event type
 * @access  Protected
 * @payload {
 *   "name": "Wedding Photography",
 *   "description": "Professional wedding photography services"
 * }
 * @response {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "name": "Wedding Photography",
 *     "description": "Professional wedding photography services",
 *     "createdAt": "2025-11-15T...",
 *     "updatedAt": "2025-11-15T..."
 *   }
 * }
 */
router.post('/event-types', eventTypeController.createEventType);

/**
 * @route   PUT /api/admin/event-types/:id
 * @desc    Update event type
 * @access  Protected
 * @payload {
 *   "name": "Updated Name",
 *   "description": "Updated description"
 * }
 * @note    Update functionality needs to be added to controller
 */
// router.put('/event-types/:id', eventTypeController.updateEventType);

/**
 * @route   DELETE /api/admin/event-types/:id
 * @desc    Delete event type
 * @access  Protected
 * @response {
 *   "success": true,
 *   "message": "Event type deleted successfully"
 * }
 * @note    Delete functionality needs to be added to controller
 */
// router.delete('/event-types/:id', eventTypeController.deleteEventType);

// ============================================
// EVENTS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/events
 * @desc    Get all events
 * @access  Protected
 * @query   ?eventTypeId=uuid (optional)
 */
router.get('/events', eventController.listEvents);

/**
 * @route   GET /api/admin/events/:id
 * @desc    Get event by ID
 * @access  Protected
 */
router.get('/events/:id', eventController.getEvent);

/**
 * @route   POST /api/admin/events
 * @desc    Create new event
 * @access  Protected
 * @payload {
 *   "eventTypeId": "uuid",
 *   "name": "John & Jane Wedding",
 *   "description": "Beautiful wedding ceremony",
 *   "date": "2025-12-25",
 *   "location": "Central Park, NY",
 *   "coverImageUrl": "https://..."
 * }
 * @response {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "eventTypeId": "uuid",
 *     "name": "John & Jane Wedding",
 *     "description": "Beautiful wedding ceremony",
 *     "date": "2025-12-25",
 *     "location": "Central Park, NY",
 *     "coverImageUrl": "https://...",
 *     "createdAt": "2025-11-15T...",
 *     "updatedAt": "2025-11-15T..."
 *   }
 * }
 */
router.post('/events', eventController.createEvent);

/**
 * @route   PUT /api/admin/events/:id
 * @desc    Update event
 * @access  Protected
 */
router.put('/events/:id', eventController.updateEvent);

/**
 * @route   DELETE /api/admin/events/:id
 * @desc    Delete event
 * @access  Protected
 * @note    Delete functionality needs to be added to controller
 */
// router.delete('/events/:id', eventController.deleteEvent);

// ============================================
// IMAGES MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/events/:eventId/images
 * @desc    Get all images for an event
 * @access  Protected
 */
router.get('/events/:eventId/images', imageController.listImagesByEvent);

/**
 * @route   POST /api/admin/events/:eventId/images
 * @desc    Upload single or multiple images to event
 * @access  Protected
 * @content multipart/form-data
 * @field   images (file or multiple files)
 * @field   description (optional string)
 * @response {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "eventId": "uuid",
 *     "s3Key": "events/uuid/filename.jpg",
 *     "filename": "filename.jpg",
 *     "contentType": "image/jpeg",
 *     "size": 1024000,
 *     "description": "Optional description",
 *     "uploadedAt": "2025-11-15T..."
 *   }
 * }
 */
router.post('/events/:eventId/images', upload.array('images', 10), imageController.uploadImages);

/**
 * @route   POST /api/admin/bulk-upload
 * @desc    Bulk upload multiple images
 * @access  Protected
 * @content multipart/form-data
 * @field   images (multiple files)
 * @field   eventId (string)
 * @response {
 *   "success": true,
 *   "message": "Successfully uploaded 10 files",
 *   "data": {
 *     "uploaded": 10,
 *     "files": [...]
 *   }
 * }
 */
router.post('/bulk-upload', upload.array('images', 50), adminController.bulkUpload);

/**
 * @route   DELETE /api/admin/images/:id
 * @desc    Delete image
 * @access  Protected
 * @note    Delete functionality needs to be added to controller
 */
// router.delete('/images/:id', imageController.deleteImage);

// ============================================
// BOOKINGS MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/bookings
 * @desc    Get all bookings
 * @access  Protected
 * @query   ?eventTypeId=uuid (optional)
 */
router.get('/bookings', bookingController.listBookings);

/**
 * @route   GET /api/admin/bookings/:id
 * @desc    Get booking by ID
 * @access  Protected
 * @note    Get by ID functionality needs to be added to controller
 */
// router.get('/bookings/:id', bookingController.getBookingById);

/**
 * @route   PUT /api/admin/bookings/:id
 * @desc    Update booking status
 * @access  Protected
 * @payload {
 *   "status": "confirmed"
 * }
 * @response {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "status": "confirmed",
 *     "updatedAt": "2025-11-15T..."
 *   }
 * }
 * @note    Update functionality needs to be added to controller
 */
// router.put('/bookings/:id', bookingController.updateBooking);

/**
 * @route   DELETE /api/admin/bookings/:id
 * @desc    Delete booking
 * @access  Protected
 * @note    Delete functionality needs to be added to controller
 */
// router.delete('/bookings/:id', bookingController.deleteBooking);

export default router;
