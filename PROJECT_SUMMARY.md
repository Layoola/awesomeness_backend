# Photography Portfolio Backend - Project Summary

## Overview
A complete Node.js + TypeScript backend for a photography portfolio website with AWS S3 image storage and DynamoDB database.

## Key Features Implemented

### 1. Event Type Management
- Create photography service categories (Wedding, Portrait, Corporate, etc.)
- Public browsing of available services
- Admin-only creation

### 2. Event Management
- Create specific photography events
- Associate events with event types
- Update event details
- Filter events by type
- Public viewing of all events

### 3. Image Upload & Storage
- Upload multiple images to AWS S3
- Associate images with specific events
- Generate presigned URLs for secure image access
- Support for up to 10 images per upload
- 10MB file size limit per image
- Image-only MIME type validation

### 4. Public Gallery
- Browse events by type
- View all images for a specific event
- Automatic presigned URL generation (7-day expiry)
- Public access without authentication

### 5. Booking System
- Customers can request photography services
- Select event type and provide details
- Contact information capture
- Admin can view all bookings
- Filter bookings by event type

### 6. Security
- API key-based admin authentication
- Protected admin routes (create/update operations)
- Public read-only access for browsing
- Environment-based configuration

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.x
- **Framework**: Express.js 4.x
- **Cloud Storage**: AWS S3
- **Database**: AWS DynamoDB
- **File Upload**: Multer (memory storage)
- **Security**: Helmet, CORS
- **Development**: ts-node-dev (hot reload)

## Project Structure

```
awesomeness_backend/
├── server.ts                 # Application entry point
├── src/
│   ├── app.ts               # Express app configuration
│   ├── config/
│   │   └── aws.ts           # AWS SDK clients & configuration
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── services/            # Business logic layer
│   │   ├── eventTypeService.ts
│   │   ├── eventService.ts
│   │   ├── imageService.ts
│   │   └── bookingService.ts
│   ├── controllers/         # HTTP request handlers
│   │   ├── eventTypeController.ts
│   │   ├── eventController.ts
│   │   ├── imageController.ts
│   │   └── bookingController.ts
│   ├── routes/              # API route definitions
│   │   ├── index.ts
│   │   ├── health.ts
│   │   ├── eventTypes.ts
│   │   ├── events.ts
│   │   ├── images.ts
│   │   └── bookings.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # Admin authentication
│   │   ├── upload.ts        # Multer configuration
│   │   └── errorHandler.ts # Error handling
│   └── utils/
│       └── logger.ts        # Logging utility
├── scripts/
│   └── setup-db.ts          # DynamoDB table creation
├── package.json
├── tsconfig.json
├── .env.example
├── .env                     # Local configuration
├── README.md                # Full documentation
├── QUICKSTART.md            # Quick start guide
└── postman_collection.json  # API testing collection
```

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/event-types` - List all event types
- `GET /api/event-types/:id` - Get specific event type
- `GET /api/events` - List all events
- `GET /api/events?eventTypeId=xxx` - Filter events by type
- `GET /api/events/:id` - Get specific event
- `GET /api/images/event/:eventId` - List images for an event
- `GET /api/images/:id` - Get specific image with presigned URL
- `POST /api/bookings` - Create booking request

### Admin Endpoints (Require X-API-Key header)
- `POST /api/event-types` - Create event type
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `POST /api/images` - Upload images (multipart/form-data)
- `GET /api/bookings` - List all bookings
- `GET /api/bookings?eventTypeId=xxx` - Filter bookings by type

## Database Schema

### DynamoDB Tables

1. **EventTypes**
   - PK: `id` (UUID)
   - Attributes: name, description, createdAt, updatedAt

2. **Events**
   - PK: `id` (UUID)
   - GSI: `eventTypeId` (EventTypeIndex)
   - Attributes: name, description, date, location, coverImageUrl, createdAt, updatedAt

3. **Images**
   - PK: `id` (UUID)
   - GSI: `eventId` (EventIndex)
   - Attributes: s3Key, filename, contentType, size, description, uploadedAt

4. **Bookings**
   - PK: `id` (UUID)
   - GSI: `eventTypeId` (EventTypeIndex)
   - Attributes: customerName, customerEmail, customerPhone, eventDate, eventLocation, message, status, createdAt, updatedAt

## Environment Variables

```env
PORT=3000
NODE_ENV=development
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=photography-portfolio
DYNAMODB_EVENT_TYPES_TABLE=EventTypes
DYNAMODB_EVENTS_TABLE=Events
DYNAMODB_IMAGES_TABLE=Images
DYNAMODB_BOOKINGS_TABLE=Bookings
ADMIN_API_KEY=your_secure_key
```

## Setup Instructions

1. **Install dependencies**: `npm install`
2. **Configure AWS credentials** in `.env`
3. **Create S3 bucket**: `aws s3 mb s3://photography-portfolio`
4. **Start server**: `npm run dev` (DynamoDB tables created automatically)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run setup-db` - Create DynamoDB tables
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

Import `postman_collection.json` into Postman or Insomnia for easy API testing.

## Security Considerations

- Admin routes protected by API key authentication
- S3 presigned URLs expire after 7 days
- Image uploads restricted to image MIME types only
- 10MB file size limit per image
- CORS enabled for cross-origin requests
- Helmet.js for security headers

## Future Enhancements

- JWT-based authentication for admin users
- Image thumbnail generation
- Advanced search and filtering
- Pagination for large datasets
- Image metadata extraction (EXIF data)
- Email notifications for new bookings
- Status management for bookings (confirmed/cancelled)
- Rate limiting for public endpoints
- Cloudfront CDN integration for images
- Backup and restore scripts

## Dependencies

### Production
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/client-s3` - S3 client
- `@aws-sdk/lib-dynamodb` - DynamoDB document client
- `@aws-sdk/s3-request-presigner` - S3 presigned URLs
- `express` - Web framework
- `cors` - CORS middleware
- `helmet` - Security headers
- `morgan` - HTTP logging
- `multer` - File upload handling
- `uuid` - UUID generation
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `ts-node-dev` - Development server
- `eslint` - Code linting
- `prettier` - Code formatting
- `@types/*` - TypeScript type definitions

## AWS Requirements

- IAM user with permissions for:
  - DynamoDB: CreateTable, PutItem, GetItem, Query, Scan
  - S3: CreateBucket, PutObject, GetObject
- S3 bucket for image storage
- DynamoDB tables (created via setup script)

## Notes

- All timestamps use ISO 8601 format
- Image URLs are presigned and temporary
- Booking status defaults to "pending"
- PAY_PER_REQUEST billing mode for DynamoDB (cost-efficient)
- Images stored in S3 with path pattern: `events/{eventId}/{uuid}-{filename}`
