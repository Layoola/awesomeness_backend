# Troubleshooting Guide

## Common Issues and Solutions

### Server Won't Start

#### Issue: "Cannot find module '@aws-sdk/...'"
```
Error: Cannot find module '@aws-sdk/client-dynamodb'
```

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Process is already listening on port 3000"
**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

#### Issue: "Cannot read property 'AWS_REGION' of undefined"
**Solution**: Create `.env` file from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your values
```

---

### AWS Credential Issues

#### Issue: "Unable to locate credentials"
```
Error: Unable to locate credentials
```

**Solutions**:

1. **Set environment variables in `.env`**:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

2. **Or configure AWS CLI**:
```bash
aws configure
```

3. **Or use IAM role** (if running on EC2):
No credentials needed, instance role will be used automatically.

#### Issue: "The security token included in the request is invalid"
**Solution**: Check if credentials are correct and not expired:
```bash
aws sts get-caller-identity
```

---

### DynamoDB Issues

#### Issue: "Table does not exist"
```
Error: Cannot do operations on a non-existent table
```

**Solution**: Create tables:
```bash
npm run setup-db
```

Or check table names match your `.env`:
```bash
aws dynamodb list-tables
```

#### Issue: "ResourceNotFoundException: Requested resource not found"
**Solutions**:

1. Verify table exists:
```bash
aws dynamodb describe-table --table-name EventTypes
```

2. Check AWS region matches:
```bash
# In .env
AWS_REGION=us-east-1  # Must match where tables were created
```

3. Check table names in `.env` match actual table names

#### Issue: "ProvisionedThroughputExceededException"
**Solution**: Tables are set to PAY_PER_REQUEST mode to avoid this. If you changed to provisioned mode, increase throughput:
```bash
aws dynamodb update-table \
  --table-name EventTypes \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10
```

---

### S3 Issues

#### Issue: "The specified bucket does not exist"
**Solution**: Create the bucket:
```bash
aws s3 mb s3://photography-portfolio
```

Or update bucket name in `.env`:
```env
S3_BUCKET_NAME=your-existing-bucket
```

#### Issue: "Access Denied" when uploading images
**Solutions**:

1. **Check IAM permissions**:
```bash
aws s3 ls s3://photography-portfolio
```

2. **Add required permissions** to IAM user:
```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": "arn:aws:s3:::photography-portfolio/*"
}
```

3. **Check bucket policy** doesn't deny access

#### Issue: "SignatureDoesNotMatch"
**Solution**: 
- Check AWS credentials are correct
- Verify system clock is synchronized (AWS requires accurate time)
```bash
# On Linux
sudo ntpdate pool.ntp.org
```

#### Issue: Presigned URLs return 403
**Solutions**:

1. Check S3 bucket isn't blocking public access when needed
2. Verify the S3 key exists:
```bash
aws s3 ls s3://photography-portfolio/events/
```
3. Ensure credentials used to sign URL have GetObject permission

---

### File Upload Issues

#### Issue: "File too large"
```
Error: File too large
```

**Solution**: Current limit is 10MB. To increase, edit `src/middleware/upload.ts`:
```typescript
limits: {
  fileSize: 50 * 1024 * 1024, // 50MB
}
```

#### Issue: "Only image files are allowed"
**Solution**: Ensure uploaded files are images (JPEG, PNG, GIF, etc.). Check MIME type:
```bash
file -b --mime-type image.jpg
# Should output: image/jpeg
```

#### Issue: "Unexpected field" error
**Solution**: Ensure field name is `images` (plural):
```bash
# Correct
curl -F "images=@photo.jpg" ...

# Wrong
curl -F "image=@photo.jpg" ...
```

---

### Authentication Issues

#### Issue: "Unauthorized - Invalid API key"
**Solution**: Check `X-API-Key` header matches `.env`:
```bash
# Check .env file
cat .env | grep ADMIN_API_KEY

# Use in request
curl -H "X-API-Key: dev_admin_key_change_in_production" ...
```

#### Issue: Admin routes accessible without key
**Solution**: Verify middleware is applied:
```typescript
// In routes file
router.post('/', adminAuth, controller.create);  // adminAuth must be before controller
```

---

### TypeScript Compilation Issues

#### Issue: "Cannot find module or its corresponding type declarations"
**Solution**:
```bash
npm install --save-dev @types/package-name
```

#### Issue: Build fails with type errors
**Solution**: Check `tsconfig.json` includes all source files:
```json
{
  "include": ["server.ts", "src/**/*"]
}
```

---

### Runtime Errors

#### Issue: "Cannot read property 'id' of undefined"
**Cause**: Database returned null/undefined

**Solution**: Add null checks:
```typescript
const event = await eventService.getEvent(id);
if (!event) {
  return res.status(404).json({ error: 'Event not found' });
}
```

#### Issue: Images array is empty even after upload
**Solution**: 
1. Check S3 upload succeeded (check CloudWatch logs)
2. Verify DynamoDB record was created
3. Check GSI is active (may take time after table creation)

---

### Performance Issues

#### Issue: Slow response times
**Solutions**:

1. **Enable DynamoDB caching**:
```typescript
// Add caching layer (e.g., Redis)
const cached = await redis.get(`event:${id}`);
if (cached) return JSON.parse(cached);
```

2. **Use CloudFront for images**:
```bash
aws cloudfront create-distribution --origin-domain-name your-bucket.s3.amazonaws.com
```

3. **Add database indexes** (already included in setup script)

4. **Monitor with AWS X-Ray**

#### Issue: High DynamoDB costs
**Solutions**:
1. Use Query instead of Scan when possible (already implemented)
2. Implement pagination
3. Use DynamoDB DAX for caching
4. Switch from PAY_PER_REQUEST to provisioned if traffic is predictable

---

### Development Issues

#### Issue: Changes not reflected (hot reload not working)
**Solution**:
```bash
# Restart dev server
# Press Ctrl+C and run again
npm run dev
```

Or clear the ts-node cache:
```bash
rm -rf node_modules/.cache
```

#### Issue: Port 3000 already in use
**Solution**:
```bash
# Change port in .env
PORT=3001

# Or kill existing process
npx kill-port 3000
```

---

### Testing Issues

#### Issue: Postman requests timing out
**Solutions**:
1. Check server is running: `curl http://localhost:3000/api/health`
2. Increase Postman timeout: Settings → General → Request timeout
3. Check firewall isn't blocking requests

#### Issue: cURL commands not working
**Solution**: Make sure to escape special characters in bash:
```bash
# Correct
curl -H "Content-Type: application/json" -d '{"name":"Test"}' ...

# Windows CMD use double quotes differently
curl -H "Content-Type: application/json" -d "{\"name\":\"Test\"}" ...
```

---

### Production Issues

#### Issue: 502 Bad Gateway (Nginx)
**Solutions**:
1. Check if Node.js process is running:
```bash
pm2 status
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

3. Verify port in Nginx config matches server:
```nginx
proxy_pass http://localhost:3000;  # Must match server port
```

#### Issue: Out of Memory
**Solution**: Increase Node.js memory:
```bash
# In PM2
pm2 start dist/server.js --max-memory-restart 1G

# Or set NODE_OPTIONS
NODE_OPTIONS="--max-old-space-size=2048" node dist/server.js
```

#### Issue: CORS errors in browser
**Solution**: Already configured, but verify:
1. Check CORS middleware is enabled in `src/app.ts`
2. Add specific origins if needed:
```typescript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
}));
```

---

## Debugging Tips

### Enable Debug Logging

1. **Add more logging**:
```typescript
import { logger } from './utils/logger';

logger.info('Processing request', { eventId, userId });
logger.error('Error occurred', { error, stack: error.stack });
```

2. **Enable AWS SDK logging**:
```typescript
// In config/aws.ts
const client = new DynamoDBClient({ 
  region,
  logger: console  // Log all AWS SDK calls
});
```

### Check AWS Service Health
```bash
# Check if AWS services are operational
curl https://status.aws.amazon.com/data.json
```

### Monitor Metrics
```bash
# DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=Events \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Validate Environment
```bash
# Run this to check configuration
node -e "require('dotenv').config(); console.log(process.env.AWS_REGION, process.env.S3_BUCKET_NAME)"
```

---

## Getting Help

If you're still stuck:

1. **Check logs**: Server logs contain detailed error messages
2. **AWS CloudWatch**: Check CloudWatch Logs for Lambda/ECS deployments
3. **Enable verbose logging**: Set `NODE_ENV=development` for detailed output
4. **Check AWS Service Health**: https://status.aws.amazon.com/
5. **Review AWS Documentation**: 
   - [DynamoDB Troubleshooting](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Programming.Errors.html)
   - [S3 Troubleshooting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/troubleshooting.html)

---

## Common Error Codes

| Error Code | Meaning | Common Cause |
|------------|---------|--------------|
| 400 | Bad Request | Missing required fields in request body |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Resource doesn't exist in database |
| 413 | Payload Too Large | File exceeds 10MB limit |
| 500 | Internal Server Error | Check server logs for details |
| 502 | Bad Gateway | Server not responding (Nginx issue) |
| 503 | Service Unavailable | AWS service temporarily unavailable |

---

## Useful Commands

```bash
# Check if server is responding
curl -I http://localhost:3000/api/health

# Test DynamoDB connection
aws dynamodb scan --table-name EventTypes --limit 1

# Test S3 connection
aws s3 ls s3://photography-portfolio

# View recent logs
pm2 logs photography-api --lines 100

# Monitor server in real-time
watch -n 1 'curl -s http://localhost:3000/api/health'

# Check disk space (images can fill disk)
df -h

# Check memory usage
free -m

# Restart everything
pm2 restart all && pm2 logs
```
