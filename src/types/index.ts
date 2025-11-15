// EventType - Categories like Wedding, Portrait, Corporate, etc.
export interface EventType {
  id: string; // PK
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Event - Specific photography events
export interface Event {
  id: string; // PK
  eventTypeId: string; // FK to EventType
  name: string;
  description: string;
  date: string; // ISO date string
  location?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Image - Photos uploaded for events
export interface Image {
  id: string; // PK
  eventId: string; // FK to Event, also GSI partition key
  s3Key: string; // S3 object key
  filename: string;
  contentType: string;
  size: number;
  description?: string;
  uploadedAt: string;
}

// Booking - Customer booking requests
export interface Booking {
  id: string; // PK
  eventTypeId: string; // FK to EventType, also GSI partition key
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string; // ISO date string
  eventLocation?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
