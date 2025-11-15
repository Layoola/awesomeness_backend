# Quick Start Guide

## Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure AWS credentials**
   - Option A: Set environment variables in `.env`
   - Option B: Use AWS CLI configured credentials (`~/.aws/credentials`)

3. **Create S3 bucket**
   ```bash
   aws s3 mb s3://photography-portfolio
   ```
   Or use your existing bucket name in `.env`

4. **Start the server** (DynamoDB tables are created automatically on first start!)
   ```bash
   npm run dev
   ```

## Testing the API

### 1. Create an Event Type (Admin)

```bash
curl -X POST http://localhost:3000/api/event-types \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev_admin_key_change_in_production" \
  -d '{
    "name": "Wedding Photography",
    "description": "Beautiful wedding moments captured forever"
  }'
```

### 2. Create an Event (Admin)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev_admin_key_change_in_production" \
  -d '{
    "eventTypeId": "YOUR_EVENT_TYPE_ID",
    "name": "Sarah & John Wedding",
    "description": "A beautiful summer wedding",
    "date": "2024-06-15",
    "location": "Central Park, NYC"
  }'
```

### 3. Upload Images (Admin)

```bash
curl -X POST http://localhost:3000/api/images \
  -H "X-API-Key: dev_admin_key_change_in_production" \
  -F "images=@photo1.jpg" \
  -F "images=@photo2.jpg" \
  -F "eventId=YOUR_EVENT_ID" \
  -F "description=Wedding ceremony photos"
```

### 4. Browse Event Types (Public)

```bash
curl http://localhost:3000/api/event-types
```

### 5. Browse Events by Type (Public)

```bash
curl http://localhost:3000/api/events?eventTypeId=YOUR_EVENT_TYPE_ID
```

### 6. View Event Images (Public)

```bash
curl http://localhost:3000/api/images/event/YOUR_EVENT_ID
```

### 7. Create a Booking (Public)

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "eventTypeId": "YOUR_EVENT_TYPE_ID",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "customerPhone": "+1234567890",
    "eventDate": "2024-08-20",
    "eventLocation": "Downtown Hotel",
    "message": "Looking for wedding photography services"
  }'
```

### 8. View Bookings (Admin)

```bash
curl http://localhost:3000/api/bookings \
  -H "X-API-Key: dev_admin_key_change_in_production"
```

## Common Issues

### AWS Credentials Not Found
- Ensure `.env` has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Or configure AWS CLI: `aws configure`

### Table Already Exists Error
- Normal if running `setup-db` multiple times
- Tables persist in AWS

### S3 Upload Fails
- Check bucket exists: `aws s3 ls s3://photography-portfolio`
- Verify bucket name matches `.env` config
- Check IAM permissions for S3 PutObject

### Presigned URL Errors
- Ensure AWS credentials have S3 GetObject permission
- Check S3 bucket CORS configuration if accessing from browser

## Development Tips

- Use Postman/Insomnia for easier API testing
- Check server logs for detailed error messages
- DynamoDB tables use PAY_PER_REQUEST billing (no base cost)
- S3 presigned URLs expire after 7 days
