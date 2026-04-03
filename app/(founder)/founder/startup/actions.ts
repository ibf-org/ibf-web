'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function upsertStartupProfile(founderId: string, startupData: any) {
  const supabase = await createSupabaseServerClient()
  
  // See if startup exists
  const { data: existing } = await supabase
    .from('startups')
    .select('id')
    .eq('founder_id', founderId)
    .single()

  let result
  if (existing) {
    result = await supabase
      .from('startups')
      .update({ ...startupData, updated_at: new Date().toISOString() })
      .eq('founder_id', founderId)
  } else {
    result = await supabase
      .from('startups')
      .insert({ ...startupData, founder_id: founderId })
  }

  if (result.error) {
    console.error('Error upserting startup:', result.error)
    return { success: false, error: result.error.message }
  }

  revalidatePath('/founder/startup')
  revalidatePath('/startups')
  revalidatePath(`/u/[username]`, 'page')
  return { success: true }
}
