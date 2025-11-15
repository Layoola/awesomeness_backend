# Admin API Documentation

This document provides comprehensive documentation for all admin routes in the Awesomeness Backend API.

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication

All admin routes (except login) require authentication via API key.

### Headers Required
```
x-api-key: your-admin-api-key
```

---

## Authentication Endpoints

### 1. Admin Login
**Endpoint:** `POST /api/admin/login`  
**Access:** Public  
**Description:** Authenticate admin user and receive API key

#### Request Payload
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "sessionToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "apiKey": "your-admin-api-key",
    "username": "admin",
    "expiresIn": "24h"
  }
}
```

#### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Username and password are required"
}
```

---

### 2. Verify Session
**Endpoint:** `GET /api/admin/verify`  
**Access:** Protected  
**Description:** Verify that the current session/API key is valid

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Session is valid",
  "data": {
    "authenticated": true,
    "timestamp": "2025-11-15T10:30:45.123Z"
  }
}
```

---

### 3. Logout
**Endpoint:** `POST /api/admin/logout`  
**Access:** Protected  
**Description:** Logout admin user

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Dashboard

### Get Dashboard Statistics
**Endpoint:** `GET /api/admin/dashboard`  
**Access:** Protected  
**Description:** Get overview statistics for the admin dashboard

#### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalEvents": 10,
    "totalEventTypes": 5,
    "totalImages": 150,
    "totalBookings": 25,
    "pendingBookings": 5,
    "confirmedBookings": 20,
    "recentActivity": []
  }
}
```

---

## Event Types Management

### 1. List All Event Types
**Endpoint:** `GET /api/admin/event-types`  
**Access:** Protected  
**Description:** Get all event types

#### Success Response (200 OK)
```json
[
  {
    "id": "uuid-1",
    "name": "Wedding Photography",
    "description": "Professional wedding photography services",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Portrait Photography",
    "description": "Individual and family portrait sessions",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  }
]
```

---

### 2. Get Event Type by ID
**Endpoint:** `GET /api/admin/event-types/:id`  
**Access:** Protected  
**Description:** Get a specific event type by ID

#### Success Response (200 OK)
```json
{
  "id": "uuid-1",
  "name": "Wedding Photography",
  "description": "Professional wedding photography services",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T10:00:00.000Z"
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Event type not found"
}
```

---

### 3. Create Event Type
**Endpoint:** `POST /api/admin/event-types`  
**Access:** Protected  
**Description:** Create a new event type

#### Request Payload
```json
{
  "name": "Wedding Photography",
  "description": "Professional wedding photography services"
}
```

#### Success Response (201 Created)
```json
{
  "id": "uuid-1",
  "name": "Wedding Photography",
  "description": "Professional wedding photography services",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T10:00:00.000Z"
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "Name and description are required"
}
```

---

## Events Management

### 1. List All Events
**Endpoint:** `GET /api/admin/events`  
**Access:** Protected  
**Description:** Get all events, optionally filtered by event type

#### Query Parameters
- `eventTypeId` (optional): Filter events by event type

#### Example
```
GET /api/admin/events?eventTypeId=uuid-1
```

#### Success Response (200 OK)
```json
[
  {
    "id": "event-uuid-1",
    "eventTypeId": "uuid-1",
    "name": "John & Jane Wedding",
    "description": "Beautiful wedding ceremony at Central Park",
    "date": "2025-12-25",
    "location": "Central Park, New York",
    "coverImageUrl": "https://s3.amazonaws.com/...",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  }
]
```

---

### 2. Get Event by ID
**Endpoint:** `GET /api/admin/events/:id`  
**Access:** Protected  
**Description:** Get a specific event by ID

#### Success Response (200 OK)
```json
{
  "id": "event-uuid-1",
  "eventTypeId": "uuid-1",
  "name": "John & Jane Wedding",
  "description": "Beautiful wedding ceremony at Central Park",
  "date": "2025-12-25",
  "location": "Central Park, New York",
  "coverImageUrl": "https://s3.amazonaws.com/...",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T10:00:00.000Z"
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Event not found"
}
```

---

### 3. Create Event
**Endpoint:** `POST /api/admin/events`  
**Access:** Protected  
**Description:** Create a new event

#### Request Payload
```json
{
  "eventTypeId": "uuid-1",
  "name": "John & Jane Wedding",
  "description": "Beautiful wedding ceremony at Central Park",
  "date": "2025-12-25",
  "location": "Central Park, New York",
  "coverImageUrl": "https://s3.amazonaws.com/..."
}
```

#### Required Fields
- `eventTypeId` (string)
- `name` (string)
- `description` (string)
- `date` (string, ISO date format)

#### Optional Fields
- `location` (string)
- `coverImageUrl` (string)

#### Success Response (201 Created)
```json
{
  "id": "event-uuid-1",
  "eventTypeId": "uuid-1",
  "name": "John & Jane Wedding",
  "description": "Beautiful wedding ceremony at Central Park",
  "date": "2025-12-25",
  "location": "Central Park, New York",
  "coverImageUrl": "https://s3.amazonaws.com/...",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T10:00:00.000Z"
}
```

#### Error Response (400 Bad Request)
```json
{
  "error": "eventTypeId, name, description, and date are required"
}
```

---

### 4. Update Event
**Endpoint:** `PUT /api/admin/events/:id`  
**Access:** Protected  
**Description:** Update an existing event

#### Request Payload
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "location": "New Location"
}
```

#### Success Response (200 OK)
```json
{
  "id": "event-uuid-1",
  "eventTypeId": "uuid-1",
  "name": "Updated Event Name",
  "description": "Updated description",
  "date": "2025-12-25",
  "location": "New Location",
  "coverImageUrl": "https://s3.amazonaws.com/...",
  "createdAt": "2025-11-15T10:00:00.000Z",
  "updatedAt": "2025-11-15T12:30:00.000Z"
}
```

#### Error Response (404 Not Found)
```json
{
  "error": "Event not found"
}
```

---

## Images Management

### 1. List Images by Event
**Endpoint:** `GET /api/admin/events/:eventId/images`  
**Access:** Protected  
**Description:** Get all images for a specific event

#### Success Response (200 OK)
```json
[
  {
    "id": "image-uuid-1",
    "eventId": "event-uuid-1",
    "s3Key": "events/event-uuid-1/photo1.jpg",
    "filename": "photo1.jpg",
    "contentType": "image/jpeg",
    "size": 1024000,
    "description": "Ceremony photo",
    "uploadedAt": "2025-11-15T10:00:00.000Z"
  },
  {
    "id": "image-uuid-2",
    "eventId": "event-uuid-1",
    "s3Key": "events/event-uuid-1/photo2.jpg",
    "filename": "photo2.jpg",
    "contentType": "image/jpeg",
    "size": 2048000,
    "description": "Reception photo",
    "uploadedAt": "2025-11-15T10:05:00.000Z"
  }
]
```

---

### 2. Upload Images to Event
**Endpoint:** `POST /api/admin/events/:eventId/images`  
**Access:** Protected  
**Content-Type:** `multipart/form-data`  
**Description:** Upload one or multiple images to an event

#### Form Data Fields
- `images` (file or files): Image file(s) to upload (max 10 files)
- `description` (optional string): Description for the image(s)

#### Example using cURL
```bash
curl -X POST \
  http://localhost:3000/api/admin/events/event-uuid-1/images \
  -H 'x-api-key: your-admin-api-key' \
  -F 'images=@/path/to/image1.jpg' \
  -F 'images=@/path/to/image2.jpg' \
  -F 'description=Wedding ceremony photos'
```

#### Example using JavaScript Fetch
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
formData.append('description', 'Wedding photos');

fetch('http://localhost:3000/api/admin/events/event-uuid-1/images', {
  method: 'POST',
  headers: {
    'x-api-key': 'your-admin-api-key'
  },
  body: formData
});
```

#### Success Response (200 OK)
```json
[
  {
    "id": "image-uuid-1",
    "eventId": "event-uuid-1",
    "s3Key": "events/event-uuid-1/photo1.jpg",
    "filename": "photo1.jpg",
    "contentType": "image/jpeg",
    "size": 1024000,
    "description": "Wedding ceremony photos",
    "uploadedAt": "2025-11-15T10:00:00.000Z"
  }
]
```

---

### 3. Bulk Upload Images
**Endpoint:** `POST /api/admin/bulk-upload`  
**Access:** Protected  
**Content-Type:** `multipart/form-data`  
**Description:** Bulk upload multiple images (up to 50 files)

#### Form Data Fields
- `images` (files): Multiple image files (max 50)
- `eventId` (string): ID of the event to upload images to

#### Example using cURL
```bash
curl -X POST \
  http://localhost:3000/api/admin/bulk-upload \
  -H 'x-api-key: your-admin-api-key' \
  -F 'images=@/path/to/image1.jpg' \
  -F 'images=@/path/to/image2.jpg' \
  -F 'images=@/path/to/image3.jpg' \
  -F 'eventId=event-uuid-1'
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Successfully uploaded 3 files",
  "data": {
    "uploaded": 3,
    "files": [
      {
        "filename": "image1.jpg",
        "size": 1024000,
        "contentType": "image/jpeg",
        "status": "uploaded"
      },
      {
        "filename": "image2.jpg",
        "size": 2048000,
        "contentType": "image/jpeg",
        "status": "uploaded"
      },
      {
        "filename": "image3.jpg",
        "size": 1536000,
        "contentType": "image/jpeg",
        "status": "uploaded"
      }
    ]
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Event ID is required"
}
```

---

## Bookings Management

### 1. List All Bookings
**Endpoint:** `GET /api/admin/bookings`  
**Access:** Protected  
**Description:** Get all bookings, optionally filtered by event type

#### Query Parameters
- `eventTypeId` (optional): Filter bookings by event type

#### Example
```
GET /api/admin/bookings?eventTypeId=uuid-1
```

#### Success Response (200 OK)
```json
[
  {
    "id": "booking-uuid-1",
    "eventTypeId": "uuid-1",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+1234567890",
    "eventDate": "2025-12-25",
    "eventLocation": "Central Park, New York",
    "message": "Looking for wedding photography",
    "status": "pending",
    "createdAt": "2025-11-15T10:00:00.000Z",
    "updatedAt": "2025-11-15T10:00:00.000Z"
  },
  {
    "id": "booking-uuid-2",
    "eventTypeId": "uuid-1",
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "+1987654321",
    "eventDate": "2026-01-15",
    "eventLocation": "Brooklyn, New York",
    "message": "Need portrait photography",
    "status": "confirmed",
    "createdAt": "2025-11-14T09:00:00.000Z",
    "updatedAt": "2025-11-14T15:00:00.000Z"
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized - Invalid API key"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to [action description]"
}
```

---

## Environment Variables

Add these to your `.env` file:

```env
# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
ADMIN_API_KEY=your-secure-api-key
```

---

## Testing with Postman

1. **Import the collection** from `postman_collection.json`
2. **Set up environment variables:**
   - `base_url`: `http://localhost:3000`
   - `admin_api_key`: Your admin API key from `.env`

3. **Login flow:**
   - Call `POST /api/admin/login` with credentials
   - Copy the `apiKey` from the response
   - Use it in the `x-api-key` header for all subsequent requests

---

## Example Full Workflow

### 1. Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 2. Create Event Type
```bash
curl -X POST http://localhost:3000/api/admin/event-types \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key' \
  -d '{
    "name": "Wedding Photography",
    "description": "Professional wedding photography services"
  }'
```

### 3. Create Event
```bash
curl -X POST http://localhost:3000/api/admin/events \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key' \
  -d '{
    "eventTypeId": "uuid-from-step-2",
    "name": "John & Jane Wedding",
    "description": "Beautiful ceremony",
    "date": "2025-12-25",
    "location": "Central Park, NY"
  }'
```

### 4. Upload Images
```bash
curl -X POST http://localhost:3000/api/admin/events/event-uuid/images \
  -H 'x-api-key: your-api-key' \
  -F 'images=@photo1.jpg' \
  -F 'images=@photo2.jpg'
```

### 5. View Bookings
```bash
curl -X GET http://localhost:3000/api/admin/bookings \
  -H 'x-api-key: your-api-key'
```

---

## Notes

- Maximum file size for uploads: 5MB per file (configurable in `upload.ts` middleware)
- Maximum files in bulk upload: 50 files
- Maximum files per event upload: 10 files
- Supported image formats: JPEG, PNG, GIF, WebP
- All dates should be in ISO 8601 format
- API keys should be kept secure and never committed to version control
