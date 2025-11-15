import { Request, Response, NextFunction } from 'express';
import * as eventTypeService from '../services/eventTypeService';

export async function createEventType(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const eventType = await eventTypeService.createEventType(name, description);
    res.status(201).json(eventType);
  } catch (error) {
    next(error);
  }
}

export async function getEventType(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const eventType = await eventTypeService.getEventType(id);

    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    res.json(eventType);
  } catch (error) {
    next(error);
  }
}

export async function listEventTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const eventTypes = await eventTypeService.listEventTypes();
    res.json(eventTypes);
  } catch (error) {
    next(error);
  }
}
