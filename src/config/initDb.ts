import {
  DynamoDBClient,
  CreateTableCommand,
  type AttributeDefinition,
  type KeySchemaElement,
  type GlobalSecondaryIndex,
} from '@aws-sdk/client-dynamodb';
import { logger } from '../utils/logger';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });

const tables = [
  {
    name: process.env.DYNAMODB_EVENT_TYPES_TABLE || 'EventTypes',
    attributes: [{ AttributeName: 'id', AttributeType: 'S' }] as AttributeDefinition[],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }] as KeySchemaElement[],
    gsi: [] as GlobalSecondaryIndex[],
  },
  {
    name: process.env.DYNAMODB_EVENTS_TABLE || 'Events',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventTypeId', AttributeType: 'S' },
    ] as AttributeDefinition[],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }] as KeySchemaElement[],
    gsi: [
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [{ AttributeName: 'eventTypeId', KeyType: 'HASH' }] as KeySchemaElement[],
        Projection: { ProjectionType: 'ALL' },
      },
    ] as GlobalSecondaryIndex[],
  },
  {
    name: process.env.DYNAMODB_IMAGES_TABLE || 'Images',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventId', AttributeType: 'S' },
    ] as AttributeDefinition[],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }] as KeySchemaElement[],
    gsi: [
      {
        IndexName: 'EventIndex',
        KeySchema: [{ AttributeName: 'eventId', KeyType: 'HASH' }] as KeySchemaElement[],
        Projection: { ProjectionType: 'ALL' },
      },
    ] as GlobalSecondaryIndex[],
  },
  {
    name: process.env.DYNAMODB_BOOKINGS_TABLE || 'Bookings',
    attributes: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'eventTypeId', AttributeType: 'S' },
    ] as AttributeDefinition[],
    keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }] as KeySchemaElement[],
    gsi: [
      {
        IndexName: 'EventTypeIndex',
        KeySchema: [{ AttributeName: 'eventTypeId', KeyType: 'HASH' }] as KeySchemaElement[],
        Projection: { ProjectionType: 'ALL' },
      },
    ] as GlobalSecondaryIndex[],
  },
];

async function createTable(config: (typeof tables)[0]): Promise<void> {
  try {
    const command = new CreateTableCommand({
      TableName: config.name,
      AttributeDefinitions: config.attributes,
      KeySchema: config.keySchema,
      GlobalSecondaryIndexes: config.gsi.length > 0 ? config.gsi : undefined,
      BillingMode: 'PAY_PER_REQUEST',
    });

    await client.send(command);
    logger.info(`✓ Created DynamoDB table: ${config.name}`);
  } catch (error) {
    if ((error as { name?: string }).name === 'ResourceInUseException') {
      logger.info(`✓ DynamoDB table already exists: ${config.name}`);
    } else {
      logger.error(`✗ Error creating DynamoDB table ${config.name}:`, error);
      throw error;
    }
  }
}

export async function initializeDynamoDB(): Promise<void> {
  logger.info('Initializing DynamoDB tables...');

  try {
    for (const table of tables) {
      await createTable(table);
    }
    logger.info('DynamoDB initialization complete');
  } catch (error) {
    logger.error('Failed to initialize DynamoDB tables:', error);
    throw error;
  }
}
