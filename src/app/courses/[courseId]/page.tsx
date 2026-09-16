import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function CoursePreviewPage({ params }: { params: { courseId: string } }) {
  const supabase = await createClient()
  const { data: course } = await supabase
    .from('courses')
    .select('*, chapters(id, title, order_index)')
    .eq('id', params.courseId)
    .eq('status', 'published')
    .single()

  if (!course) notFound()

  const chapters = (course.chapters ?? []).sort((a: any, b: any) => a.order_index - b.order_index)

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <span className="text-xs uppercase tracking-wide text-[#8a5a00] bg-[#FFA00122] px-2 py-1 rounded">
        {course.type === 'basics' ? 'Basics' : 'Advanced'}
      </span>
      <h1 className="text-3xl font-semibold text-[#206682] mt-3 mb-2">{course.title}</h1>
      <p className="text-gray-500 mb-6">{course.batch_label} · {course.price_egp} EGP</p>
      <h2 className="font-medium text-gray-700 mb-3">What's inside</h2>
      <ul className="space-y-2 mb-8">
        {chapters.map((ch: any) => <li key={ch.id} className="text-gray-600">— {ch.title}</li>)}
      </ul>
      <Button className="w-full md:w-auto">Enroll now</Button>
    </div>
  )
}
