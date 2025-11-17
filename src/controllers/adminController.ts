import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../config/aws';
import { Booking } from '../types';
import * as imageService from '../services/imageService';

// Bulk upload handler
export const bulkUpload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required'
      });
    }

    logger.info(`Bulk upload initiated: ${files.length} files for event ${eventId}`);

    const uploadedImages = [];
    const failedUploads = [];

    // Process each file
    for (const file of files) {
      try {
        // Upload to S3 and get the URL
        const { s3Key } = await imageService.uploadImageToS3(file, eventId);

        // Create image record in DynamoDB
        const image = await imageService.createImageRecord({
          eventId,
          s3Key,
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          description: req.body.description || '',
        });

        // Generate presigned URL for the uploaded image
        const url = await imageService.getPresignedUrl(s3Key);

        uploadedImages.push({ ...image, url });
      } catch (fileError) {
        logger.error(`Failed to upload file ${file.originalname}:`, fileError);
        failedUploads.push({
          filename: file.originalname,
          error: 'Upload failed'
        });
      }
    }

    const successCount = uploadedImages.length;
    const failureCount = failedUploads.length;

    logger.info(`Bulk upload completed: ${successCount} successful, ${failureCount} failed`);

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${successCount} files${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
      data: {
        uploaded: successCount,
        failed: failureCount,
        files: uploadedImages,
        failures: failedUploads
      }
    });
  } catch (error) {
    logger.error('Error in bulk upload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process bulk upload'
    });
  }
};

// Admin login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Simple authentication check (you can enhance this with hashing, JWT, etc.)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      logger.warn(`Failed admin login attempt for username: ${username}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate session token (in production, use JWT)
    const sessionToken = uuidv4();
    const apiKey = process.env.ADMIN_API_KEY;

    logger.info(`Admin logged in successfully: ${username}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        sessionToken,
        apiKey,
        username,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    logger.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
};

// Verify session
export const verifySession = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Session is valid',
      data: {
        authenticated: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error verifying session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify session'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    logger.info('Admin logged out');
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Error in admin logout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Count items in each table
    const [totalEventTypes, totalEvents, totalImages, bookings] = await Promise.all([
      countTableItems(TABLES.EVENT_TYPES),
      countTableItems(TABLES.EVENTS),
      countTableItems(TABLES.IMAGES),
      getAllBookings()
    ]);

    // Count bookings by status
    const pendingBookings = bookings.filter((b: Booking) => b.status === 'pending').length;
    const confirmedBookings = bookings.filter((b: Booking) => b.status === 'confirmed').length;
    const totalBookings = bookings.length;

    // Get recent activity (last 5 items from each table)
    const recentActivity = await getRecentActivity();

    const stats = {
      totalEvents,
      totalEventTypes,
      totalImages,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      recentActivity
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Helper function to count items in a DynamoDB table
async function countTableItems(tableName: string): Promise<number> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        Select: 'COUNT'
      })
    );
    return result.Count || 0;
  } catch (error) {
    logger.error(`Error counting items in ${tableName}:`, error);
    return 0;
  }
}

// Helper function to get all bookings for status counting
async function getAllBookings(): Promise<Booking[]> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLES.BOOKINGS
      })
    );
    return (result.Items as Booking[]) || [];
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    return [];
  }
}

// Helper function to get recent activity
async function getRecentActivity(): Promise<Array<{
  type: string;
  action: string;
  timestamp: string;
  id: string;
}>> {
  try {
    const activities: Array<{
      type: string;
      action: string;
      timestamp: string;
      id: string;
    }> = [];

    // Get recent bookings (last 3)
    const recentBookings = await docClient.send(
      new ScanCommand({
        TableName: TABLES.BOOKINGS,
        Limit: 3
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentBookings.Items?.forEach((booking: any) => {
      activities.push({
        type: 'booking',
        action: `New booking from ${booking.customerName}`,
        timestamp: booking.createdAt,
        id: booking.id
      });
    });

    // Get recent events (last 2)
    const recentEvents = await docClient.send(
      new ScanCommand({
        TableName: TABLES.EVENTS,
        Limit: 2
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentEvents.Items?.forEach((event: any) => {
      activities.push({
        type: 'event',
        action: `Event "${event.name}" created`,
        timestamp: event.createdAt,
        id: event.id
      });
    });

    // Get recent images (last 2)
    const recentImages = await docClient.send(
      new ScanCommand({
        TableName: TABLES.IMAGES,
        Limit: 2
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentImages.Items?.forEach((image: any) => {
      activities.push({
        type: 'image',
        action: `Image "${image.filename}" uploaded`,
        timestamp: image.uploadedAt,
        id: image.id
      });
    });

    // Sort by timestamp (most recent first) and take top 5
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    return [];
  }
}
