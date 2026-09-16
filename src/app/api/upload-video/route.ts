import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!
const API_KEY = process.env.BUNNY_STREAM_API_KEY!

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const title = (formData.get('title') as string) || 'Lesson video'
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const createRes = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: { AccessKey: API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  const { guid } = await createRes.json()

  const uploadRes = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${guid}`, {
    method: 'PUT',
    headers: { AccessKey: API_KEY },
    body: file,
  })
  if (!uploadRes.ok) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const videoUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${guid}`
  return NextResponse.json({ videoUrl, guid })
}
