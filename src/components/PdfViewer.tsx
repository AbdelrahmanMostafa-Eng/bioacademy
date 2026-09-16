'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PdfViewer({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.storage.from('lesson-pdfs').createSignedUrl(path, 60 * 30)
      .then(({ data }) => setUrl(data?.signedUrl ?? null))
  }, [path, supabase])

  if (!url) return <p className="text-sm text-gray-400">Loading document…</p>
  return <iframe src={url} className="w-full h-[80vh] rounded-lg border" title="Lesson document" />
}
