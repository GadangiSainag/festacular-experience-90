import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Event, EventCategory } from "@/types";
import { toast } from "sonner";
import { safeEvent } from "@/lib/utils";
import { db } from "@/integrations/supabase/db";

const eventCategories: EventCategory[] = [
  'competition',
  'workshop',
  'stall',
  'exhibit',
  'performance',
  'lecture',
  'game',
  'food',
  'merch',
  'art'
];

const eventSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  category: z.enum([
    'competition',
    'workshop',
    'stall',
    'exhibit',
    'performance',
    'lecture',
    'game',
    'food',
    'merch',
    'art'
  ] as const),
  department: z.string().optional(),
  college: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  venue: z.string().min(1, { message: "Venue is required" }),
  longitude: z.coerce.number().optional(),
  latitude: z.coerce.number().optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event: Event | null;
  onSuccess: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event ? {
      name: event.name,
      category: event.category,
      department: event.department || '',
      college: event.college || '',
      date: event.date,
      time: event.time,
      venue: event.venue,
      longitude: event.longitude || undefined,
      latitude: event.latitude || undefined,
      description: event.description || '',
      image_url: event.image_url || '',
    } : {
      name: '',
      category: 'competition',
      department: '',
      college: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      venue: '',
      description: '',
      image_url: '',
    },
  });
  
  const onSubmit = async (values: EventFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (event) {
        // Update existing event
        await db.events.update(event.id, {
          ...values,
          updated_at: new Date().toISOString(),
        });
        
        toast.success("Event updated successfully");
      } else {
        // Create new event
        await db.events.insert({
          ...values,
          organizer_id: user.id,
          is_approved: user.type === 'admin', // Auto-approve for admins
        });
        
        toast.success("Event created successfully");
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error saving event:", error);
      toast.error(error.message || "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Tech Expo 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {eventCategories.map(category => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Computer Science" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College</FormLabel>
                <FormControl>
                  <Input placeholder="JNTUH" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time*</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="venue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venue*</FormLabel>
                <FormControl>
                  <Input placeholder="Main Auditorium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  URL to an image for the event
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="78.3913" 
                      {...field} 
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.000001"
                      placeholder="17.4930" 
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Event details and description..." 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : event ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
