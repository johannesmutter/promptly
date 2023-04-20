import { createClient } from "@supabase/auth-helpers-sveltekit"
//import {VITE_PUBLIC_SUPABASE_ANON_KEY, VITE_PUBLIC_SUPABASE_URL, } from "$env/static/public"
let PUBLIC_SUPABASE_URL = process.env.VITE_PUBLIC_SUPABASE_URL;

let PUBLIC_SUPABASE_ANON_KEY = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
//
//
export const supabaseClient = createClient(
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_ANON_KEY,
)
