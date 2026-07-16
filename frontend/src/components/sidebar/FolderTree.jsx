import { useState } from 'react'
import { Folder, FolderOpen, ChevronRight, Plus, Trash2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNotesStore } from '@/store/notesStore'
import { Dropdown } from '@/components/ui/Dropdown'
import { ConfirmModal } from '@/components/ui/Modal'
import { toast } from '@/store/uiStore'

function FolderItem({ folder, depth = 0, onSelect, activeId }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const deleteFolder = useNotesStore(s => s.deleteFolder)
  const children = useNotesStore(s => s.folders.filter(f => f.parent_id === folder.id))
  const noteCount = useNotesStore(s => s.notes.filter(n => n.folder_id === folder.id).length)
  const isActive = activeId === folder.id

  const handleDelete = async () => {
    try {
      await deleteFolder(folder.id)
      toast.success('Folder deleted')
    } catch {
      toast.error('Failed to delete folder')
    }
    setDeleting(false)
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-1 h-8 cursor-pointer select-none transition-colors',
          'hover:bg-sidebar-hover',
          isActive && 'bg-sidebar-active',
        )}
        style={{ paddingLeft: `${12 + depth * 12}px`, paddingRight: '8px' }}
        onClick={() => onSelect(folder.id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(o => !o) }}
          className={cn(
            'shrink-0 text-text-muted transition-transform duration-100',
            children.length === 0 && 'opacity-0 pointer-events-none',
            expanded && 'rotate-90',
          )}
        >
          <ChevronRight size={10} strokeWidth={1.5} />
        </button>
        {expanded
          ? <FolderOpen size={14} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
          : <Folder size={14} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
        }
        <span className={cn(
          'flex-1 truncate font-mono text-sm',
          isActive ? 'text-text-primary' : 'text-text-secondary',
        )}>
          {folder.name}
        </span>
        <span className="font-mono text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          {noteCount || ''}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Dropdown
            align="right"
            trigger={
              <button className="p-0.5 text-text-muted hover:text-text-secondary rounded-sm">
                <MoreHorizontal size={12} strokeWidth={1.5} />
              </button>
            }
            items={[
              { label: 'Delete folder', icon: <Trash2 size={12} strokeWidth={1.5} />, destructive: true, onClick: () => setDeleting(true) },
            ]}
          />
        </div>
      </div>
      {expanded && children.map(child => (
        <FolderItem key={child.id} folder={child} depth={depth + 1} onSelect={onSelect} activeId={activeId} />
      ))}
      <ConfirmModal
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title="Delete folder"
        message={`Delete "${folder.name}"? Notes inside will be moved to root.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  )
}

export function FolderTree({ onSelect, activeId }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const createFolder = useNotesStore(s => s.createFolder)
  const rootFolders = useNotesStore(s => s.folders.filter(f => !f.parent_id))

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const folder = await createFolder(newName.trim())
      toast.success('Folder created')
      setNewName('')
      setCreating(false)
      onSelect(folder.id)
    } catch {
      toast.error('Failed to create folder')
    }
  }

  return (
    <div className="flex flex-col">
      {rootFolders.map(folder => (
        <FolderItem key={folder.id} folder={folder} onSelect={onSelect} activeId={activeId} />
      ))}
      {creating ? (
        <form onSubmit={handleCreate} className="flex items-center gap-1 px-3 py-1">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={() => { if (!newName.trim()) setCreating(false) }}
            onKeyDown={e => { if (e.key === 'Escape') setCreating(false) }}
            placeholder="Folder name"
            className="flex-1 bg-surface-2 border border-border rounded-sm px-2 py-0.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
          />
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 h-7 px-3 text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
        >
          <Plus size={11} strokeWidth={1.5} />
          New folder
        </button>
      )}
    </div>
  )
}
