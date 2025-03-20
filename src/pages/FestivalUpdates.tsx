
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FestivalUpdate } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const FestivalUpdates = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [updates, setUpdates] = useState<FestivalUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("festival_updates")
          .select("*, admin:admin_id(name)")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        console.log("Fetched festival updates:", data);
        setUpdates(data || []);
      } catch (error) {
        console.error("Error fetching festival updates:", error);
        toast({
          title: "Error",
          description: "Failed to load festival updates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpdates();
    
    // Enable realtime on the festival_updates table
    const enableRealtime = async () => {
      try {
        // Subscribe to real-time updates
        const channel = supabase
          .channel('festival_updates_channel')
          .on(
            'postgres_changes',
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'festival_updates' 
            },
            async (payload) => {
              console.log("New festival update received:", payload);
              // Fetch the complete update with admin details
              const { data, error } = await supabase
                .from("festival_updates")
                .select("*, admin:admin_id(name)")
                .eq("id", payload.new.id)
                .single();
              
              if (!error && data) {
                console.log("Complete festival update data:", data);
                setUpdates(prev => [data, ...prev]);
                
                // Show toast notification for new updates
                toast({
                  title: "New Festival Update",
                  description: data.message.substring(0, 100) + (data.message.length > 100 ? '...' : ''),
                });
              }
            }
          )
          .subscribe((status: any) => {
            console.log("Subscription status:", status);
          });
        
        channelRef.current = channel;
      } catch (error) {
        console.error("Error setting up realtime:", error);
      }
    };
    
    enableRealtime();
    
    return () => {
      // Cleanup subscription on unmount
      if (channelRef.current) {
        console.log("Removing channel subscription");
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.type !== "admin") {
      toast({
        title: "Permission Denied",
        description: "Only administrators can post festival updates.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newUpdate.trim()) {
      toast({
        title: "Empty Update",
        description: "Please enter an update message.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("festival_updates")
        .insert([
          {
            message: newUpdate.trim(),
            admin_id: user.id,
          }
        ]);
      
      if (error) throw error;
      
      setNewUpdate("");
      toast({
        title: "Update Posted",
        description: "Your festival update has been posted successfully.",
      });
      
      // Force a refetch of updates
      queryClient.invalidateQueries({ queryKey: ['festival_updates'] });
    } catch (error) {
      console.error("Error posting festival update:", error);
      toast({
        title: "Error",
        description: "Failed to post update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Festival Updates</h1>
          <p className="text-muted-foreground">Latest announcements and information about the festival</p>
        </div>
        
        {user?.type === "admin" && (
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Post a new festival update..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Update"}
                </Button>
              </div>
            </form>
            <Separator className="my-8" />
          </div>
        )}
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-20 bg-muted rounded mb-2"></div>
                </div>
              ))}
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No festival updates available yet.</p>
            </div>
          ) : (
            updates.map((update) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-lg border p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {/* @ts-ignore - Dynamic property from join */}
                      {update.admin?.name || "Admin"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(update.created_at)}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{update.message}</p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FestivalUpdates;
