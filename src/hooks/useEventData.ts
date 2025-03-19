
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { db } from "@/integrations/supabase/db";
import { useParams } from "react-router-dom";

export const useEventData = () => {
  const { eventId } = useParams();
  
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) return null;
      return db.events.getById(eventId);
    },
    enabled: !!eventId,
  });
};

export const useAllEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      return db.events.getAll();
    },
  });
};
