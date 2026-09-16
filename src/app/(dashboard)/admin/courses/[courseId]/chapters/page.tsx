'use client'
import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

type Chapter = { id: string; title: string; order_index: number; status: 'draft' | 'published' }

function SortableChapter({ chapter, onTogglePublish }: {
  chapter: Chapter
  onTogglePublish: (id: string, next: 'draft' | 'published') => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 mb-2 cursor-grab">
      <span>{chapter.title}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onTogglePublish(chapter.id, chapter.status === 'published' ? 'draft' : 'published') }}
        className={`text-xs px-2 py-1 rounded ${chapter.status === 'published' ? 'bg-[#206682] text-white' : 'bg-gray-100 text-gray-500'}`}
      >
        {chapter.status === 'published' ? 'Published' : 'Draft'}
      </button>
    </div>
  )
}

// lessons use this exact same pattern one level down, nested under a chapter_id
export default function ChaptersPage({ params }: { params: { courseId: string } }) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const supabase = createClient()
  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    supabase.from('chapters').select('*').eq('course_id', params.courseId)
      .order('order_index').then(({ data }) => setChapters((data as Chapter[]) ?? []))
  }, [params.courseId, supabase])

  async function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setChapters((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)
      reordered.forEach((ch, i) => { supabase.from('chapters').update({ order_index: i }).eq('id', ch.id).then() })
      return reordered
    })
  }

  async function togglePublish(id: string, next: 'draft' | 'published') {
    await supabase.from('chapters').update({ status: next }).eq('id', id)
    setChapters((items) => items.map((c) => (c.id === id ? { ...c, status: next } : c)))
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-semibold text-[#206682] mb-6">Chapters</h1>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {chapters.map((chapter) => (
            <SortableChapter key={chapter.id} chapter={chapter} onTogglePublish={togglePublish} />
          ))}
        </SortableContext>
      </DndContext>
      <Button className="mt-4">Add chapter</Button>
    </div>
  )
}
