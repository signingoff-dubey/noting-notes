import { useState } from 'react'
import { Star, Trash2, Archive, ArchiveRestore, Pin, MoreHorizontal, GripVertical, Lock, Folder } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { useNotesStore } from '@/store/notesStore'
import { ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/store/uiStore'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/cn'

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

function TagChip({ tag }) {
  return <span className="ink-tag">{tag}</span>
}

export function NoteCard({ note, active, onClick, grid }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const updateNote  = useNotesStore(s => s.updateNote)
  const deleteNote  = useNotesStore(s => s.deleteNote)
  const archiveNote = useNotesStore(s => s.archiveNote)
  const folders     = useNotesStore(s => s.folders)
  const folderName  = note.folder_id ? folders.find(f => f.id === note.folder_id)?.name : null

  const preview = extractPreview(note.content)
  const timeAgo = note.updated_at
    ? formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })
    : ''

  const handleDelete = async () => {
    try { await deleteNote(note.id); toast.success('Note deleted') }
    catch { toast.error('Failed to delete note') }
    setConfirmDelete(false)
  }

  const handleStar = async (e) => {
    e?.stopPropagation()
    try { await updateNote(note.id, { starred: !note.starred }) }
    catch { toast.error('Failed to update note') }
  }

  const handlePin = async (e) => {
    e?.stopPropagation()
    try { await updateNote(note.id, { pinned: !note.pinned }) }
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
    { label: note.pinned ? 'Unpin' : 'Pin', icon: <Pin size={12} strokeWidth={1.5} />, onClick: handlePin },
    { label: note.starred ? 'Unstar' : 'Star', icon: <Star size={12} strokeWidth={1.5} />, onClick: handleStar },
    { label: note.archived ? 'Restore' : 'Archive', icon: note.archived ? <ArchiveRestore size={12} strokeWidth={1.5} /> : <Archive size={12} strokeWidth={1.5} />, onClick: handleArchive },
    { separator: true },
    { label: 'Delete', icon: <Trash2 size={12} strokeWidth={1.5} />, destructive: true, onClick: (e) => { e?.stopPropagation(); setConfirmDelete(true) } },
  ]

  // ── Grid / Card view ──
  if (grid) {
    return (
      <>
        <div
          onClick={onClick}
          className={cn(
            'ink-card group flex flex-col gap-3 cursor-pointer relative',
            active && 'ink-card-active',
          )}
          style={{ height: 200, overflow: 'hidden' }}
        >
          {/* Top: title + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {note.pinned && (
                <Pin size={10} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
              )}
              {note.is_vault && (
                <Lock size={10} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              )}
              <h3
                className="font-semibold leading-snug"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {note.title || 'Untitled'}
              </h3>
            </div>
            <div
              className="ink-card-actions flex items-center gap-1 shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="w-6 h-6 flex items-center justify-center rounded-md cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <GripVertical size={12} strokeWidth={1.5} />
              </div>
              <button
                onClick={handleStar}
                className={cn(
                  'w-6 h-6 flex items-center justify-center rounded-md transition-colors',
                  note.starred ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
                style={{ color: note.starred ? 'var(--color-warning)' : 'var(--color-text-muted)' }}
                title="Star"
              >
                <Star size={12} strokeWidth={1.5} fill={note.starred ? 'currentColor' : 'none'} />
              </button>
              <Dropdown
                align="right"
                trigger={
                  <button
                    className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <MoreHorizontal size={13} strokeWidth={1.5} />
                  </button>
                }
                items={menuItems}
              />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <p
              className="line-clamp-3"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {preview}
            </p>
          )}

          {/* Footer: folder + tags + time */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            <div className="flex flex-wrap gap-1 min-w-0 items-center">
              {folderName && (
                <span
                  className="inline-flex items-center gap-0.5 font-mono px-1.5 rounded"
                  style={{
                    fontSize: 10,
                    height: 18,
                    color: 'var(--color-accent)',
                    background: 'var(--color-accent-dim)',
                  }}
                >
                  <Folder size={9} strokeWidth={1.5} />
                  {folderName}
                </span>
              )}
              {(note.tags || []).slice(0, 3).map(tag => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
            <span
              className="shrink-0 font-mono"
              style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}
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
        className={cn(
          'ink-card group flex items-start gap-2 cursor-pointer',
          active && 'ink-card-active',
        )}
        style={{ borderRadius: 10, padding: '12px 14px' }}
      >
        {/* Drag handle */}
        <div
          className="shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={e => e.stopPropagation()}
        >
          <GripVertical size={13} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {note.pinned && (
                <Pin size={10} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
              )}
              {note.starred && (
                <Star size={10} strokeWidth={1.5} fill="currentColor" className="shrink-0" style={{ color: 'var(--color-warning)' }} />
              )}
              {note.is_vault && (
                <Lock size={10} strokeWidth={1.5} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              )}
              <h3
                className="font-semibold truncate"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {note.title || 'Untitled'}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                {timeAgo}
              </span>
              <div
                className="ink-card-actions"
                onClick={e => e.stopPropagation()}
              >
                <Dropdown
                  align="right"
                  trigger={
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-md"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <MoreHorizontal size={13} strokeWidth={1.5} />
                    </button>
                  }
                  items={menuItems}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <p
              className="line-clamp-2"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              {preview}
            </p>
          )}

          {/* Folder + Tags */}
          {(folderName || (note.tags || []).length > 0) && (
            <div className="flex flex-wrap gap-1 mt-0.5 items-center">
              {folderName && (
                <span
                  className="inline-flex items-center gap-0.5 font-mono px-1.5 rounded"
                  style={{
                    fontSize: 10,
                    height: 18,
                    color: 'var(--color-accent)',
                    background: 'var(--color-accent-dim)',
                  }}
                >
                  <Folder size={9} strokeWidth={1.5} />
                  {folderName}
                </span>
              )}
              {(note.tags || []).slice(0, 4).map(tag => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}
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
