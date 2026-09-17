import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (!user || !profile || !['master_admin', 'co_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const courseId = req.nextUrl.searchParams.get('courseId')
  const service = createServiceClient()

  const { data: chapters } = await service.from('chapters').select('id').eq('course_id', courseId)
  const chapterIds = (chapters ?? []).map((c: any) => c.id)
  const { data: assignments } = await service.from('assignments').select('id')
    .in('chapter_id', chapterIds.length ? chapterIds : ['00000000-0000-0000-0000-000000000000'])
  const assignmentIds = (assignments ?? []).map((a: any) => a.id)

  const { data: questions } = await service.from('questions').select('id, question_text, correct_option')
    .in('assignment_id', assignmentIds.length ? assignmentIds : ['00000000-0000-0000-0000-000000000000'])
  const { data: submissions } = await service.from('submissions').select('selected_answers')
    .in('assignment_id', assignmentIds.length ? assignmentIds : ['00000000-0000-0000-0000-000000000000'])

  const results = (questions ?? []).map((q: any) => {
    let wrong = 0, total = 0
    for (const s of submissions ?? []) {
      const answers = (s.selected_answers ?? {}) as Record<string, string>
      if (answers[q.id]) { total++; if (answers[q.id] !== q.correct_option) wrong++ }
    }
    return { question: q.question_text, wrongRate: total > 0 ? Math.round((wrong / total) * 100) : 0, total }
  }).sort((a: any, b: any) => b.wrongRate - a.wrongRate)

  return NextResponse.json({ results })
}
