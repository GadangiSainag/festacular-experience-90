import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/custom-badge";
import { toast } from "sonner";
import { Event } from "@/types";
import { formatDate } from "@/lib/utils";
import { 
  Calendar,
  Clock,
  Eye,
  MapPin,
  MoreVertical,
  PenSquare,
  Plus,
  Trash2 
} from "lucide-react";
import EventForm from "./EventForm";
import { db } from "@/integrations/supabase/db";

interface EventManagementProps {
  events: Event[];
}

const EventManagement: React.FC<EventManagementProps> = ({ events }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await db.events.delete(eventToDelete.id);
      
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      toast.success("Event deleted successfully");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error.message || "Failed to delete event");
    } finally {
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };
  
  const openDeleteDialog = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };
  
  const openEditForm = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };
  
  const openCreateForm = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>
              Create and manage your events
            </CardDescription>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">You haven't created any events yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={openCreateForm}
              >
                Create Your First Event
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center text-muted-foreground text-xs mt-1">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {event.venue}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.is_approved ? "success" : "secondary"}>
                        {event.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/event/${event.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditForm(event)}>
                            <PenSquare className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => openDeleteDialog(event)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editingEvent 
                ? 'Update your event details below' 
                : 'Fill in the details to create a new event'}
            </DialogDescription>
          </DialogHeader>
          <EventForm 
            event={editingEvent} 
            onSuccess={() => {
              setIsFormOpen(false);
              queryClient.invalidateQueries({ queryKey: ['userEvents'] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventManagement;
