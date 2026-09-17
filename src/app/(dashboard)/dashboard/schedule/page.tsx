import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScheduleList from '@/components/ScheduleList'

export default async function SchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('enrollments').select('course_id').eq('student_id', user.id).eq('payment_status', 'paid')
  const courseIds = (enrollments ?? []).map((e) => e.course_id)

  const { data: sessions } = await supabase
    .from('live_sessions').select('*')
    .in('course_id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])
    .order('start_time')

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-semibold text-[#206682] mb-6">Your schedule</h1>
      <ScheduleList sessions={sessions ?? []} />
    </div>
  )
}
