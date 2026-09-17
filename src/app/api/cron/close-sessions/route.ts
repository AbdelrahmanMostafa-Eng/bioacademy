import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const service = createServiceClient()
  const now = new Date().toISOString()

  const { data: ended } = await service.from('live_sessions')
    .select('id, course_id').eq('status', 'scheduled').lt('end_time', now)

  for (const session of ended ?? []) {
    await service.from('live_sessions').update({ status: 'ended' }).eq('id', session.id)

    const { data: enrolled } = await service.from('enrollments')
      .select('student_id').eq('course_id', session.course_id).eq('payment_status', 'paid')
    const { data: present } = await service.from('attendance').select('student_id').eq('session_id', session.id)
    const presentIds = new Set((present ?? []).map((p: any) => p.student_id))

    const absentees = (enrolled ?? [])
      .filter((e: any) => !presentIds.has(e.student_id))
      .map((e: any) => ({ session_id: session.id, student_id: e.student_id, status: 'absent' }))
    if (absentees.length) await service.from('attendance').insert(absentees)
  }
  return NextResponse.json({ closed: ended?.length ?? 0 })
}
