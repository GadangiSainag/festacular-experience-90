// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://widltnhclknilmdlgxex.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZGx0bmhjbGtuaWxtZGxneGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzQxNzIsImV4cCI6MjA1ODA1MDE3Mn0.B_hcd5wWzr3ISB7YUJO2KQYoy9msiPr4Mrwkshpz9XQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);