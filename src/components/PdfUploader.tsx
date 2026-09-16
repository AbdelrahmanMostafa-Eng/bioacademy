'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PdfUploader({ folder, onUploaded }: { folder: string; onUploaded: (path: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `${folder}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('lesson-pdfs').upload(path, file)
    setUploading(false)
    if (!error) onUploaded(path)
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFile} disabled={uploading} />
      {uploading && <p className="text-sm text-gray-500 mt-2">Uploading…</p>}
    </div>
  )
}
