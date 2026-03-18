import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser-safe client (uses anon key, available on client and server)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side admin client (service role) — only created on the server
export const supabaseAdmin =
  typeof window === 'undefined'
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    : (null as unknown as ReturnType<typeof createClient>)
