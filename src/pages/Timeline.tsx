
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Event } from "@/types";

// Mock data for the prototype
const mockEvents = [
  {
    id: "1",
    name: "Coding Challenge",
    category: "competition",
    department: "Computer Science",
    college: "JNTUH",
    date: "2025-03-25",
    time: "10:00:00",
    venue: "CS Lab Complex",
    longitude: 78.391357,
    latitude: 17.493034,
    description: "A competitive coding challenge for all programming enthusiasts.",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
    is_approved: true,
    star_count: 15,
    created_at: "2023-02-15T10:00:00Z",
    updated_at: "2023-02-15T10:00:00Z",
  },
  {
    id: "2",
    name: "AI Workshop",
    category: "workshop",
    department: "Computer Science",
    college: "JNTUH",
    date: "2025-03-26",
    time: "14:00:00",
    venue: "Seminar Hall",
    longitude: 78.392456,
    latitude: 17.494123,
    description: "Learn the basics of Artificial Intelligence and Machine Learning.",
    image_url: "https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2036&auto=format&fit=crop",
    is_approved: true,
    star_count: 25,
    created_at: "2023-02-16T10:00:00Z",
    updated_at: "2023-02-16T10:00:00Z",
  },
  {
    id: "3",
    name: "Food Festival",
    category: "food",
    department: "Cultural Club",
    college: "JNTUH",
    date: "2025-03-25",
    time: "12:00:00",
    venue: "College Grounds",
    longitude: 78.390123,
    latitude: 17.491234,
    description: "Explore various cuisines from around the world.",
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop",
    is_approved: true,
    star_count: 42,
    created_at: "2023-02-17T10:00:00Z",
    updated_at: "2023-02-17T10:00:00Z",
  },
  {
    id: "4",
    name: "Art Exhibition",
    category: "art",
    department: "Fine Arts",
    college: "JNTUH",
    date: "2025-03-27",
    time: "11:00:00",
    venue: "Art Gallery",
    longitude: 78.393456,
    latitude: 17.495678,
    description: "A showcase of artistic talent from students across departments.",
    image_url: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?q=80&w=2070&auto=format&fit=crop",
    is_approved: true,
    star_count: 18,
    created_at: "2023-02-18T10:00:00Z",
    updated_at: "2023-02-18T10:00:00Z",
  },
  {
    id: "5",
    name: "Tech Debate",
    category: "competition",
    department: "Technical Club",
    college: "JNTUH",
    date: "2025-03-26",
    time: "16:00:00",
    venue: "Main Auditorium",
    longitude: 78.394567,
    latitude: 17.496789,
    description: "A debate on emerging technologies and their impact on society.",
    image_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
    is_approved: true,
    star_count: 10,
    created_at: "2023-02-19T10:00:00Z",
    updated_at: "2023-02-19T10:00:00Z",
  },
  {
    id: "6",
    name: "Robotics Demo",
    category: "exhibit",
    department: "Mechanical Engineering",
    college: "JNTUH",
    date: "2025-03-27",
    time: "15:00:00",
    venue: "Robotics Lab",
    longitude: 78.395678,
    latitude: 17.49789,
    description: "Watch robots in action! Students from the Robotics Club will demonstrate their latest projects.",
    image_url: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=2070&auto=format&fit=crop",
    is_approved: true,
    star_count: 30,
    created_at: "2023-02-20T10:00:00Z",
    updated_at: "2023-02-20T10:00:00Z",
  },
];

// Group events by date
const groupEventsByDate = (events: Event[]) => {
  const groupedEvents: Record<string, Event[]> = {};
  
  events.forEach((event) => {
    if (!groupedEvents[event.date]) {
      groupedEvents[event.date] = [];
    }
    groupedEvents[event.date].push(event);
  });
  
  // Sort events by time within each date
  Object.keys(groupedEvents).forEach((date) => {
    groupedEvents[date].sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  });
  
  return groupedEvents;
};

const Timeline = () => {
  const [groupedEvents, setGroupedEvents] = useState<Record<string, Event[]>>({});
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      const grouped = groupEventsByDate(mockEvents);
      
      // Set all dates to expanded by default
      const expanded: Record<string, boolean> = {};
      Object.keys(grouped).forEach((date) => {
        expanded[date] = true;
      });
      
      setGroupedEvents(grouped);
      setExpandedDates(expanded);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleDateExpansion = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      competition: "border-festive-blue",
      workshop: "border-festive-purple",
      stall: "border-festive-orange",
      exhibit: "border-festive-teal",
      performance: "border-festive-pink",
      lecture: "border-festive-indigo",
      game: "border-festive-green",
      food: "border-festive-red",
      merch: "border-festive-yellow",
      art: "border-festive-purple",
    };
    return colors[category] || "border-gray-300";
  };
  
  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
          <p className="mt-2 text-gray-600">
            Plan your NextFest experience with our timeline view
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading schedule...</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-6 border-l-2 border-dashed border-gray-200 md:left-1/4 md:ml-3"></div>
            
            {Object.keys(groupedEvents)
              .sort()
              .map((date) => (
                <div key={date} className="mb-8">
                  <button
                    onClick={() => toggleDateExpansion(date)}
                    className="group mb-4 flex w-full items-center"
                  >
                    <div className="relative mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white md:mr-8">
                      <span className="font-medium">
                        {new Date(date).getDate()}
                      </span>
                      <motion.div
                        initial={false}
                        animate={{ opacity: expandedDates[date] ? 0 : 1 }}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </motion.div>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary">
                      {formatDate(date)}
                    </h2>
                    
                    <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors group-hover:bg-gray-100 group-hover:text-gray-600">
                      {expandedDates[date] ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDates[date] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden pl-16 md:pl-[calc(25%+2rem)]"
                    >
                      {groupedEvents[date].map((event, index) => (
                        <Link
                          key={event.id}
                          to={`/event/${event.id}`}
                          className="group relative mb-8 block"
                        >
                          <div className="absolute -left-[3.25rem] top-0 h-full w-0.5 bg-gray-100 md:-left-8"></div>
                          <div className="absolute -left-[3.5rem] top-1 h-3 w-3 rounded-full border-2 border-primary bg-white md:-left-[2.25rem]"></div>
                          
                          <div className="-mt-1 text-sm font-medium text-gray-500">
                            {formatTime(event.time)}
                          </div>
                          
                          <motion.div
                            whileHover={{ x: 5 }}
                            className={`mt-2 overflow-hidden rounded-lg border-l-4 bg-white p-4 shadow-sm transition-all group-hover:shadow ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-primary">
                                  {event.name}
                                </h3>
                                
                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <MapPin className="mr-1 h-3.5 w-3.5" />
                                    {event.venue}
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3.5 w-3.5" />
                                    {formatTime(event.time)}
                                  </div>
                                </div>
                              </div>
                              
                              <span
                                className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${
                                  event.category === "competition"
                                    ? "bg-festive-blue text-white"
                                    : event.category === "workshop"
                                    ? "bg-festive-purple text-white"
                                    : event.category === "food"
                                    ? "bg-festive-red text-white"
                                    : event.category === "art"
                                    ? "bg-festive-purple text-white"
                                    : event.category === "exhibit"
                                    ? "bg-festive-teal text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {event.category.charAt(0).toUpperCase() +
                                  event.category.slice(1)}
                              </span>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
