'use client'
import { motion } from 'motion/react'
import Link from 'next/link'

type Session = { id: string; zoom_link: string; start_time: string; end_time: string }

export default function ScheduleList({ sessions }: { sessions: Session[] }) {
  const now = Date.now()
  return (
    <div className="space-y-3">
      {sessions.map((s, i) => {
        const start = new Date(s.start_time)
        const end = new Date(s.end_time)
        const isLive = now >= start.getTime() && now <= end.getTime()
        const isPast = now > end.getTime()
        return (
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`border rounded-xl p-4 flex items-center justify-between ${isLive ? 'border-[#206682] bg-[#20668208]' : ''}`}>
            <div>
              <p className="font-medium">{start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#206682] font-medium mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#206682] animate-pulse" /> Live now
                </span>
              )}
              {isPast && <span className="text-xs text-gray-400 mt-1 block">Ended</span>}
            </div>
            {!isPast && (
              <Link href={`/dashboard/schedule/${s.id}`} className="px-4 py-2 rounded-lg bg-[#206682] text-white text-sm font-medium">
                Join session
              </Link>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
