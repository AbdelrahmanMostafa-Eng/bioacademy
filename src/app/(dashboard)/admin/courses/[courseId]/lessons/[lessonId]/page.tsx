import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PdfViewer from '@/components/PdfViewer'

export default async function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('payment_status')
    .eq('student_id', user.id)
    .eq('course_id', params.courseId)
    .single()

  // redundant with RLS on purpose - RLS blocks the query, this gives a clean redirect instead of a broken page
  if (!enrollment || enrollment.payment_status !== 'paid') {
    redirect(`/courses/${params.courseId}`)
  }

  const { data: lesson } = await supabase.from('lessons').select('*').eq('id', params.lessonId).single()
  if (!lesson) redirect(`/dashboard/courses/${params.courseId}`)

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-semibold text-[#206682] mb-6">{lesson.title}</h1>
      {lesson.video_url && (
        <div className="aspect-video mb-8 rounded-xl overflow-hidden">
          <iframe src={lesson.video_url} className="w-full h-full" allowFullScreen title={lesson.title} />
        </div>
      )}
      {lesson.pdf_url && <PdfViewer path={lesson.pdf_url} />}
    </div>
  )
}
