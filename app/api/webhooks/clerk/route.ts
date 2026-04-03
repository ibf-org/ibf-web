import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateUsername } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) return new Response('Missing webhook secret', { status: 400 })

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, unsafe_metadata } = evt.data
    const email = email_addresses[0]?.email_address || ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'IBF User'
    const role = (unsafe_metadata?.role as string) || 'student'
    const username = generateUsername(fullName)

    try {
      // Create user in Supabase
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: id,
          email,
          role: role as 'founder' | 'student',
          full_name: fullName,
          username,
          avatar_url: image_url || null,
        })
        .select()
        .single()

      if (userError) {
        console.error('User insert error:', userError)
        return new Response('DB error', { status: 500 })
      }

      // Create profile row
      await supabaseAdmin.from('profiles').insert({ user_id: user.id })

      // Send welcome email
      await sendWelcomeEmail(email, fullName, role as 'founder' | 'student')
    } catch (err) {
      console.error('Webhook handler error:', err)
      return new Response('Internal error', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
