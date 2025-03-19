
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Event, EventCategory, User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date string to a more readable format
export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Type guard for event category
export function isValidEventCategory(category: string): category is EventCategory {
  return ['competition', 'workshop', 'stall', 'exhibit', 'performance', 
          'lecture', 'game', 'food', 'merch', 'art'].includes(category as string);
}

// Safe type conversions for Supabase data
export function safeEvent(data: any): Event {
  let category = data?.category || 'competition';
  // Ensure category is a valid EventCategory
  if (!isValidEventCategory(category)) {
    category = 'competition';
  }
  
  return {
    id: data?.id || '',
    name: data?.name || '',
    category,
    department: data?.department || '',
    college: data?.college || '',
    organizer_id: data?.organizer_id || '',
    date: data?.date || '',
    time: data?.time || '',
    venue: data?.venue || '',
    longitude: data?.longitude || 0,
    latitude: data?.latitude || 0,
    description: data?.description || '',
    image_url: data?.image_url || '',
    is_approved: Boolean(data?.is_approved),
    star_count: data?.star_count || 0,
    created_at: data?.created_at || '',
    updated_at: data?.updated_at || '',
    is_starred: Boolean(data?.is_starred)
  };
}

export function safeEventArray(data: any[]): Event[] {
  if (!Array.isArray(data)) return [];
  return data.map(safeEvent);
}

export function safeUser(data: any): User {
  return {
    id: data?.id || '',
    auth_id: data?.auth_id || '',
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    passout_year: data?.passout_year,
    admission_year: data?.admission_year,
    course: data?.course || '',
    department: data?.department || '',
    college: data?.college || '',
    type: data?.type || 'attendee',
    role_elevation_requested: Boolean(data?.role_elevation_requested),
    created_at: data?.created_at || '',
    updated_at: data?.updated_at || ''
  };
}

export function safeUserArray(data: any[]): User[] {
  if (!Array.isArray(data)) return [];
  return data.map(safeUser);
}
