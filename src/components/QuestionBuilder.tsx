'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const questionSchema = z.object({
  questionText: z.string().min(3, 'Enter the question'),
  optionA: z.string().min(1, 'Enter option A'),
  optionB: z.string().min(1, 'Enter option B'),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctOption: z.enum(['a', 'b', 'c', 'd']),
})
type QuestionForm = z.infer<typeof questionSchema>

export default function QuestionBuilder({ assignmentId, orderIndex, onSaved }: {
  assignmentId: string
  orderIndex: number
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
  })

  async function onSubmit(values: QuestionForm) {
    setLoading(true)
    await supabase.from('questions').insert({
      assignment_id: assignmentId,
      question_text: values.questionText,
      option_a: values.optionA,
      option_b: values.optionB,
      option_c: values.optionC || null,
      option_d: values.optionD || null,
      correct_option: values.correctOption,
      order_index: orderIndex,
    })
    setLoading(false)
    reset()
    onSaved()
  }

  return (
    <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-3 border rounded-lg p-4 bg-white">
      <Input label="Question" {...register('questionText')} error={errors.questionText?.message} />
      {(['a', 'b', 'c', 'd'] as const).map((opt) => (
        <div key={opt} className="flex items-center gap-2">
          <input type="radio" value={opt} {...register('correctOption')} className="accent-[#206682]" />
          <Input label={`Option ${opt.toUpperCase()}`}
            {...register(opt === 'a' ? 'optionA' : opt === 'b' ? 'optionB' : opt === 'c' ? 'optionC' : 'optionD')} />
        </div>
      ))}
      {errors.correctOption && <p className="text-sm text-red-600">Mark which option is correct</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Add question'}</Button>
    </motion.form>
  )
}
