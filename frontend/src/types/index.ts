export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: Address;
  profilePicture?: string;
  role: 'user' | 'admin' | 'shelter' | 'vet';
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Location {
  address: string;
  coordinates: {
    coordinates: [number, number];
  };
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Collar {
  hasCollar: boolean;
  color?: string;
  description?: string;
}

export interface Pet {
  _id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'other';
  breed: string;
  color: string;
  gender: 'male' | 'female' | 'unknown';
  age?: number;
  ageUnit?: 'days' | 'weeks' | 'months' | 'years';
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  status: 'missing' | 'found' | 'reunited';
  photos: string[];
  lastSeenLocation: Location;
  lastSeenDate: string;
  additionalNotes?: string;
  microchipNumber?: string;
  collar?: Collar;
  tags: string[];
  isApproved: boolean;
  views: number;
  contactCount: number;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  type: 'user' | 'pet_post' | 'spam' | 'inappropriate' | 'fake' | 'duplicate' | 'other';
  reason: string;
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  reportedUserId?: string;
  reportedPetId?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    message: string;
    statusCode: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPets: number;
  approvedPets: number;
  pendingPets: number;
  totalReports: number;
  pendingReports: number;
  highPriorityReports: number;
}

export interface SearchFilters {
  status?: string;
  type?: string;
  breed?: string;
  color?: string;
  gender?: string;
  page?: number;
  limit?: number;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message?: string;
}