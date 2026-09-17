'use client'
import { useState } from 'react'
import { motion } from 'motion/react'

export default function GenerateReportButton({ sessionId, ended }: { sessionId: string; ended: boolean }) {
  const [loading, setLoading] = useState(false)
  const [path, setPath] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    const res = await fetch('/api/reports/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.path) setPath(data.path)
  }

  if (!ended) return null

  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={loading}
      className="px-4 py-2 rounded-lg bg-[#206682] text-white text-sm font-medium">
      {loading ? 'Generating…' : path ? 'Report ready — download' : 'Generate report'}
    </motion.button>
  )
}
