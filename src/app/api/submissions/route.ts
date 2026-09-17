import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { assignmentId, answers } = await req.json()
  const service = createServiceClient()

  const { data: questions } = await service.from('questions').select('id, correct_option').eq('assignment_id', assignmentId)
  const { data: assignment } = await service.from('assignments').select('total_points, deadline').eq('id', assignmentId).single()

  if (assignment && new Date(assignment.deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Deadline has passed' }, { status: 403 })
  }

  const total = questions?.length ?? 0
  const correct = (questions ?? []).filter((q: any) => answers[q.id] === q.correct_option).length
  const score = total > 0 ? Math.round((correct / total) * (assignment?.total_points ?? 100)) : 0

  const { error } = await service.from('submissions').upsert({
    assignment_id: assignmentId, student_id: user.id, selected_answers: answers,
    score, status: 'submitted', submitted_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ score, total: assignment?.total_points ?? 100 })
}
