
import { useAllEvents } from "@/hooks/useEventData";
import Timeline from "@/pages/Timeline";

const TimelineWrapper = () => {
  const { data: events, isLoading, error } = useAllEvents();
  
  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error loading events</div>;
  
  return <Timeline />;
};

export default TimelineWrapper;
