import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (for client components) — safe to import anywhere
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey)

// Server client (for Server Components and Route Handlers)
// `cookies` is imported dynamically so this module stays importable in client components.
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch { }
      },
    },
  })
}

// Bypassing strict TS typings for Supabase relations to eliminate inferred never type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
