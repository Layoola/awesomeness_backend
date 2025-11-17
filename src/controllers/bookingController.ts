import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/bookingService';

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      eventTypeId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventLocation,
      message,
    } = req.body;

    if (!eventTypeId || !customerName || !customerEmail || !customerPhone || !eventDate) {
      return res.status(400).json({
        error: 'eventTypeId, customerName, customerEmail, customerPhone, and eventDate are required',
      });
    }

    const booking = await bookingService.createBooking({
      eventTypeId,
      customerName,
      customerEmail,
      customerPhone,
      eventDate,
      eventLocation,
      message,
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventTypeId } = req.query;

    if (eventTypeId) {
      const bookings = await bookingService.listBookingsByEventType(eventTypeId as string);
      console.log("bookings listing by event type----------------", bookings)
      return res.json(bookings);
    }

    const bookings = await bookingService.listBookings();
    console.log("bookings listing----------------", bookings)
    res.json(bookings);
  } catch (error) {
    next(error);
  }
}
