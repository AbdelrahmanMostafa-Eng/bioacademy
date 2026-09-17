'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import QuestionBuilder from '@/components/QuestionBuilder'

const homeworkSchema = z.object({
  title: z.string().min(3),
  deadline: z.string(),
  totalPoints: z.coerce.number().min(1),
})
type HomeworkForm = z.infer<typeof homeworkSchema>

// quizzes (step 21) use this exact same page, swapping lesson_id for chapter_id
// and type: 'homework' for type: 'quiz' - the form and QuestionBuilder are identical
export default function LessonHomeworkPage({ params }: { params: { lessonId: string } }) {
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors } } = useForm<HomeworkForm>({
    resolver: zodResolver(homeworkSchema),
  })

  useEffect(() => {
    supabase.from('assignments').select('id').eq('lesson_id', params.lessonId).eq('type', 'homework')
      .maybeSingle().then(({ data }) => { if (data) setAssignmentId(data.id) })
  }, [params.lessonId, supabase])

  async function onSubmit(values: HomeworkForm) {
    const { data } = await supabase.from('assignments').insert({
      lesson_id: params.lessonId,
      type: 'homework',
      title: values.title,
      deadline: new Date(values.deadline).toISOString(),
      total_points: values.totalPoints,
    }).select('id').single()
    if (data) setAssignmentId(data.id)
  }

  if (!assignmentId) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4 py-12">
        <h1 className="text-2xl font-semibold text-[#206682]">New homework</h1>
        <Input label="Title" {...register('title')} error={errors.title?.message} />
        <Input label="Deadline" type="datetime-local" {...register('deadline')} error={errors.deadline?.message} />
        <Input label="Total points" type="number" {...register('totalPoints')} error={errors.totalPoints?.message} />
        <Button type="submit" className="w-full">Create homework</Button>
      </form>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-4">
      <h1 className="text-2xl font-semibold text-[#206682]">Questions ({questionCount})</h1>
      <QuestionBuilder assignmentId={assignmentId} orderIndex={questionCount} onSaved={() => setQuestionCount((n) => n + 1)} />
    </div>
  )
}
