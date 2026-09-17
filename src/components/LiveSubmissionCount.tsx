'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

// mounted on the admin's assignment view - updates live as students submit,
// the same Realtime pattern used for the attendance count in Phase 4
export default function LiveSubmissionCount({ assignmentId, totalEnrolled }: { assignmentId: string; totalEnrolled: number }) {
  const [count, setCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('assignment_id', assignmentId)
      .then(({ count }) => setCount(count ?? 0))

    const channel = supabase.channel(`submissions-${assignmentId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions', filter: `assignment_id=eq.${assignmentId}` },
        () => setCount((n) => n + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [assignmentId, supabase])

  return (
    <div className="flex items-center gap-3 bg-white border rounded-xl px-5 py-3">
      <span className="w-2 h-2 rounded-full bg-[#206682] animate-pulse" />
      <AnimatePresence mode="popLayout">
        <motion.span key={count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
          className="text-2xl font-semibold text-[#206682]">
          {count}
        </motion.span>
      </AnimatePresence>
      <span className="text-gray-400 text-sm">/ {totalEnrolled} submitted so far</span>
    </div>
  )
}
