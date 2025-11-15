import {
  PutCommand,
  GetCommand,
  ScanCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../config/aws';
import { Event } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function createEvent(data: {
  eventTypeId: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  coverImageUrl?: string;
}): Promise<Event> {
  const event: Event = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.EVENTS,
      Item: event,
    })
  );

  return event;
}

export async function getEvent(id: string): Promise<Event | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.EVENTS,
      Key: { id },
    })
  );

  return (result.Item as Event) || null;
}

export async function listEvents(): Promise<Event[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.EVENTS,
    })
  );

  return (result.Items as Event[]) || [];
}

export async function listEventsByType(eventTypeId: string): Promise<Event[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.EVENTS,
      IndexName: 'EventTypeIndex',
      KeyConditionExpression: 'eventTypeId = :eventTypeId',
      ExpressionAttributeValues: {
        ':eventTypeId': eventTypeId,
      },
    })
  );

  return (result.Items as Event[]) || [];
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'createdAt'>>
): Promise<Event | null> {
  const existingEvent = await getEvent(id);
  if (!existingEvent) return null;

  const updatedEvent = {
    ...existingEvent,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.EVENTS,
      Item: updatedEvent,
    })
  );

  return updatedEvent;
}
