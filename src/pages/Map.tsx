
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryFilterOption, Event } from "@/types";
import CategoryFilter from "@/components/events/CategoryFilter";
import { useAllEvents } from "@/hooks/useEventData";

const Map = () => {
  const navigate = useNavigate();
  const { data: events = [], isLoading, error } = useAllEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilterOption[]>([]);
  
  // Filter events based on search term and selected categories
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => cat.value === event.category);
    
    return matchesSearch && matchesCategory;
  });
  
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };
  
  const handleCategoryChange = (categories: CategoryFilterOption[]) => {
    setSelectedCategories(categories);
  };

  // Mock map rendering function - in a real app you'd use a proper map library
  const renderMap = () => {
    return (
      <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
        {/* This would be your actual map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground">Interactive map would render here</p>
        </div>
        
        {/* Event pins on the map */}
        {filteredEvents.map(event => (
          event.latitude && event.longitude ? (
            <div 
              key={event.id}
              className="absolute cursor-pointer hover:z-10"
              style={{ 
                left: `${30 + Math.random() * 70}%`, // Random positioning for demo
                top: `${20 + Math.random() * 60}%`,  // Random positioning for demo
              }}
              onClick={() => handleEventClick(event.id)}
            >
              <div className="flex flex-col items-center">
                <MapPin className="text-primary h-6 w-6" />
                <div className="bg-card shadow-md rounded-md p-2 text-xs max-w-[150px] mt-1">
                  <p className="font-medium truncate">{event.name}</p>
                  <p className="text-muted-foreground truncate">{event.venue}</p>
                </div>
              </div>
            </div>
          ) : null
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or venue..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CategoryFilter onSelectionChange={handleCategoryChange} />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Loading map...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-12">
          <p className="text-destructive">Error loading map data</p>
        </div>
      ) : (
        <>
          {renderMap()}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredEvents.map(event => (
              <div 
                key={event.id}
                className="bg-card shadow-sm rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                    <p className="text-xs mt-1 capitalize">{event.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Map;
