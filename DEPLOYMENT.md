# Deployment Guide

## Production Deployment Checklist

### 1. Environment Configuration

Update `.env` for production:

```env
NODE_ENV=production
PORT=3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<production_key>
AWS_SECRET_ACCESS_KEY=<production_secret>

# S3 Bucket
S3_BUCKET_NAME=<your-production-bucket>

# DynamoDB Tables
DYNAMODB_EVENT_TYPES_TABLE=EventTypes-prod
DYNAMODB_EVENTS_TABLE=Events-prod
DYNAMODB_IMAGES_TABLE=Images-prod
DYNAMODB_BOOKINGS_TABLE=Bookings-prod

# Admin Authentication (use strong key!)
ADMIN_API_KEY=<generate_strong_random_key>
```

### 2. AWS Infrastructure Setup

#### Create Production S3 Bucket

```bash
aws s3 mb s3://your-production-bucket --region us-east-1

# Set bucket policy for private access
aws s3api put-bucket-policy --bucket your-production-bucket --policy file://s3-policy.json
```

Example `s3-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyPublicRead",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-production-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalAccount": "YOUR_AWS_ACCOUNT_ID"
        }
      }
    }
  ]
}
```

#### Create Production DynamoDB Tables

**Note**: Tables are automatically created when the server starts! Just ensure your `.env` has the correct table names.

Alternatively, you can pre-create them:
```bash
# Update table names in .env to use -prod suffix
npm run setup-db
```

Or manually with proper naming:
```bash
aws dynamodb create-table \
  --table-name EventTypes-prod \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 3. IAM Configuration

Create IAM user with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/EventTypes-prod",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Events-prod",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Images-prod",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/Bookings-prod",
        "arn:aws:dynamodb:us-east-1:ACCOUNT_ID:table/*/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-production-bucket/*"
    }
  ]
}
```

### 4. Build Application

```bash
npm install --production=false
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### 5. Deployment Options

#### Option A: Traditional VPS (EC2, DigitalOcean, etc.)

1. **Install Node.js on server**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Copy files to server**:
```bash
rsync -avz --exclude node_modules --exclude .git \
  ./ user@server:/var/www/photography-backend/
```

3. **Install dependencies on server**:
```bash
cd /var/www/photography-backend
npm ci --production
```

4. **Use PM2 for process management**:
```bash
sudo npm install -g pm2
pm2 start dist/server.js --name photography-api
pm2 startup
pm2 save
```

5. **Set up Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

6. **Enable SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### Option B: AWS Elastic Beanstalk

1. **Create `.ebextensions/nodecommand.config`**:
```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node dist/server.js"
```

2. **Deploy**:
```bash
eb init
eb create production-env
eb deploy
```

#### Option C: Docker Container

1. **Create `Dockerfile`**:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY .env ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

2. **Build and run**:
```bash
docker build -t photography-api .
docker run -p 3000:3000 --env-file .env photography-api
```

#### Option D: Serverless (AWS Lambda + API Gateway)

Requires additional configuration with `serverless` framework or AWS SAM.

### 6. Monitoring & Logging

#### CloudWatch Logging (AWS)
```bash
sudo npm install -g pm2
pm2 install pm2-cloudwatch
```

#### Set up health check monitoring
Use services like:
- UptimeRobot
- Pingdom
- AWS CloudWatch Alarms

Example CloudWatch alarm for API endpoint:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name api-health-check \
  --alarm-description "Alert if API is down" \
  --metric-name StatusCheckFailed \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold
```

### 7. Security Hardening

- [ ] Use strong ADMIN_API_KEY (64+ random characters)
- [ ] Enable HTTPS only
- [ ] Set up firewall rules (allow only 80, 443, SSH)
- [ ] Regular security updates: `apt update && apt upgrade`
- [ ] Enable DynamoDB encryption at rest
- [ ] Enable S3 bucket encryption
- [ ] Set up AWS CloudTrail for audit logging
- [ ] Implement rate limiting (consider AWS WAF)
- [ ] Regular backup of DynamoDB tables
- [ ] Set S3 lifecycle policies for old images

### 8. Performance Optimization

- [ ] Enable DynamoDB auto-scaling (if not using PAY_PER_REQUEST)
- [ ] Use CloudFront CDN for S3 image delivery
- [ ] Enable compression in Express
- [ ] Add database indexes for common queries
- [ ] Implement caching (Redis/ElastiCache)
- [ ] Monitor and optimize AWS costs
- [ ] Set up AWS X-Ray for distributed tracing

### 9. Backup Strategy

#### DynamoDB Backup
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name EventTypes-prod \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

#### S3 Versioning
```bash
aws s3api put-bucket-versioning \
  --bucket your-production-bucket \
  --versioning-configuration Status=Enabled
```

### 10. Environment Variables Management

For production, consider using:
- AWS Secrets Manager
- AWS Systems Manager Parameter Store
- HashiCorp Vault
- Docker secrets

Example with AWS Secrets Manager:
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });
const secret = await client.send(new GetSecretValueCommand({ SecretId: 'prod/api/keys' }));
```

### 11. CI/CD Pipeline

#### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/photography-backend
            git pull
            npm ci --production
            npm run build
            pm2 restart photography-api
```

### 12. Rollback Strategy

```bash
# Using PM2
pm2 save
pm2 stop photography-api

# Restore previous version
git checkout <previous-commit>
npm ci --production
npm run build
pm2 start dist/server.js
```

### 13. Testing in Production

- Test all endpoints with production API key
- Verify S3 image uploads work
- Check DynamoDB reads/writes
- Load test with tools like Apache Bench or k6
- Monitor error rates in CloudWatch

```bash
# Simple load test
ab -n 1000 -c 10 https://api.yourdomain.com/api/health
```

### 14. Cost Estimation

Monthly AWS costs (approximate):
- DynamoDB PAY_PER_REQUEST: $0-50 (depends on traffic)
- S3 Storage: ~$0.023/GB
- S3 Requests: ~$0.005/1000 GET requests
- Data Transfer: First 1GB free, then ~$0.09/GB
- EC2 t3.small: ~$15/month (if self-hosting)

Use AWS Cost Calculator for accurate estimates.

### 15. Post-Deployment

- [ ] Monitor logs for errors
- [ ] Set up alerts for high error rates
- [ ] Test all critical endpoints
- [ ] Update documentation with production URLs
- [ ] Share API key with admin users securely
- [ ] Set up regular database backups
- [ ] Schedule maintenance windows
- [ ] Create runbook for common issues
