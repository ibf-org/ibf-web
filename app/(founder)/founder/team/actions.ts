'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateTeamRoleTitle(teamMemberId: string, newTitle: string) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('team_members')
    .update({ role_title: newTitle })
    .eq('id', teamMemberId)
    
  if (error) {
    console.error('Update role error:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/founder/team')
  return { success: true }
}

export async function removeTeamMember(teamMemberId: string) {
  const supabase = await createSupabaseServerClient()
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', teamMemberId)
    
  if (error) {
    return { success: false, error: error.message }
  }
  
  revalidatePath('/founder/team')
  return { success: true }
}

export async function submitEndorsement(giverId: string, receiverId: string, projectId: string, body: string, skills: string[]) {
  const supabase = await createSupabaseServerClient()
  
  // Create JSON output representing the skills appended to body or just normal body
  const finalBody = skills.length > 0 ? `${body}\n\nDemonstrated Skills: ${skills.join(', ')}` : body
  
  const { error } = await supabase
    .from('endorsements')
    .insert({
      giver_id: giverId,
      receiver_id: receiverId,
      project_id: projectId,
      body: finalBody
    })
    
  if (error) {
    console.error('Endorse error:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
