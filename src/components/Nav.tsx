'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'

const LINKS: Record<string, { href: string; label: string }[]> = {
  master_admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/settings', label: 'Settings' },
  ],
  co_admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/students', label: 'Students' },
    { href: '/admin/reports', label: 'Reports' },
  ],
  student: [
    { href: '/dashboard', label: 'My courses' },
    { href: '/dashboard/schedule', label: 'Schedule' },
    { href: '/dashboard/grades', label: 'Grades' },
  ],
}

export default function Nav({ role, fullName }: { role: string; fullName: string }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const links = LINKS[role] ?? LINKS.student

  // shrinks and picks up a blurred backdrop once you've scrolled past the top -
  // a small, common signal that a site was actually designed, not just assembled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`border-b sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-md border-gray-200' : 'bg-white border-gray-100'
    }`}>
      <div className={`max-w-6xl mx-auto flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`}>
        <Link href="/" className="font-semibold text-[#206682]">Bioacademy</Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-600 hover:text-[#206682] relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-[#206682] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <span className="hidden md:inline text-sm text-gray-400">{fullName}</span>
        <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-72 bg-white shadow-xl z-50 p-6"
          >
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="mb-8">
              <X size={22} />
            </button>
            <div className="flex flex-col gap-5">
              {links.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="text-gray-700">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
