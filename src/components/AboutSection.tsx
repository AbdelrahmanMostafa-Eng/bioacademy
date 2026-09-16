'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-photo', {
        opacity: 0, x: -40, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      gsap.from('.about-text', {
        opacity: 0, y: 24, duration: 0.8, delay: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 py-20 px-6 items-center">
      <div className="about-photo relative w-full aspect-square max-w-sm mx-auto">
        <Image src="/dr-mina.png" alt="Dr. Mina Samuel" fill className="object-contain" />
      </div>
      <div className="about-text">
        <h2 className="text-3xl font-semibold text-[#206682] mb-4">Meet Dr. Mina Samuel</h2>
        <p className="text-gray-600 leading-relaxed">
          A dedicated pharmacist offering specialized courses tailored for American Diploma
          students preparing for their EST2 and ACT2 Biology exams, built on comprehensive
          understanding and effective preparation strategies.
        </p>
      </div>
    </section>
  )
}
