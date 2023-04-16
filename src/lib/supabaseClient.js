import { createClient } from '@supabase/supabase-js'
const PUBLIC_SUPABASE_URL = import.meta.env.VITE_SUPBABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPBABASE_ANON;
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)