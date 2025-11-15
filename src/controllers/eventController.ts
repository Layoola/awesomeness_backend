import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/eventService';

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventTypeId, name, description, date, location, coverImageUrl } = req.body;

    if (!eventTypeId || !name || !description || !date) {
      return res
        .status(400)
        .json({ error: 'eventTypeId, name, description, and date are required' });
    }

    const event = await eventService.createEvent({
      eventTypeId,
      name,
      description,
      date,
      location,
      coverImageUrl,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const event = await eventService.getEvent(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
}

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventTypeId } = req.query;

    if (eventTypeId) {
      const events = await eventService.listEventsByType(eventTypeId as string);
      return res.json(events);
    }

    const events = await eventService.listEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await eventService.updateEvent(id, updates);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
}
