'use client'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 24px -8px rgba(32,102,130,0.18)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-white border border-gray-100 rounded-xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}
