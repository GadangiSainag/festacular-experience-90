
import { useAllEvents } from "@/hooks/useEventData";
import Map from "@/pages/Map";

const MapWrapper = () => {
  const { data: events, isLoading, error } = useAllEvents();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading events</div>;
  
  return <Map />;
};

export default MapWrapper;
