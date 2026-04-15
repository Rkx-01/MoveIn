export interface Property {
  property_id: string;
  title: string;
  location: string;
  price: number;
  description?: string;
  image?: string;
  rating?: number;
  status: 'Available' | 'Booked' | 'Maintenance';
  
  // Student First Fields
  nearby_colleges?: string;
  distance_from_college?: number;
  amenities?: string;
  roommate_option?: boolean;
  gender_preference?: 'Boys' | 'Girls' | 'Co-Living';
  
  // Safety Layer
  is_verified?: boolean;
  safety_score?: number;
  student_friendly?: boolean;
  
  host?: {
    user_id: string;
    name: string;
  };
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Tenant' | 'Host' | 'Admin';
}
