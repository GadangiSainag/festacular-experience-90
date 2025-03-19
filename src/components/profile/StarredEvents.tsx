
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { categoryColors } from "@/utils/eventUtils";

interface StarredEventsProps {
  starredEvents: Array<{
    id: string;
    events: Event;
  }>;
}

const StarredEvents: React.FC<StarredEventsProps> = ({ starredEvents }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Starred Events</CardTitle>
          <CardDescription>
            Events you've marked as favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {starredEvents.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">You haven't starred any events yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate("/")}
              >
                Explore Events
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {starredEvents.map(({ id, events: event }) => (
                <Card key={id} className="overflow-hidden">
                  {event.image_url && (
                    <div className="relative h-48 w-full">
                      <img
                        src={event.image_url}
                        alt={event.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: categoryColors[event.category]?.color || '#888',
                            color: categoryColors[event.category]?.text || 'white'
                          }}
                        >
                          {event.category}
                        </span>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg truncate">{event.name}</h3>
                    <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <Button 
                      className="mt-4 w-full"
                      onClick={() => navigate(`/event/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StarredEvents;
