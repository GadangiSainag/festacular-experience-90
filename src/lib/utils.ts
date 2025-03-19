
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns";

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
