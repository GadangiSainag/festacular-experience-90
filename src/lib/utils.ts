
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";
import { Event, EventCategory, User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    return format(date, "PPP"); // Format like "Apr 29, 2023"
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Type safety utility functions for Supabase responses
export const safeUser = (data: any): User => {
  return data as User;
};

export const safeEvent = (data: any): Event => {
  // Ensure category is of type EventCategory
  if (data && typeof data.category === 'string') {
    data.category = data.category as EventCategory;
  }
  return data as Event;
};

export const safeEventArray = (data: any[]): Event[] => {
  return data.map(item => safeEvent(item));
};

export const safeUserArray = (data: any[]): User[] => {
  return data.map(item => safeUser(item));
};
