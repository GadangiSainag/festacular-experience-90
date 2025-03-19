
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { supabase } from './client';
import { Event, EventCategory, User, StarredEvent, FestivalUpdate, EventUpdate } from '@/types';
import { safeEvent, safeUser, safeEventArray, safeUserArray } from '@/lib/utils';

// Type-safe database functions
export const db = {
  // Event operations
  events: {
    getAll: async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      return safeEventArray(data || []);
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) throw error;
      return safeEvent(data);
    },
    
    getByOrganizer: async (organizerId: string) => {
      const { data, error } = await supabase.from('events').select('*').eq('organizer_id', organizerId);
      if (error) throw error;
      return safeEventArray(data || []);
    },
    
    getPending: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('is_approved', false);
      if (error) throw error;
      return safeEventArray(data || []);
    },
    
    update: async (id: string, updates: Partial<Event>) => {
      const { error } = await supabase.from('events').update(updates).eq('id', id);
      if (error) throw error;
      return true;
    },
    
    insert: async (event: Partial<Event>) => {
      const { error } = await supabase.from('events').insert(event);
      if (error) throw error;
      return true;
    },
    
    delete: async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  
  // User operations
  users: {
    getById: async (id: string) => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) throw error;
      return safeUser(data);
    },
    
    getAll: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      return safeUserArray(data || []);
    },
    
    getRoleRequests: async () => {
      const { data, error } = await supabase.from('users').select('*').eq('role_elevation_requested', true);
      if (error) throw error;
      return safeUserArray(data || []);
    },
    
    update: async (id: string, updates: Partial<User>) => {
      const { error } = await supabase.from('users').update(updates).eq('id', id);
      if (error) throw error;
      return true;
    },
    
    requestRoleElevation: async (id: string) => {
      const { error } = await supabase.from('users').update({ role_elevation_requested: true }).eq('id', id);
      if (error) throw error;
      return true;
    },
    
    approveRoleRequest: async (id: string) => {
      const { error } = await supabase.from('users').update({ 
        type: 'organizer', 
        role_elevation_requested: false 
      }).eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  
  // Starred events operations
  starredEvents: {
    getByUser: async (userId: string) => {
      const { data, error } = await supabase
        .from('starred_events')
        .select(`
          id,
          events:event_id (
            id,
            name,
            category,
            date,
            time,
            venue,
            description,
            image_url,
            star_count
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    }
  },
  
  // Festival updates operations
  festivalUpdates: {
    postUpdate: async (adminId: string, message: string) => {
      const { error } = await supabase
        .from('festival_updates')
        .insert({
          message,
          admin_id: adminId
        });
      
      if (error) throw error;
      return true;
    }
  }
};
