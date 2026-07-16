import { useState } from 'react'
import {
  FileText, CheckSquare, Calendar, Settings, Lock, Unlock,
  Star, Tag, Clock, Sparkles, Zap,
  LayoutDashboard, Archive,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useVaultStore } from '@/store/vaultStore'
import { FolderTree } from './FolderTree'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/uiStore'

function NavItem({ icon, label, active, onClick, badge, dot }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 w-full h-[38px] px-4 transition-colors duration-[150ms] font-mono select-none',
        'text-[var(--text-xs)]',
        active
          ? 'bg-[var(--color-sidebar-item-active)] text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-item-hover)] hover:text-[var(--color-text-primary)]',
      )}
      style={{ fontSize: 'var(--text-xs)' }}
    >
      <span className="shrink-0 opacity-70">{icon}</span>
      <span className="flex-1 text-left tracking-wide uppercase">{label}</span>
      {badge && <span className="font-mono text-[var(--color-text-muted)]" style={{ fontSize: 'var(--text-xs)' }}>{badge}</span>}
      {dot && active && (
        <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--color-accent)' }} />
      )}
    </button>
  )
}

function SectionLabel({ label }) {
  return (
    <div className="px-4 pt-3 pb-1">
      <span
        className="font-mono uppercase tracking-[0.12em]"
        style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
    </div>
  )
}

export function Sidebar() {
  const activePanel = useUIStore(s => s.activePanel)
  const setActivePanel = useUIStore(s => s.setActivePanel)
  const createNote = useNotesStore(s => s.createNote)
  const activeFolderId = useNotesStore(s => s.activeFolderId)
  const setActiveFolderId = useNotesStore(s => s.setActiveFolderId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const toggleAI = useAIStore(s => s.toggle)
  const { isUnlocked, unlock, lock } = useVaultStore()
  const [vaultModal, setVaultModal] = useState(false)
  const [pin, setPin] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  const handleVaultToggle = async () => {
    if (isUnlocked) {
      await lock()
      toast.info('Vault locked')
    } else {
      setVaultModal(true)
    }
  }

  const handleUnlock = async (e) => {
    e.preventDefault()
    setUnlocking(true)
    const ok = await unlock(pin)
    setUnlocking(false)
    if (ok) {
      setVaultModal(false)
      setPin('')
      toast.success('Vault unlocked')
    } else {
      toast.error('Incorrect PIN')
    }
  }

  const handleFolderSelect = (folderId) => {
    setActiveFolderId(folderId === activeFolderId ? null : folderId)
    setActivePanel('notes')
    setActiveNote(null)
  }

  return (
    <aside
      className="flex flex-col h-full border-r shrink-0"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0 border-b"
        style={{ height: 56, borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col gap-0.5">
          <span
            className="tracking-[0.18em] leading-none"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            INK
          </span>
          <span
            className="tracking-[0.12em] uppercase leading-none"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            NOTES
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="font-mono border"
            style={{
              fontSize: 'var(--text-xs)',
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              padding: '2px 6px',
              borderRadius: 2,
            }}
          >
            v0.1
          </span>
          <button
            onClick={toggleAI}
            title="Toggle AI Sidebar (Ctrl+Shift+A)"
            aria-label="Toggle AI Sidebar"
            className="transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <Sparkles size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col border-b py-1 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <NavItem
          icon={<LayoutDashboard size={14} strokeWidth={1.5} />}
          label="Dashboard"
          active={activePanel === 'dashboard'}
          onClick={() => { setActivePanel('dashboard'); setActiveNote(null) }}
          dot
        />
        <NavItem
          icon={<FileText size={14} strokeWidth={1.5} />}
          label="Notes"
          active={activePanel === 'notes' && !activeFolderId}
          onClick={() => { setActivePanel('notes'); setActiveFolderId(null); setActiveNote(null) }}
          dot
        />
        <NavItem
          icon={<CheckSquare size={14} strokeWidth={1.5} />}
          label="Tasks"
          active={activePanel === 'tasks'}
          onClick={() => setActivePanel('tasks')}
          dot
        />
        <NavItem
          icon={<Calendar size={14} strokeWidth={1.5} />}
          label="Calendar"
          active={activePanel === 'calendar'}
          onClick={() => setActivePanel('calendar')}
          dot
        />
      </nav>

      {/* ── Library ── */}
      <div className="flex flex-col border-b py-1 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel label="Library" />
        <NavItem
          icon={<Star size={14} strokeWidth={1.5} />}
          label="Favourites"
          active={activePanel === 'favourites'}
          onClick={() => { setActivePanel('favourites'); setActiveNote(null) }}
          dot
        />
        <NavItem
          icon={<Clock size={14} strokeWidth={1.5} />}
          label="Recent"
          active={activePanel === 'recent'}
          onClick={() => { setActivePanel('recent'); setActiveFolderId(null); setActiveNote(null) }}
          dot
        />
        <NavItem
          icon={<Tag size={14} strokeWidth={1.5} />}
          label="All Tags"
          active={activePanel === 'tags'}
          onClick={() => { setActivePanel('tags'); setActiveNote(null) }}
          dot
        />
        <NavItem
          icon={<Archive size={14} strokeWidth={1.5} />}
          label="Archive"
          active={activePanel === 'archive'}
          onClick={() => setActivePanel('archive')}
          dot
        />
      </div>

      {/* ── Folders ── */}
      <div className="flex flex-col flex-1 overflow-y-auto py-1 border-b min-h-0" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel label="Folders" />
        <FolderTree onSelect={handleFolderSelect} activeId={activeFolderId} />
      </div>

      {/* ── Bottom ── */}
      <div className="flex flex-col py-1 shrink-0">
        <NavItem
          icon={isUnlocked ? <Unlock size={14} strokeWidth={1.5} /> : <Lock size={14} strokeWidth={1.5} />}
          label={isUnlocked ? 'Vault (open)' : 'Vault'}
          active={activePanel === 'vault'}
          onClick={handleVaultToggle}
          dot
        />
        <NavItem
          icon={<Settings size={14} strokeWidth={1.5} />}
          label="Settings"
          active={activePanel === 'settings'}
          onClick={() => setActivePanel('settings')}
          dot
        />
        {/* Upgrade to Pro */}
        <div className="px-3 pt-2 pb-3">
          <button
            className="flex items-center gap-2 w-full h-8 px-3 font-mono transition-all duration-[150ms]"
            style={{
              borderRadius: 2,
              border: '1px solid var(--color-accent)',
              background: 'var(--color-accent-dim)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-accent)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Zap size={12} strokeWidth={1.5} />
            Upgrade to Pro
          </button>
        </div>
      </div>

      {/* ── Vault unlock modal ── */}
      <Modal
        open={vaultModal}
        onClose={() => { setVaultModal(false); setPin('') }}
        title="Unlock Vault"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setVaultModal(false); setPin('') }}>Cancel</Button>
            <Button variant="primary" onClick={handleUnlock} loading={unlocking}>Unlock</Button>
          </>
        }
      >
        <form onSubmit={handleUnlock} className="mt-3">
          <label className="block font-mono text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Enter your vault PIN
          </label>
          <input
            type="password"
            autoFocus
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••••"
            className="w-full border font-mono text-sm outline-none transition-colors"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              borderRadius: 2,
              padding: '8px 12px',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
            }}
          />
        </form>
      </Modal>
    </aside>
  )
}
