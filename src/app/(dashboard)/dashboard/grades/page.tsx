import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GradesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: submissions } = await supabase
    .from('submissions')
    .select('score, status, assignment_id, assignments(title, total_points)')
    .eq('student_id', user.id)

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-semibold text-[#206682] mb-6">Your grades</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-400 border-b">
          <th className="pb-2">Assignment</th><th className="pb-2">Score</th>
        </tr></thead>
        <tbody>
          {(submissions ?? []).map((s: any) => (
            <tr key={s.assignment_id} className="border-b">
              <td className="py-2">{s.assignments?.title}</td>
              <td className="py-2">
                {s.status === 'missing' ? <span className="text-red-500">Missing</span> : `${s.score} / ${s.assignments?.total_points}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
// master-admin and co-admins reuse this exact table without the .eq('student_id', ...)
// filter - RLS's is_admin() policy on submissions already lets them see every row
