
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Clock, Star, Share2, ArrowLeft } from "lucide-react";
import { Event } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useStarEvent, getCategoryColor } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

interface EventDetailViewProps {
  event: Event;
}

const EventDetailView = ({ event }: EventDetailViewProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutate: starEvent } = useStarEvent();
  const [isStarred, setIsStarred] = useState(event.is_starred || false);
  
  const handleStar = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to star events",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    const newStarredStatus = !isStarred;
    setIsStarred(newStarredStatus);
    
    starEvent({ 
      eventId: event.id, 
      starred: newStarredStatus 
    });
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out this event: ${event.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const categoryColor = getCategoryColor(event.category);
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge 
              className="text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {event.category}
            </Badge>
            {event.department && (
              <Badge variant="outline">
                {event.department}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={isStarred ? "default" : "outline"}
            size="sm"
            onClick={handleStar}
          >
            <Star className={`mr-2 h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
            {isStarred ? "Starred" : "Star"}
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-start">
          <Calendar className="h-5 w-5 text-primary mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Date</h3>
            <p>{formatDate(event.date)}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Time</h3>
            <p>{formatTime(event.time)}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">Venue</h3>
            <p>{event.venue}</p>
          </div>
        </div>
      </div>
      
      <Separator className="my-8" />
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        {event.description ? (
          <p className="whitespace-pre-wrap">{event.description}</p>
        ) : (
          <p className="text-muted-foreground">No description available.</p>
        )}
      </div>
      
      {event.latitude && event.longitude && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          <div className="h-64 bg-muted rounded-lg">
            <iframe
              title="Event Location"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${event.latitude},${event.longitude}`}
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Note: Map may require API key for full functionality
          </p>
        </div>
      )}
      
      {event.college && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Organized by</h2>
          <p>{event.college}</p>
        </div>
      )}
    </div>
  );
};

export default EventDetailView;
