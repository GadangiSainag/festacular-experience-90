
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/custom-badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { Event, User } from "@/types";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Send, User as UserIcon } from "lucide-react";

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [eventToApprove, setEventToApprove] = useState<Event | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  
  const { data: pendingEvents = [] } = useQuery({
    queryKey: ['pendingEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!currentUser && currentUser.type === 'admin',
  });
  
  const { data: roleRequests = [] } = useQuery({
    queryKey: ['roleRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role_elevation_requested', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
    enabled: !!currentUser && currentUser.type === 'admin',
  });
  
  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    },
    enabled: !!currentUser && currentUser.type === 'admin',
  });
  
  const handleEventApproval = async (approve: boolean) => {
    if (!eventToApprove || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_approved: approve })
        .eq('id', eventToApprove.id);
      
      if (error) throw error;
      
      toast.success(`Event ${approve ? 'approved' : 'rejected'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['pendingEvents'] });
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error(error.message || `Failed to ${approve ? 'approve' : 'reject'} event`);
    } finally {
      setIsApprovalDialogOpen(false);
      setEventToApprove(null);
    }
  };
  
  const handleRoleUpdate = async () => {
    if (!userToUpdate || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          type: 'organizer',
          role_elevation_requested: false 
        })
        .eq('id', userToUpdate.id);
      
      if (error) throw error;
      
      toast.success("User role updated to organizer");
      queryClient.invalidateQueries({ queryKey: ['roleRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Failed to update user role");
    } finally {
      setIsRoleDialogOpen(false);
      setUserToUpdate(null);
    }
  };
  
  const handleUpdateSubmit = async () => {
    if (!updateMessage.trim() || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('festival_updates')
        .insert({
          message: updateMessage,
          admin_id: currentUser.id
        });
      
      if (error) throw error;
      
      toast.success("Update posted successfully");
      setUpdateMessage("");
    } catch (error: any) {
      console.error("Error posting update:", error);
      toast.error(error.message || "Failed to post update");
    } finally {
      setIsUpdateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Pending Events</TabsTrigger>
          <TabsTrigger value="roles">Role Requests</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="updates">Festival Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Events</CardTitle>
              <CardDescription>
                Events waiting for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No pending events to approve</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Organizer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{event.organizer_id}</TableCell>
                        <TableCell>{formatDate(event.date)}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{event.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => {
                                setEventToApprove(event);
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => handleEventApproval(false)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
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
        
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Elevation Requests</CardTitle>
              <CardDescription>
                Users requesting to become organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roleRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No pending role requests</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleRequests.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setUserToUpdate(user);
                              setIsRoleDialogOpen(true);
                            }}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage all users in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center">
                        <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={
                          user.type === 'admin' 
                            ? 'destructive' 
                            : user.type === 'organizer' 
                              ? 'default' 
                              : 'secondary'
                        } className="capitalize">
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Festival Updates</CardTitle>
                <CardDescription>
                  Post updates about the festival
                </CardDescription>
              </div>
              <Button onClick={() => setIsUpdateDialogOpen(true)}>
                New Update
              </Button>
            </CardHeader>
            <CardContent>
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post Festival Update</DialogTitle>
                    <DialogDescription>
                      This update will be visible to all users on the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      placeholder="Enter your announcement..."
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateSubmit} disabled={!updateMessage.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Post Update
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{eventToApprove?.name}"?
              Once approved, it will be visible to all users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleEventApproval(true)}>
              Approve Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Role Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {userToUpdate?.name} to an organizer?
              They will be able to create and manage events.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate}>
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
