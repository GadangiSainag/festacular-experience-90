
import { useEventData } from "@/hooks/useEventData";
import EventDetail from "@/pages/EventDetail";

const EventDetailWrapper = () => {
  const { data: event, isLoading, error } = useEventData();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading event details</div>;
  if (!event) return <div>Event not found</div>;
  
  return <EventDetail event={event} />;
};

export default EventDetailWrapper;
