import { PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { docClient, s3Client, TABLES, S3_BUCKET } from '../config/aws';
import { Image } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImageToS3(
  file: Express.Multer.File,
  eventId: string
): Promise<{ s3Key: string; url: string }> {
  const s3Key = `events/${eventId}/${uuidv4()}-${file.originalname}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  // Generate presigned URL valid for 7 days
  const url = await getSignedUrl(
    s3Client,
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    }),
    { expiresIn: 604800 }
  );

  return { s3Key, url };
}

export async function createImageRecord(data: {
  eventId: string;
  s3Key: string;
  filename: string;
  contentType: string;
  size: number;
  description?: string;
}): Promise<Image> {
  const image: Image = {
    id: uuidv4(),
    ...data,
    uploadedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.IMAGES,
      Item: image,
    })
  );

  return image;
}

export async function getImage(id: string): Promise<Image | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.IMAGES,
      Key: { id },
    })
  );

  return (result.Item as Image) || null;
}

export async function listImagesByEvent(eventId: string): Promise<Image[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.IMAGES,
      IndexName: 'EventIndex',
      KeyConditionExpression: 'eventId = :eventId',
      ExpressionAttributeValues: {
        ':eventId': eventId,
      },
    })
  );

  return (result.Items as Image[]) || [];
}

export async function getPresignedUrl(s3Key: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
}
