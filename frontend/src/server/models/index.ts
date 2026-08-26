/**
 * Domain model types.
 *
 * These mirror the entities in classDiagram.md / ErDiagram.md one-for-one. They
 * were TypeORM decorated classes in the standalone Express backend; here they
 * are plain TypeScript so the data layer can run under Next's Turbopack build,
 * which does not support the `emitDecoratorMetadata` TypeORM relies on.
 */

export enum UserRole {
  TENANT = "Tenant",
  HOST = "Host",
  ADMIN = "Admin",
}

export enum PropertyStatus {
  AVAILABLE = "Available",
  BOOKED = "Booked",
  MAINTENANCE = "Maintenance",
}

export enum GenderPreference {
  BOYS = "Boys",
  GIRLS = "Girls",
  CO_LIVING = "Co-Living",
}

export enum CollegeType {
  ENGINEERING = "Engineering",
  UNIVERSITY = "University",
  PRIVATE = "Private",
  MEDICAL = "Medical",
  LAW = "Law",
  IIT = "IIT",
  OTHER = "Other",
}

export enum BookingStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  CANCELLED = "Cancelled",
}

export enum PaymentStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  FAILED = "Failed",
  REFUNDED = "Refunded",
}

export interface City {
  city_id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  tier: string;
}

export interface College {
  college_id: string;
  name: string;
  type: CollegeType;
  area: string | null;
  latitude: number;
  longitude: number;
  city_id: string | null;
  city?: City | null;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Host extends User {
  phone_number: string | null;
  verified_host: boolean;
}

export type Tenant = User;

export interface Admin extends User {
  super_admin: boolean;
}

/** The user shape returned to clients — never carries the password hash. */
export interface PublicUser {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Property {
  property_id: string;
  title: string;
  description: string;
  address: string;
  locality: string | null;
  price: number;
  status: PropertyStatus;
  latitude: number | null;
  longitude: number | null;
  city_id: string | null;
  linked_college_id: string | null;
  amenities: string | null;
  roommate_option: boolean;
  gender_preference: GenderPreference | null;
  is_verified: boolean;
  safety_score: number | null;
  student_friendly: boolean;
  host_id: string | null;
  external_id: string | null;
  external_source: string | null;
  rating: number | null;
  photo_urls: string | null;
  last_fetched_at: Date | null;
  created_at: Date;
  updated_at: Date;
  city?: City | null;
  host?: Pick<Host, "user_id" | "name" | "phone_number" | "verified_host"> | null;
  linked_college?: Pick<College, "college_id" | "name" | "area"> | null;
  distance_to_college?: number | null;
}

export interface Booking {
  booking_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  tenant_id: string;
  property_id: string;
  created_at: Date;
  updated_at: Date;
  property?: Property | null;
}

export interface Payment {
  payment_id: string;
  amount: number;
  status: PaymentStatus;
  booking_id: string;
  created_at: Date;
}

export interface PropertyFilters {
  page?: string;
  limit?: string;
  search?: string;
  college_id?: string;
  city_id?: string;
  gender_preference?: string;
  min_budget?: string;
  max_budget?: string;
  amenities?: string;
  is_verified?: string;
  student_friendly?: string;
}
