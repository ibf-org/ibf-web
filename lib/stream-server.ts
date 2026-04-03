/**
 * Stream Chat — Server-Side Client
 *
 * Production-grade server utilities for Stream Chat.
 * This file runs ONLY on the server (API routes / server components).
 * It uses STREAM_SECRET_KEY which must never be exposed to the browser.
 */

import { StreamChat } from 'stream-chat'

let _client: StreamChat | undefined

export function getStreamServerClient(): StreamChat {
  if (!_client) {
    if (!process.env.NEXT_PUBLIC_STREAM_API_KEY || !process.env.STREAM_SECRET_KEY) {
      throw new Error('Stream Chat environment variables are not configured')
    }
    _client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY,
      process.env.STREAM_SECRET_KEY,
      { timeout: 10000 }
    )
  }
  return _client
}

// ─── User Sync ──────────────────────────────────────────────────────────────

export async function upsertStreamUser(params: {
  id: string
  name: string
  image?: string
  role?: string
}) {
  const client = getStreamServerClient()
  await client.upsertUser({
    id: params.id,
    name: params.name,
    image: params.image || '',
    ibf_role: params.role || 'student',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
}

// ─── Token Generation ───────────────────────────────────────────────────────

export async function createStreamToken(userId: string): Promise<string> {
  const client = getStreamServerClient()
  // Token expires in 24 hours for security
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 24
  return client.createToken(userId, expiration)
}

// ─── Project Channels ───────────────────────────────────────────────────────

export async function createProjectChannel(params: {
  projectId: string
  projectName: string
  founderId: string
  memberIds: string[]
}): Promise<string> {
  const client = getStreamServerClient()
  const channelId = `project-${params.projectId}`
  const channel = client.channel('messaging', channelId, {
    name: params.projectName,
    members: [params.founderId, ...params.memberIds],
    created_by_id: params.founderId,
    isProjectChat: true,
    projectId: params.projectId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  await channel.create()
  return channelId
}

export async function addMemberToProjectChannel(projectId: string, userId: string) {
  const client = getStreamServerClient()
  const channelId = `project-${projectId}`
  try {
    const channel = client.channel('messaging', channelId)
    await channel.addMembers([userId])
  } catch (err) {
    console.error('Failed to add member to Stream channel:', err)
    // Don't throw — channel may not exist yet if this is the first member
  }
}

// ─── Community Channels ─────────────────────────────────────────────────────

export async function seedCommunityChannels() {
  const client = getStreamServerClient()

  // Ensure system user exists
  await client.upsertUser({
    id: 'ibf-system',
    name: 'IBF System',
    role: 'admin',
  })

  const channels = [
    { id: 'general', name: '#general', description: 'Platform-wide discussion for everyone' },
    { id: 'for-founders', name: '#for-founders', description: 'Founder peer discussions and co-founder requests' },
    { id: 'for-students', name: '#for-students', description: 'Student career tips and resources' },
    { id: 'project-ideas', name: '#project-ideas', description: 'Share early project ideas for feedback' },
    { id: 'tech', name: '#tech', description: 'Technical discussions and stack recommendations' },
    { id: 'design', name: '#design', description: 'UI/UX resources and feedback' },
    { id: 'intros', name: '#intros', description: 'Introduce yourself to the IBF community' },
  ]

  const results = []
  for (const ch of channels) {
    try {
      const channel = client.channel('team', ch.id, {
        name: ch.name,
        description: ch.description,
        created_by_id: 'ibf-system',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      await channel.create()
      results.push({ id: ch.id, status: 'created' })
    } catch (err: unknown) {
      const errorObj = err as { code?: number; message?: string };
      if (errorObj?.code === 4) {
        // Already exists
        results.push({ id: ch.id, status: 'already_exists' })
      } else {
        results.push({ id: ch.id, status: 'error', error: errorObj?.message })
      }
    }
  }
  return results
}
