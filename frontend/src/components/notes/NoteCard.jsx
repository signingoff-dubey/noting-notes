import { Pin, Star, MoreHorizontal, Trash2, Archive, ArchiveRestore } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { useNotesStore } from '@/store/notesStore'
import { ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/store/uiStore'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useRipple } from '@/lib/useRipple'

function extractPreview(content) {
  if (!content) return ''
  if (typeof content === 'string') return content.slice(0, 200)
  if (content.content) {
    const texts = []
    const walk = (node) => {
      if (node.type === 'text') texts.push(node.text)
      if (node.content) node.content.forEach(walk)
    }
    walk(content)
    return texts.join(' ').slice(0, 200)
  }
  return ''
}

function TagPill({ tag }) {
  return (
    <span
      className="font-mono border"
      style={{
        height: 18,
        padding: '0 6px',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 2,
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        background: 'var(--color-surface-2)',
        borderColor: 'var(--color-border)',
      }}
    >
      {tag}
    </span>
  )
}

export function NoteCard({ note, active, onClick, grid }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateNote  = useNotesStore(s => s.updateNote)
  const deleteNote  = useNotesStore(s => s.deleteNote)
  const archiveNote = useNotesStore(s => s.archiveNote)
  const ripple = useRipple()

  const preview = extractPreview(note.content)
  const timeAgo = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : ''

  const handleDelete = async () => {
    try { await deleteNote(note.id); toast.success('Note deleted') }
    catch { toast.error('Failed to delete note') }
    setConfirmDelete(false)
  }

  const handlePin = async (e) => {
    e.stopPropagation()
    await updateNote(note.id, { pinned: !note.pinned })
  }

  const handleStar = async (e) => {
    e?.stopPropagation()
    try { await updateNote(note.id, { starred: !note.starred }) }
    catch { toast.error('Failed to update note') }
  }

  const handleArchive = async (e) => {
    e?.stopPropagation()
    try {
      await archiveNote(note.id, !note.archived)
      toast.success(note.archived ? 'Note restored' : 'Note archived')
    } catch { toast.error('Failed to archive note') }
  }

  const menuItems = [
    { label: note.pinned ? 'Unpin' : 'Pin',       icon: <Pin     size={12} strokeWidth={1.5} />, onClick: handlePin },
    { label: note.starred ? 'Unstar' : 'Star',    icon: <Star    size={12} strokeWidth={1.5} />, onClick: (e) => handleStar(e) },
    { label: note.archived ? 'Restore' : 'Archive', icon: note.archived ? <ArchiveRestore size={12} strokeWidth={1.5} /> : <Archive size={12} strokeWidth={1.5} />, onClick: (e) => handleArchive(e) },
    { separator: true },
    { label: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, destructive: true, onClick: (e) => { e?.stopPropagation(); setConfirmDelete(true) } },
  ]

  if (grid) {
    return (
      <>
        <div
          onClick={onClick}
          {...ripple}
          onMouseDown={(e) => { ripple.onMouseDown(e) }}
          className={`${ripple.className} group flex flex-col gap-2 p-4 border cursor-pointer transition-all duration-[150ms]`}
          style={{
            background: active ? 'var(--color-surface-2)' : 'var(--color-surface)',
            borderColor: active ? 'var(--color-border-strong)' : 'var(--color-border)',
            borderRadius: 2,
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--color-border-strong)' }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--color-border)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-body font-medium truncate"
              style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}
            >
              {note.title || 'Untitled'}
            </h3>
            <div
              className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => e.stopPropagation()}
            >
              {note.starred && <Star size={10} strokeWidth={1.5} fill="currentColor" style={{ color: 'var(--color-warning)' }} />}
              {note.pinned && <Pin size={10} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />}
              <Dropdown align="right" trigger={
                <button style={{ color: 'var(--color-text-muted)' }}>
                  <MoreHorizontal size={13} strokeWidth={1.5} />
                </button>
              } items={menuItems} />
            </div>
          </div>

          {preview && (
            <p
              className="font-body line-clamp-3"
              style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
            >
              {preview}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto pt-1 gap-2">
            <div className="flex flex-wrap gap-1">
              {(note.tags || []).slice(0, 3).map(tag => <TagPill key={tag} tag={tag} />)}
            </div>
            <span
              className="font-mono shrink-0"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            >
              {timeAgo}
            </span>
          </div>
        </div>

        <ConfirmModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Delete note"
          message={`Delete "${note.title || 'Untitled'}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="destructive"
        />
      </>
    )
  }

  // ── List view ──
  return (
    <>
      <div
        onClick={onClick}
        {...ripple}
        onMouseDown={(e) => { ripple.onMouseDown(e) }}
        className={`${ripple.className} group flex flex-col gap-1 px-4 border-b cursor-pointer transition-colors duration-[150ms]`}
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          borderBottomColor: 'var(--color-border)',
          background: active ? 'var(--color-surface-active)' : 'transparent',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-surface)' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'var(--color-surface-active)' : 'transparent' }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {note.pinned && (
              <Pin size={10} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
            )}
            {note.starred && (
              <Star size={10} strokeWidth={1.5} fill="currentColor" className="shrink-0" style={{ color: 'var(--color-warning)' }} />
            )}
            <h3
              className="font-body font-medium truncate"
              style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}
            >
              {note.title || 'Untitled'}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-mono"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
            >
              {timeAgo}
            </span>
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => e.stopPropagation()}
            >
              <Dropdown align="right" trigger={
                <button style={{ color: 'var(--color-text-muted)' }}>
                  <MoreHorizontal size={13} strokeWidth={1.5} />
                </button>
              } items={menuItems} />
            </div>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <p
            className="font-body line-clamp-2"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
          >
            {preview}
          </p>
        )}

        {/* Tags */}
        {(note.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {(note.tags || []).slice(0, 4).map(tag => <TagPill key={tag} tag={tag} />)}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete note"
        message={`Delete "${note.title || 'Untitled'}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  )
}
