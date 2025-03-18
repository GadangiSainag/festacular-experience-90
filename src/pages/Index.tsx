
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Filter } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import FeaturedEvents from "@/components/events/FeaturedEvents";
import EventList from "@/components/events/EventList";
import CategoryFilter from "@/components/events/CategoryFilter";
import { Event, EventCategory } from "@/types";

// Mock data for the prototype
const mockEvents: Event[] = [
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
    description: "A competitive coding challenge for all programming enthusiasts. Solve algorithmic problems and win exciting prizes!",
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
    description: "Learn the basics of Artificial Intelligence and Machine Learning in this hands-on workshop. Bring your laptops!",
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
    date: "2025-03-27",
    time: "12:00:00",
    venue: "College Grounds",
    longitude: 78.390123,
    latitude: 17.491234,
    description: "Explore various cuisines from around the world. Multiple food stalls with delicious treats await you!",
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
    date: "2025-03-25",
    time: "11:00:00",
    venue: "Art Gallery",
    longitude: 78.393456,
    latitude: 17.495678,
    description: "A showcase of artistic talent from students across departments. Paintings, sculptures, and digital art on display.",
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
    description: "A debate on emerging technologies and their impact on society. Teams will present arguments for and against various tech topics.",
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
    description: "Watch robots in action! Students from the Robotics Club will demonstrate their latest projects and innovations.",
    image_url: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=2070&auto=format&fit=crop",
    is_approved: true,
    star_count: 30,
    created_at: "2023-02-20T10:00:00Z",
    updated_at: "2023-02-20T10:00:00Z",
  },
];

const Index = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Get featured events (top 3 with most stars)
      const featured = [...mockEvents]
        .sort((a, b) => b.star_count - a.star_count)
        .slice(0, 5);
      
      setFeaturedEvents(featured);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const handleCategoryChange = (category: EventCategory | null) => {
    setSelectedCategory(category);
  };
  
  const filteredEvents = events.filter((event) => {
    // Category filter
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    
    // Search filter
    const matchesSearch =
      !searchTerm ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-blue-800 text-white">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-800/70 to-black/40"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        
        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
              March 25-30, 2025
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              NextFest <span className="text-blue-200">2025</span>
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              The ultimate college festival experience
            </p>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Calendar className="mr-2 h-4 w-4" />
                March 25-30, 2025
              </div>
              <div className="flex items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <MapPin className="mr-2 h-4 w-4" />
                JNTUH Campus
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 pb-4">
          <div className="mx-auto -mb-12 sm:-mb-16">
            <SearchBar onSearch={handleSearch} placeholder="Search for events, workshops, competitions..." />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-20 sm:pt-24">
        <div className="mb-8">
          <CategoryFilter 
            selectedCategory={selectedCategory}
            onChange={handleCategoryChange}
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading events...</p>
          </div>
        ) : (
          <>
            <section className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="relative text-2xl font-bold text-gray-900">
                  Featured Events
                  <motion.div
                    className="absolute -bottom-1 left-0 h-1 w-20 rounded-full bg-primary"
                    layoutId="sectionIndicator"
                  />
                </h2>
              </div>
              <FeaturedEvents events={featuredEvents} />
            </section>
            
            <section>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
                <button className="flex items-center text-sm font-medium text-primary">
                  <Filter className="mr-1 h-4 w-4" />
                  Filters
                </button>
              </div>
              <EventList events={filteredEvents} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
