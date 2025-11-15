import { PutCommand, GetCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../config/aws';
import { EventType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function createEventType(
  name: string,
  description: string
): Promise<EventType> {
  const eventType: EventType = {
    id: uuidv4(),
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.EVENT_TYPES,
      Item: eventType,
    })
  );

  return eventType;
}

export async function getEventType(id: string): Promise<EventType | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.EVENT_TYPES,
      Key: { id },
    })
  );

  return (result.Item as EventType) || null;
}

export async function listEventTypes(): Promise<EventType[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.EVENT_TYPES,
    })
  );

  return (result.Items as EventType[]) || [];
}
