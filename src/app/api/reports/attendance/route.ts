import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import AttendanceReport from '@/lib/pdf/AttendanceReport'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (!user || !profile || !['master_admin', 'co_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await req.json()
  const service = createServiceClient()

  const { data: session } = await service.from('live_sessions').select('*, courses(title)').eq('id', sessionId).single()
  if (!session || session.status !== 'ended') {
    return NextResponse.json({ error: 'Session must be ended first' }, { status: 400 })
  }

  const { data: attendance } = await service
    .from('attendance').select('status, excuse_given, excuse_text, profiles(full_name)').eq('session_id', sessionId)

  const rows = (attendance ?? []).map((a: any) => ({
    name: a.profiles?.full_name ?? 'Unknown',
    status: a.status === 'present' ? 'Present' : (a.excuse_given ? 'Absent — excuse given' : 'Absent — no excuse'),
    excuse: a.excuse_text ?? '',
  }))

  const buffer = await renderToBuffer(
    AttendanceReport({ courseTitle: session.courses?.title ?? '', sessionDate: new Date(session.start_time).toLocaleDateString(), rows })
  )

  const path = `${session.course_id}/${sessionId}-attendance.pdf`
  await service.storage.from('reports').upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  await service.from('generated_reports').insert({ course_id: session.course_id, report_type: 'attendance', file_url: path, generated_by: user.id })

  return NextResponse.json({ path })
}
