'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

// same Realtime pattern as LiveSubmissionCount from Phase 3 - reused here for the
// live present-count an admin watches update as students click 'Join session'
export default function LiveAttendanceCount({ sessionId, totalEnrolled }: { sessionId: string; totalEnrolled: number }) {
  const [present, setPresent] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('attendance').select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId).eq('status', 'present').then(({ count }) => setPresent(count ?? 0))

    const channel = supabase.channel(`attendance-${sessionId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance', filter: `session_id=eq.${sessionId}` },
        () => setPresent((n) => n + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, supabase])

  return (
    <div className="flex items-center gap-3 bg-white border rounded-xl px-5 py-3">
      <span className="w-2 h-2 rounded-full bg-[#206682] animate-pulse" />
      <AnimatePresence mode="popLayout">
        <motion.span key={present} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
          className="text-2xl font-semibold text-[#206682]">
          {present}
        </motion.span>
      </AnimatePresence>
      <span className="text-gray-400 text-sm">/ {totalEnrolled} joined so far</span>
    </div>
  )
}
