import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotesStore } from '@/store/notesStore'
import { useUIStore } from '@/store/uiStore'

const HOVER_DELAY = 400

function extractPreview(content, limit = 200) {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, limit)
  const texts = []
  const walk = (node) => {
    if (node.type === 'text') texts.push(node.text)
    if (node.content) node.content.forEach(walk)
  }
  walk(content)
  return texts.join(' ').slice(0, limit)
}

export function NoteLinkPreview({ editorContainer }) {
  const [preview, setPreview] = useState(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const timerRef = useRef(null)
  const activeRef = useRef(null)
  const cardRef = useRef(null)

  const notes = useNotesStore(s => s.notes)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const setActivePanel = useUIStore(s => s.setActivePanel)

  const showPreview = useCallback((noteId, rect) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    setPreview(note)
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    })
  }, [notes])

  const hidePreview = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    activeRef.current = null
    setPreview(null)
  }, [])

  useEffect(() => {
    const container = editorContainer?.current
    if (!container) return

    const handleMouseOver = (e) => {
      const el = e.target.closest?.('.ink-note-link')
      if (!el) return
      const noteId = el.getAttribute('data-note-link-id')
      if (!noteId) return

      if (activeRef.current === noteId) return
      if (timerRef.current) clearTimeout(timerRef.current)

      activeRef.current = noteId
      timerRef.current = setTimeout(() => {
        if (activeRef.current !== noteId) return
        const rect = el.getBoundingClientRect()
        showPreview(noteId, rect)
      }, HOVER_DELAY)
    }

    const handleMouseOut = (e) => {
      const el = e.target.closest?.('.ink-note-link')
      if (!el) {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = null
        activeRef.current = null
        setTimeout(() => {
          if (!cardRef.current?.matches(':hover')) {
            setPreview(null)
          }
        }, 100)
        return
      }
    }

    const handleClick = (e) => {
      const el = e.target.closest?.('.ink-note-link')
      if (!el) return
      const noteId = el.getAttribute('data-note-link-id')
      if (!noteId) return
      e.preventDefault()
      e.stopPropagation()
      setActivePanel('notes')
      setActiveNote(noteId)
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)
    container.addEventListener('click', handleClick, true)

    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
      container.removeEventListener('click', handleClick, true)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [editorContainer, showPreview, hidePreview, setActiveNote, setActivePanel])

  if (!preview) return null

  const previewText = extractPreview(preview.content)
  const timeAgo = preview.updated_at
    ? formatDistanceToNow(new Date(preview.updated_at), { addSuffix: true })
    : ''

  return (
    <div
      ref={cardRef}
      onMouseLeave={hidePreview}
      className="fixed z-[150] dropdown-in"
      style={{
        left: Math.min(pos.x - 160, window.innerWidth - 340),
        top: pos.y,
        width: 320,
      }}
    >
      <div
        className="flex flex-col gap-2 p-3 border shadow-2xl"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border-strong)',
          borderRadius: 10,
        }}
      >
        <div className="flex items-center gap-2">
          <FileText size={13} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span
            className="font-medium truncate flex-1"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--color-text-primary)',
            }}
          >
            {preview.title || 'Untitled'}
          </span>
        </div>

        {previewText && (
          <p
            className="font-mono line-clamp-3"
            style={{
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {previewText}
          </p>
        )}

        <div className="flex items-center gap-1.5 pt-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Clock size={10} strokeWidth={1.5} style={{ color: 'var(--color-text-muted)' }} />
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
            {timeAgo}
          </span>
          <span className="flex-1" />
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
            {preview.word_count || 0} words
          </span>
        </div>
      </div>
    </div>
  )
}
