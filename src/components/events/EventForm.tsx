
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, Info, Map, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EventCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type EventFormData = {
  name: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: string;
  department?: string;
  college?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  image_url?: string;
  image_file?: FileList;
};

const EventForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useImageUrl, setUseImageUrl] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    }
  });

  const imageFile = watch('image_file');
  const imageUrl = watch('image_url');

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = data.image_url;

      // Handle file upload if a file was selected and not using image URL
      if (!useImageUrl && data.image_file && data.image_file.length > 0) {
        const file = data.image_file[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `event-images/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // Create event in the database
      const { error } = await supabase
        .from('events')
        .insert([
          {
            name: data.name,
            category: data.category,
            date: data.date,
            time: data.time,
            venue: data.venue,
            department: data.department || user.department,
            college: data.college || user.college,
            description: data.description,
            longitude: data.longitude,
            latitude: data.latitude,
            image_url: finalImageUrl,
            organizer_id: user.id,
            is_approved: user.type === 'admin' // Auto-approve if admin
          }
        ]);

      if (error) throw error;

      toast({
        title: "Event created",
        description: user.type === 'admin' 
          ? "Your event has been created successfully." 
          : "Your event has been submitted for approval.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Failed to create event",
        description: error.message || "An error occurred while creating the event.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleImageInputMethod = () => {
    setUseImageUrl(!useImageUrl);
    // Clear both fields when switching methods
    setValue('image_file', undefined);
    setValue('image_url', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          placeholder="Enter event name"
          {...register("name", { required: "Event name is required" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          onValueChange={(value) => setValue("category", value as EventCategory)}
          defaultValue="competition"
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="competition">Competition</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="stall">Stall</SelectItem>
            <SelectItem value="exhibit">Exhibit</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="lecture">Lecture</SelectItem>
            <SelectItem value="games">Games</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="merch">Merchandise</SelectItem>
            <SelectItem value="art">Art</SelectItem>
            <SelectItem value="sport">Sport</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              className="pl-10"
              {...register("date", { required: "Date is required" })}
            />
          </div>
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="time"
              type="time"
              className="pl-10"
              {...register("time", { required: "Time is required" })}
            />
          </div>
          {errors.time && (
            <p className="text-sm text-red-500">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue *</Label>
        <div className="relative">
          <Map className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="venue"
            placeholder="Enter venue"
            className="pl-10"
            {...register("venue", { required: "Venue is required" })}
          />
        </div>
        {errors.venue && (
          <p className="text-sm text-red-500">{errors.venue.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="Enter department"
            {...register("department")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="college">College/University</Label>
          <Input
            id="college"
            placeholder="Enter college/university"
            {...register("college")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            placeholder="Enter longitude (optional)"
            {...register("longitude", {
              valueAsNumber: true,
              validate: (value) => 
                !value || (value >= -180 && value <= 180) || 
                "Longitude must be between -180 and 180"
            })}
          />
          {errors.longitude && (
            <p className="text-sm text-red-500">{errors.longitude.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            placeholder="Enter latitude (optional)"
            {...register("latitude", {
              valueAsNumber: true,
              validate: (value) => 
                !value || (value >= -90 && value <= 90) || 
                "Latitude must be between -90 and 90"
            })}
          />
          {errors.latitude && (
            <p className="text-sm text-red-500">{errors.latitude.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="image">Event Image</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={toggleImageInputMethod}
          >
            {useImageUrl ? "Upload Image" : "Use Image URL"}
          </Button>
        </div>
        
        {useImageUrl ? (
          <Input
            id="image_url"
            placeholder="Enter image URL"
            {...register("image_url")}
          />
        ) : (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image_file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
              </div>
              <Input
                id="image_file"
                type="file"
                className="hidden"
                accept="image/*"
                {...register("image_file")}
              />
            </label>
          </div>
        )}
        
        {imageFile && imageFile[0] && !useImageUrl && (
          <div className="text-sm text-muted-foreground">
            Selected: {imageFile[0].name}
          </div>
        )}
        {imageUrl && useImageUrl && (
          <div className="text-sm text-muted-foreground">
            Image URL: {imageUrl.substring(0, 40)}...
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="description">Description</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Provide details about the event, schedule, or any other relevant information.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="description"
          placeholder="Enter event description"
          rows={5}
          {...register("description")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating Event..." : "Create Event"}
      </Button>
    </form>
  );
};

export default EventForm;
