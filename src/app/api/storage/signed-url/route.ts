import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

const ALLOWED_BUCKETS = ['lesson-pdfs', 'reports', 'certificates']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { bucket, path } = await req.json()
  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: 'Unknown bucket' }, { status: 400 })
  }

  // trusts the enrollment check already done by the page that rendered
  // whatever asked for this URL (e.g. the lesson page from step 17) -
  // this route's job is just brokering the signed URL through the service
  // role, since students have no direct RLS grant on these buckets at all
  const service = createServiceClient()
  const { data, error } = await service.storage.from(bucket).createSignedUrl(path, 60 * 30)
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ url: data.signedUrl })
}
