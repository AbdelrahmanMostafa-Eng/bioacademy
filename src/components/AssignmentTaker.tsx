'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'

type Question = { id: string; question_text: string; option_a: string; option_b: string; option_c: string | null; option_d: string | null }

export default function AssignmentTaker({ assignmentId }: { assignmentId: string }) {
  const [assignment, setAssignment] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/assignments/${assignmentId}`).then((r) => r.json()).then((data) => {
      setAssignment(data.assignment)
      setQuestions(data.questions ?? [])
      setTimeLeft(Math.max(0, new Date(data.assignment.deadline).getTime() - Date.now()))
    })
  }, [assignmentId])

  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1000)), 1000)
    return () => clearInterval(t)
  }, [submitted])

  async function handleSubmit() {
    const res = await fetch('/api/submissions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, answers }),
    })
    if (res.ok) setSubmitted(true)
  }

  if (!assignment) return <p className="text-gray-400">Loading…</p>
  if (submitted) return <p className="text-[#206682] font-medium">Submitted — your score will appear in Grades shortly.</p>

  const minutes = Math.floor(timeLeft / 60000)
  const urgent = minutes < 10

  return (
    <div className="max-w-xl mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-[#206682]">{assignment.title}</h1>
        <motion.span animate={urgent ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: urgent ? Infinity : 0, duration: 1 }}
          className={`text-sm font-medium ${urgent ? 'text-red-600' : 'text-gray-500'}`}>
          {minutes} min left
        </motion.span>
      </div>
      {questions.map((q, i) => (
        <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="border rounded-lg p-4 bg-white">
          <p className="font-medium mb-3">{i + 1}. {q.question_text}</p>
          {(['a', 'b', 'c', 'd'] as const).map((opt) => {
            const text = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }[opt]
            if (!text) return null
            return (
              <label key={opt} className="flex items-center gap-2 mb-2">
                <input type="radio" name={q.id} value={opt}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))} className="accent-[#206682]" />
                {text}
              </label>
            )
          })}
        </motion.div>
      ))}
      <Button onClick={handleSubmit} disabled={timeLeft <= 0} className="w-full">Submit and lock</Button>
    </div>
  )
}
