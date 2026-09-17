'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

type Post = { id: string; body: string; profiles: { full_name: string } }

export default function LessonQA({ lessonId }: { lessonId: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [draft, setDraft] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('lesson_qa').select('*, profiles(full_name)').eq('lesson_id', lessonId).eq('status', 'visible')
      .order('created_at').then(({ data }) => setPosts((data as any) ?? []))
  }, [lessonId, supabase])

  async function post() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !draft.trim()) return
    const { data } = await supabase.from('lesson_qa').insert({ lesson_id: lessonId, author_id: user.id, body: draft })
      .select('*, profiles(full_name)').single()
    if (data) setPosts((p) => [...p, data as any])
    setDraft('')
  }

  return (
    <div className="space-y-3 mt-8">
      <h3 className="font-medium text-[#206682]">Questions on this lesson</h3>
      {posts.map((p, i) => (
        <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border rounded-lg p-3 text-sm">
          <p className="font-medium text-gray-700">{p.profiles?.full_name}</p>
          <p className="text-gray-600">{p.body}</p>
        </motion.div>
      ))}
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask a question…" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
        <button onClick={post} className="px-4 py-2 rounded-lg bg-[#206682] text-white text-sm">Post</button>
      </div>
    </div>
  )
}
