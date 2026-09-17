'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LiveAttendanceCount from '@/components/LiveAttendanceCount'

export default function JoinSessionPage({ params }: { params: { sessionId: string } }) {
  const [session, setSession] = useState<any>(null)
  const [marking, setMarking] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('live_sessions').select('*').eq('id', params.sessionId).single().then(({ data }) => setSession(data))
  }, [params.sessionId, supabase])

  async function handleJoin() {
    setMarking(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !session) return

    // the present mark writes BEFORE the redirect - attendance is logged
    // even if the student closes the tab the instant Zoom opens
    await supabase.from('attendance').upsert({
      session_id: session.id, student_id: user.id, status: 'present', marked_at: new Date().toISOString(),
    }, { onConflict: 'session_id,student_id' })

    window.location.href = session.zoom_link
  }

  if (!session) return <p className="text-gray-400 text-center py-20">Loading…</p>

  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <h1 className="text-xl font-semibold text-[#206682] mb-2">Ready to join?</h1>
      <p className="text-gray-500 mb-8">Clicking below marks you present, then opens Zoom.</p>
      <button onClick={handleJoin} disabled={marking} className="px-8 py-3 rounded-xl bg-[#206682] text-white font-medium">
        {marking ? 'Marking present…' : 'Join session'}
      </button>
    </div>
  )
}
// an admin viewing this same session separately would mount LiveAttendanceCount
// alongside it to watch the present-count tick up as students click Join
