
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FestivalUpdate, EventUpdate } from "@/types";
import { toast } from "@/hooks/use-toast";

const UpdatesNotification = () => {
  const { user } = useAuth();
  const [festivalUpdates, setFestivalUpdates] = useState<FestivalUpdate[]>([]);
  const [eventUpdates, setEventUpdates] = useState<EventUpdate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial updates
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        // Fetch festival updates
        const { data: festivalData, error: festivalError } = await supabase
          .from("festival_updates")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (festivalError) throw festivalError;
        
        // Fetch event updates
        const { data: eventData, error: eventError } = await supabase
          .from("event_updates")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (eventError) throw eventError;
        
        setFestivalUpdates(festivalData || []);
        setEventUpdates(eventData || []);
        
        // Calculate unread count (this would typically use a "last_read" timestamp in a real app)
        // For this example, we'll just show the total as unread
        setUnreadCount((festivalData?.length || 0) + (eventData?.length || 0));
      } catch (error) {
        console.error("Error fetching updates:", error);
      }
    };
    
    fetchUpdates();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    // Listen for new festival updates
    const festivalChannel = supabase
      .channel('festival_updates_changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'festival_updates' 
        },
        (payload) => {
          const newUpdate = payload.new as FestivalUpdate;
          setFestivalUpdates(prev => [newUpdate, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: "New Festival Update",
            description: newUpdate.message.substring(0, 100) + (newUpdate.message.length > 100 ? '...' : ''),
          });
        }
      )
      .subscribe();
    
    // Listen for new event updates
    const eventChannel = supabase
      .channel('event_updates_changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'event_updates' 
        },
        (payload) => {
          const newUpdate = payload.new as EventUpdate;
          setEventUpdates(prev => [newUpdate, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast({
            title: "New Event Update",
            description: newUpdate.message.substring(0, 100) + (newUpdate.message.length > 100 ? '...' : ''),
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(festivalChannel);
      supabase.removeChannel(eventChannel);
    };
  }, []);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark as read when opening
      setUnreadCount(0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          <p className="text-xs text-muted-foreground">Latest updates from the fest</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {festivalUpdates.length === 0 && eventUpdates.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No updates yet
            </div>
          ) : (
            <>
              {festivalUpdates.map(update => (
                <div key={update.id} className="p-3 border-b hover:bg-muted/50">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium">Festival Update</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDate(update.created_at)}
                      </p>
                      <p className="text-sm">{update.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {eventUpdates.map(update => (
                <div key={update.id} className="p-3 border-b hover:bg-muted/50">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Event Update</p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDate(update.created_at)}
                      </p>
                      <p className="text-sm">{update.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UpdatesNotification;
