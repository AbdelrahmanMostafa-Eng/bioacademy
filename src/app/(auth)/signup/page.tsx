'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  whatsappNumber: z.string().min(8, 'Enter a valid WhatsApp number'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match", path: ['confirmPassword'],
})
type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupForm) {
    setLoading(true); setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email, password: values.password,
    })
    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Something went wrong. Please try again.')
      setLoading(false); return
    }
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id, full_name: values.fullName,
      whatsapp_number: values.whatsappNumber, role: 'student',
    })
    if (profileError) {
      setError('Account created, but we could not save your details.')
      setLoading(false); return
    }
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4 py-16">
      <h1 className="text-2xl font-semibold text-[#206682]">Create your Bioacademy account</h1>
      <Input label="Full name" {...register('fullName')} error={errors.fullName?.message} />
      <Input label="WhatsApp number" {...register('whatsappNumber')} error={errors.whatsappNumber?.message} />
      <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
      <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
      <Input label="Confirm password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
