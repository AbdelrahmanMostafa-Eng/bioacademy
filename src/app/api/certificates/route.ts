import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import Certificate from '@/lib/pdf/Certificate'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId } = await req.json()
  const service = createServiceClient()

  const { data: chapters } = await service.from('chapters').select('id').eq('course_id', courseId)
  const chapterIds = (chapters ?? []).map((c: any) => c.id)
  const { data: lessons } = await service.from('lessons').select('id')
    .in('chapter_id', chapterIds.length ? chapterIds : ['00000000-0000-0000-0000-000000000000'])
  const lessonIds = (lessons ?? []).map((l: any) => l.id)

  const { data: byChapter } = await service.from('assignments').select('id')
    .in('chapter_id', chapterIds.length ? chapterIds : ['00000000-0000-0000-0000-000000000000'])
  const { data: byLesson } = await service.from('assignments').select('id')
    .in('lesson_id', lessonIds.length ? lessonIds : ['00000000-0000-0000-0000-000000000000'])
  const allAssignments = [...(byChapter ?? []), ...(byLesson ?? [])]

  const { data: submissions } = await service.from('submissions').select('assignment_id, status').eq('student_id', user.id)
  const submittedIds = new Set((submissions ?? []).filter((s: any) => s.status === 'submitted').map((s: any) => s.assignment_id))
  const allDone = allAssignments.every((a: any) => submittedIds.has(a.id))

  if (!allDone) return NextResponse.json({ error: 'Not all assignments are complete yet' }, { status: 403 })

  const { data: profile } = await service.from('profiles').select('full_name').eq('id', user.id).single()
  const { data: course } = await service.from('courses').select('title').eq('id', courseId).single()

  const buffer = await renderToBuffer(
    Certificate({ studentName: profile?.full_name ?? '', courseTitle: course?.title ?? '', date: new Date().toLocaleDateString() })
  )
  const path = `${courseId}/${user.id}-certificate.pdf`
  await service.storage.from('certificates').upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  await service.from('certificates').upsert({ student_id: user.id, course_id: courseId, file_url: path }, { onConflict: 'student_id,course_id' })

  return NextResponse.json({ path })
}
