'use client'
import { useState } from 'react'

export default function VideoUploader({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)

    const res = await fetch('/api/upload-video', { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)
    if (data.videoUrl) onUploaded(data.videoUrl)
  }

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFile} disabled={uploading} />
      {uploading && <p className="text-sm text-gray-500 mt-2">Uploading…</p>}
    </div>
  )
}
