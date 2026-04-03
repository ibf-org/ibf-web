import { seedCommunityChannels } from '@/lib/stream-server'

export async function POST(req: Request) {
  // Secret-based auth — prevents unauthorized seeding
  const body = await req.json()
  if (body.secret !== process.env.SEED_SECRET) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const results = await seedCommunityChannels()
    return Response.json({ success: true, results })
  } catch (err: unknown) {
    console.error('Seed error:', err)
    return Response.json({ error: 'Failed to seed channels' }, { status: 500 })
  }
}
