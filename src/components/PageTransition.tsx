'use client'
import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'

// wrap {children} in the root layout with this - every route change
// fades and lifts slightly instead of hard-cutting to a blank page
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
