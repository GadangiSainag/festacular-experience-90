import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Calendar, Clock, MapPin, Users, ArrowLeft, Share2 } from "lucide-react";
import { Event, EventCategory } from "@/types";
import { useEventData } from "@/hooks/useEventData";

const EventDetail = () => {
  const { data: event } = useEventData();
  const [isStarred, setIsStarred] = useState(false);
  
  const handleStar = () => {
    setIsStarred(!isStarred);
    // In a real app, we would call an API to update the star status
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
  
  const getCategoryColor = (category: EventCategory) => {
    const colors: Record<string, string> = {
      competition: "bg-festive-blue text-white",
      workshop: "bg-festive-purple text-white",
      stall: "bg-festive-orange text-white",
      exhibit: "bg-festive-teal text-white",
      performance: "bg-festive-pink text-white",
      lecture: "bg-festive-indigo text-white",
      game: "bg-festive-green text-white",
      food: "bg-festive-red text-white",
      merch: "bg-festive-yellow text-black",
      art: "bg-festive-purple text-white",
    };
    return colors[category] || "bg-gray-500 text-white";
  };
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
        <p className="mt-4 text-gray-600">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="mt-8 inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all events
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20 md:pb-10">
      <div className="relative overflow-hidden bg-gray-900">
        {event.image_url ? (
          <>
            <div className="absolute inset-0">
              <img
                src={event.image_url}
                alt={event.name}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-800" />
        )}
        
        <div className="container relative mx-auto px-4 py-16 sm:py-20 md:py-24">
          <Link 
            to="/" 
            className="mb-8 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all events
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(
                event.category
              )}`}
            >
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {event.name}
            </h1>
            
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {formatDate(event.date)}
              </div>
              
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {formatTime(event.time)}
              </div>
              
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {event.venue}
              </div>
              
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                {event.department || event.college}
              </div>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleStar}
                className={`flex items-center gap-2 rounded-full px-6 py-2.5 font-medium transition-all ${
                  isStarred
                    ? "bg-festive-red text-white"
                    : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${isStarred ? "fill-white" : ""}`}
                />
                {isStarred ? "Starred" : "Star Event"}
              </button>
              
              <button className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 font-medium text-white backdrop-blur-sm hover:bg-white/20">
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">About this event</h2>
            
            <div className="mt-6 whitespace-pre-line text-gray-700">
              {event.description}
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-2 text-gray-900">{formatDate(event.date)}</p>
              </div>
              
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Time</h3>
                <p className="mt-2 text-gray-900">{formatTime(event.time)}</p>
              </div>
              
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Venue</h3>
                <p className="mt-2 text-gray-900">{event.venue}</p>
              </div>
            </div>
            
            {event.longitude && event.latitude && (
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold text-gray-900">Location</h3>
                <div className="h-64 overflow-hidden rounded-lg bg-gray-200">
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Map view will be displayed here</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-bold text-gray-900">Organizer</h3>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">
                      {event.department || "Event Organizer"}
                    </p>
                    <p className="text-sm text-gray-500">{event.college}</p>
                  </div>
                </div>
                <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90">
                  Contact Organizer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
