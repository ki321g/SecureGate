/*
 * Name: supabase.jsx
 * 
 * Description: This file is used to create a supabase client and export it to be used in other files.
 * 
 * Video Tutorial: https://youtu.be/tnt2y7D3V9o
*/
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase