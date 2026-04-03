import { supabaseAdmin } from '@/lib/supabase-admin'
import { NotificationType, NotificationPayload } from './notifications'

/**
 * Inserts a notification row into the notifications table.
 * Call this from server-side code (API routes, Server Actions, etc.)
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  payload: NotificationPayload
) {
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    type,
    payload: payload as Record<string, unknown>,
    is_read: false,
  })

  if (error) {
    console.error('[createNotification] failed:', error.message)
  }
}
