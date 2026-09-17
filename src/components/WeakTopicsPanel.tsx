'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

export default function WeakTopicsPanel({ courseId }: { courseId: string }) {
  const [results, setResults] = useState<{ question: string; wrongRate: number; total: number }[]>([])

  useEffect(() => {
    fetch(`/api/analytics/weak-topics?courseId=${courseId}`).then((r) => r.json()).then((d) => setResults(d.results ?? []))
  }, [courseId])

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-[#206682] mb-3">Questions the class struggles with most</h3>
      {results.slice(0, 10).map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
          className="flex items-center justify-between border-b py-2 text-sm">
          <span className="text-gray-700 flex-1">{r.question}</span>
          <span className={`font-medium ml-3 ${r.wrongRate > 50 ? 'text-red-600' : 'text-[#8a5a00]'}`}>{r.wrongRate}% missed</span>
        </motion.div>
      ))}
    </div>
  )
}
