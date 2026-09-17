import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service'

const resend = new Resend(process.env.RESEND_API_KEY)

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
  const in23h = new Date(Date.now() + 23 * 60 * 60 * 1000)
  const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // runs hourly - the 23-24h window means each assignment is caught exactly once
  const { data: dueSoon } = await service.from('assignments').select('id, title, chapter_id, lesson_id')
    .eq('status', 'open').gte('deadline', in23h.toISOString()).lt('deadline', in24h.toISOString())

  let sent = 0
  for (const assignment of dueSoon ?? []) {
    const courseId = await getCourseId(service, assignment)
    if (!courseId) continue

    const { data: enrolled } = await service.from('enrollments').select('student_id').eq('course_id', courseId).eq('payment_status', 'paid')
    const { data: submitted } = await service.from('submissions').select('student_id').eq('assignment_id', assignment.id)
    const submittedIds = new Set((submitted ?? []).map((s: any) => s.student_id))

    for (const e of enrolled ?? []) {
      if (submittedIds.has(e.student_id)) continue
      const { data: authUser } = await service.auth.admin.getUserById(e.student_id)
      if (!authUser?.user?.email) continue
      await resend.emails.send({
        from: 'Bioacademy <no-reply@bioacademy.com>',
        to: authUser.user.email,
        subject: `Reminder: "${assignment.title}" is due in 24 hours`,
        html: `<p>Just a heads up — "${assignment.title}" closes in about 24 hours. Don't forget to submit.</p>`,
      })
      sent++
    }
  }
  return NextResponse.json({ sent })
}
