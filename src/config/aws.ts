import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'eu-north-1';

// DynamoDB Client
const dynamoDBClient = new DynamoDBClient({ region });
export const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// S3 Client
export const s3Client = new S3Client({ region });

// Table names
export const TABLES = {
  EVENT_TYPES: process.env.DYNAMODB_EVENT_TYPES_TABLE || 'EventTypes',
  EVENTS: process.env.DYNAMODB_EVENTS_TABLE || 'Events',
  IMAGES: process.env.DYNAMODB_IMAGES_TABLE || 'Images',
  BOOKINGS: process.env.DYNAMODB_BOOKINGS_TABLE || 'Bookings',
};

// S3 Bucket
export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'photography-portfolio';
