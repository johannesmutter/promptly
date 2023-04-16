import { createClient } from '@supabase/supabase-js'
const PUBLIC_SUPABASE_URL ='https://oqvtsxloditwtbluiwyu.supabase.co' //import.meta.env.VITE_SUPBABASE_URL;
const PUBLIC_SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdnRzeGxvZGl0d3RibHVpd3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0NzQ5MTksImV4cCI6MTk5NDA1MDkxOX0.3x5m2FCZ7o3Ycoa_qy7J7DidYoVoopF0__tReAWVZO4'
//import.meta.env.VITE_SUPBABASE_ANON;
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)