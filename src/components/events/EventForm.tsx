import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { categoryFilterOptions } from "@/hooks/useEvents";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required.",
  }),
  date: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().min(5, {
    message: "Time is required",
  }),
  venue: z.string().min(2, {
    message: "Venue must be at least 2 characters.",
  }),
  department: z.string().optional(),
  college: z.string().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  image_url: z.string().url("Invalid URL format").optional(),
});

interface EventFormProps {
  onSubmit: (values: z.infer<typeof FormSchema>) => void;
  defaultValues?: Partial<z.infer<typeof FormSchema>>;
}

const EventForm = ({ onSubmit, defaultValues }: EventFormProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: "onChange"
  });

  const { control, register, handleSubmit, formState } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          placeholder="NextFest Hackathon"
          {...register("name")}
        />
        {formState.errors.name && (
          <p className="text-sm text-destructive">{formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => form.setValue("category", value)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryFilterOptions.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formState.errors.category && (
          <p className="text-sm text-destructive">{formState.errors.category.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      new Date(field.value).toLocaleDateString()
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {formState.errors.date && (
            <p className="text-sm text-destructive">{formState.errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            type="time"
            id="time"
            {...register("time")}
          />
          {formState.errors.time && (
            <p className="text-sm text-destructive">{formState.errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="venue">Venue</Label>
        <Input
          id="venue"
          placeholder="Main Auditorium"
          {...register("venue")}
        />
        {formState.errors.venue && (
          <p className="text-sm text-destructive">{formState.errors.venue.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department (optional)</Label>
          <Input
            id="department"
            placeholder="Computer Science"
            {...register("department")}
          />
          {formState.errors.department && (
            <p className="text-sm text-destructive">{formState.errors.department.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="college">College (optional)</Label>
          <Input
            id="college"
            placeholder="College of Engineering"
            {...register("college")}
          />
          {formState.errors.college && (
            <p className="text-sm text-destructive">{formState.errors.college.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Write a detailed description about the event..."
          {...register("description")}
        />
        {formState.errors.description && (
          <p className="text-sm text-destructive">{formState.errors.description.message}</p>
        )}
      </div>

      {/* Inside the form, replace the image upload field with: */}
      <div className="space-y-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          placeholder="https://example.com/image.jpg"
          {...register("image_url")}
        />
        <p className="text-xs text-muted-foreground">
          Enter a URL for the event image. Leave blank for no image.
        </p>
        {formState.errors.image_url && (
          <p className="text-sm text-destructive">
            {formState.errors.image_url.message}
          </p>
        )}
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
};

export default EventForm;
