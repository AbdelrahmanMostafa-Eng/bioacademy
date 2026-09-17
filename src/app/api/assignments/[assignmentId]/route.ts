import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

export async function GET(req: NextRequest, { params }: { params: { assignmentId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: assignment } = await service.from('assignments').select('*').eq('id', params.assignmentId).single()
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const courseId = await getCourseId(service, assignment)
  const { data: enrollment } = await service.from('enrollments')
    .select('payment_status').eq('student_id', user.id).eq('course_id', courseId).maybeSingle()
  if (!enrollment || enrollment.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
  }

  // deliberately selecting every column EXCEPT correct_option - see step 7's warning box
  const { data: questions } = await service
    .from('questions')
    .select('id, question_text, option_a, option_b, option_c, option_d, order_index')
    .eq('assignment_id', params.assignmentId)
    .order('order_index')

  return NextResponse.json({ assignment, questions })
}
