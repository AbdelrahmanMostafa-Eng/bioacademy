'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const courseSchema = z.object({
  title: z.string().min(3, 'Enter a course title'),
  type: z.enum(['basics', 'advanced']),
  batchLabel: z.string().min(3, 'e.g. "EST2 Biology - Fall 2026"'),
  priceEgp: z.coerce.number().min(0),
  prerequisiteCourseId: z.string().optional(),
})
type CourseForm = z.infer<typeof courseSchema>

export default function NewCoursePage() {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { type: 'basics', priceEgp: 6000 },
  })

  useEffect(() => {
    supabase.from('courses').select('id, title').then(({ data }) => setCourses(data ?? []))
  }, [supabase])

  async function onSubmit(values: CourseForm) {
    setLoading(true); setError(null)
    const { error: insertError } = await supabase.from('courses').insert({
      title: values.title,
      type: values.type,
      batch_label: values.batchLabel,
      price_egp: values.priceEgp,
      prerequisite_course_id: values.prerequisiteCourseId || null,
      status: 'draft',
    })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    router.push('/admin/courses')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4 py-12">
      <h1 className="text-2xl font-semibold text-[#206682]">Create a course</h1>
      <Input label="Title" {...register('title')} error={errors.title?.message} />
      <div>
        <label className="text-sm text-gray-600 block mb-1">Type</label>
        <select {...register('type')} className="w-full border rounded-lg px-3 py-2">
          <option value="basics">Basics</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <Input label="Batch label" placeholder="EST2 Biology - Fall 2026" {...register('batchLabel')} error={errors.batchLabel?.message} />
      <Input label="Price (EGP)" type="number" {...register('priceEgp')} error={errors.priceEgp?.message} />
      <div>
        <label className="text-sm text-gray-600 block mb-1">Prerequisite course (optional)</label>
        <select {...register('prerequisiteCourseId')} className="w-full border rounded-lg px-3 py-2">
          <option value="">None</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating…' : 'Create course'}
      </Button>
    </form>
  )
}
