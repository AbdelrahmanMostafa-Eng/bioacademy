import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

async function getCourseId(service: any, assignment: any): Promise<string | null> {
  if (assignment.chapter_id) {
    const { data } = await service.from('chapters').select('course_id').eq('id', assignment.chapter_id).single()
    return data?.course_id ?? null
  }
  const { data: lesson } = await service.from('lessons').select('chapter_id').eq('id', assignment.lesson_id).single()
  if (!lesson) return null
  const { data: chapter } = await service.from('chapters').select('course_id').eq('id', lesson.chapter_id).single()
  return chapter?.course_id ?? null
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const service = createServiceClient()
  const now = new Date().toISOString()

  const { data: overdue } = await service.from('assignments')
    .select('id, chapter_id, lesson_id').eq('status', 'open').lt('deadline', now)

  for (const assignment of overdue ?? []) {
    await service.from('assignments').update({ status: 'closed' }).eq('id', assignment.id)
    const courseId = await getCourseId(service, assignment)
    if (!courseId) continue

    const { data: enrolled } = await service.from('enrollments')
      .select('student_id').eq('course_id', courseId).eq('payment_status', 'paid')
    const { data: submitted } = await service.from('submissions').select('student_id').eq('assignment_id', assignment.id)
    const submittedIds = new Set((submitted ?? []).map((s: any) => s.student_id))

    const missing = (enrolled ?? [])
      .filter((e: any) => !submittedIds.has(e.student_id))
      .map((e: any) => ({ assignment_id: assignment.id, student_id: e.student_id, score: 0, status: 'missing' }))
    if (missing.length) await service.from('submissions').insert(missing)
  }

  return NextResponse.json({ closed: overdue?.length ?? 0 })
}
