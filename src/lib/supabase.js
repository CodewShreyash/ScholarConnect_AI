import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
// One client preserves refresh-token coordination across tabs. Never use a service-role key here.
export const supabase = configured ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
export function client() {
  if (!supabase) throw new Error('Supabase is not configured. Follow README.md and add the project URL and publishable key to .env.local.');
  return supabase;
}
export function unwrap({data, error}) { if (error) throw error; return data; }
export function errorMessage(error) {
  if (error?.code === '23505') return 'You have already applied for this scholarship.';
  if (error?.code === '23503') return 'This record is linked to an application and cannot be removed.';
  return error?.message || 'Something went wrong. Please try again.';
}
