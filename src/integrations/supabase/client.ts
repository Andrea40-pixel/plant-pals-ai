// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fnijzgectnqzsshrsjyl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaWp6Z2VjdG5xenNzaHJzanlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMDYyNDgsImV4cCI6MjA1NDc4MjI0OH0.Gc62czei7ZaxbMhAFCtQvRqr26VT5oYZZgfkc8fic_s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);