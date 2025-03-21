
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Update {
  id: string;
  message: string;
  admin_id: string;
  created_at: string;
  admin_name?: string;
}

const FestivalUpdates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from("festival_updates")
        .select(`
          *,
          users:admin_id (name)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      const formattedUpdates = data.map(update => ({
        ...update,
        admin_name: update.users?.name || "Unknown Admin"
      }));
      
      setUpdates(formattedUpdates);
    } catch (error) {
      console.error("Error fetching festival updates:", error);
      toast({
        title: "Error",
        description: "Failed to load festival updates.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUpdates();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel("festival-updates-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "festival_updates" },
        async (payload) => {
          console.log("New festival update:", payload);
          
          // Fetch the user name for the new update
          const { data: userData } = await supabase
            .from("users")
            .select("name")
            .eq("id", payload.new.admin_id)
            .single();
            
          const newUpdate = {
            ...payload.new,
            admin_name: userData?.name || "Unknown Admin"
          };
          
          setUpdates(prev => [newUpdate, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Removing channel subscription");
      subscription.unsubscribe();
    };
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUpdates();
    setRefreshing(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || user.type !== 'admin') return;
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("festival_updates")
        .insert([{
          message: newMessage.trim(),
          admin_id: user.id
        }]);
        
      if (error) throw error;
      
      setNewMessage("");
      
      toast({
        title: "Success",
        description: "Festival update has been posted.",
      });
    } catch (error) {
      console.error("Error posting festival update:", error);
      toast({
        title: "Error",
        description: "Failed to post festival update.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container max-w-4xl mx-auto px-4 py-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Festival Updates</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <div className="bg-card rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 bg-primary text-primary-foreground">
          <h2 className="text-lg font-semibold">NextFest Announcements</h2>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-4 flex flex-col-reverse">
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading updates...</p>
              </div>
            </div>
          ) : updates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No festival updates yet.
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex flex-col rounded-lg bg-secondary/10 p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-primary">{update.admin_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(update.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="mt-1 text-foreground">{update.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {user && user.type === 'admin' && (
          <>
            <Separator />
            <form onSubmit={handleSubmit} className="p-4 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your announcement here..."
                disabled={submitting}
                className="flex-1"
              />
              <Button type="submit" disabled={submitting || !newMessage.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FestivalUpdates;
