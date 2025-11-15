# Photography Portfolio Backend

Node.js + TypeScript + Express backend for a photography portfolio website with AWS S3 and DynamoDB.

## Features

- **Event Type Management** - Create categories (Wedding, Portrait, Corporate, etc.)
- **Event Management** - Create and manage photography events
- **Image Upload** - Upload images to S3 with event associations
- **Public Gallery** - Browse events and images by type
- **Booking System** - Customer booking requests for photography services
- **Admin Authentication** - API key-based protection for admin routes

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Storage**: AWS S3 (images)
- **Database**: AWS DynamoDB
- **File Upload**: Multer

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials and settings.

### 3. Set up AWS resources

**DynamoDB Tables** - Tables are created automatically on first server start! No manual setup needed.

Alternatively, you can create them manually:
```bash
npm run setup-db
```

**S3 Bucket**:

```bash
aws s3 mb s3://photography-portfolio
```

### 4. Run the server

Development mode (auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### Public Endpoints

#### Health Check
```
GET /api/health
```

#### List Event Types
```
GET /api/event-types
Response: [{ id, name, description, createdAt, updatedAt }]
```

#### Get Event Type
```
GET /api/event-types/:id
Response: { id, name, description, createdAt, updatedAt }
```

#### List Events
```
GET /api/events
GET /api/events?eventTypeId=xxx
Response: [{ id, eventTypeId, name, description, date, location, coverImageUrl, createdAt, updatedAt }]
```

#### Get Event
```
GET /api/events/:id
Response: { id, eventTypeId, name, description, date, location, coverImageUrl, createdAt, updatedAt }
```

#### List Images by Event
```
GET /api/images/event/:eventId
Response: [{ id, eventId, s3Key, filename, contentType, size, description, uploadedAt, url }]
```

#### Get Image
```
GET /api/images/:id
Response: { id, eventId, s3Key, filename, contentType, size, description, uploadedAt, url }
```

#### Create Booking
```
POST /api/bookings
Body: {
  eventTypeId: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  eventDate: string (ISO),
  eventLocation?: string,
  message?: string
}
Response: { id, ...booking details, status: 'pending' }
```

### Admin Endpoints (Require `X-API-Key` header)

#### Create Event Type
```
POST /api/event-types
Headers: { X-API-Key: "your_admin_api_key" }
Body: { name: string, description: string }
Response: { id, name, description, createdAt, updatedAt }
```

#### Create Event
```
POST /api/events
Headers: { X-API-Key: "your_admin_api_key" }
Body: {
  eventTypeId: string,
  name: string,
  description: string,
  date: string (ISO),
  location?: string,
  coverImageUrl?: string
}
Response: { id, ...event details }
```

#### Update Event
```
PUT /api/events/:id
Headers: { X-API-Key: "your_admin_api_key" }
Body: { name?, description?, date?, location?, coverImageUrl? }
Response: { id, ...updated event details }
```

#### Upload Images
```
POST /api/images
Headers: { X-API-Key: "your_admin_api_key" }
Content-Type: multipart/form-data
Body (form-data): {
  images: File[] (up to 10),
  eventId: string,
  description?: string
}
Response: [{ id, eventId, s3Key, filename, url, ... }]
```

#### List Bookings
```
GET /api/bookings
GET /api/bookings?eventTypeId=xxx
Headers: { X-API-Key: "your_admin_api_key" }
Response: [{ id, ...booking details }]
```

## Project Structure

```
├── server.ts              # Entry point
├── src/
│   ├── app.ts            # Express app setup
│   ├── config/
│   │   └── aws.ts        # AWS SDK configuration
│   ├── types/
│   │   └── index.ts      # TypeScript interfaces
│   ├── services/         # Business logic & DB operations
│   │   ├── eventTypeService.ts
│   │   ├── eventService.ts
│   │   ├── imageService.ts
│   │   └── bookingService.ts
│   ├── controllers/      # Request handlers
│   │   ├── eventTypeController.ts
│   │   ├── eventController.ts
│   │   ├── imageController.ts
│   │   └── bookingController.ts
│   ├── routes/           # Route definitions
│   │   ├── index.ts
│   │   ├── eventTypes.ts
│   │   ├── events.ts
│   │   ├── images.ts
│   │   └── bookings.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Admin authentication
│   │   ├── upload.ts     # Multer configuration
│   │   └── errorHandler.ts
│   └── utils/
│       └── logger.ts
└── package.json
```

## Database Schema

### EventTypes
- `id` (PK) - UUID
- `name` - String
- `description` - String
- `createdAt` - ISO timestamp
- `updatedAt` - ISO timestamp

### Events
- `id` (PK) - UUID
- `eventTypeId` - String (GSI)
- `name` - String
- `description` - String
- `date` - ISO date string
- `location` - String (optional)
- `coverImageUrl` - String (optional)
- `createdAt` - ISO timestamp
- `updatedAt` - ISO timestamp

### Images
- `id` (PK) - UUID
- `eventId` - String (GSI)
- `s3Key` - String
- `filename` - String
- `contentType` - String
- `size` - Number
- `description` - String (optional)
- `uploadedAt` - ISO timestamp

### Bookings
- `id` (PK) - UUID
- `eventTypeId` - String (GSI)
- `customerName` - String
- `customerEmail` - String
- `customerPhone` - String
- `eventDate` - ISO date string
- `eventLocation` - String (optional)
- `message` - String (optional)
- `status` - 'pending' | 'confirmed' | 'cancelled'
- `createdAt` - ISO timestamp
- `updatedAt` - ISO timestamp

## Security Notes

- Admin routes are protected with API key authentication
- S3 URLs are presigned with 7-day expiration
- Image uploads limited to 10MB per file
- Only image MIME types accepted for uploads

## Development

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```
