import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Filter, MapPin } from "lucide-react";
import { Event, EventCategory } from "@/types";
import { useAllEvents } from "@/hooks/useEventData";

const Map = () => {
  const { data: events = [] } = useAllEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };
  
  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Event Map</h1>
          <button className="flex items-center rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
        
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            placeholder="Search for venues..."
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-200 shadow-sm">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <div className="relative flex h-full items-center justify-center bg-blue-50">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583089892943-c0a050d265a8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-center text-gray-500">
                      Interactive map will be displayed here
                    </p>
                  </div>
                  
                  {/* Map Markers */}
                  <motion.div
                    className="absolute left-[30%] top-[40%] cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedEvent(events[0])}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-festive-blue text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform bg-festive-blue"></div>
                  </motion.div>
                  
                  <motion.div
                    className="absolute left-[60%] top-[50%] cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedEvent(events[1])}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-festive-purple text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 transform bg-festive-purple"></div>
                  </motion.div>
                </div>
              )}
            </div>
            
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedEvent.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedEvent.venue}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {formatTime(selectedEvent.time)} • {selectedEvent.date}
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="md:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-lg font-medium text-gray-900">
                Venues
              </h2>
              
              <div className="space-y-4">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
                      </div>
                    ))
                ) : (
                  events.map((event) => (
                    <motion.button
                      key={event.id}
                      className={`w-full rounded-lg p-3 text-left transition-colors hover:bg-gray-50 ${
                        selectedEvent?.id === event.id ? "bg-gray-50" : ""
                      }`}
                      onClick={() => setSelectedEvent(event)}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start">
                        <div
                          className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                            event.category === "competition"
                              ? "bg-festive-blue text-white"
                              : "bg-festive-purple text-white"
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                        </div>
                        <div className="ml-3">
                          <h3 className="font-medium text-gray-900">
                            {event.venue}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {event.name}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
