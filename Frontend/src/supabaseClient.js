import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qubteobnlyvbaiteaxwv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1YnRlb2JubHl2YmFpdGVheHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyODYwMTIsImV4cCI6MjA2NDg2MjAxMn0.yMc8PU0KrOcxY0c5WrrdQ0R_ULy4p8BAHsue75GN1V4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
