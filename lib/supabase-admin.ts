/**
 * SERVER-ONLY: This file must never be imported by client components.
 * It uses SUPABASE_SERVICE_ROLE_KEY which is not exposed to the browser.
 */
import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
