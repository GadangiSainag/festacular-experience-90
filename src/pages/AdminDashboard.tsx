
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Event as EventType, UserType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [roleRequests, setRoleRequests] = useState<User[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventType[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchRoleRequests = async () => {
      setIsLoadingRoles(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role_elevation_requested", true);
        
        if (error) throw error;
        
        setRoleRequests(data || []);
      } catch (error) {
        console.error("Error fetching role requests:", error);
        toast({
          title: "Error",
          description: "Failed to load role requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };
    
    const fetchPendingEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("is_approved", false);
        
        if (error) throw error;
        
        setPendingEvents(data || []);
      } catch (error) {
        console.error("Error fetching pending events:", error);
        toast({
          title: "Error",
          description: "Failed to load pending events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEvents(false);
      }
    };
    
    // Only fetch if user is admin
    if (user?.type === 'admin') {
      fetchRoleRequests();
      fetchPendingEvents();
    }
  }, [user]);

  const handleRoleApproval = async (userId: string, approved: boolean) => {
    try {
      const updates = approved 
        ? { type: 'organizer' as UserType, role_elevation_requested: false }
        : { role_elevation_requested: false };
      
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId);
      
      if (error) throw error;
      
      // Update local state
      setRoleRequests(prev => prev.filter(request => request.id !== userId));
      
      toast({
        title: approved ? "Role approved" : "Request declined",
        description: approved 
          ? "User has been elevated to organizer role." 
          : "Role elevation request has been declined.",
      });
    } catch (error) {
      console.error("Error handling role request:", error);
      toast({
        title: "Error",
        description: "Failed to process role request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEventApproval = async (eventId: string, approved: boolean) => {
    try {
      if (approved) {
        const { error } = await supabase
          .from("events")
          .update({ is_approved: true })
          .eq("id", eventId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("events")
          .delete()
          .eq("id", eventId);
        
        if (error) throw error;
      }
      
      // Update local state
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      
      toast({
        title: approved ? "Event approved" : "Event rejected",
        description: approved 
          ? "The event has been approved and is now visible to all users." 
          : "The event has been rejected and removed from the system.",
      });
    } catch (error) {
      console.error("Error handling event approval:", error);
      toast({
        title: "Error",
        description: "Failed to process event request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (user?.type !== 'admin') {
    return (
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage role requests and event approvals</p>
        </div>
        
        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="roles">Role Requests</TabsTrigger>
            <TabsTrigger value="events">Event Approvals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roles" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Elevation Requests</CardTitle>
                <CardDescription>Approve or decline organizer role requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRoles ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading requests...</p>
                  </div>
                ) : roleRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending role requests.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roleRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>{request.college || "—"}</TableCell>
                          <TableCell>{request.department || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRoleApproval(request.id, false)}
                              >
                                Decline
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRoleApproval(request.id, true)}
                              >
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Event Approvals</CardTitle>
                <CardDescription>Approve or reject new event submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingEvents ? (
                  <div className="h-40 flex items-center justify-center">
                    <p>Loading events...</p>
                  </div>
                ) : pendingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending event approvals.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {event.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </TableCell>
                          <TableCell>{event.venue}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleEventApproval(event.id, false)}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleEventApproval(event.id, true)}
                              >
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
