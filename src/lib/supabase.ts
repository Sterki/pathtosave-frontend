import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://lbymifabqfndyxzynqla.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieW1pZmFicWZuZHl4enlucWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MDM3MjgsImV4cCI6MjA3NDQ3OTcyOH0._hk3VyXDkUUu6K7SFBf5WQoxtADbo77iZ25eOnwH6gI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${window.location.origin}`,
    flowType: 'pkce'
  }
})
