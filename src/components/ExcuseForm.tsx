'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

export default function ExcuseForm({ sessionId, alreadyGiven }: { sessionId: string; alreadyGiven: boolean }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(alreadyGiven)
  const supabase = createClient()

  async function submit() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('attendance').update({ excuse_given: true, excuse_text: text })
      .eq('session_id', sessionId).eq('student_id', user.id)
    setSent(true)
  }

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#206682] text-sm">
          Excuse submitted.
        </motion.p>
      ) : (
        <motion.div key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Why did you miss this session?"
            className="w-full border rounded-lg p-3 text-sm" rows={3} />
          <button onClick={submit} disabled={!text.trim()} className="px-4 py-2 rounded-lg bg-[#206682] text-white text-sm">
            Submit excuse
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
