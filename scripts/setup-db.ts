#!/usr/bin/env node
/**
 * Script to create DynamoDB tables for the photography portfolio backend
 * Usage: npm run setup-db
 */

import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

const tables = [
  {
    name: process.env.DYNAMODB_EVENT_TYPES_TABLE || 'EventTypes',
    attributes: [{ AttributeName: 'id', AttributeType: 'S' }],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    gsi: [],
  },
  {
    name: process.env.DYNAMODB_EVENTS_TABLE || 'Events',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventTypeId', AttributeType: 'S' },
    ],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    gsi: [
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [{ AttributeName: 'eventTypeId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: process.env.DYNAMODB_IMAGES_TABLE || 'Images',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventId', AttributeType: 'S' },
    ],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    gsi: [
      {
        IndexName: 'EventIndex',
        KeySchema: [{ AttributeName: 'eventId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
  {
    name: process.env.DYNAMODB_BOOKINGS_TABLE || 'Bookings',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventTypeId', AttributeType: 'S' },
    ],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    gsi: [
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [{ AttributeName: 'eventTypeId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },
];

async function createTable(config: (typeof tables)[0]) {
  try {
    const command = new CreateTableCommand({
      TableName: config.name,
      AttributeDefinitions: config.attributes,
      KeySchema: config.keySchema,
      GlobalSecondaryIndexes: config.gsi.length > 0 ? config.gsi : undefined,
      BillingMode: 'PAY_PER_REQUEST',
    });

    await client.send(command);
    console.log(`✓ Created table: ${config.name}`);
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`- Table already exists: ${config.name}`);
    } else {
      console.error(`✗ Error creating table ${config.name}:`, error.message);
    }
  }
}

async function main() {
  console.log('Creating DynamoDB tables...\n');

  for (const table of tables) {
    await createTable(table);
  }

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
