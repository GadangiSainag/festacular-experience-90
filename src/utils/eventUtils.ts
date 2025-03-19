
import { EventCategory } from "@/types";

export const categoryColors: Record<EventCategory, { color: string; text: string }> = {
  competition: { color: '#f43f5e', text: 'white' },
  workshop: { color: '#8b5cf6', text: 'white' },
  stall: { color: '#10b981', text: 'white' },
  exhibit: { color: '#3b82f6', text: 'white' },
  performance: { color: '#ec4899', text: 'white' },
  lecture: { color: '#6366f1', text: 'white' },
  game: { color: '#f59e0b', text: 'white' },
  food: { color: '#ef4444', text: 'white' },
  merch: { color: '#14b8a6', text: 'white' },
  art: { color: '#8b5cf6', text: 'white' }
};

export const formatEventTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch (error) {
    return time;
  }
};
