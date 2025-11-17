import { PutCommand,QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../config/aws';
import { Booking } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function createBooking(data: {
  eventTypeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventLocation?: string;
  message?: string;
}): Promise<Booking> {
  const booking: Booking = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.BOOKINGS,
      Item: booking,
    })
  );

  return booking;
}

export async function listBookings(): Promise<Booking[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.BOOKINGS,
    })
  );

  return (result.Items as Booking[]) || [];
}

export async function listBookingsByEventType(eventTypeId: string): Promise<Booking[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.BOOKINGS,
      IndexName: 'EventTypeIndex',
      KeyConditionExpression: 'eventTypeId = :eventTypeId',
      ExpressionAttributeValues: {
        ':eventTypeId': eventTypeId,
      },
    })
  );

  return (result.Items as Booking[]) || [];
}
