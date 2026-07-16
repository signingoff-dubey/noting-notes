import { useState, useEffect } from 'react'
import {
  FileText, CheckSquare, Calendar, Settings, Lock, Unlock,
  Star, Tag, Clock, Sparkles, BookOpen,
  LayoutDashboard, Archive, ChevronDown, ChevronRight, User, ChevronsLeft, ChevronsRight,
  LogIn, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'
import { useNotesStore } from '@/store/notesStore'
import { useAIStore } from '@/store/aiStore'
import { useVaultStore } from '@/store/vaultStore'
import { useAuthStore } from '@/store/authStore'
import { FolderTree } from './FolderTree'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/uiStore'

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn('ink-nav-item', active && 'active')}
    >
      <span className="shrink-0" style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && (
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function SectionLabel({ label, collapsible, collapsed, onToggle }) {
  return (
    <button
      onClick={collapsible ? onToggle : undefined}
      aria-expanded={collapsible ? !collapsed : undefined}
      className="flex items-center gap-1 w-full px-3 py-2 group"
      style={{ cursor: collapsible ? 'pointer' : 'default', background: 'none', border: 'none' }}
    >
      <span
        className="font-mono uppercase tracking-[0.1em] flex-1 text-left"
        style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      {collapsible && (
        <span style={{ color: 'var(--color-text-muted)' }}>
          {collapsed
            ? <ChevronRight size={11} strokeWidth={1.5} />
            : <ChevronDown size={11} strokeWidth={1.5} />
          }
        </span>
      )}
    </button>
  )
}

/* ── Vault modal: handles setup (first time) and unlock ── */
function VaultModal({ open, onClose, hasPIN }) {
  const { setup, unlock, clearError, error } = useVaultStore()
  const [step, setStep] = useState(hasPIN ? 'unlock' : 'setup') // 'setup' | 'confirm' | 'unlock'
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(hasPIN ? 'unlock' : 'setup')
      setPin('')
      setConfirmPin('')
      clearError()
    }
  }, [open, hasPIN])

  const handleSetup = async (e) => {
    e.preventDefault()
    if (pin.length < 4) { toast.error('PIN must be at least 4 characters'); return }
    if (pin !== confirmPin) { toast.error('PINs do not match'); return }
    setLoading(true)
    const ok = await setup(pin)
    setLoading(false)
    if (ok) {
      toast.success('Vault PIN set — now unlock it')
      setStep('unlock')
      setPin('')
      setConfirmPin('')
    }
  }

  const handleUnlock = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await unlock(pin)
    setLoading(false)
    if (ok) {
      onClose()
      toast.success('Vault unlocked')
    } else {
      toast.error('Incorrect PIN')
    }
  }

  if (!open) return null

  if (step === 'setup') {
    return (
      <Modal
        open
        onClose={onClose}
        title="Set Up Vault"
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSetup} loading={loading}>Set PIN</Button>
          </>
        }
      >
        <div className="mt-3 flex flex-col gap-4">
          <p className="font-mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Vault protects your private notes. Set a PIN to get started.
          </p>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Create PIN (min 4 characters)
            </label>
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••••"
              className="ink-search w-full"
              style={{ padding: '8px 12px' }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Confirm PIN
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSetup(e) }}
              placeholder="••••••"
              className="ink-search w-full"
              style={{ padding: '8px 12px' }}
            />
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Unlock Vault"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleUnlock} loading={loading}>Unlock</Button>
        </>
      }
    >
      <form onSubmit={handleUnlock} className="mt-3 flex flex-col gap-3">
        <label className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Enter your vault PIN
        </label>
        <input
          type="password"
          autoFocus
          value={pin}
          onChange={e => setPin(e.target.value)}
          placeholder="••••••"
          className="ink-search w-full"
          style={{ padding: '8px 12px' }}
        />
      </form>
    </Modal>
  )
}

export function Sidebar() {
  const activePanel = useUIStore(s => s.activePanel)
  const setActivePanel = useUIStore(s => s.setActivePanel)
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const userName = useUIStore(s => s.userName)
  const activeFolderId = useNotesStore(s => s.activeFolderId)
  const setActiveFolderId = useNotesStore(s => s.setActiveFolderId)
  const setActiveNote = useNotesStore(s => s.setActiveNote)
  const notes = useNotesStore(s => s.notes)
  const toggleAI = useAIStore(s => s.toggle)
  const { isUnlocked, hasPIN, lock, checkStatus } = useVaultStore()
  const { user, signIn, signOut: authSignOut } = useAuthStore()

  const [vaultModal, setVaultModal] = useState(false)
  const [libraryCollapsed, setLibraryCollapsed] = useState(false)
  const [foldersCollapsed, setFoldersCollapsed] = useState(false)

  const noteCount = notes.filter(n => !n.archived && n._source !== 'journal').length
  const displayName = userName || 'Guest'
  const greeting = `Welcome, ${displayName}`

  useEffect(() => { checkStatus() }, [checkStatus])

  const handleVaultToggle = async () => {
    if (isUnlocked) {
      await lock()
      toast.info('Vault locked')
    } else {
      setVaultModal(true)
    }
  }

  const handleFolderSelect = (folderId) => {
    setActiveFolderId(folderId === activeFolderId ? null : folderId)
    setActivePanel('notes')
    setActiveNote(null)
  }

  if (sidebarCollapsed) {
    return (
      <aside
        className="flex flex-col items-center pt-3 border-r shrink-0"
        style={{
          width: 36,
          background: 'var(--color-sidebar-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={toggleSidebar}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ChevronsRight size={13} strokeWidth={1.5} />
        </button>
      </aside>
    )
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
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.12em',
            }}
          >
            NOTING
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
          >
            notes
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleAI}
            title="Toggle AI Sidebar (Ctrl+Shift+A)"
            aria-label="Toggle AI sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Sparkles size={14} strokeWidth={1.5} />
          </button>
          <button
            onClick={toggleSidebar}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ChevronsLeft size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Welcome ── */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full shrink-0 object-cover"
            style={{ border: '1px solid var(--color-accent)44' }}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)44' }}
          >
            <User size={13} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className="font-medium truncate"
            style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.3 }}
          >
            {user ? `Welcome, ${user.displayName?.split(' ')[0] || 'User'}` : greeting}
          </span>
          <span
            className="font-mono truncate"
            style={{ fontSize: 10, color: 'var(--color-text-muted)' }}
          >
            {noteCount} note{noteCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-col gap-0.5 px-2 py-2 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <NavItem
          icon={<LayoutDashboard size={15} strokeWidth={1.5} />}
          label="Dashboard"
          active={activePanel === 'dashboard'}
          onClick={() => { setActivePanel('dashboard'); setActiveNote(null) }}
        />
        <NavItem
          icon={<FileText size={15} strokeWidth={1.5} />}
          label="Notes"
          active={activePanel === 'notes' && !activeFolderId}
          onClick={() => { setActivePanel('notes'); setActiveFolderId(null); setActiveNote(null) }}
          badge={noteCount || undefined}
        />
        <NavItem
          icon={<CheckSquare size={15} strokeWidth={1.5} />}
          label="Tasks"
          active={activePanel === 'tasks'}
          onClick={() => { setActivePanel('tasks'); setActiveNote(null) }}
        />
        <NavItem
          icon={<Calendar size={15} strokeWidth={1.5} />}
          label="Calendar"
          active={activePanel === 'calendar'}
          onClick={() => { setActivePanel('calendar'); setActiveNote(null) }}
        />
        <NavItem
          icon={<BookOpen size={15} strokeWidth={1.5} />}
          label="Journal"
          active={activePanel === 'journal'}
          onClick={() => { setActivePanel('journal'); setActiveNote(null) }}
        />
      </nav>

      {/* ── Library ── */}
      <div className="border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel
          label="Library"
          collapsible
          collapsed={libraryCollapsed}
          onToggle={() => setLibraryCollapsed(v => !v)}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateRows: libraryCollapsed ? '0fr' : '1fr',
            transition: 'grid-template-rows 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="flex flex-col gap-0.5 px-2 pb-2">
              <NavItem
                icon={<Star size={14} strokeWidth={1.5} />}
                label="Favourites"
                active={activePanel === 'favourites'}
                onClick={() => { setActivePanel('favourites'); setActiveNote(null) }}
              />
              <NavItem
                icon={<Clock size={14} strokeWidth={1.5} />}
                label="Recent"
                active={activePanel === 'recent'}
                onClick={() => { setActivePanel('recent'); setActiveFolderId(null); setActiveNote(null) }}
              />
              <NavItem
                icon={<Tag size={14} strokeWidth={1.5} />}
                label="All Tags"
                active={activePanel === 'tags'}
                onClick={() => { setActivePanel('tags'); setActiveNote(null) }}
              />
              <NavItem
                icon={<Archive size={14} strokeWidth={1.5} />}
                label="Archive"
                active={activePanel === 'archive'}
                onClick={() => { setActivePanel('archive'); setActiveNote(null) }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Folders ── */}
      <div className="flex flex-col flex-1 overflow-y-auto min-h-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <SectionLabel
          label="Folders"
          collapsible
          collapsed={foldersCollapsed}
          onToggle={() => setFoldersCollapsed(v => !v)}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateRows: foldersCollapsed ? '0fr' : '1fr',
            transition: 'grid-template-rows 200ms cubic-bezier(0.16, 1, 0.3, 1)',
            flex: foldersCollapsed ? 'none' : '1',
            minHeight: 0,
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="px-2 pb-2">
              <FolderTree onSelect={handleFolderSelect} activeId={activeFolderId} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: Upgrade + Auth + Vault + Settings ── */}
      <div className="flex flex-col gap-0.5 px-2 py-2 shrink-0">
        {/* Upgrade to Pro */}
        <button
          onClick={() => toast.info('Pro features coming soon')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-opacity hover:opacity-75"
          style={{
            background: 'var(--color-accent-dim)',
            border: '1px solid var(--color-accent)33',
          }}
        >
          <Sparkles size={13} strokeWidth={1.5} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.02em',
            }}
          >
            Upgrade to Pro
          </span>
        </button>

        {/* Sign in / Sign out */}
        <NavItem
          icon={user
            ? <LogOut size={14} strokeWidth={1.5} />
            : <LogIn size={14} strokeWidth={1.5} />
          }
          label={user ? 'Sign out' : 'Sign in / Sign up'}
          active={false}
          onClick={user ? authSignOut : signIn}
        />

        <NavItem
          icon={isUnlocked
            ? <Unlock size={14} strokeWidth={1.5} />
            : <Lock size={14} strokeWidth={1.5} />
          }
          label={isUnlocked ? 'Vault (open)' : hasPIN ? 'Vault' : 'Set up Vault'}
          active={activePanel === 'vault'}
          onClick={handleVaultToggle}
        />
        <NavItem
          icon={<Settings size={14} strokeWidth={1.5} />}
          label="Settings"
          active={activePanel === 'settings'}
          onClick={() => { setActivePanel('settings'); setActiveNote(null) }}
        />
      </div>

      <VaultModal
        open={vaultModal}
        onClose={() => setVaultModal(false)}
        hasPIN={hasPIN}
      />
    </aside>
  )
}
